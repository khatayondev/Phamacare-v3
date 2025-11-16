/**
 * Dashboard Cache Utility
 * Provides localStorage-based caching for dashboard data to prevent constant reloads
 */

const CACHE_KEY = 'pharmacare_dashboard_cache';
const CACHE_EXPIRY_MS = 60000; // 60 seconds

interface CacheData {
  data: any;
  timestamp: number;
}

/**
 * Save dashboard data to localStorage cache
 */
export function saveDashboardCache(data: any): void {
  try {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('✅ Dashboard data cached to localStorage');
  } catch (error) {
    console.error('Error saving dashboard cache:', error);
  }
}

/**
 * Get dashboard data from localStorage cache
 * Returns null if cache doesn't exist or is expired
 */
export function getDashboardCache(): any | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      console.log('📭 No dashboard cache found');
      return null;
    }

    const cacheData: CacheData = JSON.parse(cached);
    const age = Date.now() - cacheData.timestamp;

    if (age > CACHE_EXPIRY_MS) {
      console.log(`⏰ Dashboard cache expired (${Math.round(age / 1000)}s old)`);
      return null;
    }

    console.log(`✅ Dashboard cache hit (${Math.round(age / 1000)}s old)`);
    return cacheData.data;
  } catch (error) {
    console.error('Error reading dashboard cache:', error);
    return null;
  }
}

/**
 * Check if dashboard cache is still valid
 */
export function isDashboardCacheValid(): boolean {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return false;

    const cacheData: CacheData = JSON.parse(cached);
    const age = Date.now() - cacheData.timestamp;
    return age <= CACHE_EXPIRY_MS;
  } catch (error) {
    return false;
  }
}

/**
 * Get cache age in seconds
 */
export function getDashboardCacheAge(): number | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData: CacheData = JSON.parse(cached);
    return Math.round((Date.now() - cacheData.timestamp) / 1000);
  } catch (error) {
    return null;
  }
}

/**
 * Clear dashboard cache
 */
export function clearDashboardCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Dashboard cache cleared');
  } catch (error) {
    console.error('Error clearing dashboard cache:', error);
  }
}

/**
 * Force refresh dashboard cache
 * Used when we know data has changed
 */
export function invalidateDashboardCache(): void {
  clearDashboardCache();
  console.log('♻️ Dashboard cache invalidated');
}
