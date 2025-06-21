import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { addDays, isAfter } from "date-fns";
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

  const roundedDate = addDays(roundToStartOfDay(date), 1); 

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



const monthMap = [
  'jan', 'feb', 'march', 'april', 'may', 'june',
  'july', 'aug', 'sep', 'oct', 'nov', 'dec',
];

export async function importMetricCsv(
  filePath: string,
  year: number,
  metricId: number
) {
  const content = fs.readFileSync(filePath);
  const records: string[][] = parse(content, { skip_empty_lines: true });

  const headerRow = records[1]; // Month names row
  const dayRows = records.slice(2); // Actual data

  for (const row of dayRows) {
    const day = parseInt(row[0], 10);
    if (isNaN(day)) continue;

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const value = row[monthIndex + 1];
      if (value === undefined || value === '' || isNaN(Number(value))) continue;

      const month = monthIndex + 1;
      const date = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
      const metric_value = Number(value);

      const params = {
        metricId,
        metricValue: metric_value,
        date
      }
      console.log(`Importing data point for ${date}: ${metric_value}`);
      await createDataPointForMetric(params);
    }
  }

  console.log('Import complete');
}
