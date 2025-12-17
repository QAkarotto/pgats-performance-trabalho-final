/**
 * Helper function to generate random names
 * 
 * DEPRECATED: Use faker.person.fullName() directly instead
 * 
 * @deprecated Use @faker-js/faker instead
 * Example: import { faker } from '@faker-js/faker'; faker.person.fullName()
 */
export function generateRandomName() {
  const names = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Helen'];
  const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  const name = names[Math.floor(Math.random() * names.length)];
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  
  return `${name} ${surname}`;
}
