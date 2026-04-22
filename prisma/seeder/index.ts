import { PrismaClient, PrimarySide } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { categoryData } from './data/category';
import { adminUser, avatars, cities, names } from './data/user';
import {
  gloveImages,
  gloveMaterials,
  gloveSizes,
  sandalBrands,
  sandalImages,
  shoeBrands,
  shoeImages,
} from './data/post';

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────
const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Seeder Functions ────────────────────────────────────────────────────────

async function seedCategories() {
  const dbCategories: Record<string, any> = {};

  for (const cat of categoryData) {
    dbCategories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  console.log('  ✅ Categories seeded');
  return dbCategories;
}

async function seedUsers(passwordHash: string) {
  const admin = await prisma.user.create({
    data: {
      ...adminUser,
      password: passwordHash,
    },
  });

  const createdUsers = [admin];

  for (let i = 1; i <= 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        password: passwordHash,
        name: `${randomItem(names)} ${randomItem(names)}`,
        phone: `08${randomInt(1000000000, 9999999999)}`,
        city: randomItem(cities),
        primarySide: randomItem(['LEFT', 'RIGHT', 'BOTH'] as PrimarySide[]),
        avatarUrl: Math.random() > 0.3 ? randomItem(avatars) : null,
        needType: randomItem([
          'AMPUTEE',
          'SIZE_DIFFERENCE',
          'OTHER',
          null,
        ] as any[]),
      },
    });
    createdUsers.push(user);
  }

  console.log(
    `  ✅ ${createdUsers.length} Users seeded (including ${adminUser.email})`,
  );
  return createdUsers;
}

async function seedPosts(
  createdUsers: any[],
  dbCategories: Record<string, any>,
) {
  const catKeys = Object.keys(dbCategories);

  for (let i = 1; i <= 100; i++) {
    const owner = randomItem(createdUsers);
    const catSlug = randomItem(catKeys);
    const categoryId = dbCategories[catSlug].id;

    const side = randomItem(['LEFT', 'RIGHT']);
    const type = randomItem(['CARI_PARTNER', 'SHARING']);

    let size = '';
    let title = '';
    let imageUrl = '';

    if (catSlug === 'sepatu') {
      size = String(randomInt(37, 45));
      const brand = randomItem(shoeBrands);
      title = `${type === 'CARI_PARTNER' ? 'Cari Pasangan' : 'Berbagi'} ${brand} ukuran ${size} bagian ${side === 'LEFT' ? 'Kiri' : 'Kanan'}`;
      imageUrl = randomItem(shoeImages);
    } else if (catSlug === 'sarung-tangan') {
      size = randomItem(gloveSizes);
      const mat = randomItem(gloveMaterials);
      title = `Sarung Tangan ${mat} Size ${size} - Butuh ${side === 'LEFT' ? 'Kiri' : 'Kanan'}`;
      imageUrl = randomItem(gloveImages);
    } else {
      size = String(randomInt(38, 44));
      const brand = randomItem(sandalBrands);
      title = `Sandal ${brand} Sebelah ${side === 'LEFT' ? 'Kiri' : 'Kanan'} Ukuran ${size}`;
      imageUrl = randomItem(sandalImages);
    }

    title += ` #${randomInt(100, 999)}`;
    const randomDate = new Date(
      Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000,
    );

    await prisma.post.create({
      data: {
        title,
        slug:
          title.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
          '-' +
          Math.random().toString(36).substring(2, 7),
        type: type as any,
        side: side as 'LEFT' | 'RIGHT',
        size,
        description: `Barang kondisi masih sangat layak pakai. Cari partner yang cocok untuk ${catSlug} ini. Lokasi di ${owner.city || 'Jakarta'}, COD atau kirim-kirim menyesuaikan.`,
        imageUrl,
        city: owner.city || 'Jakarta',
        status: 'ACTIVE',
        userId: owner.id,
        categoryId,
        createdAt: randomDate,
        updatedAt: randomDate,
      },
    });
  }

  console.log('  ✅ 100 Posts seeded');
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...\n');

  console.log('🧹 Clearing old data...');
  await prisma.post.deleteMany();
  await prisma.sizeProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('admin123', 10);

  const dbCategories = await seedCategories();
  const createdUsers = await seedUsers(passwordHash);
  await seedPosts(createdUsers, dbCategories);

  console.log('\n🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
