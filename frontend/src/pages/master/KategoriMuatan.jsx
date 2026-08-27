import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';
import MuatanTable from '../../components/table/MuatanTable';
import JenisMuatanTable from '../../components/table/JenisMuatanTable';
import SatuanMuatanTable from '../../components/table/SatuanMuatanTable';
import KlasifikasiMuatanTable from '../../components/table/KlasifikasiMuatanTable';
import MuatanFormModal from '../../components/modal/MuatanFormModal';
import SearchBar from '../../components/common/SearchBar';
import axiosInstance from '../../api/axiosInstance';

function KategoriMuatan() {
    const [kategoriMuatanData, setKategoriMuatanData] = useState([]);
    const [jenisMuatanData, setJenisMuatanData] = useState([]);
    const [satuanMuatanData, setSatuanMuatanData] = useState([]);
    const [klasifikasiMuatanData, setKlasifikasiMuatanData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [activeTab, setActiveTab] = useState('kategori');
    
    const [searchTerm, setSearchTerm] = useState('');

    const tabs = [
        { id: 'kategori', label: 'Kategori Muatan' },
        { id: 'jenisMuatan', label: 'Jenis Muatan' },
        { id: 'satuanMuatan', label: 'Satuan Muatan' },
        { id: 'klasifikasiMuatan', label: 'Klasifikasi Muatan' },
    ];

    const debouncedFetch = useCallback(
        debounce((query, tab) => {
            if (tab === 'kategori') {
                fetchKategoriMuatan(query);
                if (jenisMuatanData.length === 0) fetchJenisMuatan(); 
                if (satuanMuatanData.length === 0) fetchSatuanMuatan();
                if (klasifikasiMuatanData.length === 0) fetchKlasifikasiMuatan();
            } else if (tab === 'jenisMuatan') {
                fetchJenisMuatan(query);
            } else if (tab === 'satuanMuatan') {
                fetchSatuanMuatan(query);
            } else if (tab === 'klasifikasiMuatan') {
                fetchKlasifikasiMuatan(query);
            }
        }, 500),
        []
    );

    useEffect(() => {
        setLoading(true);
        debouncedFetch(searchTerm, activeTab);

        return () => {
            debouncedFetch.cancel();
        };
    }, [searchTerm, activeTab, debouncedFetch]);

    const fetchKategoriMuatan = async (searchQuery = '') => {
        try {
            let params = {};
            if (searchQuery) params.search = searchQuery;

            let response = await axiosInstance.get('/kategori-muatan', { params });
            setKategoriMuatanData(response.data.datas || []);
        } catch (error) {
            toast.error("Gagal memuat data Kategori Muatan.");
            console.error("Fetch Kategori Muatan Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchJenisMuatan = async (searchQuery = '') => {
        try {
            let params = {};
            if (searchQuery) params.search = searchQuery;

            let response = await axiosInstance.get('/jenis-muatan', { params });
            setJenisMuatanData(response.data.datas || []);
        } catch (error) {
            toast.error("Gagal memuat data Jenis Muatan.");
            console.error("Fetch Jenis Muatan Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSatuanMuatan = async (searchQuery = '') => {
        try {
            let params = {};
            if (searchQuery) params.search = searchQuery;

            let response = await axiosInstance.get('/satuan-muatan', { params });
            setSatuanMuatanData(response.data.datas || []);
        } catch (error) {
            toast.error("Gagal memuat data Satuan Muatan.");
            console.error("Fetch Satuan Muatan Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchKlasifikasiMuatan = async (searchQuery = '') => {
        try {
            let params = {};
            if (searchQuery) params.search = searchQuery;

            let response = await axiosInstance.get('/klasifikasi-muatan', { params });
            setKlasifikasiMuatanData(response.data.datas || []);
        } catch (error) {
            toast.error("Gagal memuat data Klasifikasi Muatan.");
            console.error("Fetch Klasifikasi Muatan Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSearchTerm('');
    };

    const handleSuccess = () => {
        if (activeTab === 'kategori') {
            fetchKategoriMuatan(searchTerm);
            fetchJenisMuatan();
            fetchSatuanMuatan();
            fetchKlasifikasiMuatan();
        } else if (activeTab === 'jenisMuatan') {
            fetchJenisMuatan(searchTerm);
        } else if (activeTab === 'satuanMuatan') {
            fetchSatuanMuatan(searchTerm);
        } else if (activeTab === 'klasifikasiMuatan') {
            fetchKlasifikasiMuatan(searchTerm);
        }
    };

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

    const handleDelete = (item) => {
        let itemName = item.nama_kategori_muatan;
        let itemId = item.id_kategori_muatan;
        let endpoint = 'kategori-muatan';

        if (activeTab === 'jenisMuatan') {
            itemName = item.nama_jenis_muatan;
            itemId = item.id_jenis_muatan;
            endpoint = 'jenis-muatan';
        } else if (activeTab === 'satuanMuatan') {
            itemName = item.nama_satuan_muatan;
            itemId = item.id_satuan_muatan;
            endpoint = 'satuan-muatan';
        } else if (activeTab === 'klasifikasiMuatan') {
            itemName = item.nama_klasifikasi_muatan;
            itemId = item.id_klasifikasi_muatan;
            endpoint = 'klasifikasi-muatan';
        }

        toast((t) => (
            <div className="flex flex-col gap-3">
                <p>Apakah Anda yakin ingin menghapus <strong>{itemName}</strong>?</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const response = await axiosInstance.delete(`/${endpoint}/delete/${itemId}`);
                                if (response.status === 200) {
                                    toast.success('Data berhasil dihapus!');
                                    if (activeTab === 'kategori') fetchKategoriMuatan(searchTerm);
                                    else if (activeTab === 'jenisMuatan') fetchJenisMuatan(searchTerm);
                                    else if (activeTab === 'satuanMuatan') fetchSatuanMuatan(searchTerm);
                                    else fetchKlasifikasiMuatan(searchTerm);
                                }
                            } catch (error) {
                                toast.error('Gagal menghapus data.');
                                console.error("Delete error:", error);
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

    const getHeaderTitle = () => {
        if (activeTab === 'kategori') return 'Data Kategori Muatan';
        if (activeTab === 'jenisMuatan') return 'Data Jenis Muatan';
        if (activeTab === 'satuanMuatan') return 'Data Satuan Muatan';
        if (activeTab === 'klasifikasiMuatan') return 'Data Klasifikasi Muatan';
        return 'Data Muatan';
    };

    const renderContent = () => {
        if (loading) {
            return <p className="text-center text-gray-500 py-10">Memuat data...</p>;
        }
        switch (activeTab) {
            case 'kategori':
                return <MuatanTable
                            muatanItems={kategoriMuatanData}
                            jenisList={jenisMuatanData}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />;
            case 'jenisMuatan':
                return <JenisMuatanTable
                            data={jenisMuatanData}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />;
            case 'satuanMuatan':
                return <SatuanMuatanTable
                            data={satuanMuatanData}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />;
            case 'klasifikasiMuatan':
                return <KlasifikasiMuatanTable
                            data={klasifikasiMuatanData}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="p-4 md:p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {getHeaderTitle()}
                    </h1>
                    <button
                        onClick={handleOpenModal}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors whitespace-nowrap"
                    >
                        + Tambah Data
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="border-b border-gray-200 dark:border-gray-800">
                        <nav className="-mb-px flex gap-x-6 px-4" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-700'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="w-full md:w-1/3">
                            <SearchBar 
                                searchTerm={searchTerm} 
                                setSearchTerm={setSearchTerm} 
                                placeholder={
                                    activeTab === 'kategori' ? "Cari kategori muatan..." :
                                    activeTab === 'jenisMuatan' ? "Cari jenis muatan..." :
                                    activeTab === 'satuanMuatan' ? "Cari satuan muatan..." :
                                    "Cari klasifikasi muatan..."
                                }
                            />
                        </div>
                    </div>

                    <div className="p-4">
                        {renderContent()}
                    </div>
                </div>
            </div>

            {isModalOpen &&
                <MuatanFormModal
                    activeTab={activeTab}
                    onClose={handleCloseModal}
                    currentItem={editingItem}
                    jenisMuatanOptions={jenisMuatanData}
                    satuanMuatanOptions={satuanMuatanData}
                    klasifikasiMuatanOptions={klasifikasiMuatanData}
                    onSuccess={handleSuccess}
                />
            }
        </>
    );
}

export default KategoriMuatan;