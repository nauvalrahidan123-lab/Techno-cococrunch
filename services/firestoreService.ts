import { db, isFirebaseConfigured } from './firebase';
import { 
    collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, writeBatch, Timestamp, query, orderBy, setDoc, DocumentSnapshot, QueryDocumentSnapshot
} from 'firebase/firestore';
import { Product, Order, Employee, Attendance, CartItem, BusinessInfo } from '../types';
import toast from 'react-hot-toast';

// --- MOCK DATA FOR DEMO MODE ---
const mockProducts: Product[] = [
    { id: 'p1', name: 'Cococrunch', flavor: 'Cokelat Klasik', price: 15000, stock: 50, minStock: 10, imageUrl: 'https://images.unsplash.com/photo-1565935392348-ec85741b5391?q=80&w=400&h=300&fit=crop' },
    { id: 'p2', name: 'Basreng', flavor: 'Pedas Daun Jeruk', price: 12000, stock: 8, minStock: 10, imageUrl: 'https://images.unsplash.com/photo-1627822612423-a151b6a4a9a0?q=80&w=400&h=300&fit=crop' },
    { id: 'p3', name: 'Cococrunch', flavor: 'Green Tea', price: 16000, stock: 30, minStock: 5, imageUrl: 'https://images.unsplash.com/photo-1600326144458-00c4163b2553?q=80&w=400&h=300&fit=crop' },
    { id: 'p4', name: 'Basreng', flavor: 'Original Asin', price: 10000, stock: 100, minStock: 20, imageUrl: 'https://images.unsplash.com/photo-1599490659226-3d7584732ebb?q=80&w=400&h=300&fit=crop' }
];

const mockOrders: Order[] = [
    { id: 'o1', userId: 'demo-user-1', customerName: 'Budi Santoso', customerAddress: 'Jl. Merdeka No. 17', customerWhatsapp: '08123456789', paymentMethod: 'Transfer', date: new Date(new Date().setDate(new Date().getDate() - 1)), total: 27000, items: [{ product: mockProducts[0], quantity: 1 }, { product: mockProducts[1], quantity: 1 }] },
    { id: 'o2', userId: 'demo-user-2', customerName: 'Citra Lestari', customerAddress: 'Jl. Pahlawan No. 2', customerWhatsapp: '08987654321', paymentMethod: 'Tunai', date: new Date(new Date().setDate(new Date().getDate() - 3)), total: 32000, items: [{ product: mockProducts[2], quantity: 2 }] }
];

const mockEmployees: Employee[] = [
    { id: 'e1', name: 'Agus Setiawan', position: 'Manajer Produksi', baseSalary: 5000000 },
    { id: 'e2', name: 'Dewi Anggraini', position: 'Staf Pemasaran', baseSalary: 3500000 }
];

const mockAttendance: Attendance[] = [
    { id: 'a1', employeeId: 'e1', employeeName: 'Agus Setiawan', date: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'Hadir' },
    { id: 'a2', employeeId: 'e2', employeeName: 'Dewi Anggraini', date: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'Hadir' }
];

const mockBusinessInfo: BusinessInfo = {
    id: 'main',
    name: 'TokoJajan',
    tagline: 'Menyajikan cemilan Cococrunch & Basreng terbaik untuk Anda.',
    instagramUrl: '#',
    tiktokUrl: '#',
    whatsappNumber: '6285849492809',
};


// Use 'let' to allow mutations in demo mode, simulating a database.
let MOCK_DB = {
    products: [...mockProducts],
    orders: [...mockOrders],
    employees: [...mockEmployees],
    attendance: [...mockAttendance],
    businessInfo: { ...mockBusinessInfo }
};

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper function to convert Firestore doc to respective types
const docToData = <T extends {id: string}>(doc: DocumentSnapshot | QueryDocumentSnapshot): T => {
    const data = doc.data();
    // Convert Firestore Timestamps to JS Dates
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate();
        }
    }
    return { ...data, id: doc.id } as T;
};

// --- Product Functions ---
export const getProducts = async (): Promise<Product[]> => {
    if (!isFirebaseConfigured) return Promise.resolve(MOCK_DB.products);
    const productsCol = collection(db!, 'products');
    const productSnapshot = await getDocs(productsCol);
    return productSnapshot.docs.map(doc => docToData<Product>(doc));
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    if (!isFirebaseConfigured) {
        await simulateDelay(500);
        const newProduct: Product = { ...productData, id: `mock_p_${Date.now()}` };
        MOCK_DB.products.push(newProduct);
        toast("Mode Demo: Produk baru ditambahkan (tidak disimpan).", { icon: 'ℹ️' });
        return newProduct;
    }
    const docRef = await addDoc(collection(db!, 'products'), productData);
    return { ...productData, id: docRef.id };
};

export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    if (!isFirebaseConfigured) {
        await simulateDelay(500);
        MOCK_DB.products = MOCK_DB.products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        toast("Mode Demo: Produk diperbarui (tidak disimpan).", { icon: 'ℹ️' });
        return updatedProduct;
    }
    const productDoc = doc(db!, 'products', updatedProduct.id);
    const { id, ...productData } = updatedProduct;
    await updateDoc(productDoc, productData);
    return updatedProduct;
};

export const deleteProduct = async (productId: string): Promise<void> => {
    if (!isFirebaseConfigured) {
        await simulateDelay(500);
        MOCK_DB.products = MOCK_DB.products.filter(p => p.id !== productId);
        toast("Mode Demo: Produk dihapus (tidak disimpan).", { icon: 'ℹ️' });
        return;
    }
    await deleteDoc(doc(db!, 'products', productId));
};

