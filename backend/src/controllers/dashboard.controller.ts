import type { Request, Response, NextFunction } from "express";

export const getDashboardData = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const mockData = {
      summary: {
        totalRevenue: 54200.5,
        revenueGrowthPercent: 12.4,
        newUsersCount: 320,
        newUserGrowthPercent: 8.7,
        conversionRatePercent: 3.2,
        activeNow: 42,
      },
      charts: {
        monthlyRevenue: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Revenue 2026 (USD)",
              data: [8200, 9400, 11200, 10500, 12800, 14900],
            },
            {
              label: "Revenue 2025 (USD)",
              data: [6100, 7200, 8900, 8100, 9400, 11000],
            },
          ],
        },
        trafficSources: {
          labels: ["Search Engine", "Direct", "Social Media", "Referrals"],
          percentages: [45, 30, 15, 10],
        },
      },
    };

    res.status(200).json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    next(error);
  }
};
