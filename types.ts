
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

  items: CartItem[];
  total: number;
  customerName: string;
  customerAddress: string;
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