// --- Order Functions ---
export const getOrders = async (): Promise<Order[]> => {
    if (!isFirebaseConfigured) return Promise.resolve(MOCK_DB.orders.sort((a, b) => b.date.getTime() - a.date.getTime()));
    const ordersCol = collection(db!, 'orders');
    const q = query(ordersCol, orderBy('date', 'desc'));
    const orderSnapshot = await getDocs(q);
    return orderSnapshot.docs.map(d => docToData<Order>(d));
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
        toast("Mode Demo: Pesanan berhasil dibuat (tidak disimpan).", { icon: 'ℹ️' });
        return newOrder;
    }
    const batch = writeBatch(db!);
    const newOrderRef = doc(collection(db!, 'orders'));
    const newOrderPayload = { ...orderData, date: Timestamp.fromDate(new Date()) };
    batch.set(newOrderRef, newOrderPayload);

    orderData.items.forEach((item: CartItem) => {
        const productRef = doc(db!, 'products', item.product.id);
        const newStock = item.product.stock - item.quantity;
        batch.update(productRef, { stock: newStock });
    });
    await batch.commit();
    return { ...orderData, id: newOrderRef.id, date: newOrderPayload.date.toDate() };
};

// --- Employee Functions ---
export const getEmployees = async (): Promise<Employee[]> => {
    if (!isFirebaseConfigured) return Promise.resolve(MOCK_DB.employees);
    const snapshot = await getDocs(collection(db!, 'employees'));
    return snapshot.docs.map(d => docToData<Employee>(d));
};

export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    if (!isFirebaseConfigured) {
        await simulateDelay(500);
        const newEmployee: Employee = { ...employeeData, id: `mock_e_${Date.now()}` };
        MOCK_DB.employees.push(newEmployee);
        toast("Mode Demo: Karyawan ditambahkan (tidak disimpan).", { icon: 'ℹ️' });
        return newEmployee;
    }
    const docRef = await addDoc(collection(db!, 'employees'), employeeData);
    return { ...employeeData, id: docRef.id };
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee> => {
     if (!isFirebaseConfigured) {
        await simulateDelay(500);
        MOCK_DB.employees = MOCK_DB.employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e);
        toast("Mode Demo: Data karyawan diperbarui (tidak disimpan).", { icon: 'ℹ️' });
        return updatedEmployee;
    }
    const { id, ...employeeData } = updatedEmployee;
    await updateDoc(doc(db!, 'employees', id), employeeData);
    return updatedEmployee;
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
    if (!isFirebaseConfigured) {
        await simulateDelay(500);
        MOCK_DB.employees = MOCK_DB.employees.filter(e => e.id !== employeeId);
        toast("Mode Demo: Karyawan dihapus (tidak disimpan).", { icon: 'ℹ️' });
        return;
    }
    await deleteDoc(doc(db!, 'employees', employeeId));
};

// --- Attendance Functions ---
export const getAttendance = async (): Promise<Attendance[]> => {
    if (!isFirebaseConfigured) return Promise.resolve(MOCK_DB.attendance.sort((a, b) => b.date.getTime() - a.date.getTime()));
    const q = query(collection(db!, 'attendance'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => docToData<Attendance>(d));
};

export const addAttendance = async (attendanceData: Omit<Attendance, 'id'>): Promise<Attendance> => {
    if (!isFirebaseConfigured) {
        await simulateDelay(500);
        const newAttendance: Attendance = { ...attendanceData, id: `mock_a_${Date.now()}` };
        MOCK_DB.attendance.push(newAttendance);
        toast("Mode Demo: Absensi dicatat (tidak disimpan).", { icon: 'ℹ️' });
        return newAttendance;
    }
    const payload = { ...attendanceData, date: Timestamp.fromDate(attendanceData.date) };
    const docRef = await addDoc(collection(db!, 'attendance'), payload);
    return { ...attendanceData, id: docRef.id };
};

// --- Business Info Functions ---
export const getBusinessInfo = async (): Promise<BusinessInfo> => {
    if (!isFirebaseConfigured) return Promise.resolve(MOCK_DB.businessInfo);
    
    try {
        const docRef = doc(db!, 'businessInfo', 'main');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docToData<BusinessInfo>(docSnap);
        } else {
            // FIX: Proactively create the document if it doesn't exist.
            // This self-healing approach removes the console warning and ensures data is always available.
            console.log("Business info not found. Initializing with default data...");
            // FIX: Use object destructuring to remove 'id' property before saving to Firestore.
            // 'Omit' is a TypeScript type and cannot be used as a value at runtime.
            const { id, ...infoToSave } = mockBusinessInfo;
            await setDoc(docRef, infoToSave);
            return mockBusinessInfo;
        }
    } catch (error: any) {
        if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes('permission'))) {
            toast.error('Info bisnis tidak dapat dimuat. Periksa aturan keamanan Firestore.', { 
                id: 'business-info-permission-error',
                duration: 8000 
            });
            console.warn(
                "Firestore permission denied while fetching business info. " +
                "This is likely due to Firestore security rules needing public read access " +
                "for the 'businessInfo' collection. Falling back to local mock data.",
                error
            );
            return mockBusinessInfo;
        }
        
        console.error("An unexpected error occurred while fetching business info:", error);
        throw error;
    }
};

export const updateBusinessInfo = async (info: BusinessInfo): Promise<BusinessInfo> => {
    if (!isFirebaseConfigured) {
        await simulateDelay(500);
        MOCK_DB.businessInfo = { ...info };
        toast("Mode Demo: Info bisnis diperbarui (tidak disimpan).", { icon: 'ℹ️' });
        return info;
    }
    const docRef = doc(db!, 'businessInfo', 'main');
    const { id, ...infoData } = info;
    await setDoc(docRef, infoData, { merge: true }); // Use set with merge to create if not exists
    return info;
};