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
    control: (styles) => ({ ...styles, backgroundColor: 'transparent' }),
    multiValue: (styles) => ({ ...styles, backgroundColor: 'var(--tw-select-multivalue-bg, #374151)' }),
    multiValueLabel: (styles) => ({ ...styles, color: '#F3F4F6' }),
    multiValueRemove: (styles) => ({ ...styles, color: '#9CA3AF', ':hover': { backgroundColor: '#EF4444', color: 'white' } }),
};

const rowsPerPageOptions = ['5', '10', '20', '50', 'Semua'];

// ExcelJS Styling Constants
const BORDER_THIN = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
const ALIGN_CENTER = { vertical: 'middle', horizontal: 'center', wrapText: true };
const HEADER_FILL_GRAY = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };

const FILL_YELLOW = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
const FILL_RED = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
const FILL_PINK = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF007F' } };
const FILL_BLUE = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } };
const FILL_GREEN = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } };
const FILL_ORANGE = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFED7D31' } };
const FILL_BONGKAR_PINK = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };
const FILL_MUAT_LIGHT_BLUE = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };

const STATUS_STYLES = {
    BATAL: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }, font: { bold: true, color: { argb: 'FF9C6500' } } },
    RUSAK: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } }, font: { bold: true, color: { argb: 'FF9C0006' } } },
    BLUE: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } }, font: { bold: true, color: { argb: 'FF1F4E78' } } },
    PURPLE: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8D8F8' } }, font: { bold: true, color: { argb: 'FF4A154B' } } },
};

const getStatusStyle = (statusStr) => {
    const s = String(statusStr || '').toUpperCase();
    for (const key of ['BATAL', 'RUSAK', 'BLUE', 'PURPLE']) {
        if (s.includes(key)) return STATUS_STYLES[key];
    }
    return null;
};

const CARGO_SUB_HEADERS = [
    "Gol. I", "Gol. II", "Gol. III", "Gol. IV", "Gol. V", "Bego",
    "Mitan", "Solar (ltr)", "Bensin (ltr)", "krosene", "Avtur", "LPG 3 kg (tb)", "LPG 12 kg (tb)",
    "Beras (ton)", "Jagung (ton)", "Garam (ton)", "Tepung (ton)", "Gula (ton)", "Kedelei", "Palen (ton)", "Kelapa (biji)", "Kcang ijo (ton)", "Sayur & Buah (ton)", "Mangga (krg)", "Rmpt Laut (ton)",
    "Keramik (ton)", "Semen (ton)", "Genteng (biji)", "Batu Bata (b)/Paving", "Pasir (ton)", "Bahan Bangunan Lain (ton)",
    "Barang (ton)", "Barkas (ton)", "Tbg Kosong", "Air Galon Kosong", "Ikan (ton)", "Hewan/Ternak", "Kayu m3", "Pupuk (ton)", "Bagasi Lainnya (ton)"
];

const CARGO_COL_INDEX_MAP = {
    'Gol. I': 0, 'Gol. II': 1, 'Gol. III': 2, 'Gol. IV': 3, 'Gol. V': 4, 'Bego': 5,
    'Mtan': 6, 'Solar (ltr)': 7, 'Bensin (ltr)': 8, 'krosene': 9, 'Avtur': 10, 'LPG 3 kg (tb)': 11, 'LPG 12 kg (tb)': 12,
    'Beras (ton)': 13, 'Jagung (ton)': 14, 'Garam (ton)': 15, 'Tepung (ton)': 16, 'Gula (ton)': 17, 'Kedelei': 18, 'Palen (ton)': 19, 'Kelapa (biji)': 20, 'Kcang ijo (ton)': 21, 'Sayur & Buah (ton)': 22, 'Mangga (kg)': 23, 'Mangga (krg)': 23, 'Rmpt Laut (ton)': 24,
    'Keramik (ton)': 25, 'Semen (ton)': 26, 'Genteng (biji)': 27, 'Batu Bata (bj)/Paving': 28, 'Batu Bata (b)/Paving': 28, 'Pasir (ton)': 29, 'Bahan Bangunan Lain (ton)': 30,
    'Barang (ton)': 31, 'Barkas (ton)': 32, 'Berkas (ton)': 32, 'Tbg Kosong': 33, 'Air Galon Kosong': 34, 'Ikan (ton)': 35, 'Hewan/Ternak': 36, 'Kayu m3': 37, 'Pupuk (ton)': 38, 'Bagasi Lainnya (ton)': 39
};

