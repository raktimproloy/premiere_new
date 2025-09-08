/**
 * Format date from MM-DD-YYYY to a more readable format
 * @param dateString - Date string in MM-DD-YYYY format
 * @returns Formatted date string
 */
export function formatDateForDisplay(dateString: string): string {
  console.log("dateString",dateString)
  if (!dateString) return '';
  
  try {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Validate date format MM-DD-YYYY
 * @param dateString - Date string to validate
 * @returns boolean indicating if date is valid
 */
export function isValidDateFormat(dateString: string): boolean {
  if (!dateString) return false;
  
  const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const [month, day, year] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
}

/**
 * Convert date to MM-DD-YYYY format
 * @param date - Date object or string
 * @returns Date string in MM-DD-YYYY format
 */
export function formatDateForInput(date: Date | string): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${month}-${day}-${year}`;
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
} 