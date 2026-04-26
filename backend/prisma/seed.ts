/**
 * Prisma seed file - Initialize database with sample data
 * Run with: npm run prisma:seed
 */
import dotenv from 'dotenv';

// Load .env file into process.env
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Create sample links for testing
  const link1 = await prisma.link.create({
    data: {
      shortCode: 'demo1a',
      originalUrl: 'https://www.github.com',
      customAlias: 'github',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });
  
  const link2 = await prisma.link.create({
    data: {
      shortCode: 'demo2b',
      originalUrl: 'https://www.google.com',
      customAlias: 'google',
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  });
  
  // Add sample clicks for analytics
  for (let i = 0; i < 15; i++) {
    await prisma.click.create({
      data: {
        linkId: link1.id,
        ipAddress: `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        country: ['US', 'GB', 'DE', 'FR', 'CA'][Math.floor(Math.random() * 5)],
      },
    });
  }
  
  console.log('✓ Database seeded with sample data');
  console.log(`  - ${link1.shortCode} (${link1.customAlias}) → ${link1.originalUrl}`);
  console.log(`  - ${link2.shortCode} (${link2.customAlias}) → ${link2.originalUrl}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
