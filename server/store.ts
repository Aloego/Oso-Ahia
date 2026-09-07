import fs from 'fs';
import path from 'path';
import {
  User,
  Vendor,
  Product,
  Category,
  DeliveryLocation,
  Order,
  Payment,
  PlatformPaymentSettings,
  AppNotification
} from '../src/types';

interface StoreData {
  users: Record<string, User>;
  vendors: Record<string, Vendor>;
  products: Record<string, Product>;
  categories: Record<string, Category>;
  deliveryLocations: Record<string, DeliveryLocation>;
  orders: Record<string, Order>;
  payments: Record<string, Payment>;
  platformSettings: PlatformPaymentSettings;
  notifications: Record<string, AppNotification>;
  currentUserId: string;
}

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'osoahia_data.json');

function getDefaultInitialData(): StoreData {
  const users: Record<string, User> = {
    'user-customer-1': {
      uid: 'user-customer-1',
      email: 'chioma@osoahia.ng',
      role: 'customer',
      fullName: 'Chioma Adebayo',
      phone: '08023456789',
      defaultLocation: { state: 'Lagos', lga: 'Ikeja' },
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    'user-vendor-1': {
      uid: 'user-vendor-1',
      email: 'vendor1@osoahia.ng',
      role: 'vendor',
      fullName: 'Emeka Nwosu',
      phone: '08098765432',
      defaultLocation: { state: 'Lagos', lga: 'Ikeja' },
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
    },
    'user-vendor-2': {
      uid: 'user-vendor-2',
      email: 'vendor2@alaba.ng',
      role: 'vendor',
      fullName: 'Babatunde Balogun',
      phone: '08123344556',
      defaultLocation: { state: 'Lagos', lga: 'Alimosho' },
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    'user-admin-1': {
      uid: 'user-admin-1',
      email: 'admin@osoahia.ng',
      role: 'admin',
      fullName: 'Kolawole Danjuma (Admin)',
      phone: '08000000001',
      defaultLocation: { state: 'Lagos', lga: 'Ikeja' },
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
    }
  };

  const vendors: Record<string, Vendor> = {
    'sample-vendor-001': {
      id: 'sample-vendor-001',
      userId: 'user-vendor-1',
      businessName: 'Gadget Express Lagos',
      businessAddress: 'Shop 14, Computer Village, Ikeja',
      state: 'Lagos',
      lga: 'Ikeja',
      verificationStatus: 'approved',
      verificationDocUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400',
      bankDetails: {
        bankName: 'Access Bank',
        accountNumber: '0123456789',
        accountName: 'Gadget Express Ventures'
      },
      commissionRate: 0.10,
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
    },
    'sample-vendor-002': {
      id: 'sample-vendor-002',
      userId: 'user-vendor-1',
      businessName: 'Aba Mastercraft Textiles',
      businessAddress: 'Plaza 3, Mandilas Market, Lagos Island',
      state: 'Lagos',
      lga: 'Lagos Island',
      verificationStatus: 'approved',
      verificationDocUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400',
      bankDetails: {
        bankName: 'Zenith Bank',
        accountNumber: '2081234567',
        accountName: 'Aba Mastercraft Fashion'
      },
      commissionRate: 0.10,
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    'sample-vendor-003': {
      id: 'sample-vendor-003',
      userId: 'user-vendor-2',
      businessName: 'Alaba Sound & Vision',
      businessAddress: 'Line 4, Alaba International Market, Ojo',
      state: 'Lagos',
      lga: 'Ojo',
      verificationStatus: 'pending',
      verificationDocUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      bankDetails: {
        bankName: 'United Bank for Africa',
        accountNumber: '1099887766',
        accountName: 'Alaba Sound & Vision Hub'
      },
      commissionRate: 0.10,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  };

  const categories: Record<string, Category> = {
    'phones-tablets': {
      id: 'phones-tablets',
      name: 'Phones & Tablets',
      slug: 'phones-tablets',
      iconUrl: '📱',
      order: 1
    },
    'fashion-fabrics': {
      id: 'fashion-fabrics',
      name: 'Fashion & Fabrics',
      slug: 'fashion-fabrics',
      iconUrl: '👔',
      order: 2
    },
    'electronics': {
      id: 'electronics',
      name: 'Electronics & Appliances',
      slug: 'electronics',
      iconUrl: '📺',
      order: 3
    },
    'provisions-groceries': {
      id: 'provisions-groceries',
      name: 'Provisions & Groceries',
      slug: 'provisions-groceries',
      iconUrl: '🛒',
      order: 4
    }
  };

  const deliveryLocations: Record<string, DeliveryLocation> = {
    'Lagos': {
      id: 'Lagos',
      state: 'Lagos',
      isActive: true,
      lgas: {
        "Ikeja": { fee: 1500, isActive: true },
        "Surulere": { fee: 1800, isActive: true },
        "Eti-Osa": { fee: 2500, isActive: true },
        "Lagos Island": { fee: 2000, isActive: true },
        "Lagos Mainland": { fee: 1600, isActive: true },
        "Alimosho": { fee: 2200, isActive: true },
        "Yaba": { fee: 1500, isActive: true },
        "Apapa": { fee: 2300, isActive: true },
        "Agege": { fee: 1800, isActive: true },
        "Ajeromi-Ifelodun": { fee: 2100, isActive: true },
        "Amuwo-Odofin": { fee: 2000, isActive: true },
        "Badagry": { fee: 3500, isActive: true },
        "Epe": { fee: 4000, isActive: true },
        "Ibeju-Lekki": { fee: 3000, isActive: true },
        "Ifako-Ijaiye": { fee: 1900, isActive: true },
        "Ikorodu": { fee: 2600, isActive: true },
        "Kosofe": { fee: 1700, isActive: true },
        "Mushin": { fee: 1600, isActive: true },
        "Ojo": { fee: 2400, isActive: true },
        "Oshodi-Isolo": { fee: 1700, isActive: true },
        "Shomolu": { fee: 1600, isActive: true }
      }
    }
  };

  const platformSettings: PlatformPaymentSettings = {
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
  };

  const products: Record<string, Product> = {
    'prod-001': {
      id: 'prod-001',
      vendorId: 'sample-vendor-001',
      vendorName: 'Gadget Express Lagos',
      name: 'Tecno Camon 20 Pro (8GB/256GB)',
      slug: 'tecno-camon-20-pro',
      sku: 'OSO-PHN-001',
      description: 'Brand new Nigerian warranty, FHD+ AMOLED, 64MP RGBW Night sensor with ultra-clear night portraits. Includes original fast charger in box.',
      brand: 'Tecno',
      categoryId: 'phones-tablets',
      condition: 'New',
      price: 245000,
      discountedPrice: 232000,
      stock: 14,
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'
      ],
      specifications: {
        RAM: '8GB',
        Storage: '256GB',
        Battery: '5000mAh 33W',
        Display: '6.67" 120Hz AMOLED'
      },
      variations: [
        {
          name: 'Color',
          options: [
            { label: 'Dark Welkin (Black)', price: 232000, stock: 8, sku: 'OSO-PHN-001-BLK' },
            { label: 'Serenity Blue', price: 232000, stock: 6, sku: 'OSO-PHN-001-BLU' }
          ]
        }
      ],
      supportedStates: ['Lagos'],
      approvalStatus: 'approved',
      isPublished: true,
      isFeatured: true,
      ratingAvg: 4.8,
      ratingCount: 32,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    'prod-002': {
      id: 'prod-002',
      vendorId: 'sample-vendor-002',
      vendorName: 'Aba Mastercraft Textiles',
      name: 'Original White Senator Suit Material (4 Yards)',
      slug: 'white-senator-suit-material',
      sku: 'OSO-FSH-002',
      description: 'Premium cashmere wool material suitable for traditional wedding, agbada, and Sunday best attire. Does not fade or shrink when washed.',
      brand: 'Aba Mastercraft',
      categoryId: 'fashion-fabrics',
      condition: 'New',
      price: 18000,
      discountedPrice: null,
      stock: 40,
      images: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600'
      ],
      specifications: {
        Length: '4 Yards',
        Material: 'Cashmere Wool Blend',
        Texture: 'Soft & Breathable'
      },
      supportedStates: ['Lagos'],
      approvalStatus: 'approved',
      isPublished: true,
      isFeatured: false,
      ratingAvg: 4.6,
      ratingCount: 11,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    'prod-003': {
      id: 'prod-003',
      vendorId: 'sample-vendor-001',
      vendorName: 'Gadget Express Lagos',
      name: 'UK Used Apple iPhone 12 128GB (Blue)',
      slug: 'uk-used-iphone-12-128gb',
      sku: 'OSO-PHN-003',
      description: 'Extremely clean Nigerian-tested condition, 87% battery health, factory unlocked. Face ID active, true tone intact. Tested with MTN & Airtel SIMs.',
      brand: 'Apple',
      categoryId: 'phones-tablets',
      condition: 'Used',
      price: 360000,
      discountedPrice: 345000,
      stock: 5,
      images: [
        'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600'
      ],
      specifications: {
        BatteryHealth: '87%',
        Storage: '128GB',
        Condition: 'Grade A UK Used',
        Network: 'Factory Unlocked (5G)'
      },
      supportedStates: ['Lagos'],
      approvalStatus: 'approved',
      isPublished: true,
      isFeatured: true,
      ratingAvg: 4.9,
      ratingCount: 7,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    'prod-004': {
      id: 'prod-004',
      vendorId: 'sample-vendor-001',
      vendorName: 'Gadget Express Lagos',
      name: 'Oraimo 20,000mAh Powerbox Fast Charge Power Bank',
      slug: 'oraimo-20000mah-power-bank',
      sku: 'OSO-ACC-004',
      description: 'Original Oraimo 20000mAh high-capacity power bank with dual fast outputs and Type-C input. Built-in multi-protection against power surges.',
      brand: 'Oraimo',
      categoryId: 'electronics',
      condition: 'New',
      price: 24000,
      discountedPrice: 21500,
      stock: 25,
      images: [
        'https://images.unsplash.com/photo-1609592424300-84386927d32a?w=600'
      ],
      specifications: {
        Capacity: '20,000mAh',
        Output: 'Dual USB 2.4A Max',
        Torchlight: 'Built-in Dual LED'
      },
      supportedStates: ['Lagos'],
      approvalStatus: 'approved',
      isPublished: true,
      isFeatured: true,
      ratingAvg: 4.7,
      ratingCount: 45,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    'prod-005': {
      id: 'prod-005',
      vendorId: 'sample-vendor-002',
      vendorName: 'Aba Mastercraft Textiles',
      name: 'Original Nigerian Navy Blue Cashmere Suit (5 Yards)',
      slug: 'navy-blue-cashmere-suit',
      sku: 'OSO-FSH-005',
      description: 'Lustrous deep navy blue woven suiting fabric. Ideal for modern corporate Nigerian suits, Kaftans, and traditional weddings.',
      brand: 'Aba Mastercraft',
      categoryId: 'fashion-fabrics',
      condition: 'New',
      price: 22000,
      discountedPrice: 19500,
      stock: 18,
      images: [
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600'
      ],
      specifications: {
        Length: '5 Yards',
        Color: 'Deep Navy Blue',
        Weave: 'Super 140s Wool'
      },
      supportedStates: ['Lagos'],
      approvalStatus: 'approved',
      isPublished: true,
      isFeatured: false,
      ratingAvg: 4.8,
      ratingCount: 19,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    'prod-006': {
      id: 'prod-006',
      vendorId: 'sample-vendor-003',
      vendorName: 'Alaba Sound & Vision',
      name: 'Polystar 32-Inch Smart LED Television with Inbuilt Satellite',
      slug: 'polystar-32-inch-smart-led-tv',
      sku: 'OSO-ELC-006',
      description: 'Energy-saving Polystar smart TV, crystal crisp display, Netflix and YouTube apps preloaded, HDMI and USB ports.',
      brand: 'Polystar',
      categoryId: 'electronics',
      condition: 'New',
      price: 135000,
      discountedPrice: null,
      stock: 8,
      images: [
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'
      ],
      specifications: {
        ScreenSize: '32 Inches',
        Resolution: 'HD 1080p',
        Warranty: '1 Year Manufacturer'
      },
      supportedStates: ['Lagos'],
      approvalStatus: 'pending', // Vendor 3 product awaiting Admin approval!
      isPublished: true,
      isFeatured: false,
      ratingAvg: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString()
    }
  };

  const orders: Record<string, Order> = {};
  const payments: Record<string, Payment> = {};

  const notifications: Record<string, AppNotification> = {
    'notif-1': {
      id: 'notif-1',
      recipientId: 'ADMIN',
      title: 'Vendor Verification Pending',
      message: 'Alaba Sound & Vision submitted business documents for verification.',
      type: 'verification',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    'notif-2': {
      id: 'notif-2',
      recipientId: 'ADMIN',
      title: 'New Product Pending Moderation',
      message: 'Polystar 32-Inch Smart LED Television was submitted by Alaba Sound & Vision.',
      type: 'product',
      read: false,
      createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    'notif-3': {
      id: 'notif-3',
      recipientId: 'user-customer-1',
      title: 'Welcome to Oso-Ahia!',
      message: 'Enjoy verified Lagos multi-vendor shopping with express doorstep dispatch.',
      type: 'order',
      read: false,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  };

  return {
    users,
    vendors,
    products,
    categories,
    deliveryLocations,
    orders,
    payments,
    platformSettings,
    notifications,
    currentUserId: 'user-customer-1'
  };
}

class MarketplaceStore {
  private data: StoreData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): StoreData {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.warn('Could not read saved data file, initializing fresh state:', err);
    }
    const initial = getDefaultInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: StoreData = this.data) {
    try {
      const dir = path.dirname(DATA_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save data file:', err);
    }
  }

  public resetData(): StoreData {
    this.data = getDefaultInitialData();
    this.saveData();
    return this.data;
  }

  // Users & Auth Session
  public getCurrentUser(): User {
    return this.data.users[this.data.currentUserId] || this.data.users['user-customer-1'];
  }

  public setCurrentUser(userId: string): User {
    if (!this.data.users[userId]) {
      throw new Error(`User with ID ${userId} not found`);
    }
    this.data.currentUserId = userId;
    this.saveData();
    return this.data.users[userId];
  }

  public getUsers(): User[] {
    return Object.values(this.data.users);
  }

  public getUser(uid: string): User | undefined {
    return this.data.users[uid];
  }

  public updateUserLocation(uid: string, location: { state: string; lga: string }) {
    if (this.data.users[uid]) {
      this.data.users[uid].defaultLocation = location;
      this.saveData();
    }
  }

  // Categories
  public getCategories(): Category[] {
    return Object.values(this.data.categories).sort((a, b) => a.order - b.order);
  }

  // Delivery Locations
  public getDeliveryLocations(): DeliveryLocation[] {
    return Object.values(this.data.deliveryLocations);
  }

  public calculateDeliveryFee(state: string, lga: string): number {
    const loc = this.data.deliveryLocations[state];
    if (!loc || !loc.isActive) {
      throw new Error(`Deliveries are currently not available in ${state}`);
    }
    const lgaInfo = loc.lgas[lga];
    if (!lgaInfo || !lgaInfo.isActive) {
      throw new Error(`Deliveries are not available to ${lga}, ${state}`);
    }
    return lgaInfo.fee;
  }

  // Products
  public getProducts(filters?: {
    category?: string;
    condition?: string;
    search?: string;
    state?: string;
    featured?: boolean;
    vendorId?: string;
    includePending?: boolean;
  }): Product[] {
    let prods = Object.values(this.data.products);

    if (!filters?.includePending) {
      prods = prods.filter(p => p.approvalStatus === 'approved' && p.isPublished);
    }

    if (filters?.category) {
      prods = prods.filter(p => p.categoryId === filters.category);
    }

    if (filters?.condition) {
      prods = prods.filter(p => p.condition === filters.condition);
    }

    if (filters?.vendorId) {
      prods = prods.filter(p => p.vendorId === filters.vendorId);
    }

    if (filters?.featured) {
      prods = prods.filter(p => p.isFeatured);
    }

    if (filters?.state) {
      prods = prods.filter(p => p.supportedStates.includes(filters.state!));
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      prods = prods.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    return prods.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products[id];
  }

  public createProduct(prodData: Omit<Product, 'id' | 'createdAt' | 'approvalStatus' | 'ratingAvg' | 'ratingCount'>): Product {
    const id = `prod-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const product: Product = {
      ...prodData,
      id,
      approvalStatus: 'pending', // Always pending by default as mandated by rules
      isPublished: true,
      ratingAvg: 5.0,
      ratingCount: 1,
      createdAt: new Date().toISOString()
    };
    this.data.products[id] = product;
    
    // Notify Admin of product pending moderation
    this.createNotification(
      'ADMIN',
      'New Product Awaiting Approval',
      `"${product.name}" (${product.sku}) was submitted for approval.`,
      'product'
    );

    this.saveData();
    return product;
  }

  public reviewProduct(productId: string, decision: 'approved' | 'rejected'): Product {
    const prod = this.data.products[productId];
    if (!prod) throw new Error('Product not found');
    prod.approvalStatus = decision;

    // Find vendor user to notify
    const vendor = this.data.vendors[prod.vendorId];
    if (vendor) {
      this.createNotification(
        vendor.userId,
        `Product ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
        `Your product "${prod.name}" has been ${decision} by Admin.`,
        'product'
      );
    }

    this.saveData();
    return prod;
  }

  // Vendors
  public getVendors(): Vendor[] {
    return Object.values(this.data.vendors);
  }

  public getVendorByUserId(userId: string): Vendor | undefined {
    return Object.values(this.data.vendors).find(v => v.userId === userId);
  }

  public registerVendor(vendorData: {
    userId: string;
    businessName: string;
    businessAddress: string;
    state: string;
    lga: string;
    bankDetails: { bankName: string; accountNumber: string; accountName: string };
    verificationDocUrl?: string;
  }): Vendor {
    const id = `vendor-${Date.now()}`;
    const vendor: Vendor = {
      id,
      userId: vendorData.userId,
      businessName: vendorData.businessName,
      businessAddress: vendorData.businessAddress,
      state: vendorData.state,
      lga: vendorData.lga,
      verificationStatus: 'pending',
      verificationDocUrl: vendorData.verificationDocUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400',
      bankDetails: vendorData.bankDetails,
      commissionRate: this.data.platformSettings.marketplaceCommissionRate || 0.10,
      createdAt: new Date().toISOString()
    };

    this.data.vendors[id] = vendor;
    
    // Switch user role to vendor
    if (this.data.users[vendorData.userId]) {
      this.data.users[vendorData.userId].role = 'vendor';
    }

    this.createNotification(
      'ADMIN',
      'New Vendor Application',
      `${vendor.businessName} submitted onboarding credentials for review.`,
      'verification'
    );

    this.saveData();
    return vendor;
  }

  public reviewVendor(vendorId: string, decision: 'approved' | 'rejected', commissionRate?: number): Vendor {
    const vendor = this.data.vendors[vendorId];
    if (!vendor) throw new Error('Vendor record not found');
    vendor.verificationStatus = decision;
    if (commissionRate !== undefined) {
      vendor.commissionRate = commissionRate;
    }

    this.createNotification(
      vendor.userId,
      `Vendor Account ${decision === 'approved' ? 'Verified & Approved' : 'Declined'}`,
      decision === 'approved'
        ? 'Congratulations! Your Oso-Ahia vendor shop is now active. You can start listing products.'
        : 'Your vendor application was rejected. Please contact support or re-submit valid credentials.',
      'verification'
    );

    this.saveData();
    return vendor;
  }

  // Orders
  public createOrder(params: {
    customerId: string;
    customerDetails: { fullName: string; email: string; phone: string };
    deliveryAddress: { fullName: string; phone: string; street: string; state: string; lga: string; instructions?: string };
    items: { productId: string; quantity: number; variation?: string | null }[];
    paymentMethod: 'paystack' | 'manual_transfer';
  }): { order: Order; orderId: string; orderNumber: string; total: number; subtotal: number; deliveryFee: number } {
    if (!params.items || params.items.length === 0) {
      throw new Error('Cart cannot be empty');
    }

    let subtotal = 0;
    const verifiedItems = [];

    // Atomic validation of inventory & availability
    for (const item of params.items) {
      const prod = this.data.products[item.productId];
      if (!prod) {
        throw new Error(`Product not found: ID ${item.productId}`);
      }
      if (prod.approvalStatus !== 'approved' || !prod.isPublished) {
        throw new Error(`Product "${prod.name}" is not currently available for sale`);
      }
      if (!prod.supportedStates.includes(params.deliveryAddress.state)) {
        throw new Error(`"${prod.name}" is not deliverable to ${params.deliveryAddress.state}`);
      }
      if (prod.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.stock}`);
      }

      const unitPrice = prod.discountedPrice || prod.price;
      subtotal += unitPrice * item.quantity;

      verifiedItems.push({
        productId: item.productId,
        vendorId: prod.vendorId,
        name: prod.name,
        sku: prod.sku,
        price: unitPrice,
        quantity: item.quantity,
        variation: item.variation || null,
        image: prod.images[0]
      });
    }

    // Delivery fee
    const deliveryFee = this.calculateDeliveryFee(params.deliveryAddress.state, params.deliveryAddress.lga);
    const total = subtotal + deliveryFee;

    // Order number generation OSO-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `OSO-${dateStr}-${randomSuffix}`;
    const orderId = `order-${Date.now()}`;

    const order: Order = {
      id: orderId,
      orderNumber,
      customerId: params.customerId,
      customerDetails: params.customerDetails,
      deliveryAddress: params.deliveryAddress,
      items: verifiedItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'Unpaid',
      orderStatus: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.orders[orderId] = order;

    // Notify Admin of new order
    this.createNotification(
      'ADMIN',
      'New Order Placed',
      `Order ${orderNumber} placed for ₦${total.toLocaleString()} by ${params.deliveryAddress.fullName}`,
      'order'
    );

    this.saveData();
    return { order, orderId, orderNumber, total, subtotal, deliveryFee };
  }

  public getOrders(filters?: { customerId?: string; vendorId?: string }): Order[] {
    let list = Object.values(this.data.orders);
    if (filters?.customerId) {
      list = list.filter(o => o.customerId === filters.customerId);
    }
    if (filters?.vendorId) {
      list = list.filter(o => o.items.some(i => i.vendorId === filters.vendorId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(orderId: string): Order | undefined {
    return this.data.orders[orderId];
  }

  // Paystack Payment Verification
  public verifyPaystackPayment(orderId: string, reference: string, paystackDetails?: any): Order {
    const order = this.data.orders[orderId];
    if (!order) throw new Error('Order not found');

    if (order.paymentStatus === 'Paid') {
      // Idempotent duplicate check
      return order;
    }

    // Decrement inventory atomically
    for (const item of order.items) {
      const prod = this.data.products[item.productId];
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    // Update order
    order.paymentStatus = 'Paid';
    order.orderStatus = 'Confirmed';
    order.updatedAt = new Date().toISOString();

    // Create payment audit record
    const paymentId = `pay-${Date.now()}`;
    const payment: Payment = {
      id: paymentId,
      orderId,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      method: 'paystack',
      amount: order.total,
      status: 'Paid',
      paystackReference: reference,
      paystackResponse: paystackDetails || {
        channel: 'card',
        paidAt: new Date().toISOString(),
        status: 'success'
      },
      createdAt: new Date().toISOString()
    };
    this.data.payments[paymentId] = payment;

    // Notifications
    this.createNotification(
      order.customerId,
      'Payment Received',
      `Your payment of ₦${order.total.toLocaleString()} for order ${order.orderNumber} has been verified via Paystack.`,
      'payment'
    );

    this.createNotification(
      'ADMIN',
      'Paystack Payment Confirmed',
      `Paystack confirmed payment of ₦${order.total.toLocaleString()} for ${order.orderNumber}.`,
      'payment'
    );

    this.saveData();
    return order;
  }

  // Manual Transfer Submission
  public submitManualPayment(params: {
    orderId: string;
    customerId: string;
    accountTransferredTo: 'OPay' | 'Paystack';
    transferReference: string;
    proofUrl?: string | null;
  }): { payment: Payment; order: Order } {
    const order = this.data.orders[params.orderId];
    if (!order) throw new Error('Order not found');
    if (order.customerId !== params.customerId) {
      throw new Error('Unauthorized: Order belongs to another customer');
    }

    order.paymentStatus = 'Pending Verification';
    order.updatedAt = new Date().toISOString();

    const paymentId = `pay-${Date.now()}`;
    const payment: Payment = {
      id: paymentId,
      orderId: params.orderId,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      method: 'manual_transfer',
      amount: order.total,
      status: 'Pending Verification',
      paystackReference: null,
      manualPaymentDetails: {
        accountTransferredTo: params.accountTransferredTo,
        transferReference: params.transferReference,
        proofUrl: params.proofUrl || null,
        submittedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };

    this.data.payments[paymentId] = payment;

    this.createNotification(
      'ADMIN',
      'Manual Transfer Submitted',
      `Manual transfer submitted for order ${order.orderNumber} to ${params.accountTransferredTo}. Reference: ${params.transferReference}.`,
      'payment'
    );

    this.createNotification(
      order.customerId,
      'Transfer Proof Received',
      `Your payment details for order ${order.orderNumber} were received and are awaiting verification.`,
      'payment'
    );

    this.saveData();
    return { payment, order };
  }

  // Admin Review of Manual Payment
  public reviewManualPayment(params: {
    paymentId: string;
    adminUid: string;
    decision: 'approve' | 'reject';
  }): { payment: Payment; order: Order } {
    const payment = this.data.payments[params.paymentId];
    if (!payment) throw new Error('Payment record not found');

    const order = this.data.orders[payment.orderId];
    if (!order) throw new Error('Associated order not found');

    if (params.decision === 'approve') {
      // Decrement inventory atomically
      for (const item of order.items) {
        const prod = this.data.products[item.productId];
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      }

      payment.status = 'Paid';
      if (payment.manualPaymentDetails) {
        payment.manualPaymentDetails.verifiedBy = params.adminUid;
        payment.manualPaymentDetails.verifiedAt = new Date().toISOString();
      }

      order.paymentStatus = 'Paid';
      order.orderStatus = 'Confirmed';
      order.updatedAt = new Date().toISOString();

      this.createNotification(
        order.customerId,
        'Manual Payment Approved!',
        `Your direct transfer for order ${order.orderNumber} (₦${order.total.toLocaleString()}) has been verified. Preparing for dispatch!`,
        'payment'
      );
    } else {
      payment.status = 'Rejected';
      if (payment.manualPaymentDetails) {
        payment.manualPaymentDetails.verifiedBy = params.adminUid;
        payment.manualPaymentDetails.verifiedAt = new Date().toISOString();
      }

      order.paymentStatus = 'Rejected';
      order.updatedAt = new Date().toISOString();

      this.createNotification(
        order.customerId,
        'Manual Payment Declined',
        `Your transfer reference for order ${order.orderNumber} could not be verified by Admin. Please check your transaction details.`,
        'payment'
      );
    }

    this.saveData();
    return { payment, order };
  }

  // Update order status (Processing, Shipped, Delivered)
  public updateOrderStatus(orderId: string, status: Order['orderStatus']): Order {
    const order = this.data.orders[orderId];
    if (!order) throw new Error('Order not found');
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();

    this.createNotification(
      order.customerId,
      `Order Status Update: ${status}`,
      `Your order ${order.orderNumber} is now marked as ${status}.`,
      'order'
    );

    this.saveData();
    return order;
  }

  // Payments
  public getPayments(): Payment[] {
    return Object.values(this.data.payments).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Platform Settings
  public getPlatformSettings(): PlatformPaymentSettings {
    return this.data.platformSettings;
  }

  public updatePlatformSettings(settings: Partial<PlatformPaymentSettings>): PlatformPaymentSettings {
    this.data.platformSettings = {
      ...this.data.platformSettings,
      ...settings
    };
    this.saveData();
    return this.data.platformSettings;
  }

  // Notifications
  public getNotifications(recipientId: string): AppNotification[] {
    return Object.values(this.data.notifications)
      .filter(n => n.recipientId === recipientId || (recipientId === 'ADMIN' && n.recipientId === 'ADMIN'))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public markNotificationRead(notifId: string): void {
    if (this.data.notifications[notifId]) {
      this.data.notifications[notifId].read = true;
      this.saveData();
    }
  }

  public createNotification(
    recipientId: string,
    title: string,
    message: string,
    type: 'order' | 'payment' | 'verification' | 'product' = 'order'
  ): AppNotification {
    const id = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const notification: AppNotification = {
      id,
      recipientId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications[id] = notification;
    this.saveData();
    return notification;
  }
}

export const store = new MarketplaceStore();
