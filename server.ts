import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { store } from './server/store';

dotenv.config();

const app = express();
const PORT = 3000;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

// -------------------------------------------------------------
// BODY PARSING
// -------------------------------------------------------------
// Raw body for Paystack webhook signature validation
app.use('/api/payments/paystack/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// -------------------------------------------------------------
// AUTH & RBAC MIDDLEWARE
// -------------------------------------------------------------
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: 'customer' | 'vendor' | 'admin';
  };
}

function verifyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    // If token matches a user UID
    const userByUid = store.getUser(token);
    if (userByUid) {
      req.user = { uid: userByUid.uid, email: userByUid.email, role: userByUid.role };
      return next();
    }
  }

  // Fallback to active demo session user
  const currentUser = store.getCurrentUser();
  if (currentUser) {
    req.user = {
      uid: currentUser.uid,
      email: currentUser.email,
      role: currentUser.role
    };
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
}

function requireRole(roles: ('customer' | 'vendor' | 'admin')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userProfile = store.getUser(req.user.uid);
    if (!userProfile) {
      return res.status(403).json({ error: 'Access denied: Profile missing' });
    }
    if (!roles.includes(userProfile.role)) {
      return res.status(403).json({ error: `Forbidden: Requires [${roles.join(', ')}] role` });
    }
    next();
  };
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    marketplace: 'Oso-Ahia (Market Rush)',
    paystackConfigured: Boolean(PAYSTACK_SECRET_KEY)
  });
});

// Current User & Session Switching (for fast testing across Customer, Vendor, and Admin roles)
app.get('/api/auth/current', (req, res) => {
  const user = store.getCurrentUser();
  const vendor = user.role === 'vendor' ? store.getVendorByUserId(user.uid) : null;
  res.json({ user, vendor });
});

app.get('/api/auth/users', (req, res) => {
  res.json({ users: store.getUsers() });
});

