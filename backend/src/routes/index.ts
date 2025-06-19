import { Router } from "express";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import userRoutes from "./user.routes"; // if you add later

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/user", userRoutes);
apiRouter.use("/health", healthRoutes);
// apiRouter.use("/users", userRoutes); // add other modules as needed

export default apiRouter;

