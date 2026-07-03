import "dotenv/config";

import {
  createAdmin,
  findAdminByEmail,
  updateAdminPassword,
} from "@/db/queries";
import { hashPassword } from "@/lib/password";

const command = process.argv[2];
const args = process.argv.slice(3);

function usage(): never {
  console.log(`
giksn-research admin CLI

  npm run admin -- create  <email> <password>
  npm run admin -- reset   <email> <new-password>
  npm run admin -- list

Or via env vars:
  ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=hunter2 \\
    npm run admin -- create
`);
  process.exit(1);
}

async function create() {
  const email = args[0] ?? process.env.ADMIN_EMAIL;
  const password = args[1] ?? process.env.ADMIN_PASSWORD;
  if (!email || !password) usage();

  const existing = await findAdminByEmail(email!);
  if (existing) {
    console.error(`✗ Admin already exists for ${email}.`);
    console.error(`  Use \`npm run admin -- reset ${email} <new-password>\` to change the password.`);
    process.exit(1);
  }

  const passwordHash = await hashPassword(password!);
  const admin = await createAdmin(email!, passwordHash);
  console.log(`✓ Created admin ${admin.email} (id ${admin.id}).`);
  process.exit(0);
}

async function reset() {
  const email = args[0] ?? process.env.ADMIN_EMAIL;
  const password = args[1] ?? process.env.ADMIN_PASSWORD;
  if (!email || !password) usage();

  const passwordHash = await hashPassword(password!);
  const updated = await updateAdminPassword(email!, passwordHash);
  if (!updated) {
    console.error(`✗ No admin found for ${email}.`);
    console.error(`  Use \`npm run admin -- create ${email} <password>\` first.`);
    process.exit(1);
  }
  console.log(`✓ Password reset for ${updated.email}.`);
  process.exit(0);
}

async function list() {
  const { db } = await import("@/db");
  const { admins } = await import("@/db/schema");
  const rows = await db
    .select({ email: admins.email, createdAt: admins.createdAt })
    .from(admins);
  if (rows.length === 0) {
    console.log("No admins.");
  } else {
    console.log(`${rows.length} admin(s):`);
    for (const r of rows) {
      console.log(`  ${r.email}  (created ${r.createdAt.toISOString()})`);
    }
  }
  process.exit(0);
}

(async () => {
  try {
    if (command === "create") await create();
    else if (command === "reset") await reset();
    else if (command === "list") await list();
    else usage();
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
})();
