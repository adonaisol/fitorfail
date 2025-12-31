import { initializeDatabase, closeDatabase } from '../../src/config/database';

console.log('Initializing database...');

try {
  await initializeDatabase();
  console.log('Database initialized successfully!');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
} finally {
  closeDatabase();
}
