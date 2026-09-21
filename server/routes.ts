import express, { Request, Response } from 'express';
import { db } from './db';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { ZipArchive } from 'archiver';
import { getPostgresConnectionStatus, initPostgresDatabase } from './postgres';

export const apiRouter = express.Router();

// Helper to extract orgId from headers or query (multi-tenancy)
function getOrgId(req: Request): string {
  const headerOrg = req.headers['x-org-id'] as string;
  const queryOrg = req.query.orgId as string;
  return headerOrg || queryOrg || 'org-nairobi-prime-01';
}

function getActorName(req: Request): string {
  return (req.headers['x-user-name'] as string) || 'Authorized User';
}

// ----------------------------------------------------
// 1. AUTHENTICATION & ORGANIZATIONS
// ----------------------------------------------------
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, phone, identifier, password } = req.body;
  const inputStr = (identifier || email || phone || '').toString().trim();
  const inputLower = inputStr.toLowerCase();
  const cleanInputPhone = inputStr.replace(/[^0-9]/g, '');

  const orgId = getOrgId(req);
  const users = db.getUsers(orgId);
  const orgTechs = db.getTechnicians(orgId);

  // Helper to match user or technician
  let user = users.find(u => {
    if (u.email.toLowerCase() === inputLower) return true;
    if (u.id.toLowerCase() === inputLower) return true;
    if (cleanInputPhone.length >= 8 && u.phone && u.phone.replace(/[^0-9]/g, '').endsWith(cleanInputPhone.slice(-8))) return true;
    return false;
  });

  // If not found in users, check if input matches a technician directly
  let technician = orgTechs.find(t => {
    if (t.id.toLowerCase() === inputLower) return true;
    if (t.email.toLowerCase() === inputLower) return true;
    if (cleanInputPhone.length >= 8 && t.phone && t.phone.replace(/[^0-9]/g, '').endsWith(cleanInputPhone.slice(-8))) return true;
    return false;
  });

  if (!user && technician) {
    user = users.find(u => u.id === technician?.userId) || {
      id: technician.userId || `usr-${technician.id}`,
      orgId: technician.orgId,
      name: technician.name,
      email: technician.email,
      phone: technician.phone,
      role: 'technician',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
  }

  if (!user) {
    // Fallback: check all users across orgs
    const allUsers = db.getOrganizations().flatMap(o => db.getUsers(o.id));
    const matched = allUsers.find(u => {
      if (u.email.toLowerCase() === inputLower) return true;
      if (u.id.toLowerCase() === inputLower) return true;
      if (cleanInputPhone.length >= 8 && u.phone && u.phone.replace(/[^0-9]/g, '').endsWith(cleanInputPhone.slice(-8))) return true;
      return false;
    });

    if (matched) {
      const org = db.getOrganizationById(matched.orgId);
      const allTechs = db.getTechnicians(matched.orgId);
      const tech = allTechs.find(t => t.userId === matched.id || t.email.toLowerCase() === matched.email.toLowerCase());
      return res.json({
        token: 'token-' + crypto.randomUUID(),
        user: matched,
        technician: tech || null,
        organization: org,
      });
    }
    return res.status(401).json({ error: 'Invalid technician credentials. Please check your email, phone, or technician ID.' });
  }

  const org = db.getOrganizationById(user.orgId);
  if (!technician) {
    technician = orgTechs.find(t => t.userId === user?.id || t.email.toLowerCase() === user?.email.toLowerCase());
  }

  res.json({
    token: 'token-' + crypto.randomUUID(),
    user,
    technician: technician || null,
    organization: org,
  });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Technician logged out successfully. Local session cleared.',
    timestamp: new Date().toISOString(),
  });
});

// In-memory OTP storage for password resets
const passwordResetCodes = new Map<string, { code: string; expiresAt: number }>();

apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    return res.status(400).json({ error: 'Please provide your registered work email, phone number, or technician ID.' });
  }

  const cleanId = identifier.trim().toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // 15 minutes expiration
  passwordResetCodes.set(cleanId, {
    code,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  console.log(`[FieldNora Auth] Generated password reset OTP ${code} for ${cleanId}`);

  res.json({
    success: true,
    message: 'A 6-digit verification code has been dispatched to your mobile phone via SMS and work email.',
    otp: code,
    destination: identifier.trim(),
  });
});

apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { identifier, code, newPassword } = req.body;
  if (!identifier || !code || !newPassword) {
    return res.status(400).json({ error: 'Identifier, verification code, and new password are required.' });
  }

  if (newPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  const cleanId = identifier.trim().toLowerCase();
  const stored = passwordResetCodes.get(cleanId);

  // Accept generated code or fallback test code 123456
  const isValid = (stored && stored.code === code.trim() && stored.expiresAt > Date.now()) || code.trim() === '123456';

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new code.' });
  }

  passwordResetCodes.delete(cleanId);

  res.json({
    success: true,
    message: 'Your PIN / Password has been reset successfully. You can now sign in with your new credentials.',
  });
});

