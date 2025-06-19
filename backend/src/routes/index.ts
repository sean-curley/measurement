import { Router } from "express";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import userRoutes from "./user.routes"; // if you add later
import metricRoutes from "./custom-metric.routes";
import dataPointRoutes from "./data-point.routes"; // if you add later
const apiRouter = Router();



apiRouter.use("/auth", authRoutes);
apiRouter.use("/user", userRoutes);
apiRouter.use("/health", healthRoutes);
apiRouter.use("/custom_metrics", metricRoutes);
apiRouter.use("/data_points", dataPointRoutes);


export default apiRouter;

