import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createDataPointForMetric,
  getDataPointsForMetricInRange,
  importMetricCsv,
  getDataPointsForMetricInTimeframe
} from "../services/data-point.service";
import { getCustomMetricById } from "../services/custom-metric.service"; // for ownership check
import path from 'path';

const router = Router();

/**
 * POST /api/data-points/:metricId
 * Sets or updates a data point for a specific day
 */
router.post("/:metricId", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const metricId = Number(req.params.metricId);
  const { value, date } = req.body;

  if (isNaN(metricId) || typeof value !== "number") {
    throw new Error("Invalid custom_metric ID or value");
  }

  // Optional: Parse custom date or default to now
  const parsedDate = date ? new Date(date) : new Date();
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format");
  }

  try {
    // Ownership check
    const metric = await getCustomMetricById(metricId);
    if (!metric || metric.userId !== req.userId) {
      throw new Error("Access denied");
    }

    const dp = await createDataPointForMetric({
      metricId,
      metricValue: value,
      date: parsedDate,
    });

    res.status(201).json(dp);
  } catch (err) {
    console.error("Error creating data point:", err);
    res.status(500).json({ error: "Failed to create data point" });
  }
});
/**
 * GET /api/data-points/:metricId?start=YYYY-MM-DD&end=YYYY-MM-DD
 * Get all data points for a metric in a date range
 */
router.get("/:metricId", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const metricId = Number(req.params.metricId);
  const { start, end } = req.query;

  if (isNaN(metricId) || !start || !end) {
    throw new Error("Metric ID, start, and end dates are required");
  }

  const startDate = new Date(start as string);
  const endDate = new Date(end as string);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format");
  }

  try {
    const metric = await getCustomMetricById(metricId);
    if (!metric || metric.userId !== req.userId) {
      throw new Error("Access denied");
    }

    const dataPoints = await getDataPointsForMetricInRange({
      metricId,
      startDate,
      endDate,
    });

    res.json(dataPoints);
  } catch (err) {
    console.error("Error fetching data points:", err);
    res.status(500).json({ error: "Failed to fetch data points" });
  }
});

/**
 * GET /api/data-points/:metricId/summary?timeframe=1M&formula=avg
 * Returns grouped/aggregated data points using a formula and timeframe
 */
router.get("/:metricId/summary", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const metricId = Number(req.params.metricId);
  const { timeframe, formula } = req.query;

  if (isNaN(metricId) || typeof timeframe !== "string" || typeof formula !== "string") {
    throw new Error("Invalid metric ID, timeframe, or formula");
  }

  try {
    const metric = await getCustomMetricById(metricId);
    if (!metric || metric.userId !== req.userId) {
      throw new Error("Access denied");
    }

    const summary = await getDataPointsForMetricInTimeframe({
      metricId,
      timeframe: timeframe as any,
      formula: formula as any,
    });

    res.json(summary);
  } catch (err) {
    console.error("Error fetching summarized data points:", err);
    res.status(500).json({ error: "Failed to fetch summarized data" });
  }
});


export default router;