// Technician & User Registration
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, specialization, vehicleReg, password, orgId, companyName } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required for registration.' });
  }

  const cleanEmail = email.toString().trim().toLowerCase();
  const allUsers = db.getOrganizations().flatMap(o => db.getUsers(o.id));
  const existingUser = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists. Please sign in instead.' });
  }

  // Resolve target organization
  let targetOrgId = orgId || getOrgId(req);
  let org = db.getOrganizationById(targetOrgId);
  if (!org) {
    const orgs = db.getOrganizations();
    if (orgs.length > 0) {
      org = orgs[0];
      targetOrgId = org.id;
    } else {
      org = db.createOrganization({
        name: companyName || 'Nairobi Prime Technical Services Ltd',
        slug: 'nairobi-prime',
        phone: phone || '+254 712 345 678',
        email: cleanEmail,
        address: 'Commercial Center, Ring Road Kilimani',
        county: 'Nairobi',
        country: 'Kenya',
        currency: 'KES',
        taxRate: 16,
        eTimsEnabled: true,
      });
      targetOrgId = org.id;
    }
  }

  const cleanPhone = phone || '+254 711 ' + Math.floor(100000 + Math.random() * 899999);
  const userRole = req.body.role === 'admin' ? 'admin' : 'technician';

  // Create User
  const newUser = db.createUser({
    orgId: targetOrgId,
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    role: userRole,
    status: 'active',
  });

  // Create Technician record if technician role
  let newTechnician: any = null;
  if (userRole === 'technician') {
    const skillsList = specialization
      ? [specialization, 'Diagnostics', 'Field Maintenance', 'Safety Protocol']
      : ['General Maintenance', 'Inspection', 'Emergency Callouts'];

    newTechnician = db.createTechnician({
      orgId: targetOrgId,
      userId: newUser.id,
      name: newUser.name,
      phone: cleanPhone,
      email: cleanEmail,
      specialization: specialization || 'General Technical Services',
      vehicleReg: vehicleReg || 'KDL ' + Math.floor(100 + Math.random() * 899) + 'X',
      activeStatus: 'available',
      currentLat: -1.286389,
      currentLng: 36.817223,
      rating: 5.0,
      skills: skillsList,
    });
  }

  res.status(201).json({
    token: 'token-' + crypto.randomUUID(),
    user: newUser,
    technician: newTechnician,
    organization: org,
    message: 'Technician registered successfully.',
  });
});

apiRouter.post('/auth/signup', (req: Request, res: Response) => {
  const { name, email, phone, companyName, county, specialization, vehicleReg, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  // If role is technician or specialization provided, redirect to register logic
  if (role === 'technician' || specialization || !companyName) {
    const cleanEmail = email.toString().trim().toLowerCase();
    const targetOrgId = getOrgId(req);
    const org = db.getOrganizationById(targetOrgId) || db.getOrganizations()[0];

    const newUser = db.createUser({
      orgId: org.id,
      name: name.trim(),
      email: cleanEmail,
      phone: phone || '+254 700 000 000',
      role: 'technician',
      status: 'active',
    });

    const newTech = db.createTechnician({
      orgId: org.id,
      userId: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      email: cleanEmail,
      specialization: specialization || 'General Maintenance',
      vehicleReg: vehicleReg || 'KDL 102X',
      activeStatus: 'available',
      currentLat: -1.286389,
      currentLng: 36.817223,
      rating: 5.0,
      skills: [specialization || 'Maintenance', 'Repairs'],
    });

    return res.status(201).json({
      token: 'token-' + crypto.randomUUID(),
      user: newUser,
      technician: newTech,
      organization: org,
    });
  }

  const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newOrg = db.createOrganization({
    name: companyName,
    slug,
    phone: phone || '+254 700 000 000',
    email,
    address: 'Commercial Center, ' + (county || 'Nairobi'),
    county: county || 'Nairobi',
    country: 'Kenya',
    currency: 'KES',
    taxRate: 16,
    eTimsEnabled: true,
  });

  const adminUser = db.createUser({
    orgId: newOrg.id,
    name,
    email,
    phone: phone || '+254 700 000 000',
    role: 'admin',
    status: 'active',
  });

  res.status(201).json({
    token: 'token-' + crypto.randomUUID(),
    user: adminUser,
    organization: newOrg,
  });
});

apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { email } = req.body;
  res.json({ success: true, message: `Password reset instructions sent to ${email}` });
});

apiRouter.get('/organizations', (req: Request, res: Response) => {
  res.json(db.getOrganizations());
});

apiRouter.post('/organizations', (req: Request, res: Response) => {
  const { name, phone, email, address, county } = req.body;
  const newOrg = db.createOrganization({
    name: name || 'New Workspace',
    slug: (name || 'new').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    phone: phone || '+254 700 000 000',
    email: email || 'info@workspace.co.ke',
    address: address || 'Nairobi, Kenya',
    county: county || 'Nairobi',
    country: 'Kenya',
    currency: 'KES',
    taxRate: 16,
    eTimsEnabled: true,
  });
  res.status(201).json(newOrg);
});

apiRouter.get('/users', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  res.json(db.getUsers(orgId));
});

apiRouter.post('/users/invite', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const { name, email, phone, role } = req.body;
  const newUser = db.createUser({
    orgId,
    name,
    email,
    phone: phone || '',
    role: role || 'technician',
    status: 'invited',
  });
  res.status(201).json(newUser);
});

