import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import Step1DataKapal from '../../components/clearance/Step1DataKapal';
import Step2DataMuatan from '../../components/clearance/Step2DataMuatan';
import UnsavedChangesModal from '../../components/modal/UnsavedChangesModal';

const initialState = {
    ppk: '',
    spb: { no_spb_asal: '', no_spb: '' },
    no_urut: '',
    tanggal_clearance: '',
    pukul_agen_clearance: '',
    id_kapal: '', id_nahkoda: '', jumlah_crew: '',
    id_kedudukan_kapal: '', id_datang_dari: '', tanggal_datang: '', tanggal_berangkat: '', pukul_kapal_berangkat: '',
    id_tempat_singgah: '',
    id_tujuan_akhir: '', id_agen: '',
    id_tolak: '',
    id_sandar: '',
    status_muatan_berangkat: 'Kosong',
    barangDatang: [],
    barangBerangkat: [],
    penumpang_naik: '',
    penumpang_turun: '',
    pembayaran_rambu: { ntpn: '', nilai: '' },
    pembayaran_labuh: { ntpn: '', nilai: '' }
};

const FormClearance = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);
    const formRef = useRef(null);

    const [nahkodaData, setNahkodaData] = useState([]);
    const [kapalData, setKapalData] = useState([]);
    const [kabupatenData, setKabupatenData] = useState([]);
    const [kecamatanData, setKecamatanData] = useState([]);
    const [agenData, setAgenData] = useState([]);
    const [kategoriMuatanData, setKategoriMuatanData] = useState([]);
    const [pelabuhanData, setPelabuhanData] = useState([]);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(initialState);

    // Unsaved Changes Tracking States & Refs
    const initialSnapshotRef = useRef(null);
    const isInitialLoadedRef = useRef(false);
    const isSubmittedRef = useRef(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [pendingNavPath, setPendingNavPath] = useState(null);
    const [isSavingAndLeaving, setIsSavingAndLeaving] = useState(false);

    // Calculate whether form has unsaved edits
    const isDirty = Boolean(
        isInitialLoadedRef.current &&
        initialSnapshotRef.current &&
        !isSubmittedRef.current &&
        JSON.stringify(formData) !== initialSnapshotRef.current
    );

    const shouldProtectNavigation = Boolean(
        (isEditMode || isDirty) && !isSubmittedRef.current
    );

    // Helper untuk mengubah data dari backend ke frontend (objek gabungan)
    const mapMuatanToFrontend = (muatanList = [], type = 'barang') => {
        const grouped = {};
        const keyField = type === 'barang' ? 'id_kategori_muatan' : 'golongan_kendaraan';

        muatanList.forEach(m => {
            const key = m[keyField];
            if (!grouped[key]) {
                const qty = m.unit ?? m.liter ?? m.m3 ?? m.ton ?? '';
                const estTon = (m.ton !== null && m.ton !== undefined) ? m.ton : '';
                grouped[key] = {
                    type: type,
                    jenis_perjalanan: m.jenis_perjalanan,
                    ...(type === 'barang' ? { id_kategori_muatan: m.id_kategori_muatan, kategori_muatan: m.kategori_muatan } : { golongan_kendaraan: m.golongan_kendaraan }),
                    quantity: qty,
                    estimated_ton: estTon,
                    ton: m.ton || null,
                    m3: m.m3 || null,
                    unit: m.unit || null,
                    liter: m.liter || null,
                };
            }
        });
        return Object.values(grouped);
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [
                    agenRes, kabupatenRes, kapalRes,
                    kecamatanRes, nahkodaRes, kategoriMuatanRes,
                    pelabuhanRes
                ] = await Promise.all([
                    axiosInstance.get('/agen'),
                    axiosInstance.get('/kabupaten'),
                    axiosInstance.get('/kapal'),
                    axiosInstance.get('/kecamatan'),
                    axiosInstance.get('/nahkoda'),
                    axiosInstance.get('/kategori-muatan'),
                    axiosInstance.get('/pelabuhan')
                ]);

                setAgenData(agenRes.data.datas.map(d => ({ nama: d.nama_agen, id: d.id_agen })));
                setKabupatenData(kabupatenRes.data.datas.map(d => ({ nama: d.nama_kabupaten, id: d.id_kabupaten })));
                setKapalData(kapalRes.data.datas.map(d => ({ nama: d.nama_kapal, id: d.id_kapal, asal_kapal: d.asal_kapal })));
                setKecamatanData(kecamatanRes.data.datas.map(d => ({ nama: d.nama_kecamatan, id: d.id_kecamatan })));
                setNahkodaData(nahkodaRes.data.datas.map(d => ({ nama: d.nama_nahkoda, id: d.id_nahkoda })));
                setKategoriMuatanData(kategoriMuatanRes.data.datas.map(d => ({
                    nama: d.nama_kategori_muatan,
                    id: d.id_kategori_muatan,
                    bobot_per_unit_kg: d.bobot_per_unit_kg || 0,
                    nama_satuan_muatan: d.satuan_muatan?.nama_satuan_muatan || 'unit'
                })));
                setPelabuhanData(pelabuhanRes.data.datas.map(d => ({ nama: d.nama_pelabuhan, id: d.id_pelabuhan })));

                let finalFormData = initialState;

                if (isEditMode) {
                    const clearanceRes = await axiosInstance.get(`/perjalanan/${id}`);
                    const clearanceData = clearanceRes.data.data;

                    const barangDatang = mapMuatanToFrontend(clearanceData.muatans?.filter(m => m.jenis_perjalanan === 'datang'), 'barang');
                    const barangBerangkat = mapMuatanToFrontend(clearanceData.muatans?.filter(m => m.jenis_perjalanan === 'berangkat'), 'barang');
                    const kendaraanDatang = mapMuatanToFrontend(clearanceData.muatan_kendaraan?.filter(k => k.jenis_perjalanan === 'datang'), 'kendaraan');
                    const kendaraanBerangkat = mapMuatanToFrontend(clearanceData.muatan_kendaraan?.filter(k => k.jenis_perjalanan === 'berangkat'), 'kendaraan');

                    const allDatang = [...barangDatang, ...kendaraanDatang];
                    const allBerangkat = [...barangBerangkat, ...kendaraanBerangkat];

                    const pembayaran_rambu = clearanceData.pembayaran?.find(p => p.tipe_pembayaran === 'rambu') || { ntpn: '', nilai: '' };
                    const pembayaran_labuh = clearanceData.pembayaran?.find(p => p.tipe_pembayaran === 'labuh') || { ntpn: '', nilai: '' };

                    finalFormData = {
                        ...initialState,
                        ...clearanceData,
                        spb: clearanceData.spb || initialState.spb,
                        barangDatang: allDatang,
                        barangBerangkat: allBerangkat,
                        pembayaran_rambu: { ntpn: pembayaran_rambu.ntpn, nilai: pembayaran_rambu.nilai },
                        pembayaran_labuh: { ntpn: pembayaran_labuh.ntpn, nilai: pembayaran_labuh.nilai }
                    };
                }

                setFormData(finalFormData);
                initialSnapshotRef.current = JSON.stringify(finalFormData);
                isInitialLoadedRef.current = true;

            } catch (error) {
                toast.error("Gagal memuat data master.");
                console.error("Fetch Data Error:", error);
            }
        };

        fetchAllData();
    }, [id, isEditMode, API_URL]);

    // 1. Browser Tab Close / Refresh Interceptor
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (shouldProtectNavigation) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [shouldProtectNavigation]);

    // 2. Global Link Click Interceptor
    useEffect(() => {
        if (!shouldProtectNavigation) return;

        const handleAnchorClick = (e) => {
            const anchor = e.target.closest('a[href], button[data-nav]');
            if (!anchor) return;

            const href = anchor.getAttribute('href') || anchor.getAttribute('data-nav');
            if (!href || href.startsWith('#') || href.startsWith('javascript:') || href === window.location.pathname) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            setPendingNavPath(href);
            setShowUnsavedModal(true);
        };

        document.addEventListener('click', handleAnchorClick, true);
        return () => document.removeEventListener('click', handleAnchorClick, true);
    }, [shouldProtectNavigation]);

    // 3. Browser Back/Forward Navigation Interceptor
    useEffect(() => {
        if (!shouldProtectNavigation) return;

        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
            setPendingNavPath('GO_BACK');
            setShowUnsavedModal(true);
        };

        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [shouldProtectNavigation]);

    const handleKapalChange = (kapalId) => {
        const selectedKapal = kapalData.find(k => k.id === parseInt(kapalId));
        if (selectedKapal) {
            setFormData(prev => ({ ...prev, id_kapal: selectedKapal.id }));
        } else {
            setFormData(prev => ({ ...prev, id_kapal: '' }));
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleBackClick = () => {
        if (shouldProtectNavigation) {
            setPendingNavPath('/clearance');
            setShowUnsavedModal(true);
        } else {
            navigate('/clearance');
        }
    };

    // Save Data Function (Returns boolean for success)
    const processSaveData = async () => {
        let {
            barangBerangkat, barangDatang,
            pembayaran_rambu, pembayaran_labuh,
            ...cleanData
        } = formData;

        if (cleanData.id_tempat_singgah === '') cleanData.id_tempat_singgah = null;
        if (cleanData.id_tolak === '' || cleanData.id_tolak === null) cleanData.id_tolak = null;
        if (cleanData.id_sandar === '' || cleanData.id_sandar === null) cleanData.id_sandar = null;
        if (cleanData.penumpang_naik === '') cleanData.penumpang_naik = null;
        if (cleanData.penumpang_turun === '') cleanData.penumpang_turun = null;

        let allMuatanForm = [];
        if (formData.status_muatan_berangkat === 'NIHIL') {
            allMuatanForm = [...formData.barangDatang];
        } else {
            allMuatanForm = [...formData.barangBerangkat, ...formData.barangDatang];
        }

        const muatanBarangBackend = [];
        const muatanKendaraanBackend = [];
        const parseNumeric = (val) => (val ? parseFloat(val) : null);

        allMuatanForm.forEach(item => {
            if (item.type === 'barang') {
                if (item.id_kategori_muatan) {
                    const selectedCat = kategoriMuatanData.find(k => String(k.id) === String(item.id_kategori_muatan));
                    const unitType = String(selectedCat?.nama_satuan_muatan || 'unit').toLowerCase().trim();
                    const rawVal = (item.quantity !== undefined && item.quantity !== '') ? item.quantity : (item.unit || item.ton || item.liter || item.m3);
                    const val = parseNumeric(rawVal);

                    let ton = null, liter = null, m3 = null, unit = null;
                    if (unitType === 'ton') ton = val;
                    else if (unitType === 'liter') liter = val;
                    else if (unitType === 'm3' || unitType === 'm³') m3 = val;
                    else unit = val;

                    muatanBarangBackend.push({
                        jenis_perjalanan: item.jenis_perjalanan,
                        id_kategori_muatan: item.id_kategori_muatan,
                        ton, m3, unit, liter
                    });
                }
            } else if (item.type === 'kendaraan') {
                if (item.golongan_kendaraan) {
                    const ton = parseNumeric(item.ton);
                    const m3 = parseNumeric(item.m3);
                    const unit = parseNumeric(item.unit || item.quantity);
                    const liter = parseNumeric(item.liter);

                    muatanKendaraanBackend.push({
                        jenis_perjalanan: item.jenis_perjalanan,
                        golongan_kendaraan: item.golongan_kendaraan,
                        ton, m3, unit, liter
                    });
                }
            }
        });

        const pembayaran = [];
        if (pembayaran_rambu.ntpn && pembayaran_rambu.nilai) {
            pembayaran.push({ tipe_pembayaran: 'rambu', ntpn: pembayaran_rambu.ntpn, nilai: parseFloat(pembayaran_rambu.nilai) });
        }
        if (pembayaran_labuh.ntpn && pembayaran_labuh.nilai) {
            pembayaran.push({ tipe_pembayaran: 'labuh', ntpn: pembayaran_labuh.ntpn, nilai: parseFloat(pembayaran_labuh.nilai) });
        }

        const newData = {
            ...cleanData,
            muatan: muatanBarangBackend,
            muatan_kendaraan: muatanKendaraanBackend,
            pembayaran
        };

        if (!localStorage.getItem('token')) {
            toast.error("Sesi Anda telah berakhir, silakan login kembali.");
            navigate('/signin');
            return false;
        }

        const response = isEditMode
            ? await axiosInstance.patch(`/perjalanan/update/${id}`, newData)
            : await axiosInstance.post('/perjalanan/store', newData);

        if (response.status === 200) {
            toast.success(`Data Clearance berhasil ${isEditMode ? 'diperbarui' : 'disimpan'}!`);
            isSubmittedRef.current = true;
            return true;
        }
        return false;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!formRef.current?.checkValidity()) {
            formRef.current?.reportValidity();
            return;
        }

        try {
            const success = await processSaveData();
            if (success) {
                if (isEditMode) {
                    navigate(`/clearance/${id}`);
                } else {
                    navigate('/clearance');
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat menyimpan data.";
            toast.error(errorMessage);
            console.error("Submit Error:", error);
        }
    };

    // Modal action handlers
    const handleLeaveWithoutSaving = () => {
        isSubmittedRef.current = true;
        setShowUnsavedModal(false);
        if (pendingNavPath === 'GO_BACK') {
            navigate('/clearance');
        } else {
            navigate(pendingNavPath || '/clearance');
        }
    };

    const handleSaveAndLeave = async () => {
        if (!formRef.current?.checkValidity()) {
            setShowUnsavedModal(false);
            formRef.current?.reportValidity();
            toast.error("Harap lengkapi semua field yang wajib diisi terlebih dahulu.");
            return;
        }

        setIsSavingAndLeaving(true);
        try {
            const success = await processSaveData();
            if (success) {
                setShowUnsavedModal(false);
                if (pendingNavPath && pendingNavPath !== 'GO_BACK') {
                    navigate(pendingNavPath);
                } else if (isEditMode) {
                    navigate(`/clearance/${id}`);
                } else {
                    navigate('/clearance');
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat menyimpan data.";
            toast.error(errorMessage);
            console.error("Save and leave error:", error);
        } finally {
            setIsSavingAndLeaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <button
                        type="button"
                        onClick={handleBackClick}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors mb-1 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Kembali ke Daftar Clearance</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {isEditMode ? 'Edit' : 'Formulir'} Surat Persetujuan Berlayar
                    </h1>
                </div>
            </div>

            <div className="w-full">
                <ol className="flex items-center w-full">
                    <li className={`flex w-full items-center ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} after:content-[''] after:w-full after:h-1 after:border-b ${step > 1 ? 'after:border-blue-600 dark:after:border-blue-500' : 'after:border-gray-200 dark:after:border-gray-700'} after:border-4 after:inline-block`}>
                        <span className={`flex items-center justify-center w-10 h-10 ${step >= 1 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'} rounded-full lg:h-12 lg:w-12 shrink-0`}>1</span>
                    </li>
                    <li className={`flex items-center w-auto`}>
                        <span className={`flex items-center justify-center w-10 h-10 ${step >= 2 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'} rounded-full lg:h-12 lg:w-12 shrink-0`}>2</span>
                    </li>
                </ol>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-sm overflow-x-auto">
                <form ref={formRef} onSubmit={handleSubmit}>
                    {step === 1 && (
                        <Step1DataKapal
                            formData={formData} setFormData={setFormData}
                            nextStep={nextStep} handleSubmit={handleSubmit}
                            handleKapalChange={handleKapalChange} kapalOptions={kapalData}
                            nahkodaOptions={nahkodaData} kabupatenOptions={kabupatenData}
                            kecamatanOptions={kecamatanData} agenOptions={agenData}
                            pelabuhanOptions={pelabuhanData}
                            jenisPpkOptions={[{ id: '27', nama: '27' }, { id: '29', nama: '29' }]}
                        />
                    )}
                    {step === 2 && (
                        <Step2DataMuatan
                            formData={formData} setFormData={setFormData}
                            prevStep={prevStep} muatanOptions={kategoriMuatanData}
                        />
                    )}
                </form>
            </div>

            {/* Modal Notifikasi Perubahan Belum Disimpan */}
            <UnsavedChangesModal
                isOpen={showUnsavedModal}
                onClose={() => {
                    setShowUnsavedModal(false);
                    setPendingNavPath(null);
                }}
                onLeaveWithoutSaving={handleLeaveWithoutSaving}
                onSaveAndLeave={handleSaveAndLeave}
                isSaving={isSavingAndLeaving}
            />
        </div>
    );
};

export default FormClearance;