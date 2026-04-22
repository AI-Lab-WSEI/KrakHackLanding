#!/usr/bin/env node
/**
 * Database migration runner
 * Usage: node scripts/migrate.js [--dry-run] [--rollback <version>]
 *
 * Applies pending migrations from /migrations/ in order.
 * Tracks applied versions in schema_migrations table.
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

const isDryRun = process.argv.includes('--dry-run');

async function getPool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL env var is required');
  return new Pool({ connectionString: url, ssl: url.includes('railway') ? { rejectUnauthorized: false } : false });
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedVersions(client) {
  const { rows } = await client.query('SELECT version FROM schema_migrations ORDER BY version');
  return new Set(rows.map(r => r.version));
}

async function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
    .sort();
  return files;
}

async function applyMigration(client, filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filepath, 'utf8');
  const version = filename.replace('.sql', '');

  console.log(`  → Applying: ${version}`);
  if (isDryRun) {
    console.log('    [dry-run] SQL:');
    console.log(sql.split('\n').map(l => `    ${l}`).join('\n'));
    return;
  }

  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query(
      'INSERT INTO schema_migrations (version) VALUES ($1)',
      [version]
    );
    await client.query('COMMIT');
    console.log(`  ✓ Applied: ${version}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw new Error(`Migration ${version} failed: ${err.message}`);
  }
}

async function main() {
  const pool = await getPool();
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedVersions(client);
    const files = await getMigrationFiles();

    const pending = files.filter(f => !applied.has(f.replace('.sql', '')));

    if (pending.length === 0) {
      console.log('✓ No pending migrations.');
      return;
    }

    console.log(`Running ${pending.length} pending migration(s)${isDryRun ? ' [DRY RUN]' : ''}...`);

    for (const file of pending) {
      await applyMigration(client, file);
    }

    if (!isDryRun) {
      console.log(`\n✓ ${pending.length} migration(s) applied successfully.`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('✗ Migration failed:', err.message);
  process.exit(1);
});
