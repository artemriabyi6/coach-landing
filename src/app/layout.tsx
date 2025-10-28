import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AuthSessionProvider from '../providers/session-provider'
import './globals.css'
import { Header } from '../components/sections/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Футбольний Тренер - Індивідуальні програми тренувань',
  description: 'Прокачай свої навички з професійним тренером. Індивідуальний підхід для футболістів 16-35 років.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        <AuthSessionProvider> {/* ✅ Використовуємо наш провайдер */}
          <Header />
          <main className="pt-16">
            {children}
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  )
}