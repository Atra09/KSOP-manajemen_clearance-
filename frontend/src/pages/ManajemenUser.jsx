import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';
import UserTable from '../components/table/UserTable';
import UserFormModal from '../components/modal/UserFormModal';
import SearchBar from '../components/common/SearchBar';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

function ManajemenUser() {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { user } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = useCallback(async (searchQuery = '') => {
        setLoading(true);
        try {
            let params = {};
            if (searchQuery) {
                params.search = searchQuery;
            }

            let response = await axiosInstance.get('/users', { params });
            setUserData(response.data.datas || []);
        } catch (error) {
            toast.error("Gagal memuat data pengguna.");
            console.error("Fetch Users Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const debouncedFetch = useCallback(
        debounce((query) => {
            fetchUsers(query);
        }, 500),
        [fetchUsers]
    );

    useEffect(() => {
        debouncedFetch(searchTerm);
        return () => {
            debouncedFetch.cancel();
        };
    }, [searchTerm, debouncedFetch]);

    const handleOpenModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSuccess = () => {
        fetchUsers(searchTerm);
    };

    const handleDelete = (item) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p>Apakah Anda yakin ingin menghapus pengguna <strong>{item.nama_lengkap}</strong>?</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await axiosInstance.delete(`/users/delete/${item.id_user}`);
                                toast.success(`Pengguna "${item.nama_lengkap}" berhasil dihapus.`);
                                fetchUsers(searchTerm); 
                            } catch (error) {
                                toast.error("Gagal menghapus data.");
                                console.error("Delete User Error:", error);
                            }
                        }}
                        className="w-full px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        Ya, Hapus
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                        Batal
                    </button>
                </div>
            </div>
        ));
    };

    return (
        <>
            <div className="p-4 md:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
                    <div className="flex items-center gap-3">
                        <button onClick={handleOpenModal} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                            + Tambah Pengguna
                        </button>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                        <div className="w-full md:w-1/3">
                            <SearchBar 
                                searchTerm={searchTerm} 
                                setSearchTerm={setSearchTerm} 
                                placeholder="Cari pengguna, role, atau wilayah..." 
                            />
                        </div>
                    </div>

                    <div className="p-0">
                        {loading ? (
                            <p className="text-center text-gray-500 py-10">Memuat data...</p>
                        ) : (
                            <UserTable userItems={userData} onEdit={handleEdit} onDelete={handleDelete} />
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <UserFormModal 
                    onClose={handleCloseModal} 
                    currentItem={editingItem} 
                    onSuccess={handleSuccess} 
                    currentUserRole={user?.role || ''}
                />
            )}
        </>
    );
}

export default ManajemenUser;