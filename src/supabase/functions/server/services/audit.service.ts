/**
 * Audit Service - Comprehensive logging and compliance tracking
 * 
 * This service handles all audit logging, activity tracking, and compliance
 * requirements for the pharmacy management system.
 */

import * as kv from '../kv_store.tsx';
import type { 
  AuditLog, 
  ActivityLog, 
  ActivityType, 
  EntityType, 
  AuthUser 
} from '../models/types.ts';

export class AuditService {
  /**
   * Log a system activity
   */
  static async logActivity(
    type: ActivityType,
    description: string,
    entityType: EntityType,
    entityId: string,
    userId?: string,
    userName?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const activity: ActivityLog = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        description,
        entityType,
        entityId,
        userId,
        userName,
        timestamp: new Date().toISOString(),
        metadata
      };

      const activities = await kv.get('activity_logs') || [];
      activities.push(activity);

      // Keep only the last 1000 activities to prevent storage bloat
      if (activities.length > 1000) {
        activities.splice(0, activities.length - 1000);
      }

      await kv.set('activity_logs', activities);
      
      console.log('Activity logged:', {
        type,
        entityType,
        entityId,
        userId,
        description
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error to prevent breaking main operations
    }
  }

  /**
   * Log an audit event with detailed change tracking
   */
  static async logAudit(
    action: string,
    entityType: EntityType,
    entityId: string,
    user: AuthUser,
    changes?: Record<string, { before: any; after: any }>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const auditLog: AuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        entityType,
        entityId,
        userId: user.id,
        userName: user.user_metadata?.name || user.email,
        changes,
        timestamp: new Date().toISOString(),
        ipAddress,
        userAgent
      };

      const auditLogs = await kv.get('audit_logs') || [];
      auditLogs.push(auditLog);

      // Keep only the last 5000 audit logs for compliance
      if (auditLogs.length > 5000) {
        auditLogs.splice(0, auditLogs.length - 5000);
      }

      await kv.set('audit_logs', auditLogs);

