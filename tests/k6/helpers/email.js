/**
 * Helper function to generate random emails
 * 
 * DEPRECATED: Use faker.internet.email() directly instead
 * 
 * @deprecated Use @faker-js/faker instead
 * Example: import { faker } from '@faker-js/faker'; faker.internet.email()
 */
export function generateRandomEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `user_${timestamp}_${random}@example.com`;
}
