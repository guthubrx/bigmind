/**
 * Storage Manager
 * Centralized utility for localStorage operations with error handling
 * Eliminates try-catch duplication across the codebase
 */

/* eslint-disable no-console */

/**
 * Load an object from localStorage
 */
export function loadObject<T = any>(key: string, defaultValue: T = {} as T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.warn(`[storageManager] Error loading ${key}:`, e);
    return defaultValue;
  }
}

/**
 * Save an object to localStorage
 */
export function saveObject(key: string, obj: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(obj));
    return true;
  } catch (e) {
    console.warn(`[storageManager] Error saving ${key}:`, e);
    return false;
  }
}

/**
 * Update a single property in a stored object
 */
export function updateProperty(key: string, propertyName: string, value: any): boolean {
  const obj = loadObject(key);
  obj[propertyName] = value;
  return saveObject(key, obj);
}

/**
 * Update multiple properties in a stored object
 */
export function updateProperties(key: string, updates: Record<string, any>): boolean {
  const obj = loadObject(key);
  Object.assign(obj, updates);
  return saveObject(key, obj);
}

/**
 * Remove a key from localStorage
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`[storageManager] Error removing ${key}:`, e);
  }
}

/**
 * Check if a key exists in localStorage
 */
export function hasItem(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch (e) {
    return false;
  }
}

/**
 * Get a raw string value from localStorage
 */
export function getString(key: string, defaultValue: string = ''): string {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (e) {
    console.warn(`[storageManager] Error getting string ${key}:`, e);
    return defaultValue;
  }
}

/**
 * Set a raw string value in localStorage
 */
export function setString(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`[storageManager] Error setting string ${key}:`, e);
    return false;
  }
}
