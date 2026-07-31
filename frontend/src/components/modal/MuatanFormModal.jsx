import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import Label from '../form/Label';
import InputField from '../form/InputField';
import Select from '../form/Select';
import Button from '../ui/Button';
import axiosInstance from '../../api/axiosInstance';

const statusOptions = [
    { value: '', label: 'Pilih Status Kategori', disabled: true },
    { value: 'Umum', label: 'Umum' },
    { value: 'Berbahaya', label: 'Berbahaya' },
];

const MuatanFormModal = ({ activeTab, onClose, currentItem, jenisMuatanOptions = [], onSuccess }) => {
    const [formData, setFormData] = useState({});
    const isEditMode = Boolean(currentItem);

    useEffect(() => {
        if (isEditMode && currentItem) {
            setFormData(currentItem);
        } else {
            if (activeTab === 'kategori') {
                setFormData({
                    nama_kategori_muatan: '',
                    status_kategori_muatan: '',
                    id_jenis_muatan: ''
                });
            } else { // activeTab === 'jenisMuatan'
                setFormData({ nama_jenis_muatan: '' });
            }
        }
    }, [activeTab, currentItem, isEditMode]);

    const formattedJenisMuatanOptions = useMemo(() => {
        return [
            { value: '', label: 'Pilih Jenis Muatan', disabled: true },
            ...jenisMuatanOptions.map(item => ({ value: item.id_jenis_muatan, label: item.nama_jenis_muatan }))
        ];
    }, [jenisMuatanOptions]);

    const getTitle = () => {
        const action = isEditMode ? 'Edit' : 'Tambah';
        const title = activeTab === 'kategori' ? 'Kategori Muatan' : 'Jenis Muatan';
        return `${action} Data ${title}`;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = activeTab === 'kategori' ? 'kategori-muatan' : 'jenis-muatan';
        const idField = activeTab === 'kategori' ? 'id_kategori_muatan' : 'id_jenis_muatan';

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
                const entityName = activeTab === 'kategori' ? 'Kategori Muatan' : 'Jenis Muatan';
                toast.success(`Data ${entityName} Berhasil ${isEditMode ? 'Diperbarui' : 'Disimpan'}!`);
                onSuccess();
                onClose();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat menyimpan data.";
            console.error("Data Gagal Disimpan:", error);
            toast.error(errorMessage);
        }
    };

    const renderFormContent = () => {
        if (activeTab === 'kategori') {
            return (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="nama_kategori_muatan">Nama Kategori Muatan</Label>
                        <InputField name="nama_kategori_muatan" id="nama_kategori_muatan" value={formData.nama_kategori_muatan || ''} onChange={handleChange} placeholder="Contoh: BBM" required />
                    </div>
                    <div>
                        <Label htmlFor="id_jenis_muatan">Jenis Muatan</Label>
                        <Select name="id_jenis_muatan" id="id_jenis_muatan" value={formData.id_jenis_muatan || ''} onChange={handleChange} options={formattedJenisMuatanOptions} required />
                    </div>
                    <div>
                        <Label htmlFor="status_kategori_muatan">Status Kategori Muatan</Label>
                        <Select name="status_kategori_muatan" id="status_kategori_muatan" value={formData.status_kategori_muatan || ''} onChange={handleChange} options={statusOptions} required />
                    </div>
                </div>
            );
        }

        if (activeTab === 'jenisMuatan') {
            return (
                <div>
                    <Label htmlFor="nama_jenis_muatan">Nama Jenis Muatan</Label>
                    <InputField name="nama_jenis_muatan" id="nama_jenis_muatan" value={formData.nama_jenis_muatan || ''} onChange={handleChange} placeholder="Contoh: Barang Curah" required />
                </div>
            );
        }
        return null;
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                    </div>
                    <div className="p-5 max-h-[70vh] overflow-y-auto">
                        {renderFormContent()}
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

export default MuatanFormModal;