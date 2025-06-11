'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState, useEffect } from 'react'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

// This persister will save the query cache to localStorage
const clientPersister = typeof window !== 'undefined'
  ? createSyncStoragePersister({
      storage: window.localStorage,
      key: 'COMPANY_FINDER_REACT_QUERY_CACHE',
      throttleTime: 1000, // Only persist every 1000ms to avoid excessive writes
    })
  : null;

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // Create a query client with improved caching settings
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 60 * 1000, // 1 hour
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
      },
    },
  }));
  
  // Set mounted state after initial render
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // During SSR or before mounting, use the regular provider
  if (!mounted || !clientPersister) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  // After mounting, use the persistence provider
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: clientPersister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        buster: 'v1', // Cache version
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist queries that were successful and have data
            return query.state.status === 'success' && !!query.state.data;
          },
        }
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
} 