import { supabase } from '../config/database.ts';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

// Enhanced auth verification with role checking
export async function verifyAuth(request: Request): Promise<{ error: string | null; user: AuthenticatedUser | null }> {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return { error: 'No authorization token provided', user: null };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return { error: 'Invalid authorization token', user: null };
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'Guest',
      name: user.user_metadata?.name || 'Unknown User'
    };

    return { error: null, user: authenticatedUser };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { error: 'Failed to verify token', user: null };
  }
}

// Role-based access control middleware
export function requireRole(allowedRoles: string[]) {
  return async (request: Request): Promise<{ error: string | null; user: AuthenticatedUser | null }> => {
    const { error, user } = await verifyAuth(request);
    
    if (error || !user) {
      return { error: error || 'Authentication required', user: null };
    }

    if (!allowedRoles.includes(user.role)) {
      return { error: `Access denied. Required roles: ${allowedRoles.join(', ')}`, user: null };
    }

    return { error: null, user };
  };
}

// Admin-only middleware
export const requireAdmin = requireRole(['Admin']);

// Pharmacist or Admin middleware
export const requirePharmacistOrAdmin = requireRole(['Admin', 'Pharmacist']);

// Accountant or Admin middleware
export const requireAccountantOrAdmin = requireRole(['Admin', 'Accountant']);