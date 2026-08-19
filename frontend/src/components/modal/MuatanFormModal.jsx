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

const MuatanFormModal = ({ activeTab, onClose, currentItem, jenisMuatanOptions = [], satuanMuatanOptions = [], klasifikasiMuatanOptions = [], onSuccess }) => {
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
                    id_jenis_muatan: '',
                    id_satuan_muatan: '',
                    id_klasifikasi_muatan: '',
                    bobot_per_unit_kg: 0
                });
            } else if (activeTab === 'jenisMuatan') {
                setFormData({ nama_jenis_muatan: '' });
            } else if (activeTab === 'satuanMuatan') {
                setFormData({ nama_satuan_muatan: '', keterangan_satuan: '' });
            } else if (activeTab === 'klasifikasiMuatan') {
                setFormData({ nama_klasifikasi_muatan: '', keterangan_klasifikasi: '' });
            }
        }
    }, [activeTab, currentItem, isEditMode]);

    const formattedJenisMuatanOptions = useMemo(() => {
        return [
            { value: '', label: 'Pilih Jenis Muatan', disabled: true },
            ...jenisMuatanOptions.map(item => ({ value: item.id_jenis_muatan, label: item.nama_jenis_muatan }))
        ];
    }, [jenisMuatanOptions]);

    const formattedSatuanMuatanOptions = useMemo(() => {
        return [
            { value: '', label: 'Pilih Satuan Muatan', disabled: true },
            ...satuanMuatanOptions.map(item => ({ value: item.id_satuan_muatan, label: item.nama_satuan_muatan }))
        ];
    }, [satuanMuatanOptions]);

    const formattedKlasifikasiMuatanOptions = useMemo(() => {
        return [
            { value: '', label: 'Pilih Klasifikasi Muatan (Opsional)', disabled: false },
            ...klasifikasiMuatanOptions.map(item => ({ value: item.id_klasifikasi_muatan, label: item.nama_klasifikasi_muatan }))
        ];
    }, [klasifikasiMuatanOptions]);

    const getTitle = () => {
        const action = isEditMode ? 'Edit' : 'Tambah';
        let title = 'Kategori Muatan';
        if (activeTab === 'jenisMuatan') title = 'Jenis Muatan';
        if (activeTab === 'satuanMuatan') title = 'Satuan Muatan';
        if (activeTab === 'klasifikasiMuatan') title = 'Klasifikasi Muatan';
        return `${action} Data ${title}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let endpoint = 'kategori-muatan';
        let idField = 'id_kategori_muatan';

        if (activeTab === 'jenisMuatan') {
            endpoint = 'jenis-muatan';
            idField = 'id_jenis_muatan';
        } else if (activeTab === 'satuanMuatan') {
            endpoint = 'satuan-muatan';
            idField = 'id_satuan_muatan';
        } else if (activeTab === 'klasifikasiMuatan') {
            endpoint = 'klasifikasi-muatan';
            idField = 'id_klasifikasi_muatan';
        }

        const finalData = { ...formData };
        if (activeTab === 'kategori') {
            if (finalData.id_satuan_muatan === "") finalData.id_satuan_muatan = null;
            if (finalData.id_jenis_muatan === "") finalData.id_jenis_muatan = null;
            if (finalData.id_klasifikasi_muatan === "") finalData.id_klasifikasi_muatan = null;
        }

        try {
            const url = isEditMode
                ? `/${endpoint}/update/${currentItem[idField]}`
                : `/${endpoint}/store`;

            const method = isEditMode ? 'patch' : 'post';

            const response = await axiosInstance({
                method: method,
                url: url,
                data: finalData
            });

            if (response.status === 200) {
                let entityName = 'Kategori Muatan';
                if (activeTab === 'jenisMuatan') entityName = 'Jenis Muatan';
                if (activeTab === 'satuanMuatan') entityName = 'Satuan Muatan';
                if (activeTab === 'klasifikasiMuatan') entityName = 'Klasifikasi Muatan';

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
                        <Label htmlFor="id_satuan_muatan">Satuan Muatan</Label>
                        <Select name="id_satuan_muatan" id="id_satuan_muatan" value={formData.id_satuan_muatan || ''} onChange={handleChange} options={formattedSatuanMuatanOptions} required />
                    </div>
                    <div>
                        <Label htmlFor="id_klasifikasi_muatan">Klasifikasi Muatan (Opsional)</Label>
                        <Select name="id_klasifikasi_muatan" id="id_klasifikasi_muatan" value={formData.id_klasifikasi_muatan || ''} onChange={handleChange} options={formattedKlasifikasiMuatanOptions} />
                    </div>
                    <div>
                        <Label htmlFor="status_kategori_muatan">Status Kategori Muatan</Label>
                        <Select name="status_kategori_muatan" id="status_kategori_muatan" value={formData.status_kategori_muatan || ''} onChange={handleChange} options={statusOptions} required />
                    </div>
                    <div>
                        <Label htmlFor="bobot_per_unit_kg">Bobot per Unit (kg) (Opsional)</Label>
                        <InputField name="bobot_per_unit_kg" id="bobot_per_unit_kg" type="number" step="any" value={formData.bobot_per_unit_kg || ''} onChange={handleChange} placeholder="Contoh: 25" />
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

        if (activeTab === 'satuanMuatan') {
            return (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="nama_satuan_muatan">Nama Satuan Muatan</Label>
                        <InputField name="nama_satuan_muatan" id="nama_satuan_muatan" value={formData.nama_satuan_muatan || ''} onChange={handleChange} placeholder="Contoh: kg, ton, dus, unit" required />
                    </div>
                    <div>
                        <Label htmlFor="keterangan_satuan">Keterangan (Opsional)</Label>
                        <InputField name="keterangan_satuan" id="keterangan_satuan" value={formData.keterangan_satuan || ''} onChange={handleChange} placeholder="Contoh: Kilogram" />
                    </div>
                </div>
            );
        }

        if (activeTab === 'klasifikasiMuatan') {
            return (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="nama_klasifikasi_muatan">Nama Klasifikasi Muatan</Label>
                        <InputField name="nama_klasifikasi_muatan" id="nama_klasifikasi_muatan" value={formData.nama_klasifikasi_muatan || ''} onChange={handleChange} placeholder="Contoh: General Cargo" required />
                    </div>
                    <div>
                        <Label htmlFor="keterangan_klasifikasi">Keterangan (Opsional)</Label>
                        <InputField name="keterangan_klasifikasi" id="keterangan_klasifikasi" value={formData.keterangan_klasifikasi || ''} onChange={handleChange} placeholder="Contoh: Muatan umum / barang kemasan" />
                    </div>
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