      console.log('Audit logged:', {
        action,
        entityType,
        entityId,
        userId: user.id,
        changesCount: changes ? Object.keys(changes).length : 0
      });
    } catch (error) {
      console.error('Error logging audit:', error);
      // Don't throw error to prevent breaking main operations
    }
  }

  /**
   * Get recent activities for dashboard
   */
  static async getRecentActivities(limit: number = 10): Promise<ActivityLog[]> {
    try {
      const activities = await kv.get('activity_logs') || [];
      return activities
        .sort((a: ActivityLog, b: ActivityLog) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  /**
   * Get audit logs for a specific entity
   */
  static async getEntityAuditLogs(
    entityType: EntityType, 
    entityId: string
  ): Promise<AuditLog[]> {
    try {
      const auditLogs = await kv.get('audit_logs') || [];
      return auditLogs
        .filter((log: AuditLog) => 
          log.entityType === entityType && log.entityId === entityId
        )
        .sort((a: AuditLog, b: AuditLog) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    } catch (error) {
      console.error('Error fetching entity audit logs:', error);
      return [];
    }
  }

  /**
   * Log user authentication events
   */
  static async logUserAuth(
    userId: string,
    userName: string,
    action: 'login' | 'logout' | 'failed_login',
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const activityType: ActivityType = action === 'login' ? 'user_login' : 'user_logout';
    const description = action === 'failed_login' 
      ? `Failed login attempt for user: ${userName}`
      : `User ${action}: ${userName}`;

    await this.logActivity(
      activityType,
      description,
      'user',
      userId,
      userId,
      userName,
      { action, ipAddress, userAgent }
    );
  }

  /**
   * Log medicine operations
   */
  static async logMedicineOperation(
    action: 'created' | 'updated' | 'deleted' | 'stock_updated',
    medicineId: string,
    medicineName: string,
    user: AuthUser,
    changes?: Record<string, { before: any; after: any }>
  ): Promise<void> {
    const activityType: ActivityType = action === 'created' ? 'medicine_added' :
                                     action === 'updated' ? 'medicine_updated' :
                                     action === 'deleted' ? 'medicine_deleted' :
                                     'stock_updated';

    const description = `Medicine ${action}: ${medicineName}`;

    await Promise.all([
      this.logActivity(
        activityType,
        description,
        'medicine',
        medicineId,
        user.id,
        user.user_metadata?.name || user.email,
        { medicineName, action }
      ),
      this.logAudit(
        `medicine_${action}`,
        'medicine',
        medicineId,
        user,
        changes
      )
    ]);
  }

  /**
   * Log prescription operations
   */
  static async logPrescriptionOperation(
    action: 'created' | 'updated' | 'cancelled' | 'dispensed',
    prescriptionId: string,
    patientName: string,
    user: AuthUser,
    metadata?: Record<string, any>
  ): Promise<void> {
    const activityType: ActivityType = action === 'created' ? 'prescription_created' : 'prescription_updated';
    const description = `Prescription ${action} for patient: ${patientName}`;

    await Promise.all([
      this.logActivity(
        activityType,
        description,
        'prescription',
        prescriptionId,
        user.id,
        user.user_metadata?.name || user.email,
        { patientName, action, ...metadata }
      ),
      this.logAudit(
        `prescription_${action}`,
        'prescription',
        prescriptionId,
        user,
        undefined // Prescription changes would be complex, handle separately if needed
      )
    ]);
  }

  /**
   * Log sale/payment operations
   */
  static async logSaleOperation(
    action: 'created' | 'completed' | 'cancelled' | 'refunded',
    saleId: string,
    customerName: string,
    amount: number,
    user: AuthUser,
    metadata?: Record<string, any>
  ): Promise<void> {
    const activityType: ActivityType = action === 'completed' ? 'sale_completed' : 'payment_processed';
    const description = `Sale ${action} for customer: ${customerName} (₵${amount.toFixed(2)})`;

    await Promise.all([
      this.logActivity(
        activityType,
        description,
        'sale',
        saleId,
        user.id,
        user.user_metadata?.name || user.email,
        { customerName, amount, action, ...metadata }
      ),
      this.logAudit(
        `sale_${action}`,
        'sale',
        saleId,
        user,
        undefined // Sale changes would be tracked at item level if needed
      )
    ]);
  }

  /**
   * Log patient operations
   */
  static async logPatientOperation(
    action: 'created' | 'updated' | 'deleted',
    patientId: string,
    patientName: string,
    user: AuthUser,
    changes?: Record<string, { before: any; after: any }>
  ): Promise<void> {
    const activityType: ActivityType = action === 'created' ? 'patient_added' : 'patient_updated';
    const description = `Patient ${action}: ${patientName}`;

    await Promise.all([
      this.logActivity(
        activityType,
        description,
        'patient',
        patientId,
        user.id,
        user.user_metadata?.name || user.email,
        { patientName, action }
      ),
      this.logAudit(
        `patient_${action}`,
        'patient',
        patientId,
        user,
        changes
      )
    ]);
  }

  /**
   * Log user management operations
   */
  static async logUserManagement(
    action: 'created' | 'approved' | 'rejected' | 'suspended' | 'deleted',
    targetUserId: string,
    targetUserName: string,
    adminUser: AuthUser,
    metadata?: Record<string, any>
  ): Promise<void> {
    const activityType: ActivityType = action === 'created' ? 'user_created' : 'user_approved';
    const description = `User ${action}: ${targetUserName}`;

    await Promise.all([
      this.logActivity(
        activityType,
        description,
        'user',
        targetUserId,
        adminUser.id,
        adminUser.user_metadata?.name || adminUser.email,
        { targetUserName, action, ...metadata }
      ),
      this.logAudit(
        `user_${action}`,
        'user',
        targetUserId,
        adminUser,
        undefined
      )
    ]);
  }

  /**
   * Generate audit summary for compliance reporting
   */
  static async generateAuditSummary(
    startDate: string,
    endDate: string
  ): Promise<{
    totalAuditEvents: number;
    eventsByType: Record<string, number>;
    userActivity: Record<string, number>;
    criticalEvents: AuditLog[];
  }> {
    try {
      const auditLogs = await kv.get('audit_logs') || [];
      const activities = await kv.get('activity_logs') || [];

      const start = new Date(startDate);
      const end = new Date(endDate);

      const relevantAudits = auditLogs.filter((log: AuditLog) => {
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate <= end;
      });

      const relevantActivities = activities.filter((activity: ActivityLog) => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= start && activityDate <= end;
      });

      // Count events by type
      const eventsByType: Record<string, number> = {};
      relevantAudits.forEach((log: AuditLog) => {
        eventsByType[log.action] = (eventsByType[log.action] || 0) + 1;
      });

      // Count user activity
      const userActivity: Record<string, number> = {};
      relevantActivities.forEach((activity: ActivityLog) => {
        if (activity.userName) {
          userActivity[activity.userName] = (userActivity[activity.userName] || 0) + 1;
        }
      });

      // Identify critical events (admin actions, user management, etc.)
      const criticalEvents = relevantAudits.filter((log: AuditLog) => 
        log.action.includes('user_') || 
        log.action.includes('delete') || 
        log.action.includes('suspend')
      );

      return {
        totalAuditEvents: relevantAudits.length,
        eventsByType,
        userActivity,
        criticalEvents
      };
    } catch (error) {
      console.error('Error generating audit summary:', error);
      throw error;
    }
  }

  /**
   * Clean up old audit logs (for maintenance)
   */
  static async cleanupOldLogs(retentionDays: number = 365): Promise<{
    auditLogsRemoved: number;
    activityLogsRemoved: number;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const auditLogs = await kv.get('audit_logs') || [];
      const activities = await kv.get('activity_logs') || [];

      const filteredAudits = auditLogs.filter((log: AuditLog) => 
        new Date(log.timestamp) > cutoffDate
      );

      const filteredActivities = activities.filter((activity: ActivityLog) => 
        new Date(activity.timestamp) > cutoffDate
      );

      const auditLogsRemoved = auditLogs.length - filteredAudits.length;
      const activityLogsRemoved = activities.length - filteredActivities.length;

      await Promise.all([
        kv.set('audit_logs', filteredAudits),
        kv.set('activity_logs', filteredActivities)
      ]);

      console.log(`Cleanup completed: ${auditLogsRemoved} audit logs and ${activityLogsRemoved} activity logs removed`);

      return {
        auditLogsRemoved,
        activityLogsRemoved
      };
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
      throw error;
    }
  }
}