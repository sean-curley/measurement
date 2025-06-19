// src/services/user.service.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userSelectFields = {
      id: true,
      email: true,
      createdAt: true,
      name: true,
      // add other fields as needed
    }

export async function getUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: userSelectFields,
  });
}
