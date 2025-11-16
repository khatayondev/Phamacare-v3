import { createClient } from "npm:@supabase/supabase-js@2";
import { AuthUser, ApiResponse } from '../models/types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

export class AuthService {
  /**
   * Verify authentication token and return user data
   */
  static async verifyToken(request: Request): Promise<{ error: string | null; user: AuthUser | null }> {
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return { error: 'No authorization token provided', user: null };
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      if (error || !user) {
        return { error: 'Invalid authorization token', user: null };
      }
      return { error: null, user: user as AuthUser };
    } catch (error) {
      console.error('Token verification error:', error);
      return { error: 'Failed to verify token', user: null };
    }
  }

  /**
   * Create a new user account
   */
  static async createUser(
    email: string,
    password: string,
    name: string,
    role: string
  ): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        user_metadata: { 
          name: name,
          role: role 
        },
        // Automatically confirm the user's email since an email server hasn't been configured.
        email_confirm: true
      });

      if (error) {
        console.error('User creation error:', error);
        if (error.message.includes('email_exists') || error.code === 'email_exists') {
          return { error: 'An account with this email already exists' };
        }
        return { error: error.message };
      }

      return { 
        data: {
          id: data.user?.id,
          email: data.user?.email,
          name: name,
          role: role
        },
        message: 'User created successfully'
      };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: 'Failed to create user account' };
    }
  }

  /**
   * Delete a user account
   */
  static async deleteUser(userId: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) {
        console.warn('Could not remove user from auth system:', error);
        return { error: 'Failed to remove user from authentication system' };
      }
      return { message: 'User removed from authentication system successfully' };
    } catch (error) {
      console.error('Error removing user from auth:', error);
      return { error: 'Failed to remove user from authentication system' };
    }
  }

  /**
   * Check if user has required role
   */
  static hasRole(user: AuthUser, requiredRole: string): boolean {
    return user.user_metadata?.role === requiredRole;
  }

  /**
   * Check if user has any of the required roles
   */
  static hasAnyRole(user: AuthUser, requiredRoles: string[]): boolean {
    const userRole = user.user_metadata?.role;
    return userRole ? requiredRoles.includes(userRole) : false;
  }
}