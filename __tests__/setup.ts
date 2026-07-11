/**
 * Setup archivo para Jest
 * Ejecuta antes de todos los tests
 */

// Mock environment variables para tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '3000';

// Aumentar timeout para tests de BD
jest.setTimeout(30000);
