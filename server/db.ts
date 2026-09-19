import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
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
import {
  initialOrganization,
  initialUsers,
  initialCustomers,
  initialTechnicians,
  initialJobs,
  initialEstimates,
  initialInvoices,
  initialPayments,
  initialProducts,
  initialWarehouses,
  initialInventoryTransactions,
  initialCustomForms,
  initialNotifications,
  initialAuditLogs,
  SEED_ORG_ID
} from './seedData';

interface DatabaseSchema {
  organizations: Organization[];
  users: User[];
  customers: Customer[];
  technicians: Technician[];
  jobs: Job[];
  estimates: Estimate[];
  invoices: Invoice[];
  payments: Payment[];
  products: ProductInventory[];
  warehouses: Warehouse[];
  inventoryTransactions: InventoryTransaction[];
  forms: CustomForm[];
  formSubmissions: FormSubmission[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'fieldnora_db.json');

class DatabaseService {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadDatabase();
  }

  private getInitialData(): DatabaseSchema {
    return {
      organizations: [initialOrganization],
      users: [...initialUsers],
      customers: [...initialCustomers],
      technicians: [...initialTechnicians],
      jobs: [...initialJobs],
      estimates: [...initialEstimates],
      invoices: [...initialInvoices],
      payments: [...initialPayments],
      products: [...initialProducts],
      warehouses: [...initialWarehouses],
      inventoryTransactions: [...initialInventoryTransactions],
      forms: [...initialCustomForms],
      formSubmissions: [],
      notifications: [...initialNotifications],
      auditLogs: [...initialAuditLogs],
    };
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
        return {
          organizations: parsed.organizations || [initialOrganization],
          users: parsed.users || [...initialUsers],
          customers: parsed.customers || [...initialCustomers],
          technicians: parsed.technicians || [...initialTechnicians],
          jobs: parsed.jobs || [...initialJobs],
          estimates: parsed.estimates || [...initialEstimates],
          invoices: parsed.invoices || [...initialInvoices],
          payments: parsed.payments || [...initialPayments],
          products: parsed.products || [...initialProducts],
          warehouses: parsed.warehouses || [...initialWarehouses],
          inventoryTransactions: parsed.inventoryTransactions || [...initialInventoryTransactions],
          forms: parsed.forms || [...initialCustomForms],
          formSubmissions: parsed.formSubmissions || [],
          notifications: parsed.notifications || [...initialNotifications],
          auditLogs: parsed.auditLogs || [...initialAuditLogs],
        };
      }
    } catch (err) {
      console.error('Failed to load database file, initializing with seed data:', err);
    }

    const init = this.getInitialData();
    this.persistSync(init);
    return init;
  }

  private persistSync(state: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database to disk:', err);
    }
  }

  private scheduleSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.persistSync(this.data);
    }, 100);
  }

  // Audit Log & Notification helper
  logAudit(
    orgId: string,
    userId: string,
    userName: string,
    action: string,
    entity: string,
    entityId: string,
    previousValue?: string,
    newValue?: string
  ) {
    const log: AuditLog = {
      id: 'log-' + crypto.randomUUID().slice(0, 8),
      orgId,
      userId,
      userName,
      action,
      entity,
      entityId,
      previousValue,
      newValue,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    this.scheduleSave();
    return log;
  }

  createNotification(
    orgId: string,
    title: string,
    message: string,
    type: AppNotification['type'],
    channel: AppNotification['channel'] = 'in_app',
    link?: string,
    userId?: string
  ) {
    const notif: AppNotification = {
      id: 'notif-' + crypto.randomUUID().slice(0, 8),
      orgId,
      userId,
      title,
      message,
      type,
      channel,
      read: false,
      link,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(notif);
    this.scheduleSave();
    return notif;
  }

  // Organizations
  getOrganizations(): Organization[] {
    return this.data.organizations;
  }

  getOrganizationById(id: string): Organization | undefined {
    return this.data.organizations.find(o => o.id === id);
  }

  createOrganization(org: Omit<Organization, 'id' | 'createdAt'>): Organization {
    const newOrg: Organization = {
      ...org,
      id: 'org-' + crypto.randomUUID().slice(0, 8),
      createdAt: new Date().toISOString(),
    };
    this.data.organizations.push(newOrg);
    this.scheduleSave();
    return newOrg;
  }

  // Users
  getUsers(orgId: string): User[] {
    return this.data.users.filter(u => u.orgId === orgId);
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: 'usr-' + crypto.randomUUID().slice(0, 8),
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.scheduleSave();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.scheduleSave();
    return this.data.users[index];
  }

  // Customers
  getCustomers(orgId: string): Customer[] {
    return this.data.customers.filter(c => c.orgId === orgId);
  }

  getCustomerById(id: string): Customer | undefined {
    return this.data.customers.find(c => c.id === id);
  }

  createCustomer(cust: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>, actorName = 'Admin'): Customer {
    const now = new Date().toISOString();
    const newCust: Customer = {
      ...cust,
      id: 'cust-' + crypto.randomUUID().slice(0, 8),
      createdAt: now,
      updatedAt: now,
    };
    this.data.customers.unshift(newCust);
    this.logAudit(cust.orgId, 'sys', actorName, 'CUSTOMER_CREATED', 'Customer', newCust.id, '', newCust.name);
    this.scheduleSave();
    return newCust;
  }

  updateCustomer(id: string, updates: Partial<Customer>, actorName = 'Admin'): Customer | null {
    const index = this.data.customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    const old = this.data.customers[index];
    this.data.customers[index] = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.logAudit(old.orgId, 'sys', actorName, 'CUSTOMER_UPDATED', 'Customer', id, old.name, updates.name || old.name);
    this.scheduleSave();
    return this.data.customers[index];
  }

  deleteCustomer(id: string, actorName = 'Admin'): boolean {
    const index = this.data.customers.findIndex(c => c.id === id);
    if (index === -1) return false;
    const cust = this.data.customers[index];
    this.data.customers.splice(index, 1);
    this.logAudit(cust.orgId, 'sys', actorName, 'CUSTOMER_DELETED', 'Customer', id, cust.name, '');
    this.scheduleSave();
    return true;
  }

  // Technicians
  getTechnicians(orgId: string): Technician[] {
    return this.data.technicians.filter(t => t.orgId === orgId);
  }

  getTechnicianById(id: string): Technician | undefined {
    return this.data.technicians.find(t => t.id === id);
  }

  updateTechnicianStatus(
    id: string,
    status: Technician['activeStatus'],
    lat?: number,
    lng?: number,
    actorName = 'System'
  ): Technician | null {
    const tech = this.data.technicians.find(t => t.id === id);
    if (!tech) return null;
    const prev = tech.activeStatus;
    tech.activeStatus = status;
    if (lat !== undefined && lng !== undefined) {
      tech.currentLat = lat;
      tech.currentLng = lng;
    }
    tech.lastLocationUpdate = new Date().toISOString();
    this.logAudit(tech.orgId, tech.userId, actorName, 'TECHNICIAN_STATUS_UPDATE', 'Technician', id, prev, status);
    this.scheduleSave();
    return tech;
  }

  // Jobs
  getJobs(orgId: string): Job[] {
    return this.data.jobs.filter(j => j.orgId === orgId);
  }

  getJobById(id: string): Job | undefined {
    return this.data.jobs.find(j => j.id === id);
  }

  createJob(jobData: Omit<Job, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt'>, actorName = 'Dispatcher'): Job {
    const now = new Date().toISOString();
    const count = this.data.jobs.filter(j => j.orgId === jobData.orgId).length + 1;
    const year = new Date().getFullYear();
    const jobNumber = `JOB-${year}-${String(count).padStart(4, '0')}`;

    const newJob: Job = {
      ...jobData,
      id: 'job-' + crypto.randomUUID().slice(0, 8),
      jobNumber,
      createdAt: now,
      updatedAt: now,
    };
    this.data.jobs.unshift(newJob);

    this.logAudit(jobData.orgId, 'sys', actorName, 'JOB_CREATED', 'Job', newJob.id, '', jobNumber);
    this.createNotification(
      jobData.orgId,
      `New Job Created: ${jobNumber}`,
      `${newJob.title} scheduled for ${newJob.scheduledDate}`,
      'appointment',
      'in_app',
      'jobs'
    );

    this.scheduleSave();
    return newJob;
  }

  updateJob(id: string, updates: Partial<Job>, actorName = 'User'): Job | null {
    const index = this.data.jobs.findIndex(j => j.id === id);
    if (index === -1) return null;
    const current = this.data.jobs[index];
    const prevStatus = current.status;
    const newStatus = updates.status;

    // Automatic inventory deduction when transitioning to completed
    if (newStatus === 'completed' && prevStatus !== 'completed') {
      this.deductInventoryForJob(current, actorName);
    }

    // Status change notification
    if (newStatus && newStatus !== prevStatus) {
      this.logAudit(
        current.orgId,
        'sys',
        actorName,
        'JOB_STATUS_CHANGED',
        'Job',
        id,
        prevStatus,
        newStatus
      );
      this.createNotification(
        current.orgId,
        `Job ${current.jobNumber} status: ${newStatus.replace('_', ' ').toUpperCase()}`,
        `Updated by ${actorName}`,
        'status',
        'in_app',
        'jobs'
      );
    }

    this.data.jobs[index] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.scheduleSave();
    return this.data.jobs[index];
  }

  private deductInventoryForJob(job: Job, actorName: string) {
    if (!job.materials || job.materials.length === 0) return;
    for (const mat of job.materials) {
      if (mat.productId) {
        const prod = this.data.products.find(p => p.id === mat.productId && p.orgId === job.orgId);
        if (prod && prod.type !== 'service') {
          const prevQty = prod.stockQuantity;
          const qtyUsed = mat.quantity;
          prod.stockQuantity = Math.max(0, prod.stockQuantity - qtyUsed);

          const tx: InventoryTransaction = {
            id: 'it-' + crypto.randomUUID().slice(0, 8),
            orgId: job.orgId,
            productId: prod.id,
            productName: prod.name,
            type: 'job_consumption',
            quantity: -qtyUsed,
            previousQuantity: prevQty,
            newQuantity: prod.stockQuantity,
            referenceId: job.jobNumber,
            notes: `Auto-deducted upon completion of Job ${job.jobNumber}`,
            timestamp: new Date().toISOString(),
            userName: actorName,
          };
          this.data.inventoryTransactions.unshift(tx);

          // Check low stock trigger
          if (prod.stockQuantity <= prod.minStockLevel) {
            this.createNotification(
              job.orgId,
              `Low Stock Alert: ${prod.name}`,
              `Remaining stock is ${prod.stockQuantity} ${prod.unit}(s) (Min threshold: ${prod.minStockLevel})`,
              'inventory',
              'in_app',
              'inventory'
            );
          }
        }
      }
    }
  }

  // Estimates
  getEstimates(orgId: string): Estimate[] {
    return this.data.estimates.filter(e => e.orgId === orgId);
  }

  getEstimateById(id: string): Estimate | undefined {
    return this.data.estimates.find(e => e.id === id);
  }

  createEstimate(est: Omit<Estimate, 'id' | 'estimateNumber' | 'createdAt'>, actorName = 'Estimator'): Estimate {
    const count = this.data.estimates.filter(e => e.orgId === est.orgId).length + 1;
    const year = new Date().getFullYear();
    const estimateNumber = `EST-${year}-${String(count).padStart(4, '0')}`;

    const newEst: Estimate = {
      ...est,
      id: 'est-' + crypto.randomUUID().slice(0, 8),
      estimateNumber,
      createdAt: new Date().toISOString(),
    };
    this.data.estimates.unshift(newEst);
    this.logAudit(est.orgId, 'sys', actorName, 'ESTIMATE_CREATED', 'Estimate', newEst.id, '', estimateNumber);
    this.scheduleSave();
    return newEst;
  }

  updateEstimate(id: string, updates: Partial<Estimate>, actorName = 'User'): Estimate | null {
    const index = this.data.estimates.findIndex(e => e.id === id);
    if (index === -1) return null;
    const current = this.data.estimates[index];
    this.data.estimates[index] = { ...current, ...updates };
    this.logAudit(current.orgId, 'sys', actorName, 'ESTIMATE_UPDATED', 'Estimate', id, current.status, updates.status || current.status);
    this.scheduleSave();
    return this.data.estimates[index];
  }

  convertEstimateToJob(estimateId: string, actorName = 'Dispatcher'): Job | null {
    const est = this.getEstimateById(estimateId);
    if (!est) return null;

    const labour = est.items
      .filter(i => i.type === 'service' || i.type === 'labour')
      .map(i => ({
        id: 'lab-' + crypto.randomUUID().slice(0, 6),
        description: i.description,
        hours: i.quantity,
        hourlyRate: i.unitPrice,
        total: i.total,
      }));

    const materials = est.items
      .filter(i => i.type === 'product')
      .map(i => ({
        id: 'mat-' + crypto.randomUUID().slice(0, 6),
        name: i.description,
        quantity: i.quantity,
        unitCost: i.unitPrice * 0.6,
        unitPrice: i.unitPrice,
        total: i.total,
      }));

    const job = this.createJob(
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

    this.updateEstimate(est.id, { status: 'converted', convertedJobId: job.id }, actorName);
    return job;
  }

  convertEstimateToInvoice(estimateId: string, actorName = 'Accountant'): Invoice | null {
    const est = this.getEstimateById(estimateId);
    if (!est) return null;

    const invoice = this.createInvoice(
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

    this.updateEstimate(est.id, { convertedInvoiceId: invoice.id }, actorName);
    return invoice;
  }

  // Invoices
  getInvoices(orgId: string): Invoice[] {
    return this.data.invoices.filter(i => i.orgId === orgId);
  }

  getInvoiceById(id: string): Invoice | undefined {
    return this.data.invoices.find(i => i.id === id);
  }

  createInvoice(inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>, actorName = 'Accountant'): Invoice {
    const count = this.data.invoices.filter(i => i.orgId === inv.orgId).length + 1;
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(count).padStart(4, '0')}`;

    const newInv: Invoice = {
      ...inv,
      id: 'inv-' + crypto.randomUUID().slice(0, 8),
      invoiceNumber,
      createdAt: new Date().toISOString(),
    };
    this.data.invoices.unshift(newInv);
    this.logAudit(inv.orgId, 'sys', actorName, 'INVOICE_CREATED', 'Invoice', newInv.id, '', invoiceNumber);
    this.createNotification(
      inv.orgId,
      `Invoice Generated: ${invoiceNumber}`,
      `Total: KES ${newInv.totalAmount.toLocaleString()}`,
      'invoice',
      'in_app',
      'invoices'
    );
    this.scheduleSave();
    return newInv;
  }

  updateInvoice(id: string, updates: Partial<Invoice>, actorName = 'User'): Invoice | null {
    const index = this.data.invoices.findIndex(i => i.id === id);
    if (index === -1) return null;
    const current = this.data.invoices[index];
    this.data.invoices[index] = { ...current, ...updates };
    this.logAudit(current.orgId, 'sys', actorName, 'INVOICE_UPDATED', 'Invoice', id, current.status, updates.status || current.status);
    this.scheduleSave();
    return this.data.invoices[index];
  }

  // Payments
  getPayments(orgId: string): Payment[] {
    return this.data.payments.filter(p => p.orgId === orgId);
  }

  recordPayment(
    paymentData: Omit<Payment, 'id' | 'status' | 'receivedAt'>,
    actorName = 'System'
  ): { payment: Payment; invoice: Invoice | null } {
    const newPayment: Payment = {
      ...paymentData,
      id: 'pay-' + crypto.randomUUID().slice(0, 8),
      status: 'completed',
      receivedAt: new Date().toISOString(),
    };
    this.data.payments.unshift(newPayment);

    // Update associated invoice
    const inv = this.getInvoiceById(paymentData.invoiceId);
    let updatedInvoice: Invoice | null = null;
    if (inv) {
      const currentPaid = inv.paidAmount ?? inv.amountPaid ?? 0;
      const newPaid = currentPaid + paymentData.amount;
      const newBalance = Math.max(0, inv.totalAmount - newPaid);
      const newStatus = newBalance <= 0 ? 'paid' : 'partial';

      updatedInvoice = this.updateInvoice(
        inv.id,
        {
          paidAmount: newPaid,
          balanceDue: newBalance,
          status: newStatus,
        },
        actorName
      );
    }

    this.logAudit(
      paymentData.orgId,
      'sys',
      actorName,
      'PAYMENT_RECORDED',
      'Payment',
      newPayment.id,
      '',
      `KES ${newPayment.amount} (${newPayment.paymentMethod}) Ref: ${newPayment.reference}`
    );

    this.createNotification(
      paymentData.orgId,
      `Payment Received: KES ${newPayment.amount.toLocaleString()}`,
      `Method: ${newPayment.paymentMethod.toUpperCase()} | Ref: ${newPayment.reference}`,
      'payment',
      'in_app',
      'invoices'
    );

    this.scheduleSave();
    return { payment: newPayment, invoice: updatedInvoice };
  }

  // Inventory Products
  getProducts(orgId: string): ProductInventory[] {
    return this.data.products.filter(p => p.orgId === orgId);
  }

  createProduct(prod: Omit<ProductInventory, 'id' | 'createdAt'>, actorName = 'Inventory Manager'): ProductInventory {
    const newProd: ProductInventory = {
      ...prod,
      id: 'prod-' + crypto.randomUUID().slice(0, 8),
      createdAt: new Date().toISOString(),
    };
    this.data.products.push(newProd);

    // Record initial purchase transaction
    const tx: InventoryTransaction = {
      id: 'it-' + crypto.randomUUID().slice(0, 8),
      orgId: prod.orgId,
      productId: newProd.id,
      productName: newProd.name,
      type: 'purchase',
      quantity: prod.stockQuantity,
      previousQuantity: 0,
      newQuantity: prod.stockQuantity,
      referenceId: 'INITIAL_STOCK',
      notes: 'Initial inventory catalog entry',
      timestamp: new Date().toISOString(),
      userName: actorName,
    };
    this.data.inventoryTransactions.unshift(tx);

    this.logAudit(prod.orgId, 'sys', actorName, 'PRODUCT_CREATED', 'Product', newProd.id, '', newProd.name);
    this.scheduleSave();
    return newProd;
  }

  updateProduct(id: string, updates: Partial<ProductInventory>, actorName = 'Inventory Manager'): ProductInventory | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    const current = this.data.products[index];
    this.data.products[index] = { ...current, ...updates };
    this.logAudit(current.orgId, 'sys', actorName, 'PRODUCT_UPDATED', 'Product', id, current.name, updates.name || current.name);
    this.scheduleSave();
    return this.data.products[index];
  }

  adjustInventory(
    orgId: string,
    productId: string,
    adjustmentQuantity: number,
    notes: string,
    actorName = 'Inventory Manager'
  ): ProductInventory | null {
    const prod = this.data.products.find(p => p.id === productId && p.orgId === orgId);
    if (!prod) return null;

    const prev = prod.stockQuantity;
    prod.stockQuantity = Math.max(0, prod.stockQuantity + adjustmentQuantity);

    const tx: InventoryTransaction = {
      id: 'it-' + crypto.randomUUID().slice(0, 8),
      orgId,
      productId: prod.id,
      productName: prod.name,
      type: adjustmentQuantity >= 0 ? 'purchase' : 'adjustment',
      quantity: adjustmentQuantity,
      previousQuantity: prev,
      newQuantity: prod.stockQuantity,
      referenceId: 'ADJUSTMENT',
      notes,
      timestamp: new Date().toISOString(),
      userName: actorName,
    };
    this.data.inventoryTransactions.unshift(tx);
    this.scheduleSave();
    return prod;
  }

  getWarehouses(orgId: string): Warehouse[] {
    return this.data.warehouses.filter(w => w.orgId === orgId);
  }

  getInventoryTransactions(orgId: string): InventoryTransaction[] {
    return this.data.inventoryTransactions.filter(t => t.orgId === orgId);
  }

  // Forms
  getForms(orgId: string): CustomForm[] {
    return this.data.forms.filter(f => f.orgId === orgId);
  }

  createForm(form: Omit<CustomForm, 'id' | 'createdAt'>, actorName = 'Admin'): CustomForm {
    const newForm: CustomForm = {
      ...form,
      id: 'form-' + crypto.randomUUID().slice(0, 8),
      createdAt: new Date().toISOString(),
    };
    this.data.forms.unshift(newForm);
    this.logAudit(form.orgId, 'sys', actorName, 'FORM_CREATED', 'Form', newForm.id, '', newForm.title);
    this.scheduleSave();
    return newForm;
  }

  getFormSubmissions(orgId: string, jobId?: string): FormSubmission[] {
    let list = this.data.formSubmissions.filter(s => s.orgId === orgId);
    if (jobId) {
      list = list.filter(s => s.jobId === jobId);
    }
    return list;
  }

  submitForm(submission: Omit<FormSubmission, 'id' | 'submittedAt'>, actorName = 'Technician'): FormSubmission {
    const newSub: FormSubmission = {
      ...submission,
      id: 'sub-' + crypto.randomUUID().slice(0, 8),
      submittedAt: new Date().toISOString(),
    };
    this.data.formSubmissions.unshift(newSub);
    this.logAudit(submission.orgId, 'sys', actorName, 'FORM_SUBMITTED', 'FormSubmission', newSub.id, '', submission.formId);
    this.scheduleSave();
    return newSub;
  }

  // Notifications
  getNotifications(orgId: string): AppNotification[] {
    return this.data.notifications.filter(n => n.orgId === orgId);
  }

  markNotificationRead(id: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id);
    if (!notif) return false;
    notif.read = true;
    this.scheduleSave();
    return true;
  }

  // Audit Logs
  getAuditLogs(orgId: string): AuditLog[] {
    return this.data.auditLogs.filter(l => l.orgId === orgId);
  }

  // Dashboard Aggregated Stats (Live DB queries)
  getDashboardStats(orgId: string) {
    const jobs = this.getJobs(orgId);
    const invoices = this.getInvoices(orgId);
    const customers = this.getCustomers(orgId);
    const technicians = this.getTechnicians(orgId);
    const payments = this.getPayments(orgId);

    const todayStr = new Date().toISOString().split('T')[0];

    const todayJobs = jobs.filter(j => j.scheduledDate === todayStr);
    const upcomingJobs = jobs.filter(j => j.scheduledDate > todayStr && j.status !== 'cancelled' && j.status !== 'completed');
    const unassignedJobs = jobs.filter(j => j.assignedTechnicianIds.length === 0 && j.status !== 'cancelled' && j.status !== 'completed');
    const inProgressJobs = jobs.filter(j => j.status === 'in_progress' || j.status === 'on_site' || j.status === 'en_route');
    const completedJobs = jobs.filter(j => j.status === 'completed');

    const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const outstandingInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled');
    const outstandingPayments = outstandingInvoices.reduce((sum, i) => sum + i.balanceDue, 0);
    const overdueInvoices = invoices.filter(i => i.status === 'overdue' || (i.dueDate < todayStr && i.status !== 'paid'));

    const statusCounts: Record<string, number> = {};
    for (const j of jobs) {
      statusCounts[j.status] = (statusCounts[j.status] || 0) + 1;
    }

    return {
      todayJobsCount: todayJobs.length,
      upcomingJobsCount: upcomingJobs.length,
      unassignedJobsCount: unassignedJobs.length,
      inProgressJobsCount: inProgressJobs.length,
      completedJobsCount: completedJobs.length,
      totalJobsCount: jobs.length,
      totalRevenue,
      outstandingPayments,
      overdueInvoicesCount: overdueInvoices.length,
      totalCustomersCount: customers.length,
      activeTechniciansCount: technicians.filter(t => t.activeStatus !== 'offline').length,
      totalTechniciansCount: technicians.length,
      statusCounts,
      recentActivity: this.getAuditLogs(orgId).slice(0, 10),
      todayJobs: todayJobs.slice(0, 5),
    };
  }
}

export const db = new DatabaseService();
