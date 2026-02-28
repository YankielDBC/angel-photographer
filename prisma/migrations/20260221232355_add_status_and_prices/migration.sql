-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "serviceType" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "amount" REAL NOT NULL DEFAULT 0,
    "stripeSessionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Booking" ("amount", "clientEmail", "clientName", "clientPhone", "createdAt", "date", "id", "notes", "serviceType", "status", "stripeSessionId", "updatedAt") SELECT "amount", "clientEmail", "clientName", "clientPhone", "createdAt", "date", "id", "notes", "serviceType", "status", "stripeSessionId", "updatedAt" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_date_key" ON "Booking"("date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
