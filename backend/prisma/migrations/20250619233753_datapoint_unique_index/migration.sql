/*
  Warnings:

  - A unique constraint covering the columns `[metricId,date]` on the table `DataPoint` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DataPoint_metricId_date_key" ON "DataPoint"("metricId", "date");
