/**
 * Helper function to generate valid passwords
 * 
 * DEPRECATED: Use faker.internet.password() directly instead
 * 
 * @deprecated Use @faker-js/faker instead
 * Example: import { faker } from '@faker-js/faker'; faker.internet.password({ length: 12 })
 */
export function generateValidPassword() {
  const randomNumber = Math.floor(Math.random() * 9000) + 1000;
  return `Pass${randomNumber}`;
}