const BONGKAR_MUAT_MERGES = [
    [1, 1, 3, 1], [1, 2, 3, 2], [1, 3, 3, 3], [1, 4, 3, 4], [1, 5, 3, 5], [1, 6, 3, 6], [1, 7, 3, 7], [1, 8, 3, 8], [1, 9, 3, 9], [1, 10, 3, 10],
    [1, 11, 1, 15], [2, 11, 2, 13], [2, 14, 3, 14], [2, 15, 3, 15],
    [1, 16, 1, 21], [2, 16, 2, 18], [2, 19, 3, 19], [2, 20, 3, 20], [2, 21, 3, 21],
    [1, 22, 3, 22],
    [1, 23, 1, 25], [2, 23, 2, 24], [1, 26, 1, 28], [2, 26, 2, 27], [1, 29, 3, 29],
    [1, 30, 1, 69], [2, 30, 2, 35], [2, 36, 2, 42], [2, 43, 2, 54], [2, 55, 2, 60], [2, 61, 2, 69],
    [1, 70, 1, 72], [2, 70, 2, 71], [1, 73, 1, 75], [2, 73, 2, 74], [1, 76, 3, 76],
    [1, 77, 1, 116], [2, 77, 2, 82], [2, 83, 2, 89], [2, 90, 2, 101], [2, 102, 2, 107], [2, 108, 2, 116],
    [1, 117, 3, 117], [1, 118, 3, 118]
];

const fetchPerjalananData = async (params) => {
    const res = await axiosInstance.get('/perjalanan/filter', {
        params,
        paramsSerializer: (p) => {
            const searchParams = new URLSearchParams();
            for (const key in p) {
                const val = p[key];
                if (Array.isArray(val)) val.forEach(v => searchParams.append(key, v));
                else if (val !== null && val !== undefined && val !== '') searchParams.append(key, val);
            }
            return searchParams.toString();
        }
    });
    return res.data;
};

