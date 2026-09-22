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
} from '../types';

let currentOrgId = 'org-nairobi-prime-01';
let currentUserName = 'Faith Wanjiku (Admin)';

export function setApiContext(orgId: string, userName: string) {
  currentOrgId = orgId;
  currentUserName = userName;
}

export function getActiveOrgId(): string {
  return currentOrgId;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('x-org-id', currentOrgId);
  headers.set('x-user-name', currentUserName);
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) headers.set('x-timezone', tz);
  } catch {}

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) errorMsg = body.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth & Orgs
  login: (credentials: { email: string; password?: string; identifier?: string }) =>
    request<{ token: string; user: User; technician?: Technician | null; organization: Organization }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    }),

  requestAccess: (data: {
    name: string;
    email: string;
    phone?: string;
    companyName?: string;
    county?: string;
    estimatedTeamSize?: string;
    notes?: string;
  }) =>
    request<{ success: boolean; message: string; requestId?: string }>('/auth/request-access', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  forgotPassword: (identifier: string) =>
    request<{ success: boolean; message: string; otp?: string; destination?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),

  resetPassword: (data: { identifier: string; code: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  signup: (data: { name: string; email: string; phone: string; companyName: string; county: string }) =>
    request<{ token: string; user: User; organization: Organization }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getOrganizations: () => request<Organization[]>('/organizations'),
  createOrganization: (org: Partial<Organization>) =>
    request<Organization>('/organizations', {
      method: 'POST',
      body: JSON.stringify(org),
    }),

  getUsers: () => request<User[]>('/users'),
  getMe: () => request<User>('/users/me'),
  getUserById: (id: string) => request<User>(`/users/${id}`),
  updateUser: (id: string, updates: Partial<User>) =>
    request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  uploadUserAvatar: (id: string, avatar: string) =>
    request<{ success: boolean; message: string; avatar: string; user: User }>(`/users/${id}/avatar`, {
      method: 'POST',
      body: JSON.stringify({ avatar }),
    }),
  removeUserAvatar: (id: string) =>
    request<{ success: boolean; message: string; user: User }>(`/users/${id}/avatar`, {
      method: 'DELETE',
    }),
  inviteUser: (data: { name: string; email: string; phone: string; role: string; avatar?: string }) =>
    request<User>('/users/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboard
  getDashboard: () =>
    request<{
      todayJobsCount: number;
      todayActiveJobsCount?: number;
      activeJobsCount?: number;
      completedTodayCount?: number;
      upcomingJobsCount: number;
      unassignedJobsCount: number;
      inProgressJobsCount: number;
      completedJobsCount: number;
      totalJobsCount: number;
      totalRevenue: number;
      outstandingRevenue?: number;
      outstandingPayments: number;
      overdueInvoicesCount: number;
      totalCustomersCount: number;
      onlineTechniciansCount?: number;
      activeTechniciansCount: number;
      totalTechniciansCount: number;
      urgentJobsCount?: number;
      statusCounts: Record<string, number>;
      recentActivity: AuditLog[];
      todayJobs: Job[];
    }>('/dashboard'),

  // Customers
  getCustomers: (params?: { q?: string; tag?: string; county?: string }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.county) query.set('county', params.county);
    return request<Customer[]>(`/customers?${query.toString()}`);
  },

  getCustomerById: (id: string) =>
    request<{
      customer: Customer;
      jobs: Job[];
      estimates: Estimate[];
      invoices: Invoice[];
      payments: Payment[];
    }>(`/customers/${id}`),

  createCustomer: (data: Partial<Customer>) =>
    request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCustomer: (id: string, data: Partial<Customer>) =>
    request<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCustomer: (id: string) =>
    request<{ success: boolean }>(`/customers/${id}`, {
      method: 'DELETE',
    }),

  // Jobs
  getJobs: (params?: {
    status?: string;
    technicianId?: string;
    priority?: string;
    date?: string;
    scope?: string;
    activeOnly?: boolean | string;
    q?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.technicianId) query.set('technicianId', params.technicianId);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.date) query.set('date', params.date);
    if (params?.scope) query.set('scope', params.scope);
    if (params?.activeOnly) query.set('activeOnly', String(params.activeOnly));
    if (params?.q) query.set('q', params.q);
    return request<Job[]>(`/jobs?${query.toString()}`);
  },

  getJobById: (id: string) =>
    request<{
      job: Job;
      customer: Customer;
      technicians: Technician[];
    }>(`/jobs/${id}`),

  createJob: (data: Partial<Job>) =>
    request<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateJob: (id: string, data: Partial<Job>) =>
    request<Job>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateJobStatus: (id: string, status: any) =>
    request<Job>(`/jobs/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  checkInJob: (id: string, coords?: { latitude: number; longitude: number }) =>
    request<Job>(`/jobs/${id}/check-in`, {
      method: 'POST',
      body: JSON.stringify(coords || { latitude: -1.286389, longitude: 36.817223 }),
    }),

  saveSignature: (id: string, data: { signerName: string; dataUrl: string; customerAcceptedNotes?: string }) =>
    request<Job>(`/jobs/${id}/signature`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitJobSignature: (
    id: string,
    data: { signedBy?: string; signerName?: string; signatureBase64?: string; dataUrl?: string; customerAcceptedNotes?: string }
  ) =>
    request<Job>(`/jobs/${id}/signature`, {
      method: 'POST',
      body: JSON.stringify({
        signerName: data.signedBy || data.signerName || 'Customer',
        dataUrl: data.signatureBase64 || data.dataUrl || '',
        customerAcceptedNotes: data.customerAcceptedNotes,
      }),
    }),

  addJobPhoto: (id: string, photo: { url: string; caption: string; phase: string; latitude?: number; longitude?: number }) =>
    request<Job>(`/jobs/${id}/photos`, {
      method: 'POST',
      body: JSON.stringify(photo),
    }),

  // Technicians
  getTechnicians: () => request<Technician[]>('/technicians'),
  updateTechnician: (id: string, data: Partial<Technician>) =>
    request<Technician>(`/technicians/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  uploadTechnicianAvatar: (id: string, avatar: string) =>
    request<{ success: boolean; message: string; avatar: string; technician: Technician }>(`/technicians/${id}/avatar`, {
      method: 'POST',
      body: JSON.stringify({ avatar }),
    }),
  updateTechnicianLocation: (id: string, data: { status: Technician['activeStatus']; latitude?: number; longitude?: number }) =>
    request<Technician>(`/technicians/${id}/location`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Estimates
  getEstimates: () => request<Estimate[]>('/estimates'),
  getEstimateById: (id: string) =>
    request<{ estimate: Estimate; customer: Customer }>(`/estimates/${id}`),
  createEstimate: (data: Partial<Estimate>) =>
    request<Estimate>('/estimates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEstimate: (id: string, data: Partial<Estimate>) =>
    request<Estimate>(`/estimates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  convertEstimateToJob: (id: string) =>
    request<Job>(`/estimates/${id}/convert-job`, { method: 'POST' }),
  convertEstimateToInvoice: (id: string) =>
    request<Invoice>(`/estimates/${id}/convert-invoice`, { method: 'POST' }),

  // Invoices
  getInvoices: () => request<Invoice[]>('/invoices'),
  getInvoiceById: (id: string) =>
    request<{ invoice: Invoice; customer: Customer; payments: Payment[] }>(`/invoices/${id}`),
  createInvoice: (data: Partial<Invoice>) =>
    request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateInvoice: (id: string, data: Partial<Invoice>) =>
    request<Invoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Payments & M-Pesa
  getPayments: () => request<Payment[]>('/payments'),
  recordPayment: (data: {
    invoiceId: string;
    amount: number;
    paymentMethod: Payment['paymentMethod'];
    reference?: string;
    phoneNumber?: string;
    notes?: string;
  }) =>
    request<{ payment: Payment; invoice: Invoice | null }>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  triggerMpesaStkPush: (data: { invoiceId: string; phoneNumber: string; amount?: number }) =>
    request<{
      success: boolean;
      message: string;
      mpesaReceiptNumber: string;
      liveGatewayMode: boolean;
      payment: Payment;
      invoice: Invoice;
    }>('/payments/mpesa/stk-push', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Inventory
  getProducts: () => request<ProductInventory[]>('/inventory/products'),
  createProduct: (data: Partial<ProductInventory>) =>
    request<ProductInventory>('/inventory/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, data: Partial<ProductInventory>) =>
    request<ProductInventory>(`/inventory/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  adjustInventory: (data: { productId: string; quantity: number; notes: string }) =>
    request<ProductInventory>('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getWarehouses: () => request<Warehouse[]>('/inventory/warehouses'),
  getInventoryTransactions: () => request<InventoryTransaction[]>('/inventory/transactions'),

  // Forms
  getForms: () => request<CustomForm[]>('/forms'),
  getFormTemplates: () => request<CustomForm[]>('/forms'),
  createForm: (data: Partial<CustomForm>) =>
    request<CustomForm>('/forms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getFormSubmissions: (jobId?: string) =>
    request<FormSubmission[]>(`/forms/submissions${jobId ? `?jobId=${jobId}` : ''}`),
  submitForm: (data: Partial<FormSubmission>) =>
    request<FormSubmission>('/forms/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Notifications
  getNotifications: () => request<AppNotification[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' }),
  sendNotification: (data: { channel: string; recipient: string; message: string; title?: string }) =>
    request<{ success: boolean; notification: AppNotification; message: string }>('/notifications/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Reports
  getReports: () =>
    request<{
      totalRevenue: number;
      totalInvoiced: number;
      totalOutstanding: number;
      jobsCompleted: number;
      jobsCancelled: number;
      cancellationRate: number;
      repeatCustomerRate: number;
      technicianStats: Array<{
        id: string;
        name: string;
        specialization: string;
        rating: number;
        totalJobs: number;
        completedJobs: number;
        completionRate: number;
        billableLabour: number;
      }>;
      customerStats: Array<{
        id: string;
        name: string;
        company?: string;
        totalPaid: number;
        jobsCount: number;
      }>;
      totalPartsInStock: number;
    }>('/reports'),

  // Global Search
  search: (q: string) =>
    request<{
      customers: Customer[];
      jobs: Job[];
      estimates: Estimate[];
      invoices: Invoice[];
      technicians: Technician[];
      products: ProductInventory[];
    }>(`/search?q=${encodeURIComponent(q)}`),

  // Audit Logs
  getAuditLogs: () => request<AuditLog[]>('/audit-logs'),

  // PostgreSQL + Drizzle Database Status & Connectivity Test
  getDatabaseStatus: () =>
    request<{
      engine: string;
      orm: string;
      provider: string;
      connected: boolean;
      host?: string;
      error?: string;
      initializedAt?: string;
      supportedHosts: string[];
    }>('/database/status'),

  testDatabaseConnection: () =>
    request<{ success: boolean; status: any }>('/database/test', {
      method: 'POST',
    }),
};
