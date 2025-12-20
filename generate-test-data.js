import { faker } from '@faker-js/faker';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NUM_USERS = 10;
const OUTPUT_FILE = path.join(__dirname, 'tests/k6/data/users.json');

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

try {
  console.log(`\n📊 Generating ${NUM_USERS} test users with Faker.js...\n`);
  
  const users = generateUsers(NUM_USERS);
  
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
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
