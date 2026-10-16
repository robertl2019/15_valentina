// ─────────────────────────────────────────────
// Recuerdos XV — r2.ts
// by Roberto Carlos Lizarazo Bayona
// Cloudflare R2 client (server-side only)
// ─────────────────────────────────────────────

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!
const BASE   = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!

/**
 * Upload a file buffer to R2.
 * Returns the public URL.
 */
export async function uploadToR2(
  buffer: Buffer,
  mimeType: string,
  ext: string,
): Promise<string> {
  const key = `${randomUUID()}.${ext}`

  await r2.send(
    new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      Body:        buffer,
      ContentType: mimeType,
    }),
  )

  return `${BASE}/${key}`
}
