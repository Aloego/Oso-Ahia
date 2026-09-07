/**
 * seed.js - Seeds test data into Firestore for Oso-Ahia (Market Rush)
 * Run: node seed.js
 */
const admin = require('firebase-admin');

// Guard against unconfigured environments
if (!admin.apps.length) {
  try {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  } catch (err) {
    console.log("Firebase application default credentials not found. Initialized with default settings.");
  }
}
const db = admin.firestore();

async function seedMarketplace() {
  console.log("Seeding Oso-Ahia Catalog...");

  // 1. Categories
  const categories = [
    { id: 'phones-tablets', name: 'Phones & Tablets', slug: 'phones-tablets', order: 1 },
    { id: 'fashion-fabrics', name: 'Fashion & Fabrics', slug: 'fashion-fabrics', order: 2 },
    { id: 'electronics', name: 'Electronics & Appliances', slug: 'electronics', order: 3 },
    { id: 'provisions-groceries', name: 'Provisions & Groceries', slug: 'provisions-groceries', order: 4 }
  ];
  for (const cat of categories) {
    await db.collection('categories').doc(cat.id).set(cat);
  }

  // 2. Delivery Locations & Fees (Lagos LGAs)
  await db.collection('deliveryLocations').doc('Lagos').set({
    state: 'Lagos',
    isActive: true,
    lgas: {
      "Ikeja": { fee: 1500, isActive: true },
      "Surulere": { fee: 1800, isActive: true },
      "Eti-Osa": { fee: 2500, isActive: true },
      "Lagos Island": { fee: 2000, isActive: true },
      "Alimosho": { fee: 2200, isActive: true },
      "Yaba": { fee: 1500, isActive: true }
    }
  });

  // 3. Platform Payment Configurations
  await db.collection('platformSettings').doc('paymentSettings').set({
    activeManualGateways: 'both',
    opayManualAccount: {
      accountName: 'Oso-Ahia Ent / OPay',
      accountNumber: '8101234567',
      enabled: true
    },
    paystackManualAccount: {
      accountName: 'Oso-Ahia Merchant / Titan',
      accountNumber: '9920123456',
      bankName: 'Paystack-Titan',
      enabled: true
    },
    marketplaceCommissionRate: 0.10
  });

  // 4. Products
  const products = [
    {
      vendorId: "sample-vendor-001",
      name: "Tecno Camon 20 Pro (8GB/256GB)",
      slug: "tecno-camon-20-pro",
      sku: "OSO-PHN-001",
      description: "Brand new Nigerian warranty, FHD+ AMOLED, 64MP RGBW Night sensor.",
      brand: "Tecno",
      categoryId: "phones-tablets",
      condition: "New",
      price: 245000,
      discountedPrice: 232000,
      stock: 14,
      images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500"],
      specifications: { RAM: "8GB", Storage: "256GB", Battery: "5000mAh" },
      supportedStates: ["Lagos"],
      approvalStatus: "approved",
      isPublished: true,
      isFeatured: true,
      ratingAvg: 4.8,
      ratingCount: 32,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      vendorId: "sample-vendor-002",
      name: "Original White Senator Suit Material (4 Yards)",
      slug: "white-senator-suit-material",
      sku: "OSO-FSH-002",
      description: "Premium cashmere wool material suitable for traditional wedding and Sunday best attire.",
      brand: "Aba Mastercraft",
      categoryId: "fashion-fabrics",
      condition: "New",
      price: 18000,
      discountedPrice: null,
      stock: 40,
      images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500"],
      specifications: { Length: "4 Yards", Material: "Cashmere Wool" },
      supportedStates: ["Lagos"],
      approvalStatus: "approved",
      isPublished: true,
      isFeatured: false,
      ratingAvg: 4.6,
      ratingCount: 11,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      vendorId: "sample-vendor-001",
      name: "UK Used Apple iPhone 12 128GB (Blue)",
      slug: "uk-used-iphone-12-128gb",
      sku: "OSO-PHN-003",
      description: "Clean condition, 87% battery health, factory unlocked.",
      brand: "Apple",
      categoryId: "phones-tablets",
      condition: "Used",
      price: 360000,
      discountedPrice: 345000,
      stock: 5,
      images: ["https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=500"],
      specifications: { BatteryHealth: "87%", Storage: "128GB" },
      supportedStates: ["Lagos"],
      approvalStatus: "approved",
      isPublished: true,
      isFeatured: true,
      ratingAvg: 4.9,
      ratingCount: 7,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];

  for (const prod of products) {
    await db.collection('products').add(prod);
  }

  console.log("Seeding complete: Categories, Delivery rates, and Nigerian products added.");
}

if (require.main === module) {
  seedMarketplace().catch(console.error);
}

module.exports = { seedMarketplace };
