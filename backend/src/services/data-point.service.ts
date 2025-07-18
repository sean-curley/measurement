import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();
import {
  subDays,
  subMonths,
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfWeek,
  endOfMonth,
  format,
  addDays,
  addWeeks,
  addMonths,
  isBefore,
} from "date-fns";

/**
 * Rounds a JS Date to the start of the day (00:00:00)
 */
export function roundToStartOfDay(date: Date): Date {
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

type Timeframe = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";
type Formula = "sum" | "avg" | `>${number}` | `%>${number}`;

export function parseThreshold(formula: string): number {
  return parseFloat(formula.replace(/[^\d.]/g, ""));
}


export async function getDataPointsForMetricInTimeframe(params: {
  metricId: number;
  timeframe: Timeframe;
  formula: Formula;
}) {
  const { metricId, timeframe, formula } = params;
  const now = new Date();

  let rawStartDate: Date | null = null;
  let groupBy: "day" | "week" | "month";

  switch (timeframe) {
    case "1W":
      rawStartDate = subDays(now, 7);
      groupBy = "day";
      break;
    case "1M":
      rawStartDate = subDays(now, 28);
      groupBy = "day";
      break;
    case "3M":
      rawStartDate = subDays(now, 91);
      groupBy = "week";
      break;
    case "6M":
      rawStartDate = subMonths(now, 6);
      groupBy = "month";
      break;
    case "1Y":
      rawStartDate = subMonths(now, 12);
      groupBy = "month";
      break;
    case "ALL":
      rawStartDate = null;
      groupBy = "month";
      break;
    default:
      throw new Error(`Unsupported timeframe: ${timeframe}`);
  }

  // Align rawStartDate to group boundary
  let alignedStartDate: Date;
  if (!rawStartDate) {
    alignedStartDate = new Date(0); // for "ALL"
  } else {
    const boundaryStart =
      groupBy === "day"
        ? startOfDay(rawStartDate)
        : groupBy === "week"
          ? startOfWeek(rawStartDate, { weekStartsOn: 0 })
          : startOfMonth(rawStartDate);

    // Clamp so we don't go earlier than intended
    alignedStartDate = boundaryStart < rawStartDate ? addDays(boundaryStart, 1) : boundaryStart;
  }

  const dataPoints = await prisma.dataPoint.findMany({
    where: {
      metricId,
      date: {
        gte: alignedStartDate,
        lte: now,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  if (!rawStartDate) {
    if (dataPoints.length === 0) {
      alignedStartDate = subMonths(now, 12); // for "ALL"
    }else{
      alignedStartDate = startOfMonth(new Date(dataPoints[0].date)); // for "ALL"
    }
  }

  // Generate buckets
  const buckets: {
    start: Date;
    end: Date;
    key: string;
    values: number[];
  }[] = [];

  

  let cursor = new Date(alignedStartDate);
  const endLimit = endOfDay(now);

  while (isBefore(cursor, endLimit)) {
    let start: Date, end: Date;

    if (groupBy === "day") {
      start = startOfDay(cursor);
      end = endOfDay(cursor);
      cursor = addDays(cursor, 1);
    } else if (groupBy === "week") {
      start = startOfWeek(cursor, { weekStartsOn: 0 });
      end = endOfWeek(cursor, { weekStartsOn: 0 });
      cursor = addWeeks(cursor, 1);
    } else {
      start = startOfMonth(cursor);
      end = endOfMonth(cursor);
      cursor = addMonths(cursor, 1);
    }

    buckets.push({
      start,
      end,
      key: start.toISOString(),
      values: [],
    });
  }

  // Assign datapoints to buckets
  for (const dp of dataPoints) {
    const dpDate = new Date(dp.date);
    const bucket = buckets.find(b => dpDate >= b.start && dpDate <= b.end);
    if (bucket) {
      bucket.values.push(dp.metric_value);
    }
  }

  // Apply formula and build output
  const result = buckets.map(({ start, end, values }) => {
    let value: number | null;

    if (values.length === 0) {
      value = null;
    } else if (formula === "sum") {
      value = values.reduce((a, b) => a + b, 0);
    } else if (formula === "avg") {
      value = values.reduce((a, b) => a + b, 0) / values.length;
    } else if (formula.startsWith("%>")) {
      const threshold = parseThreshold(formula);

      if (groupBy === "day") {
        const passed = values.some(v => v > threshold);
        value = passed ? 100 : 0;
      } else {
        const passedCount = values.filter(v => v > threshold).length;

        // Count actual days in group — inclusive
        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        value = (passedCount / totalDays) * 100;
      }

      value = Math.round(value * 10) / 10; // Round to 1 decimal
    } else if (formula.startsWith(">")) {
      const threshold = parseThreshold(formula);
      value = values.filter((v) => v > threshold).length;
    } else {
      throw new Error(`Unsupported formula: ${formula}`);
    }

    const label =
      groupBy === "day"
        ? format(start, "MMM d, yyyy")
        : `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;

    return {
      value,
      label,
    };
  });

  return result;
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
