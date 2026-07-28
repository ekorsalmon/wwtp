import './globals.css'

export const metadata = {
  title: 'WWTP P1 Monitoring',
  description: 'Sistem monitoring harian WWTP P1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
