/**
 * Custom hook for client-only rendering to prevent hydration errors
 */
import { useState, useEffect } from 'react';

/**
 * Hook that returns true only after component has mounted on client
 * Useful for preventing hydration mismatches with client-only content
 */
export function useClientOnly(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook for client-only values with fallback
 * @param clientValue - Value to use on client
 * @param serverValue - Fallback value for server/initial render
 */
export function useClientValue<T>(clientValue: T, serverValue: T): T {
  const [value, setValue] = useState<T>(serverValue);

  useEffect(() => {
    setValue(clientValue);
  }, [clientValue]);

  return value;
}

/**
 * Hook for formatted dates that prevents hydration errors
 * @param date - Date to format
 * @param formatter - Function to format the date
 * @param fallback - Fallback string for server render
 */
export function useFormattedDate(
  date: Date | string | null,
  formatter: (date: Date | string) => string,
  fallback: string = ''
): string {
  const [formatted, setFormatted] = useState(fallback);

  useEffect(() => {
    if (date) {
      setFormatted(formatter(date));
    }
  }, [date, formatter]);

  return formatted;
}