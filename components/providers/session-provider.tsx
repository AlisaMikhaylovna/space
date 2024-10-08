'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface  SessionProviderProps {
  children: ReactNode
}


export const SProvider = ({ children }:SessionProviderProps) => {
  return (
      <SessionProvider>{children}</SessionProvider>
  )
}

