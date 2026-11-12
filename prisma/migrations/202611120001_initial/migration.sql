-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'EDITOR', 'REVIEWER');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('STORE', 'THIRD_PARTY');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'REVIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seller" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "preferredContactMethod" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watch" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "year" INTEGER,
    "condition" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "defects" TEXT NOT NULL DEFAULT '',
    "price" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NAD',
    "availability" "Availability" NOT NULL DEFAULT 'AVAILABLE',
    "ownershipType" "OwnershipType" NOT NULL DEFAULT 'STORE',
    "sellerId" UUID,
    "submissionId" UUID,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "box" BOOLEAN NOT NULL DEFAULT false,
    "papers" BOOLEAN NOT NULL DEFAULT false,
    "diameter" TEXT,
    "movement" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Watch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchImage" (
    "id" UUID NOT NULL,
    "watchId" UUID NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "WatchImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchSubmission" (
    "id" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "reference" TEXT,
    "year" INTEGER,
    "condition" TEXT NOT NULL,
    "requestedPrice" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NAD',
    "description" TEXT NOT NULL,
    "defects" TEXT NOT NULL DEFAULT '',
    "box" BOOLEAN NOT NULL DEFAULT false,
    "papers" BOOLEAN NOT NULL DEFAULT false,
    "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewNotes" TEXT,
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionImage" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "SubmissionImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" UUID NOT NULL,
    "watchId" UUID,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActivityLog" (
    "id" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailOutbox" (
    "id" UUID NOT NULL,
    "submissionId" UUID,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttempt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL DEFAULT 'home',
    "content" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "Seller_email_idx" ON "Seller"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Watch_slug_key" ON "Watch"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Watch_submissionId_key" ON "Watch"("submissionId");

-- CreateIndex
CREATE INDEX "Watch_published_availability_featured_idx" ON "Watch"("published", "availability", "featured");

-- CreateIndex
CREATE INDEX "Watch_brand_condition_price_idx" ON "Watch"("brand", "condition", "price");

-- CreateIndex
CREATE UNIQUE INDEX "WatchImage_watchId_sortOrder_key" ON "WatchImage"("watchId", "sortOrder");

-- CreateIndex
CREATE INDEX "WatchSubmission_status_createdAt_idx" ON "WatchSubmission"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionImage_submissionId_sortOrder_key" ON "SubmissionImage"("submissionId", "sortOrder");

-- CreateIndex
CREATE INDEX "Enquiry_status_createdAt_idx" ON "Enquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AdminActivityLog_entityId_createdAt_idx" ON "AdminActivityLog"("entityId", "createdAt");

-- CreateIndex
CREATE INDEX "EmailOutbox_status_nextAttempt_idx" ON "EmailOutbox"("status", "nextAttempt");

-- AddForeignKey
ALTER TABLE "Watch" ADD CONSTRAINT "Watch_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watch" ADD CONSTRAINT "Watch_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "WatchSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchImage" ADD CONSTRAINT "WatchImage_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "Watch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchSubmission" ADD CONSTRAINT "WatchSubmission_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchSubmission" ADD CONSTRAINT "WatchSubmission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionImage" ADD CONSTRAINT "SubmissionImage_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "WatchSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "Watch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActivityLog" ADD CONSTRAINT "AdminActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailOutbox" ADD CONSTRAINT "EmailOutbox_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "WatchSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Monetary and publication invariants remain enforced outside the application.
ALTER TABLE "Watch" ADD CONSTRAINT "Watch_positive_price" CHECK (price > 0);
ALTER TABLE "Watch" ADD CONSTRAINT "Watch_NAD_only" CHECK (currency = 'NAD');
ALTER TABLE "Watch" ADD CONSTRAINT "Watch_terminal_unpublished" CHECK (availability NOT IN ('SOLD','ARCHIVED') OR published = false);
ALTER TABLE "Watch" ADD CONSTRAINT "Third_party_requires_review" CHECK ("ownershipType" <> 'THIRD_PARTY' OR ("submissionId" IS NOT NULL AND "sellerId" IS NOT NULL));
ALTER TABLE "WatchSubmission" ADD CONSTRAINT "Submission_positive_price" CHECK ("requestedPrice" > 0);
ALTER TABLE "WatchSubmission" ADD CONSTRAINT "Submission_NAD_only" CHECK (currency = 'NAD');
ALTER TABLE "WatchImage" ADD CONSTRAINT "WatchImage_order_nonnegative" CHECK ("sortOrder" >= 0);
ALTER TABLE "SubmissionImage" ADD CONSTRAINT "SubmissionImage_order_nonnegative" CHECK ("sortOrder" >= 0);
ALTER TABLE "Seller" ADD CONSTRAINT "Seller_contact_preference" CHECK ("preferredContactMethod" IN ('Email','Phone','WhatsApp'));
-- All data access is through the authenticated Next.js server. Supabase browser
-- roles receive no table access. The runtime must use the configured server role.
DO $$
DECLARE table_name text; client_role text;
BEGIN
 FOREACH table_name IN ARRAY ARRAY['AdminUser','Seller','Watch','WatchImage','WatchSubmission','SubmissionImage','Enquiry','AdminActivityLog','EmailOutbox','RateLimit','SiteContent'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
  EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', table_name);
  FOREACH client_role IN ARRAY ARRAY['anon','authenticated'] LOOP
   IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname=client_role) THEN
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM %I', table_name, client_role);
   END IF;
  END LOOP;
 END LOOP;
END $$;
