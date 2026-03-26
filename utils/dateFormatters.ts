/**
 * Utility functions for formatting dates and numbers
 */

/**
 * Format a number with thousand separators and optional decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined) return '0';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @param format - Format type ('short' | 'long' | 'time')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    case 'time':
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    default:
      return d.toLocaleDateString();
  }
}

/**
 * Format a timestamp to time only (HH:MM:SS)
 * @param timestamp - The timestamp to format
 * @returns Formatted time string
 */
export function formatTime(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format energy value with appropriate unit (W, kW, MW)
 * @param watts - Energy value in watts
 * @returns Formatted energy string with unit
 */
export function formatEnergy(watts: number): string {
  if (watts === 0) return '0 W';
  if (watts < 1000) return `${formatNumber(watts, 0)} W`;
  if (watts < 1000000) return `${formatNumber(watts / 1000, 2)} kW`;
  return `${formatNumber(watts / 1000000, 2)} MW`;
}

/**
 * Format percentage value
 * @param value - The percentage value
 * @param showSign - Whether to show the % sign
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, showSign = true): string {
  const formatted = formatNumber(value, 1);
  return showSign ? `${formatted}%` : formatted;
}

/**
 * Format currency value
 * @param value - The currency value
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param date - The date to compare
 * @returns Relative time string
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return formatDate(d, 'short');
}

/**
 * Format bytes to human readable size
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Convert a Date to ISO date string (YYYY-MM-DD)
 * @param date - The date to format
 * @returns ISO date string
 */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}