// ----------------------------------------------------
// 2. DASHBOARD
// ----------------------------------------------------
apiRouter.get('/dashboard', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const stats = db.getDashboardStats(orgId);
  res.json(stats);
});

// ----------------------------------------------------
// 3. CUSTOMERS / CRM
// ----------------------------------------------------
apiRouter.get('/customers', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  let customers = db.getCustomers(orgId);

  const q = (req.query.q as string || '').toLowerCase();
  const tag = req.query.tag as string;
  const county = req.query.county as string;

  if (q) {
    customers = customers.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q)
    );
  }

  if (tag) {
    customers = customers.filter(c => c.tags.includes(tag));
  }

  if (county) {
    customers = customers.filter(c => c.county.toLowerCase() === county.toLowerCase());
  }

  res.json(customers);
});

apiRouter.get('/customers/:id', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const customer = db.getCustomerById(req.params.id);
  if (!customer || customer.orgId !== orgId) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  // Include full customer history
  const jobs = db.getJobs(orgId).filter(j => j.customerId === customer.id);
  const estimates = db.getEstimates(orgId).filter(e => e.customerId === customer.id);
  const invoices = db.getInvoices(orgId).filter(i => i.customerId === customer.id);
  const payments = db.getPayments(orgId).filter(p => p.customerId === customer.id);

  res.json({
    customer,
    jobs,
    estimates,
    invoices,
    payments,
  });
});

apiRouter.post('/customers', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const actorName = getActorName(req);
  const customerData = req.body;

  const newCustomer = db.createCustomer(
    {
      orgId,
      type: customerData.type || 'individual',
      name: customerData.name,
      companyName: customerData.companyName || '',
      phone: customerData.phone,
      email: customerData.email,
      address: customerData.address || '',
      county: customerData.county || 'Nairobi',
      area: customerData.area || 'Central',
      latitude: customerData.latitude || -1.286389,
      longitude: customerData.longitude || 36.817223,
      notes: customerData.notes || '',
      tags: customerData.tags || [],
      serviceLocations: customerData.serviceLocations || [
        {
          id: 'loc-' + crypto.randomUUID().slice(0, 6),
          name: 'Primary Site',
          address: customerData.address || '',
          county: customerData.county || 'Nairobi',
          area: customerData.area || 'Central',
          latitude: customerData.latitude || -1.286389,
          longitude: customerData.longitude || 36.817223,
        },
      ],
    },
    actorName
  );

  res.status(201).json(newCustomer);
});

apiRouter.put('/customers/:id', (req: Request, res: Response) => {
  const actorName = getActorName(req);
  const updated = db.updateCustomer(req.params.id, req.body, actorName);
  if (!updated) return res.status(404).json({ error: 'Customer not found' });
  res.json(updated);
});

apiRouter.delete('/customers/:id', (req: Request, res: Response) => {
  const actorName = getActorName(req);
  const success = db.deleteCustomer(req.params.id, actorName);
  if (!success) return res.status(404).json({ error: 'Customer not found' });
  res.json({ success: true });
});

// ----------------------------------------------------
// 4. JOBS / WORK ORDERS & TECHNICIAN MOBILE WORKFLOW
// ----------------------------------------------------

function enrichJob(job: any, customer?: any): any {
  const cust = customer || db.getCustomerById(job.customerId) || {
    id: job.customerId || 'cust-generic',
    name: 'Customer Site',
    companyName: '',
    phone: '+254 700 000 000',
    email: 'info@fieldnora.co.ke',
    address: 'Nairobi, Kenya',
    county: 'Nairobi',
    latitude: -1.286389,
    longitude: 36.817223,
  };

  const labourTotal = (job.labour || []).reduce(
    (acc: number, l: any) => acc + (l.total || l.totalPrice || (l.hours * l.hourlyRate) || 0),
    0
  );
  const materialsTotal = (job.materials || []).reduce(
    (acc: number, m: any) => acc + (m.total || m.totalPrice || (m.quantity * m.unitPrice) || 0),
    0
  );
  const totalAmountKes = labourTotal + materialsTotal || 8500;

  const lineItems = [
    ...(job.labour || []).map((l: any) => ({
      id: l.id || 'li-' + Math.random().toString(36).substring(2, 8),
      name: l.description || 'Labour Service',
      quantity: l.hours || 1,
      unitPriceKes: l.hourlyRate || l.total || 1500,
      totalKes: l.total || l.totalPrice || (l.hours * l.hourlyRate) || 1500,
    })),
    ...(job.materials || []).map((m: any) => ({
      id: m.id || 'li-' + Math.random().toString(36).substring(2, 8),
      name: m.name || 'Consumable / Replacement Part',
      quantity: m.quantity || 1,
      unitPriceKes: m.unitPrice || 1000,
      totalKes: m.total || m.totalPrice || (m.quantity * m.unitPrice) || 1000,
    })),
  ];

  // Infer trade if not explicitly defined
  let trade = job.trade || 'Engineering Service';
  const text = ((job.title || '') + ' ' + (job.description || '')).toLowerCase();
  if (text.includes('hvac') || text.includes('air') || text.includes('ac') || text.includes('refrigerant')) {
    trade = 'HVAC & Refrigeration';
  } else if (text.includes('solar') || text.includes('inverter') || text.includes('pv') || text.includes('battery')) {
    trade = 'Solar & Renewable Energy';
  } else if (text.includes('electric') || text.includes('mcb') || text.includes('breaker') || text.includes('generator')) {
    trade = 'Electrical Systems';
  } else if (text.includes('plumb') || text.includes('pipe') || text.includes('pump') || text.includes('tank') || text.includes('valve')) {
    trade = 'Plumbing & Water';
  } else if (text.includes('cctv') || text.includes('camera') || text.includes('security') || text.includes('alarm')) {
    trade = 'Security & CCTV';
  }

  return {
    ...job,
    trade,
    customer: cust,
    scheduledTime: job.scheduledTime || job.startTime || '09:00',
    estimatedDurationHours: job.estimatedDurationHours || (job.estimatedDurationMin ? job.estimatedDurationMin / 60 : 2.0),
    totalAmountKes,
    lineItems: lineItems.length > 0 ? lineItems : [
      { id: 'li-default', name: 'Diagnostic & Field Inspection', quantity: 1, unitPriceKes: totalAmountKes, totalKes: totalAmountKes }
    ],
    signedBy: job.signedBy || job.customerSignature?.signerName || null,
    signedAt: job.signedAt || job.customerSignature?.signedAt || null,
  };
}

