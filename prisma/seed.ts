import { PrismaClient, NeedType, PrimarySide } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper random
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Pool data
const names = ['Ahmad', 'Budi', 'Citra', 'Dina', 'Eko', 'Rina', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko', 'Kiki', 'Lia', 'Rama', 'Sari', 'Tono', 'Vina', 'Wira', 'Yudi', 'Zaki'];
const cities = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Malang', 'Medan', 'Bali', 'Semarang', 'Makassar'];

const shoeImages = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
  'https://images.unsplash.com/photo-1511556532299-8f662fc26c06',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa',
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77',
  'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2',
];

const gloveImages = [
  'https://images.unsplash.com/photo-1510228795535-6aaeb33cc7ab',
  'https://plus.unsplash.com/premium_photo-1661608144605-6eb70cd697c1',
  'https://images.unsplash.com/photo-1498670417937-251f2372f6ad',
];

const sandalImages = [
  'https://images.unsplash.com/photo-1603487742131-4160ec999306',
  'https://images.unsplash.com/photo-1562183241-b937e95585b6',
  'https://images.unsplash.com/photo-1603808033192-082d6919d3e1',
];

const avatars = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
  'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12',
];

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Membersihkan data lama (Hati-hati, ini menghapus seluruh entri)
  console.log('Menghapus data lama...');
  await prisma.post.deleteMany();
  await prisma.sizeProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Kategori
  const categoriesData = [
    { name: 'Sepatu', slug: 'sepatu', icon: 'lucide:footprints', description: 'Semua jenis sepatu — sneakers, formal, boots, dll.' },
    { name: 'Sarung Tangan', slug: 'sarung-tangan', icon: 'lucide:hand', description: 'Sarung tangan kerja, olahraga, musim dingin, dll.' },
    { name: 'Sandal', slug: 'sandal', icon: 'lucide:footprints', description: 'Sandal, flip-flop, dan alas kaki terbuka lainnya.' },
  ];

  const dbCategories: Record<string, any> = {};
  for (const cat of categoriesData) {
    dbCategories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log('  ✅ Category seeded');

  // 3. User Admin & 20 Dummy Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sisikita.com',
      password: passwordHash,
      name: 'Admin SisiKita',
      phone: '081234567890',
      city: 'Jakarta',
      primarySide: 'BOTH',
      avatarUrl: avatars[0],
    }
  });

  const createdUsers = [admin];

  // Create dummies
  for (let i = 1; i <= 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        password: passwordHash,
        name: randomItem(names) + ' ' + randomItem(names),
        phone: `08${randomInt(1000000000, 9999999999)}`,
        city: randomItem(cities),
        primarySide: randomItem(['LEFT', 'RIGHT', 'BOTH'] as PrimarySide[]),
        avatarUrl: Math.random() > 0.3 ? randomItem(avatars) : null,
        needType: randomItem(['AMPUTEE', 'SIZE_DIFFERENCE', 'OTHER', null] as any[]),
      }
    });
    createdUsers.push(user);
  }
  console.log(`  ✅ ${createdUsers.length} Users seeded (Including admin@sisikita.com)`);

  // 4. Generate 100 Posts
  for (let i = 1; i <= 100; i++) {
    const owner = randomItem(createdUsers);
    
    // Choose category deterministically but randomized
    const catKeys = Object.keys(dbCategories);
    const catSlug = randomItem(catKeys);
    const categoryId = dbCategories[catSlug].id;
    
    let size = '';
    let title = '';
    let imageUrl = '';
    const side = randomItem(['LEFT', 'RIGHT']);
    const type = randomItem(['CARI_PARTNER', 'SHARING']);

    if (catSlug === 'sepatu') {
      size = String(randomInt(37, 45));
      const brand = randomItem(['Nike', 'Adidas', 'Puma', 'Vans', 'Converse', 'Compass', 'Reebok']);
      title = `${type === 'CARI_PARTNER' ? 'Cari Pasangan' : 'Berbagi'} ${brand} ukuran ${size} bagian ${side === 'LEFT' ? 'Kiri' : 'Kanan'}`;
      imageUrl = randomItem(shoeImages);
    } else if (catSlug === 'sarung-tangan') {
      size = randomItem(['S', 'M', 'L', 'XL']);
      const mat = randomItem(['Kulit', 'Rajut', 'Motor', 'Kiper']);
      title = `Sarung Tangan ${mat} Size ${size} - Butuh ${side === 'LEFT' ? 'Kiri' : 'Kanan'}`;
      imageUrl = randomItem(gloveImages);
    } else {
      // sandal
      size = String(randomInt(38, 44));
      const brand = randomItem(['Swallow', 'Eiger', 'Crocs', 'Havaianas']);
      title = `Sandal ${brand} Sebelah ${side === 'LEFT' ? 'Kiri' : 'Kanan'} Ukuran ${size}`;
      imageUrl = randomItem(sandalImages);
    }

    // Append some unique suffix to prevent duplicate slug collision easily
    title += ` #${randomInt(100, 999)}`;
    const randomDate = new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000);

    await prisma.post.create({
      data: {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7),
        type: type as any,
        side: side as 'LEFT' | 'RIGHT',
        size,
        description: `Barang kondisi masih sangat layak pakai. Cari partner yang cocok untuk ${catSlug} ini. Lokasi di ${owner.city || 'Jakarta'}, COD atau kirim-kirim menyesuaikan. Terima kasih teman-teman.`,
        imageUrl,
        city: owner.city || 'Jakarta', // Inherit from owner usually
        status: 'ACTIVE',
        userId: owner.id,
        categoryId: categoryId,
        createdAt: randomDate,
        updatedAt: randomDate,
      }
    });
  }
  console.log(`  ✅ 100 Posts seeded`);

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
