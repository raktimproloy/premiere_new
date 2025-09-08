// Cookie utility functions
export interface SearchSession {
  id: string;
  location: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  propertyIds: number[];
  createdAt: string;
}

export interface BookingPath {
  path: string;
  propertyId: string;
  searchId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  email?: string;
  createdAt: string;
}

export const setCookie = (name: string, value: string, minutes: number = 20) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (minutes * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const generateUniqueId = (): string => {
  return 'search_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const saveSearchSession = (searchData: Omit<SearchSession, 'id' | 'createdAt'>): string => {
  const id = generateUniqueId();
  const session: SearchSession = {
    ...searchData,
    id,
    createdAt: new Date().toISOString()
  };
  
  setCookie(`search_${id}`, JSON.stringify(session), 20);
  return id;
};

export const getSearchSession = (id: string): SearchSession | null => {
  const cookieValue = getCookie(`search_${id}`);
  if (!cookieValue) return null;
  
  try {
    const session = JSON.parse(cookieValue);
    // Check if session is expired (20 minutes)
    const createdAt = new Date(session.createdAt);
    const now = new Date();
    const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    if (diffInMinutes > 20) {
      deleteCookie(`search_${id}`);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error parsing search session:', error);
    return null;
  }
};

export const clearSearchSession = (id: string) => {
  deleteCookie(`search_${id}`);
};

// Booking path functions
export const saveBookingPath = (bookingData: Omit<BookingPath, 'createdAt'>) => {
  const bookingPath: BookingPath = {
    ...bookingData,
    createdAt: new Date().toISOString()
  };
  
  setCookie('bookingPath', JSON.stringify(bookingPath), 60); // 60 minutes expiry
};

export const getBookingPath = (): BookingPath | null => {
  const cookieValue = getCookie('bookingPath');
  if (!cookieValue) return null;
  
  try {
    const bookingPath = JSON.parse(cookieValue);
    // Check if session is expired (60 minutes)
    const createdAt = new Date(bookingPath.createdAt);
    const now = new Date();
    const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    if (diffInMinutes > 60) {
      deleteCookie('bookingPath');
      return null;
    }
    
    return bookingPath;
  } catch (error) {
    console.error('Error parsing booking path:', error);
    return null;
  }
};

export const clearBookingPath = () => {
  deleteCookie('bookingPath');
}; 