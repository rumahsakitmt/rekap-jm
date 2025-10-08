import { db } from "@/db";
import { jns_perawatan } from "@/db/schema";
import { publicProcedure, router } from "@/lib/trpc";

export const tarifRouter = router({
  getTarifRawatJalan: publicProcedure.query(async () => {
    const rj = db.select().from(jns_perawatan).limit(100);
    return rj;
  }),
});
