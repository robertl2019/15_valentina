// ─────────────────────────────────────────────
// Recuerdos XV — api/presign/route.ts
// by Roberto Carlos Lizarazo Bayona
// POST /api/presign  →  genera URL firmada para subir video directo a R2
// ─────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: Request) {
  try {
    const { ext, mimeType } = await req.json()
    if (!ext || !mimeType) {
      return NextResponse.json({ message: 'Faltan parámetros' }, { status: 400 })
    }

    const key = `${randomUUID()}.${ext}`
    const url = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket:      process.env.R2_BUCKET_NAME!,
        Key:         key,
        ContentType: mimeType,
      }),
      { expiresIn: 300 }
    )

    return NextResponse.json({ url, key })
  } catch (err) {
    console.error('[presign] error:', err)
    return NextResponse.json({ message: 'Error generando URL' }, { status: 500 })
  }
}