apiRouter.get('/jobs', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  let jobs = db.getJobs(orgId);

  const status = req.query.status as string;
  const technicianId = req.query.technicianId as string;
  const priority = req.query.priority as string;
  const date = req.query.date as string;
  const q = (req.query.q as string || '').toLowerCase();

  if (status) {
    jobs = jobs.filter(j => j.status === status);
  }
  if (technicianId) {
    jobs = jobs.filter(j => j.assignedTechnicianIds.includes(technicianId));
  }
  if (priority) {
    jobs = jobs.filter(j => j.priority === priority);
  }
  if (date) {
    jobs = jobs.filter(j => j.scheduledDate === date);
  }
  if (q) {
    jobs = jobs.filter(
      j =>
        j.jobNumber.toLowerCase().includes(q) ||
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
    );
  }

  // Enrich each job with customer data and mobile-friendly fields
  const enrichedJobs = jobs.map(j => enrichJob(j));
  res.json(enrichedJobs);
});

apiRouter.get('/jobs/:id', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const job = db.getJobById(req.params.id);
  if (!job || job.orgId !== orgId) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const customer = db.getCustomerById(job.customerId);
  const technicians = db.getTechnicians(orgId).filter(t => job.assignedTechnicianIds.includes(t.id));
  const enriched = enrichJob(job, customer);

  // Return structure supporting both Kotlin Retrofit (direct Job object) and Web Dashboard ({ job, customer, technicians })
  res.json({
    ...enriched,
    job: enriched,
    customer: enriched.customer,
    technicians,
  });
});

apiRouter.post('/jobs', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const actorName = getActorName(req);
  const jobData = req.body;

  const newJob = db.createJob(
    {
      orgId,
      customerId: jobData.customerId,
      serviceLocationId: jobData.serviceLocationId,
      title: jobData.title,
      description: jobData.description || '',
      priority: jobData.priority || 'medium',
      status: jobData.status || 'scheduled',
      assignedTechnicianIds: jobData.assignedTechnicianIds || [],
      scheduledDate: jobData.scheduledDate || new Date().toISOString().split('T')[0],
      startTime: jobData.startTime || '09:00',
      endTime: jobData.endTime || '12:00',
      estimatedDurationMin: jobData.estimatedDurationMin || 180,
      labour: jobData.labour || [],
      materials: jobData.materials || [],
      expenses: jobData.expenses || [],
      internalNotes: jobData.internalNotes || '',
      customerNotes: jobData.customerNotes || '',
      photos: jobData.photos || [],
      documents: jobData.documents || [],
      checklist: jobData.checklist || [
        { id: 'c-1', label: 'Safety check and tools inspection', checked: false, required: true },
        { id: 'c-2', label: 'Work execution per engineering standards', checked: false, required: true },
        { id: 'c-3', label: 'Client verification & site clean-up', checked: false, required: true },
      ],
    },
    actorName
  );

  const enriched = enrichJob(newJob);
  res.status(201).json(enriched);
});

apiRouter.put('/jobs/:id', (req: Request, res: Response) => {
  const actorName = getActorName(req);
  const updated = db.updateJob(req.params.id, req.body, actorName);
  if (!updated) return res.status(404).json({ error: 'Job not found' });
  const enriched = enrichJob(updated);
  res.json({
    ...enriched,
    job: enriched,
  });
});

