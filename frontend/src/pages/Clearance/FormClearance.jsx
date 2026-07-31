import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import Step1DataKapal from '../../components/clearance/Step1DataKapal';
import Step2DataMuatan from '../../components/clearance/Step2DataMuatan';

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

    // [BARU] Helper untuk mengubah data dari backend (array terpisah) ke frontend (objek gabungan)
    const mapMuatanToFrontend = (muatanList = [], type = 'barang') => {
        const grouped = {};
        const keyField = type === 'barang' ? 'id_kategori_muatan' : 'golongan_kendaraan';

        muatanList.forEach(m => {
            const key = m[keyField];
            if (!grouped[key]) {
                grouped[key] = {
                    type: type,
                    jenis_perjalanan: m.jenis_perjalanan,
                    ...(type === 'barang' ? { id_kategori_muatan: m.id_kategori_muatan, kategori_muatan: m.kategori_muatan } : { golongan_kendaraan: m.golongan_kendaraan }),
                    ton: m.ton || null, // Ambil data langsung
                    m3: m.m3 || null,   // Ambil data langsung
                    unit: m.unit || null, // Ambil data langsung
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
                    axiosInstance.get('/kategori-muatan'), // Memuat kategori untuk dropdown
                    axiosInstance.get('/pelabuhan') 
                ]);

                setAgenData(agenRes.data.datas.map(d => ({ nama: d.nama_agen, id: d.id_agen })));
                setKabupatenData(kabupatenRes.data.datas.map(d => ({ nama: d.nama_kabupaten, id: d.id_kabupaten })));
                setKapalData(kapalRes.data.datas.map(d => ({ nama: d.nama_kapal, id: d.id_kapal })));
                setKecamatanData(kecamatanRes.data.datas.map(d => ({ nama: d.nama_kecamatan, id: d.id_kecamatan })));
                setNahkodaData(nahkodaRes.data.datas.map(d => ({ nama: d.nama_nahkoda, id: d.id_nahkoda })));
                // Pastikan ini mengembalikan array untuk dropdown
                setKategoriMuatanData(kategoriMuatanRes.data.datas.map(d => ({ nama: d.nama_kategori_muatan, id: d.id_kategori_muatan })));
                setPelabuhanData(pelabuhanRes.data.datas.map(d => ({ nama: d.nama_pelabuhan, id: d.id_pelabuhan })));

                if (isEditMode) {
                    const clearanceRes = await axiosInstance.get(`/perjalanan/${id}`);
                    const clearanceData = clearanceRes.data.data;

                    // [DIUBAH] Gunakan helper baru untuk memetakan data
                    const barangDatang = mapMuatanToFrontend(clearanceData.muatans?.filter(m => m.jenis_perjalanan === 'datang'), 'barang');
                    const barangBerangkat = mapMuatanToFrontend(clearanceData.muatans?.filter(m => m.jenis_perjalanan === 'berangkat'), 'barang');
                    const kendaraanDatang = mapMuatanToFrontend(clearanceData.muatan_kendaraan?.filter(k => k.jenis_perjalanan === 'datang'), 'kendaraan');
                    const kendaraanBerangkat = mapMuatanToFrontend(clearanceData.muatan_kendaraan?.filter(k => k.jenis_perjalanan === 'berangkat'), 'kendaraan');

                    const allDatang = [...barangDatang, ...kendaraanDatang];
                    const allBerangkat = [...barangBerangkat, ...kendaraanBerangkat];
                    
                    const pembayaran_rambu = clearanceData.pembayaran?.find(p => p.tipe_pembayaran === 'rambu') || { ntpn: '', nilai: '' };
                    const pembayaran_labuh = clearanceData.pembayaran?.find(p => p.tipe_pembayaran === 'labuh') || { ntpn: '', nilai: '' };

                    const dataToEdit = {
                        ...initialState,
                        ...clearanceData,
                        spb: clearanceData.spb || initialState.spb,
                        barangDatang: allDatang,
                        barangBerangkat: allBerangkat,
                        pembayaran_rambu: { ntpn: pembayaran_rambu.ntpn, nilai: pembayaran_rambu.nilai },
                        pembayaran_labuh: { ntpn: pembayaran_labuh.ntpn, nilai: pembayaran_labuh.nilai }
                    };
                    setFormData(dataToEdit);
                }

            } catch (error) {
                toast.error("Gagal memuat data master.");
                console.error("Fetch Data Error:", error);
            }
        };

        fetchAllData();
    }, [id, isEditMode, API_URL]);

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

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formRef.current?.checkValidity()) {
            formRef.current?.reportValidity();
            return;
        }

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

        // [LOGIKA DIUBAH TOTAL]
        const muatanBarangBackend = [];
        const muatanKendaraanBackend = [];

        // Helper untuk mengubah nilai kosong/0 menjadi null
        const parseNumeric = (val) => (val ? parseFloat(val) : null);

        allMuatanForm.forEach(item => {
            const ton = parseNumeric(item.ton);
            const m3 = parseNumeric(item.m3);
            const unit = parseNumeric(item.unit);

            // Jika item adalah BARANG
            if (item.type === 'barang') {
                // Hanya kirim jika ada ID kategori
                if (item.id_kategori_muatan) {
                    muatanBarangBackend.push({
                        jenis_perjalanan: item.jenis_perjalanan,
                        id_kategori_muatan: item.id_kategori_muatan,
                        ton: ton,
                        m3: m3,
                        unit: unit
                    });
                }
            } 
            // Jika item adalah KENDARAAN
            else if (item.type === 'kendaraan') {
                // Hanya kirim jika ada golongan
                if (item.golongan_kendaraan) {
                    muatanKendaraanBackend.push({
                        jenis_perjalanan: item.jenis_perjalanan,
                        golongan_kendaraan: item.golongan_kendaraan,
                        ton: ton,
                        m3: m3,
                        unit: unit
                    });
                }
            }
        });
            
        // Proses Pembayaran
        const pembayaran = [];
        if (pembayaran_rambu.ntpn && pembayaran_rambu.nilai) {
            pembayaran.push({ tipe_pembayaran: 'rambu', ntpn: pembayaran_rambu.ntpn, nilai: parseFloat(pembayaran_rambu.nilai) });
        }
        if (pembayaran_labuh.ntpn && pembayaran_labuh.nilai) {
            pembayaran.push({ tipe_pembayaran: 'labuh', ntpn: pembayaran_labuh.ntpn, nilai: parseFloat(pembayaran_labuh.nilai) });
        }

        const newData = {
            ...cleanData,
            muatan: muatanBarangBackend, // Data baru (format sudah benar)
            muatan_kendaraan: muatanKendaraanBackend, // Data baru (format sudah benar)
            pembayaran: pembayaran
        };

        console.log("Data yang dikirim ke backend:", newData); 

        const config = {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        };

        try {
            if (!localStorage.getItem('token')) {
                toast.error("Sesi Anda telah berakhir, silakan login kembali.");
                navigate('/signin');
                return;
            }

            const response = isEditMode
                ? await axiosInstance.patch(`/perjalanan/update/${id}`, newData)
                : await axiosInstance.post('/perjalanan/store', newData);
                
            if (response.status === 200) {
                toast.success(`Data Clearance berhasil ${isEditMode ? 'diperbarui' : 'disimpan'}!`);
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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit' : 'Formulir'} Surat Persetujuan Berlayar</h1>
            <div className="w-full">
                <ol className="flex items-center w-full">
                    <li className={`flex w-full items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-500'} after:content-[''] after:w-full after:h-1 after:border-b ${step > 1 ? 'after:border-blue-600' : 'after:border-gray-200'} after:border-4 after:inline-block`}>
                        <span className={`flex items-center justify-center w-10 h-10 ${step >= 1 ? 'bg-blue-100' : 'bg-gray-100'} rounded-full lg:h-12 lg:w-12 shrink-0`}>1</span>
                    </li>
                    <li className={`flex items-center w-auto`}>
                        <span className={`flex items-center justify-center w-10 h-10 ${step >= 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'} rounded-full lg:h-12 lg:w-12 shrink-0`}>2</span>
                    </li>
                </ol>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
        </div>
    );
};

export default FormClearance;