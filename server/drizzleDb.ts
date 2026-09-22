import { eq, desc } from 'drizzle-orm';
import { getDrizzleDb } from './postgres';
import * as schema from '../src/db/schema';
import { db as fallbackDb } from './db';
import crypto from 'crypto';
import type {
  Organization,
  User,
  Customer,
  Technician,
  Job,
  Estimate,
  Invoice,
  Payment,
  ProductInventory,
  Warehouse,
  InventoryTransaction,
  CustomForm,
  FormSubmission,
  AppNotification,
  AuditLog
} from '../src/types';

export class DrizzleDataService {
  // ----------------------------------------------------
  // Audit Logs
  // ----------------------------------------------------
  async logAudit(
    orgId: string,
    userId: string,
    userName: string,
    action: string,
    entity: string,
    entityId: string,
    previousValue?: string,
    newValue?: string
  ): Promise<AuditLog> {
    const id = 'log-' + crypto.randomUUID().slice(0, 8);
    const now = new Date();
    const log: AuditLog = {
      id,
      orgId,
      userId,
      userName,
      action,
      entity,
      entityId,
      previousValue,
      newValue,
      timestamp: now.toISOString(),
    };

    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        await drizzle.insert(schema.auditLogs).values({
          id,
          orgId,
          userId,
          userName,
          action,
          entity,
          entityId,
          previousValue: previousValue || null,
          newValue: newValue || null,
          createdAt: now,
        });
      } catch (err) {
        console.warn('[Drizzle] Error inserting audit log:', err);
      }
    }

    fallbackDb.logAudit(orgId, userId, userName, action, entity, entityId, previousValue, newValue);
    return log;
  }

  async getAuditLogs(orgId: string): Promise<AuditLog[]> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle
          .select()
          .from(schema.auditLogs)
          .where(eq(schema.auditLogs.orgId, orgId))
          .orderBy(desc(schema.auditLogs.createdAt));
        if (rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            orgId: r.orgId,
            userId: r.userId,
            userName: r.userName,
            action: r.action,
            entity: r.entity,
            entityId: r.entityId,
            previousValue: r.previousValue || undefined,
            newValue: r.newValue || undefined,
            timestamp: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting audit logs:', err);
      }
    }
    return fallbackDb.getAuditLogs(orgId);
  }

  // ----------------------------------------------------
  // Notifications
  // ----------------------------------------------------
  async createNotification(
    orgId: string,
    title: string,
    message: string,
    type: AppNotification['type'],
    channel: AppNotification['channel'] = 'in_app',
    link?: string,
    userId?: string
  ): Promise<AppNotification> {
    const id = 'notif-' + crypto.randomUUID().slice(0, 8);
    const now = new Date();
    const notif: AppNotification = {
      id,
      orgId,
      userId,
      title,
      message,
      type,
      channel,
      read: false,
      link,
      createdAt: now.toISOString(),
    };

    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        await drizzle.insert(schema.notifications).values({
          id,
          orgId,
          userId: userId || 'broadcast',
          type,
          title,
          message,
          read: false,
          link: link || null,
          createdAt: now,
        });
      } catch (err) {
        console.warn('[Drizzle] Error inserting notification:', err);
      }
    }

    fallbackDb.createNotification(orgId, title, message, type, channel, link, userId);
    return notif;
  }

  async getNotifications(orgId: string, userId?: string): Promise<AppNotification[]> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle
          .select()
          .from(schema.notifications)
          .where(eq(schema.notifications.orgId, orgId))
          .orderBy(desc(schema.notifications.createdAt));
        if (rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            orgId: r.orgId,
            userId: r.userId,
            title: r.title,
            message: r.message,
            type: r.type as any,
            channel: 'in_app',
            read: r.read,
            link: r.link || undefined,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting notifications:', err);
      }
    }
    return fallbackDb.getNotifications(orgId);
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        await drizzle.update(schema.notifications).set({ read: true }).where(eq(schema.notifications.id, id));
      } catch (err) {
        console.warn('[Drizzle] Error marking notification read:', err);
      }
    }
    return fallbackDb.markNotificationRead(id);
  }

  // ----------------------------------------------------
  // Organizations
  // ----------------------------------------------------
  async getOrganizations(): Promise<Organization[]> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle.select().from(schema.organizations);
        if (rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            phone: r.phone,
            email: r.email,
            address: r.address,
            county: r.county,
            country: r.country,
            currency: r.currency as any,
            taxRate: r.taxRate,
            eTimsEnabled: r.eTimsEnabled,
            mpesaPaybill: r.mpesaPaybill || undefined,
            mpesaTill: r.mpesaTill || undefined,
            logo: r.logo || undefined,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting organizations:', err);
      }
    }
    return fallbackDb.getOrganizations();
  }

  async getOrganizationById(id: string): Promise<Organization | undefined> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle.select().from(schema.organizations).where(eq(schema.organizations.id, id));
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            name: r.name,
            slug: r.slug,
            phone: r.phone,
            email: r.email,
            address: r.address,
            county: r.county,
            country: r.country,
            currency: r.currency as any,
            taxRate: r.taxRate,
            eTimsEnabled: r.eTimsEnabled,
            mpesaPaybill: r.mpesaPaybill || undefined,
            mpesaTill: r.mpesaTill || undefined,
            logo: r.logo || undefined,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting organization by ID:', err);
      }
    }
    return fallbackDb.getOrganizationById(id);
  }

  async createOrganization(org: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> {
    const id = 'org-' + crypto.randomUUID().slice(0, 8);
    const now = new Date();
    const newOrg: Organization = {
      ...org,
      id,
      createdAt: now.toISOString(),
    };

    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        await drizzle.insert(schema.organizations).values({
          id,
          name: org.name,
          slug: org.slug,
          phone: org.phone,
          email: org.email,
          address: org.address,
          county: org.county,
          country: org.country,
          currency: org.currency,
          taxRate: org.taxRate,
          eTimsEnabled: org.eTimsEnabled,
          mpesaPaybill: org.mpesaPaybill || null,
          mpesaTill: org.mpesaTill || null,
          logo: org.logo || null,
          createdAt: now,
        });
      } catch (err) {
        console.warn('[Drizzle] Error inserting organization:', err);
      }
    }

    fallbackDb.createOrganization(org);
    return newOrg;
  }

  // ----------------------------------------------------
  // Users
  // ----------------------------------------------------
  async getUsers(orgId: string): Promise<User[]> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle.select().from(schema.users).where(eq(schema.users.orgId, orgId));
        if (rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            orgId: r.orgId,
            name: r.name,
            email: r.email,
            phone: r.phone,
            role: r.role as any,
            avatar: r.avatar || undefined,
            status: r.status as any,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting users:', err);
      }
    }
    return fallbackDb.getUsers(orgId);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle.select().from(schema.users).where(eq(schema.users.id, id));
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            orgId: r.orgId,
            name: r.name,
            email: r.email,
            phone: r.phone,
            role: r.role as any,
            avatar: r.avatar || undefined,
            status: r.status as any,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting user by ID:', err);
      }
    }
    return fallbackDb.getUserById(id);
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const id = 'usr-' + crypto.randomUUID().slice(0, 8);
    const now = new Date();
    const newUser: User = {
      ...user,
      id,
      createdAt: now.toISOString(),
    };

    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        await drizzle.insert(schema.users).values({
          id,
          orgId: user.orgId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar || null,
          status: user.status || 'active',
          createdAt: now,
        });
      } catch (err) {
        console.warn('[Drizzle] Error inserting user:', err);
      }
    }

    fallbackDb.createUser(user);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const toSet: any = {};
        if (updates.name !== undefined) toSet.name = updates.name;
        if (updates.email !== undefined) toSet.email = updates.email;
        if (updates.phone !== undefined) toSet.phone = updates.phone;
        if (updates.role !== undefined) toSet.role = updates.role;
        if (updates.status !== undefined) toSet.status = updates.status;
        if (updates.avatar !== undefined) toSet.avatar = updates.avatar;

        if (Object.keys(toSet).length > 0) {
          await drizzle.update(schema.users).set(toSet).where(eq(schema.users.id, id));
        }
      } catch (err) {
        console.warn('[Drizzle] Error updating user:', err);
      }
    }
    return fallbackDb.updateUser(id, updates);
  }

  // ----------------------------------------------------
  // Customers
  // ----------------------------------------------------
  async getCustomers(orgId: string): Promise<Customer[]> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle
          .select()
          .from(schema.customers)
          .where(eq(schema.customers.orgId, orgId))
          .orderBy(desc(schema.customers.createdAt));
        if (rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            orgId: r.orgId,
            type: r.type as any,
            name: r.name,
            companyName: r.companyName || undefined,
            phone: r.phone,
            email: r.email,
            address: r.address,
            county: r.county,
            area: r.area,
            latitude: r.latitude,
            longitude: r.longitude,
            notes: r.notes || '',
            tags: r.tags || [],
            serviceLocations: r.serviceLocations || [],
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting customers:', err);
      }
    }
    return fallbackDb.getCustomers(orgId);
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle.select().from(schema.customers).where(eq(schema.customers.id, id));
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            orgId: r.orgId,
            type: r.type as any,
            name: r.name,
            companyName: r.companyName || undefined,
            phone: r.phone,
            email: r.email,
            address: r.address,
            county: r.county,
            area: r.area,
            latitude: r.latitude,
            longitude: r.longitude,
            notes: r.notes || '',
            tags: r.tags || [],
            serviceLocations: r.serviceLocations || [],
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting customer by ID:', err);
      }
    }
    return fallbackDb.getCustomerById(id);
  }

  async createCustomer(
    cust: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
    actorName = 'Admin'
  ): Promise<Customer> {
    const id = 'cust-' + crypto.randomUUID().slice(0, 8);
    const now = new Date();
    const newCust: Customer = {
      ...cust,
      id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        await drizzle.insert(schema.customers).values({
          id,
          orgId: cust.orgId,
          type: cust.type,
          name: cust.name,
          companyName: cust.companyName || null,
          phone: cust.phone,
          email: cust.email,
          address: cust.address,
          county: cust.county,
          area: cust.area,
          latitude: cust.latitude,
          longitude: cust.longitude,
          notes: cust.notes || '',
          tags: cust.tags || [],
          serviceLocations: cust.serviceLocations || [],
          createdAt: now,
          updatedAt: now,
        });
        await this.logAudit(cust.orgId, 'sys', actorName, 'CUSTOMER_CREATED', 'Customer', id, '', cust.name);
      } catch (err) {
        console.warn('[Drizzle] Error inserting customer:', err);
      }
    }

    fallbackDb.createCustomer(cust, actorName);
    return newCust;
  }

  async updateCustomer(
    id: string,
    updates: Partial<Customer>,
    actorName = 'Admin'
  ): Promise<Customer | null> {
    const drizzle = getDrizzleDb();
    const existing = await this.getCustomerById(id);
    if (!existing) return null;

    const now = new Date();
    if (drizzle) {
      try {
        const toSet: any = { updatedAt: now };
        if (updates.name !== undefined) toSet.name = updates.name;
        if (updates.companyName !== undefined) toSet.companyName = updates.companyName;
        if (updates.phone !== undefined) toSet.phone = updates.phone;
        if (updates.email !== undefined) toSet.email = updates.email;
        if (updates.address !== undefined) toSet.address = updates.address;
        if (updates.county !== undefined) toSet.county = updates.county;
        if (updates.area !== undefined) toSet.area = updates.area;
        if (updates.latitude !== undefined) toSet.latitude = updates.latitude;
        if (updates.longitude !== undefined) toSet.longitude = updates.longitude;
        if (updates.notes !== undefined) toSet.notes = updates.notes;
        if (updates.tags !== undefined) toSet.tags = updates.tags;
        if (updates.serviceLocations !== undefined) toSet.serviceLocations = updates.serviceLocations;

        await drizzle.update(schema.customers).set(toSet).where(eq(schema.customers.id, id));
        await this.logAudit(existing.orgId, 'sys', actorName, 'CUSTOMER_UPDATED', 'Customer', id, existing.name, updates.name || existing.name);
      } catch (err) {
        console.warn('[Drizzle] Error updating customer:', err);
      }
    }

    return fallbackDb.updateCustomer(id, updates, actorName);
  }

  async deleteCustomer(id: string, actorName = 'Admin'): Promise<boolean> {
    const drizzle = getDrizzleDb();
    const existing = await this.getCustomerById(id);
    if (drizzle && existing) {
      try {
        await drizzle.delete(schema.customers).where(eq(schema.customers.id, id));
        await this.logAudit(existing.orgId, 'sys', actorName, 'CUSTOMER_DELETED', 'Customer', id, existing.name, '');
      } catch (err) {
        console.warn('[Drizzle] Error deleting customer:', err);
      }
    }
    return fallbackDb.deleteCustomer(id, actorName);
  }

  // ----------------------------------------------------
  // Technicians
  // ----------------------------------------------------
  async getTechnicians(orgId: string): Promise<Technician[]> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle.select().from(schema.technicians).where(eq(schema.technicians.orgId, orgId));
        if (rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            orgId: r.orgId,
            userId: r.userId,
            name: r.name,
            phone: r.phone,
            email: r.email,
            specialization: r.specialization,
            vehicleReg: r.vehicleReg,
            activeStatus: r.activeStatus as any,
            currentLat: r.currentLat,
            currentLng: r.currentLng,
            currentLatitude: r.currentLatitude || r.currentLat,
            currentLongitude: r.currentLongitude || r.currentLng,
            lastLocationUpdate: r.lastLocationUpdate,
            rating: r.rating,
            completedJobsCount: r.completedJobsCount || 0,
            skills: r.skills || [],
            avatar: r.avatar || undefined,
          }));
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting technicians:', err);
      }
    }
    return fallbackDb.getTechnicians(orgId);
  }

  async getTechnicianById(id: string): Promise<Technician | undefined> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle.select().from(schema.technicians).where(eq(schema.technicians.id, id));
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            orgId: r.orgId,
            userId: r.userId,
            name: r.name,
            phone: r.phone,
            email: r.email,
            specialization: r.specialization,
            vehicleReg: r.vehicleReg,
            activeStatus: r.activeStatus as any,
            currentLat: r.currentLat,
            currentLng: r.currentLng,
            currentLatitude: r.currentLatitude || r.currentLat,
            currentLongitude: r.currentLongitude || r.currentLng,
            lastLocationUpdate: r.lastLocationUpdate,
            rating: r.rating,
            completedJobsCount: r.completedJobsCount || 0,
            skills: r.skills || [],
            avatar: r.avatar || undefined,
          };
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting technician by ID:', err);
      }
    }
    return fallbackDb.getTechnicianById(id);
  }

  async createTechnician(
    tech: Omit<Technician, 'id' | 'lastLocationUpdate'>,
    actorName = 'Admin'
  ): Promise<Technician> {
    const id = 'tech-' + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();
    const newTech: Technician = {
      ...tech,
      id,
      lastLocationUpdate: now,
    };

    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        await drizzle.insert(schema.technicians).values({
          id,
          orgId: tech.orgId,
          userId: tech.userId,
          name: tech.name,
          phone: tech.phone,
          email: tech.email,
          specialization: tech.specialization,
          vehicleReg: tech.vehicleReg,
          activeStatus: tech.activeStatus || 'available',
          currentLat: tech.currentLat,
          currentLng: tech.currentLng,
          currentLatitude: tech.currentLatitude || tech.currentLat,
          currentLongitude: tech.currentLongitude || tech.currentLng,
          lastLocationUpdate: now,
          rating: tech.rating || 5.0,
          completedJobsCount: tech.completedJobsCount || 0,
          skills: tech.skills || [],
          avatar: tech.avatar || null,
        });
        await this.logAudit(tech.orgId, 'sys', actorName, 'TECHNICIAN_CREATED', 'Technician', id, '', tech.name);
      } catch (err) {
        console.warn('[Drizzle] Error inserting technician:', err);
      }
    }

    fallbackDb.createTechnician(tech, actorName);
    return newTech;
  }

  async updateTechnician(
    id: string,
    updates: Partial<Technician>,
    actorName = 'System'
  ): Promise<Technician | null> {
    const drizzle = getDrizzleDb();
    const tech = await this.getTechnicianById(id);
    if (!tech) return null;

    if (drizzle) {
      try {
        const toSet: any = {};
        if (updates.name !== undefined) toSet.name = updates.name;
        if (updates.phone !== undefined) toSet.phone = updates.phone;
        if (updates.email !== undefined) toSet.email = updates.email;
        if (updates.specialization !== undefined) toSet.specialization = updates.specialization;
        if (updates.vehicleReg !== undefined) toSet.vehicleReg = updates.vehicleReg;
        if (updates.activeStatus !== undefined) toSet.activeStatus = updates.activeStatus;
        if (updates.avatar !== undefined) toSet.avatar = updates.avatar;
        if (updates.currentLat !== undefined) toSet.currentLat = updates.currentLat;
        if (updates.currentLng !== undefined) toSet.currentLng = updates.currentLng;
        if (updates.rating !== undefined) toSet.rating = updates.rating;

        if (Object.keys(toSet).length > 0) {
          await drizzle.update(schema.technicians).set(toSet).where(eq(schema.technicians.id, id));
          await this.logAudit(tech.orgId, tech.userId, actorName, 'TECHNICIAN_UPDATED', 'Technician', id, tech.name, updates.name || tech.name);
        }
      } catch (err) {
        console.warn('[Drizzle] Error updating technician in DB:', err);
      }
    }

    return fallbackDb.updateTechnician(id, updates, actorName);
  }

  async updateTechnicianStatus(
    id: string,
    status: Technician['activeStatus'],
    lat?: number,
    lng?: number,
    actorName = 'System'
  ): Promise<Technician | null> {
    const drizzle = getDrizzleDb();
    const tech = await this.getTechnicianById(id);
    if (!tech) return null;

    const prev = tech.activeStatus;
    const now = new Date().toISOString();

    if (drizzle) {
      try {
        const toSet: any = {
          activeStatus: status,
          lastLocationUpdate: now,
        };
        if (lat !== undefined && lng !== undefined) {
          toSet.currentLat = lat;
          toSet.currentLng = lng;
          toSet.currentLatitude = lat;
          toSet.currentLongitude = lng;
        }
        await drizzle.update(schema.technicians).set(toSet).where(eq(schema.technicians.id, id));
        await this.logAudit(tech.orgId, tech.userId, actorName, 'TECHNICIAN_STATUS_UPDATE', 'Technician', id, prev, status);
      } catch (err) {
        console.warn('[Drizzle] Error updating technician status:', err);
      }
    }

    return fallbackDb.updateTechnicianStatus(id, status, lat, lng, actorName);
  }

  // ----------------------------------------------------
  // Jobs
  // ----------------------------------------------------
  async getJobs(orgId: string): Promise<Job[]> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle
          .select()
          .from(schema.jobs)
          .where(eq(schema.jobs.orgId, orgId))
          .orderBy(desc(schema.jobs.createdAt));
        if (rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            orgId: r.orgId,
            jobNumber: r.jobNumber,
            customerId: r.customerId,
            serviceLocationId: r.serviceLocationId || undefined,
            title: r.title,
            description: r.description,
            priority: r.priority as any,
            status: r.status as any,
            assignedTechnicianIds: r.assignedTechnicianIds || [],
            scheduledDate: r.scheduledDate,
            startTime: r.startTime,
            endTime: r.endTime,
            estimatedDurationMin: r.estimatedDurationMin || 60,
            estimatedDurationMinutes: r.estimatedDurationMinutes || r.estimatedDurationMin || 60,
            actualDurationMin: r.actualDurationMin || undefined,
            labour: r.labour || [],
            materials: r.materials || [],
            expenses: r.expenses || [],
            internalNotes: r.internalNotes || undefined,
            customerNotes: r.customerNotes || undefined,
            photos: r.photos || [],
            documents: r.documents || [],
            customerSignature: r.customerSignature || undefined,
            checklist: r.checklist || [],
            completionNotes: r.completionNotes || undefined,
            travelStartTime: r.travelStartTime || undefined,
            checkInTime: r.checkInTime || undefined,
            checkOutTime: r.checkOutTime || undefined,
            checkInLat: r.checkInLat || undefined,
            checkInLng: r.checkInLng || undefined,
            invoiceId: r.invoiceId || undefined,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting jobs:', err);
      }
    }
    return fallbackDb.getJobs(orgId);
  }

  async getJobById(id: string): Promise<Job | undefined> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle.select().from(schema.jobs).where(eq(schema.jobs.id, id));
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            orgId: r.orgId,
            jobNumber: r.jobNumber,
            customerId: r.customerId,
            serviceLocationId: r.serviceLocationId || undefined,
            title: r.title,
            description: r.description,
            priority: r.priority as any,
            status: r.status as any,
            assignedTechnicianIds: r.assignedTechnicianIds || [],
            scheduledDate: r.scheduledDate,
            startTime: r.startTime,
            endTime: r.endTime,
            estimatedDurationMin: r.estimatedDurationMin || 60,
            estimatedDurationMinutes: r.estimatedDurationMinutes || r.estimatedDurationMin || 60,
            actualDurationMin: r.actualDurationMin || undefined,
            labour: r.labour || [],
            materials: r.materials || [],
            expenses: r.expenses || [],
            internalNotes: r.internalNotes || undefined,
            customerNotes: r.customerNotes || undefined,
            photos: r.photos || [],
            documents: r.documents || [],
            customerSignature: r.customerSignature || undefined,
            checklist: r.checklist || [],
            completionNotes: r.completionNotes || undefined,
            travelStartTime: r.travelStartTime || undefined,
            checkInTime: r.checkInTime || undefined,
            checkOutTime: r.checkOutTime || undefined,
            checkInLat: r.checkInLat || undefined,
            checkInLng: r.checkInLng || undefined,
            invoiceId: r.invoiceId || undefined,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting job by ID:', err);
      }
    }
    return fallbackDb.getJobById(id);
  }

  async createJob(
    jobData: Omit<Job, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt'>,
    actorName = 'Dispatcher'
  ): Promise<Job> {
    const id = 'job-' + crypto.randomUUID().slice(0, 8);
    const now = new Date();
    const existing = await this.getJobs(jobData.orgId);
    const count = existing.length + 1;
    const year = now.getFullYear();
    const jobNumber = `JOB-${year}-${String(count).padStart(4, '0')}`;

    const newJob: Job = {
      ...jobData,
      id,
      jobNumber,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        await drizzle.insert(schema.jobs).values({
          id,
          orgId: jobData.orgId,
          jobNumber,
          customerId: jobData.customerId,
          serviceLocationId: jobData.serviceLocationId || null,
          title: jobData.title,
          description: jobData.description,
          priority: jobData.priority || 'medium',
          status: jobData.status || 'new',
          assignedTechnicianIds: jobData.assignedTechnicianIds || [],
          scheduledDate: jobData.scheduledDate,
          startTime: jobData.startTime,
          endTime: jobData.endTime,
          estimatedDurationMin: jobData.estimatedDurationMin || 60,
          estimatedDurationMinutes: jobData.estimatedDurationMinutes || jobData.estimatedDurationMin || 60,
          labour: jobData.labour || [],
          materials: jobData.materials || [],
          expenses: jobData.expenses || [],
          internalNotes: jobData.internalNotes || null,
          customerNotes: jobData.customerNotes || null,
          photos: jobData.photos || [],
          documents: jobData.documents || [],
          checklist: jobData.checklist || [],
          createdAt: now,
          updatedAt: now,
        });

        await this.logAudit(jobData.orgId, 'sys', actorName, 'JOB_CREATED', 'Job', id, '', jobNumber);
        await this.createNotification(
          jobData.orgId,
          `New Job Created: ${jobNumber}`,
          `${newJob.title} scheduled for ${newJob.scheduledDate}`,
          'appointment',
          'in_app',
          'jobs'
        );
      } catch (err) {
        console.warn('[Drizzle] Error inserting job:', err);
      }
    }

    fallbackDb.createJob(jobData, actorName);
    return newJob;
  }

  async updateJob(id: string, updates: Partial<Job>, actorName = 'User'): Promise<Job | null> {
    const drizzle = getDrizzleDb();
    const current = await this.getJobById(id);
    if (!current) return null;

    const prevStatus = current.status;
    const newStatus = updates.status;
    const now = new Date();

    if (drizzle) {
      try {
        const toSet: any = { updatedAt: now };
        if (updates.title !== undefined) toSet.title = updates.title;
        if (updates.description !== undefined) toSet.description = updates.description;
        if (updates.priority !== undefined) toSet.priority = updates.priority;
        if (updates.status !== undefined) toSet.status = updates.status;
        if (updates.assignedTechnicianIds !== undefined) toSet.assignedTechnicianIds = updates.assignedTechnicianIds;
        if (updates.scheduledDate !== undefined) toSet.scheduledDate = updates.scheduledDate;
        if (updates.startTime !== undefined) toSet.startTime = updates.startTime;
        if (updates.endTime !== undefined) toSet.endTime = updates.endTime;
        if (updates.labour !== undefined) toSet.labour = updates.labour;
        if (updates.materials !== undefined) toSet.materials = updates.materials;
        if (updates.expenses !== undefined) toSet.expenses = updates.expenses;
        if (updates.photos !== undefined) toSet.photos = updates.photos;
        if (updates.documents !== undefined) toSet.documents = updates.documents;
        if (updates.checklist !== undefined) toSet.checklist = updates.checklist;
        if (updates.customerSignature !== undefined) toSet.customerSignature = updates.customerSignature;
        if (updates.completionNotes !== undefined) toSet.completionNotes = updates.completionNotes;
        if (updates.checkInTime !== undefined) toSet.checkInTime = updates.checkInTime;
        if (updates.checkOutTime !== undefined) toSet.checkOutTime = updates.checkOutTime;
        if (updates.checkInLat !== undefined) toSet.checkInLat = updates.checkInLat;
        if (updates.checkInLng !== undefined) toSet.checkInLng = updates.checkInLng;
        if (updates.travelStartTime !== undefined) toSet.travelStartTime = updates.travelStartTime;
        if (updates.invoiceId !== undefined) toSet.invoiceId = updates.invoiceId;

        await drizzle.update(schema.jobs).set(toSet).where(eq(schema.jobs.id, id));

        if (newStatus && newStatus !== prevStatus) {
          await this.logAudit(current.orgId, 'sys', actorName, 'JOB_STATUS_CHANGED', 'Job', id, prevStatus, newStatus);
          await this.createNotification(
            current.orgId,
            `Job ${current.jobNumber} status: ${newStatus.replace('_', ' ').toUpperCase()}`,
            `Updated by ${actorName}`,
            'status',
            'in_app',
            'jobs'
          );
        }
      } catch (err) {
        console.warn('[Drizzle] Error updating job:', err);
      }
    }

    return fallbackDb.updateJob(id, updates, actorName);
  }

  // ----------------------------------------------------
  // Estimates
  // ----------------------------------------------------
  async getEstimates(orgId: string): Promise<Estimate[]> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle
          .select()
          .from(schema.estimates)
          .where(eq(schema.estimates.orgId, orgId))
          .orderBy(desc(schema.estimates.createdAt));
        if (rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            orgId: r.orgId,
            estimateNumber: r.estimateNumber,
            customerId: r.customerId,
            title: r.title || undefined,
            status: r.status as any,
            date: r.date || undefined,
            expiryDate: r.expiryDate,
            items: r.items || [],
            subtotal: r.subtotal,
            discountTotal: r.discountTotal || undefined,
            taxRate: r.taxRate || undefined,
            taxAmount: r.taxAmount,
            totalAmount: r.totalAmount,
            notes: r.notes || '',
            terms: r.terms || undefined,
            customerNotes: r.customerNotes || undefined,
            approvedAt: r.approvedAt || undefined,
            convertedJobId: r.convertedJobId || undefined,
            convertedInvoiceId: r.convertedInvoiceId || undefined,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting estimates:', err);
      }
    }
    return fallbackDb.getEstimates(orgId);
  }

  async getEstimateById(id: string): Promise<Estimate | undefined> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle.select().from(schema.estimates).where(eq(schema.estimates.id, id));
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            orgId: r.orgId,
            estimateNumber: r.estimateNumber,
            customerId: r.customerId,
            title: r.title || undefined,
            status: r.status as any,
            date: r.date || undefined,
            expiryDate: r.expiryDate,
            items: r.items || [],
            subtotal: r.subtotal,
            discountTotal: r.discountTotal || undefined,
            taxRate: r.taxRate || undefined,
            taxAmount: r.taxAmount,
            totalAmount: r.totalAmount,
            notes: r.notes || '',
            terms: r.terms || undefined,
            customerNotes: r.customerNotes || undefined,
            approvedAt: r.approvedAt || undefined,
            convertedJobId: r.convertedJobId || undefined,
            convertedInvoiceId: r.convertedInvoiceId || undefined,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting estimate by ID:', err);
      }
    }
    return fallbackDb.getEstimateById(id);
  }

  async createEstimate(
    estData: Omit<Estimate, 'id' | 'estimateNumber' | 'createdAt'>,
    actorName = 'Sales'
  ): Promise<Estimate> {
    const id = 'est-' + crypto.randomUUID().slice(0, 8);
    const now = new Date();
    const existing = await this.getEstimates(estData.orgId);
    const count = existing.length + 1;
    const year = now.getFullYear();
    const estimateNumber = `EST-${year}-${String(count).padStart(4, '0')}`;

    const newEst: Estimate = {
      ...estData,
      id,
      estimateNumber,
      createdAt: now.toISOString(),
    };

    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        await drizzle.insert(schema.estimates).values({
          id,
          orgId: estData.orgId,
          estimateNumber,
          customerId: estData.customerId,
          title: estData.title || null,
          status: estData.status || 'draft',
          date: estData.date || null,
          expiryDate: estData.expiryDate,
          items: estData.items || [],
          subtotal: estData.subtotal,
          discountTotal: estData.discountTotal || null,
          taxRate: estData.taxRate || null,
          taxAmount: estData.taxAmount,
          totalAmount: estData.totalAmount,
          notes: estData.notes || '',
          terms: estData.terms || null,
          customerNotes: estData.customerNotes || null,
          createdAt: now,
        });

        await this.logAudit(estData.orgId, 'sys', actorName, 'ESTIMATE_CREATED', 'Estimate', id, '', estimateNumber);
      } catch (err) {
        console.warn('[Drizzle] Error inserting estimate:', err);
      }
    }

    fallbackDb.createEstimate(estData, actorName);
    return newEst;
  }

  async updateEstimate(
    id: string,
    updates: Partial<Estimate>,
    actorName = 'Sales'
  ): Promise<Estimate | null> {
    const drizzle = getDrizzleDb();
    const existing = await this.getEstimateById(id);
    if (!existing) return null;

    if (drizzle) {
      try {
        const toSet: any = {};
        if (updates.status !== undefined) toSet.status = updates.status;
        if (updates.items !== undefined) toSet.items = updates.items;
        if (updates.subtotal !== undefined) toSet.subtotal = updates.subtotal;
        if (updates.taxAmount !== undefined) toSet.taxAmount = updates.taxAmount;
        if (updates.totalAmount !== undefined) toSet.totalAmount = updates.totalAmount;
        if (updates.notes !== undefined) toSet.notes = updates.notes;
        if (updates.approvedAt !== undefined) toSet.approvedAt = updates.approvedAt;
        if (updates.convertedJobId !== undefined) toSet.convertedJobId = updates.convertedJobId;
        if (updates.convertedInvoiceId !== undefined) toSet.convertedInvoiceId = updates.convertedInvoiceId;

        if (Object.keys(toSet).length > 0) {
          await drizzle.update(schema.estimates).set(toSet).where(eq(schema.estimates.id, id));
        }
      } catch (err) {
        console.warn('[Drizzle] Error updating estimate:', err);
      }
    }

    return fallbackDb.updateEstimate(id, updates, actorName);
  }

  async convertEstimateToJob(estimateId: string, actorName = 'Dispatcher'): Promise<Job | null> {
    const est = await this.getEstimateById(estimateId);
    if (!est) return null;

    const labour = est.items
      .filter(i => i.type === 'labour' || i.type === 'service')
      .map(i => ({
        id: 'lab-' + crypto.randomUUID().slice(0, 6),
        description: i.description,
        hours: i.quantity,
        hourlyRate: i.unitPrice,
        total: i.total,
      }));

    const materials = est.items
      .filter(i => i.type === 'product' || i.type === 'material')
      .map(i => ({
        id: 'mat-' + crypto.randomUUID().slice(0, 6),
        name: i.description,
        quantity: i.quantity,
        unitCost: i.unitPrice * 0.6,
        unitPrice: i.unitPrice,
        total: i.total,
      }));

    const job = await this.createJob(
      {
        orgId: est.orgId,
        customerId: est.customerId,
        title: est.title || `Work Order from ${est.estimateNumber}`,
        description: `Generated from Approved Estimate ${est.estimateNumber}. Notes: ${est.notes}`,
        priority: 'high',
        status: 'scheduled',
        assignedTechnicianIds: [],
        scheduledDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '13:00',
        estimatedDurationMin: 240,
        labour,
        materials,
        expenses: [],
        internalNotes: `Converted from estimate ${est.estimateNumber}`,
        customerNotes: est.terms,
        photos: [],
        documents: [],
        checklist: [
          { id: 'c-1', label: 'Verify work area and client safety brief', checked: false, required: true },
          { id: 'c-2', label: 'Inspect items agreed on Estimate', checked: false, required: true },
          { id: 'c-3', label: 'Client demonstration and sign-off', checked: false, required: true },
        ],
      },
      actorName
    );

    await this.updateEstimate(est.id, { status: 'converted', convertedJobId: job.id }, actorName);
    return job;
  }

  async convertEstimateToInvoice(estimateId: string, actorName = 'Accountant'): Promise<Invoice | null> {
    const est = await this.getEstimateById(estimateId);
    if (!est) return null;

    const invoice = await this.createInvoice(
      {
        orgId: est.orgId,
        customerId: est.customerId,
        estimateId: est.id,
        status: 'sent',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
        items: est.items,
        subtotal: est.subtotal,
        discountTotal: est.discountTotal,
        taxRate: est.taxRate,
        taxAmount: est.taxAmount,
        totalAmount: est.totalAmount,
        depositAmount: 0,
        paidAmount: 0,
        balanceDue: est.totalAmount,
        notes: est.notes,
        terms: est.terms,
        eTimsData: {
          controlCode: `eTIMS-NBO-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          qrData: `https://itax.kra.go.ke/KRA-Portal/invoiceVerification.htm?inv=eTIMS-${est.estimateNumber}`,
          cuSerialNumber: 'KRA-CU-099412-2026',
          taxInvoiceType: 'Standard Rated Tax Invoice',
        },
      },
      actorName
    );

    await this.updateEstimate(est.id, { convertedInvoiceId: invoice.id }, actorName);
    return invoice;
  }

  // ----------------------------------------------------
  // Invoices
  // ----------------------------------------------------
  async getInvoices(orgId: string): Promise<Invoice[]> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle
          .select()
          .from(schema.invoices)
          .where(eq(schema.invoices.orgId, orgId))
          .orderBy(desc(schema.invoices.createdAt));
        if (rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            orgId: r.orgId,
            invoiceNumber: r.invoiceNumber,
            customerId: r.customerId,
            jobId: r.jobId || undefined,
            estimateId: r.estimateId || undefined,
            status: r.status as any,
            issueDate: r.issueDate || undefined,
            dueDate: r.dueDate,
            items: r.items || [],
            subtotal: r.subtotal,
            discountTotal: r.discountTotal || undefined,
            taxRate: r.taxRate || undefined,
            taxAmount: r.taxAmount,
            totalAmount: r.totalAmount,
            depositAmount: r.depositAmount || undefined,
            paidAmount: r.paidAmount || undefined,
            amountPaid: r.amountPaid || undefined,
            balanceDue: r.balanceDue,
            notes: r.notes || '',
            terms: r.terms || undefined,
            etimsControlCode: r.etimsControlCode || undefined,
            etimsCuSerialNumber: r.etimsCuSerialNumber || undefined,
            eTimsData: r.eTimsData || undefined,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting invoices:', err);
      }
    }
    return fallbackDb.getInvoices(orgId);
  }

  async getInvoiceById(id: string): Promise<Invoice | undefined> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle.select().from(schema.invoices).where(eq(schema.invoices.id, id));
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            orgId: r.orgId,
            invoiceNumber: r.invoiceNumber,
            customerId: r.customerId,
            jobId: r.jobId || undefined,
            estimateId: r.estimateId || undefined,
            status: r.status as any,
            issueDate: r.issueDate || undefined,
            dueDate: r.dueDate,
            items: r.items || [],
            subtotal: r.subtotal,
            discountTotal: r.discountTotal || undefined,
            taxRate: r.taxRate || undefined,
            taxAmount: r.taxAmount,
            totalAmount: r.totalAmount,
            depositAmount: r.depositAmount || undefined,
            paidAmount: r.paidAmount || undefined,
            amountPaid: r.amountPaid || undefined,
            balanceDue: r.balanceDue,
            notes: r.notes || '',
            terms: r.terms || undefined,
            etimsControlCode: r.etimsControlCode || undefined,
            etimsCuSerialNumber: r.etimsCuSerialNumber || undefined,
            eTimsData: r.eTimsData || undefined,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting invoice by ID:', err);
      }
    }
    return fallbackDb.getInvoiceById(id);
  }

  async createInvoice(
    inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>,
    actorName = 'Accountant'
  ): Promise<Invoice> {
    const id = 'inv-' + crypto.randomUUID().slice(0, 8);
    const now = new Date();
    const existing = await this.getInvoices(inv.orgId);
    const count = existing.length + 1;
    const year = now.getFullYear();
    const invoiceNumber = `INV-${year}-${String(count).padStart(4, '0')}`;

    const newInv: Invoice = {
      ...inv,
      id,
      invoiceNumber,
      createdAt: now.toISOString(),
    };

    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        await drizzle.insert(schema.invoices).values({
          id,
          orgId: inv.orgId,
          invoiceNumber,
          customerId: inv.customerId,
          jobId: inv.jobId || null,
          estimateId: inv.estimateId || null,
          status: inv.status || 'draft',
          issueDate: inv.issueDate || null,
          dueDate: inv.dueDate,
          items: inv.items || [],
          subtotal: inv.subtotal,
          discountTotal: inv.discountTotal || null,
          taxRate: inv.taxRate || null,
          taxAmount: inv.taxAmount,
          totalAmount: inv.totalAmount,
          depositAmount: inv.depositAmount || null,
          paidAmount: inv.paidAmount || null,
          amountPaid: inv.amountPaid || null,
          balanceDue: inv.balanceDue,
          notes: inv.notes || '',
          terms: inv.terms || null,
          etimsControlCode: inv.etimsControlCode || null,
          etimsCuSerialNumber: inv.etimsCuSerialNumber || null,
          eTimsData: inv.eTimsData || null,
          createdAt: now,
        });

        await this.logAudit(inv.orgId, 'sys', actorName, 'INVOICE_CREATED', 'Invoice', id, '', invoiceNumber);
      } catch (err) {
        console.warn('[Drizzle] Error inserting invoice:', err);
      }
    }

    fallbackDb.createInvoice(inv, actorName);
    return newInv;
  }

  async updateInvoice(
    id: string,
    updates: Partial<Invoice>,
    actorName = 'Accountant'
  ): Promise<Invoice | null> {
    const drizzle = getDrizzleDb();
    const existing = await this.getInvoiceById(id);
    if (!existing) return null;

    if (drizzle) {
      try {
        const toSet: any = {};
        if (updates.status !== undefined) toSet.status = updates.status;
        if (updates.paidAmount !== undefined) toSet.paidAmount = updates.paidAmount;
        if (updates.amountPaid !== undefined) toSet.amountPaid = updates.amountPaid;
        if (updates.balanceDue !== undefined) toSet.balanceDue = updates.balanceDue;
        if (updates.notes !== undefined) toSet.notes = updates.notes;
        if (updates.items !== undefined) toSet.items = updates.items;
        if (updates.eTimsData !== undefined) toSet.eTimsData = updates.eTimsData;

        if (Object.keys(toSet).length > 0) {
          await drizzle.update(schema.invoices).set(toSet).where(eq(schema.invoices.id, id));
        }
      } catch (err) {
        console.warn('[Drizzle] Error updating invoice:', err);
      }
    }

    return fallbackDb.updateInvoice(id, updates, actorName);
  }

  // ----------------------------------------------------
  // Payments
  // ----------------------------------------------------
  async getPayments(orgId: string): Promise<Payment[]> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle
          .select()
          .from(schema.payments)
          .where(eq(schema.payments.orgId, orgId))
          .orderBy(desc(schema.payments.createdAt));
        if (rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            orgId: r.orgId,
            invoiceId: r.invoiceId,
            invoiceNumber: r.invoiceNumber || undefined,
            customerId: r.customerId || undefined,
            amount: r.amount,
            paymentMethod: r.paymentMethod as any,
            reference: r.reference,
            phoneNumber: r.phoneNumber || undefined,
            status: r.status as any,
            notes: r.notes || undefined,
            paymentDate: r.paymentDate || undefined,
            receivedAt: r.receivedAt || undefined,
            receivedBy: r.receivedBy || undefined,
          }));
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting payments:', err);
      }
    }
    return fallbackDb.getPayments(orgId);
  }

  async recordPayment(
    payment: Omit<Payment, 'id'>,
    actorName = 'Cashier'
  ): Promise<{ payment: Payment; invoice: Invoice | null }> {
    const id = 'pay-' + crypto.randomUUID().slice(0, 8);
    const now = new Date();
    const newPayment: Payment = {
      ...payment,
      id,
      status: payment.status || 'completed',
      receivedAt: payment.receivedAt || now.toISOString(),
    };

    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        await drizzle.insert(schema.payments).values({
          id,
          orgId: payment.orgId,
          invoiceId: payment.invoiceId,
          invoiceNumber: payment.invoiceNumber || null,
          customerId: payment.customerId || null,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          reference: payment.reference,
          phoneNumber: payment.phoneNumber || null,
          status: newPayment.status,
          notes: payment.notes || null,
          paymentDate: payment.paymentDate || null,
          receivedAt: newPayment.receivedAt || now.toISOString(),
          receivedBy: payment.receivedBy || actorName,
          createdAt: now,
        });

        // Update invoice balance in Drizzle
        const inv = await this.getInvoiceById(payment.invoiceId);
        if (inv) {
          const currentPaid = inv.paidAmount || inv.amountPaid || 0;
          const newPaid = currentPaid + payment.amount;
          const newBalance = Math.max(0, inv.totalAmount - newPaid);
          const newStatus = newBalance === 0 ? 'paid' : 'partial';

          await drizzle
            .update(schema.invoices)
            .set({
              paidAmount: newPaid,
              amountPaid: newPaid,
              balanceDue: newBalance,
              status: newStatus,
            })
            .where(eq(schema.invoices.id, inv.id));
        }

        await this.logAudit(payment.orgId, 'sys', actorName, 'PAYMENT_RECORDED', 'Payment', id, '', `${payment.paymentMethod} KES ${payment.amount}`);
      } catch (err) {
        console.warn('[Drizzle] Error recording payment:', err);
      }
    }

    return fallbackDb.recordPayment(payment, actorName);
  }

  // ----------------------------------------------------
  // Products & Inventory
  // ----------------------------------------------------
  async getProducts(orgId: string): Promise<ProductInventory[]> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const rows = await drizzle
          .select()
          .from(schema.products)
          .where(eq(schema.products.orgId, orgId))
          .orderBy(desc(schema.products.createdAt));
        if (rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            orgId: r.orgId,
            sku: r.sku,
            name: r.name,
            description: r.description || undefined,
            type: (r.type as any) || 'part',
            category: r.category,
            costPrice: r.costPrice,
            sellingPrice: r.sellingPrice,
            stockQuantity: r.stockQuantity,
            minStockLevel: r.minStockLevel,
            warehouseId: r.warehouseId || undefined,
            unit: r.unit || 'pcs',
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('[Drizzle] Error getting products:', err);
      }
    }
    return fallbackDb.getProducts(orgId);
  }

  async createProduct(
    prod: Omit<ProductInventory, 'id'>,
    actorName = 'Inventory Manager'
  ): Promise<ProductInventory> {
    const id = 'prod-' + crypto.randomUUID().slice(0, 8);
    const now = new Date();
    const newProd: ProductInventory = {
      ...prod,
      id,
    };

    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        await drizzle.insert(schema.products).values({
          id,
          orgId: prod.orgId,
          sku: prod.sku,
          name: prod.name,
          description: prod.description || null,
          type: prod.type || 'part',
          category: prod.category,
          unit: prod.unit || 'pcs',
          costPrice: prod.costPrice,
          sellingPrice: prod.sellingPrice,
          stockQuantity: prod.stockQuantity || 0,
          minStockLevel: prod.minStockLevel || 5,
          warehouseId: prod.warehouseId || null,
          createdAt: now,
        });

        await this.logAudit(prod.orgId, 'sys', actorName, 'PRODUCT_CREATED', 'Product', id, '', prod.name);
      } catch (err) {
        console.warn('[Drizzle] Error inserting product:', err);
      }
    }

    fallbackDb.createProduct(prod, actorName);
    return newProd;
  }

  async updateProduct(
    id: string,
    updates: Partial<ProductInventory>,
    actorName = 'Inventory Manager'
  ): Promise<ProductInventory | null> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const toSet: any = {};
        if (updates.name !== undefined) toSet.name = updates.name;
        if (updates.description !== undefined) toSet.description = updates.description;
        if (updates.category !== undefined) toSet.category = updates.category;
        if (updates.costPrice !== undefined) toSet.costPrice = updates.costPrice;
        if (updates.sellingPrice !== undefined) toSet.sellingPrice = updates.sellingPrice;
        if (updates.stockQuantity !== undefined) toSet.stockQuantity = updates.stockQuantity;
        if (updates.minStockLevel !== undefined) toSet.minStockLevel = updates.minStockLevel;

        if (Object.keys(toSet).length > 0) {
          await drizzle.update(schema.products).set(toSet).where(eq(schema.products.id, id));
        }
      } catch (err) {
        console.warn('[Drizzle] Error updating product:', err);
      }
    }

    return fallbackDb.updateProduct(id, updates, actorName);
  }

  async adjustInventory(
    orgId: string,
    productId: string,
    adjustmentQuantity: number,
    notes: string,
    actorName = 'Inventory Manager'
  ): Promise<ProductInventory | null> {
    const drizzle = getDrizzleDb();
    if (drizzle) {
      try {
        const prod = await drizzle.select().from(schema.products).where(eq(schema.products.id, productId));
        if (prod.length > 0) {
          const newQty = Math.max(0, prod[0].stockQuantity + adjustmentQuantity);
          await drizzle.update(schema.products).set({ stockQuantity: newQty }).where(eq(schema.products.id, productId));
        }
      } catch (err) {
        console.warn('[Drizzle] Error adjusting inventory in PostgreSQL:', err);
      }
    }
    return fallbackDb.adjustInventory(orgId, productId, adjustmentQuantity, notes, actorName);
  }

  async getWarehouses(orgId: string): Promise<Warehouse[]> {
    return fallbackDb.getWarehouses(orgId);
  }

  async getInventoryTransactions(orgId: string): Promise<InventoryTransaction[]> {
    return fallbackDb.getInventoryTransactions(orgId);
  }

  // ----------------------------------------------------
  // Custom Forms & Submissions
  // ----------------------------------------------------
  async getForms(orgId: string): Promise<CustomForm[]> {
    return fallbackDb.getForms(orgId);
  }

  async createForm(form: Omit<CustomForm, 'id' | 'createdAt' | 'updatedAt'>, actorName = 'Admin'): Promise<CustomForm> {
    return fallbackDb.createForm(form, actorName);
  }

  async getFormSubmissions(orgId: string, jobId?: string): Promise<FormSubmission[]> {
    return fallbackDb.getFormSubmissions(orgId, jobId);
  }

  async submitForm(sub: Omit<FormSubmission, 'id' | 'submittedAt'>, actorName = 'Technician'): Promise<FormSubmission> {
    return fallbackDb.submitForm(sub, actorName);
  }

  // ----------------------------------------------------
  // Dashboard & Metrics
  // ----------------------------------------------------
  async getDashboardStats(orgId: string) {
    const [allJobs, allTechs, allInvoices, allPayments] = await Promise.all([
      this.getJobs(orgId),
      this.getTechnicians(orgId),
      this.getInvoices(orgId),
      this.getPayments(orgId),
    ]);

    const activeJobs = allJobs.filter(j => ['new', 'scheduled', 'assigned', 'en_route', 'on_site', 'in_progress', 'waiting'].includes(j.status));
    const completedToday = allJobs.filter(j => j.status === 'completed');
    const totalRevenue = allPayments.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0);
    const unpaidInvoices = allInvoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled');
    const outstandingRevenue = unpaidInvoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);

    return {
      activeJobsCount: activeJobs.length,
      completedTodayCount: completedToday.length,
      totalRevenue,
      outstandingRevenue,
      onlineTechniciansCount: allTechs.filter(t => t.activeStatus !== 'offline').length,
      totalTechniciansCount: allTechs.length,
      urgentJobsCount: activeJobs.filter(j => j.priority === 'urgent').length,
    };
  }
}

export const drizzleDb = new DrizzleDataService();
