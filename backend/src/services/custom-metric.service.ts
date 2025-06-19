import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Create a CustomMetric
export async function createCustomMetric(data: {
  userId: string;
  name: string;
  metricType: string;
}) {
  return await prisma.customMetric.create({
    data,
  });
}

// 2. Delete a CustomMetric by ID
export async function deleteCustomMetric(metricId: number) {
  return await prisma.customMetric.delete({
    where: { id: metricId },
  });
}

// 3. Edit a CustomMetric by ID
export async function updateCustomMetric(metricId: number, data: {
  name?: string;
  metricType?: string;
}) {
  return await prisma.customMetric.update({
    where: { id: metricId },
    data,
  });
}

// 4. Get one CustomMetric by ID
export async function getCustomMetricById(metricId: number) {
  return await prisma.customMetric.findUnique({
    where: { id: metricId },
  });
}

// 5. Get all CustomMetrics for a user
export async function getCustomMetricsForUser(userId: string) {
  return await prisma.customMetric.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }, // optional
  });
}
