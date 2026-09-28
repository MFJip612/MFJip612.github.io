-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ContentKind" AS ENUM ('profile', 'page', 'note', 'equipment', 'settings');

-- CreateEnum
CREATE TYPE "MediaVisibility" AS ENUM ('staging', 'verified');

-- CreateEnum
CREATE TYPE "MediaUsage" AS ENUM ('inline', 'cover', 'avatar');

-- CreateEnum
CREATE TYPE "AuditResult" AS ENUM ('ok', 'rejected', 'failed');

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "kind" "ContentKind" NOT NULL,
    "stableKey" TEXT,
    "publicSlug" TEXT,
    "workingRevisionId" TEXT,
    "publishedRevisionId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "lockVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revision" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "privateObjectKey" TEXT NOT NULL,
    "publicObjectKey" TEXT,
    "mime" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "alt" TEXT,
    "visibility" "MediaVisibility" NOT NULL DEFAULT 'staging',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaReference" (
    "revisionId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "usage" "MediaUsage" NOT NULL,

    CONSTRAINT "MediaReference_pkey" PRIMARY KEY ("revisionId","mediaId","usage")
);

-- CreateTable
CREATE TABLE "Redirect" (
    "oldPath" TEXT NOT NULL,
    "targetContentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("oldPath")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "result" "AuditResult" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Content_stableKey_key" ON "Content"("stableKey");

-- CreateIndex
CREATE UNIQUE INDEX "Content_publicSlug_key" ON "Content"("publicSlug");

-- CreateIndex
CREATE UNIQUE INDEX "Content_workingRevisionId_key" ON "Content"("workingRevisionId");

-- CreateIndex
CREATE UNIQUE INDEX "Content_publishedRevisionId_key" ON "Content"("publishedRevisionId");

-- CreateIndex
CREATE INDEX "Content_kind_deletedAt_idx" ON "Content"("kind", "deletedAt");

-- CreateIndex
CREATE INDEX "Content_publishedAt_idx" ON "Content"("publishedAt");

-- CreateIndex
CREATE INDEX "Revision_contentId_createdAt_idx" ON "Revision"("contentId", "createdAt");

-- CreateIndex
CREATE INDEX "MediaReference_mediaId_idx" ON "MediaReference"("mediaId");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_targetType_targetId_idx" ON "AuditEvent"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_workingRevisionId_fkey" FOREIGN KEY ("workingRevisionId") REFERENCES "Revision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_publishedRevisionId_fkey" FOREIGN KEY ("publishedRevisionId") REFERENCES "Revision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaReference" ADD CONSTRAINT "MediaReference_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaReference" ADD CONSTRAINT "MediaReference_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redirect" ADD CONSTRAINT "Redirect_targetContentId_fkey" FOREIGN KEY ("targetContentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
