import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';
import axiosInstance from '../../api/axiosInstance';
import PelabuhanFormModal from '../../components/modal/PelabuhanFormModal';
import PelabuhanTable from '../../components/table/PelabuhanTable';
import SearchBar from '../../components/common/SearchBar';

function Pelabuhan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async (searchQuery = '') => {
    setLoading(true);
    try {
      let params = {};
      if (searchQuery) {
        params.search = searchQuery;
      }

      let response = await axiosInstance.get('/pelabuhan', { params });
      setData(response.data.datas || []);
    } catch (error) {
      toast.error("Gagal memuat data pelabuhan.");
      console.error("Fetch Data Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(
    debounce((query) => {
      fetchData(query);
    }, 500),
    [fetchData]
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
    fetchData(searchTerm);
  };

  const handleDelete = (item) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p>Apakah Anda yakin ingin menghapus <strong>{item.nama_pelabuhan}</strong>?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axiosInstance.delete(`/pelabuhan/delete/${item.id_pelabuhan}`);
                toast.success(`Data "${item.nama_pelabuhan}" berhasil dihapus.`);
                fetchData(searchTerm);
              } catch (error) {
                toast.error("Gagal menghapus data.");
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
          <h1 className="text-2xl font-bold text-gray-800">Data Master Pelabuhan</h1>
          <button 
            onClick={handleOpenModal} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            + Tambah Pelabuhan
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          
          <div className="p-4 border-b border-gray-200">
            <div className="w-full md:w-1/3">
                <SearchBar 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm} 
                    placeholder="Cari nama pelabuhan..." 
                />
            </div>
          </div>
          <div className="p-0">
            {loading ? (
              <p className="text-center py-10 text-gray-500">Memuat data...</p>
            ) : (
              <PelabuhanTable items={data} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <PelabuhanFormModal
          onClose={handleCloseModal}
          currentItem={editingItem}
          onSuccess={handleSuccess}
        />
      )}
      
    </>
  );
}

export default Pelabuhan;