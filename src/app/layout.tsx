// ─────────────────────────────────────────────
// Recuerdos XV — layout.tsx
// by Roberto Carlos Lizarazo Bayona
// ─────────────────────────────────────────────

import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Recuerdos XV · Danna Valentina',
  description: 'Comparte tus fotos y videos de la quinceañera de Danna Valentina Forero · 17 de octubre de 2026',
  openGraph: {
    title: 'Recuerdos XV · Danna Valentina',
    description: 'Una noche para recordar siempre — 17 · Oct · 2026',
    images: ['/og.jpg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9e9e7' },
    { media: '(prefers-color-scheme: dark)',  color: '#160e0d' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-shell">
          {children}
        </div>
      </body>
    </html>
  )
}