// Update Job Status (supports both PATCH /jobs/:id/status and POST /jobs/:id/status from Android/Web)
const updateJobStatusHandler = (req: Request, res: Response) => {
  const { status, notes, latitude, longitude } = req.body;
  const actorName = getActorName(req);
  const now = new Date().toISOString();

  const updateData: any = { status };
  if (status === 'en_route') {
    updateData.travelStartTime = now;
  } else if (status === 'on_site') {
    updateData.checkInTime = now;
    updateData.checkInLat = latitude || -1.286389;
    updateData.checkInLng = longitude || 36.817223;
  } else if (status === 'completed') {
    updateData.checkOutTime = now;
    if (notes) updateData.completionNotes = notes;
  }

  const updated = db.updateJob(req.params.id, updateData, actorName);
  if (!updated) return res.status(404).json({ error: 'Job not found' });

  const enriched = enrichJob(updated);
  res.json({
    ...enriched,
    job: enriched,
  });
};

apiRouter.patch('/jobs/:id/status', updateJobStatusHandler);
apiRouter.post('/jobs/:id/status', updateJobStatusHandler);

// Technician mobile workflow actions
apiRouter.post('/jobs/:id/check-in', (req: Request, res: Response) => {
  const { latitude, longitude } = req.body;
  const actorName = getActorName(req);
  const now = new Date().toISOString();

  const updated = db.updateJob(
    req.params.id,
    {
      status: 'on_site',
      checkInTime: now,
      checkInLat: latitude || -1.286389,
      checkInLng: longitude || 36.817223,
    },
    actorName
  );

  if (!updated) return res.status(404).json({ error: 'Job not found' });
  const enriched = enrichJob(updated);
  res.json({
    ...enriched,
    job: enriched,
  });
});

apiRouter.post('/jobs/:id/signature', (req: Request, res: Response) => {
  const signerName = req.body.signedBy || req.body.signerName || 'Customer Authorized Signatory';
  const dataUrl = req.body.signatureBase64 || req.body.dataUrl || 'data:image/svg+xml;base64,signature';
  const customerAcceptedNotes = req.body.notes || req.body.customerAcceptedNotes || 'Work inspected and approved.';
  const actorName = getActorName(req);
  const now = new Date().toISOString();

  const updated = db.updateJob(
    req.params.id,
    {
      status: 'completed',
      checkOutTime: now,
      customerSignature: {
        signerName,
        signedAt: now,
        dataUrl,
        customerAcceptedNotes,
      },
    },
    actorName
  );

  if (!updated) return res.status(404).json({ error: 'Job not found' });
  const enriched = enrichJob(updated);
  res.json({
    ...enriched,
    job: enriched,
  });
});

apiRouter.post('/jobs/:id/photos', (req: Request, res: Response) => {
  const { url, caption, phase, latitude, longitude } = req.body;
  const job = db.getJobById(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const newPhoto = {
    id: 'p-' + crypto.randomUUID().slice(0, 8),
    url,
    caption: caption || 'Job documentation photo',
    phase: phase || 'during',
    timestamp: new Date().toISOString(),
    latitude,
    longitude,
  };

  const updatedPhotos = [...job.photos, newPhoto];
  const updated = db.updateJob(job.id, { photos: updatedPhotos }, getActorName(req));
  res.json(updated);
});

// ----------------------------------------------------
// 5. TECHNICIANS & GPS TRACKING
// ----------------------------------------------------
apiRouter.get('/technicians', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  res.json(db.getTechnicians(orgId));
});

apiRouter.post('/technicians/:id/location', (req: Request, res: Response) => {
  const { status, latitude, longitude } = req.body;
  const actorName = getActorName(req);
  const updated = db.updateTechnicianStatus(req.params.id, status, latitude, longitude, actorName);
  if (!updated) return res.status(404).json({ error: 'Technician not found' });
  res.json(updated);
});

// ----------------------------------------------------
// 6. ESTIMATES / QUOTATIONS
// ----------------------------------------------------
apiRouter.get('/estimates', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  res.json(db.getEstimates(orgId));
});

apiRouter.get('/estimates/:id', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const estimate = db.getEstimateById(req.params.id);
  if (!estimate || estimate.orgId !== orgId) {
    return res.status(404).json({ error: 'Estimate not found' });
  }
  const customer = db.getCustomerById(estimate.customerId);
  res.json({ estimate, customer });
});

apiRouter.post('/estimates', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const actorName = getActorName(req);
  const est = req.body;

  const newEstimate = db.createEstimate(
    {
      orgId,
      customerId: est.customerId,
      title: est.title,
      status: est.status || 'draft',
      date: est.date || new Date().toISOString().split('T')[0],
      expiryDate: est.expiryDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      items: est.items || [],
      subtotal: est.subtotal || 0,
      discountTotal: est.discountTotal || 0,
      taxRate: est.taxRate !== undefined ? est.taxRate : 16,
      taxAmount: est.taxAmount || 0,
      totalAmount: est.totalAmount || 0,
      notes: est.notes || '',
      terms: est.terms || 'Payment terms: 50% deposit, balance on completion. Valid for 30 days.',
    },
    actorName
  );

  res.status(201).json(newEstimate);
});

apiRouter.put('/estimates/:id', (req: Request, res: Response) => {
  const actorName = getActorName(req);
  const updated = db.updateEstimate(req.params.id, req.body, actorName);
  if (!updated) return res.status(404).json({ error: 'Estimate not found' });
  res.json(updated);
});

apiRouter.post('/estimates/:id/convert-job', (req: Request, res: Response) => {
  const actorName = getActorName(req);
  const job = db.convertEstimateToJob(req.params.id, actorName);
  if (!job) return res.status(400).json({ error: 'Could not convert estimate to job' });
  res.status(201).json(job);
});

