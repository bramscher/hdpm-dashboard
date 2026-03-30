import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HDPM Dashboard',
  description: 'High Desert Property Management — CEO Operations Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
