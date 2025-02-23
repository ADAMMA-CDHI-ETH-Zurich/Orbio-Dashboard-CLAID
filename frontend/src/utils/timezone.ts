/**
 * Gets the current timezone offset in seconds
 * Positive values indicate ahead of UTC (east)
 * Negative values indicate behind UTC (west)
 * @returns number of seconds to adjust UTC timestamp for local timezone
 */
export const getTimezoneOffsetSeconds = (): number => {
  // getTimezoneOffset() returns minutes, and is opposite of what we want
  // e.g., for UTC+2, it returns -120, but we want +7200
  return -(new Date().getTimezoneOffset() * 60);
};

/**
 * Adjusts a UTC Unix timestamp to the local timezone
 * @param utcTimestamp UTC Unix timestamp in seconds
 * @returns local timezone Unix timestamp in seconds
 */
export const adjustToLocalTimezone = (utcTimestamp: number): number => {
  return utcTimestamp + getTimezoneOffsetSeconds();
};

/**
 * Adjusts a local timezone Unix timestamp to UTC
 * @param localTimestamp local timezone Unix timestamp in seconds
 * @returns UTC Unix timestamp in seconds
 */
export const adjustToUTC = (localTimestamp: number): number => {
  return localTimestamp - getTimezoneOffsetSeconds();
}; 