

import React, { useState, useEffect, useCallback } from 'react';
import { Employee, Attendance } from '../types';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee, getAttendance, addAttendance } from '../services/firestoreService';
import toast from 'react-hot-toast';
import { PlusIcon } from '../components/icons';


const EmployeeFormModal = ({ isOpen, onClose, onSave, employee }) => {
    const [formData, setFormData] = useState(employee || { name: '', position: '', baseSalary: 0 });

    useEffect(() => {
        setFormData(employee || { name: '', position: '', baseSalary: 0 });
    }, [employee]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{employee ? 'Ubah Data Karyawan' : 'Tambah Karyawan Baru'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nama Lengkap" className="p-2 border rounded" required />
                        <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="Posisi Jabatan" className="p-2 border rounded" required />
                        <input type="number" name="baseSalary" value={formData.baseSalary} onChange={handleChange} placeholder="Gaji Pokok" className="p-2 border rounded" required />
                    </div>
                    <div className="flex justify-end mt-6 space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminEmployeesPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [empData, attData] = await Promise.all([getEmployees(), getAttendance()]);
            setEmployees(empData);
            setAttendance(attData);
        } catch (error: any) {
            if (error.message && error.message.toLowerCase().includes('permission')) {
                toast.error('Gagal memuat data: Periksa aturan keamanan Firestore Anda.', { duration: 6000 });
            } else {
                toast.error('Gagal memuat data.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveEmployee = async (employeeData) => {
        const promise = employeeData.id ? updateEmployee(employeeData) : addEmployee(employeeData);
        toast.promise(promise, {
            loading: 'Menyimpan...', success: 'Data karyawan disimpan!', error: 'Gagal menyimpan data.',
        });
        await promise;
        fetchData();
        setIsModalOpen(false);
    };

    const handleDeleteEmployee = async (employeeId: string) => {
        if (window.confirm('Hapus karyawan ini?')) {
            await toast.promise(deleteEmployee(employeeId), {
                loading: 'Menghapus...', success: 'Karyawan dihapus!', error: 'Gagal menghapus.',
            });
            fetchData();
        }
    };
    
    const handleAddAttendance = async (employee: Employee, status: 'Hadir' | 'Sakit' | 'Izin') => {
        const today = new Date().setHours(0,0,0,0);
        const hasAttendedToday = attendance.some(a => a.employeeId === employee.id && a.date.setHours(0,0,0,0) === today);

        if (hasAttendedToday) {
            toast.error(`${employee.name} sudah absen hari ini.`);
            return;
        }

        const newAttendance = { employeeId: employee.id, employeeName: employee.name, date: new Date(), status };
        await toast.promise(addAttendance(newAttendance), {
            loading: 'Mencatat...', success: `Absensi ${employee.name} dicatat!`, error: 'Gagal mencatat.',
        });
        fetchData();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manajemen Karyawan</h1>
                <button onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition">
                    <PlusIcon /> Tambah Karyawan
                </button>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-x-auto mb-8">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nama</th>
                            <th scope="col" className="px-6 py-3">Posisi</th>
                            <th scope="col" className="px-6 py-3">Gaji Pokok</th>
                            <th scope="col" className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={4} className="text-center py-4">Memuat...</td></tr> : 
                        employees.map(emp => (
                            <tr key={emp.id} className="bg-white border-b">
                                <td className="px-6 py-4 font-medium">{emp.name}</td>
                                <td className="px-6 py-4">{emp.position}</td>
                                <td className="px-6 py-4">Rp {emp.baseSalary.toLocaleString('id-ID')}</td>
                                <td className="px-6 py-4 space-x-2">
                                    <button onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }} className="font-medium text-blue-600 hover:underline">Ubah</button>
                                    <button onClick={() => handleDeleteEmployee(emp.id)} className="font-medium text-red-600 hover:underline">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Pencatatan Absensi Hari Ini</h2>
            <div className="bg-white shadow-md rounded-lg p-4">
                {employees.map(emp => {
                    const today = new Date().setHours(0,0,0,0);
                    const attendanceRecord = attendance.find(a => a.employeeId === emp.id && a.date.setHours(0,0,0,0) === today);
                    return (
                        <div key={emp.id} className="flex justify-between items-center p-3 border-b last:border-b-0">
                            <span className="font-medium">{emp.name}</span>
                            {attendanceRecord ? (
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                    attendanceRecord.status === 'Hadir' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                                }`}>{attendanceRecord.status}</span>
                            ) : (
                                <div className="space-x-2">
                                    <button onClick={() => handleAddAttendance(emp, 'Hadir')} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">Hadir</button>
                                    <button onClick={() => handleAddAttendance(emp, 'Sakit')} className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600">Sakit</button>
                                    <button onClick={() => handleAddAttendance(emp, 'Izin')} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Izin</button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <EmployeeFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEmployee} employee={editingEmployee} />
        </div>
    );
};

export default AdminEmployeesPage;