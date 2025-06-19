import { Router, Response } from "express";
import {
  createCustomMetric,
  deleteCustomMetric,
  updateCustomMetric,
  getCustomMetricsForUser,
} from "../services/custom-metric.service";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth.middleware";

const router = Router();

// Create a CustomMetric
router.post("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, metricType } = req.body;
    if (!name || !metricType) {
        throw new Error("Name and metricType are required fields");
    }

    const metric = await createCustomMetric({
      userId: req.userId!,
      name,
      metricType,
    });

    res.status(201).json(metric);
  } catch (err) {
    console.error("Error creating metric:", err);
    res.status(500).json({ error: "Failed to create metric" });
  }
});

// Update a CustomMetric
router.put("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const metricId = parseInt(req.params.id);
    const { name, metricType } = req.body;

    if (isNaN(metricId)) throw new Error("Invalid metric ID");

    const updated = await updateCustomMetric(metricId, { name, metricType });
    res.json(updated);
  } catch (err) {
    console.error("Error updating metric:", err);
    res.status(500).json({ error: "Failed to update metric" });
  }
});

// Delete a CustomMetric
router.delete("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const metricId = parseInt(req.params.id);

    if (isNaN(metricId)) throw new Error("Invalid metric ID");

    await deleteCustomMetric(metricId);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting metric:", err);
    res.status(500).json({ error: "Failed to delete metric" });
  }
});

// Get all CustomMetrics for the authenticated user
router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const metrics = await getCustomMetricsForUser(req.userId!);
    res.json(metrics);
  } catch (err) {
    console.error("Error fetching metrics:", err);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

export default router;