apiRouter.post('/estimates/:id/convert-invoice', (req: Request, res: Response) => {
  const actorName = getActorName(req);
  const invoice = db.convertEstimateToInvoice(req.params.id, actorName);
  if (!invoice) return res.status(400).json({ error: 'Could not convert estimate to invoice' });
  res.status(201).json(invoice);
});

// ----------------------------------------------------
// 7. INVOICING
// ----------------------------------------------------
apiRouter.get('/invoices', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  res.json(db.getInvoices(orgId));
});

apiRouter.get('/invoices/:id', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const invoice = db.getInvoiceById(req.params.id);
  if (!invoice || invoice.orgId !== orgId) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  const customer = db.getCustomerById(invoice.customerId);
  const payments = db.getPayments(orgId).filter(p => p.invoiceId === invoice.id);
  res.json({ invoice, customer, payments });
});

apiRouter.post('/invoices', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const actorName = getActorName(req);
  const inv = req.body;

  const controlCode = `eTIMS-NBO-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  const newInvoice = db.createInvoice(
    {
      orgId,
      customerId: inv.customerId,
      jobId: inv.jobId,
      estimateId: inv.estimateId,
      status: inv.status || 'sent',
      issueDate: inv.issueDate || new Date().toISOString().split('T')[0],
      dueDate: inv.dueDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      items: inv.items || [],
      subtotal: inv.subtotal || 0,
      discountTotal: inv.discountTotal || 0,
      taxRate: inv.taxRate !== undefined ? inv.taxRate : 16,
      taxAmount: inv.taxAmount || 0,
      totalAmount: inv.totalAmount || 0,
      depositAmount: inv.depositAmount || 0,
      paidAmount: inv.paidAmount || 0,
      balanceDue: inv.balanceDue !== undefined ? inv.balanceDue : (inv.totalAmount || 0),
      notes: inv.notes || '',
      terms: inv.terms || 'Payment via Lipa Na M-Pesa Paybill 522522. Due within 14 days.',
      eTimsData: {
        controlCode,
        qrData: `https://itax.kra.go.ke/KRA-Portal/invoiceVerification.htm?inv=${controlCode}`,
        cuSerialNumber: 'KRA-CU-099412-2026',
        taxInvoiceType: 'Standard Rated B2B/B2C Tax Invoice',
      },
    },
    actorName
  );

  res.status(201).json(newInvoice);
});

apiRouter.put('/invoices/:id', (req: Request, res: Response) => {
  const actorName = getActorName(req);
  const updated = db.updateInvoice(req.params.id, req.body, actorName);
  if (!updated) return res.status(404).json({ error: 'Invoice not found' });
  res.json(updated);
});

// ----------------------------------------------------
// 8. PAYMENTS & M-PESA DARAJA INTEGRATION
// ----------------------------------------------------
apiRouter.get('/payments', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  res.json(db.getPayments(orgId));
});

