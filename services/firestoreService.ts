import { db } from './firebase';
import { 
    collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, writeBatch, Timestamp, query, orderBy, setDoc, DocumentSnapshot, QueryDocumentSnapshot
} from 'firebase/firestore';
import { Product, Order, Employee, Attendance, CartItem, BusinessInfo } from '../types';
import toast from 'react-hot-toast';

// This mock data is now only used for the self-healing feature of Business Info.
const mockBusinessInfo: BusinessInfo = {
    id: 'main',
    name: 'TokoJajan',
    tagline: 'Menyajikan cemilan Cococrunch & Basreng terbaik untuk Anda.',
    instagramUrl: '#',
    tiktokUrl: '#',
    whatsappNumber: '6285849492809',
};

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
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(productsCol);
    return productSnapshot.docs.map(doc => docToData<Product>(doc));
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const docRef = await addDoc(collection(db, 'products'), productData);
    return { ...productData, id: docRef.id };
};

export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    const productDoc = doc(db, 'products', updatedProduct.id);
    const { id, ...productData } = updatedProduct;
    await updateDoc(productDoc, productData);
    return updatedProduct;
};

export const deleteProduct = async (productId: string): Promise<void> => {
    await deleteDoc(doc(db, 'products', productId));
};

// --- Order Functions ---
export const getOrders = async (): Promise<Order[]> => {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, orderBy('date', 'desc'));
    const orderSnapshot = await getDocs(q);
    return orderSnapshot.docs.map(d => docToData<Order>(d));
};

export const addOrder = async (orderData: Omit<Order, 'id' | 'date'>): Promise<Order> => {
    const batch = writeBatch(db);
    const newOrderRef = doc(collection(db, 'orders'));
    const newOrderPayload = { ...orderData, date: Timestamp.fromDate(new Date()) };
    batch.set(newOrderRef, newOrderPayload);

    orderData.items.forEach((item: CartItem) => {
        const productRef = doc(db, 'products', item.product.id);
        const newStock = item.product.stock - item.quantity;
        batch.update(productRef, { stock: newStock });
    });
    await batch.commit();
    return { ...orderData, id: newOrderRef.id, date: newOrderPayload.date.toDate() };
};

// --- Employee Functions ---
export const getEmployees = async (): Promise<Employee[]> => {
    const snapshot = await getDocs(collection(db, 'employees'));
    return snapshot.docs.map(d => docToData<Employee>(d));
};

export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    const docRef = await addDoc(collection(db, 'employees'), employeeData);
    return { ...employeeData, id: docRef.id };
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee> => {
    const { id, ...employeeData } = updatedEmployee;
    await updateDoc(doc(db, 'employees', id), employeeData);
    return updatedEmployee;
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
    await deleteDoc(doc(db, 'employees', employeeId));
};

// --- Attendance Functions ---
export const getAttendance = async (): Promise<Attendance[]> => {
    const q = query(collection(db, 'attendance'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => docToData<Attendance>(d));
};

export const addAttendance = async (attendanceData: Omit<Attendance, 'id'>): Promise<Attendance> => {
    const payload = { ...attendanceData, date: Timestamp.fromDate(attendanceData.date) };
    const docRef = await addDoc(collection(db, 'attendance'), payload);
    return { ...attendanceData, id: docRef.id };
};

// --- Business Info Functions ---
export const getBusinessInfo = async (): Promise<BusinessInfo> => {
    try {
        const docRef = doc(db, 'businessInfo', 'main');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docToData<BusinessInfo>(docSnap);
        } else {
            console.log("Business info not found. Initializing with default data...");
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
    const docRef = doc(db, 'businessInfo', 'main');
    const { id, ...infoData } = info;
    await setDoc(docRef, infoData, { merge: true }); // Use set with merge to create if not exists
    return info;
};