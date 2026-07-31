import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import Label from '../form/Label';
import InputField from '../form/InputField';
import Select from '../form/Select';
import Button from '../ui/Button';
import axiosInstance from '../../api/axiosInstance'; 

const KapalFormModal = ({ activeTab, onClose, currentItem, jenisKapalOptions = [], negaraOptions = [], onSuccess }) => {
  const [formData, setFormData] = useState({});
  const isEditMode = Boolean(currentItem);

  useEffect(() => {
    if (isEditMode && currentItem) {
      setFormData(currentItem);
    } else {
      if (activeTab === 'kapal') {
        setFormData({
          nama_kapal: '', id_jenis: '', id_bendera: '', gt: '', nt: '',
          nomor_selar: '', tanda_selar: '', nomor_imo: '', call_sign: ''
        });
      } else {
        setFormData({ nama_jenis: '' });
      }
    }
  }, [activeTab, currentItem, isEditMode]);
  
  const formattedJenisKapalOptions = useMemo(() => {
    return [
      { value: '', label: 'Pilih Jenis Kapal', disabled: true },
      ...jenisKapalOptions.map(item => ({ value: item.id_jenis, label: item.nama_jenis }))
    ];
  }, [jenisKapalOptions]);
  
  const formattedBenderaOptions = useMemo(() => {
    return [
      { value: '', label: 'Pilih Bendera Negara', disabled: true },
      ...negaraOptions.map(item => ({ value: item.id_negara, label: item.kode_negara }))
    ];
  }, [negaraOptions]);

  const getTitle = () => {
    const action = isEditMode ? 'Edit' : 'Tambah';
    const title = activeTab === 'kapal' ? 'Data Kapal' : 'Jenis Kapal';
    return `${action} ${title}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = activeTab === 'kapal' ? 'kapal' : 'jenis';
    const idField = activeTab === 'kapal' ? 'id_kapal' : 'id_jenis';
    
    try {
      const url = isEditMode
        ? `/${endpoint}/update/${currentItem[idField]}`
        : `/${endpoint}/store`;
      
      const method = isEditMode ? 'patch' : 'post';

      const response = await axiosInstance({
        method: method,
        url: url,
        data: formData
      });

      if (response.status === 200) {
        toast.success(`Data ${activeTab} berhasil ${isEditMode ? 'diperbarui' : 'disimpan'}!`);
        onSuccess();
        onClose();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat menyimpan data.";
      console.error("Gagal menyimpan data:", errorMessage);
      toast.error(errorMessage);
    }
  };

  const renderFormContent = () => {
    if (activeTab === 'kapal') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><Label htmlFor="nama_kapal">Nama Kapal</Label><InputField name="nama_kapal" id="nama_kapal" value={formData.nama_kapal || ''} onChange={handleChange} required /></div>
          <div><Label htmlFor="id_jenis">Jenis Kapal</Label><Select name="id_jenis" id="id_jenis" value={formData.id_jenis || ''} onChange={handleChange} options={formattedJenisKapalOptions} required /></div>
          <div><Label htmlFor="id_bendera">Bendera</Label><Select name="id_bendera" id="bendera" value={formData.id_bendera || ''} onChange={handleChange} options={formattedBenderaOptions} required /></div>
          <div><Label htmlFor="gt">Gross Tonnage (GT)</Label><InputField type="number" name="gt" id="gt" value={formData.gt || ''} onChange={handleChange} required /></div>
          <div><Label htmlFor="nt">Net Tonnage (NT)</Label><InputField type="number" name="nt" id="nt" value={formData.nt || ''} onChange={handleChange} required /></div>
          <div><Label htmlFor="nomor_selar">Nomor Selar</Label><InputField name="nomor_selar" id="nomor_selar" value={formData.nomor_selar || ''} onChange={handleChange} required /></div>
          <div><Label htmlFor="tanda_selar">Tanda Selar</Label><InputField name="tanda_selar" id="tanda_selar" value={formData.tanda_selar || ''} onChange={handleChange} required/></div>
          <div><Label htmlFor="nomor_imo">Nomor IMO</Label><InputField name="nomor_imo" id="nomor_imo" value={formData.nomor_imo || ''} onChange={handleChange} /></div>
          <div><Label htmlFor="call_sign">Call Sign</Label><InputField name="call_sign" id="call_sign" value={formData.call_sign || ''} onChange={handleChange} /></div>
        </div>
      );
    }

    if (activeTab === 'jenisKapal') {
      return (
        <div>
          <Label htmlFor="nama_jenis">Nama Jenis Kapal</Label>
          <InputField name="nama_jenis" id="nama_jenis" value={formData.nama_jenis || ''} onChange={handleChange} placeholder="Contoh: General Cargo" required />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl mx-4">
        <form onSubmit={handleSubmit}>
          <div className="p-5 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2><button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button></div>
          <div className="p-5 max-h-[70vh] overflow-y-auto">{renderFormContent()}</div>
          <div className="p-5 border-t flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
            <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
            <Button type="submit">{isEditMode ? 'Simpan Perubahan' : 'Simpan'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KapalFormModal;