import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Label from '../form/Label';
import InputField from '../form/InputField';
import Button from '../ui/Button';
import axiosInstance from '../../api/axiosInstance';

const colorOptions = [
    { value: 'emerald', label: 'Hijau (Emerald)' },
    { value: 'amber', label: 'Oranye (Amber)' },
    { value: 'red', label: 'Merah (Red)' },
    { value: 'blue', label: 'Biru (Blue)' },
    { value: 'purple', label: 'Ungu (Purple)' },
    { value: 'indigo', label: 'Nila (Indigo)' },
    { value: 'cyan', label: 'Biru Muda (Cyan)' },
    { value: 'teal', label: 'Hijau Tosca (Teal)' },
    { value: 'rose', label: 'Merah Rose (Rose)' },
    { value: 'pink', label: 'Merah Muda (Pink)' },
    { value: 'orange', label: 'Oranye Terang (Orange)' },
    { value: 'violet', label: 'Violet / Ungu Gelap' },
    { value: 'yellow', label: 'Kuning (Yellow)' },
    { value: 'lime', label: 'Hijau Stabilo (Lime)' },
    { value: 'sky', label: 'Biru Langit (Sky)' },
    { value: 'gray', label: 'Abu-abu (Gray)' },
];

const StatusPelayaranModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
    const [kodeStatus, setKodeStatus] = useState('');
    const [namaStatus, setNamaStatus] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [badgeColor, setBadgeColor] = useState('emerald');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setKodeStatus(initialData.kode_status || '');
            setNamaStatus(initialData.nama_status || '');
            setDeskripsi(initialData.deskripsi || '');
            setBadgeColor(initialData.badge_color || 'emerald');
        } else {
            setKodeStatus('');
            setNamaStatus('');
            setDeskripsi('');
            setBadgeColor('emerald');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!kodeStatus.trim() || !namaStatus.trim()) {
            toast.error('Kode status dan Nama status wajib diisi!');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                kode_status: kodeStatus.trim().toUpperCase(),
                nama_status: namaStatus.trim(),
                deskripsi: deskripsi.trim(),
                badge_color: badgeColor
            };

            if (initialData) {
                await axiosInstance.patch(`/status-pelayaran/update/${initialData.id_status}`, payload);
                toast.success('Status pelayaran berhasil diperbarui!');
            } else {
                await axiosInstance.post('/status-pelayaran/store', payload);
                toast.success('Status pelayaran berhasil ditambahkan!');
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Submit status pelayaran error:", error);
            const msg = error.response?.data?.msg || 'Gagal menyimpan status pelayaran.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            {initialData ? 'Edit Status Pelayaran' : 'Tambah Status Pelayaran'}
                        </h3>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                        <div>
                            <Label htmlFor="kode_status">Kode Status *</Label>
                            <InputField 
                                id="kode_status"
                                type="text"
                                value={kodeStatus}
                                onChange={(e) => setKodeStatus(e.target.value.toUpperCase())}
                                placeholder="Contoh: TERTAHAN, BATAL, RUSAK"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="nama_status">Nama Status *</Label>
                            <InputField 
                                id="nama_status"
                                type="text"
                                value={namaStatus}
                                onChange={(e) => setNamaStatus(e.target.value)}
                                placeholder="Contoh: Tertahan di Pelabuhan"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="badge_color">Warna Badge Indikator</Label>
                            <select
                                id="badge_color"
                                value={badgeColor}
                                onChange={(e) => setBadgeColor(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            >
                                {colorOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="deskripsi">Deskripsi & Fungsi</Label>
                            <textarea
                                id="deskripsi"
                                rows="3"
                                value={deskripsi}
                                onChange={(e) => setDeskripsi(e.target.value)}
                                placeholder="Jelaskan kegunaan dan kondisi penerapan status pelayaran ini..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-700/50">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Simpan Status'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StatusPelayaranModal;
