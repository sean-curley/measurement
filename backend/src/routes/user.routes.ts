import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
// import { requireAuth } from "../middleware/auth.middleware"; // for protected routes

const router = Router();
const prisma = new PrismaClient();

// GET /users - list all users (for admin only, typically)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, createdAt: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch users" });
  }
});

// GET /users/:id - fetch a user by ID
// router.get("/:id", async (req: Request, res: Response) => {
//   const userId = req.params.id;

//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: { id: true, email: true, createdAt: true },
//     });

//     if (!user) return res.status(404).json({ error: "User not found" });

//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: "Could not fetch user" });
//   }
// });

// (Optional) GET /users/me - auth required
// router.get("/me", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: req.user.id },
//       select: { id: true, email: true, createdAt: true },
//     });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: "Could not fetch user profile" });
//   }
// });

export default router;
