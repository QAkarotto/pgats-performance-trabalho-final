/**
 * Script para gerar dados de teste com Faker.js
 * Use: node generate-test-data.js
 * Saída: tests/k6/data/faker-users.json
 */

import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory path (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const NUM_USERS = 10;
const OUTPUT_FILE = path.join(__dirname, 'tests/k6/data/faker-users.json');

// Generate random users with faker
function generateUsers(count) {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    users.push({
      id: i + 1,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password({ 
        length: 12, 
        memorable: false,
        pattern: /[A-Za-z0-9!@#$%^&*]/
      }),
      phone: faker.phone.number(),
      company: faker.company.name(),
      city: faker.location.city(),
      country: faker.location.country(),
    });
  }
  
  return users;
}

// Main
try {
  console.log(`\n📊 Generating ${NUM_USERS} test users with Faker.js...\n`);
  
  const users = generateUsers(NUM_USERS);
  
  // Create output directory if it doesn't exist
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(users, null, 2));
  
  console.log(`✅ Generated ${users.length} users`);
  console.log(`📁 File saved to: ${OUTPUT_FILE}\n`);
  console.log('Sample user:');
  console.log(JSON.stringify(users[0], null, 2));
  console.log('\n');
  
} catch (error) {
  console.error('❌ Error generating test data:', error.message);
  process.exit(1);
}
