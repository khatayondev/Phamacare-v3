export interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  category: 'Authentication' | 'Prescription' | 'Inventory' | 'Patient' | 'Payment' | 'Sales' | 'Settings' | 'User Management' | 'System';
}

export const addAuditLog = (action: string, details: string, userName?: string, category?: AuditLog['category']) => {
  // Get current user from auth context if available
  const currentUser = getCurrentUser();
  const user = userName || currentUser?.name || 'System';
  
  const newLog: AuditLog = {
    id: Date.now(),
    timestamp: new Date().toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }),
    user,
    action,
    details,
    category: category || 'System'
  };
  
  const storedLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
  const updatedLogs = [newLog, ...storedLogs].slice(0, 500); // Keep only last 500 logs
  localStorage.setItem('auditLogs', JSON.stringify(updatedLogs));
  
  // Dispatch event to trigger UI updates
  window.dispatchEvent(new CustomEvent('auditLogAdded', { detail: newLog }));
  
  console.log(`🔍 Audit Log: [${category}] ${action} - ${details}`);
};

const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const getAuditLogs = (limit = 50): AuditLog[] => {
  const storedLogs = localStorage.getItem('auditLogs');
  if (storedLogs) {
    const parsedLogs = JSON.parse(storedLogs);
    return parsedLogs.slice(0, limit);
  }
  return [];
};

export const filterAuditLogs = (
  logs: AuditLog[], 
  filters: {
    category?: string;
    user?: string;
    dateFrom?: string;
    dateTo?: string;
    searchTerm?: string;
  }
): AuditLog[] => {
  return logs.filter(log => {
    if (filters.category && log.category !== filters.category) return false;
    if (filters.user && !log.user.toLowerCase().includes(filters.user.toLowerCase())) return false;
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      if (!log.action.toLowerCase().includes(searchLower) && 
          !log.details.toLowerCase().includes(searchLower)) return false;
    }
    if (filters.dateFrom) {
      const logDate = new Date(log.timestamp);
      const fromDate = new Date(filters.dateFrom);
      if (logDate < fromDate) return false;
    }
    if (filters.dateTo) {
      const logDate = new Date(log.timestamp);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (logDate > toDate) return false;
    }
    return true;
  });
};