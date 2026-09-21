import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/db/schema';
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
} from './seedData';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let initPromise: Promise<boolean> | null = null;
let connectionStatus: {
  connected: boolean;
  provider: 'neon' | 'railway' | 'postgres' | 'none';
  host?: string;
  error?: string;
  initializedAt?: string;
} = {
  connected: false,
  provider: 'none',
};

export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

export function detectProvider(url: string): 'neon' | 'railway' | 'postgres' {
  const lower = url.toLowerCase();
  if (lower.includes('neon.tech') || lower.includes('neon.database')) {
    return 'neon';
  }
  if (lower.includes('railway.app') || lower.includes('railway.internal')) {
    return 'railway';
  }
  return 'postgres';
}

export function getPostgresConnectionStatus() {
  return connectionStatus;
}

export function getDrizzleDb() {
  return dbInstance;
}

export async function initPostgresDatabase(): Promise<boolean> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const dbUrl = getDatabaseUrl();
    if (!dbUrl) {
      connectionStatus = {
        connected: false,
        provider: 'none',
        error: 'DATABASE_URL environment variable is not set',
      };
      return false;
    }

    const provider = detectProvider(dbUrl);

    try {
      // Determine SSL settings: Neon and Railway cloud PostgreSQL require SSL
      const useSsl =
        !dbUrl.includes('localhost') &&
        !dbUrl.includes('127.0.0.1') &&
        !dbUrl.includes('.docker.internal');

      pool = new Pool({
        connectionString: dbUrl,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      // Test connection
      const client = await pool.connect();
      try {
        const res = await client.query('SELECT current_database(), version()');
        console.log(`[PostgreSQL + Drizzle] Successfully connected to ${provider} database:`, res.rows[0]);
      } finally {
        client.release();
      }

      dbInstance = drizzle(pool, { schema });

      // Run initial table migration if necessary
      await bootstrapTables(pool);

      // Seed initial data if tables are empty
      await seedPostgresIfEmpty(pool);

      let host = 'cloud-postgres';
      try {
        const parsed = new URL(dbUrl);
        host = parsed.host;
      } catch {
        // fallback
      }

      connectionStatus = {
        connected: true,
        provider,
        host,
        initializedAt: new Date().toISOString(),
      };
      console.log(`[PostgreSQL] Ready on ${provider} (${host}) with Drizzle ORM`);
      return true;
    } catch (err: any) {
      console.warn(`[PostgreSQL] Could not connect to ${provider}:`, err.message || err);
      connectionStatus = {
        connected: false,
        provider,
        error: err.message || String(err),
      };
      return false;
    }
  })();

  return initPromise;
}

