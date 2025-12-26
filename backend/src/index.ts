import dotenv from 'dotenv';
dotenv.config();

import { httpServer } from './app';
import prisma from './utils/prisma';

const PORT = process.env.PORT || 30007;

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
