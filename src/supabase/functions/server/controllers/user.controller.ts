import { Context } from "npm:hono";
import { DataService } from '../services/data.service.ts';
import { AuthService } from '../services/auth.service.ts';
import { User } from '../models/types.ts';

export class UserController {
  /**
   * Get all users (Admin only)
   */
  static async getAll(c: Context) {
    try {
      const users = await DataService.getAll<User>('users');
      
      // Remove sensitive information
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        createdDate: user.createdDate
      }));
      
      return c.json(sanitizedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      return c.json({ error: 'Failed to fetch users' }, 500);
    }
  }

  /**
   * Create new user (Admin only)
   */
  static async create(c: Context) {
    try {
      const userData = await c.req.json() as User;

      // Validate required fields
      const requiredFields = ['name', 'email', 'role'];
      const missingFields = requiredFields.filter(field => !userData[field as keyof User]);
      
      if (missingFields.length > 0) {
        return c.json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        }, 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return c.json({ error: 'Invalid email format' }, 400);
      }

      // Validate role
      const validRoles = ['Admin', 'Pharmacist', 'Accountant'];
      if (!validRoles.includes(userData.role)) {
        return c.json({ 
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
        }, 400);
      }

      // Check for duplicate email
      const existingUsers = await DataService.getAll<User>('users');
      if (existingUsers.some(u => u.email === userData.email)) {
        return c.json({ error: 'A user with this email already exists' }, 409);
      }

      const newUser = await DataService.create<User>('users', {
        ...userData,
        status: userData.status || 'pending',
        createdDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return c.json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        createdDate: newUser.createdDate
      }, 201);
    } catch (error) {
      console.error('Error creating user:', error);
      return c.json({ error: 'Failed to create user' }, 500);
    }
  }

  /**
   * Update user status (Admin only)
   */
  static async updateStatus(c: Context) {
    try {
      const id = c.req.param('id');
      const { status } = await c.req.json();
      
      const validStatuses = ['approved', 'rejected', 'pending', 'suspended'];
      if (!validStatuses.includes(status)) {
        return c.json({ 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        }, 400);
      }

      const users = await DataService.getAll<User>('users');
      const userIndex = users.findIndex((u: User) => u.id === id);
      
      if (userIndex === -1) {
        return c.json({ error: 'User not found' }, 404);
      }

      const updatedUser = await DataService.update<User>('users', id, {
        status,
        updatedAt: new Date().toISOString()
      });
      
      return c.json({
        id: updatedUser?.id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        role: updatedUser?.role,
        status: updatedUser?.status,
        lastLogin: updatedUser?.lastLogin,
        createdDate: updatedUser?.createdDate
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      return c.json({ error: 'Failed to update user status' }, 500);
    }
  }

  /**
   * Remove user (Admin only)
   */
  static async remove(c: Context) {
    try {
      const authUser = c.get('user');
      const id = c.req.param('id');
      
      // Prevent admin from removing themselves
      if (id === authUser.id) {
        return c.json({ error: 'Cannot remove your own account' }, 400);
      }

      const users = await DataService.getAll<User>('users');
      const userToRemove = users.find((u: User) => u.id === id);
      
      if (!userToRemove) {
        return c.json({ error: 'User not found' }, 404);
      }

      // Remove from KV store
      const deleted = await DataService.delete('users', id);
      
      if (!deleted) {
        return c.json({ error: 'Failed to remove user from system' }, 500);
      }

      // Also remove from Supabase Auth
      const authResult = await AuthService.deleteUser(id);
      if (authResult.error) {
        console.warn('User removed from system but auth cleanup failed:', authResult.error);
      }
      
      return c.json({ message: 'User removed successfully' });
    } catch (error) {
      console.error('Error removing user:', error);
      return c.json({ error: 'Failed to remove user' }, 500);
    }
  }

  /**
   * Get user by ID
   */
  static async getById(c: Context) {
    try {
      const id = c.req.param('id');
      const users = await DataService.getAll<User>('users');
      const user = users.find(u => u.id === id);
      
      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }
      
      return c.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        createdDate: user.createdDate
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return c.json({ error: 'Failed to fetch user' }, 500);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(c: Context) {
    try {
      const authUser = c.get('user');
      const id = c.req.param('id');
      const updateData = await c.req.json();

      // Users can only update their own profile, unless they're admin
      if (id !== authUser.id && !AuthService.hasRole(authUser, 'Admin')) {
        return c.json({ error: 'You can only update your own profile' }, 403);
      }

      // Validate allowed fields for profile update
      const allowedFields = ['name'];
      const updateFields = Object.keys(updateData);
      const invalidFields = updateFields.filter(field => !allowedFields.includes(field));
      
      if (invalidFields.length > 0) {
        return c.json({ 
          error: `Invalid fields for profile update: ${invalidFields.join(', ')}` 
        }, 400);
      }

      const updatedUser = await DataService.update<User>('users', id, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      
      if (!updatedUser) {
        return c.json({ error: 'User not found' }, 404);
      }
      
      return c.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        lastLogin: updatedUser.lastLogin,
        createdDate: updatedUser.createdDate
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return c.json({ error: 'Failed to update user profile' }, 500);
    }
  }

  /**
   * Get pending users (Admin only)
   */
  static async getPending(c: Context) {
    try {
      const users = await DataService.getAll<User>('users');
      const pendingUsers = users.filter(user => user.status === 'pending');
      
      const sanitizedUsers = pendingUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdDate: user.createdDate
      }));
      
      return c.json(sanitizedUsers);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      return c.json({ error: 'Failed to fetch pending users' }, 500);
    }
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(c: Context) {
    try {
      const authUser = c.get('user');
      const id = authUser.id;

      const updatedUser = await DataService.update<User>('users', id, {
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      if (!updatedUser) {
        console.warn('Could not update last login for user:', id);
      }
      
      return c.json({ message: 'Last login updated successfully' });
    } catch (error) {
      console.error('Error updating last login:', error);
      return c.json({ error: 'Failed to update last login' }, 500);
    }
  }
}