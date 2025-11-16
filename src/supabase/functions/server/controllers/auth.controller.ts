import { Context } from "npm:hono";
import { AuthService } from '../services/auth.service.ts';
import { DataService } from '../services/data.service.ts';
import { User } from '../models/types.ts';

export class AuthController {
  /**
   * Handle user signup
   */
  static async signup(c: Context) {
    try {
      const { email, password, name, role } = await c.req.json();

      // Validate required fields
      if (!email || !password || !name || !role) {
        return c.json({ error: 'Missing required fields: email, password, name, and role are required' }, 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return c.json({ error: 'Invalid email format' }, 400);
      }

      // Validate password strength
      if (password.length < 6) {
        return c.json({ error: 'Password must be at least 6 characters long' }, 400);
      }

      // Validate role
      const validRoles = ['Admin', 'Pharmacist', 'Accountant'];
      if (!validRoles.includes(role)) {
        return c.json({ error: 'Invalid role. Must be Admin, Pharmacist, or Accountant' }, 400);
      }

      // Check if user already exists in our KV store
      const existingUsers = await DataService.getAll<User>('users');
      if (existingUsers.some((u: User) => u.email === email)) {
        return c.json({ error: 'An account with this email already exists' }, 409);
      }

      // Create user with Supabase Auth
      const authResult = await AuthService.createUser(email, password, name, role);
      if (authResult.error) {
        return c.json({ error: authResult.error }, 400);
      }

      // Store user in our KV store for management
      const newUser: User = {
        id: authResult.data?.id,
        name: name,
        email: email,
        role: role,
        status: role === 'Accountant' ? 'pending' : 'approved', // Accountants need approval
        createdDate: new Date().toISOString().split('T')[0]
      };

      const users = await DataService.getAll<User>('users');
      users.push(newUser);
      await DataService.update('users', '', users);

      return c.json({ 
        message: 'User account created successfully', 
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status
        }
      }, 201);

    } catch (error) {
      console.error('Signup controller error:', error);
      return c.json({ error: 'Failed to create user account. Please try again.' }, 500);
    }
  }

  /**
   * Middleware to verify authentication
   */
  static async authenticateUser(c: Context, next: Function) {
    try {
      const { error, user } = await AuthService.verifyToken(c.req.raw);
      
      if (error || !user) {
        return c.json({ error: 'Authentication required' }, 401);
      }

      // Add user to context for use in other controllers
      c.set('user', user);
      await next();
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return c.json({ error: 'Authentication failed' }, 401);
    }
  }

  /**
   * Middleware to check if user has required role
   */
  static requireRole(requiredRole: string) {
    return async (c: Context, next: Function) => {
      const user = c.get('user');
      
      if (!user) {
        return c.json({ error: 'Authentication required' }, 401);
      }

      if (!AuthService.hasRole(user, requiredRole)) {
        return c.json({ error: `Access denied. ${requiredRole} role required.` }, 403);
      }

      await next();
    };
  }

  /**
   * Middleware to check if user has any of the required roles
   */
  static requireAnyRole(requiredRoles: string[]) {
    return async (c: Context, next: Function) => {
      const user = c.get('user');
      
      if (!user) {
        return c.json({ error: 'Authentication required' }, 401);
      }

      if (!AuthService.hasAnyRole(user, requiredRoles)) {
        return c.json({ 
          error: `Access denied. One of the following roles required: ${requiredRoles.join(', ')}` 
        }, 403);
      }

      await next();
    };
  }
}