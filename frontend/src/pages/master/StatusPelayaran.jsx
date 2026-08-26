import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import SearchBar from '../../components/common/SearchBar';
import StatusPelayaranModal from '../../components/modal/StatusPelayaranModal';

const colorStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800',
    teal: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    pink: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800',
    orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800',
    violet: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800',
    lime: 'bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-950/50 dark:text-lime-300 dark:border-lime-800',
    sky: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800',
    gray: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

const StatusPelayaran = () => {
    const [statusList, setStatusList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);

    const fetchStatusList = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/status-pelayaran');
            setStatusList(res.data?.datas || []);
        } catch (error) {
            console.error("Fetch status pelayaran error:", error);
            toast.error("Gagal memuat data status pelayaran.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatusList();
    }, []);

    const handleOpenAddModal = () => {
        setSelectedStatus(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setSelectedStatus(item);
        setIsModalOpen(true);
    };

    const handleDelete = (item) => {
        if (item.is_default) {
            toast.error(`Status bawaan '${item.kode_status}' tidak dapat dihapus.`);
            return;
        }

        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-800">
                    Apakah Anda yakin ingin menghapus status pelayaran <strong>{item.kode_status}</strong>?
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await axiosInstance.delete(`/status-pelayaran/delete/${item.id_status}`);
                                toast.success(`Status ${item.kode_status} berhasil dihapus!`);
                                fetchStatusList();
                            } catch (error) {
                                const msg = error.response?.data?.msg || 'Gagal menghapus status pelayaran.';
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

    const filteredCategories = statusList.filter(cat =>
        (cat.nama_status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.kode_status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.deskripsi || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Master Data Status Pelayaran</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Kelola dan atur kategori status keberangkatan kapal (Terbit, Batal, Rusak, dll.) pada sistem clearance.
                    </p>
                </div>
                <div>
                    <button
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Status Pelayaran
                    </button>
                </div>
            </div>

            {/* Main Content Box */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <SearchBar 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari kode atau nama status pelayaran..."
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3">NO</th>
                                <th className="px-4 py-3">KODE & BADGE</th>
                                <th className="px-4 py-3">NAMA STATUS</th>
                                <th className="px-4 py-3">DESKRIPSI & FUNGSI</th>
                                <th className="px-4 py-3 text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500 italic">
                                        Memuat data status pelayaran...
                                    </td>
                                </tr>
                            ) : filteredCategories.length > 0 ? (
                                filteredCategories.map((item, idx) => {
                                    const badgeClass = colorStyles[item.badge_color] || colorStyles.emerald;
                                    const STATUS_EMOJIS = {
                                        TERBIT: '✅',
                                        BATAL: '⚠️',
                                        RUSAK: '🛠️',
                                        BLUE: '🔵',
                                        PURPLE: '🟣'
                                    };
                                    const emoji = STATUS_EMOJIS[item.kode_status?.toUpperCase()] || '⚓';

                                    return (
                                        <tr key={item.id_status} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{idx + 1}</td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${badgeClass}`}>
                                                    <span>{emoji}</span>
                                                    <span>{item.kode_status}</span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white">
                                                {item.nama_status}
                                            </td>
                                            <td className="px-4 py-4 max-w-xs text-xs text-gray-600 dark:text-gray-400">
                                                {item.deskripsi || '-'}
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenEditModal(item)}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg dark:text-indigo-400 dark:hover:bg-indigo-950/40 transition-colors"
                                                        title="Edit Status"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                                                        title="Hapus Status"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500 italic">
                                        Tidak ada status pelayaran yang cocok.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Add / Edit */}
            <StatusPelayaranModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchStatusList}
                initialData={selectedStatus}
            />
        </div>
    );
};

export default StatusPelayaran;
