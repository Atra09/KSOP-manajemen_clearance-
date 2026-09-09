import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import SearchBar from '../../components/common/SearchBar';
import SpbAsalTable from '../../components/table/SpbAsalTable';
import SpbAsalModal from '../../components/modal/SpbAsalModal';

const SpbAsal = () => {
    const [spbAsalList, setSpbAsalList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchSpbAsalList = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/spb-asal');
            setSpbAsalList(res.data?.datas || []);
        } catch (error) {
            console.error("Fetch SPB Asal error:", error);
            toast.error("Gagal memuat data SPB Asal.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpbAsalList();
    }, []);

    const handleOpenAddModal = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = (item) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-800">
                    Apakah Anda yakin ingin menghapus SPB Asal <strong>{item.kode_spb} ({item.asal})</strong>?
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await axiosInstance.delete(`/spb-asal/delete/${item.id_spb_asal}`);
                                toast.success(`SPB Asal ${item.kode_spb} berhasil dihapus!`);
                                fetchSpbAsalList();
                            } catch (error) {
                                const msg = error.response?.data?.msg || 'Gagal menghapus SPB Asal.';
                                toast.error(msg);
                            }
                        }}
                        className="w-full px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                        Ya, Hapus
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        Batal
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    };

    const filteredList = spbAsalList.filter(item =>
        (item.kode_spb || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.asal || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Master Data SPB Asal</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Kelola daftar kode penomoran SPB dan daerah/pelabuhan asal pengeluaran surat persetujuan berlayar.
                    </p>
                </div>
                <div>
                    <button
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah SPB Asal
                    </button>
                </div>
            </div>

            {/* Main Content Box */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <SearchBar 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari kode SPB atau asal..."
                    />
                </div>

                {loading ? (
                    <p className="text-center text-gray-500 p-8">Memuat data SPB Asal...</p>
                ) : (
                    <SpbAsalTable
                        data={filteredList}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {/* Modal Add / Edit */}
            <SpbAsalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchSpbAsalList}
                initialData={selectedItem}
            />
        </div>
    );
};

export default SpbAsal;
