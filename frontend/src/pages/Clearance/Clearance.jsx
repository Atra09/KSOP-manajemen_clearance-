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
import ExportMonthlyModal from '../../components/modal/ExportMonthlyModal';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const customStyles = {
    control: (styles) => ({ ...styles, backgroundColor: 'transparent', minHeight: '44px', paddingLeft: '4px' }),
    valueContainer: (styles) => ({ ...styles, paddingLeft: '16px', paddingRight: '16px', overflow: 'visible' }),
    placeholder: (styles) => ({ ...styles, marginLeft: 0, marginRight: 0, paddingLeft: 0, position: 'absolute', left: '16px' }),
    multiValue: (styles) => ({ ...styles, backgroundColor: 'var(--tw-select-multivalue-bg, #374151)' }),
    multiValueLabel: (styles) => ({ ...styles, color: '#F3F4F6' }),
    multiValueRemove: (styles) => ({ ...styles, color: '#9CA3AF', ':hover': { backgroundColor: '#EF4444', color: 'white' } }),
};

const rowsPerPageOptions = ['5', '10', '20', '50', 'Semua'];

const MONTH_OPTIONS = [
    { value: '', label: 'Semua Bulan' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [
    { value: '', label: 'Semua Tahun' },
    ...Array.from({ length: 6 }, (_, i) => {
        const y = String(currentYear - 3 + i);
        return { value: y, label: y };
    })
];

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

const getColLetter = (colIdx) => {
    let temp = '';
    let letter = '';
    while (colIdx > 0) {
        temp = (colIdx - 1) % 26;
        letter = String.fromCharCode(65 + temp) + letter;
        colIdx = Math.floor((colIdx - temp) / 26);
    }
    return letter;
};

const CARGO_SUB_HEADERS = [
    "Gol. I", "Gol. II", "Gol. III", "Gol. IV", "Gol. V", "Bego",
    "Mitan", "Solar (ltr)", "Bensin (ltr)", "krosene", "Avtur", "LPG 3 kg (tb)", "LPG 12 kg (tb)",
    "Beras (ton)", "Jagung (ton)", "Garam (ton)", "Tepung (ton)", "Gula (ton)", "Kedelei", "Palen (ton)", "Kelapa (biji)", "Kacang (ton)", "Sayur & Buah (ton)", "Mangga (krg)", "Rmpt Laut (ton)",
    "Keramik (ton)", "Semen (ton)", "Genteng (biji)", "Batu Bata (b)/Paving", "Pasir (ton)", "Bahan Bangunan Lain (ton)",
    "Barang (ton)", "Barkas (ton)", "Tbg Kosong", "Air Galon Kosong", "Ikan (ton)", "Hewan/Ternak", "Kayu m3", "Pupuk (ton)", "Bagasi Lainnya (ton)"
];

const CARGO_COL_INDEX_MAP = {
    'Gol. I': 0, 'Gol. II': 1, 'Gol. III': 2, 'Gol. IV': 3, 'Gol. V': 4, 'Bego': 5,
    'Mtan': 6, 'Mitan': 6, 'Solar (ltr)': 7, 'Bensin (ltr)': 8, 'krosene': 9, 'Krosene': 9, 'Avtur': 10, 'LPG 3 kg (tb)': 11, 'LPG 12 kg (tb)': 12,
    'Beras (ton)': 13, 'Jagung (ton)': 14, 'Garam (ton)': 15, 'Tepung (ton)': 16, 'Gula (ton)': 17, 'Kedelei': 18, 'Palen (ton)': 19, 'Kelapa (biji)': 20, 'Kacang (ton)': 21, 'Kacang': 21, 'Kcang ijo (ton)': 21, 'Kacang ijo (ton)': 21, 'Sayur & Buah (ton)': 22, 'Mangga (kg)': 23, 'Mangga (krg)': 23, 'Rmpt Laut (ton)': 24,
    'Keramik (ton)': 25, 'Semen (ton)': 26, 'Genteng (biji)': 27, 'Batu Bata (bj)/Paving': 28, 'Batu Bata (b)/Paving': 28, 'Pasir (ton)': 29, 'Bahan Bangunan Lain (ton)': 30,
    'Barang (ton)': 39, 'Barkas (ton)': 32, 'Berkas (ton)': 32, 'Tbg Kosong': 33, 'Air Galon Kosong': 34, 'Ikan (ton)': 35, 'Hewan/Ternak': 36, 'Kayu m3': 37, 'Pupuk (ton)': 38, 'Bagasi Lainnya (ton)': 39
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
            const catName = (m.kategori_muatan?.nama_kategori_muatan || '').toLowerCase().trim();
            const colLower = targetCol.toLowerCase();
            const combinedName = `${catName} ${colLower}`;

            const valUnit = Number(m.unit) || 0;
            const valTon = Number(m.ton) || 0;
            const valM3 = Number(m.m3) || 0;
            const valDefault = valTon || valUnit || valM3 || 0;

            // 1. Direct index map matching from excel_column_name
            if (CARGO_COL_INDEX_MAP[targetCol] !== undefined) {
                const idx = CARGO_COL_INDEX_MAP[targetCol];
                let qty = valDefault;
                if ([7, 8, 11, 12, 20, 23, 27, 28, 33, 34].includes(idx)) {
                    qty = valUnit || valDefault;
                } else if (idx === 37) {
                    qty = valM3 || valTon || valDefault;
                } else {
                    qty = valTon || valDefault;
                }
                slots[idx] += qty;
                return;
            }

            // 2. Keyword fallback matching based on category name & column name
            let slotIndex = -1;
            let qty = valDefault;

            // --- BAHAN BAKAR ---
            if (combinedName.includes('solar') || combinedName.includes('dexlite') || combinedName.includes('biosolar')) {
                slotIndex = 7; qty = valUnit || valDefault;
            } else if (combinedName.includes('bensin') || combinedName.includes('pertalite') || combinedName.includes('pertamax')) {
                slotIndex = 8; qty = valUnit || valDefault;
            } else if (combinedName.includes('mitan') || combinedName.includes('kerosene') || combinedName.includes('minyak tanah')) {
                slotIndex = 6; qty = valUnit || valDefault;
            } else if (combinedName.includes('avtur')) {
                slotIndex = 10; qty = valUnit || valDefault;
            } else if (combinedName.includes('lpg 3') || combinedName.includes('elpiji 3')) {
                slotIndex = 11; qty = valUnit || valDefault;
            } else if (combinedName.includes('lpg 12') || combinedName.includes('lpg 50') || combinedName.includes('elpiji 12')) {
                slotIndex = 12; qty = valUnit || valDefault;
            }
            // --- MAKANAN & PRODUK OLAHAN ---
            else if (combinedName.includes('beras')) {
                slotIndex = 13; qty = valTon || valDefault;
            } else if (combinedName.includes('jagung')) {
                slotIndex = 14; qty = valTon || valDefault;
            } else if (combinedName.includes('garam')) {
                slotIndex = 15; qty = valTon || valDefault;
            } else if (combinedName.includes('tepung') || combinedName.includes('terigu')) {
                slotIndex = 16; qty = valTon || valDefault;
            } else if (combinedName.includes('gula')) {
                slotIndex = 17; qty = valTon || valDefault;
            } else if (combinedName.includes('kedelai') || combinedName.includes('kedele')) {
                slotIndex = 18; qty = valTon || valDefault;
            } else if (combinedName.includes('palen')) {
                slotIndex = 19; qty = valTon || valDefault;
            } else if (combinedName.includes('kelapa')) {
                slotIndex = 20; qty = valUnit || valDefault;
            } else if (combinedName.includes('kacang') || combinedName.includes('kcang')) {
                slotIndex = 21; qty = valTon || valDefault;
            } else if (combinedName.includes('mangga')) {
                slotIndex = 23; qty = valUnit || valDefault;
            } else if (combinedName.includes('rumput laut') || combinedName.includes('rmpt laut')) {
                slotIndex = 24; qty = valTon || valDefault;
            } else if (
                combinedName.includes('sayur') || combinedName.includes('buah') ||
                catName.includes('makanan') || catName.includes('minuman') || catName.includes('olahan') ||
                combinedName.includes('makanan') || combinedName.includes('minuman') || combinedName.includes('yogurt') ||
                combinedName.includes('susu') || combinedName.includes('snack') || combinedName.includes('bumbu') || combinedName.includes('sirup')
            ) {
                // Default fallback untuk kategori Makanan, Minuman, & Produk Olahan -> Sayur & Buah (ton)
                slotIndex = 22; qty = valTon || valDefault;
            }
            // --- BAHAN BANGUNAN ---
            else if (combinedName.includes('paving') || combinedName.includes('batu bata') || combinedName.includes('bata') || combinedName.includes('hebel')) {
                slotIndex = 28; qty = valUnit || valDefault; // Batu Bata (b)/Paving
            } else if (combinedName.includes('semen')) {
                slotIndex = 26; qty = valTon || valUnit || valDefault; // Semen (ton)
            } else if (combinedName.includes('genteng')) {
                slotIndex = 27; qty = valUnit || valDefault; // Genteng (biji)
            } else if (combinedName.includes('keramik') || combinedName.includes('granit')) {
                slotIndex = 25; qty = valTon || valDefault; // Keramik (ton)
            } else if (combinedName.includes('pasir') || combinedName.includes('sirtu') || combinedName.includes('batu split') || combinedName.includes('koral')) {
                slotIndex = 29; qty = valTon || valDefault; // Pasir (ton)
            } else if (
                catName.includes('bangunan') || combinedName.includes('bangunan') || combinedName.includes('asbes') || combinedName.includes('seng') ||
                combinedName.includes('besi') || combinedName.includes('pipa') || combinedName.includes('cat') ||
                combinedName.includes('kaca') || combinedName.includes('triplek') || combinedName.includes('gypsum') || combinedName.includes('papan')
            ) {
                // Default fallback untuk kategori Bahan Bangunan -> Bahan Bangunan Lain (ton)
                slotIndex = 30; qty = valTon || valDefault;
            }
            // --- TABUNG / WADAH KOSONG ---
            else if (combinedName.includes('tbg kosong') || combinedName.includes('tabung kosong') || combinedName.includes('tabung') || catName.includes('tabung')) {
                slotIndex = 33; qty = valUnit || valDefault; // Tbg Kosong
            } else if (combinedName.includes('galon') || combinedName.includes('air galon')) {
                slotIndex = 34; qty = valUnit || valDefault; // Air Galon Kosong
            }
            // --- LAIN-LAIN ---
            else if (combinedName.includes('pupuk') || combinedName.includes('urea') || combinedName.includes('npk') || combinedName.includes('za')) {
                slotIndex = 38; qty = valTon || valDefault; // Pupuk (ton)
            } else if (combinedName.includes('kayu')) {
                slotIndex = 37; qty = valM3 || valTon || valDefault; // Kayu m3
            } else if (combinedName.includes('hewan') || combinedName.includes('ternak') || combinedName.includes('sapi') || combinedName.includes('kambing') || combinedName.includes('domba') || combinedName.includes('ayam')) {
                slotIndex = 36; qty = valUnit || valDefault; // Hewan/Ternak
            } else if (combinedName.includes('ikan') || combinedName.includes('cumi') || combinedName.includes('udang') || combinedName.includes('kerapu')) {
                slotIndex = 35; qty = valTon || valDefault; // Ikan (ton)
            } else if (combinedName.includes('barkas') || combinedName.includes('rongsokan')) {
                slotIndex = 32; qty = valTon || valDefault; // Barkas (ton)
            } else {
                // Semua barang yang tidak spesifik dipetakan langsung ke Bagasi Lainnya (ton) [slot 39]
                slotIndex = 39; qty = valTon || valDefault;
            }

            slots[slotIndex] += qty;
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

const INITIAL_FILTERS = {
    searchTerm: '', selectedShip: '', startDate: '', endDate: '',
    selectedCategory: '', selectedGoods: [], selectedWilayah: '',
};

const getInitialFilterState = (key, fallback) => {
    try {
        const saved = sessionStorage.getItem('clearance_filter_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed[key] !== undefined ? parsed[key] : fallback;
        }
    } catch (e) {
        console.error("Error reading saved filter state:", e);
    }
    return fallback;
};

function Clearance() {
    const [pageData, setPageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();

    const [dropdownOptions, setDropdownOptions] = useState({
        ships: [], categories: [], goods: [], wilayahKerja: []
    });

    const [filters, setFilters] = useState(() => getInitialFilterState('filters', INITIAL_FILTERS));
    const [sortConfig, setSortConfig] = useState(() => getInitialFilterState('sortConfig', { key: 'no_spb', direction: 'DESC' }));
    const [currentPage, setCurrentPage] = useState(() => getInitialFilterState('currentPage', 1));
    const [rowsPerPage, setRowsPerPage] = useState(() => getInitialFilterState('rowsPerPage', '5'));
    const [totalData, setTotalData] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        try {
            sessionStorage.setItem('clearance_filter_state', JSON.stringify({
                filters,
                currentPage,
                rowsPerPage,
                sortConfig
            }));
        } catch (e) {
            console.error("Error saving filter state:", e);
        }
    }, [filters, currentPage, rowsPerPage, sortConfig]);

    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportReportType, setExportReportType] = useState('register');
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

    const getQueryParams = useCallback((limitOverride = null, customParams = null) => {
        const queryLimit = limitOverride !== null ? limitOverride : (rowsPerPage === 'Semua' ? 0 : parseInt(rowsPerPage, 10));
        const queryPage = limitOverride !== null ? 1 : currentPage;

        let effectiveStartDate = filters.startDate;
        let effectiveEndDate = filters.endDate;

        // If month/year filter is set in UI filters
        if (filters.selectedMonth && filters.selectedYear) {
            const m = String(filters.selectedMonth).padStart(2, '0');
            const y = filters.selectedYear;
            const lastDay = new Date(Number(y), Number(m), 0).getDate();
            effectiveStartDate = `${y}-${m}-01`;
            effectiveEndDate = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
        } else if (filters.selectedYear) {
            effectiveStartDate = `${filters.selectedYear}-01-01`;
            effectiveEndDate = `${filters.selectedYear}-12-31`;
        }

        const params = {
            page: queryPage, limit: queryLimit,
            searchTerm: filters.searchTerm, nama_kapal: filters.selectedShip,
            tanggal_awal: effectiveStartDate, tanggal_akhir: effectiveEndDate,
            kategori: filters.selectedCategory, wilker: filters.selectedWilayah,
            sort: sortConfig.direction, data_name: sortConfig.key,
            ...customParams
        };

        const goods = filters.selectedGoods.filter(g => g.value.startsWith('good_')).map(g => g.value.split('_')[1]);
        const vehicles = filters.selectedGoods.filter(g => g.value.startsWith('vehicle_')).map(g => g.value.split('_')[1]);

        if (goods.length > 0) params.nama_muatan = goods;
        if (vehicles.length > 0) params.golongan_kendaraan = vehicles;

        return params;
    }, [currentPage, rowsPerPage, filters, sortConfig]);

    const fetchAllExportData = async (overrideParams = null) => {
        try {
            const params = overrideParams ? getQueryParams(0, overrideParams) : getQueryParams(0);
            const data = await fetchPerjalananData(params);
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

    const isFilterActive = useMemo(() => {
        return Boolean(
            filters.searchTerm ||
            filters.selectedShip ||
            filters.startDate ||
            filters.endDate ||
            filters.selectedCategory ||
            (filters.selectedGoods && filters.selectedGoods.length > 0) ||
            filters.selectedWilayah
        );
    }, [filters]);

    const handleResetFilters = () => {
        setFilters(INITIAL_FILTERS);
        setCurrentPage(1);
        sessionStorage.removeItem('clearance_filter_state');
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => {
            const next = { ...prev, [name]: value };
            // Clear custom date range if month/year filter is selected
            if (name === 'selectedMonth' || name === 'selectedYear') {
                if (value !== '') {
                    next.startDate = '';
                    next.endDate = '';
                }
            } else if (name === 'startDate' || name === 'endDate') {
                if (value !== '') {
                    next.selectedMonth = '';
                }
            }
            return next;
        });
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

    const handleOpenExportModal = (type = 'register') => {
        setExportReportType(type);
        setIsExportOpen(false);
        setIsExportModalOpen(true);
    };

    const handleExecuteExport = async ({ month, year, monthName, reportType }) => {
        const strMonth = String(month).padStart(2, '0');
        const lastDay = new Date(year, month, 0).getDate();
        const customParams = {
            tanggal_awal: `${year}-${strMonth}-01`,
            tanggal_akhir: `${year}-${strMonth}-${String(lastDay).padStart(2, '0')}`
        };

        if (reportType === 'bongkar_muat') {
            await exportXLSX_BongkarMuat(customParams, monthName, year);
        } else {
            await exportXLSX(customParams, monthName, year);
        }
    };

    const exportXLSX_BongkarMuat = async (overrideParams = null, monthName = null, year = null) => {
        if (isExporting) {
            toast.error("Harap tunggu, ekspor sebelumnya masih diproses.");
            return;
        }
        setIsExporting(true);
        setIsExportOpen(false);
        const periodLabel = monthName && year ? `${monthName} ${year}` : 'Periode Selected';
        const loadingToast = toast.loading(`Membuat Excel Bongkar Muat (${periodLabel})... Ini mungkin butuh beberapa detik.`);

        try {
            const exportRecords = await fetchAllExportData(overrideParams);
            if (exportRecords.length === 0) {
                toast.error(`Tidak ada data clearance untuk bulan ${periodLabel}.`);
                setIsExporting(false);
                toast.dismiss(loadingToast);
                return;
            }

            const parseSpbNum = (str) => str ? (parseInt(String(str).match(/\d+/)?.[0] || 0, 10)) : 0;

            exportRecords.sort((a, b) => {
                let numA = parseSpbNum(a.spb?.no_spb), numB = parseSpbNum(b.spb?.no_spb);
                if (numA !== numB) return numB - numA;
                let urutA = parseSpbNum(a.no_urut), urutB = parseSpbNum(b.no_urut);
                if (urutA !== urutB) return urutB - urutA;
                return String(b.spb?.no_spb || '').localeCompare(String(a.spb?.no_spb || ''), undefined, { numeric: true });
            });

            const workbook = new ExcelJS.Workbook();
            const sheetName = monthName && year ? `${monthName} ${year}` : 'Data Ekrek';
            const worksheet = workbook.addWorksheet(sheetName);
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

            // Calculate SUM Row
            const startDataRow = 4;
            const endDataRow = 3 + exportRecords.length;
            const sumRowNumber = endDataRow + 1;

            const sumRowValues = new Array(118).fill(null);
            sumRowValues[0] = "JUMLAH TOTAL";

            // Col 10: CREW
            sumRowValues[9] = { formula: `SUM(J${startDataRow}:J${endDataRow})` };

            // Col 23-29: Penumpang Datang
            for (let c = 23; c <= 29; c++) {
                const colLet = getColLetter(c);
                sumRowValues[c - 1] = { formula: `SUM(${colLet}${startDataRow}:${colLet}${endDataRow})` };
            }

            // Col 30-69: Bongkar Cargo & Vehicles (40 columns)
            for (let c = 30; c <= 69; c++) {
                const colLet = getColLetter(c);
                sumRowValues[c - 1] = { formula: `SUM(${colLet}${startDataRow}:${colLet}${endDataRow})` };
            }

            // Col 70-76: Penumpang Berangkat
            for (let c = 70; c <= 76; c++) {
                const colLet = getColLetter(c);
                sumRowValues[c - 1] = { formula: `SUM(${colLet}${startDataRow}:${colLet}${endDataRow})` };
            }

            // Col 77-116: Muat Cargo & Vehicles (40 columns)
            for (let c = 77; c <= 116; c++) {
                const colLet = getColLetter(c);
                sumRowValues[c - 1] = { formula: `SUM(${colLet}${startDataRow}:${colLet}${endDataRow})` };
            }

            worksheet.addRow(sumRowValues);

            BONGKAR_MUAT_MERGES.forEach(([r1, c1, r2, c2]) => worksheet.mergeCells(r1, c1, r2, c2));
            worksheet.mergeCells(sumRowNumber, 1, sumRowNumber, 9);

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
                    } else if (rowNumber === sumRowNumber) {
                        cell.font = { bold: true, size: 10 };
                        cell.fill = HEADER_FILL_GRAY;
                    } else if (statusStyle) {
                        cell.fill = statusStyle.fill;
                        cell.font = statusStyle.font;
                    }
                });
            });

            worksheet.columns.forEach((col) => { col.width = 12; });

            const fileNameStr = monthName && year
                ? `laporan_bongkar_muat_${monthName.toLowerCase()}_${year}.xlsx`
                : `laporan_bongkar_muat_${new Date().toISOString().slice(0, 10)}.xlsx`;

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), fileNameStr);

            toast.dismiss(loadingToast);
            toast.success(`Ekspor Laporan Bongkar Muat (${periodLabel}) berhasil!`);
        } catch (err) {
            console.error("Error writing excel buffer", err);
            toast.dismiss(loadingToast);
            toast.error("Gagal membuat file Excel Bongkar Muat.");
        } finally {
            setIsExporting(false);
        }
    };

    const exportXLSX = async (overrideParams = null, monthName = null, year = null) => {
        if (isExporting) {
            toast.error("Harap tunggu, ekspor sebelumnya masih diproses.");
            return;
        }
        setIsExporting(true);
        setIsExportOpen(false);
        const periodLabel = monthName && year ? `${monthName} ${year}` : 'Periode Selected';
        const loadingToast = toast.loading(`Membuat Excel Register (${periodLabel})... Ini mungkin butuh beberapa detik.`);

        try {
            const exportRecords = await fetchAllExportData(overrideParams);
            const parseSpbNum = (str) => str ? (parseInt(String(str).match(/\d+/)?.[0] || 0, 10)) : 0;
            exportRecords.sort((a, b) => {
                let numA = parseSpbNum(a.spb?.no_spb), numB = parseSpbNum(b.spb?.no_spb);
                if (numA !== numB) return numB - numA;
                return String(b.spb?.no_spb || '').localeCompare(String(a.spb?.no_spb || ''), undefined, { numeric: true });
            });

            const displayRegisterMonth = monthName && year ? `${monthName.toUpperCase()} ${year}` : null;

            let data = exportRecords.map(d => {
                const { tanggal_clearance, ppk, spb, no_urut, kapal, nahkoda, jumlah_crew, kedudukan_kapal, tanggal_datang, datang_dari, tanggal_berangkat, tempat_singgah, tujuan_akhir, agen, pukul_agen_clearance, pukul_kapal_berangkat } = d;
                const safeKapal = kapal || {}, safeJeni = safeKapal.jeni || {}, safeBendera = safeKapal.bendera || {};
                const safeNahkoda = nahkoda || {}, safeSpb = spb || {}, safeKedudukan = kedudukan_kapal || {};
                const safeDatangDari = datang_dari || {}, safeTempatSinggah = tempat_singgah || {}, safeTujuanAkhir = tujuan_akhir || {}, safeAgen = agen || {};

                const tglClearance = new Date(tanggal_clearance);
                const tglDatang = new Date(tanggal_datang);
                const tglBerangkat = new Date(tanggal_berangkat);
                const rawStatus = (d.status_pelayaran_rel?.kode_status || d.status_pelayaran || 'TERBIT').toUpperCase();

                const monthFormatted = displayRegisterMonth || (new Intl.DateTimeFormat('id-ID', { month: "long" }).format(tglClearance) || '-');

                return {
                    "REGISTER BULAN": monthFormatted,
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
                toast.error(`Tidak ada data clearance untuk bulan ${periodLabel}.`);
                setIsExporting(false);
                toast.dismiss(loadingToast);
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const sheetName = monthName && year ? `${monthName} ${year}` : 'Register Bulan';
            const worksheet = workbook.addWorksheet(sheetName);
            worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
            const dataKeys = Object.keys(data[0]);

            worksheet.columns = dataKeys.map(key => ({ header: key, key }));
            worksheet.addRows(data);

            const startDataRow = 2;
            const endDataRow = 1 + data.length;
            const sumRowNumber = endDataRow + 1;

            const sumRowObj = {};
            dataKeys.forEach(key => { sumRowObj[key] = null; });
            sumRowObj["REGISTER BULAN"] = "JUMLAH TOTAL";
            sumRowObj["CREW"] = { formula: `SUM(L${startDataRow}:L${endDataRow})` };
            sumRowObj["GT"] = { formula: `SUM(N${startDataRow}:N${endDataRow})` };
            sumRowObj["NT"] = { formula: `SUM(O${startDataRow}:O${endDataRow})` };

            worksheet.addRow(sumRowObj);
            worksheet.mergeCells(sumRowNumber, 1, sumRowNumber, 11);

            dataKeys.forEach((key, i) => {
                let maxLen = worksheet.columns[i].header.length;
                data.forEach(row => { const cl = row[key] ? String(row[key]).length : 0; if (cl > maxLen) maxLen = cl; });
                worksheet.columns[i].width = maxLen + 2;
            });

            worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                const statusStyle = getStatusStyle(row.getCell(8).value);

                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    cell.border = BORDER_THIN;
                    cell.alignment = ALIGN_CENTER;
                    if (rowNumber === 1) {
                        cell.font = { bold: true };
                        cell.fill = HEADER_FILL_GRAY;
                    } else if (rowNumber === sumRowNumber) {
                        cell.font = { bold: true, size: 10 };
                        cell.fill = HEADER_FILL_GRAY;
                    } else if (statusStyle) {
                        cell.fill = statusStyle.fill;
                        cell.font = statusStyle.font;
                    }
                });
            });

            const fileNameStr = monthName && year
                ? `laporan_register_${monthName.toLowerCase()}_${year}.xlsx`
                : `laporan_register_${new Date().toISOString().slice(0, 10)}.xlsx`;

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), fileNameStr);

            toast.dismiss(loadingToast);
            toast.success(`Ekspor Laporan Register (${periodLabel}) berhasil!`);
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
                        <button
                            onClick={() => setIsExportModalOpen(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Ekspor Laporan</span>
                        </button>
                        <Link to="/clearance/add" className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors whitespace-nowrap">
                            + Tambah Data
                        </Link>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="grid grid-cols-1 items-end gap-4 border-b border-gray-200 p-4 md:grid-cols-3 lg:grid-cols-3">
                        <div className="flex flex-col md:flex-row justify-between md:col-span-3 lg:col-span-3 gap-4">
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

                        {/* Custom Date Range & Reset Button */}
                        <div className="flex items-center gap-1.5 w-full min-w-0">
                            <InputField
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange(e.target.name, e.target.value)}
                                className="!px-2.5 text-xs h-11 min-w-0 flex-1"
                            />
                            <span className="text-gray-400 text-xs shrink-0">-</span>
                            <InputField
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange(e.target.name, e.target.value)}
                                className="!px-2.5 text-xs h-11 min-w-0 flex-1"
                            />
                            {isFilterActive && (
                                <button
                                    onClick={handleResetFilters}
                                    title="Reset Semua Filter"
                                    className="px-2.5 h-11 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Reset</span>
                                </button>
                            )}
                        </div>

                        <div className="md:col-span-3 lg:col-span-3">
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

            {/* Monthly Export Modal */}
            <ExportMonthlyModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleExecuteExport}
                initialReportType={exportReportType}
            />
        </div>
    );
}

export default Clearance;