export type UserRole = 'customer' | 'vendor' | 'admin';

export interface UserLocation {
  state: string;
  lga: string;
}

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone: string;
  defaultLocation: UserLocation;
  createdAt: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  businessAddress: string;
  state: string;
  lga: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationDocUrl: string;
  bankDetails: BankDetails;
  commissionRate: number;
  createdAt: string;
}

export type ProductCondition = 'New' | 'Used' | 'Refurbished';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ProductVariationOption {
  label: string;
  price: number;
  stock: number;
  sku: string;
}

export interface ProductVariation {
  name: string;
  options: ProductVariationOption[];
}

export interface Product {
  id: string;
  vendorId: string;
  vendorName?: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  brand: string;
  categoryId: string;
  condition: ProductCondition;
  price: number;
  discountedPrice: number | null;
  stock: number;
  images: string[];
  specifications: Record<string, string>;
  variations?: ProductVariation[];
  supportedStates: string[];
  approvalStatus: ApprovalStatus;
  isPublished: boolean;
  isFeatured: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl: string;
  order: number;
}

export interface LgaFeeInfo {
  fee: number;
  isActive: boolean;
}

export interface DeliveryLocation {
  id: string;
  state: string;
  isActive: boolean;
  lgas: Record<string, LgaFeeInfo>;
}

export interface OrderItem {
  productId: string;
  vendorId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  variation?: string | null;
  image?: string;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  street: string;
  state: string;
  lga: string;
  instructions?: string;
}

export type PaymentMethod = 'paystack' | 'manual_transfer';

export type PaymentStatus = 
  | 'Unpaid' 
  | 'Pending' 
  | 'Pending Verification' 
  | 'Paid' 
  | 'Failed' 
  | 'Rejected';

export type OrderStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Processing' 
  | 'Shipped' 
  | 'Delivered' 
  | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerDetails: {
    fullName: string;
    email: string;
    phone: string;
  };
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  status?: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ManualPaymentDetails {
  accountTransferredTo: 'OPay' | 'Paystack';
  transferReference: string;
  proofUrl: string | null;
  submittedAt: string;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
}

export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  gateway?: string;
  accountTransferredTo?: 'OPay' | 'Paystack';
  transferReference?: string;
  proofUrl?: string | null;
  paystackReference: string | null;
  paystackResponse?: Record<string, any> | null;
  manualPaymentDetails?: ManualPaymentDetails | null;
  createdAt: string;
}

export type PaymentRecord = Payment;

export interface PlatformPaymentSettings {
  activeManualGateways: 'paystack_only' | 'opay_only' | 'both';
  opayManualAccount: {
    accountName: string;
    accountNumber: string;
    enabled: boolean;
  };
  paystackManualAccount: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    enabled: boolean;
  };
  marketplaceCommissionRate: number;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'verification' | 'product';
  read: boolean;
  createdAt: string;
}

export type Notification = AppNotification;

export interface CartItem {
  product: Product;
  quantity: number;
  variation?: string;
}
