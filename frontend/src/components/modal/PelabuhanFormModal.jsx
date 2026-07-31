import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Label from '../form/Label';
import InputField from '../form/InputField';
import Button from '../ui/Button';
import axiosInstance from '../../api/axiosInstance'; 

const PelabuhanFormModal = ({ onClose, currentItem, onSuccess }) => {
  const [formData, setFormData] = useState({ nama_pelabuhan: '' });
  const isEditMode = Boolean(currentItem);

  useEffect(() => {
    if (isEditMode && currentItem) {
      setFormData({ nama_pelabuhan: currentItem.nama_pelabuhan });
    } else {
      setFormData({ nama_pelabuhan: '' });
    }
  }, [currentItem, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = isEditMode ? 'patch' : 'post';
      // Pastikan backend Anda memiliki ID (misal: id_pelabuhan)
      const url = isEditMode
        ? `/pelabuhan/update/${currentItem.id_pelabuhan}` 
        : '/pelabuhan/store';
      
      const response = await axiosInstance({ method, url, data: formData });

      if (response.status === 200) {
        toast.success(`Data Pelabuhan Berhasil ${isEditMode ? 'Diperbarui' : 'Disimpan'}!`);
        onSuccess();
        onClose();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat menyimpan data.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4">
        <form onSubmit={handleSubmit}>
          <div className="p-5 border-b">
            <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Data Pelabuhan' : 'Tambah Data Pelabuhan'}</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <Label htmlFor="nama_pelabuhan">Nama Pelabuhan</Label>
              <InputField 
                name="nama_pelabuhan" 
                id="nama_pelabuhan" 
                value={formData.nama_pelabuhan} 
                onChange={handleChange} 
                placeholder="Contoh: Pelabuhan Kalianget" 
                required 
              />
            </div>
          </div>
          <div className="p-5 border-t flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
            <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
            <Button type="submit">{isEditMode ? 'Simpan Perubahan' : 'Simpan'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PelabuhanFormModal;