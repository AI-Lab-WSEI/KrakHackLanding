#!/usr/bin/env node
/**
 * scripts/migrate-hackathon-data.js
 *
 * Faza 4: Migrates legacy `team_projects` rows to the new `teams` + `projects` schema.
 *
 * What it does:
 *   1. Reads all team_projects rows where project_id IS NULL (not yet migrated)
 *   2. Creates a `teams` entry for each (or reuses existing by slug+edition)
 *   3. Creates a `projects` entry for each with full hackathon metadata
 *   4. Updates team_projects.project_id = new_project_uuid (marks as migrated)
 *   5. Links projects.team_id = teams.id
 *
 * What it does NOT do:
 *   - Link team_members to user accounts (members[] is string names, not user IDs)
 *     → Users claim team membership via "claim team" flow in Faza 5
 *
 * Usage:
 *   node scripts/migrate-hackathon-data.js           # dry-run (default)
 *   node scripts/migrate-hackathon-data.js --apply   # apply changes
 *   node scripts/migrate-hackathon-data.js --force   # re-migrate already-migrated rows
 */

import pg from 'pg';

try { process.loadEnvFile(); } catch {}

const DRY_RUN = !process.argv.includes('--apply');
const FORCE   = process.argv.includes('--force');

if (DRY_RUN) {
  console.log('[DRY RUN] Pass --apply to actually write to DB\n');
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 100);
}

function buildDescription(tp) {
  const parts = [];
  if (tp.short_description) parts.push(tp.short_description);
  if (Array.isArray(tp.full_description) && tp.full_description.length > 0) {
    parts.push(...tp.full_description);
  }
  return parts.join('\n\n') || null;
}

function buildImages(tp) {
  if (!tp.images) return '[]';
  if (typeof tp.images === 'string') return tp.images;
  return JSON.stringify(tp.images);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Load team_projects to migrate
    const whereClause = FORCE
      ? ''
      : 'WHERE project_id IS NULL';

    const { rows: teamProjects } = await client.query(
      `SELECT * FROM team_projects ${whereClause} ORDER BY edition_number, placement NULLS LAST`
    );

    console.log(`Found ${teamProjects.length} team_projects to migrate\n`);

    let created = 0;
    let skipped = 0;

    for (const tp of teamProjects) {
      const teamSlug    = tp.slug;
      const projectSlug = `${tp.slug}-${tp.edition_number}`;
      const title       = tp.project_name?.trim() || tp.name;

      // ── 1. Create or find team ───────────────────────────────────────────
      let teamId;
      if (!DRY_RUN) {
        const existingTeam = await client.query(
          'SELECT id FROM teams WHERE slug = $1',
          [teamSlug]
        );
        if (existingTeam.rows.length > 0) {
          teamId = existingTeam.rows[0].id;
          console.log(`  → Reusing team: ${tp.name} (${teamSlug})`);
        } else {
          const teamResult = await client.query(
            `INSERT INTO teams (name, slug, description, edition_number, created_at)
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING id`,
            [tp.name, teamSlug, tp.short_description || null, tp.edition_number]
          );
          teamId = teamResult.rows[0].id;
          console.log(`  + Created team: ${tp.name} (${teamSlug})`);
        }
      } else {
        teamId = '<uuid-team>';
        console.log(`  [dry] Would create team: ${tp.name} → ${teamSlug}`);
      }

      // ── 2. Create or find project ────────────────────────────────────────
      let projectId;
      if (!DRY_RUN) {
        const existingProject = await client.query(
          'SELECT id FROM projects WHERE slug = $1',
          [projectSlug]
        );
        if (existingProject.rows.length > 0) {
          projectId = existingProject.rows[0].id;
          console.log(`  → Reusing project: ${title} (${projectSlug})`);
          skipped++;
        } else {
          const status       = tp.placement ? 'published' : 'active';
          const description  = buildDescription(tp);
          const images       = buildImages(tp);

          const projResult = await client.query(
            `INSERT INTO projects (
               slug, title, description, status, visibility, project_type,
               team_id, edition_number, team_project_id,
               challenge_slug, placement, placement_label, special_mention,
               tech_stack, tags, images,
               github_url, created_at, updated_at
             ) VALUES (
               $1, $2, $3, $4, 'public', 'hackathon',
               $5, $6, $7,
               $8, $9, $10, $11,
               $12, $13, $14,
               $15, NOW(), NOW()
             )
             RETURNING id`,
            [
              projectSlug,
              title,
              description,
              status,
              teamId,
              tp.edition_number,
              tp.id,               // team_project_id (INT)
              tp.challenge || null,
              tp.placement || null,
              tp.placement_label || null,
              tp.special_mention || null,
              tp.technologies || [],
              [],                  // tags (empty — can be enriched later)
              images,
              null,                // github_url (not in legacy schema)
            ]
          );
          projectId = projResult.rows[0].id;
          console.log(`  + Created project: ${title} (${projectSlug}) [${tp.edition_number} ed., placement: ${tp.placement ?? 'none'}]`);
          created++;
        }

        // ── 3. Mark team_project as migrated ────────────────────────────
        await client.query(
          'UPDATE team_projects SET project_id = $1 WHERE id = $2',
          [projectId, tp.id]
        );
      } else {
        console.log(`  [dry] Would create project: ${title} → ${projectSlug}`);
        created++;
      }
    }

    if (!DRY_RUN) {
      // Backfill team_members from confirmed claims whose teams row now exists.
      const backfill = await client.query(
        `INSERT INTO team_members (team_id, user_id, role, joined_at)
         SELECT t.id, tc.user_id, 'member', COALESCE(tc.reviewed_at, NOW())
         FROM team_claims tc
         JOIN teams t
           ON t.slug = tc.team_slug
          AND t.edition_number = tc.edition_number
         WHERE tc.status = 'confirmed'
         ON CONFLICT (team_id, user_id) DO NOTHING
         RETURNING team_id, user_id`
      );

      await client.query('COMMIT');
      console.log(`\n✅ Done. Created: ${created}, Reused: ${skipped}, Linked members: ${backfill.rowCount}`);
    } else {
      await client.query('ROLLBACK');
      console.log(`\n[DRY RUN] Would create: ${created} projects/teams. Run with --apply to apply.`);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
