import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import ClearanceTable from '../../components/table/ClearanceTable';
import SearchBar from '../../components/common/SearchBar';
import FilterDropdown from '../../components/common/FilterDropdown';
import InputField from '../../components/form/InputField';
import Pagination from '../../components/ui/Pagination';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const customStyles = {
    control: (styles) => ({ 
        ...styles, 
        backgroundColor: 'transparent',
    }),
    multiValue: (styles) => ({ 
        ...styles, 
        backgroundColor: 'var(--tw-select-multivalue-bg, #374151)' 
    }),
    multiValueLabel: (styles) => ({ 
        ...styles, 
        color: '#F3F4F6' 
    }),
    multiValueRemove: (styles) => ({ 
        ...styles, 
        color: '#9CA3AF', 
        ':hover': { backgroundColor: '#EF4444', color: 'white' } 
    }),
};

const rowsPerPageOptions = ['5', '10', '20', '50', 'Semua'];

function Clearance() {
    const [pageData, setPageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();

    const [dropdownOptions, setDropdownOptions] = useState({
        ships: [],
        categories: [],
        goods: [],
        wilayahKerja: []
    });

    const [filters, setFilters] = useState({
        searchTerm: '',
        selectedShip: '',
        startDate: '',
        endDate: '',
        selectedCategory: '',
        selectedGoods: [],
        selectedWilayah: '',
    });

    const [sortConfig, setSortConfig] = useState({
        key: 'no_spb', 
        direction: 'DESC'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState('5');
    const [totalData, setTotalData] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const exportRef = useRef(null);

    const isUserPusat = useMemo(() => {
        if (!user || !user.wilayah_kerja) {
            return false;
        }
        return user.wilayah_kerja.toLowerCase() === 'pusat';
    }, [user]);

    useEffect(() => {
        const fetchDropdownOptions = async () => {
            try {
                const response = await axiosInstance.get('/perjalanan/filter-options');
                if (response.data) {
                    const { ships, categories, goods, wilayahKerja } = response.data;

                    const goodsOptions = (goods || []).map(g => ({ value: `good_${g}`, label: g }));
                    const vehicleOptions = [
                        { value: 'vehicle_I', label: 'Golongan I' },
                        { value: 'vehicle_II', label: 'Golongan II' },
                        { value: 'vehicle_III', label: 'Golongan III' },
                        { value: 'vehicle_IV', label: 'Golongan IV' },
                        { value: 'vehicle_V', label: 'Golongan V' },
                        { value: 'vehicle_VI', label: 'Golongan VI' },
                    ];

                    setDropdownOptions({
                        ships: ships || [],
                        categories: categories || [],
                        goods: [...goodsOptions, ...vehicleOptions],
                        wilayahKerja: wilayahKerja || []
                    });
                }
            } catch (error) {
                console.error("Gagal mengambil opsi filter:", error);
            }
        };
        if (!authLoading) {
            fetchDropdownOptions();
        }
    }, [authLoading]);

    const handleSort = (key) => {
        let direction = 'ASC';
        if (sortConfig.key === key && sortConfig.direction === 'ASC') {
            direction = 'DESC';
        }
        setSortConfig({ key, direction });
    };

    const getQueryParams = useCallback((limitOverride = null) => {
        const queryLimit = limitOverride !== null ? limitOverride : (rowsPerPage === 'Semua' ? 0 : parseInt(rowsPerPage, 10));
        const queryPage = limitOverride !== null ? 1 : currentPage;

        const params = {
            page: queryPage,
            limit: queryLimit,
            searchTerm: filters.searchTerm,
            nama_kapal: filters.selectedShip,
            tanggal_awal: filters.startDate,
            tanggal_akhir: filters.endDate,
            kategori: filters.selectedCategory,
            wilker: filters.selectedWilayah,
            sort: sortConfig.direction,
            data_name: sortConfig.key
        };

        const goods = filters.selectedGoods
            .filter(g => g.value.startsWith('good_'))
            .map(g => g.value.split('_')[1]);
            
        const vehicles = filters.selectedGoods
            .filter(g => g.value.startsWith('vehicle_'))
            .map(g => g.value.split('_')[1]);

        if (goods.length > 0) params.nama_muatan = goods;
        if (vehicles.length > 0) params.golongan_kendaraan = vehicles;

        return params;
    }, [currentPage, rowsPerPage, filters, sortConfig]);

    const fetchAllExportData = async () => {
        try {
            const params = getQueryParams(0);
            const response = await axiosInstance.get('/perjalanan/filter', { 
                params,
                paramsSerializer: (params) => {
                    const searchParams = new URLSearchParams();
                    for (const key in params) {
                        const value = params[key];
                        if (Array.isArray(value)) {
                            value.forEach(v => searchParams.append(key, v));
                        } else if (value !== null && value !== undefined && value !== '') {
                            searchParams.append(key, value);
                        }
                    }
                    return searchParams.toString();
                }
            });
            return response.data.datas || [];
        } catch (error) {
            console.error("Gagal mengambil data ekspor:", error);
            return pageData;
        }
    };

    const fetchData = useCallback(async () => {
        if (!authLoading) setLoading(true);

        const queryLimit = (rowsPerPage === 'Semua' ? 0 : parseInt(rowsPerPage, 10));
        
        try {
            const params = getQueryParams();

            const response = await axiosInstance.get('/perjalanan/filter', { 
                params,
                paramsSerializer: (params) => {
                    const searchParams = new URLSearchParams();
                    for (const key in params) {
                        const value = params[key];
                        if (Array.isArray(value)) {
                            value.forEach(v => searchParams.append(key, v));
                        } else if (value !== null && value !== undefined && value !== '') {
                            searchParams.append(key, value);
                        }
                    }
                    return searchParams.toString();
                }
            });

            setPageData(response.data.datas);
            setTotalData(response.data.totalData);

            if (queryLimit > 0) {
                setTotalPages(Math.ceil(response.data.totalData / queryLimit));
            } else {
                setTotalPages(1);
            }

        } catch (error) {
            console.error("Gagal mengambil data:", error);
            toast.error("Gagal mengambil data.");
        } finally {
            if (!authLoading) setLoading(false);
        }
    }, [authLoading, rowsPerPage, getQueryParams]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
        setCurrentPage(1); 
    };

    const handleRowsPerPageChange = (value) => {
        setRowsPerPage(value);
        setCurrentPage(1); 
    };
    
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const refreshData = async () => {
        fetchData();
    };

    function angkaKeHuruf(n) {
        if (!n) return "";
        const angka = ["", "satu", "dua", "tiga", "empat", "lima",
            "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
        if (n < 12) return angka[n];
        if (n < 20) return angka[n - 10] + " belas";
        if (n < 100) return angka[Math.floor(n / 10)] + " puluh " + angkaKeHuruf(n % 10);
        if (n < 200) return "seratus " + angkaKeHuruf(n - 100);
        if (n < 1000) return angka[Math.floor(n / 100)] + " ratus " + angkaKeHuruf(n % 100);
        if (n < 2000) return "seribu " + angkaKeHuruf(n - 1000);
        if (n < 1000000) return angkaKeHuruf(Math.floor(n / 1000)) + " ribu " + angkaKeHuruf(n % 1000);
        return n.toString();
    }

    const getMuatanText = (d, jenis = 'berangkat') => {
        const items = [];

        if (Array.isArray(d.muatans)) {
            d.muatans.forEach(m => {
                if (m.jenis_perjalanan === jenis) {
                    const nama = m.kategori_muatan?.nama_kategori_muatan || '';
                    if (!nama) return;

                    let qtyText = '';
                    const namaLower = nama.toLowerCase();

                    if (m.unit && m.unit > 0) {
                        let unitName = 'unit';
                        if (namaLower.includes('lpg')) unitName = 'tabung';
                        else if (namaLower.includes('bensin') || namaLower.includes('solar') || namaLower.includes('bbm') || namaLower.includes('mitan') || namaLower.includes('avtur') || namaLower.includes('minyak')) unitName = 'liter';
                        else if (namaLower.includes('bata') || namaLower.includes('genteng') || namaLower.includes('biji')) unitName = 'biji';
                        else if (namaLower.includes('semen')) unitName = 'sak';
                        else if (namaLower.includes('air') || namaLower.includes('dus')) unitName = 'dus';
                        else if (namaLower.includes('drum')) unitName = 'drum';
                        else if (namaLower.includes('batang')) unitName = 'batang';
                        else if (namaLower.includes('kelapa') || namaLower.includes('buah')) unitName = 'buah';
                        else if (namaLower.includes('karung')) unitName = 'karung';
                        else if (namaLower.includes('box')) unitName = 'box';
                        else if (namaLower.includes('stell')) unitName = 'stell';

                        qtyText = `${m.unit.toLocaleString('id-ID')} ${unitName}`;
                        if (m.ton && m.ton > 0) {
                            qtyText += ` (${m.ton.toLocaleString('id-ID')} ton)`;
                        }
                    } else if (m.ton && m.ton > 0) {
                        qtyText = `${m.ton.toLocaleString('id-ID')} ton`;
                    } else if (m.m3 && m.m3 > 0) {
                        qtyText = `${m.m3.toLocaleString('id-ID')} m³`;
                    }

                    if (qtyText) {
                        items.push(`${nama} ${qtyText}`);
                    } else {
                        items.push(nama);
                    }
                }
            });
        }

        if (Array.isArray(d.muatan_kendaraan)) {
            d.muatan_kendaraan.forEach(k => {
                if (k.jenis_perjalanan === jenis && k.unit && k.unit > 0) {
                    const golLabel = k.golongan_kendaraan ? `Gol. ${k.golongan_kendaraan}` : 'Kendaraan';
                    items.push(`Kendaraan ${golLabel} ${k.unit.toLocaleString('id-ID')} unit`);
                }
            });
        }

        if (items.length === 0) {
            return 'Nihil';
        }

        return items.join(', ');
    };

    const getMuatanBerangkatText = (d) => getMuatanText(d, 'berangkat');
    const getMuatanDatangText = (d) => getMuatanText(d, 'datang');

    const exportXLSX_BongkarMuat = async () => {
        if (isExporting) {
            toast.error("Harap tunggu, ekspor sebelumnya masih diproses.");
            return;
        }

        console.log("Fungsi Ekspor Bongkar Muat / Ekrek (ExcelJS) dipanggil.");

        setIsExporting(true);
        setIsExportOpen(false);
        const loadingToast = toast.loading("Membuat file Excel Bongkar Muat... Ini mungkin butuh beberapa detik.");

        try {
            const exportRecords = await fetchAllExportData();
            
            const parseSpbNum = (str) => {
                if (!str) return 0;
                const match = String(str).match(/\d+/);
                return match ? parseInt(match[0], 10) : 0;
            };

            exportRecords.sort((a, b) => {
                let numA = parseSpbNum(a.spb?.no_spb);
                let numB = parseSpbNum(b.spb?.no_spb);
                if (numA !== numB) return numB - numA;

                let urutA = parseSpbNum(a.no_urut);
                let urutB = parseSpbNum(b.no_urut);
                if (urutA !== urutB) return urutB - urutA;

                return String(b.spb?.no_spb || '').localeCompare(String(a.spb?.no_spb || ''), undefined, { numeric: true });
            });

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Data Ekrek');

            const cargoSubHeaders = [
                "Gol. I", "Gol. II", "Gol. III", "Gol. IV", "Gol. V", "Bego",
                "Mitan", "Solar (ltr)", "Bensin (ltr)", "krosene", "Avtur", "LPG 3 kg (tb)", "LPG 12 kg (tb)",
                "Beras (ton)", "Jagung (ton)", "Garam (ton)", "Tepung (ton)", "Gula (ton)", "Kedelei", "Palen (ton)", "Kelapa (biji)", "Kcang ijo (ton)", "Sayur & Buah (ton)", "Mangga (krg)", "Rmpt Laut (ton)",
                "Keramik (ton)", "Semen (ton)", "Genteng (biji)", "Batu Bata (b)/Paving", "Pasir (ton)", "Bahan Bangunan Lain (ton)",
                "Barang (ton)", "Barkas (ton)", "Tbg Kosong", "Air Galon Kosong", "Ikan (ton)", "Hewan/Ternak", "Kayu m3", "Pupuk (ton)", "Bagasi Lainnya (ton)"
            ];

            const emptyCargoSlots = new Array(40).fill(null);

            // Define 3 Rows of Symmetrical Multi-Level Headers
            const row1 = [
                "PPK", "No. SPB Asal", "No. SPB", "No. Urut", "Nama Kapal", "Status Kapal", "Jenis Kapal", "Bendera", "Nama Nakhoda", "Banyak Anak Buah Kapal",
                "TIBA", null, null, null, null,
                "BERTOLAK", null, null, null, null, null,
                "Kongsi Atau Milik",
                "Penumpang Dewasa (Datang)", null, null, "Penumpang Anak (Datang)", null, null, "GRAND TOTAL PENUMPANG",
                "Bongkar", ...emptyCargoSlots.slice(1),
                "Penumpang Dewasa (Berangkat)", null, null, "Penumpang Anak (Berangkat)", null, null, "GRAND TOTAL Penumpang",
                "Muat", ...emptyCargoSlots.slice(1),
                "Layanan", "Petugas"
            ];

            const row2 = [
                null, null, null, null, null, null, null, null, null, null,
                "Pada Tanggal", null, null, "Tempat Terakhir Disinggahi", "Bermuatan Atau Kosong",
                "Pada Tanggal", null, null, "Tempat Yang Pertama Disinggahi", "Tempat Tujuan Terakhir", "Bermuatan Atau Kosong",
                null,
                "Dewasa", null, "TOTAL Dewasa (Datang)", "Anak", null, "TOTAL Anak (Datang)", null,
                "Kendaraan", null, null, null, null, null, "Bahan Bakar", null, null, null, null, null, null, "Makanan , Minuman , Dan Produk Olahan", null, null, null, null, null, null, null, null, null, null, null, "Bahan Bangunan", null, null, null, null, null, "Lain-lain", null, null, null, null, null, null, null, null,
                "Dewasa", null, "TOTAL Dewasa (brkt)", "Anak", null, "TOTAL Anak (brkt)", null,
                "Kendaraan", null, null, null, null, null, "Bahan Bakar", null, null, null, null, null, null, "Makanan , Minuman , Dan Produk Olahan", null, null, null, null, null, null, null, null, null, null, null, "Bahan Bangunan", null, null, null, null, null, "Lain-lain", null, null, null, null, null, null, null, null,
                null, null
            ];

            const row3 = [
                null, null, null, null, null, null, null, null, null, null,
                "Tgl", "Bln", "Thn", null, null,
                "Tgl", "Bln", "Thn", null, null, null,
                null,
                "L", "P", null, "L", "P", null, null,
                ...cargoSubHeaders,
                "L", "P", null, "L", "P", null, null,
                ...cargoSubHeaders,
                null, null
            ];

            worksheet.addRow(row1);
            worksheet.addRow(row2);
            worksheet.addRow(row3);

            const extractCargoRowData = (d, jenis) => {
                let gol1 = 0, gol2 = 0, gol3 = 0, gol4 = 0, gol5 = 0, bego = 0;
                let mitan = 0, solar = 0, bensin = 0, krosene = 0, avtur = 0, lpg3 = 0, lpg12 = 0;
                let beras = 0, jagung = 0, garam = 0, tepung = 0, gula = 0, kedelei = 0, palen = 0, kelapa = 0, kcang_ijo = 0, sayur = 0, mangga = 0, rmpt_laut = 0;
                let keramik = 0, semen = 0, genteng = 0, batubata = 0, pasir = 0, bangunan_lain = 0;
                let barang = 0, barkas = 0, tbg_kosong = 0, air = 0, ikan = 0, hewan = 0, kayu = 0, pupuk = 0, bagasi = 0;

                d.muatans?.forEach(m => {
                    if (m.jenis_perjalanan === jenis) {
                        const catName = (m.kategori_muatan?.nama_kategori_muatan || '').toLowerCase();
                        const val = (m.ton || m.unit || m.m3 || 0);

                        if (catName.includes('solar') || catName.includes('bbm') || catName.includes('hsd')) solar += (m.unit || val);
                        else if (catName.includes('bensin') || catName.includes('pertalite') || catName.includes('pertamax')) bensin += (m.unit || val);
                        else if (catName.includes('lpg 3') || catName.includes('lpg3')) lpg3 += (m.unit || val);
                        else if (catName.includes('lpg 12') || catName.includes('lpg12')) lpg12 += (m.unit || val);
                        else if (catName.includes('avtur')) avtur += (m.unit || val);
                        else if (catName.includes('mitan') || catName.includes('minyak tanah') || catName.includes('krosene')) krosene += (m.unit || val);
                        
                        else if (catName.includes('beras')) beras += (m.ton || val);
                        else if (catName.includes('jagung')) jagung += (m.ton || val);
                        else if (catName.includes('garam')) garam += (m.ton || val);
                        else if (catName.includes('tepung')) tepung += (m.ton || val);
                        else if (catName.includes('gula')) gula += (m.ton || val);
                        else if (catName.includes('kedelai') || catName.includes('kedelei')) kedelei += (m.ton || val);
                        else if (catName.includes('palen')) palen += (m.ton || val);
                        else if (catName.includes('kelapa')) kelapa += (m.unit || val);
                        else if (catName.includes('kacang')) kcang_ijo += (m.ton || val);
                        else if (catName.includes('sayur') || catName.includes('buah')) sayur += (m.ton || val);
                        else if (catName.includes('mangga')) mangga += (m.unit || val);
                        else if (catName.includes('rumput') || catName.includes('rmpt')) rmpt_laut += (m.ton || val);

                        else if (catName.includes('keramik')) keramik += (m.ton || val);
                        else if (catName.includes('semen')) semen += (m.unit || m.ton || val);
                        else if (catName.includes('genteng')) genteng += (m.unit || val);
                        else if (catName.includes('bata') || catName.includes('paving')) batubata += (m.unit || val);
                        else if (catName.includes('pasir')) pasir += (m.ton || val);
                        else if (catName.includes('bangunan')) bangunan_lain += (m.ton || val);

                        else if (catName.includes('barkas')) barkas += (m.ton || val);
                        else if (catName.includes('tabung') || catName.includes('tbg')) tbg_kosong += (m.unit || val);
                        else if (catName.includes('air') || catName.includes('galon')) air += (m.unit || m.ton || val);
                        else if (catName.includes('ikan')) ikan += (m.ton || val);
                        else if (catName.includes('hewan') || catName.includes('ternak')) hewan += (m.unit || val);
                        else if (catName.includes('kayu')) kayu += (m.m3 || val);
                        else if (catName.includes('pupuk') || catName.includes('urea')) pupuk += (m.ton || val);
                        else if (catName.includes('barang')) barang += (m.ton || val);
                        else bagasi += (m.ton || m.unit || val);
                    }
                });

                d.muatan_kendaraan?.forEach(k => {
                    if (k.jenis_perjalanan === jenis) {
                        if (k.golongan_kendaraan === 'I') gol1 += (k.unit || 0);
                        else if (k.golongan_kendaraan === 'II') gol2 += (k.unit || 0);
                        else if (k.golongan_kendaraan === 'III') gol3 += (k.unit || 0);
                        else if (k.golongan_kendaraan === 'IV') gol4 += (k.unit || 0);
                        else if (k.golongan_kendaraan === 'V') gol5 += (k.unit || 0);
                        else bego += (k.unit || 0);
                    }
                });

                return [
                    gol1, gol2, gol3, gol4, gol5, bego,
                    mitan, solar, bensin, krosene, avtur, lpg3, lpg12,
                    beras, jagung, garam, tepung, gula, kedelei, palen, kelapa, kcang_ijo, sayur, mangga, rmpt_laut,
                    keramik, semen, genteng, batubata, pasir, bangunan_lain,
                    barang, barkas, tbg_kosong, air, ikan, hewan, kayu, pupuk, bagasi
                ];
            };

            // Add Data Rows
            exportRecords.forEach((d, idx) => {
                const {
                    ppk, spb, no_urut, kapal, nahkoda, jumlah_crew,
                    tanggal_datang, datang_dari, tanggal_berangkat,
                    tempat_singgah, tujuan_akhir, agen,
                    penumpang_turun, penumpang_naik, user
                } = d;

                const safeKapal = kapal || {};
                const safeJeni = safeKapal.jeni || {};
                const safeBendera = safeKapal.bendera || {};
                const safeNahkoda = nahkoda || {};
                const safeSpb = spb || {};
                const safeDatangDari = datang_dari || {};
                const safeTempatSinggah = tempat_singgah || {};
                const safeTujuanAkhir = tujuan_akhir || {};
                const safeAgen = agen || {};

                const tglD = tanggal_datang ? new Date(tanggal_datang) : null;
                const tglD_day = tglD ? tglD.getDate() : '-';
                const tglD_month = tglD ? new Intl.DateTimeFormat("id-ID", { month: "long" }).format(tglD) : '-';
                const tglD_year = tglD ? tglD.getFullYear() : '-';

                const tglB = tanggal_berangkat ? new Date(tanggal_berangkat) : null;
                const tglB_day = tglB ? tglB.getDate() : '-';
                const tglB_month = tglB ? new Intl.DateTimeFormat("id-ID", { month: "long" }).format(tglB) : '-';
                const tglB_year = tglB ? tglB.getFullYear() : '-';

                const pt = penumpang_turun || 0;
                const pn = penumpang_naik || 0;

                const bongkarRowData = extractCargoRowData(d, 'datang');
                const muatRowData = extractCargoRowData(d, 'berangkat');

                const relStatus = d.status_pelayaran_rel;
                const rawStatus = (relStatus?.kode_status || d.status_pelayaran || 'TERBIT').toUpperCase();

                const rowData = [
                    ppk || '-',
                    safeSpb.no_spb_asal || '-',
                    safeSpb.no_spb || '-',
                    no_urut || (idx + 1),
                    safeKapal.nama_kapal || '-',
                    rawStatus,
                    safeJeni.nama_jenis || '-',
                    safeBendera.nama_negara || safeBendera.kode_negara || '-',
                    safeNahkoda.nama_nahkoda || '-',
                    jumlah_crew || 0,
                    // TIBA
                    tglD_day, tglD_month, tglD_year,
                    safeDatangDari.nama_kecamatan || '-',
                    getMuatanDatangText(d),
                    // BERTOLAK
                    tglB_day, tglB_month, tglB_year,
                    safeTempatSinggah.nama_kecamatan || '-',
                    safeTujuanAkhir.nama_kecamatan || '-',
                    getMuatanBerangkatText(d),
                    // AGEN
                    safeAgen.nama_agen || '-',
                    // PENUMPANG DATANG
                    0, 0, pt, 0, 0, 0, pt,
                    // BONGKAR (SYMMETRICAL 40 COLS)
                    ...bongkarRowData,
                    // PENUMPANG BERANGKAT
                    0, 0, pn, 0, 0, 0, pn,
                    // MUAT (SYMMETRICAL 40 COLS)
                    ...muatRowData,
                    // PETUGAS
                    'OTOMATIS',
                    user?.nama_user || 'FERLY DWI DARMA PUTRA, S.SIT., M.M.'
                ];

                worksheet.addRow(rowData);
            });

            // Merges for Header Rows 1-3
            const headerMerges = [
                // General Cols
                { s: { r: 1, c: 1 }, e: { r: 3, c: 1 } },
                { s: { r: 1, c: 2 }, e: { r: 3, c: 2 } },
                { s: { r: 1, c: 3 }, e: { r: 3, c: 3 } },
                { s: { r: 1, c: 4 }, e: { r: 3, c: 4 } },
                { s: { r: 1, c: 5 }, e: { r: 3, c: 5 } },
                { s: { r: 1, c: 6 }, e: { r: 3, c: 6 } },
                { s: { r: 1, c: 7 }, e: { r: 3, c: 7 } },
                { s: { r: 1, c: 8 }, e: { r: 3, c: 8 } },
                { s: { r: 1, c: 9 }, e: { r: 3, c: 9 } },
                { s: { r: 1, c: 10 }, e: { r: 3, c: 10 } },
                // TIBA
                { s: { r: 1, c: 11 }, e: { r: 1, c: 15 } },
                { s: { r: 2, c: 11 }, e: { r: 2, c: 13 } },
                { s: { r: 2, c: 14 }, e: { r: 3, c: 14 } },
                { s: { r: 2, c: 15 }, e: { r: 3, c: 15 } },
                // BERTOLAK
                { s: { r: 1, c: 16 }, e: { r: 1, c: 21 } },
                { s: { r: 2, c: 16 }, e: { r: 2, c: 18 } },
                { s: { r: 2, c: 19 }, e: { r: 3, c: 19 } },
                { s: { r: 2, c: 20 }, e: { r: 3, c: 20 } },
                { s: { r: 2, c: 21 }, e: { r: 3, c: 21 } },
                // AGEN
                { s: { r: 1, c: 22 }, e: { r: 3, c: 22 } },
                // PENUMPANG DATANG
                { s: { r: 1, c: 23 }, e: { r: 1, c: 25 } },
                { s: { r: 2, c: 23 }, e: { r: 2, c: 24 } },
                { s: { r: 1, c: 26 }, e: { r: 1, c: 28 } },
                { s: { r: 2, c: 26 }, e: { r: 2, c: 27 } },
                { s: { r: 1, c: 29 }, e: { r: 3, c: 29 } },

                // BONGKAR (Col 30 to 69)
                { s: { r: 1, c: 30 }, e: { r: 1, c: 69 } },
                { s: { r: 2, c: 30 }, e: { r: 2, c: 35 } }, // Kendaraan (6)
                { s: { r: 2, c: 36 }, e: { r: 2, c: 42 } }, // Bahan Bakar (7)
                { s: { r: 2, c: 43 }, e: { r: 2, c: 54 } }, // Makanan (12)
                { s: { r: 2, c: 55 }, e: { r: 2, c: 60 } }, // Bahan Bangunan (6)
                { s: { r: 2, c: 61 }, e: { r: 2, c: 69 } }, // Lain-lain (9)

                // PENUMPANG BERANGKAT (Col 70 to 76)
                { s: { r: 1, c: 70 }, e: { r: 1, c: 72 } },
                { s: { r: 2, c: 70 }, e: { r: 2, c: 71 } },
                { s: { r: 1, c: 73 }, e: { r: 1, c: 75 } },
                { s: { r: 2, c: 73 }, e: { r: 2, c: 74 } },
                { s: { r: 1, c: 76 }, e: { r: 3, c: 76 } },

                // MUAT (Col 77 to 116) - EXACT MATCH FOR BONGKAR!
                { s: { r: 1, c: 77 }, e: { r: 1, c: 116 } },
                { s: { r: 2, c: 77 }, e: { r: 2, c: 82 } },  // Kendaraan (6)
                { s: { r: 2, c: 83 }, e: { r: 2, c: 89 } },  // Bahan Bakar (7)
                { s: { r: 2, c: 90 }, e: { r: 2, c: 101 } }, // Makanan (12)
                { s: { r: 2, c: 102 }, e: { r: 2, c: 107 } },// Bahan Bangunan (6)
                { s: { r: 2, c: 108 }, e: { r: 2, c: 116 } },// Lain-lain (9)

                // PETUGAS
                { s: { r: 1, c: 117 }, e: { r: 3, c: 117 } },
                { s: { r: 1, c: 118 }, e: { r: 3, c: 118 } }
            ];

            headerMerges.forEach(m => {
                worksheet.mergeCells(m.s.r, m.s.c, m.e.r, m.e.c);
            });

            // Apply Fills & Formatting for Header Rows
            const borderStyle = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            const alignmentCenter = { vertical: 'middle', horizontal: 'center', wrapText: true };

            const fillYellow = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
            const fillRed = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            const fillPink = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF007F' } };
            const fillBlue = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } };
            const fillGreen = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } };
            const fillOrange = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFED7D31' } };
            const fillBongkarPink = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };
            const fillMuatLightBlue = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
            const fillStatusRed = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
            const fontStatusRed = { bold: true, color: { argb: 'FF9C0006' } };
            const fillStatusAmber = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
            const fontStatusAmber = { bold: true, color: { argb: 'FF9C6500' } };
            const fillStatusBlue = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } };
            const fontStatusBlue = { bold: true, color: { argb: 'FF1F4E78' } };
            const fillStatusPurple = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8D8F8' } };
            const fontStatusPurple = { bold: true, color: { argb: 'FF4A154B' } };

            worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                const statusVal = String(row.getCell(6).value || '').toUpperCase();
                let statusStyle = null;
                if (statusVal.includes('BATAL')) {
                    statusStyle = { fill: fillStatusAmber, font: fontStatusAmber };
                } else if (statusVal.includes('RUSAK')) {
                    statusStyle = { fill: fillStatusRed, font: fontStatusRed };
                } else if (statusVal.includes('BLUE')) {
                    statusStyle = { fill: fillStatusBlue, font: fontStatusBlue };
                } else if (statusVal.includes('PURPLE')) {
                    statusStyle = { fill: fillStatusPurple, font: fontStatusPurple };
                }

                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    cell.border = borderStyle;
                    cell.alignment = alignmentCenter;

                    if (rowNumber <= 3) {
                        cell.font = { bold: true, size: 9 };

                        if (colNumber <= 10) {
                            cell.fill = fillYellow;
                        } else if (colNumber <= 15) {
                            cell.fill = rowNumber === 1 ? fillRed : fillPink;
                            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
                        } else if (colNumber <= 21) {
                            cell.fill = fillBlue;
                            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
                        } else if (colNumber === 22) {
                            cell.fill = fillYellow;
                        } else if (colNumber <= 29) {
                            cell.fill = colNumber % 2 === 0 ? fillGreen : fillOrange;
                        } else if (colNumber <= 69) {
                            cell.fill = fillBongkarPink;
                        } else if (colNumber <= 76) {
                            cell.fill = colNumber % 2 === 0 ? fillGreen : fillOrange;
                        } else if (colNumber <= 116) {
                            cell.fill = fillMuatLightBlue;
                        } else {
                            cell.fill = fillYellow;
                        }
                    } else {
                        if (statusStyle) {
                            cell.fill = statusStyle.fill;
                            cell.font = statusStyle.font;
                        }
                    }
                });
            });

            // Set column widths
            worksheet.columns.forEach((col) => {
                col.width = 12;
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(blob, `laporan_bongkar_muat_${new Date().toISOString().slice(0, 10)}.xlsx`);

            toast.dismiss(loadingToast);
            toast.success("Ekspor Laporan Bongkar Muat berhasil!");

        } catch (err) {
            console.error("Error writing excel buffer", err);
            toast.dismiss(loadingToast);
            toast.error("Gagal membuat file Excel Bongkar Muat.");
        } finally {
            setIsExporting(false);
        }
    };

    const exportXLSX = async () => {
        if (isExporting) {
            toast.error("Harap tunggu, ekspor sebelumnya masih diproses.");
            return;
        }
        console.log("Fungsi Ekspor Laporan Register (ExcelJS) dipanggil.");
        setIsExporting(true);
        setIsExportOpen(false);
        const loadingToast = toast.loading("Membuat file Excel Register... Ini mungkin butuh beberapa detik.");
        try {
            const exportRecords = await fetchAllExportData();
            const parseSpbNum = (str) => { if (!str) return 0; const match = String(str).match(/\d+/); return match ? parseInt(match[0], 10) : 0; };
            exportRecords.sort((a, b) => {
                let numA = parseSpbNum(a.spb?.no_spb); let numB = parseSpbNum(b.spb?.no_spb);
                if (numA !== numB) return numB - numA;
                return String(b.spb?.no_spb || '').localeCompare(String(a.spb?.no_spb || ''), undefined, { numeric: true });
            });
            let data = exportRecords.map(d => {
                const { tanggal_clearance, ppk, spb, no_urut, kapal, nahkoda, jumlah_crew, kedudukan_kapal, tanggal_datang, datang_dari, tanggal_berangkat, tempat_singgah, tujuan_akhir, agen, pukul_agen_clearance, pukul_kapal_berangkat, status_muatan_berangkat } = d;
                const safeKapal = kapal || {}; const safeJeni = safeKapal.jeni || {}; const safeBendera = safeKapal.bendera || {};
                const safeNahkoda = nahkoda || {}; const safeSpb = spb || {}; const safeKedudukan = kedudukan_kapal || {};
                const safeDatangDari = datang_dari || {}; const safeTempatSinggah = tempat_singgah || {};
                const safeTujuanAkhir = tujuan_akhir || {}; const safeAgen = agen || {};
                const tanggalClearance = new Date(tanggal_clearance);
                const tanggalOnlyClearance = tanggalClearance.getDate();
                const bulanClearance = new Intl.DateTimeFormat('id-ID', { month: "long" }).format(tanggalClearance);
                const angkaBulan = tanggalClearance.getMonth() + 1;
                const angkaHuruf = angkaKeHuruf(jumlah_crew);
                const tanggalDatang = new Date(tanggal_datang);
                const tanggalOnlyDatang = tanggalDatang.getDate();
                const bulanDatang = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(tanggalDatang);
                const tahunDatang = tanggalDatang.getFullYear();
                const tanggalBerangkat = new Date(tanggal_berangkat);
                const tanggalOnlyBerangkat = tanggalBerangkat.getDate();
                const bulanBerangkat = tanggalBerangkat.getMonth() + 1;
                const tahunBerangkat = tanggalBerangkat.getFullYear();
                const tglBerangkatFormatted = tanggalBerangkat.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const relStatus = d.status_pelayaran_rel;
                const rawStatus = (relStatus?.kode_status || d.status_pelayaran || 'TERBIT').toUpperCase();

                return {
                    "REGISTER BULAN": bulanClearance || '-',
                    "ANGKA BULAN": angkaBulan || '-',
                    "PPK": ppk || '-',
                    "NO. SPB ASAL": safeSpb.no_spb_asal || '-',
                    "NO. SPB": safeSpb.no_spb || '-',
                    "NO. URUT": no_urut || '-',
                    "NAMA KAPAL": safeKapal.nama_kapal || '-',
                    "STATUS KAPAL": rawStatus,
                    "JENIS KAPAL": safeJeni.nama_jenis || '-',
                    "BENDERA": safeBendera.nama_negara || safeBendera.kode_negara || '-',
                    "NAHKODA": safeNahkoda.nama_nahkoda || '-',
                    "CREW": jumlah_crew || 0,
                    "TERBILANG": `(${angkaHuruf.toUpperCase()})`,
                    "GT": safeKapal.gt || 0,
                    "NT": safeKapal.nt || 0,
                    "NO": "NO.",
                    "SELAR": safeKapal.nomor_selar || '-',
                    "TANDA SELAR": safeKapal.tanda_selar || '-',
                    "NOMOR IMO": safeKapal.nomor_imo || '-',
                    "CALL SIGN": safeKapal.call_sign || '-',
                    "KEDUDUKAN KAPAL": safeKedudukan.nama_kabupaten || '-',
                    "TGL DTG": tanggalOnlyDatang || '-',
                    "BLN DTG": bulanDatang || '-',
                    "THN DTG": tahunDatang || '-',
                    "DATANG DARI": safeDatangDari.nama_kecamatan || '-',
                    "TGL BRKT": tanggalOnlyBerangkat || '-',
                    "BLN BRKT": bulanBerangkat || '-',
                    "THN BRKT": tahunBerangkat || '-',
                    "TEMPAT YANG PERTAMA DISINGGAHI": safeTempatSinggah.nama_kecamatan || '-',
                    "TUJUAN TERAKHIR": safeTujuanAkhir.nama_kecamatan || '-',
                    "AGEN": safeAgen.nama_agen || '-',
                    "TANGGAL CLEARANCE": tanggalOnlyClearance || '-',
                    "PUKUL AGEN CLEARANCE": pukul_agen_clearance || '-',
                    "TANGGAL BERANGKAT": tglBerangkatFormatted || '-',
                    "PUKUL KAPAL BERANGKAT": pukul_kapal_berangkat || '-',
                    "MUATAN BERANGKAT": getMuatanBerangkatText(d)
                };
            });
            if (data.length === 0) { toast.error("Tidak ada data untuk diekspor."); setIsExporting(false); toast.dismiss(loadingToast); return; }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Register Bulan');
            const dataKeys = Object.keys(data[0]);
            worksheet.columns = dataKeys.map(key => ({ header: key, key: key }));
            worksheet.addRows(data);
            const colWidths = dataKeys.map((key, index) => {
                let maxLength = worksheet.columns[index].header.length;
                data.forEach(row => { const cl = row[key] ? String(row[key]).length : 0; if (cl > maxLength) maxLength = cl; });
                return maxLength + 2;
            });
            worksheet.columns.forEach((col, i) => { col.width = colWidths[i]; });
            const borderStyle = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            const alignmentStyle = { vertical: 'middle', horizontal: 'center' };
            const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
            const fillStatusRed = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
            const fontStatusRed = { bold: true, color: { argb: 'FF9C0006' } };
            const fillStatusAmber = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
            const fontStatusAmber = { bold: true, color: { argb: 'FF9C6500' } };
            const fillStatusBlue = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } };
            const fontStatusBlue = { bold: true, color: { argb: 'FF1F4E78' } };
            const fillStatusPurple = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8D8F8' } };
            const fontStatusPurple = { bold: true, color: { argb: 'FF4A154B' } };

            worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                const statusVal = String(row.getCell(8).value || '').toUpperCase();
                let statusStyle = null;
                if (statusVal.includes('BATAL')) {
                    statusStyle = { fill: fillStatusAmber, font: fontStatusAmber };
                } else if (statusVal.includes('RUSAK')) {
                    statusStyle = { fill: fillStatusRed, font: fontStatusRed };
                } else if (statusVal.includes('BLUE')) {
                    statusStyle = { fill: fillStatusBlue, font: fontStatusBlue };
                } else if (statusVal.includes('PURPLE')) {
                    statusStyle = { fill: fillStatusPurple, font: fontStatusPurple };
                }

                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    cell.border = borderStyle; cell.alignment = alignmentStyle;
                    if (rowNumber === 1) {
                        cell.font = { bold: true };
                        cell.fill = headerFill;
                    } else if (statusStyle) {
                        cell.fill = statusStyle.fill;
                        cell.font = statusStyle.font;
                    }
                });
            });
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(blob, `laporan_register_${new Date().toISOString().slice(0, 10)}.xlsx`);
            toast.dismiss(loadingToast);
            toast.success("Ekspor Laporan Register berhasil!");
        } catch (err) {
            console.error("Error writing excel buffer", err);
            toast.dismiss(loadingToast);
            toast.error("Gagal membuat file Excel Register.");
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setIsExportOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (authLoading) {
        return <p className="text-center text-gray-500 py-10">Memuat data...</p>
    }

    return (
        <>
            <div className="screen-only">
                <div className="p-4 md:p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-800">Daftar Clearance</h1>
                        <div className="flex items-center gap-3">
                            <div className="relative" ref={exportRef}>
                                <button
                                    onClick={() => setIsExportOpen(!isExportOpen)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                                >
                                    Ekspor
                                </button>
                                {isExportOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border z-20"> 
                                        <ul className="p-1">
                                            <li 
                                                onClick={exportXLSX} 
                                                className={`rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                Ekspor Laporan Register (XLSX)
                                            </li>
                                            <li 
                                                onClick={exportXLSX_BongkarMuat} 
                                                className={`rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                Ekspor Laporan Bongkar Muat (XLSX)
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <Link to="/clearance/add" className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors whitespace-nowrap">
                                + Tambah Data
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="grid grid-cols-1 items-end gap-4 border-b border-gray-200 p-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex flex-col md:flex-row justify-between lg:col-span-4 gap-4">
                                <div className="flex-1">
                                    <SearchBar
                                        searchTerm={filters.searchTerm}
                                        setSearchTerm={(value) => handleFilterChange('searchTerm', value)}
                                        placeholder="Cari SPB, kapal, agen, tujuan..."
                                    />
                                </div>
                                {isUserPusat && (
                                    <div className="w-full md:w-60">
                                        <FilterDropdown
                                            options={dropdownOptions.wilayahKerja}
                                            selectedValue={filters.selectedWilayah}
                                            setSelectedValue={(value) => handleFilterChange('selectedWilayah', value)}
                                            placeholder="Semua Wilayah Kerja"
                                        />
                                    </div>
                                )}
                            </div>
                            <FilterDropdown
                                options={dropdownOptions.ships}
                                selectedValue={filters.selectedShip}
                                setSelectedValue={(value) => handleFilterChange('selectedShip', value)}
                                placeholder="Semua Kapal"
                            />
                            <FilterDropdown
                                options={dropdownOptions.categories}
                                selectedValue={filters.selectedCategory}
                                setSelectedValue={(value) => handleFilterChange('selectedCategory', value)}
                                placeholder="Kategori Barang"
                            />
                            <div className="flex flex-col sm:flex-row items-center gap-2 lg:col-span-2">
                                <InputField type="date" name="startDate" value={filters.startDate} onChange={(e) => handleFilterChange(e.target.name, e.target.value)} />
                                <span className="text-gray-500 hidden sm:block">-</span>
                                <InputField type="date" name="endDate" value={filters.endDate} onChange={(e) => handleFilterChange(e.target.name, e.target.value)} />
                            </div>

                            <div className="lg:col-span-4">
                                <Select
                                    isMulti
                                    name="selectedGoods"
                                    options={dropdownOptions.goods}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    placeholder="Pilih satu atau lebih barang/kendaraan..."
                                    value={filters.selectedGoods}
                                    onChange={(selectedOptions) => handleFilterChange('selectedGoods', selectedOptions || [])}
                                    styles={customStyles}
                                />
                            </div>
                        </div>
                        
                        {loading ? (
                            <p className="text-center text-gray-500 p-10">Memuat data...</p>
                        ) : (
                            <ClearanceTable 
                                clearanceItems={pageData} 
                                onSuccess={refreshData} 
                                onSort={handleSort}
                                sortConfig={sortConfig}
                            />
                        )}

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                            <div className="flex items-center gap-2 text-sm">
                                <span>Tampilkan</span>
                                <FilterDropdown
                                    direction="up"
                                    selectedValue={String(rowsPerPage)}
                                    setSelectedValue={handleRowsPerPageChange}
                                    options={rowsPerPageOptions}
                                />
                                <span>baris</span>
                            </div>
                            
                            <span className="text-sm text-gray-700">
                                Total {totalData} data
                            </span>

                            {totalPages > 1 && !loading && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    paginate={paginate}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Clearance;