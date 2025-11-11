
import { db, isFirebaseConfigured } from './firebase';
import firebase from 'firebase/compat/app';
import { Product, Order, Employee, Attendance, CartItem } from '../types';
import toast from 'react-hot-toast';

// --- MOCK DATA FOR DEMO MODE ---
const mockProducts: Product[] = [
    { id: 'p1', name: 'Cococrunch', flavor: 'Cokelat Klasik', price: 15000, stock: 50, minStock: 10, imageUrl: 'https://images.unsplash.com/photo-1565935392348-ec85741b5391?q=80&w=400&h=300&fit=crop' },
    { id: 'p2', name: 'Basreng', flavor: 'Pedas Daun Jeruk', price: 12000, stock: 8, minStock: 10, imageUrl: 'https://images.unsplash.com/photo-1627822612423-a151b6a4a9a0?q=80&w=400&h=300&fit=crop' },
    { id: 'p3', name: 'Cococrunch', flavor: 'Green Tea', price: 16000, stock: 30, minStock: 5, imageUrl: 'https://images.unsplash.com/photo-1600326144458-00c4163b2553?q=80&w=400&h=300&fit=crop' },
    { id: 'p4', name: 'Basreng', flavor: 'Original Asin', price: 10000, stock: 100, minStock: 20, imageUrl: 'https://images.unsplash.com/photo-1599490659226-3d7584732ebb?q=80&w=400&h=300&fit=crop' }
];

const mockOrders: Order[] = [
    { id: 'o1', customerName: 'Budi Santoso', customerAddress: 'Jl. Merdeka No. 17', date: new Date(new Date().setDate(new Date().getDate() - 1)), total: 27000, items: [{ product: mockProducts[0], quantity: 1 }, { product: mockProducts[1], quantity: 1 }] },
    { id: 'o2', customerName: 'Citra Lestari', customerAddress: 'Jl. Pahlawan No. 2', date: new Date(new Date().setDate(new Date().getDate() - 3)), total: 32000, items: [{ product: mockProducts[2], quantity: 2 }] }
];

const mockEmployees: Employee[] = [
    { id: 'e1', name: 'Agus Setiawan', position: 'Manajer Produksi', baseSalary: 5000000 },
    { id: 'e2', name: 'Dewi Anggraini', position: 'Staf Pemasaran', baseSalary: 3500000 }
];

const mockAttendance: Attendance[] = [
    { id: 'a1', employeeId: 'e1', employeeName: 'Agus Setiawan', date: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'Hadir' },
    { id: 'a2', employeeId: 'e2', employeeName: 'Dewi Anggraini', date: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'Hadir' }
];

// Use 'let' to allow mutations in demo mode, simulating a database.
let MOCK_DB = {
    products: [...mockProducts],
    orders: [...mockOrders],
    employees: [...mockEmployees],
    attendance: [...mockAttendance]
};

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper function to convert Firestore doc to Product type
const toProduct = (doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>): Product => ({ ...doc.data() as Omit<Product, 'id'>, id: doc.id });
const toOrder = (doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>): Order => ({ ...doc.data() as Omit<Order, 'id' | 'date'>, id: doc.id, date: (doc.data().date as firebase.firestore.Timestamp).toDate() });
const toEmployee = (doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>): Employee => ({ ...doc.data() as Omit<Employee, 'id'>, id: doc.id });
const toAttendance = (doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>): Attendance => ({ ...doc.data() as Omit<Attendance, 'id' | 'date'>, id: doc.id, date: (doc.data().date as firebase.firestore.Timestamp).toDate() });

// --- Product Functions ---
export const getProducts = async (): Promise<Product[]> => {
    if (!isFirebaseConfigured) return Promise.resolve(MOCK_DB.products);
    const productsCol = db!.collection('products');
    const productSnapshot = await productsCol.get();
    return productSnapshot.docs.map(toProduct);
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    if (!isFirebaseConfigured) {
        await simulateDelay(500);
        const newProduct: Product = { ...productData, id: `mock_p_${Date.now()}` };
        MOCK_DB.products.push(newProduct);
        // FIX: The `react-hot-toast` library does not have a built-in `toast.info` method. Using the default `toast()` function instead.
        toast("Mode Demo: Produk baru ditambahkan (tidak disimpan).", { icon: 'ℹ️' });
        return newProduct;
    }
    const productsCol = db!.collection('products');
    const docRef = await productsCol.add(productData);
    return { ...productData, id: docRef.id };
};

export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    if (!isFirebaseConfigured) {
        await simulateDelay(500);
        MOCK_DB.products = MOCK_DB.products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        // FIX: The `react-hot-toast` library does not have a built-in `toast.info` method. Using the default `toast()` function instead.
        toast("Mode Demo: Produk diperbarui (tidak disimpan).", { icon: 'ℹ️' });
        return updatedProduct;
    }
    const productDoc = db!.collection('products').doc(updatedProduct.id);
    const { id, ...productData } = updatedProduct;
    await productDoc.update(productData);
    return updatedProduct;
};

export const deleteProduct = async (productId: string): Promise<void> => {
    if (!isFirebaseConfigured) {
        await simulateDelay(500);
        MOCK_DB.products = MOCK_DB.products.filter(p => p.id !== productId);
        // FIX: The `react-hot-toast` library does not have a built-in `toast.info` method. Using the default `toast()` function instead.
        toast("Mode Demo: Produk dihapus (tidak disimpan).", { icon: 'ℹ️' });
        return;
    }
    const productDoc = db!.collection('products').doc(productId);
    await productDoc.delete();
};

