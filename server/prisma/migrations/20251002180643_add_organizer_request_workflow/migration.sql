/*
  Warnings:

  - You are about to drop the `OrganizerRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `organizationName` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "OrganizerRequest_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OrganizerRequest";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firebaseUid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'USER'
);
INSERT INTO "new_User" ("createdAt", "email", "firebaseUid", "id", "role") SELECT "createdAt", "email", "firebaseUid", "id", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
