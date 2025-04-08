#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('Running drizzle-kit push to update the database schema...');

try {
  execSync('npx drizzle-kit push:pg', { stdio: 'inherit' });
  console.log('Database schema updated successfully!');
} catch (error) {
  console.error('Error updating database schema:', error);
  process.exit(1);
}