import { publicProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { bridgingSepRouter } from "./bridging-sep";
import { rawatJalanRouter } from "./rawat-jalan";
import { csvUploadRouter } from "./csv-upload";
import { dokterRouter } from "./dokter";
import { poliklinikRouter } from "./poliklinik";
import { rawatInapRouter } from "./rawat-inap";
import { kamarRouter } from "./kamar";
import { tarifRouter } from "./tarif";
import { stockRouter } from "./stock";
import { obatRouter } from "./obat";
import { bangsalRouter } from "./bangsal";
import { igdRouter } from "./igd";
import { triaseRouter } from "./triase";
import { pegawaiRouter } from "./pegawai";
import { klaimRouter } from "./klaim";

export const appRouter = router({
  healthCheck: publicProcedure.query(async () => {
    try {
      await db.execute(sql`SELECT 1`);
      const result = await db.execute(sql`SELECT VERSION() as version`);
      return {
        status: "OK",
        database: "connected",
        version: result,
      };
    } catch (error) {
      return {
        status: "ERROR",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }),
  bridgingSep: bridgingSepRouter,
  rawatJalan: rawatJalanRouter,
  rawatInap: rawatInapRouter,
  csvUpload: csvUploadRouter,
  dokter: dokterRouter,
  poliklinik: poliklinikRouter,
  kamar: kamarRouter,
  tarif: tarifRouter,
  stock: stockRouter,
  obat: obatRouter,
  bangsal: bangsalRouter,
  igd: igdRouter,
  triase: triaseRouter,
  pegawai: pegawaiRouter,
  klaim: klaimRouter,
});
export type AppRouter = typeof appRouter;
