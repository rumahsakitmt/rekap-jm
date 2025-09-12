import { publicProcedure, router } from "@/lib/trpc";

export const rawatInapRouter = router({
  getRawatInap: publicProcedure.query(async () => {
    return 0;
  }),
});
