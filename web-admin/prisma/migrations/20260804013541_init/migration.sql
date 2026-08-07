-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OPERATOR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "specs" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "machineId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "images" TEXT,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "assignedToId" TEXT,
    "acceptedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "incidents_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "incidents_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "incidents_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "maintenance_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "incidentId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "repairDetail" TEXT NOT NULL,
    "partsReplaced" TEXT,
    "skillRating" INTEGER NOT NULL,
    "stillBroken" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "maintenance_logs_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "maintenance_logs_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "maintenance_logs_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "chat_group_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "chat_groups" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "chat_group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "senderId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "incidentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "chat_groups" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "chat_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "chat_messages_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeCode_key" ON "users"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "machines_code_key" ON "machines"("code");

-- CreateIndex
CREATE UNIQUE INDEX "chat_group_members_groupId_userId_key" ON "chat_group_members"("groupId", "userId");
