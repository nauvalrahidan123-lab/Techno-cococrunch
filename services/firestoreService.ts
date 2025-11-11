
import { db } from './firebase';
// FIX: Update imports and functions to use Firebase v8 compat API, matching the change in `firebase.ts`.
import firebase from 'firebase/compat/app';
import { Product, Order, Employee, Attendance, CartItem } from '../types';

// Helper function to convert Firestore doc to Product type
const toProduct = (doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>): Product => ({ ...doc.data() as Omit<Product, 'id'>, id: doc.id });

// Helper function to convert Firestore doc to Order type (handles Timestamp)
const toOrder = (doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>): Order => {
    const data = doc.data();
    return {
        ...data as Omit<Order, 'id' | 'date'>,
        id: doc.id,
        date: (data.date as firebase.firestore.Timestamp).toDate() // Convert Firestore Timestamp to JS Date
    };
};

// Helper function to convert Firestore doc to Employee type
const toEmployee = (doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>): Employee => ({ ...doc.data() as Omit<Employee, 'id'>, id: doc.id });

// Helper function to convert Firestore doc to Attendance type (handles Timestamp)
const toAttendance = (doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>): Attendance => {
    const data = doc.data();
    return {
        ...data as Omit<Attendance, 'id' | 'date'>,
        id: doc.id,
        date: (data.date as firebase.firestore.Timestamp).toDate()
    };
};

// --- Product Functions ---
export const getProducts = async (): Promise<Product[]> => {
    const productsCol = db.collection('products');
    const productSnapshot = await productsCol.get();
    return productSnapshot.docs.map(toProduct);
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const productsCol = db.collection('products');
    const docRef = await productsCol.add(productData);
    return { ...productData, id: docRef.id };
};

export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    const productDoc = db.collection('products').doc(updatedProduct.id);
    const { id, ...productData } = updatedProduct; // Firestore update doesn't need the id in the data
    await productDoc.update(productData);
    return updatedProduct;
};

export const deleteProduct = async (productId: string): Promise<void> => {
    const productDoc = db.collection('products').doc(productId);
    await productDoc.delete();
};


// --- Order Functions ---
export const getOrders = async (): Promise<Order[]> => {
    const ordersCol = db.collection('orders');
    const orderSnapshot = await ordersCol.get();
    const orders = orderSnapshot.docs.map(toOrder);
    return orders.sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by most recent
};

export const addOrder = async (orderData: Omit<Order, 'id' | 'date'>): Promise<Order> => {
    // Use a batch write to ensure order is created AND stock is updated atomically
    const batch = db.batch();
    
    // 1. Create a new document reference for the order
    const newOrderRef = db.collection('orders').doc();

    const newOrderPayload = {
        ...orderData,
        date: firebase.firestore.Timestamp.fromDate(new Date()) // Store as Firestore Timestamp
    };
    batch.set(newOrderRef, newOrderPayload);

    // 2. Update stock for each product in the order
    orderData.items.forEach((item: CartItem) => {
        const productRef = db.collection('products').doc(item.product.id);
        const newStock = item.product.stock - item.quantity;
        batch.update(productRef, { stock: newStock });
    });

    // 3. Commit the batch
    await batch.commit();

    return { 
        ...orderData,
        id: newOrderRef.id,
        date: newOrderPayload.date.toDate() // Return with JS Date
    };
};

// --- Employee Functions ---
export const getEmployees = async (): Promise<Employee[]> => {
    const employeesCol = db.collection('employees');
    const employeeSnapshot = await employeesCol.get();
    return employeeSnapshot.docs.map(toEmployee);
};

export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    const employeesCol = db.collection('employees');
    const docRef = await employeesCol.add(employeeData);
    return { ...employeeData, id: docRef.id };
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee> => {
    const employeeDoc = db.collection('employees').doc(updatedEmployee.id);
    const { id, ...employeeData } = updatedEmployee;
    await employeeDoc.update(employeeData);
    return updatedEmployee;
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
    const employeeDoc = db.collection('employees').doc(employeeId);
    await employeeDoc.delete();
};

// --- Attendance Functions ---
export const getAttendance = async (): Promise<Attendance[]> => {
    const attendanceCol = db.collection('attendance');
    const attendanceSnapshot = await attendanceCol.get();
    const attendances = attendanceSnapshot.docs.map(toAttendance);
    return attendances.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const addAttendance = async (attendanceData: Omit<Attendance, 'id'>): Promise<Attendance> => {
    const attendanceCol = db.collection('attendance');
    const payload = {
        ...attendanceData,
        date: firebase.firestore.Timestamp.fromDate(attendanceData.date) // Store as Timestamp
    };
    const docRef = await attendanceCol.add(payload);
    return { ...attendanceData, id: docRef.id };
};
