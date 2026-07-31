import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';
import NegaraTable from '../../components/table/NegaraTable';
import ProvinsiTable from '../../components/table/ProvinsiTable';
import KabupatenTable from '../../components/table/KabupatenTable';
import KecamatanTable from '../../components/table/KecamatanTable';
import DaerahFormModal from '../../components/modal/DaerahFormModal';
import SearchBar from '../../components/common/SearchBar';
import axiosInstance from '../../api/axiosInstance';

function Daerah() {
  const [activeTab, setActiveTab] = useState('negara');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Data State
  const [negaraData, setNegaraData] = useState([]);
  const [provinsiData, setProvinsiData] = useState([]);
  const [kabupatenData, setKabupatenData] = useState([]);
  const [kecamatanData, setKecamatanData] = useState([]);

  // Search & Loading State
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'negara', label: 'Negara' },
    { id: 'provinsi', label: 'Provinsi' },
    { id: 'kabupaten', label: 'Kabupaten/Kota' },
    { id: 'kecamatan', label: 'Kecamatan' },
  ];

  // Fetch semua data saat mounting pertama kali (penting agar dropdown di modal terisi)
  useEffect(() => {
    fetchAll();
  }, []);

  // --- Logic Pencarian (Debounce) ---
  const debouncedFetch = useCallback(
    debounce((query, tab) => {
        // Fetch sesuai tab yang aktif saja agar hemat resource
        switch (tab) {
            case 'negara': fetchNegara(query); break;
            case 'provinsi': fetchProvinsi(query); break;
            case 'kabupaten': fetchKabupaten(query); break;
            case 'kecamatan': fetchKecamatan(query); break;
            default: break;
        }
    }, 500),
    []
  );

  // Effect memantau perubahan searchTerm dan activeTab
  useEffect(() => {
    setLoading(true);
    debouncedFetch(searchTerm, activeTab);
    
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchTerm, activeTab, debouncedFetch]);


  // --- Fungsi Fetch API (Updated with Search Param) ---

  const fetchNegara = async (searchQuery = '') => {
    try {
      let params = {};
      if (searchQuery) params.search = searchQuery;
      let response = await axiosInstance.get('/negara', { params });
      setNegaraData(response.data.datas || []);
    } catch (error) {
      console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const fetchProvinsi = async (searchQuery = '') => {
    try {
      let params = {};
      if (searchQuery) params.search = searchQuery;
      let response = await axiosInstance.get('/provinsi', { params });
      setProvinsiData(response.data.datas || []);
    } catch (error) {
      console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const fetchKabupaten = async (searchQuery = '') => {
    try {
      let params = {};
      if (searchQuery) params.search = searchQuery;
      let response = await axiosInstance.get('/kabupaten', { params });
      setKabupatenData(response.data.datas || []);
    } catch (error) {
      console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const fetchKecamatan = async (searchQuery = '') => {
    try {
      let params = {};
      if (searchQuery) params.search = searchQuery;
      let response = await axiosInstance.get('/kecamatan', { params });
      setKecamatanData(response.data.datas || []);
    } catch (error) {
      console.error(error);
    } finally {
        setLoading(false);
    }
  };

  // Helper untuk fetch semua (dipakai saat mount & success modal)
  const fetchAll = () => {
    fetchNegara();
    fetchProvinsi();
    fetchKabupaten();
    fetchKecamatan();
  };

  // --- Handlers ---

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchTerm(''); // Reset search saat pindah tab
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

  const handleSuccess = () => {
      // Saat sukses (tambah/edit), kita refresh data
      // Jika ingin dropdown tetap update, panggil fetchAll
      // Atau panggil fetch spesifik + refresh dependencies jika perlu
      fetchAll(); 
      // Note: fetchAll akan me-reset list menjadi full data (tanpa search). 
      // Jika ingin mempertahankan search, logic-nya perlu disesuaikan, 
      // tapi untuk keamanan data dropdown, fetchAll lebih aman.
  };

  const handleDelete = (item) => {
    const itemName = item[`nama_${activeTab}`] || item.kode_negara;
    const itemId = item[`id_${activeTab}`];
    
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p>Apakah Anda yakin ingin menghapus <strong>{itemName}</strong>?</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const response = await axiosInstance.delete(`/${activeTab}/delete/${itemId}`);
                if (response.status === 200) {
                  toast.success('Data berhasil dihapus!');
                  // Refresh data tab yang sedang aktif dengan search term saat ini
                  debouncedFetch(searchTerm, activeTab);
                  // Kita juga bisa memanggil fetchAll() di background untuk update dropdown dependency
                }
              } catch (error) {
                toast.error('Gagal menghapus data.');
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

  const renderContent = () => {
    if (loading) {
        return <p className="text-center text-gray-500 py-10">Memuat data...</p>;
    }

    switch (activeTab) {
      case 'negara': 
        return <NegaraTable data={negaraData} onEdit={handleEdit} onDelete={handleDelete} />;
      case 'provinsi': 
        return <ProvinsiTable data={provinsiData} onEdit={handleEdit} onDelete={handleDelete} negaraList={negaraData} />;
      case 'kabupaten': 
        return <KabupatenTable data={kabupatenData} onEdit={handleEdit} onDelete={handleDelete} provinsiList={provinsiData} />;
      case 'kecamatan': 
        return <KecamatanTable data={kecamatanData} onEdit={handleEdit} onDelete={handleDelete} kabupatenList={kabupatenData} />;
      default: 
        return null;
    }
  };

  const getSearchPlaceholder = () => {
      switch(activeTab) {
          case 'negara': return "Cari negara...";
          case 'provinsi': return "Cari provinsi...";
          case 'kabupaten': return "Cari kabupaten/kota...";
          case 'kecamatan': return "Cari kecamatan...";
          default: return "Cari...";
      }
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Data Daerah</h1>
          <button 
            onClick={handleOpenModal} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            + Tambah Data
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex gap-x-6 px-4 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Search Bar Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="w-full md:w-1/3">
                <SearchBar 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm} 
                    placeholder={getSearchPlaceholder()}
                />
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {renderContent()}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <DaerahFormModal 
          activeTab={activeTab} 
          onClose={handleCloseModal} 
          currentItem={editingItem}
          allNegara={negaraData}
          allProvinsi={provinsiData}
          allKabupaten={kabupatenData}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

export default Daerah;