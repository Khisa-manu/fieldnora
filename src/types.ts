export type UserRole = 'admin' | 'dispatcher' | 'technician' | 'accountant' | 'readonly';

export interface User {
  id: string;
  orgId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'invited' | 'disabled';
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  county: string;
  country: string;
  currency: 'KES' | 'USD';
  taxRate: number; // 16% in Kenya default
  eTimsEnabled: boolean;
  mpesaPaybill?: string;
  mpesaTill?: string;
  logo?: string;
  createdAt: string;
}

export interface ServiceLocation {
  id: string;
  name: string; // e.g. "Main House", "Workshop", "Warehouse 2"
  address: string;
  county: string;
  area: string;
  latitude: number;
  longitude: number;
  contactPerson?: string;
  contactPhone?: string;
  gateCodeNotes?: string;
}

export interface Customer {
  id: string;
  orgId: string;
  type: 'individual' | 'company';
  name: string;
  companyName?: string;
  phone: string;
  email: string;
  address: string;
  county: string;
  area: string;
  latitude: number;
  longitude: number;
  notes: string;
  tags: string[];
  serviceLocations: ServiceLocation[];
  createdAt: string;
  updatedAt: string;
}

export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export type JobStatus =
  | 'new'
  | 'scheduled'
  | 'assigned'
  | 'en_route'
  | 'on_site'
  | 'in_progress'
  | 'waiting'
  | 'completed'
  | 'cancelled';

export interface JobLabourItem {
  id: string;
  description: string;
  technicianId?: string;
  technicianName?: string;
  hours: number;
  hourlyRate: number;
  total: number;
  totalPrice?: number;
}

export interface JobMaterialItem {
  id: string;
  productId?: string;
  name: string;
  sku?: string;
  quantity: number;
  unitCost?: number;
  unitPrice: number;
  total: number;
  totalPrice?: number;
}

export interface JobExpenseItem {
  id: string;
  description: string;
  category: 'travel' | 'permits' | 'tools' | 'other';
  amount: number;
}

export interface JobPhoto {
  id: string;
  url: string;
  caption: string;
  phase: 'before' | 'during' | 'after';
  timestamp: string;
  latitude?: number;
  longitude?: number;
}

export interface JobDocument {
  id: string;
  name: string;
  url: string;
  size: string;
  uploadedAt: string;
}

export interface JobSignature {
  signerName: string;
  signedAt: string;
  dataUrl: string;
  signatureDataUrl?: string;
  customerAcceptedNotes?: string;
}

export interface JobChecklistItem {
  id: string;
  label: string;
  checked?: boolean;
  completed?: boolean;
  required?: boolean;
  completedAt?: string;
}

export interface Job {
  id: string;
  orgId: string;
  jobNumber: string;
  customerId: string;
  serviceLocationId?: string;
  title: string;
  description: string;
  priority: JobPriority;
  status: JobStatus;
  assignedTechnicianIds: string[];
  scheduledDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  estimatedDurationMin?: number;
  estimatedDurationMinutes?: number;
  actualDurationMin?: number;
  labour: JobLabourItem[];
  materials: JobMaterialItem[];
  expenses: JobExpenseItem[];
  internalNotes?: string;
  customerNotes?: string;
  photos: JobPhoto[];
  documents: JobDocument[];
  customerSignature?: JobSignature;
  checklist: JobChecklistItem[];
  completionNotes?: string;
  travelStartTime?: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInLat?: number;
  checkInLng?: number;
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Technician {
  id: string;
  orgId: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  specialization: string; // Plumbing, Electrical, HVAC, etc.
  vehicleReg: string;
  activeStatus: 'available' | 'en_route' | 'on_job' | 'offline';
  currentLat: number;
  currentLng: number;
  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationUpdate: string;
  rating: number;
  completedJobsCount?: number;
  skills: string[];
}

export interface LineItem {
  id: string;
  type: 'labour' | 'product' | 'service' | 'material';
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total: number;
}

export interface InvoiceItem extends LineItem {}

export interface Estimate {
  id: string;
  orgId: string;
  estimateNumber: string;
  customerId: string;
  title?: string;
  status: 'draft' | 'sent' | 'approved' | 'declined' | 'converted';
  date?: string;
  expiryDate: string;
  items: LineItem[];
  subtotal: number;
  discountTotal?: number;
  taxRate?: number;
  taxAmount: number;
  totalAmount: number;
  notes: string;
  terms?: string;
  customerNotes?: string;
  approvedAt?: string;
  convertedJobId?: string;
  convertedInvoiceId?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  orgId: string;
  invoiceNumber: string;
  customerId: string;
  jobId?: string;
  estimateId?: string;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  issueDate?: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  discountTotal?: number;
  taxRate?: number;
  taxAmount: number;
  totalAmount: number;
  depositAmount?: number;
  paidAmount?: number;
  amountPaid?: number;
  balanceDue: number;
  notes: string;
  terms?: string;
  etimsControlCode?: string;
  etimsCuSerialNumber?: string;
  eTimsData?: {
    controlCode: string;
    qrData: string;
    cuSerialNumber: string;
    taxInvoiceType: string;
  };
  createdAt: string;
}

export interface Payment {
  id: string;
  orgId: string;
  invoiceId: string;
  invoiceNumber?: string;
  customerId?: string;
  amount: number;
  paymentMethod: 'mpesa' | 'card' | 'bank_transfer' | 'cash' | 'other' | 'cheque';
  reference: string; // e.g. M-Pesa receipt code
  phoneNumber?: string;
  status?: 'completed' | 'pending' | 'failed';
  notes?: string;
  paymentDate?: string;
  receivedAt?: string;
  receivedBy?: string;
}

export interface ProductInventory {
  id: string;
  orgId: string;
  sku: string;
  name: string;
  description?: string;
  type?: 'product' | 'service' | 'part';
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  warehouseId?: string;
  unit?: string;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  orgId: string;
  name: string;
  location: string;
  address?: string;
  isMain: boolean;
  isMobile?: boolean;
  technicianId?: string;
}

export interface InventoryTransaction {
  id: string;
  orgId: string;
  productId: string;
  productName?: string;
  type: 'purchase' | 'job_consumption' | 'transfer' | 'adjustment' | 'in' | 'out';
  quantity: number;
  previousQuantity?: number;
  newQuantity?: number;
  referenceId?: string;
  notes: string;
  timestamp: string;
  userName?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'dropdown' | 'multichoice' | 'photo' | 'signature' | 'datetime' | 'checkbox' | 'select';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormTemplate {
  id: string;
  orgId: string;
  title: string;
  category: string;
  description: string;
  version?: number;
  fields: FormField[];
  createdAt: string;
}

export interface CustomForm extends FormTemplate {}

export interface FormSubmission {
  id: string;
  orgId: string;
  formId?: string;
  templateId?: string;
  jobId?: string;
  submittedBy: string;
  submittedAt: string;
  answers?: Record<string, any>;
  data?: Record<string, any>;
  signatureUrl?: string;
}

export interface AppNotification {
  id: string;
  orgId: string;
  userId?: string;
  title: string;
  message: string;
  type: 'appointment' | 'dispatch' | 'status' | 'invoice' | 'payment' | 'inventory';
  channel: 'in_app' | 'sms' | 'whatsapp' | 'email';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  orgId: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityType?: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  details?: any;
  timestamp: string;
  ipAddress?: string;
}