const extractCargoRowData = (d, jenis) => {
    const slots = new Array(40).fill(0);

    d.muatans?.forEach(m => {
        if (m.jenis_perjalanan === jenis) {
            const targetCol = (m.kategori_muatan?.excel_column_name || '').trim();
            const catName = (m.kategori_muatan?.nama_kategori_muatan || '').toLowerCase();
            const val = (m.ton || m.unit || m.m3 || 0);

            if (CARGO_COL_INDEX_MAP[targetCol] !== undefined) {
                slots[CARGO_COL_INDEX_MAP[targetCol]] += (m.unit || m.ton || val);
            } else {
                if (catName.includes('solar') || catName.includes('bbm')) slots[7] += (m.unit || val);
                else if (catName.includes('bensin') || catName.includes('pertalite')) slots[8] += (m.unit || val);
                else if (catName.includes('lpg 3')) slots[11] += (m.unit || val);
                else if (catName.includes('lpg 12')) slots[12] += (m.unit || val);
                else if (catName.includes('sayur') || catName.includes('buah')) slots[22] += (m.ton || val);
                else if (catName.includes('bangunan')) slots[30] += (m.ton || val);
                else if (catName.includes('tabung') || catName.includes('tbg')) slots[33] += (m.unit || val);
                else slots[39] += (m.ton || m.unit || val);
            }
        }
    });

    d.muatan_kendaraan?.forEach(k => {
        if (k.jenis_perjalanan === jenis) {
            const golMap = { 'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4 };
            const idx = golMap[k.golongan_kendaraan] !== undefined ? golMap[k.golongan_kendaraan] : 5;
            slots[idx] += (k.unit || 0);
        }
    });

    return slots;
};

function Clearance() {
    const [pageData, setPageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();

    const [dropdownOptions, setDropdownOptions] = useState({
        ships: [], categories: [], goods: [], wilayahKerja: []
    });

    const [filters, setFilters] = useState({
        searchTerm: '', selectedShip: '', startDate: '', endDate: '',
        selectedCategory: '', selectedGoods: [], selectedWilayah: '',
    });

    const [sortConfig, setSortConfig] = useState({ key: 'no_spb', direction: 'DESC' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState('5');
    const [totalData, setTotalData] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const exportRef = useRef(null);

    const isUserPusat = useMemo(() => {
        return user?.wilayah_kerja?.toLowerCase() === 'pusat';
    }, [user]);

    useEffect(() => {
        const fetchDropdownOptions = async () => {
            try {
                const response = await axiosInstance.get('/perjalanan/filter-options');
                if (response.data) {
                    const { ships, categories, goods, wilayahKerja } = response.data;
                    const goodsOptions = (goods || []).map(g => ({ value: `good_${g}`, label: g }));
                    const vehicleOptions = ['I', 'II', 'III', 'IV', 'V', 'VI'].map(g => ({ value: `vehicle_${g}`, label: `Golongan ${g}` }));

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
        if (!authLoading) fetchDropdownOptions();
    }, [authLoading]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC'
        }));
    };

    const getQueryParams = useCallback((limitOverride = null) => {
        const queryLimit = limitOverride !== null ? limitOverride : (rowsPerPage === 'Semua' ? 0 : parseInt(rowsPerPage, 10));
        const queryPage = limitOverride !== null ? 1 : currentPage;

        const params = {
            page: queryPage, limit: queryLimit,
            searchTerm: filters.searchTerm, nama_kapal: filters.selectedShip,
            tanggal_awal: filters.startDate, tanggal_akhir: filters.endDate,
            kategori: filters.selectedCategory, wilker: filters.selectedWilayah,
            sort: sortConfig.direction, data_name: sortConfig.key
        };

        const goods = filters.selectedGoods.filter(g => g.value.startsWith('good_')).map(g => g.value.split('_')[1]);
        const vehicles = filters.selectedGoods.filter(g => g.value.startsWith('vehicle_')).map(g => g.value.split('_')[1]);

        if (goods.length > 0) params.nama_muatan = goods;
        if (vehicles.length > 0) params.golongan_kendaraan = vehicles;

        return params;
    }, [currentPage, rowsPerPage, filters, sortConfig]);

    const fetchAllExportData = async () => {
        try {
            const data = await fetchPerjalananData(getQueryParams(0));
            return data.datas || [];
        } catch (error) {
            console.error("Gagal mengambil data ekspor:", error);
            return pageData;
        }
    };

    const fetchData = useCallback(async () => {
        if (!authLoading) setLoading(true);
        const queryLimit = (rowsPerPage === 'Semua' ? 0 : parseInt(rowsPerPage, 10));
        try {
            const resData = await fetchPerjalananData(getQueryParams());
            setPageData(resData.datas);
            setTotalData(resData.totalData);
            setTotalPages(queryLimit > 0 ? Math.ceil(resData.totalData / queryLimit) : 1);
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
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const handleRowsPerPageChange = (value) => {
        setRowsPerPage(value);
        setCurrentPage(1);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const refreshData = async () => fetchData();

    function angkaKeHuruf(n) {
        if (!n) return "";
        const angka = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
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
                        if (m.ton && m.ton > 0) qtyText += ` (${m.ton.toLocaleString('id-ID')} ton)`;
                    } else if (m.ton && m.ton > 0) {
                        qtyText = `${m.ton.toLocaleString('id-ID')} ton`;
                    } else if (m.m3 && m.m3 > 0) {
                        qtyText = `${m.m3.toLocaleString('id-ID')} m³`;
                    }

                    items.push(qtyText ? `${nama} ${qtyText}` : nama);
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

        return items.length === 0 ? 'Nihil' : items.join(', ');
    };

    const getMuatanBerangkatText = (d) => getMuatanText(d, 'berangkat');
    const getMuatanDatangText = (d) => getMuatanText(d, 'datang');

    const exportXLSX_BongkarMuat = async () => {
        if (isExporting) {
            toast.error("Harap tunggu, ekspor sebelumnya masih diproses.");
            return;
        }
        setIsExporting(true);
        setIsExportOpen(false);
        const loadingToast = toast.loading("Membuat file Excel Bongkar Muat... Ini mungkin butuh beberapa detik.");

        try {
            const exportRecords = await fetchAllExportData();
            const parseSpbNum = (str) => str ? (parseInt(String(str).match(/\d+/)?.[0] || 0, 10)) : 0;

            exportRecords.sort((a, b) => {
                let numA = parseSpbNum(a.spb?.no_spb), numB = parseSpbNum(b.spb?.no_spb);
                if (numA !== numB) return numB - numA;
                let urutA = parseSpbNum(a.no_urut), urutB = parseSpbNum(b.no_urut);
                if (urutA !== urutB) return urutB - urutA;
                return String(b.spb?.no_spb || '').localeCompare(String(a.spb?.no_spb || ''), undefined, { numeric: true });
            });

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Data Ekrek');
            worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 3 }];
            const emptyCargoSlots = new Array(40).fill(null);

            const row1 = [
                "PPK", "No. SPB Asal", "No. SPB", "No. Urut", "Nama Kapal", "Status Kapal", "Jenis Kapal", "Bendera", "Nama Nakhoda", "Banyak Anak Buah Kapal",
                "TIBA", null, null, null, null, "BERTOLAK", null, null, null, null, null, "Kongsi Atau Milik",
                "Penumpang Dewasa (Datang)", null, null, "Penumpang Anak (Datang)", null, null, "GRAND TOTAL PENUMPANG",
                "Bongkar", ...emptyCargoSlots.slice(1),
                "Penumpang Dewasa (Berangkat)", null, null, "Penumpang Anak (Berangkat)", null, null, "GRAND TOTAL Penumpang",
                "Muat", ...emptyCargoSlots.slice(1), "Layanan", "Petugas"
            ];

            const row2 = [
                null, null, null, null, null, null, null, null, null, null,
                "Pada Tanggal", null, null, "Tempat Terakhir Disinggahi", "Bermuatan Atau Kosong",
                "Pada Tanggal", null, null, "Tempat Yang Pertama Disinggahi", "Tempat Tujuan Terakhir", "Bermuatan Atau Kosong", null,
                "Dewasa", null, "TOTAL Dewasa (Datang)", "Anak", null, "TOTAL Anak (Datang)", null,
                "Kendaraan", null, null, null, null, null, "Bahan Bakar", null, null, null, null, null, null, "Makanan , Minuman , Dan Produk Olahan", null, null, null, null, null, null, null, null, null, null, null, "Bahan Bangunan", null, null, null, null, null, "Lain-lain", null, null, null, null, null, null, null, null,
                "Dewasa", null, "TOTAL Dewasa (brkt)", "Anak", null, "TOTAL Anak (brkt)", null,
                "Kendaraan", null, null, null, null, null, "Bahan Bakar", null, null, null, null, null, null, "Makanan , Minuman , Dan Produk Olahan", null, null, null, null, null, null, null, null, null, null, null, "Bahan Bangunan", null, null, null, null, null, "Lain-lain", null, null, null, null, null, null, null, null,
                null, null
            ];

            const row3 = [
                null, null, null, null, null, null, null, null, null, null,
                "Tgl", "Bln", "Thn", null, null, "Tgl", "Bln", "Thn", null, null, null, null,
                "L", "P", null, "L", "P", null, null, ...CARGO_SUB_HEADERS,
                "L", "P", null, "L", "P", null, null, ...CARGO_SUB_HEADERS,
                null, null
            ];

            worksheet.addRow(row1); worksheet.addRow(row2); worksheet.addRow(row3);

            exportRecords.forEach((d, idx) => {
                const { ppk, spb, no_urut, kapal, nahkoda, jumlah_crew, tanggal_datang, datang_dari, tanggal_berangkat, tempat_singgah, tujuan_akhir, agen, penumpang_turun, penumpang_naik, user } = d;
                const safeKapal = kapal || {}, safeJeni = safeKapal.jeni || {}, safeBendera = safeKapal.bendera || {};
                const safeNahkoda = nahkoda || {}, safeSpb = spb || {}, safeDatangDari = datang_dari || {};
                const safeTempatSinggah = tempat_singgah || {}, safeTujuanAkhir = tujuan_akhir || {}, safeAgen = agen || {};

                const tglD = tanggal_datang ? new Date(tanggal_datang) : null;
                const tglD_day = tglD ? tglD.getDate() : '-', tglD_month = tglD ? new Intl.DateTimeFormat("id-ID", { month: "long" }).format(tglD) : '-', tglD_year = tglD ? tglD.getFullYear() : '-';

                const tglB = tanggal_berangkat ? new Date(tanggal_berangkat) : null;
                const tglB_day = tglB ? tglB.getDate() : '-', tglB_month = tglB ? new Intl.DateTimeFormat("id-ID", { month: "long" }).format(tglB) : '-', tglB_year = tglB ? tglB.getFullYear() : '-';

                const pt = penumpang_turun || 0, pn = penumpang_naik || 0;
                const rawStatus = (d.status_pelayaran_rel?.kode_status || d.status_pelayaran || 'TERBIT').toUpperCase();

                worksheet.addRow([
                    ppk || '-', safeSpb.no_spb_asal || '-', safeSpb.no_spb || '-', no_urut || (idx + 1),
                    safeKapal.nama_kapal || '-', rawStatus, safeJeni.nama_jenis || '-', safeBendera.nama_negara || safeBendera.kode_negara || '-',
                    safeNahkoda.nama_nahkoda || '-', jumlah_crew || 0,
                    tglD_day, tglD_month, tglD_year, safeDatangDari.nama_kecamatan || '-', getMuatanDatangText(d),
                    tglB_day, tglB_month, tglB_year, safeTempatSinggah.nama_kecamatan || '-', safeTujuanAkhir.nama_kecamatan || '-', getMuatanBerangkatText(d),
                    safeAgen.nama_agen || '-',
                    0, 0, pt, 0, 0, 0, pt,
                    ...extractCargoRowData(d, 'datang'),
                    0, 0, pn, 0, 0, 0, pn,
                    ...extractCargoRowData(d, 'berangkat'),
                    'OTOMATIS', user?.nama_user || 'FERLY DWI DARMA PUTRA, S.SIT., M.M.'
                ]);
            });

            BONGKAR_MUAT_MERGES.forEach(([r1, c1, r2, c2]) => worksheet.mergeCells(r1, c1, r2, c2));

            worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                const statusStyle = getStatusStyle(row.getCell(6).value);

                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    cell.border = BORDER_THIN;
                    cell.alignment = ALIGN_CENTER;

                    if (rowNumber <= 3) {
                        cell.font = { bold: true, size: 9 };
                        if (colNumber <= 10) cell.fill = FILL_YELLOW;
                        else if (colNumber <= 15) { cell.fill = rowNumber === 1 ? FILL_RED : FILL_PINK; cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 }; }
                        else if (colNumber <= 21) { cell.fill = FILL_BLUE; cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 }; }
                        else if (colNumber === 22) cell.fill = FILL_YELLOW;
                        else if (colNumber <= 29) cell.fill = colNumber % 2 === 0 ? FILL_GREEN : FILL_ORANGE;
                        else if (colNumber <= 69) cell.fill = FILL_BONGKAR_PINK;
                        else if (colNumber <= 76) cell.fill = colNumber % 2 === 0 ? FILL_GREEN : FILL_ORANGE;
                        else if (colNumber <= 116) cell.fill = FILL_MUAT_LIGHT_BLUE;
                        else cell.fill = FILL_YELLOW;
                    } else if (statusStyle) {
                        cell.fill = statusStyle.fill;
                        cell.font = statusStyle.font;
                    }
                });
            });

            worksheet.columns.forEach((col) => { col.width = 12; });

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `laporan_bongkar_muat_${new Date().toISOString().slice(0, 10)}.xlsx`);

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
        setIsExporting(true);
        setIsExportOpen(false);
        const loadingToast = toast.loading("Membuat file Excel Register... Ini mungkin butuh beberapa detik.");

        try {
            const exportRecords = await fetchAllExportData();
            const parseSpbNum = (str) => str ? (parseInt(String(str).match(/\d+/)?.[0] || 0, 10)) : 0;
            exportRecords.sort((a, b) => {
                let numA = parseSpbNum(a.spb?.no_spb), numB = parseSpbNum(b.spb?.no_spb);
                if (numA !== numB) return numB - numA;
                return String(b.spb?.no_spb || '').localeCompare(String(a.spb?.no_spb || ''), undefined, { numeric: true });
            });

            let data = exportRecords.map(d => {
                const { tanggal_clearance, ppk, spb, no_urut, kapal, nahkoda, jumlah_crew, kedudukan_kapal, tanggal_datang, datang_dari, tanggal_berangkat, tempat_singgah, tujuan_akhir, agen, pukul_agen_clearance, pukul_kapal_berangkat } = d;
                const safeKapal = kapal || {}, safeJeni = safeKapal.jeni || {}, safeBendera = safeKapal.bendera || {};
                const safeNahkoda = nahkoda || {}, safeSpb = spb || {}, safeKedudukan = kedudukan_kapal || {};
                const safeDatangDari = datang_dari || {}, safeTempatSinggah = tempat_singgah || {}, safeTujuanAkhir = tujuan_akhir || {}, safeAgen = agen || {};

                const tglClearance = new Date(tanggal_clearance);
                const tglDatang = new Date(tanggal_datang);
                const tglBerangkat = new Date(tanggal_berangkat);
                const rawStatus = (d.status_pelayaran_rel?.kode_status || d.status_pelayaran || 'TERBIT').toUpperCase();

                return {
                    "REGISTER BULAN": new Intl.DateTimeFormat('id-ID', { month: "long" }).format(tglClearance) || '-',
                    "ANGKA BULAN": tglClearance.getMonth() + 1 || '-',
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
                    "TERBILANG": `(${angkaKeHuruf(jumlah_crew).toUpperCase()})`,
                    "GT": safeKapal.gt || 0,
                    "NT": safeKapal.nt || 0,
                    "NO": "NO.",
                    "SELAR": safeKapal.nomor_selar || '-',
                    "TANDA SELAR": safeKapal.tanda_selar || '-',
                    "NOMOR IMO": safeKapal.nomor_imo || '-',
                    "CALL SIGN": safeKapal.call_sign || '-',
                    "KEDUDUKAN KAPAL": safeKedudukan.nama_kabupaten || '-',
                    "TGL DTG": tglDatang.getDate() || '-',
                    "BLN DTG": new Intl.DateTimeFormat("id-ID", { month: "long" }).format(tglDatang) || '-',
                    "THN DTG": tglDatang.getFullYear() || '-',
                    "DATANG DARI": safeDatangDari.nama_kecamatan || '-',
                    "TGL BRKT": tglBerangkat.getDate() || '-',
                    "BLN BRKT": tglBerangkat.getMonth() + 1 || '-',
                    "THN BRKT": tglBerangkat.getFullYear() || '-',
                    "TEMPAT YANG PERTAMA DISINGGAHI": safeTempatSinggah.nama_kecamatan || '-',
                    "TUJUAN TERAKHIR": safeTujuanAkhir.nama_kecamatan || '-',
                    "AGEN": safeAgen.nama_agen || '-',
                    "TANGGAL CLEARANCE": tglClearance.getDate() || '-',
                    "PUKUL AGEN CLEARANCE": pukul_agen_clearance || '-',
                    "TANGGAL BERANGKAT": tglBerangkat.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) || '-',
                    "PUKUL KAPAL BERANGKAT": pukul_kapal_berangkat || '-',
                    "MUATAN BERANGKAT": getMuatanBerangkatText(d)
                };
            });

            if (data.length === 0) {
                toast.error("Tidak ada data untuk diekspor.");
                setIsExporting(false);
                toast.dismiss(loadingToast);
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Register Bulan');
            worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
            const dataKeys = Object.keys(data[0]);

            worksheet.columns = dataKeys.map(key => ({ header: key, key }));
            worksheet.addRows(data);

            dataKeys.forEach((key, i) => {
                let maxLen = worksheet.columns[i].header.length;
                data.forEach(row => { const cl = row[key] ? String(row[key]).length : 0; if (cl > maxLen) maxLen = cl; });
                worksheet.columns[i].width = maxLen + 2;
            });

            worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                const statusStyle = getStatusStyle(row.getCell(8).value);

                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.border = BORDER_THIN;
                    cell.alignment = ALIGN_CENTER;
                    if (rowNumber === 1) {
                        cell.font = { bold: true };
                        cell.fill = HEADER_FILL_GRAY;
                    } else if (statusStyle) {
                        cell.fill = statusStyle.fill;
                        cell.font = statusStyle.font;
                    }
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `laporan_register_${new Date().toISOString().slice(0, 10)}.xlsx`);

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
        return <p className="text-center text-gray-500 py-10">Memuat data...</p>;
    }

    return (
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
    );
}

export default Clearance;