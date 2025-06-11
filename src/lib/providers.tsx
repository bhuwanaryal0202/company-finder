'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 60 * 1000, // 1 hour instead of 5 minutes for longer persistence
        gcTime: 24 * 60 * 60 * 1000, // 24 hours garbage collection time
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Do not refetch on component mount to preserve data
        refetchOnReconnect: false,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
} 