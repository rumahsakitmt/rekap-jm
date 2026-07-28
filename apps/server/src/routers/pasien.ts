import { asc, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "../db";
import { pasien } from "../db/schema";
import { publicProcedure, router } from "../lib/trpc";

const dashedMedicalRecordNumber = sql`${pasien.no_rkm_medis} LIKE ${"%-%"}`;

type RelatedMedicalRecordColumn = {
  tableName: string;
  columnName: string;
};

function quoteIdentifier(identifier: string) {
  return `\`${identifier.replaceAll("`", "``")}\``;
}

export const pasienRouter = router({
  getDashedMedicalRecordNumbers: publicProcedure.query(async () => {
    return db
      .select({
        noRkmMedis: pasien.no_rkm_medis,
        namaPasien: pasien.nm_pasien,
        jenisKelamin: pasien.jk,
        tanggalDaftar: pasien.tgl_daftar,
      })
      .from(pasien)
      .where(dashedMedicalRecordNumber)
      .orderBy(asc(pasien.no_rkm_medis));
  }),

  normalizeDashedMedicalRecordNumber: publicProcedure
    .input(z.object({ noRkmMedis: z.string().min(1).max(15) }))
    .mutation(async ({ input }) => {
    return db.transaction(async (tx) => {
      const nextNoRkmMedis = input.noRkmMedis.replaceAll("-", "");
      const [patient] = await tx
        .select({ noRkmMedis: pasien.no_rkm_medis })
        .from(pasien)
        .where(eq(pasien.no_rkm_medis, input.noRkmMedis));

      if (!patient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${input.noRkmMedis} tidak lagi ditemukan. Muat ulang data sebelum mencoba lagi.`,
        });
      }

      const [existingPatient] = await tx
        .select({ noRkmMedis: pasien.no_rkm_medis })
        .from(pasien)
        .where(eq(pasien.no_rkm_medis, nextNoRkmMedis));

      if (existingPatient) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `${nextNoRkmMedis} sudah digunakan oleh pasien lain.`,
        });
      }

      try {
        const [foreignKeyRows] = await tx.execute(sql`
          SELECT
            TABLE_NAME AS tableName,
            COLUMN_NAME AS columnName
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
          WHERE TABLE_SCHEMA = DATABASE()
            AND REFERENCED_TABLE_NAME = 'pasien'
            AND REFERENCED_COLUMN_NAME = 'no_rkm_medis'
          ORDER BY TABLE_NAME, COLUMN_NAME
        `);
        const relatedColumns = foreignKeyRows as RelatedMedicalRecordColumn[];

        // MySQL's restrictive foreign keys prevent updating the parent key before
        // its children. Disable the checks only for this transaction, update every
        // confirmed child reference, then restore checks before committing.
        await tx.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
        try {
          for (const { tableName, columnName } of relatedColumns) {
            const table = sql.raw(quoteIdentifier(tableName));
            const column = sql.raw(quoteIdentifier(columnName));

            await tx.execute(sql`
              UPDATE ${table}
              SET ${column} = ${nextNoRkmMedis}
              WHERE ${column} = ${input.noRkmMedis}
            `);
          }

          await tx
            .update(pasien)
            .set({ no_rkm_medis: nextNoRkmMedis })
            .where(eq(pasien.no_rkm_medis, input.noRkmMedis));
        } finally {
          await tx.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
        }
      } catch (error) {
        const cause =
          error && typeof error === "object" && "cause" in error
            ? error.cause
            : undefined;
        const databaseMessage = [error, cause]
          .filter((value): value is Error => value instanceof Error)
          .map((value) => value.message.toLowerCase())
          .join(" ");
        const isForeignKeyConstraint =
          databaseMessage.includes("foreign key") ||
          databaseMessage.includes("row is referenced");

        throw new TRPCError({
          code: "CONFLICT",
          message: isForeignKeyConstraint
            ? "Nomor RM ini dipakai oleh data pelayanan atau kunjungan, sehingga database tidak mengizinkan perubahan. Tidak ada data yang diubah."
            : "Database menolak perubahan nomor RM ini. Tidak ada data yang diubah.",
          cause: error,
        });
      }

      return { from: input.noRkmMedis, to: nextNoRkmMedis };
    });
  }),
});
