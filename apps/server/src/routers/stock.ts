import { z } from "zod";
import { publicProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { databarang, gudangbarang, bangsal } from "../db/schema";
import { sql, eq, and, gte, lte, desc, asc, sum, count } from "drizzle-orm";

export const stockRouter = router({
  // Get stock overview with low stock alerts
  getStockOverview: publicProcedure.query(async () => {
    const stockOverview = await db
      .select({
        kode_brng: databarang.kode_brng,
        nama_brng: databarang.nama_brng,
        totalStok: sum(gudangbarang.stok),
        stokMinimal: databarang.stokminimal,
        status: databarang.status,
        kode_sat: databarang.kode_sat,
        h_beli: databarang.h_beli,
        ralan: databarang.ralan,
        kelas1: databarang.kelas1,
        kelas2: databarang.kelas2,
        kelas3: databarang.kelas3,
        utama: databarang.utama,
        vip: databarang.vip,
        vvip: databarang.vvip,
      })
      .from(databarang)
      .leftJoin(gudangbarang, eq(databarang.kode_brng, gudangbarang.kode_brng))
      .where(eq(databarang.status, "1"))
      .groupBy(databarang.kode_brng)
      .orderBy(asc(databarang.nama_brng));

    return stockOverview;
  }),

  // Get low stock items
  getLowStockItems: publicProcedure.query(async () => {
    const lowStockItems = await db
      .select({
        kode_brng: databarang.kode_brng,
        nama_brng: databarang.nama_brng,
        totalStok: sum(gudangbarang.stok),
        stokMinimal: databarang.stokminimal,
        kode_sat: databarang.kode_sat,
        h_beli: databarang.h_beli,
        deficit: sql<number>`COALESCE(SUM(${gudangbarang.stok}), 0) - ${databarang.stokminimal}`,
      })
      .from(databarang)
      .leftJoin(gudangbarang, eq(databarang.kode_brng, gudangbarang.kode_brng))
      .where(eq(databarang.status, "1"))
      .groupBy(databarang.kode_brng)
      .having(
        sql`COALESCE(SUM(${gudangbarang.stok}), 0) <= ${databarang.stokminimal}`
      )
      .orderBy(
        asc(
          sql`COALESCE(SUM(${gudangbarang.stok}), 0) - ${databarang.stokminimal}`
        )
      );

    return lowStockItems;
  }),

  // Get stock by warehouse (bangsal)
  getStockByWarehouse: publicProcedure.query(async () => {
    const stockByWarehouse = await db
      .select({
        kd_bangsal: gudangbarang.kd_bangsal,
        nm_bangsal: bangsal.nm_bangsal,
        totalItems: count(gudangbarang.kode_brng),
        totalStok: sum(gudangbarang.stok),
        totalValue: sum(sql`${gudangbarang.stok} * ${databarang.h_beli}`),
      })
      .from(gudangbarang)
      .leftJoin(bangsal, eq(gudangbarang.kd_bangsal, bangsal.kd_bangsal))
      .leftJoin(databarang, eq(gudangbarang.kode_brng, databarang.kode_brng))
      .groupBy(gudangbarang.kd_bangsal, bangsal.nm_bangsal)
      .orderBy(desc(sum(gudangbarang.stok)));

    return stockByWarehouse;
  }),

  // Get stock distribution by item category
  getStockByCategory: publicProcedure.query(async () => {
    const stockByCategory = await db
      .select({
        kode_golongan: databarang.kode_golongan,
        kode_kategori: databarang.kode_kategori,
        kode_industri: databarang.kode_industri,
        totalItems: count(databarang.kode_brng),
        totalStok: sum(gudangbarang.stok),
        totalValue: sum(sql`${gudangbarang.stok} * ${databarang.h_beli}`),
      })
      .from(databarang)
      .leftJoin(gudangbarang, eq(databarang.kode_brng, gudangbarang.kode_brng))
      .where(eq(databarang.status, "1"))
      .groupBy(
        databarang.kode_golongan,
        databarang.kode_kategori,
        databarang.kode_industri
      )
      .orderBy(desc(sum(gudangbarang.stok)));

    return stockByCategory;
  }),

  // Get top 10 items by stock value
  getTopItemsByValue: publicProcedure.query(async () => {
    const topItemsByValue = await db
      .select({
        kode_brng: databarang.kode_brng,
        nama_brng: databarang.nama_brng,
        totalStok: sum(gudangbarang.stok),
        h_beli: databarang.h_beli,
        totalValue: sum(sql`${gudangbarang.stok} * ${databarang.h_beli}`),
        kode_sat: databarang.kode_sat,
      })
      .from(databarang)
      .leftJoin(gudangbarang, eq(databarang.kode_brng, gudangbarang.kode_brng))
      .where(eq(databarang.status, "1"))
      .groupBy(databarang.kode_brng)
      .orderBy(desc(sum(sql`${gudangbarang.stok} * ${databarang.h_beli}`)))
      .limit(10);

    return topItemsByValue;
  }),

  // Get stock details for specific item
  getItemStockDetails: publicProcedure
    .input(z.object({ kode_brng: z.string() }))
    .query(async ({ input }) => {
      const itemDetails = await db
        .select({
          kode_brng: databarang.kode_brng,
          nama_brng: databarang.nama_brng,
          kode_sat: databarang.kode_sat,
          stokMinimal: databarang.stokminimal,
          h_beli: databarang.h_beli,
          ralan: databarang.ralan,
          kelas1: databarang.kelas1,
          kelas2: databarang.kelas2,
          kelas3: databarang.kelas3,
          utama: databarang.utama,
          vip: databarang.vip,
          vvip: databarang.vvip,
          jualbebas: databarang.jualbebas,
          karyawan: databarang.karyawan,
          status: databarang.status,
        })
        .from(databarang)
        .where(eq(databarang.kode_brng, input.kode_brng))
        .limit(1);

      const stockDetails = await db
        .select({
          kd_bangsal: gudangbarang.kd_bangsal,
          nm_bangsal: bangsal.nm_bangsal,
          stok: gudangbarang.stok,
          no_batch: gudangbarang.no_batch,
          no_faktur: gudangbarang.no_faktur,
        })
        .from(gudangbarang)
        .leftJoin(bangsal, eq(gudangbarang.kd_bangsal, bangsal.kd_bangsal))
        .where(eq(gudangbarang.kode_brng, input.kode_brng));

      return {
        item: itemDetails[0],
        stockDetails,
      };
    }),

  // Get stock summary statistics
  getStockSummary: publicProcedure.query(async () => {
    // Get basic counts and totals
    const basicSummary = await db
      .select({
        totalItems: count(databarang.kode_brng),
        totalStok: sum(gudangbarang.stok),
        totalValue: sum(sql`${gudangbarang.stok} * ${databarang.h_beli}`),
      })
      .from(databarang)
      .leftJoin(gudangbarang, eq(databarang.kode_brng, gudangbarang.kode_brng))
      .where(eq(databarang.status, "1"));

    // Get low stock count using a subquery
    const lowStockResult = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(
        db
          .select({
            kode_brng: databarang.kode_brng,
            totalStok: sum(gudangbarang.stok),
            stokMinimal: databarang.stokminimal,
          })
          .from(databarang)
          .leftJoin(
            gudangbarang,
            eq(databarang.kode_brng, gudangbarang.kode_brng)
          )
          .where(eq(databarang.status, "1"))
          .groupBy(databarang.kode_brng)
          .having(
            sql`COALESCE(SUM(${gudangbarang.stok}), 0) <= ${databarang.stokminimal}`
          )
          .as("lowStockItems")
      );

    // Get out of stock count using a subquery
    const outOfStockResult = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(
        db
          .select({
            kode_brng: databarang.kode_brng,
            totalStok: sum(gudangbarang.stok),
          })
          .from(databarang)
          .leftJoin(
            gudangbarang,
            eq(databarang.kode_brng, gudangbarang.kode_brng)
          )
          .where(eq(databarang.status, "1"))
          .groupBy(databarang.kode_brng)
          .having(sql`COALESCE(SUM(${gudangbarang.stok}), 0) = 0`)
          .as("outOfStockItems")
      );

    const summary = basicSummary[0];
    return {
      ...summary,
      lowStockCount: lowStockResult[0]?.count || 0,
      outOfStockCount: outOfStockResult[0]?.count || 0,
    };
  }),

  // Get stock by batch (for expiry tracking)
  getStockByBatch: publicProcedure.query(async () => {
    const stockByBatch = await db
      .select({
        kode_brng: gudangbarang.kode_brng,
        nama_brng: databarang.nama_brng,
        no_batch: gudangbarang.no_batch,
        no_faktur: gudangbarang.no_faktur,
        stok: gudangbarang.stok,
        kd_bangsal: gudangbarang.kd_bangsal,
        nm_bangsal: bangsal.nm_bangsal,
        expire: databarang.expire,
        h_beli: databarang.h_beli,
      })
      .from(gudangbarang)
      .leftJoin(databarang, eq(gudangbarang.kode_brng, databarang.kode_brng))
      .leftJoin(bangsal, eq(gudangbarang.kd_bangsal, bangsal.kd_bangsal))
      .where(eq(databarang.status, "1"))
      .orderBy(asc(databarang.expire));

    return stockByBatch;
  }),

  // Get inventory turnover analysis
  getInventoryTurnover: publicProcedure.query(async () => {
    const turnoverData = await db
      .select({
        kode_brng: databarang.kode_brng,
        nama_brng: databarang.nama_brng,
        totalStok: sum(gudangbarang.stok),
        totalValue: sum(sql`${gudangbarang.stok} * ${databarang.h_beli}`),
        h_beli: databarang.h_beli,
        kode_sat: databarang.kode_sat,
        // Calculate turnover ratio (simplified - would need historical data for accurate calculation)
        turnoverRatio: sql<number>`CASE 
          WHEN ${databarang.stokminimal} > 0 
          THEN COALESCE(SUM(${gudangbarang.stok}), 0) / ${databarang.stokminimal}
          ELSE 0 
        END`,
      })
      .from(databarang)
      .leftJoin(gudangbarang, eq(databarang.kode_brng, gudangbarang.kode_brng))
      .where(eq(databarang.status, "1"))
      .groupBy(databarang.kode_brng)
      .orderBy(desc(sum(sql`${gudangbarang.stok} * ${databarang.h_beli}`)));

    return turnoverData;
  }),

  // Get ABC analysis
  getABCAnalysis: publicProcedure.query(async () => {
    const abcData = await db
      .select({
        kode_brng: databarang.kode_brng,
        nama_brng: databarang.nama_brng,
        totalStok: sum(gudangbarang.stok),
        totalValue: sum(sql`${gudangbarang.stok} * ${databarang.h_beli}`),
        h_beli: databarang.h_beli,
        kode_sat: databarang.kode_sat,
        kode_kategori: databarang.kode_kategori,
      })
      .from(databarang)
      .leftJoin(gudangbarang, eq(databarang.kode_brng, gudangbarang.kode_brng))
      .where(eq(databarang.status, "1"))
      .groupBy(databarang.kode_brng)
      .orderBy(desc(sum(sql`${gudangbarang.stok} * ${databarang.h_beli}`)));

    // Calculate cumulative percentage and classify as A, B, or C
    const totalValue = abcData.reduce(
      (sum, item) => sum + (Number(item.totalValue) || 0),
      0
    );
    let cumulativeValue = 0;

    const classifiedData = abcData.map((item) => {
      cumulativeValue += Number(item.totalValue) || 0;
      const cumulativePercentage = (cumulativeValue / totalValue) * 100;

      let classification = "C";
      if (cumulativePercentage <= 80) {
        classification = "A";
      } else if (cumulativePercentage <= 95) {
        classification = "B";
      }

      return {
        ...item,
        cumulativePercentage,
        classification,
      };
    });

    return classifiedData;
  }),

  // Get reorder recommendations
  getReorderRecommendations: publicProcedure.query(async () => {
    const recommendations = await db
      .select({
        kode_brng: databarang.kode_brng,
        nama_brng: databarang.nama_brng,
        totalStok: sum(gudangbarang.stok),
        stokMinimal: databarang.stokminimal,
        h_beli: databarang.h_beli,
        kode_sat: databarang.kode_sat,
        deficit: sql<number>`COALESCE(SUM(${gudangbarang.stok}), 0) - ${databarang.stokminimal}`,
        suggestedReorder: sql<number>`CASE 
          WHEN COALESCE(SUM(${gudangbarang.stok}), 0) <= ${databarang.stokminimal}
          THEN ${databarang.stokminimal} * 2
          ELSE 0
        END`,
        priority: sql<string>`CASE 
          WHEN COALESCE(SUM(${gudangbarang.stok}), 0) = 0 THEN 'CRITICAL'
          WHEN COALESCE(SUM(${gudangbarang.stok}), 0) <= ${databarang.stokminimal} THEN 'HIGH'
          WHEN COALESCE(SUM(${gudangbarang.stok}), 0) <= ${databarang.stokminimal} * 1.5 THEN 'MEDIUM'
          ELSE 'LOW'
        END`,
      })
      .from(databarang)
      .leftJoin(gudangbarang, eq(databarang.kode_brng, gudangbarang.kode_brng))
      .where(eq(databarang.status, "1"))
      .groupBy(databarang.kode_brng)
      .having(
        sql`COALESCE(SUM(${gudangbarang.stok}), 0) <= ${databarang.stokminimal} * 1.5`
      )
      .orderBy(
        asc(
          sql`COALESCE(SUM(${gudangbarang.stok}), 0) - ${databarang.stokminimal}`
        )
      );

    return recommendations;
  }),

  // Get critical alerts
  getCriticalAlerts: publicProcedure.query(async () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    // Out of stock alerts
    const outOfStock = await db
      .select({
        kode_brng: databarang.kode_brng,
        nama_brng: databarang.nama_brng,
        totalStok: sum(gudangbarang.stok),
        alertType: sql<string>`'OUT_OF_STOCK'`,
        priority: sql<string>`'CRITICAL'`,
      })
      .from(databarang)
      .leftJoin(gudangbarang, eq(databarang.kode_brng, gudangbarang.kode_brng))
      .where(eq(databarang.status, "1"))
      .groupBy(databarang.kode_brng)
      .having(sql`COALESCE(SUM(${gudangbarang.stok}), 0) = 0`);

    // Low stock alerts
    const lowStock = await db
      .select({
        kode_brng: databarang.kode_brng,
        nama_brng: databarang.nama_brng,
        totalStok: sum(gudangbarang.stok),
        stokMinimal: databarang.stokminimal,
        alertType: sql<string>`'LOW_STOCK'`,
        priority: sql<string>`'HIGH'`,
      })
      .from(databarang)
      .leftJoin(gudangbarang, eq(databarang.kode_brng, gudangbarang.kode_brng))
      .where(eq(databarang.status, "1"))
      .groupBy(databarang.kode_brng)
      .having(
        sql`COALESCE(SUM(${gudangbarang.stok}), 0) > 0 AND COALESCE(SUM(${gudangbarang.stok}), 0) <= ${databarang.stokminimal}`
      );

    // Expiry alerts
    const expiringSoon = await db
      .select({
        kode_brng: gudangbarang.kode_brng,
        nama_brng: databarang.nama_brng,
        no_batch: gudangbarang.no_batch,
        expire: databarang.expire,
        stok: gudangbarang.stok,
        alertType: sql<string>`'EXPIRING_SOON'`,
        priority: sql<string>`'MEDIUM'`,
      })
      .from(gudangbarang)
      .leftJoin(databarang, eq(gudangbarang.kode_brng, databarang.kode_brng))
      .where(
        and(
          eq(databarang.status, "1"),
          sql`${databarang.expire} IS NOT NULL`,
          sql`${databarang.expire} <= ${thirtyDaysFromNow.toISOString()}`,
          sql`${databarang.expire} > ${now.toISOString()}`
        )
      );

    const expired = await db
      .select({
        kode_brng: gudangbarang.kode_brng,
        nama_brng: databarang.nama_brng,
        no_batch: gudangbarang.no_batch,
        expire: databarang.expire,
        stok: gudangbarang.stok,
        alertType: sql<string>`'EXPIRED'`,
        priority: sql<string>`'CRITICAL'`,
      })
      .from(gudangbarang)
      .leftJoin(databarang, eq(gudangbarang.kode_brng, databarang.kode_brng))
      .where(
        and(
          eq(databarang.status, "1"),
          sql`${databarang.expire} IS NOT NULL`,
          sql`${databarang.expire} < ${now.toISOString()}`
        )
      );

    return {
      outOfStock,
      lowStock,
      expiringSoon,
      expired,
      totalAlerts:
        outOfStock.length +
        lowStock.length +
        expiringSoon.length +
        expired.length,
    };
  }),

  // Get stock performance metrics
  getStockPerformanceMetrics: publicProcedure.query(async () => {
    const summary = await db
      .select({
        totalItems: count(databarang.kode_brng),
        totalValue: sum(sql`${gudangbarang.stok} * ${databarang.h_beli}`),
        totalStok: sum(gudangbarang.stok),
      })
      .from(databarang)
      .leftJoin(gudangbarang, eq(databarang.kode_brng, gudangbarang.kode_brng))
      .where(eq(databarang.status, "1"));

    const lowStockCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(
        db
          .select({
            kode_brng: databarang.kode_brng,
            totalStok: sum(gudangbarang.stok),
            stokMinimal: databarang.stokminimal,
          })
          .from(databarang)
          .leftJoin(
            gudangbarang,
            eq(databarang.kode_brng, gudangbarang.kode_brng)
          )
          .where(eq(databarang.status, "1"))
          .groupBy(databarang.kode_brng)
          .having(
            sql`COALESCE(SUM(${gudangbarang.stok}), 0) <= ${databarang.stokminimal}`
          )
          .as("lowStockItems")
      );

    const outOfStockCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(
        db
          .select({
            kode_brng: databarang.kode_brng,
            totalStok: sum(gudangbarang.stok),
          })
          .from(databarang)
          .leftJoin(
            gudangbarang,
            eq(databarang.kode_brng, gudangbarang.kode_brng)
          )
          .where(eq(databarang.status, "1"))
          .groupBy(databarang.kode_brng)
          .having(sql`COALESCE(SUM(${gudangbarang.stok}), 0) = 0`)
          .as("outOfStockItems")
      );

    const data = summary[0];
    const totalItems = data?.totalItems || 0;
    const healthyStockCount =
      totalItems -
      (lowStockCount[0]?.count || 0) -
      (outOfStockCount[0]?.count || 0);

    return {
      totalItems,
      totalValue: data?.totalValue || 0,
      totalStok: data?.totalStok || 0,
      lowStockCount: lowStockCount[0]?.count || 0,
      outOfStockCount: outOfStockCount[0]?.count || 0,
      healthyStockCount,
      stockHealthPercentage:
        totalItems > 0 ? Math.round((healthyStockCount / totalItems) * 100) : 0,
      averageItemValue:
        totalItems > 0 ? (Number(data?.totalValue) || 0) / totalItems : 0,
    };
  }),
});
