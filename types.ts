
export interface Product {
  id: string;
  name: string;
  flavor: string;
  price: number;
  stock: number;
  minStock: number;
  imageUrl: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string; // ID unik untuk setiap sesi pengguna
  items: CartItem[];
  total: number;
  customerName: string;
  customerAddress: string;
  customerWhatsapp: string; // Nomor WhatsApp untuk pre-order
  paymentMethod: 'Tunai' | 'Transfer'; // Metode Pembayaran
  date: Date;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  baseSalary: number;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  status: 'Hadir' | 'Sakit' | 'Izin';
}

export interface BusinessInfo {
  id: string; // Should be a singleton document, e.g., 'main'
  name: string;
  tagline: string;
  instagramUrl: string;
  tiktokUrl: string;
  whatsappNumber: string; // e.g., 6281234567890
}
