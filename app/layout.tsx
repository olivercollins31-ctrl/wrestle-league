import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Wrestle League',
  description: 'Prediction platform for wrestling PPVs'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <main className="max-w-3xl mx-auto p-4">{children}</main>
      </body>
    </html>
  )
}
