const Database = require('better-sqlite3');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const databaseFilename = process.env.DATABASE_FILENAME || 'C:/dev/strapi-data/data.db';
const adminEmail = process.env.STRAPI_ADMIN_EMAIL;
const adminPassword = process.env.STRAPI_ADMIN_PASSWORD;
const adminFirstName = process.env.STRAPI_ADMIN_FIRST_NAME || 'Admin';
const adminLastName = process.env.STRAPI_ADMIN_LAST_NAME || 'User';
const adminUsername = process.env.STRAPI_ADMIN_USERNAME || (adminEmail ? adminEmail.split('@')[0] : 'admin');

if (!adminEmail || !adminPassword) {
  console.error('Missing STRAPI_ADMIN_EMAIL or STRAPI_ADMIN_PASSWORD.');
  console.error('Set them in your environment or backend/.env before running this script.');
  process.exit(1);
}

const db = new Database(databaseFilename);

try {
  // Create admin user
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(adminPassword, salt);
  const now = new Date().toISOString();
  const docId = crypto.randomUUID();
  
  const adminStmt = db.prepare(`
    INSERT INTO admin_users (
      document_id, firstname, lastname, username, email, password,
      is_active, blocked, prefered_language, created_at, updated_at, published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = adminStmt.run(
    docId,
    adminFirstName,
    adminLastName,
    adminUsername,
    adminEmail,
    hash,
    1, // is_active
    0, // not blocked
    null, // preferred language
    now,
    now,
    now
  );
  
  console.log('✓ Admin user created!');
  console.log('  ID:', result.lastInsertRowid);
  console.log('  Email:', adminEmail);
  console.log('  Database:', databaseFilename);
  console.log('');
  
  // Note: You'll need to restart Strapi and login to generate a proper API token through the admin panel
  console.log('✓ Next steps:');
  console.log('  1. Restart Strapi');
  console.log('  2. Go to http://localhost:1337/admin');
  console.log('  3. Login with the admin credentials you configured in your environment');
  console.log('  4. Go to Settings → API Tokens → Create new API token');
  console.log('  5. Create the least-privileged token that fits your frontend needs');
  console.log('  6. Update frontend/.env with the token');
  
} catch(e) {
  if (e.message.includes('UNIQUE constraint failed')) {
    console.log('Admin user already exists');
  } else {
    console.error('Error:', e.message);
  }
}
