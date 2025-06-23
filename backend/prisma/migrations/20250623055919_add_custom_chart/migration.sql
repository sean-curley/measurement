-- CreateTable
CREATE TABLE "CustomChart" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "chartType" TEXT NOT NULL,
    "chartFormula" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomChart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChartMetrics" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ChartMetrics_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChartMetrics_B_index" ON "_ChartMetrics"("B");

-- AddForeignKey
ALTER TABLE "CustomChart" ADD CONSTRAINT "CustomChart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChartMetrics" ADD CONSTRAINT "_ChartMetrics_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomChart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChartMetrics" ADD CONSTRAINT "_ChartMetrics_B_fkey" FOREIGN KEY ("B") REFERENCES "CustomMetric"("id") ON DELETE CASCADE ON UPDATE CASCADE;
