import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

const SpbAsalModal = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [formData, setFormData] = useState({
        kode_spb: '',
        asal: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                kode_spb: initialData.kode_spb || '',
                asal: initialData.asal || ''
            });
        } else {
            setFormData({
                kode_spb: '',
                asal: ''
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.kode_spb.trim()) {
            toast.error("Kode SPB wajib diisi.");
            return;
        }
        if (!formData.asal.trim()) {
            toast.error("Asal wajib diisi.");
            return;
        }

        setLoading(true);
        try {
            if (initialData) {
                await axiosInstance.patch(`/spb-asal/update/${initialData.id_spb_asal}`, formData);
                toast.success("Data SPB Asal berhasil diperbarui!");
            } else {
                await axiosInstance.post('/spb-asal/store', formData);
                toast.success("Data SPB Asal berhasil ditambahkan!");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Save SPB Asal error:", error);
            const msg = error.response?.data?.msg || "Gagal menyimpan data SPB Asal.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {initialData ? 'Edit SPB Asal' : 'Tambah SPB Asal'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Kode SPB <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: SPB.PK.001/ atau SPB.01/"
                            value={formData.kode_spb}
                            onChange={(e) => setFormData({ ...formData, kode_spb: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white focus:outline-none transition-all"
                            required
                        />
                        <p className="text-[11px] text-gray-400 mt-1">Kode / Format penomoran SPB asal.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Asal Pelabuhan / Daerah <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: SAPUDI, KANGEAN, SURABAYA"
                            value={formData.asal}
                            onChange={(e) => setFormData({ ...formData, asal: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white focus:outline-none transition-all uppercase"
                            required
                        />
                        <p className="text-[11px] text-gray-400 mt-1">Nama asal pelabuhan/daerah pengeluaran SPB.</p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Data')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SpbAsalModal;
