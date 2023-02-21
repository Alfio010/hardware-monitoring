-- CreateTable
CREATE TABLE "HwInfo" (
    "hwInfoId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hwName" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "cpu" TEXT,
    "gpu" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HwStatistics" (
    "hwStatsId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hwInfoId" INTEGER NOT NULL,
    "cpuUsage" INTEGER NOT NULL,
    "cpuTemperature" INTEGER NOT NULL,
    "gpuUsage" INTEGER,
    "programName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HwStatistics_hwInfoId_fkey" FOREIGN KEY ("hwInfoId") REFERENCES "HwInfo" ("hwInfoId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HwStatistics_programName_fkey" FOREIGN KEY ("programName") REFERENCES "ProgramName" ("name") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgramName" (
    "programId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramName_name_key" ON "ProgramName"("name");
