import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const forceUpdate = searchParams.get("forceUpdate") === "true";

    // 取得當前設定
    let rateSetting = await prisma.systemSetting.findUnique({ where: { key: "exchangeRate" } });
    let lastUpdatedSetting = await prisma.systemSetting.findUnique({ where: { key: "lastUpdated" } });

    const now = new Date();
    let shouldUpdate = false;
    let currentRate = 1.0;
    let lastUpdated = now;

    if (!rateSetting || !lastUpdatedSetting || forceUpdate) {
      shouldUpdate = true;
    } else {
      currentRate = parseFloat(rateSetting.value);
      lastUpdated = new Date(lastUpdatedSetting.value);
      
      // 檢查是否超過三天 (3 * 24 * 60 * 60 * 1000 ms)
      const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 3) {
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      // 計算全站總積分 (模擬資金池流通量)
      const userStats = await prisma.user.aggregate({
        _sum: { points: true }
      });
      const totalPoints = userStats._sum.points || 0;

      // 假設健康水位基準為 1000 點
      const basePoints = 1000;
      const rawRate = totalPoints / basePoints;

      // 每 0.5 單位調整一次 (1.0, 1.5, 2.0...)
      let newRate = Math.floor(rawRate / 0.5) * 0.5;
      newRate = Math.max(1.0, newRate); // 最小匯率為 1.0

      currentRate = newRate;
      lastUpdated = now;

      // 更新至資料庫
      await prisma.$transaction([
        prisma.systemSetting.upsert({
          where: { key: "exchangeRate" },
          update: { value: currentRate.toString() },
          create: { key: "exchangeRate", value: currentRate.toString() }
        }),
        prisma.systemSetting.upsert({
          where: { key: "lastUpdated" },
          update: { value: lastUpdated.toISOString() },
          create: { key: "lastUpdated", value: lastUpdated.toISOString() }
        })
      ]);
    }

    // 計算下次更新時間
    const nextUpdate = new Date(lastUpdated.getTime() + 3 * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      rate: currentRate,
      lastUpdated: lastUpdated.toISOString(),
      nextUpdate: nextUpdate.toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error("Economy status error:", error);
    return NextResponse.json({ error: "伺服器發生錯誤" }, { status: 500 });
  }
}
