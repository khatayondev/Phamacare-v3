import { Context } from "npm:hono";
import { DataService } from '../services/data.service.ts';
import { Patient } from '../models/types.ts';

export class PatientController {
  /**
   * Get all patients
   */
  static async getAll(c: Context) {
    try {
      const patients = await DataService.getAll<Patient>('patients');
      return c.json(patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      return c.json({ error: 'Failed to fetch patients' }, 500);
    }
  }

  /**
   * Create new patient
   */
  static async create(c: Context) {
    try {
      const patientData = await c.req.json() as Patient;

      // Validate required fields
      const requiredFields = ['name', 'email', 'phone', 'address', 'dateOfBirth', 'emergencyContact'];
      const missingFields = requiredFields.filter(field => !patientData[field as keyof Patient]);
      
      if (missingFields.length > 0) {
        return c.json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        }, 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(patientData.email)) {
        return c.json({ error: 'Invalid email format' }, 400);
      }

      // Validate phone format (basic validation)
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(patientData.phone.replace(/[\s\-\(\)]/g, ''))) {
        return c.json({ error: 'Invalid phone number format' }, 400);
      }

      // Validate date of birth
      const dobDate = new Date(patientData.dateOfBirth);
      if (isNaN(dobDate.getTime())) {
        return c.json({ error: 'Invalid date of birth format' }, 400);
      }

      if (dobDate >= new Date()) {
        return c.json({ error: 'Date of birth must be in the past' }, 400);
      }

      // Check for duplicate email
      const existingPatients = await DataService.getAll<Patient>('patients');
      if (existingPatients.some(p => p.email === patientData.email)) {
        return c.json({ error: 'A patient with this email already exists' }, 409);
      }

      const newPatient = await DataService.create<Patient>('patients', {
        ...patientData,
        lastVisit: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return c.json(newPatient, 201);
    } catch (error) {
      console.error('Error creating patient:', error);
      return c.json({ error: 'Failed to create patient' }, 500);
    }
  }

  /**
   * Update patient
   */
  static async update(c: Context) {
    try {
      const id = c.req.param('id');
      const updateData = await c.req.json() as Partial<Patient>;

      // Validate email format if provided
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          return c.json({ error: 'Invalid email format' }, 400);
        }

        // Check for duplicate email (excluding current patient)
        const existingPatients = await DataService.getAll<Patient>('patients');
        const duplicateEmail = existingPatients.find(p => p.email === updateData.email && p.id !== id);
        if (duplicateEmail) {
          return c.json({ error: 'A patient with this email already exists' }, 409);
        }
      }

      // Validate phone format if provided
      if (updateData.phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(updateData.phone.replace(/[\s\-\(\)]/g, ''))) {
          return c.json({ error: 'Invalid phone number format' }, 400);
        }
      }

      // Validate date of birth if provided
      if (updateData.dateOfBirth) {
        const dobDate = new Date(updateData.dateOfBirth);
        if (isNaN(dobDate.getTime())) {
          return c.json({ error: 'Invalid date of birth format' }, 400);
        }

        if (dobDate >= new Date()) {
          return c.json({ error: 'Date of birth must be in the past' }, 400);
        }
      }

      const updatedPatient = await DataService.update<Patient>('patients', id, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      
      if (!updatedPatient) {
        return c.json({ error: 'Patient not found' }, 404);
      }
      
      return c.json(updatedPatient);
    } catch (error) {
      console.error('Error updating patient:', error);
      return c.json({ error: 'Failed to update patient' }, 500);
    }
  }

  /**
   * Delete patient
   */
  static async delete(c: Context) {
    try {
      const id = c.req.param('id');
      
      const deleted = await DataService.delete('patients', id);
      
      if (!deleted) {
        return c.json({ error: 'Patient not found' }, 404);
      }
      
      return c.json({ message: 'Patient deleted successfully' });
    } catch (error) {
      console.error('Error deleting patient:', error);
      return c.json({ error: 'Failed to delete patient' }, 500);
    }
  }

  /**
   * Get patient by ID
   */
  static async getById(c: Context) {
    try {
      const id = c.req.param('id');
      const patients = await DataService.getAll<Patient>('patients');
      const patient = patients.find(p => p.id === id);
      
      if (!patient) {
        return c.json({ error: 'Patient not found' }, 404);
      }
      
      return c.json(patient);
    } catch (error) {
      console.error('Error fetching patient:', error);
      return c.json({ error: 'Failed to fetch patient' }, 500);
    }
  }

  /**
   * Search patients
   */
  static async search(c: Context) {
    try {
      const query = c.req.query('q')?.toLowerCase();
      
      if (!query || query.length < 2) {
        return c.json({ error: 'Search query must be at least 2 characters long' }, 400);
      }

      const patients = await DataService.getAll<Patient>('patients');
      const filteredPatients = patients.filter(patient => 
        patient.name.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.phone.includes(query)
      );
      
      return c.json(filteredPatients);
    } catch (error) {
      console.error('Error searching patients:', error);
      return c.json({ error: 'Failed to search patients' }, 500);
    }
  }

  /**
   * Update patient's last visit
   */
  static async updateLastVisit(c: Context) {
    try {
      const id = c.req.param('id');
      
      const updatedPatient = await DataService.update<Patient>('patients', id, {
        lastVisit: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      });
      
      if (!updatedPatient) {
        return c.json({ error: 'Patient not found' }, 404);
      }
      
      return c.json({ 
        message: 'Last visit updated successfully',
        patient: updatedPatient 
      });
    } catch (error) {
      console.error('Error updating last visit:', error);
      return c.json({ error: 'Failed to update last visit' }, 500);
    }
  }
}