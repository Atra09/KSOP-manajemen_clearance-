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
    multiValue: (styles) => ({ ...styles, backgroundColor: '#E0E7FF' }),
    multiValueLabel: (styles) => ({ ...styles, color: '#374151' }),
    multiValueRemove: (styles) => ({ ...styles, color: '#4F46E5', ':hover': { backgroundColor: '#4F46E5', color: 'white' } }),
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
        key: 'id_perjalanan', 
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

    const fetchData = useCallback(async () => {
        if (!authLoading) setLoading(true);

        const queryLimit = (rowsPerPage === 'Semua' ? 0 : parseInt(rowsPerPage, 10));
        const queryPage = currentPage;
        
        try {
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
    }, [currentPage, rowsPerPage, filters, authLoading, sortConfig]);

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

    const exportXLSX = async () => {
        if (isExporting) {
            toast.error("Harap tunggu, ekspor sebelumnya masih diproses.");
            return;
        }
        
        console.log("Fungsi Ekspor Laporan Register (ExcelJS) dipanggil.");

        setIsExporting(true);
        setIsExportOpen(false);
        const loadingToast = toast.loading("Membuat file Excel... Ini mungkin butuh beberapa detik.");

        try {
            let data = pageData.map(d => {
                const {
                    tanggal_clearance, ppk, spb, no_urut, kapal, nahkoda, jumlah_crew,
                    kedudukan_kapal, tanggal_datang, datang_dari, tanggal_berangkat,
                    tempat_singgah, tujuan_akhir, agen, pukul_agen_clearance,
                    pukul_kapal_berangkat, status_muatan_berangkat
                } = d;
                const safeKapal = kapal || {};
                const safeJeni = safeKapal.jeni || {};
                const safeBendera = safeKapal.bendera || {};
                const safeNahkoda = nahkoda || {};
                const safeSpb = spb || {};
                const safeKedudukan = kedudukan_kapal || {};
                const safeDatangDari = datang_dari || {};
                const safeTempatSinggah = tempat_singgah || {};
                const safeTujuanAkhir = tujuan_akhir || {};
                const safeAgen = agen || {};

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

                const tglBerangkatFormatted = tanggalBerangkat.toLocaleDateString('id-ID', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });

                return {
                    "REGISTER BULAN": bulanClearance,
                    "ANGKA BULAN": angkaBulan,
                    "PPK": ppk,
                    "No. SPB Asal": safeSpb.no_spb_asal || '-',
                    "No. SPB": safeSpb.no_spb || '-',
                    "No. Urut": no_urut,
                    "Nama Kapal": safeKapal.nama_kapal || '-',
                    "Jenis": safeJeni.nama_jenis || '-',
                    "bendera": safeBendera.kode_negara || '-',
                    "nahkoda": safeNahkoda.nama_nahkoda || '-',
                    "CREW": jumlah_crew,
                    "TERBILANG": `(${angkaHuruf.toUpperCase()})`,
                    "GT": safeKapal.gt,
                    "NT": safeKapal.nt,
                    "NO": "NO. ",
                    "Selar": safeKapal.nomor_selar || '-',
                    "Tanda Selar": safeKapal.tanda_selar || '-',
                    "Nomor IMO": safeKapal.nomor_imo || '-',
                    "Call Sign": safeKapal.call_sign || '-',
                    "Kedudukan Kapal": safeKedudukan.nama_kabupaten || '-',
                    "Tgl Dtg": tanggalOnlyDatang,
                    "Bln Dtg": bulanDatang,
                    "Thn Dtg": tahunDatang,
                    "Datang Dari": safeDatangDari.nama_kecamatan || '-',
                    "Tgl brkt": tanggalOnlyBerangkat,
                    "Bln brkt": bulanBerangkat,
                    "Thn brkt": tahunBerangkat,
                    "Tempat Yang Pertama Disinggahi": safeTempatSinggah.nama_kecamatan || '-',
                    "Tujuan Terakhir": safeTujuanAkhir.nama_kecamatan || '-',
                    "Agen": safeAgen.nama_agen || '-',
                    "TANGGAL CLEARANCE": tanggalOnlyClearance,
                    "PUKUL AGEN CLEARANCE": pukul_agen_clearance || '-',
                    "TANGGAL BERANGKAT": tglBerangkatFormatted,
                    "PUKUL KAPAL BERANGKAT": pukul_kapal_berangkat || '-',
                    "MUATAN BERANGKAT": status_muatan_berangkat || '-'
                };
            });
            if (data.length === 0) {
                toast.error("Tidak ada data untuk diekspor.");
                setIsExporting(false);
                toast.dismiss(loadingToast);
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Data Clearance');
            const dataKeys = Object.keys(data[0]);
            worksheet.columns = dataKeys.map(key => ({ 
                header: key.toUpperCase(),
                key: key                   
            }));
            worksheet.addRows(data);
            const colWidths = dataKeys.map((key, index) => {
                let maxLength = worksheet.columns[index].header.length;
                data.forEach(row => {
                    const cellValue = row[key];
                    const cellLength = cellValue ? String(cellValue).length : 0;
                    if (cellLength > maxLength) {
                        maxLength = cellLength;
                    }
                });
                return maxLength + 2; 
            });
            worksheet.columns.forEach((col, i) => {
                col.width = colWidths[i];
            });
            const borderStyle = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            const alignmentStyle = { vertical: 'middle', horizontal: 'center' };
            const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
            worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    cell.border = borderStyle;
                    cell.alignment = alignmentStyle;
                    if (rowNumber === 1) {
                        cell.font = { bold: true };
                        cell.fill = headerFill;
                    }
                });
            });
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(blob, `laporan_clearance_${new Date().toISOString().slice(0, 10)}.xlsx`);

            toast.dismiss(loadingToast);
            toast.success("Ekspor Laporan Register berhasil!");

        } catch (err) {
            console.error("Error writing excel buffer", err);
            toast.dismiss(loadingToast);
            toast.error("Gagal membuat file Excel.");
        } finally {
            setIsExporting(false);
        }
    };

    const exportXLSX_BongkarMuat = async () => {
        if (isExporting) {
            toast.error("Harap tunggu, ekspor sebelumnya masih diproses.");
            return;
        }

        console.log("Fungsi Ekspor Laporan (ExcelJS) dipanggil.");
        if (pageData.length === 0) {
            toast.error("Tidak ada data untuk diekspor.");
            setIsExportOpen(false);
            return;
        }

        setIsExporting(true);
        setIsExportOpen(false);
        const loadingToast = toast.loading("Membuat file Excel... Ini mungkin butuh beberapa detik.");

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Laporan Lengkap');
            const formatDateTime = (dateStr, timeStr) => {
                if (!dateStr) return '-';
                try {
                    const d = new Date(dateStr);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    const datePart = `${day}/${month}/${year}`;
                    const timePart = timeStr ? timeStr.substring(0, 5) : '';
                    return `${datePart} ${timePart}`.trim();
                } catch (e) {
                    return '-';
                }
            };
            const getPayment = (pembayaranArray, tipe) => {
                const payment = pembayaranArray?.find(p => p.tipe_pembayaran === tipe) || {};
                return {
                    ntpn: payment.ntpn || null,
                    nilai: payment.nilai ? Number(payment.nilai) : null
                };
            };
            const aggregateCargo = (trip) => {
                const allCargo = [];
                trip.muatans?.forEach(m => allCargo.push({ ...m, type: 'barang' }));
                trip.muatan_kendaraan?.forEach(k => allCargo.push({ ...k, type: 'kendaraan' }));
                if (trip.penumpang_naik) {
                    allCargo.push({ type: 'penumpang', jenis_perjalanan: 'berangkat', jumlah_orang: trip.penumpang_naik });
                }
                if (trip.penumpang_turun) {
                    allCargo.push({ type: 'penumpang', jenis_perjalanan: 'datang', jumlah_orang: trip.penumpang_turun });
                }
                return allCargo;
            };
            const getCargoName = (cargoItem) => {
                if (cargoItem.type === 'barang') return cargoItem.kategori_muatan?.nama_kategori_muatan || '-';
                if (cargoItem.type === 'kendaraan') return `Kendaraan Gol. ${cargoItem.golongan_kendaraan}`;
                if (cargoItem.type === 'penumpang') return 'Penumpang';
                return '-';
            };
            const getCargoJenis = (cargoItem) => {
                if (cargoItem.type === 'barang') return cargoItem.kategori_muatan?.jenis_muatan?.nama_jenis_muatan || 'Barang';
                if (cargoItem.type === 'kendaraan') return 'Unitized';
                if (cargoItem.type === 'penumpang') return 'Orang';
                return '-';
            };
            const headerMain = [ "NO", "NOMOR SPB ASAL", "KAPAL", null, null, null, null, "TIBA", null, "SANDAR", "BERANGKAT", null, "TOLAK", "BONGKAR", null, null, null, null, null, "MUAT", null, null, null, null, null, "NOMOR SPB", "LABUH", null, "RAMBU", null, "MUATAN", "PERUSAHAAN" ];
            const headerDetail = [ "NO", "NOMOR SPB ASAL", "NAMA KAPAL", "JENIS KAPAL", "GT", "CALL SIGN", "BENDERA", "DARI", "TANGGAL", "SANDAR", "KE", "TANGGAL", "TOLAK", "KOMODITI", "JENIS", "TON", "M3", "UNIT", "ORANG", "KOMODITI", "JENIS", "TON", "M3", "UNIT", "ORANG", "NOMOR SPB", "NTPN", "NILAI", "NTPN", "NILAI", "MUATAN", "PERUSAHAAN" ];
            worksheet.addRows([headerMain, headerDetail]);
            const merges = [ { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, { s: { r: 0, c: 9 }, e: { r: 1, c: 9 } }, { s: { r: 0, c: 12 }, e: { r: 1, c: 12 } }, { s: { r: 0, c: 25 }, e: { r: 1, c: 25 } }, { s: { r: 0, c: 30 }, e: { r: 1, c: 30 } }, { s: { r: 0, c: 31 }, e: { r: 1, c: 31 } }, { s: { r: 0, c: 2 }, e: { r: 0, c: 6 } }, { s: { r: 0, c: 7 }, e: { r: 0, c: 8 } }, { s: { r: 0, c: 10 }, e: { r: 0, c: 11 } }, { s: { r: 0, c: 13 }, e: { r: 0, c: 18 } }, { s: { r: 0, c: 19 }, e: { r: 0, c: 24 } }, { s: { r: 0, c: 26 }, e: { r: 0, c: 27 } }, { s: { r: 0, c: 28 }, e: { r: 0, c: 29 } } ];
            let runningRowIndex = 3;

            pageData.forEach((trip, index) => {
                const groupStartRow = runningRowIndex;
                const labuh = getPayment(trip.pembayaran, 'labuh');
                const rambu = getPayment(trip.pembayaran, 'rambu');
                let formattedSPB = '-';
                if (trip.spb?.no_spb && trip.tanggal_clearance) {
                    const tglClearance = new Date(trip.tanggal_clearance);
                    const bulan = tglClearance.getMonth() + 1;
                    const tahun = tglClearance.getFullYear();
                    formattedSPB = `N.7 K.M.17 ${trip.spb.no_spb} ${bulan} ${tahun}`;
                }
                const baseData = [ index + 1, trip.spb?.no_spb_asal || '-', trip.kapal?.nama_kapal || '-', trip.kapal?.jeni?.nama_jenis || '-', trip.kapal?.gt ? Number(trip.kapal.gt) : null, trip.kapal?.call_sign || '-', trip.kapal?.bendera?.kode_negara || '-', trip.datang_dari?.nama_kecamatan || '-', formatDateTime(trip.tanggal_datang, null), trip.sandar?.nama_pelabuhan || '-', trip.tujuan_akhir?.nama_kecamatan || '-', formatDateTime(trip.tanggal_berangkat, trip.pukul_kapal_berangkat), trip.tolak?.nama_pelabuhan || '-', ];
                const endData = [ formattedSPB, labuh.ntpn, labuh.nilai, rambu.ntpn, rambu.nilai, trip.status_muatan_berangkat || '-', trip.agen?.nama_agen || '-' ];
                const allCargo = aggregateCargo(trip);
                const emptyCargoRow = Array(12).fill(null);
                if (allCargo.length === 0) {
                    worksheet.addRow([...baseData, ...emptyCargoRow, ...endData]);
                    runningRowIndex++;
                } else {
                    allCargo.forEach(cargo => {
                        const cargoRow = Array(12).fill(null);
                        if (cargo.jenis_perjalanan === 'datang') {
                            cargoRow[0] = getCargoName(cargo);
                            cargoRow[1] = getCargoJenis(cargo);
                            cargoRow[2] = cargo.type === 'penumpang' ? null : (cargo.ton ? Number(cargo.ton) : null);
                            cargoRow[3] = cargo.type === 'penumpang' ? null : (cargo.m3 ? Number(cargo.m3) : null);
                            cargoRow[4] = cargo.type === 'penumpang' ? null : (cargo.unit ? Number(cargo.unit) : null);
                            cargoRow[5] = cargo.type === 'penumpang' ? cargo.jumlah_orang : null;
                        } else {
                            cargoRow[6] = getCargoName(cargo);
                            cargoRow[7] = getCargoJenis(cargo);
                            cargoRow[8] = cargo.type === 'penumpang' ? null : (cargo.ton ? Number(cargo.ton) : null);
                            cargoRow[9] = cargo.type === 'penumpang' ? null : (cargo.m3 ? Number(cargo.m3) : null);
                            cargoRow[10] = cargo.type === 'penumpang' ? null : (cargo.unit ? Number(cargo.unit) : null);
                            cargoRow[11] = cargo.type === 'penumpang' ? cargo.jumlah_orang : null;
                        }
                        worksheet.addRow([...baseData, ...cargoRow, ...endData]);
                        runningRowIndex++;
                    });
                }
                const groupEndRow = runningRowIndex - 1;
                if (groupStartRow < groupEndRow) {
                    for (let c = 1; c <= 13; c++) {
                        merges.push({ s: { r: groupStartRow-1, c: c-1 }, e: { r: groupEndRow-1, c: c-1 } });
                    }
                    for (let c = 26; c <= 32; c++) {
                        merges.push({ s: { r: groupStartRow-1, c: c-1 }, e: { r: groupEndRow-1, c: c-1 } });
                    }
                }
            });
            
            merges.forEach(merge => {
                worksheet.mergeCells(merge.s.r + 1, merge.s.c + 1, merge.e.r + 1, merge.e.c + 1);
            });
            const borderStyle = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            const alignmentStyle = { vertical: 'middle', horizontal: 'center' };
            const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
            worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    cell.border = borderStyle;
                    cell.alignment = alignmentStyle;
                    if (rowNumber <= 2) {
                        cell.font = { bold: true };
                        cell.fill = headerFill;
                    }
                });
            });
            worksheet.columns = [ { width: 4 }, { width: 18 }, { width: 20 }, { width: 20 }, { width: 8 }, { width: 10 }, { width: 12 }, { width: 15 }, { width: 18 }, { width: 20 }, { width: 15 }, { width: 18 }, { width: 20 }, { width: 18 }, { width: 10 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 18 }, { width: 10 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 25 }, { width: 18 }, { width: 12 }, { width: 18 }, { width: 12 }, { width: 15 }, { width: 25 } ];
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(blob, `laporan_bongkar_muat_${new Date().toISOString().slice(0, 10)}.xlsx`);

            toast.dismiss(loadingToast);
            toast.success("Ekspor Laporan Lengkap berhasil!");

        } catch (err) {
            console.error("Error writing excel buffer", err);
            toast.dismiss(loadingToast);
            toast.error("Gagal membuat file Excel.");
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