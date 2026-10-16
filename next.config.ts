// ─────────────────────────────────────────────
// Recuerdos XV — next.config.ts
// by Roberto Carlos Lizarazo Bayona
// ─────────────────────────────────────────────

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // Dominio del bucket público de R2
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        // Si usas un dominio personalizado para R2
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace('https://', '') ?? '',
      },
    ],
  },
}

export default nextConfig
