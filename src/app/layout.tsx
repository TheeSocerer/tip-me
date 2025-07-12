import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Load Inter font for modern, clean typography
const inter = Inter({ subsets: ['latin'] })

// Metadata for SEO and social sharing
export const metadata: Metadata = {
  title: 'Onchain Tip Jar - Web3 DApp',
  description: 'Send tips with messages on Base Sepolia testnet. A Web3 tutorial application for learning blockchain development.',
  keywords: ['web3', 'ethereum', 'base', 'tipjar', 'blockchain', 'dapp'],
  authors: [{ name: 'Web3 Developer' }],
  openGraph: {
    title: 'Onchain Tip Jar - Web3 DApp',
    description: 'Send tips with messages on Base Sepolia testnet',
    type: 'website',
  },
}

// Root layout component that wraps all pages
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Main content area */}
        {children}
      </body>
    </html>
  )
}