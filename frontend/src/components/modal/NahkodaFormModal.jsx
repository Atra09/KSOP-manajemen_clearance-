import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Label from '../form/Label';
import InputField from '../form/InputField';
import Button from '../ui/Button';
import axiosInstance from '../../api/axiosInstance';

const NahkodaFormModal = ({ onClose, currentItem, onSuccess }) => {
  const [formData, setFormData] = useState({ nama_nahkoda: '' });
  const isEditMode = Boolean(currentItem);

  useEffect(() => {
    if (isEditMode && currentItem) {
      setFormData({ nama_nahkoda: currentItem.nama_nahkoda });
    } else {
      setFormData({ nama_nahkoda: '' });
    }
  }, [currentItem, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = isEditMode
        ? await axiosInstance.patch(`/nahkoda/update/${currentItem.id_nahkoda}`, formData)
        : await axiosInstance.post('/nahkoda/store', formData);

      if (response.status === 200) {
        toast.success(`Data Nahkoda Berhasil ${isEditMode ? 'Diperbarui' : 'Disimpan'}!`);
        onSuccess();
        onClose();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat menyimpan data.";
      console.error("Error:", errorMessage);
      toast.error(errorMessage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4">
        <form onSubmit={handleSubmit}>
          <div className="p-5 border-b">
            <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Data Nahkoda' : 'Tambah Data Nahkoda'}</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <Label htmlFor="nama">Nama Nahkoda</Label>
              <InputField name="nama_nahkoda" id="nama" value={formData.nama_nahkoda} onChange={handleChange} placeholder="Contoh: Capt. Budi Santoso" required />
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

export default NahkodaFormModal;