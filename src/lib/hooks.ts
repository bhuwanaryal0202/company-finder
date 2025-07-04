import { useState, useEffect } from 'react';

type StorageType = 'localStorage' | 'sessionStorage';

interface UseLocalStorageOptions {
  storageType?: StorageType;
  serializer?: (value: unknown) => string;
  deserializer?: (value: string) => unknown;
}

/**
 * Custom hook for persisting state in localStorage or sessionStorage
 */
export function useStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [T, (value: T | ((val: T) => T)) => void] {
  const {
    storageType = 'localStorage',
    serializer = JSON.stringify,
    deserializer = JSON.parse,
  } = options;

  // State to track whether we're in a browser and have mounted
  const [mounted, setMounted] = useState(false);
  
  // Get from storage on initial render, but use initialValue during SSR
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // After mount, initialize from storage
  useEffect(() => {
    setMounted(true);
    
    try {
      const storage = window[storageType];
      const item = storage.getItem(key);
      if (item) {
        setStoredValue(deserializer(item) as T);
      }
    } catch (error) {
      console.error(`Error reading ${key} from ${storageType}:`, error);
    }
  }, [key, storageType, deserializer]);

  // Update state and storage when value changes
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function like React's setState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to storage (if on client)
      if (mounted) {
        const storage = window[storageType];
        if (valueToStore === undefined) {
          storage.removeItem(key);
        } else {
          storage.setItem(key, serializer(valueToStore));
        }
      }
    } catch (error) {
      console.error(`Error storing ${key} to ${storageType}:`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Hook for using localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: Omit<UseLocalStorageOptions, 'storageType'> = {}
) {
  return useStorage(key, initialValue, { ...options, storageType: 'localStorage' });
}

/**
 * Hook for using sessionStorage
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options: Omit<UseLocalStorageOptions, 'storageType'> = {}
) {
  return useStorage(key, initialValue, { ...options, storageType: 'sessionStorage' });
}

/**
 * Hook for tracking recent searches
 */
export function useRecentSearches(maxItems: number = 5) {
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recentSearches', []);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const addSearch = (search: string) => {
    if (!search.trim() || !mounted) return;
    
    setRecentSearches(prev => {
      // Remove if it already exists
      const filtered = prev.filter(item => item !== search);
      // Add to the beginning and limit the number of items
      return [search, ...filtered].slice(0, maxItems);
    });
  };

  const clearSearches = () => {
    if (!mounted) return;
    setRecentSearches([]);
  };

  const removeSearch = (search: string) => {
    if (!mounted) return;
    setRecentSearches(prev => prev.filter(item => item !== search));
  };

  return {
    recentSearches,
    addSearch,
    clearSearches,
    removeSearch
  };
}

/**
 * Flag to indicate if we're handling back navigation
 */
const NAVIGATION_KEY = 'companyFinder_navigatingBack';

/**
 * Function to set navigation flag
 */
export function setNavigatingBack(value: boolean) {
  if (typeof window === 'undefined') return;
  
  try {
    if (value) {
      sessionStorage.setItem(NAVIGATION_KEY, 'true');
    } else {
      sessionStorage.removeItem(NAVIGATION_KEY);
    }
  } catch (error) {
    console.error('Error setting navigation flag:', error);
  }
}

/**
 * Function to check if we're currently handling back navigation
 */
export function isNavigatingBack(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    return sessionStorage.getItem(NAVIGATION_KEY) === 'true';
  } catch (error) {
    console.error('Error checking navigation flag:', error);
    return false;
  }
}

/**
 * Hook for forcing a reload if navigation state is broken
 */
export function useNavigationFix() {
  useEffect(() => {
    // Force reload if this is not a back navigation
    const handleRestore = () => {
      const storedFilters = localStorage.getItem('companyFinderFilters');
      const storedPage = localStorage.getItem('companyFinderPage');
      
      // Only force reload if we have valid stored data but aren't in a back navigation
      if ((storedFilters || storedPage) && !isNavigatingBack()) {
        // Clear the flags first to prevent reload loops
        setNavigatingBack(false);
        
        // Force a hard reload if needed, but only do this once
        const needsReload = sessionStorage.getItem('needsReload');
        if (needsReload !== 'true') {
          sessionStorage.setItem('needsReload', 'true');
          window.location.reload();
        } else {
          sessionStorage.removeItem('needsReload');
        }
      }
    };
    
    // Check if we need to fix navigation
    handleRestore();
    
    // Clean up the navigation flag when component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        // Wait a bit before clearing the flag to ensure it persists during navigation
        setTimeout(() => {
          sessionStorage.removeItem('needsReload');
        }, 500);
      }
    };
  }, []);
}

/**
 * Hook for managing search state with navigation persistence
 */
export function useSearchState<T>(key: string, defaultValue: T) {
  const [state, setState] = useLocalStorage<T>(key, defaultValue);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Handle browser back/forward navigation
    const handlePopState = () => {
      // Force reload the stored value when navigating back
      try {
        const item = localStorage.getItem(key);
        if (item) {
          setState(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading ${key} from localStorage during navigation:`, error);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [key, setState]);
  
  // Special setter that ensures data is immediately saved to localStorage
  const setSearchState = (value: T | ((prev: T) => T)) => {
    setState(value);
    
    // For extra safety, also directly update localStorage
    if (mounted && typeof window !== 'undefined') {
      try {
        const valueToStore = value instanceof Function ? value(state) : value;
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error directly storing ${key} to localStorage:`, error);
      }
    }
  };
  
  return [state, setSearchState] as const;
} 