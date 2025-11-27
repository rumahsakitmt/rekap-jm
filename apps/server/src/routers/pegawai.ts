import { router } from "../lib/trpc";
import { publicProcedure } from "../lib/trpc";
import { db } from "../db";
import { and, asc, ilike, ne, SQL } from "drizzle-orm";
import { pegawai } from "@/db/schema";

export const pegawaiRouter = router({
  getPegawai: publicProcedure.query(async ({ input }) => {

    return await db
      .select()
      .from(pegawai)
      .where(
        ne(pegawai.stts_aktif, "KELUAR")
      )
      .orderBy(asc(pegawai.nama))
      ;
  }),
});
