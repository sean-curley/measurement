// src/routes/user.routes.ts
import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth.middleware";
import { getUserById } from "../services/user.service";

const router = Router();

router.get("/me", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getUserById(req.userId!);

    res.json(user);
  } catch (err: any) {
    console.error("Failed to get /me:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
