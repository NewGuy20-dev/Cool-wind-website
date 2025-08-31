'use client'

import MotionProvider from './MotionProvider'

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <MotionProvider>
      {children}
    </MotionProvider>
  )
}
