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
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nama Lengkap" className="p-2 border rounded-lg" required />
                        <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="Posisi Jabatan" className="p-2 border rounded-lg" required />
                        {/* Menggunakan step="any" agar bisa menerima angka desimal jika diperlukan, meskipun gaji biasanya integer */}
                        <input type="number" step="1000" name="baseSalary" value={formData.baseSalary} onChange={handleChange} placeholder="Gaji Pokok" className="p-2 border rounded-lg" required />
                    </div>
                    <div className="flex justify-end mt-6 space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Simpan</button>
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

    // Fungsi untuk mengambil data karyawan dan absensi
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Mengambil kedua data secara paralel
            const [empData, attData] = await Promise.all([getEmployees(), getAttendance()]);
            setEmployees(empData);
            setAttendance(attData);
        } catch (error) {
            toast.error('Gagal memuat data. Periksa koneksi Firebase Anda.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveEmployee = async (employeeData: Employee | Omit<Employee, 'id'>) => {
        const promise = (employeeData as Employee).id ? updateEmployee(employeeData as Employee) : addEmployee(employeeData);
        toast.promise(promise, {
            loading: 'Menyimpan...', success: 'Data karyawan disimpan!', error: 'Gagal menyimpan data.',
        });
        await promise;
        fetchData();
        setIsModalOpen(false);
    };

    // Fungsi DELETE yang sudah diperbaiki
    const handleDeleteEmployee = async (employeeId: string, employeeName: string) => { 
        
        // Ganti window.confirm dengan konfirmasi menggunakan toast
        const confirmed = await new Promise(resolve => {
            toast((t) => (
                <div className="p-4 bg-white rounded-lg shadow-xl">
                    <p className="text-base font-semibold text-gray-800 mb-3">Anda yakin ingin menghapus karyawan: {employeeName}?</p>
                    <div className="flex justify-end space-x-3">
                        <button 
                            onClick={() => { toast.dismiss(t.id); resolve(false); }} 
                            className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={() => { toast.dismiss(t.id); resolve(true); }} 
                            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Hapus Permanen
                        </button>
                    </div>
                </div>
            ), { duration: Infinity, style: { padding: '0', background: 'transparent' } });
        });

        if (confirmed) {
            try {
                // Gunakan toast.promise untuk menghandle loading dan error
                await toast.promise(deleteEmployee(employeeId), {
                    loading: 'Menghapus...',
                    success: 'Karyawan berhasil dihapus!',
                    error: (err) => {
                        console.error("FIREBASE DELETE ERROR:", err);
                        return `Gagal menghapus: ${err.message || 'Periksa aturan keamanan Firebase.'}`;
                    },
                });
                
                // Panggil fetchData HANYA JIKA penghapusan BERHASIL
                fetchData(); 
            } catch (error) {
                // Error sudah ditangani oleh toast.promise, tapi kita jaga console.error
                console.error("Kesalahan saat menghapus karyawan:", error);
            }
        }
    };
    
    const handleAddAttendance = async (employee: Employee, status: 'Hadir' | 'Sakit' | 'Izin') => {
        const today = new Date().setHours(0,0,0,0);
        // Memastikan perbandingan tanggal benar (mengubah Timestamp Firebase ke Date objek di firestoreService)
        const hasAttendedToday = attendance.some(a => a.employeeId === employee.id && a.date && a.date.setHours(0,0,0,0) === today);

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
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">Manajemen Karyawan & Absensi</h1>
                <button 
                    onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }} 
                    className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition transform hover:scale-[1.02]"
                >
                    <PlusIcon className="w-5 h-5" /> Tambah Karyawan
                </button>
            </div>
            
            <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b-2 border-indigo-600">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nama</th>
                                <th scope="col" className="px-6 py-3">Posisi</th>
                                <th scope="col" className="px-6 py-3">Gaji Pokok</th>
                                <th scope="col" className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? 
                                <tr><td colSpan={4} className="text-center py-6 text-indigo-500">Memuat data karyawan...</td></tr> 
                            : employees.length === 0 ?
                                <tr><td colSpan={4} className="text-center py-6 text-gray-500">Belum ada data karyawan.</td></tr>
                            : employees.map(emp => (
                                <tr key={emp.id} className="bg-white border-b hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{emp.name}</td>
                                    <td className="px-6 py-4">{emp.position}</td>
                                    {/* Format angka sebagai Rupiah */}
                                    <td className="px-6 py-4 font-mono">Rp {emp.baseSalary.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 space-x-3">
                                        <button 
                                            onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }} 
                                            className="font-medium text-blue-600 hover:text-blue-800 transition"
                                        >
                                            Ubah
                                        </button>
                                        {/* Memanggil handleDeleteEmployee dengan nama untuk konfirmasi yang lebih baik */}
                                        <button 
                                            onClick={() => handleDeleteEmployee(emp.id, emp.name)} 
                                            className="font-medium text-red-600 hover:text-red-800 transition"
                                        >
                                            Hapus
                                        </button> 
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Pencatatan Absensi Hari Ini</h2>
            <div className="bg-white shadow-xl rounded-xl p-6">
                {loading ? (
                    <p className="text-center text-indigo-500">Memuat daftar absensi...</p>
                ) : employees.length === 0 ? (
                    <p className="text-center text-gray-500">Tidak ada karyawan untuk dicatat absensinya.</p>
                ) : (
                    employees.map(emp => {
                        const today = new Date().setHours(0,0,0,0);
                        const attendanceRecord = attendance.find(a => a.employeeId === emp.id && a.date && a.date.setHours(0,0,0,0) === today);
                        
                        return (
                            <div key={emp.id} className="flex flex-col sm:flex-row justify-between items-center p-3 border-b last:border-b-0 hover:bg-indigo-50/50 transition duration-150">
                                <span className="font-semibold text-gray-800 w-full sm:w-1/3 mb-2 sm:mb-0">{emp.name}</span>
                                {attendanceRecord ? (
                                    <span className={`px-4 py-1 text-sm font-bold rounded-full shadow-sm ${
                                        attendanceRecord.status === 'Hadir' ? 'bg-green-100 text-green-700' : 
                                        attendanceRecord.status === 'Sakit' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {attendanceRecord.status} Dicatat Pukul: {attendanceRecord.date.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
                                    </span>
                                ) : (
                                    <div className="space-x-2 flex flex-wrap justify-end">
                                        <button onClick={() => handleAddAttendance(emp, 'Hadir')} className="px-4 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md">Hadir</button>
                                        <button onClick={() => handleAddAttendance(emp, 'Sakit')} className="px-4 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition shadow-md">Sakit</button>
                                        <button onClick={() => handleAddAttendance(emp, 'Izin')} className="px-4 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md">Izin</button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <EmployeeFormModal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingEmployee(null); // Reset editing state saat modal ditutup
                }} 
                onSave={handleSaveEmployee} 
                employee={editingEmployee} 
            />
        </div>
    );
};

export default AdminEmployeesPage;
