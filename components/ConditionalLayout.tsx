'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingCtas from '@/components/FloatingCtas'
import CookieConsent from '@/components/CookieConsent'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Hide header/footer for admin dashboard routes
  const isAdminRoute = pathname?.startsWith('/dashboard-wind-ops')
  
  if (isAdminRoute) {
    // Admin routes: render only children (no header/footer)
    return <>{children}</>
  }
  
  // Regular website routes: render with header/footer
  return (
    <>
      <Header />
      {children}
      <Footer />
      <FloatingCtas />
      <CookieConsent />
    </>
  )
}