// --- Order Functions ---
export const getOrders = async (): Promise<Order[]> => {
    if (!isFirebaseConfigured) return Promise.resolve(MOCK_DB.orders.sort((a, b) => b.date.getTime() - a.date.getTime()));
    const ordersCol = db!.collection('orders');
    const orderSnapshot = await ordersCol.get();
    return orderSnapshot.docs.map(toOrder).sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const addOrder = async (orderData: Omit<Order, 'id' | 'date'>): Promise<Order> => {
    if (!isFirebaseConfigured) {
        await simulateDelay(1000);
        const newOrder: Order = { ...orderData, id: `mock_o_${Date.now()}`, date: new Date() };
        MOCK_DB.orders.push(newOrder);
        // Simulate stock update in demo mode
        newOrder.items.forEach(item => {
            const product = MOCK_DB.products.find(p => p.id === item.product.id);
            if (product) {
                product.stock -= item.quantity;
            }
        });
        // FIX: The `react-hot-toast` library does not have a built-in `toast.info` method. Using the default `toast()` function instead.
        toast("Mode Demo: Pesanan berhasil dibuat (tidak disimpan).", { icon: 'ℹ️' });
        return newOrder;
    }
    const batch = db!.batch();
    const newOrderRef = db!.collection('orders').doc();
    const newOrderPayload = { ...orderData, date: firebase.firestore.Timestamp.fromDate(new Date()) };
    batch.set(newOrderRef, newOrderPayload);

    orderData.items.forEach((item: CartItem) => {
        const productRef = db!.collection('products').doc(item.product.id);
        const newStock = item.product.stock - item.quantity;
        batch.update(productRef, { stock: newStock });
    });
    await batch.commit();
    return { ...orderData, id: newOrderRef.id, date: newOrderPayload.date.toDate() };
};

// --- Employee Functions ---
export const getEmployees = async (): Promise<Employee[]> => {
    if (!isFirebaseConfigured) return Promise.resolve(MOCK_DB.employees);
    const employeesCol = db!.collection('employees');
    const employeeSnapshot = await employeesCol.get();
    return employeeSnapshot.docs.map(toEmployee);
};

export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    if (!isFirebaseConfigured) {
        await simulateDelay(500);
        const newEmployee: Employee = { ...employeeData, id: `mock_e_${Date.now()}` };
        MOCK_DB.employees.push(newEmployee);
        // FIX: The `react-hot-toast` library does not have a built-in `toast.info` method. Using the default `toast()` function instead.
        toast("Mode Demo: Karyawan ditambahkan (tidak disimpan).", { icon: 'ℹ️' });
        return newEmployee;
    }
    const employeesCol = db!.collection('employees');
    const docRef = await employeesCol.add(employeeData);
    return { ...employeeData, id: docRef.id };
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee> => {
     if (!isFirebaseConfigured) {
        await simulateDelay(500);
        MOCK_DB.employees = MOCK_DB.employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e);
        // FIX: The `react-hot-toast` library does not have a built-in `toast.info` method. Using the default `toast()` function instead.
        toast("Mode Demo: Data karyawan diperbarui (tidak disimpan).", { icon: 'ℹ️' });
        return updatedEmployee;
    }
    const employeeDoc = db!.collection('employees').doc(updatedEmployee.id);
    const { id, ...employeeData } = updatedEmployee;
    await employeeDoc.update(employeeData);
    return updatedEmployee;
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
    if (!isFirebaseConfigured) {
        await simulateDelay(500);
        MOCK_DB.employees = MOCK_DB.employees.filter(e => e.id !== employeeId);
        // FIX: The `react-hot-toast` library does not have a built-in `toast.info` method. Using the default `toast()` function instead.
        toast("Mode Demo: Karyawan dihapus (tidak disimpan).", { icon: 'ℹ️' });
        return;
    }
    const employeeDoc = db!.collection('employees').doc(employeeId);
    await employeeDoc.delete();
};

// --- Attendance Functions ---
export const getAttendance = async (): Promise<Attendance[]> => {
    if (!isFirebaseConfigured) return Promise.resolve(MOCK_DB.attendance.sort((a, b) => b.date.getTime() - a.date.getTime()));
    const attendanceCol = db!.collection('attendance');
    const attendanceSnapshot = await attendanceCol.get();
    return attendanceSnapshot.docs.map(toAttendance).sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const addAttendance = async (attendanceData: Omit<Attendance, 'id'>): Promise<Attendance> => {
    if (!isFirebaseConfigured) {
        await simulateDelay(500);
        const newAttendance: Attendance = { ...attendanceData, id: `mock_a_${Date.now()}` };
        MOCK_DB.attendance.push(newAttendance);
        // FIX: The `react-hot-toast` library does not have a built-in `toast.info` method. Using the default `toast()` function instead.
        toast("Mode Demo: Absensi dicatat (tidak disimpan).", { icon: 'ℹ️' });
        return newAttendance;
    }
    const attendanceCol = db!.collection('attendance');
    const payload = { ...attendanceData, date: firebase.firestore.Timestamp.fromDate(attendanceData.date) };
    const docRef = await attendanceCol.add(payload);
    return { ...attendanceData, id: docRef.id };
};
