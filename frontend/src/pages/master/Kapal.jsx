import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';
import KapalTable from '../../components/table/KapalTable';
import JenisKapalTable from '../../components/table/JenisKapalTable';
import KapalFormModal from '../../components/modal/KapalFormModal';
import SearchBar from '../../components/common/SearchBar';
import axiosInstance from '../../api/axiosInstance';

function Kapal() {
  const [activeTab, setActiveTab] = useState('kapal');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [kapalData, setKapalData] = useState([]);
  const [jenisKapalData, setJenisKapalData] = useState([]);
  const [negaraData, setNegaraData] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'kapal', label: 'Daftar Kapal' },
    { id: 'jenisKapal', label: 'Jenis Kapal' },
  ];

  useEffect(() => {
    fetchBendera();
    fetchKapal(); 
    fetchJenisKapal(); 
  }, []);

  const debouncedFetch = useCallback(
    debounce((query, tab) => {
      if (tab === 'kapal') {
        fetchKapal(query);
      } else if (tab === 'jenisKapal') {
        fetchJenisKapal(query);
      }
    }, 500),
    []
  );
  useEffect(() => {
    debouncedFetch(searchTerm, activeTab);
    
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchTerm, activeTab, debouncedFetch]);

  const fetchBendera = async () => {
    try {
      let response = await axiosInstance.get('/negara');
      setNegaraData(response?.data?.datas || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchKapal = async (searchQuery = '') => {
    setLoading(true);
    try {
      let params = {};
      if (searchQuery) params.search = searchQuery;
      
      let response = await axiosInstance.get('/kapal', { params });
      setKapalData(response?.data?.datas || []);
    } catch (error) {
      toast.error("Gagal memuat data kapal.");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchJenisKapal = async (searchQuery = '') => {
    setLoading(true);
    try {
      let params = {};
      if (searchQuery) params.search = searchQuery;

      let response = await axiosInstance.get('/jenis', { params });
      setJenisKapalData(response?.data?.datas || []);
    } catch (error) {
      toast.error("Gagal memuat jenis kapal.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    if (activeTab === 'kapal') {
        fetchKapal(searchTerm);
        fetchJenisKapal(); 
    } else {
        fetchJenisKapal(searchTerm);
        fetchKapal(); 
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
    const isKapalTab = activeTab === 'kapal';
    const itemName = isKapalTab ? item.nama_kapal : item.nama_jenis;
    const itemId = isKapalTab ? item.id_kapal : item.id_jenis;
    const endpoint = isKapalTab ? 'kapal' : 'jenis';

    toast((t) => (
      <div className="flex flex-col gap-3">
        <p>Apakah Anda yakin ingin menghapus <strong>{itemName}</strong>?</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              try {
                const response = await axiosInstance.delete(`/${endpoint}/delete/${itemId}`);
                if (response.status === 200) {
                  toast.success('Data berhasil dihapus!');
                  if (isKapalTab) fetchKapal(searchTerm);
                  else fetchJenisKapal(searchTerm);
                }
              } catch (error) {
                toast.error('Gagal menghapus data.');
              } finally {
                toast.dismiss(t.id);
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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchTerm('');
  };

  const renderContent = () => {
    if (loading) {
        return <p className="text-center text-gray-500 py-10">Memuat data...</p>;
    }

    switch (activeTab) {
      case 'kapal':
        return <KapalTable data={kapalData} onEdit={handleEdit} onDelete={handleDelete} jenisList={jenisKapalData} benderaList={negaraData} />;
      case 'jenisKapal':
        return <JenisKapalTable data={jenisKapalData} onEdit={handleEdit} onDelete={handleDelete} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Data Kapal</h1>
          <button 
            onClick={handleOpenModal} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            + Tambah Data
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex gap-x-6 px-4" aria-label="Tabs">
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

          <div className="p-4 border-b border-gray-200">
            <div className="w-full md:w-1/3">
                <SearchBar 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm} 
                    placeholder={activeTab === 'kapal' ? "Cari nama kapal..." : "Cari jenis kapal..."}
                />
            </div>
          </div>

          <div className="p-4">
            {renderContent()}
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <KapalFormModal
          activeTab={activeTab}
          onClose={handleCloseModal}
          currentItem={editingItem}
          jenisKapalOptions={jenisKapalData}
          negaraOptions={negaraData}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

export default Kapal;