import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';
import AgenTable from '../../components/table/AgenTable';
import AgenFormModal from '../../components/modal/AgenFormModal';
import SearchBar from '../../components/common/SearchBar';
import axiosInstance from '../../api/axiosInstance';

function Agen() {
  const [agenData, setAgenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAgen = useCallback(async (searchQuery = '') => {
    setLoading(true);
    try {
      let params = {};
      if (searchQuery) {
        params.search = searchQuery;
      }

      let response = await axiosInstance.get('/agen', { params });
      setAgenData(response?.data?.datas || []);
    } catch (error) {
      toast.error("Gagal memuat data agen.");
      setAgenData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(
    debounce((query) => {
      fetchAgen(query);
    }, 500),
    [fetchAgen]
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
      fetchAgen(searchTerm);
  };
   
  const handleDelete = (item) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p>Apakah Anda yakin ingin menghapus <strong>{item.nama_agen}</strong>?</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              try {
                const response = await axiosInstance.delete(`/agen/delete/${item.id_agen}`);
                if (response.status === 200) {
                  toast.success('Data berhasil dihapus!');
                  fetchAgen(searchTerm);
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

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Data Agen</h1>
          <button 
            onClick={handleOpenModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            + Tambah Data
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            
            <div className="p-4 border-b border-gray-200">
                <div className="w-full md:w-1/3">
                    <SearchBar 
                        searchTerm={searchTerm} 
                        setSearchTerm={setSearchTerm} 
                        placeholder="Cari nama agen..." 
                    />
                </div>
            </div>

            {loading ? (
              <p className="text-center text-gray-500 py-10">Memuat data...</p>
            ) : (
              <AgenTable agenItems={agenData} onEdit={handleEdit} onDelete={handleDelete} />
            )}
        </div>
      </div>

      {isModalOpen && (
        <AgenFormModal 
            onClose={handleCloseModal} 
            currentItem={editingItem} 
            onSuccess={handleSuccess} 
        />
      )}
    </>
  );
}

export default Agen;