app.post('/api/auth/switch-user', (req, res) => {
  const { userId } = req.body;
  try {
    const user = store.setCurrentUser(userId);
    const vendor = user.role === 'vendor' ? store.getVendorByUserId(user.uid) : null;
    res.json({ success: true, user, vendor });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update location preference
app.post('/api/auth/location', verifyAuth, (req: AuthenticatedRequest, res) => {
  const { state, lga } = req.body;
  if (!state || !lga) return res.status(400).json({ error: 'State and LGA required' });
  store.updateUserLocation(req.user!.uid, { state, lga });
  res.json({ success: true, location: { state, lga } });
});

// Categories
app.get('/api/categories', (req, res) => {
  res.json(store.getCategories());
});

// Delivery Locations
app.get('/api/delivery/locations', (req, res) => {
  res.json(store.getDeliveryLocations());
});

// -------------------------------------------------------------
// DELIVERY FEE CALCULATION (Exact specification matching)
// -------------------------------------------------------------
app.post('/api/delivery/calculate', (req, res) => {
  const { state, lga } = req.body;
  if (!state || !lga) {
    return res.status(400).json({ error: 'State and LGA are required' });
  }

  try {
    const fee = store.calculateDeliveryFee(state, lga);
    return res.json({ success: true, state, lga, fee });
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});

// Products Listing
app.get('/api/products', (req, res) => {
  const { category, condition, search, state, featured, vendorId, includePending } = req.query;
  const products = store.getProducts({
    category: category as string,
    condition: condition as string,
    search: search as string,
    state: state as string,
    featured: featured === 'true',
    vendorId: vendorId as string,
    includePending: includePending === 'true'
  });
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = store.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Vendor Create Product (Requires Approved Vendor)
app.post('/api/products/create', verifyAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = store.getUser(req.user!.uid);
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ error: 'Only registered vendors can create products' });
    }

    const vendor = store.getVendorByUserId(user.uid);
    if (!vendor || vendor.verificationStatus !== 'approved') {
      return res.status(403).json({
        error: 'Vendor verification required. Your vendor profile is currently pending approval.'
      });
    }

    const {
      name,
      slug,
      sku,
      description,
      brand,
      categoryId,
      condition,
      price,
      discountedPrice,
      stock,
      images,
      specifications,
      variations,
      supportedStates
    } = req.body;

    if (!name || !price || stock === undefined || !categoryId) {
      return res.status(400).json({ error: 'Missing required product fields (name, price, stock, category)' });
    }

    const product = store.createProduct({
      vendorId: vendor.id,
      vendorName: vendor.businessName,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: sku || `OSO-${Math.floor(1000 + Math.random() * 9000)}`,
      description: description || '',
      brand: brand || 'General',
      categoryId,
      condition: condition || 'New',
      price: Number(price),
      discountedPrice: discountedPrice ? Number(discountedPrice) : null,
      stock: Number(stock),
      images: images && images.length ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
      specifications: specifications || {},
      variations: variations || [],
      supportedStates: supportedStates || ['Lagos'],
      isPublished: true,
      isFeatured: false
    });

    res.status(201).json({ success: true, product });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Product Review
app.post('/api/admin/products/review', verifyAuth, requireRole(['admin']), (req, res) => {
  const { productId, decision } = req.body;
  if (!productId || !['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'productId and valid decision (approved/rejected) required' });
  }
  try {
    const product = store.reviewProduct(productId, decision);
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Vendor Registration & Profile
app.get('/api/vendors/current', verifyAuth, (req: AuthenticatedRequest, res) => {
  const vendor = store.getVendorByUserId(req.user!.uid);
  res.json({ vendor });
});

app.post('/api/vendors/register', verifyAuth, (req: AuthenticatedRequest, res) => {
  const { businessName, businessAddress, state, lga, bankDetails, verificationDocUrl } = req.body;
  if (!businessName || !businessAddress || !state || !lga || !bankDetails?.accountNumber) {
    return res.status(400).json({ error: 'Please provide all business information and bank details' });
  }
  try {
    const vendor = store.registerVendor({
      userId: req.user!.uid,
      businessName,
      businessAddress,
      state,
      lga,
      bankDetails,
      verificationDocUrl
    });
    res.status(201).json({ success: true, vendor });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Vendor Review
app.get('/api/admin/vendors', verifyAuth, requireRole(['admin']), (req, res) => {
  res.json(store.getVendors());
});

app.post('/api/admin/vendors/review', verifyAuth, requireRole(['admin']), (req, res) => {
  const { vendorId, decision, commissionRate } = req.body;
  if (!vendorId || !['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'vendorId and valid decision (approved/rejected) required' });
  }
  try {
    const vendor = store.reviewVendor(vendorId, decision, commissionRate);
    res.json({ success: true, vendor });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ORDER INITIALIZATION & INVENTORY VALIDATION (Exact spec)
// -------------------------------------------------------------
app.post('/api/orders/create', verifyAuth, (req: AuthenticatedRequest, res) => {
  const { items, deliveryAddress, paymentMethod } = req.body;
  const uid = req.user!.uid;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart cannot be empty' });
  }
  if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.street || !deliveryAddress.state || !deliveryAddress.lga) {
    return res.status(400).json({ error: 'Incomplete delivery address details' });
  }

  try {
    const result = store.createOrder({
      customerId: uid,
      customerDetails: {
        fullName: deliveryAddress.fullName,
        email: req.user!.email,
        phone: deliveryAddress.phone
      },
      deliveryAddress,
      items,
      paymentMethod: paymentMethod || 'paystack'
    });

    return res.status(201).json({
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      total: result.total,
      subtotal: result.subtotal,
      deliveryFee: result.deliveryFee,
      order: result.order
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Orders List (Customer's own orders or Admin all orders)
app.get('/api/orders', verifyAuth, (req: AuthenticatedRequest, res) => {
  const user = store.getUser(req.user!.uid);
  if (user?.role === 'admin') {
    return res.json(store.getOrders());
  }
  if (user?.role === 'vendor') {
    const vendor = store.getVendorByUserId(user.uid);
    if (vendor) {
      return res.json(store.getOrders({ vendorId: vendor.id }));
    }
  }
  return res.json(store.getOrders({ customerId: req.user!.uid }));
});

app.get('/api/orders/:id', verifyAuth, (req: AuthenticatedRequest, res) => {
  const order = store.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Order status mutation by Admin
app.post('/api/admin/orders/status', verifyAuth, requireRole(['admin']), (req, res) => {
  const { orderId, status } = req.body;
  if (!orderId || !status) return res.status(400).json({ error: 'orderId and status required' });
  try {
    const order = store.updateOrderStatus(orderId, status);
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// SECURE PAYSTACK PAYMENT VERIFICATION (Exact spec)
// -------------------------------------------------------------
app.post('/api/payments/paystack/verify', verifyAuth, async (req: AuthenticatedRequest, res) => {
  const { reference, orderId } = req.body;
  if (!reference || !orderId) {
    return res.status(400).json({ error: 'Payment reference and orderId are required' });
  }

  try {
    const order = store.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Associated order does not exist' });
    }

    let paystackData: any = null;

    // 1. If PAYSTACK_SECRET_KEY is present in backend, perform live verification
    if (PAYSTACK_SECRET_KEY && PAYSTACK_SECRET_KEY.startsWith('sk_')) {
      const paystackRes = await axios.get(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
          }
        }
      );

      paystackData = paystackRes.data.data;
      if (!paystackRes.data.status || paystackData.status !== 'success') {
        return res.status(400).json({ error: 'Payment verification failed: Payment was not successful' });
      }

      // Validate exact amount (Paystack amount is in Kobo: NGN 1 = 100 kobo)
      const expectedAmountKobo = Math.round(order.total * 100);
      if (paystackData.amount < expectedAmountKobo) {
        return res.status(400).json({
          error: `Fraud Alert: Amount paid (₦${paystackData.amount / 100}) does not match order total (₦${order.total})`
        });
      }
    } else {
      // Sandbox/Test mode verification (provides immediate test fidelity)
      console.log(`[Paystack Sandbox] Verified reference ${reference} for order ${order.orderNumber}`);
      paystackData = {
        status: 'success',
        reference,
        amount: Math.round(order.total * 100),
        channel: 'card',
        paid_at: new Date().toISOString(),
        authorization: {
          brand: 'mastercard',
          last4: '4081',
          bank: 'Access Bank'
        }
      };
    }

    // 2. Execute idempotent state update and decrement inventory
    const updatedOrder = store.verifyPaystackPayment(orderId, reference, paystackData);

    return res.json({
      success: true,
      message: 'Payment successfully verified and confirmed',
      order: updatedOrder
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Payment verification failed' });
  }
});

// -------------------------------------------------------------
// PAYSTACK WEBHOOK HANDLER (Exact spec)
// -------------------------------------------------------------
app.post('/api/payments/paystack/webhook', async (req, res) => {
  try {
    if (PAYSTACK_SECRET_KEY) {
      const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(req.body).digest('hex');
      if (hash !== req.headers['x-paystack-signature']) {
        return res.status(401).send('Invalid signature');
      }
    }

    const event = JSON.parse(req.body.toString());
    if (event.event === 'charge.success') {
      const data = event.data;
      const reference = data.reference;

      // Idempotent check
      const existingPayments = store.getPayments();
      const match = existingPayments.find(p => p.paystackReference === reference);
      if (match && match.status === 'Paid') {
        return res.sendStatus(200);
      }
    }
    return res.sendStatus(200);
  } catch (err: any) {
    return res.status(500).send(err.message);
  }
});

// -------------------------------------------------------------
// MANUAL PAYMENT SUBMISSION (CUSTOMER) (Exact spec)
// -------------------------------------------------------------
app.post('/api/payments/manual/submit', verifyAuth, (req: AuthenticatedRequest, res) => {
  const { orderId, accountTransferredTo, transferReference, proofUrl } = req.body;

  if (!orderId || !accountTransferredTo || !transferReference) {
    return res.status(400).json({ error: 'Missing required manual transfer submission fields' });
  }

  try {
    const { payment, order } = store.submitManualPayment({
      orderId,
      customerId: req.user!.uid,
      accountTransferredTo,
      transferReference,
      proofUrl
    });

    return res.json({
      success: true,
      message: 'Transfer details submitted for Admin verification',
      payment,
      order
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN MANUAL PAYMENT VERIFICATION / REJECTION (Exact spec)
// -------------------------------------------------------------
app.post('/api/admin/payments/manual/review', verifyAuth, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
  const { paymentId, decision } = req.body; // decision: 'approve' | 'reject'
  if (!paymentId || !['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'paymentId and valid decision (approve/reject) required' });
  }

  try {
    const { payment, order } = store.reviewManualPayment({
      paymentId,
      adminUid: req.user!.uid,
      decision
    });

    return res.json({
      success: true,
      message: `Payment ${decision}d successfully`,
      payment,
      order
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Payments Audit Log (Admin)
app.get('/api/admin/payments', verifyAuth, requireRole(['admin']), (req, res) => {
  res.json(store.getPayments());
});

// Platform Payment Settings
app.get('/api/platformSettings/paymentSettings', (req, res) => {
  res.json(store.getPlatformSettings());
});

app.put('/api/admin/platformSettings/paymentSettings', verifyAuth, requireRole(['admin']), (req, res) => {
  const updated = store.updatePlatformSettings(req.body);
  res.json({ success: true, settings: updated });
});

// Notifications
app.get('/api/notifications', verifyAuth, (req: AuthenticatedRequest, res) => {
  const notifs = store.getNotifications(req.user!.uid);
  res.json(notifs);
});

app.post('/api/notifications/:id/read', verifyAuth, (req, res) => {
  store.markNotificationRead(req.params.id);
  res.json({ success: true });
});

// Admin Stats
app.get('/api/admin/stats', verifyAuth, requireRole(['admin']), (req, res) => {
  const orders = store.getOrders();
  const payments = store.getPayments();
  const vendors = store.getVendors();
  const products = store.getProducts({ includePending: true });

  const totalGMV = orders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingManualPayments = payments.filter(p => p.status === 'Pending Verification').length;
  const pendingVendors = vendors.filter(v => v.verificationStatus === 'pending').length;
  const pendingProducts = products.filter(p => p.approvalStatus === 'pending').length;

  res.json({
    totalOrders: orders.length,
    paidOrders: orders.filter(o => o.paymentStatus === 'Paid').length,
    totalGMV,
    pendingManualPayments,
    pendingVendors,
    pendingProducts
  });
});

// Reset Data utility
app.post('/api/admin/reset-data', verifyAuth, requireRole(['admin']), (req, res) => {
  store.resetData();
  res.json({ success: true, message: 'Database reset to initial sample seed state' });
});

// -------------------------------------------------------------
// VITE INTEGRATION & SERVER STARTUP
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Oso-Ahia (Market Rush) Engine operating on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});