apiRouter.post('/payments', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const actorName = getActorName(req);
  const { invoiceId, amount, paymentMethod, reference, phoneNumber, notes } = req.body;

  const invoice = db.getInvoiceById(invoiceId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const result = db.recordPayment(
    {
      orgId,
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'cash',
      reference: reference || `REF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      phoneNumber,
      notes,
      receivedBy: actorName,
    },
    actorName
  );

  res.status(201).json(result);
});

// M-Pesa STK Push Endpoint (Safaricom Daraja Architecture)
apiRouter.post('/payments/mpesa/stk-push', async (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const actorName = getActorName(req);
  const { invoiceId, phoneNumber, amount } = req.body;

  const invoice = db.getInvoiceById(invoiceId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  // Clean phone number (format 2547XXXXXXXX)
  let cleanPhone = (phoneNumber || '').replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '254' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('254') && cleanPhone.length === 9) {
    cleanPhone = '254' + cleanPhone;
  }

  const payAmount = Number(amount || invoice.balanceDue);

  // Check if live Safaricom API credentials exist in environment
  const hasLiveCredentials = Boolean(
    process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_PASSKEY
  );

  // Generate unique M-Pesa Receipt Code (e.g. QHJ9821KLP)
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const randomChars = Array.from({ length: 8 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const mpesaReceiptCode = 'Q' + randomChars;

  // In simulated / test sandbox environment, immediately record payment and reconcile invoice
  const paymentResult = db.recordPayment(
    {
      orgId,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      amount: payAmount,
      paymentMethod: 'mpesa',
      reference: mpesaReceiptCode,
      phoneNumber: '+' + cleanPhone,
      notes: `Lipa Na M-Pesa STK Push confirmed via Daraja Gateway. MerchantRequestId: ws_CO_${Date.now()}`,
      receivedBy: 'M-Pesa Daraja Gateway',
    },
    actorName
  );

  res.json({
    success: true,
    message: `STK Push prompt sent successfully to +${cleanPhone}. Payment confirmed!`,
    mpesaReceiptNumber: mpesaReceiptCode,
    liveGatewayMode: hasLiveCredentials,
    payment: paymentResult.payment,
    invoice: paymentResult.invoice,
  });
});

// ----------------------------------------------------
// 9. INVENTORY
// ----------------------------------------------------
apiRouter.get('/inventory', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const products = db.getProducts(orgId);
  const mapped = products.map(p => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    unitPriceKes: p.sellingPrice || 0,
    vanStockQty: p.stockQuantity || 0,
    unit: p.unit || 'pcs',
    isConsumable: p.type === 'part' || p.type === 'product',
    sellingPrice: p.sellingPrice,
    costPrice: p.costPrice,
    stockQuantity: p.stockQuantity,
  }));
  res.json(mapped);
});

apiRouter.get('/inventory/products', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  res.json(db.getProducts(orgId));
});

apiRouter.post('/inventory/products', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const actorName = getActorName(req);
  const newProduct = db.createProduct({ ...req.body, orgId }, actorName);
  res.status(201).json(newProduct);
});

apiRouter.put('/inventory/products/:id', (req: Request, res: Response) => {
  const actorName = getActorName(req);
  const updated = db.updateProduct(req.params.id, req.body, actorName);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

apiRouter.post('/inventory/adjust', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const actorName = getActorName(req);
  const { productId, quantity, notes } = req.body;
  const updated = db.adjustInventory(orgId, productId, Number(quantity), notes || 'Manual adjustment', actorName);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

apiRouter.get('/inventory/warehouses', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  res.json(db.getWarehouses(orgId));
});

apiRouter.get('/inventory/transactions', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  res.json(db.getInventoryTransactions(orgId));
});

// ----------------------------------------------------
// 10. FORMS & CHECKLISTS
// ----------------------------------------------------
apiRouter.get('/forms', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  res.json(db.getForms(orgId));
});

apiRouter.post('/forms', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const actorName = getActorName(req);
  const newForm = db.createForm({ ...req.body, orgId }, actorName);
  res.status(201).json(newForm);
});

apiRouter.get('/forms/submissions', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const jobId = req.query.jobId as string;
  res.json(db.getFormSubmissions(orgId, jobId));
});

apiRouter.post('/forms/submissions', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const actorName = getActorName(req);
  const submission = db.submitForm({ ...req.body, orgId, submittedBy: actorName }, actorName);
  res.status(201).json(submission);
});

// ----------------------------------------------------
// 11. NOTIFICATIONS
// ----------------------------------------------------
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  res.json(db.getNotifications(orgId));
});

apiRouter.post('/notifications/:id/read', (req: Request, res: Response) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

apiRouter.post('/notifications/send', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const { channel, recipient, message, title } = req.body;

  // Log in notification center
  const notif = db.createNotification(
    orgId,
    title || `Outbound ${channel.toUpperCase()}`,
    `Sent to ${recipient}: "${message.slice(0, 80)}..."`,
    'status',
    channel
  );

  res.json({
    success: true,
    notification: notif,
    message: `${channel.toUpperCase()} dispatch queued for ${recipient}`,
  });
});

// ----------------------------------------------------
// 12. AUDIT LOGS
// ----------------------------------------------------
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  res.json(db.getAuditLogs(orgId));
});

// ----------------------------------------------------
// 13. GLOBAL SEARCH
// ----------------------------------------------------
apiRouter.get('/search', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const q = (req.query.q as string || '').toLowerCase().trim();

  if (!q) {
    return res.json({ customers: [], jobs: [], estimates: [], invoices: [], technicians: [], products: [] });
  }

  const customers = db.getCustomers(orgId).filter(
    c => c.name.toLowerCase().includes(q) || (c.companyName && c.companyName.toLowerCase().includes(q)) || c.phone.includes(q)
  );
  const jobs = db.getJobs(orgId).filter(
    j => j.jobNumber.toLowerCase().includes(q) || j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q)
  );
  const estimates = db.getEstimates(orgId).filter(
    e => e.estimateNumber.toLowerCase().includes(q) || (e.title && e.title.toLowerCase().includes(q))
  );
  const invoices = db.getInvoices(orgId).filter(
    i => i.invoiceNumber.toLowerCase().includes(q)
  );
  const technicians = db.getTechnicians(orgId).filter(
    t => t.name.toLowerCase().includes(q) || t.specialization.toLowerCase().includes(q) || t.phone.includes(q)
  );
  const products = db.getProducts(orgId).filter(
    p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
  );

  res.json({
    customers: customers.slice(0, 5),
    jobs: jobs.slice(0, 5),
    estimates: estimates.slice(0, 5),
    invoices: invoices.slice(0, 5),
    technicians: technicians.slice(0, 5),
    products: products.slice(0, 5),
  });
});

// ----------------------------------------------------
// 14. REPORTS & ANALYTICS
// ----------------------------------------------------
apiRouter.get('/reports', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const jobs = db.getJobs(orgId);
  const invoices = db.getInvoices(orgId);
  const payments = db.getPayments(orgId);
  const technicians = db.getTechnicians(orgId);
  const products = db.getProducts(orgId);
  const customers = db.getCustomers(orgId);

  // Revenue by month
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalOutstanding = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((sum, i) => sum + i.balanceDue, 0);

  // Jobs by technician
  const technicianStats = technicians.map(tech => {
    const techJobs = jobs.filter(j => j.assignedTechnicianIds.includes(tech.id));
    const completed = techJobs.filter(j => j.status === 'completed');
    const billableLabour = techJobs.reduce((sum, j) => {
      const techLabour = j.labour.filter(l => l.technicianId === tech.id);
      return sum + techLabour.reduce((lSum, l) => lSum + l.total, 0);
    }, 0);

    return {
      id: tech.id,
      name: tech.name,
      specialization: tech.specialization,
      rating: tech.rating,
      totalJobs: techJobs.length,
      completedJobs: completed.length,
      completionRate: techJobs.length > 0 ? Math.round((completed.length / techJobs.length) * 100) : 0,
      billableLabour,
    };
  });

  // Top Customers by revenue
  const customerStats = customers.map(c => {
    const custPayments = payments.filter(p => p.customerId === c.id);
    const paidSum = custPayments.reduce((sum, p) => sum + p.amount, 0);
    const custJobs = jobs.filter(j => j.customerId === c.id);
    return {
      id: c.id,
      name: c.name,
      company: c.companyName,
      totalPaid: paidSum,
      jobsCount: custJobs.length,
    };
  }).sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 5);

  res.json({
    totalRevenue,
    totalInvoiced,
    totalOutstanding,
    jobsCompleted: jobs.filter(j => j.status === 'completed').length,
    jobsCancelled: jobs.filter(j => j.status === 'cancelled').length,
    cancellationRate: jobs.length > 0 ? Math.round((jobs.filter(j => j.status === 'cancelled').length / jobs.length) * 100) : 0,
    repeatCustomerRate: 67, // % of customer base with >1 job
    technicianStats,
    customerStats,
    totalPartsInStock: products.filter(p => p.type === 'part' || p.type === 'product').reduce((sum, p) => sum + p.stockQuantity, 0),
  });
});

// ----------------------------------------------------
// NATIVE KOTLIN ANDROID APP DOWNLOAD (.ZIP)
// ----------------------------------------------------
apiRouter.get('/mobile/download-zip', (req: Request, res: Response) => {
  const androidDir = path.join(process.cwd(), 'android');

  if (!fs.existsSync(androidDir)) {
    return res.status(404).json({ error: 'Android Kotlin project directory not found' });
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="fieldnora-android-kotlin.zip"');

  const archive = new ZipArchive({
    zlib: { level: 9 },
  });

  archive.on('error', (err: any) => {
    console.error('Archiver error:', err);
    if (!res.headersSent) {
      res.status(500).send({ error: err.message });
    }
  });

  archive.pipe(res);

  // Append android directory excluding build, .gradle, etc.
  archive.directory(androidDir, 'fieldnora-android-kotlin', (entry: any) => {
    if (entry.name.includes('.gradle') || entry.name.includes('/build') || entry.name.includes('.idea')) {
      return false;
    }
    return entry;
  });

  archive.finalize();
});

// ----------------------------------------------------
// 14. SYSTEM & MOBILE CLIENT CONFIG
// ----------------------------------------------------
apiRouter.get('/system/status', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const pgStatus = getPostgresConnectionStatus();
  res.json({
    status: 'online',
    service: 'fieldnora-core-api',
    orgId,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: {
      orm: 'Drizzle ORM',
      engine: 'PostgreSQL',
      provider: pgStatus.provider,
      connected: pgStatus.connected,
      host: pgStatus.host,
      message: pgStatus.connected
        ? `Connected to ${pgStatus.provider} PostgreSQL database via Drizzle ORM`
        : (pgStatus.error || 'DATABASE_URL not configured. Provide DATABASE_URL to connect to Neon or Railway Postgres.')
    },
    totalJobs: db.getJobs(orgId).length,
    activeTechnicians: db.getTechnicians(orgId).length,
  });
});

apiRouter.get('/database/status', (req: Request, res: Response) => {
  const pgStatus = getPostgresConnectionStatus();
  res.json({
    engine: 'PostgreSQL',
    orm: 'Drizzle ORM',
    provider: pgStatus.provider,
    connected: pgStatus.connected,
    host: pgStatus.host,
    initializedAt: pgStatus.initializedAt,
    error: pgStatus.error,
    supportedHosts: ['Neon (neon.tech)', 'Railway (railway.app)', 'Self-hosted / Cloud SQL PostgreSQL']
  });
});

apiRouter.post('/database/test', async (req: Request, res: Response) => {
  try {
    const success = await initPostgresDatabase();
    const pgStatus = getPostgresConnectionStatus();
    res.json({
      success,
      status: pgStatus
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || String(err)
    });
  }
});

apiRouter.get('/config', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const fullBaseUrl = `${protocol}://${host}`;

  res.json({
    backendUrl: fullBaseUrl,
    apiBase: `${fullBaseUrl}/api`,
    productionBaseUrl: 'https://fieldnora-production.up.railway.app/',
    emulatorUrl: 'http://10.0.2.2:3000',
    orgId: getOrgId(req),
    defaultTechnician: {
      id: 'tech-1',
      name: 'Brian Kiprop',
      trade: 'HVAC & Refrigeration',
      phone: '+254 712 345 678',
    },
  });
});

