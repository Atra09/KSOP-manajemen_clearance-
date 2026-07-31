import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import Label from '../form/Label';
import InputField from '../form/InputField';
import Select from '../form/Select';
import Button from '../ui/Button';
import axiosInstance from '../../api/axiosInstance';

const DaerahFormModal = ({ activeTab, onClose, currentItem, allNegara = [], allProvinsi = [], allKabupaten = [], onSuccess }) => {
  const [formData, setFormData] = useState({});
  const isEditMode = Boolean(currentItem);

  useEffect(() => {
    const getInitialData = () => {
      if (isEditMode && currentItem) {
        switch (activeTab) {
          case 'negara': return { kode_negara: currentItem.kode_negara || '', nama_negara: currentItem.nama_negara || '' };
          case 'provinsi': return { id_negara: currentItem.id_negara || '', nama_provinsi: currentItem.nama_provinsi || '' };
          case 'kabupaten': return { id_provinsi: currentItem.id_provinsi || '', nama_kabupaten: currentItem.nama_kabupaten || '' };
          case 'kecamatan': return { id_kabupaten: currentItem.id_kabupaten || '', nama_kecamatan: currentItem.nama_kecamatan || '' };
          default: return {};
        }
      } else {
        switch (activeTab) {
          case 'negara': return { kode_negara: '', nama_negara: '' };
          case 'provinsi': return { id_negara: '', nama_provinsi: '' };
          case 'kabupaten': return { id_provinsi: '', nama_kabupaten: '' };
          case 'kecamatan': return { id_kabupaten: '', nama_kecamatan: '' };
          default: return {};
        }
      }
    };
    setFormData(getInitialData());
  }, [activeTab, currentItem, isEditMode]);

  const parentOptions = useMemo(() => {
    switch (activeTab) {
      case 'provinsi': return [{ value: '', label: 'Pilih Negara', disabled: true }, ...allNegara.map(n => ({ value: n.id_negara, label: n.nama_negara }))];
      case 'kabupaten': return [{ value: '', label: 'Pilih Provinsi', disabled: true }, ...allProvinsi.map(p => ({ value: p.id_provinsi, label: p.nama_provinsi }))];
      case 'kecamatan': return [{ value: '', label: 'Pilih Kabupaten/Kota', disabled: true }, ...allKabupaten.map(k => ({ value: k.id_kabupaten, label: k.nama_kabupaten }))];
      default: return [];
    }
  }, [activeTab, allNegara, allProvinsi, allKabupaten]);

  const getTitle = () => {
    const action = isEditMode ? 'Edit' : 'Tambah';
    switch (activeTab) {
      case 'negara': return `${action} Data Negara`;
      case 'provinsi': return `${action} Data Provinsi`;
      case 'kabupaten': return `${action} Data Kabupaten/Kota`;
      case 'kecamatan': return `${action} Data Kecamatan`;
      default: return `${action} Data`;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const url = isEditMode
            ? `/${activeTab}/update/${currentItem[`id_${activeTab}`]}`
            : `/${activeTab}/store`;
        
        const method = isEditMode ? 'patch' : 'post';

        const response = await axiosInstance({
            method: method,
            url: url,
            data: formData,
        });
        
        if (response.status === 200) {
            toast.success(`Data ${activeTab} berhasil ${isEditMode ? 'diperbarui' : 'disimpan'}!`);
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
  
  const renderFormContent = () => {
    switch(activeTab) {
      case 'negara':
        return <>
          <div><Label htmlFor="kode_negara">Kode Negara</Label><InputField name="kode_negara" id="kode_negara" value={formData.kode_negara || ''} onChange={handleChange} placeholder="Contoh: RI" required /></div>
          <div><Label htmlFor="nama_negara">Nama Negara</Label><InputField name="nama_negara" id="nama_negara" value={formData.nama_negara || ''} onChange={handleChange} required /></div>
        </>;
      case 'provinsi':
        return <>
          <div><Label htmlFor="id_negara">Negara</Label><Select name="id_negara" id="id_negara" value={formData.id_negara || ''} onChange={handleChange} options={parentOptions} required /></div>
          <div><Label htmlFor="nama_provinsi">Nama Provinsi</Label><InputField name="nama_provinsi" id="nama_provinsi" value={formData.nama_provinsi || ''} onChange={handleChange} required /></div>
        </>;
      case 'kabupaten':
        return <>
          <div><Label htmlFor="id_provinsi">Provinsi</Label><Select name="id_provinsi" id="id_provinsi" value={formData.id_provinsi || ''} onChange={handleChange} options={parentOptions} required /></div>
          <div><Label htmlFor="nama_kabupaten">Nama Kabupaten/Kota</Label><InputField name="nama_kabupaten" id="nama_kabupaten" value={formData.nama_kabupaten || ''} onChange={handleChange} required /></div>
        </>;
      case 'kecamatan':
        return <>
          <div><Label htmlFor="id_kabupaten">Kabupaten/Kota</Label><Select name="id_kabupaten" id="id_kabupaten" value={formData.id_kabupaten || ''} onChange={handleChange} options={parentOptions} required /></div>
          <div><Label htmlFor="nama_kecamatan">Nama Kecamatan</Label><InputField name="nama_kecamatan" id="nama_kecamatan" value={formData.nama_kecamatan || ''} onChange={handleChange} required /></div>
        </>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4">
        <form onSubmit={handleSubmit}>
          <div className="p-5 border-b"><h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2></div>
          <div className="p-5 space-y-4">{renderFormContent()}</div>
          <div className="p-5 border-t flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
            <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
            <Button type="submit">{isEditMode ? 'Simpan Perubahan' : 'Simpan'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DaerahFormModal;