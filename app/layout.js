import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
})

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
})

export const metadata = {
  title: 'WWTP P1 Monitoring',
  description: 'Sistem monitoring harian WWTP P1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans bg-cream text-ink">{children}</body>
    </html>
  )
}
