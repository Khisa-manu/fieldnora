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
        onConnect: async (client: pg.PoolClient) => {
          try {
            await client.query(`
              DO $$
              BEGIN
                IF CURRENT_USER = 'authenticator' AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
                  EXECUTE 'SET ROLE authenticated';
                END IF;
              END $$;
            `);
          } catch {
            // Ignore if role switch is not supported or not needed
          }
        },
      } as any);

      // Test connection and establish schema privileges
      const client = await pool.connect();
      try {
        try {
          await client.query(`
            DO $$
            BEGIN
              IF CURRENT_USER = 'authenticator' AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
                EXECUTE 'SET ROLE authenticated';
              END IF;
              BEGIN
                GRANT USAGE ON SCHEMA public TO PUBLIC;
                GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
                GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;
                ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO PUBLIC;
                ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO PUBLIC;
              EXCEPTION WHEN OTHERS THEN
                NULL;
              END;
            END $$;
          `);
        } catch {
          // ignore if role doesn't have grant options
        }

        const res = await client.query('SELECT current_database(), current_user, version()');
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
      skills JSONB NOT NULL DEFAULT '[]'::jsonb,
      avatar TEXT
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
      product_id TEXT,
      warehouse_id TEXT,
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

  // Apply schema migrations / table definitions if role has DDL privileges
  try {
    await poolInstance.query(ddl);
  } catch (ddlErr: any) {
    // If connected role doesn't have CREATE TABLE permissions, schema is managed externally
    console.log('[PostgreSQL] Table creation notice (managed schema):', ddlErr.message || ddlErr);
  }

  // Apply schema migrations for existing databases to guarantee all schema columns exist
  try {
    await poolInstance.query(`
      ALTER TABLE technicians ADD COLUMN IF NOT EXISTS avatar TEXT;
      ALTER TABLE technicians ADD COLUMN IF NOT EXISTS current_latitude DOUBLE PRECISION;
      ALTER TABLE technicians ADD COLUMN IF NOT EXISTS current_longitude DOUBLE PRECISION;
      ALTER TABLE technicians ADD COLUMN IF NOT EXISTS completed_jobs_count INTEGER DEFAULT 0;

      ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS product_id TEXT;
      ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS warehouse_id TEXT;

      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS service_location_id TEXT;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS actual_duration_min INTEGER;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS completion_notes TEXT;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS travel_start_time TEXT;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS check_in_time TEXT;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS check_out_time TEXT;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS check_in_lat DOUBLE PRECISION;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS check_in_lng DOUBLE PRECISION;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS invoice_id TEXT;

      ALTER TABLE estimates ADD COLUMN IF NOT EXISTS converted_job_id TEXT;
      ALTER TABLE estimates ADD COLUMN IF NOT EXISTS converted_invoice_id TEXT;

      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS etims_control_code TEXT;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS etims_cu_serial_number TEXT;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS etims_data JSONB;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deposit_amount DOUBLE PRECISION;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_amount DOUBLE PRECISION;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_paid DOUBLE PRECISION;
    `);

    // Migrate inventory_transactions old column names if they exist and product_id is null
    await poolInstance.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_transactions' AND column_name = 'productid') THEN
          UPDATE inventory_transactions SET product_id = productid WHERE product_id IS NULL;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_transactions' AND column_name = 'warehouseid') THEN
          UPDATE inventory_transactions SET warehouse_id = warehouseid WHERE warehouse_id IS NULL;
        END IF;
      END $$;
    `);

    // Populate technician avatars from matching users if technician avatar is unset
    await poolInstance.query(`
      UPDATE technicians t
      SET avatar = u.avatar
      FROM users u
      WHERE t.user_id = u.id AND t.avatar IS NULL AND u.avatar IS NOT NULL;
    `);

    // Ensure all tables and future tables have full permissions
    await poolInstance.query(`
      DO $$
      BEGIN
        BEGIN
          GRANT USAGE ON SCHEMA public TO PUBLIC;
          GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
          GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;
          ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO PUBLIC;
          ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO PUBLIC;
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END;
      END $$;
    `);
  } catch (migErr: any) {
    console.log('[PostgreSQL] Schema migration notice:', migErr?.message || migErr);
  }
}

async function seedPostgresIfEmpty(poolInstance: pg.Pool) {
  try {
    const orgCheck = await poolInstance.query('SELECT count(*) as cnt FROM organizations');
    const userCheck = await poolInstance.query('SELECT count(*) as cnt FROM users');
    if (parseInt(orgCheck.rows[0].cnt, 10) > 0 && parseInt(userCheck.rows[0].cnt, 10) > 0) {
      console.log('[PostgreSQL] Database tables verified and already seeded.');
      return;
    }
  } catch {
    // If check fails, continue to seed
  }

  console.log('[PostgreSQL] Checking and seeding initial Fieldnora data if needed...');

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

  // Users
  for (const u of initialUsers) {
    await poolInstance.query(
      `INSERT INTO users (id, org_id, name, email, phone, role, avatar, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        u.id,
        u.orgId,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.avatar || null,
        u.status || 'active',
      ]
    );
  }

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
      `INSERT INTO technicians (id, org_id, user_id, name, phone, email, specialization, vehicle_reg, active_status, current_lat, current_lng, last_location_update, rating, skills, avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
        t.avatar || null,
      ]
    );
  }

  // Warehouses
  for (const w of initialWarehouses as any[]) {
    await poolInstance.query(
      `INSERT INTO warehouses (id, org_id, name, type, technician_id, vehicle_reg, location, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        w.id,
        w.orgId,
        w.name,
        w.type || (w.isMain ? 'central' : 'mobile'),
        w.technicianId || null,
        w.vehicleReg || null,
        w.location,
        w.isDefault ?? w.isMain ?? false,
      ]
    );
  }

  // Products
  for (const pr of initialProducts) {
    await poolInstance.query(
      `INSERT INTO products (id, org_id, sku, name, description, type, category, unit, cost_price, selling_price, stock_quantity, min_stock_level, warehouse_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
        pr.warehouseId || null,
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

  // Estimates
  for (const est of initialEstimates) {
    await poolInstance.query(
      `INSERT INTO estimates (id, org_id, estimate_number, customer_id, title, status, date, expiry_date, items, subtotal, discount_total, tax_rate, tax_amount, total_amount, notes, terms, customer_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (id) DO NOTHING`,
      [
        est.id,
        est.orgId,
        est.estimateNumber,
        est.customerId,
        est.title || null,
        est.status || 'draft',
        est.date || null,
        est.expiryDate,
        JSON.stringify(est.items || []),
        est.subtotal || 0,
        est.discountTotal || null,
        est.taxRate || null,
        est.taxAmount || 0,
        est.totalAmount || 0,
        est.notes || '',
        est.terms || null,
        est.customerNotes || null,
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

  // Inventory Transactions
  for (const it of initialInventoryTransactions) {
    await poolInstance.query(
      `INSERT INTO inventory_transactions (id, org_id, product_id, type, quantity, notes, performed_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        it.id,
        it.orgId,
        it.productId || null,
        it.type,
        it.quantity,
        it.notes || null,
        it.userName || 'System',
      ]
    );
  }

  // Custom Forms
  for (const cf of initialCustomForms as any[]) {
    await poolInstance.query(
      `INSERT INTO custom_forms (id, org_id, title, description, category, version, is_active, fields)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        cf.id,
        cf.orgId,
        cf.title,
        cf.description,
        cf.category,
        cf.version || 1,
        cf.isActive !== false,
        JSON.stringify(cf.fields || []),
      ]
    );
  }

  // Notifications
  for (const n of initialNotifications) {
    await poolInstance.query(
      `INSERT INTO notifications (id, org_id, user_id, type, title, message, read, link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        n.id,
        n.orgId,
        n.userId || 'broadcast',
        n.type,
        n.title,
        n.message,
        n.read || false,
        n.link || null,
      ]
    );
  }

  // Audit Logs
  for (const a of initialAuditLogs) {
    await poolInstance.query(
      `INSERT INTO audit_logs (id, org_id, user_id, user_name, action, entity, entity_id, previous_value, new_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        a.id,
        a.orgId,
        a.userId,
        a.userName,
        a.action,
        a.entity,
        a.entityId,
        a.previousValue || null,
        a.newValue || null,
      ]
    );
  }

  console.log('[PostgreSQL] Seed verification complete.');
}
