
import { Product, Order, Employee, Attendance } from '../types';

// ============================================================================
// MOCK DATABASE - This simulates a serverless DB like Firestore for demo purposes.
// In a real application, you would replace these arrays and functions with
// actual calls to Firebase Firestore SDK (e.g., using `getDocs`, `addDoc`, etc.).
// ============================================================================

let mockProducts: Product[] = [
  { id: 'p1', name: 'Cococrunch', flavor: 'Cokelat Original', price: 15000, stock: 120, minStock: 20, imageUrl: 'https://picsum.photos/id/10/400/300' },
  { id: 'p2', name: 'Cococrunch', flavor: 'Strawberry', price: 16000, stock: 80, minStock: 20, imageUrl: 'https://picsum.photos/id/20/400/300' },
  { id: 'p3', name: 'Basreng', flavor: 'Pedas Daun Jeruk', price: 12000, stock: 15, minStock: 25, imageUrl: 'https://picsum.photos/id/30/400/300' },
  { id: 'p4', name: 'Basreng', flavor: 'Original Asin', price: 10000, stock: 200, minStock: 25, imageUrl: 'https://picsum.photos/id/40/400/300' },
];

let mockOrders: Order[] = [
    // Mock orders will be added dynamically
];

let mockEmployees: Employee[] = [
  { id: 'e1', name: 'Budi Santoso', position: 'Manajer Produksi', baseSalary: 5000000 },
  { id: 'e2', name: 'Siti Aminah', position: 'Staf Pemasaran', baseSalary: 4000000 },
];

let mockAttendance: Attendance[] = [
    { id: 'a1', employeeId: 'e1', employeeName: 'Budi Santoso', date: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'Hadir' },
    { id: 'a2', employeeId: 'e2', employeeName: 'Siti Aminah', date: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'Hadir' },
    { id: 'a3', employeeId: 'e1', employeeName: 'Budi Santoso', date: new Date(), status: 'Hadir' },
];

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Product Functions ---
export const getProducts = async (): Promise<Product[]> => {
  await simulateDelay(500);
  return [...mockProducts];
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    await simulateDelay(500);
    const newProduct: Product = { ...product, id: `p${Date.now()}` };
    mockProducts.push(newProduct);
    return newProduct;
};

export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    await simulateDelay(500);
    mockProducts = mockProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    return updatedProduct;
};

export const deleteProduct = async (productId: string): Promise<void> => {
    await simulateDelay(500);
    mockProducts = mockProducts.filter(p => p.id !== productId);
};


// --- Order Functions ---
export const getOrders = async (): Promise<Order[]> => {
    await simulateDelay(500);
    return [...mockOrders].sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const addOrder = async (order: Omit<Order, 'id' | 'date'>): Promise<Order> => {
    await simulateDelay(800);
    const newOrder: Order = { ...order, id: `o${Date.now()}`, date: new Date() };
    mockOrders.push(newOrder);
    // Simulate stock reduction
    order.items.forEach(item => {
        const product = mockProducts.find(p => p.id === item.product.id);
        if (product) {
            product.stock -= item.quantity;
        }
    });
    return newOrder;
};

// --- Employee Functions ---
export const getEmployees = async (): Promise<Employee[]> => {
    await simulateDelay(500);
    return [...mockEmployees];
};
export const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
    await simulateDelay(500);
    const newEmployee: Employee = { ...employee, id: `e${Date.now()}` };
    mockEmployees.push(newEmployee);
    return newEmployee;
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee> => {
    await simulateDelay(500);
    mockEmployees = mockEmployees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e);
    return updatedEmployee;
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
    await simulateDelay(500);
    mockEmployees = mockEmployees.filter(e => e.id !== employeeId);
};

// --- Attendance Functions ---
export const getAttendance = async (): Promise<Attendance[]> => {
    await simulateDelay(500);
    return [...mockAttendance].sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const addAttendance = async (attendance: Omit<Attendance, 'id'>): Promise<Attendance> => {
    await simulateDelay(500);
    const newAttendance: Attendance = { ...attendance, id: `a${Date.now()}` };
    mockAttendance.push(newAttendance);
    return newAttendance;
};
