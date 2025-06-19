import { Router, Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";

const router = Router();
// const prisma = new PrismaClient();

// GET /api/health
router.get("/", async (_req: Request, res: Response) => {
  try {
    // // Basic DB check (optional, but useful)
    // await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({ status: "ok", db: "NA" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "unreachable" });
  }
});

export default router;
