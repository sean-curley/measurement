-- CreateTable
CREATE TABLE "DataPoint" (
    "id" SERIAL NOT NULL,
    "metricId" INTEGER NOT NULL,
    "metric_value" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataPoint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DataPoint" ADD CONSTRAINT "DataPoint_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "CustomMetric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