async function bootstrapTables(poolInstance: pg.Pool) {
  const ddl = `
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      county TEXT NOT NULL,
      country TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'KES',
      tax_rate DOUBLE PRECISION NOT NULL DEFAULT 16.0,
      etims_enabled BOOLEAN NOT NULL DEFAULT true,
      mpesa_paybill TEXT,
      mpesa_till TEXT,
      logo TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'individual',
      name TEXT NOT NULL,
      company_name TEXT,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      county TEXT NOT NULL,
      area TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      notes TEXT DEFAULT '',
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      service_locations JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS technicians (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      specialization TEXT NOT NULL,
      vehicle_reg TEXT NOT NULL,
      active_status TEXT NOT NULL DEFAULT 'available',
      current_lat DOUBLE PRECISION NOT NULL,
      current_lng DOUBLE PRECISION NOT NULL,
      current_latitude DOUBLE PRECISION,
      current_longitude DOUBLE PRECISION,
      last_location_update TEXT NOT NULL,
      rating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
      completed_jobs_count INTEGER DEFAULT 0,
      skills JSONB NOT NULL DEFAULT '[]'::jsonb
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      job_number TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      service_location_id TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'new',
      assigned_technician_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      scheduled_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      estimated_duration_min INTEGER,
      estimated_duration_minutes INTEGER,
      actual_duration_min INTEGER,
      labour JSONB NOT NULL DEFAULT '[]'::jsonb,
      materials JSONB NOT NULL DEFAULT '[]'::jsonb,
      expenses JSONB NOT NULL DEFAULT '[]'::jsonb,
      internal_notes TEXT,
      customer_notes TEXT,
      photos JSONB NOT NULL DEFAULT '[]'::jsonb,
      documents JSONB NOT NULL DEFAULT '[]'::jsonb,
      customer_signature JSONB,
      checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
      completion_notes TEXT,
      travel_start_time TEXT,
      check_in_time TEXT,
      check_out_time TEXT,
      check_in_lat DOUBLE PRECISION,
      check_in_lng DOUBLE PRECISION,
      invoice_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS estimates (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      estimate_number TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      title TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      date TEXT,
      expiry_date TEXT NOT NULL,
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      subtotal DOUBLE PRECISION NOT NULL DEFAULT 0,
      discount_total DOUBLE PRECISION,
      tax_rate DOUBLE PRECISION,
      tax_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
      total_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
      notes TEXT DEFAULT '',
      terms TEXT,
      customer_notes TEXT,
      approved_at TEXT,
      converted_job_id TEXT,
      converted_invoice_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      job_id TEXT,
      estimate_id TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      issue_date TEXT,
      due_date TEXT NOT NULL,
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      subtotal DOUBLE PRECISION NOT NULL DEFAULT 0,
      discount_total DOUBLE PRECISION,
      tax_rate DOUBLE PRECISION,
      tax_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
      total_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
      deposit_amount DOUBLE PRECISION,
      paid_amount DOUBLE PRECISION,
      amount_paid DOUBLE PRECISION,
      balance_due DOUBLE PRECISION NOT NULL DEFAULT 0,
      notes TEXT DEFAULT '',
      terms TEXT,
      etims_control_code TEXT,
      etims_cu_serial_number TEXT,
      etims_data JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      invoice_id TEXT NOT NULL,
      invoice_number TEXT,
      customer_id TEXT,
      amount DOUBLE PRECISION NOT NULL,
      payment_method TEXT NOT NULL,
      reference TEXT NOT NULL,
      phone_number TEXT,
      status TEXT NOT NULL DEFAULT 'completed',
      notes TEXT,
      payment_date TEXT,
      received_at TEXT,
      received_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'part',
      category TEXT NOT NULL,
      unit TEXT DEFAULT 'pcs',
      cost_price DOUBLE PRECISION NOT NULL,
      selling_price DOUBLE PRECISION NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      min_stock_level INTEGER NOT NULL DEFAULT 5,
      warehouse_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS warehouses (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      technician_id TEXT,
      vehicle_reg TEXT,
      location TEXT NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      productId TEXT,
      warehouseId TEXT,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_cost DOUBLE PRECISION,
      reference_type TEXT,
      reference_id TEXT,
      notes TEXT,
      performed_by_user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS custom_forms (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      is_active BOOLEAN NOT NULL DEFAULT true,
      require_signature BOOLEAN NOT NULL DEFAULT false,
      fields JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS form_submissions (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      form_id TEXT NOT NULL,
      job_id TEXT,
      technician_id TEXT NOT NULL,
      values JSONB NOT NULL,
      submitted_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT false,
      link TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      previous_value TEXT,
      new_value TEXT,
      ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await poolInstance.query(ddl);
}

async function seedPostgresIfEmpty(poolInstance: pg.Pool) {
  const check = await poolInstance.query('SELECT count(*) as cnt FROM jobs');
  if (parseInt(check.rows[0].cnt, 10) > 0) {
    return; // Already populated
  }

  console.log('[PostgreSQL] Seeding initial Fieldnora data...');

  // Organizations
  await poolInstance.query(
    `INSERT INTO organizations (id, name, slug, phone, email, address, county, country, currency, tax_rate, etims_enabled, mpesa_paybill, mpesa_till)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     ON CONFLICT (id) DO NOTHING`,
    [
      initialOrganization.id,
      initialOrganization.name,
      initialOrganization.slug,
      initialOrganization.phone,
      initialOrganization.email,
      initialOrganization.address,
      initialOrganization.county,
      initialOrganization.country,
      initialOrganization.currency,
      initialOrganization.taxRate,
      initialOrganization.eTimsEnabled,
      initialOrganization.mpesaPaybill,
      initialOrganization.mpesaTill,
    ]
  );

  // Customers
  for (const c of initialCustomers) {
    await poolInstance.query(
      `INSERT INTO customers (id, org_id, type, name, company_name, phone, email, address, county, area, latitude, longitude, notes, tags, service_locations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO NOTHING`,
      [
        c.id,
        c.orgId,
        c.type,
        c.name,
        c.companyName || null,
        c.phone,
        c.email,
        c.address,
        c.county,
        c.area,
        c.latitude,
        c.longitude,
        c.notes,
        JSON.stringify(c.tags || []),
        JSON.stringify(c.serviceLocations || []),
      ]
    );
  }

  // Technicians
  for (const t of initialTechnicians) {
    await poolInstance.query(
      `INSERT INTO technicians (id, org_id, user_id, name, phone, email, specialization, vehicle_reg, active_status, current_lat, current_lng, last_location_update, rating, skills)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO NOTHING`,
      [
        t.id,
        t.orgId,
        t.userId,
        t.name,
        t.phone,
        t.email,
        t.specialization,
        t.vehicleReg,
        t.activeStatus,
        t.currentLat,
        t.currentLng,
        t.lastLocationUpdate,
        t.rating,
        JSON.stringify(t.skills || []),
      ]
    );
  }

  // Jobs
  for (const j of initialJobs) {
    await poolInstance.query(
      `INSERT INTO jobs (id, org_id, job_number, customer_id, title, description, priority, status, assigned_technician_ids, scheduled_date, start_time, end_time, estimated_duration_min, labour, materials, expenses, photos, documents, checklist)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       ON CONFLICT (id) DO NOTHING`,
      [
        j.id,
        j.orgId,
        j.jobNumber,
        j.customerId,
        j.title,
        j.description,
        j.priority,
        j.status,
        JSON.stringify(j.assignedTechnicianIds || []),
        j.scheduledDate,
        j.startTime,
        j.endTime,
        j.estimatedDurationMin || 60,
        JSON.stringify(j.labour || []),
        JSON.stringify(j.materials || []),
        JSON.stringify(j.expenses || []),
        JSON.stringify(j.photos || []),
        JSON.stringify(j.documents || []),
        JSON.stringify(j.checklist || []),
      ]
    );
  }

  // Invoices
  for (const inv of initialInvoices) {
    await poolInstance.query(
      `INSERT INTO invoices (id, org_id, invoice_number, customer_id, job_id, status, due_date, items, subtotal, tax_amount, total_amount, balance_due, etims_control_code, etims_cu_serial_number, etims_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO NOTHING`,
      [
        inv.id,
        inv.orgId,
        inv.invoiceNumber,
        inv.customerId,
        inv.jobId || null,
        inv.status,
        inv.dueDate,
        JSON.stringify(inv.items || []),
        inv.subtotal,
        inv.taxAmount,
        inv.totalAmount,
        inv.balanceDue,
        inv.etimsControlCode || null,
        inv.etimsCuSerialNumber || null,
        inv.eTimsData ? JSON.stringify(inv.eTimsData) : null,
      ]
    );
  }

  // Payments
  for (const p of initialPayments) {
    await poolInstance.query(
      `INSERT INTO payments (id, org_id, invoice_id, invoice_number, customer_id, amount, payment_method, reference, phone_number, status, payment_date, received_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO NOTHING`,
      [
        p.id,
        p.orgId,
        p.invoiceId,
        p.invoiceNumber || null,
        p.customerId || null,
        p.amount,
        p.paymentMethod,
        p.reference,
        p.phoneNumber || null,
        p.status || 'completed',
        p.paymentDate || null,
        p.receivedAt || p.paymentDate || new Date().toISOString(),
      ]
    );
  }

  // Products
  for (const pr of initialProducts) {
    await poolInstance.query(
      `INSERT INTO products (id, org_id, sku, name, description, type, category, unit, cost_price, selling_price, stock_quantity, min_stock_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO NOTHING`,
      [
        pr.id,
        pr.orgId,
        pr.sku,
        pr.name,
        pr.description || '',
        pr.type || 'part',
        pr.category,
        pr.unit || 'pcs',
        pr.costPrice,
        pr.sellingPrice,
        pr.stockQuantity || 0,
        pr.minStockLevel || 5,
      ]
    );
  }

  console.log('[PostgreSQL] Seed complete.');
}
