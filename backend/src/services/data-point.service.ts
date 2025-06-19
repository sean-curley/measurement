import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Rounds a JS Date to the start of the day (00:00:00)
 */
function roundToStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Create or update a DataPoint for a given metric on a specific day
 */
export async function createDataPointForMetric(params: {
  metricId: number;
  metricValue: number;
  date?: Date; // optional override (default: now)
}) {
  const { metricId, metricValue, date = new Date() } = params;

  const roundedDate = roundToStartOfDay(date);

  return await prisma.dataPoint.upsert({
    where: {
      metricId_date: {
        metricId,
        date: roundedDate,
      },
    },
    update: {
      metric_value: metricValue,
    },
    create: {
      metricId,
      metric_value: metricValue,
      date: roundedDate,
    },
  });
}

/**
 * Get all DataPoints for a given CustomMetric within a date range
 */
export async function getDataPointsForMetricInRange(params: {
  metricId: number;
  startDate: Date;
  endDate: Date;
}) {
  const { metricId, startDate, endDate } = params;

  return await prisma.dataPoint.findMany({
    where: {
      metricId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: "asc",
    },
  });
}


/**
 * Delete all DataPoints associated with a given CustomMetric
 */
export async function deleteDataPointsForMetric(metricId: number) {
  return await prisma.dataPoint.deleteMany({
    where: {
      metricId,
    },
  });
}
