import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import DetailItem from '../../components/ui/DetailItem';
import MuatanDetailTable from '../../components/table/MuatanDetailTable';
import PenumpangDetailTable from '../../components/table/PenumpangDetailTable';
import KendaraanDetailTable from '../../components/table/KendaraanDetailTable';
import PrintableSPB from '../../components/clearance/PrintableSPB';
import ConfirmationModal from '../../components/modal/ConfirmationModal';
import axiosInstance from '../../api/axiosInstance';

const DetailClearance = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('barangDatang');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const printRef = useRef();

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await axiosInstance.get(`/perjalanan/${id}`);
                setData(response.data.data);
            } catch (error) {
                toast.error("Gagal memuat detail data.");
                console.error(error);
            }
        };
        if (id) fetchDetail();
    }, [id]);

    const handlePrint = () => window.print();
    
    const handleConfirmDelete = async () => {
        if (data) {
            try {
                await axiosInstance.delete(`/perjalanan/${data.id_perjalanan}`);
                toast.success(`Data SPB ${data.spb.no_spb} berhasil dihapus.`);
                navigate('/clearance');
            } catch (error) {
                toast.error(error.response?.data?.msg || "Gagal menghapus data.");
            } finally {
                setIsConfirmOpen(false);
            }
        }
    };

    if (!data) return <div className="p-6 text-center">Memuat data...</div>;

    const barangDatang = data.muatans?.filter(d => d.jenis_perjalanan === "datang") || [];
    const barangBerangkat = data.muatans?.filter(d => d.jenis_perjalanan === "berangkat") || [];
    const kendaraanDatang = data.muatan_kendaraan?.filter(d => d.jenis_perjalanan === "datang") || [];
    const kendaraanBerangkat = data.muatan_kendaraan?.filter(d => d.jenis_perjalanan === "berangkat") || [];

    const pembayaranRambu = data.pembayaran?.find(p => p.tipe_pembayaran === 'rambu') || {};
    const pembayaranLabuh = data.pembayaran?.find(p => p.tipe_pembayaran === 'labuh') || {};

    const tabClass = (tabName) => `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tabName ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`;
    
    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';
    };
    
    const formatCurrency = (value) => {
        return value ? `Rp ${Number(value).toLocaleString('id-ID')}` : '-';
    };

    return (
        <>
            <Helmet>
                <title>SPB No. {data.spb?.no_spb || 'Detail'}</title>
            </Helmet>
            <div className="screen-only">
                <div className="p-4 md:p-6 space-y-6">
                    <div>
                        <Link to="/clearance" className="text-sm text-gray-500 hover:text-indigo-600 inline-flex items-center gap-2 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Kembali ke Daftar Clearance
                        </Link>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <h1 className="text-2xl font-bold text-gray-800">Detail SPB: {data.spb?.no_spb || '-'}</h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <Link to={`/clearance/edit/${data.id_perjalanan}`} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">Edit Data</Link>
                                <button onClick={() => setIsConfirmOpen(true)} className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">Hapus</button>
                                <button onClick={handlePrint} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cetak SPB</button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-6">
                        <h3 className="text-xl font-bold text-gray-800">Informasi Umum & Kapal</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <DetailItem label="Jenis PPK" value={data.ppk || '-'} />
                            <DetailItem label="Nomor Register" value={data.no_urut || '-'} />
                            <DetailItem label="No SPB Asal" value={data.spb?.no_spb_asal || '-'} />
                            <DetailItem label="Tanggal Clearance" value={formatDate(data.tanggal_clearance)} />
                            <DetailItem label="Pukul Clearance" value={data.pukul_agen_clearance || '-'} />
                        </div>
                        <div className="space-y-4 border-t pt-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <DetailItem label="Nama Kapal" value={data.kapal?.nama_kapal || '-'} />
                                <DetailItem label="Nahkoda" value={data.nahkoda?.nama_nahkoda || '-'} />
                                <DetailItem label="Jumlah Crew" value={data.jumlah_crew || '-'} />
                                <DetailItem label="Agen" value={data.agen?.nama_agen || '-'} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-6">
                        <h3 className="text-xl font-bold text-gray-800">Informasi Perjalanan</h3>
                        
                        <div className="space-y-4">
                            <h4 className="text-md font-semibold text-gray-700">Kedatangan</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <DetailItem label="Datang Dari" value={data.datang_dari?.nama_kecamatan || '-'} />
                                <DetailItem label="Sandar Di" value={data.sandar?.nama_pelabuhan || '-'} />
                                <DetailItem label="Tanggal Datang" value={formatDate(data.tanggal_datang)} />
                                <DetailItem label="Kedudukan Kapal" value={data.kedudukan_kapal?.nama_kabupaten || '-'} />
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-4">
                            <h4 className="text-md font-semibold text-gray-700">Keberangkatan</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <DetailItem label="Tolak Dari" value={data.tolak?.nama_pelabuhan || '-'} />
                                <DetailItem label="Tujuan Akhir" value={data.tujuan_akhir?.nama_kecamatan || '-'} />
                                <DetailItem label="Tanggal Berangkat" value={formatDate(data.tanggal_berangkat)} />
                                <DetailItem label="Pukul Berangkat" value={data.pukul_kapal_berangkat || '-'} />
                                <DetailItem label="Pelabuhan Singgah" value={data.tempat_singgah?.nama_kecamatan || '-'} />
                                <DetailItem label="Status Muatan Berangkat" value={data.status_muatan_berangkat || '-'} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-6">
                        <h3 className="text-xl font-bold text-gray-800">Informasi Pembayaran</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <DetailItem label="NTPN Rambu" value={pembayaranRambu.ntpn || '-'} />
                            <DetailItem label="Nilai Rambu" value={formatCurrency(pembayaranRambu.nilai)} />
                            <DetailItem label="NTPN Labuh" value={pembayaranLabuh.ntpn || '-'} />
                            <DetailItem label="Nilai Labuh" value={formatCurrency(pembayaranLabuh.nilai)} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex gap-x-4 px-4 overflow-x-auto" aria-label="Tabs">
                                <button onClick={() => setActiveTab('barangDatang')} className={tabClass('barangDatang')}>Barang Datang</button>
                                <button onClick={() => setActiveTab('barangBerangkat')} className={tabClass('barangBerangkat')}>Barang Berangkat</button>
                                <button onClick={() => setActiveTab('kendaraanDatang')} className={tabClass('kendaraanDatang')}>Kendaraan Datang</button>
                                <button onClick={() => setActiveTab('kendaraanBerangkat')} className={tabClass('kendaraanBerangkat')}>Kendaraan Berangkat</button>
                                <button onClick={() => setActiveTab('penumpang')} className={tabClass('penumpang')}>Penumpang</button>
                            </nav>
                        </div>
                        <div className="p-4">
                            {activeTab === 'barangDatang' && <MuatanDetailTable data={barangDatang} />}
                            {activeTab === 'barangBerangkat' && <MuatanDetailTable data={barangBerangkat} />}
                            {activeTab === 'kendaraanDatang' && <KendaraanDetailTable data={kendaraanDatang} />}
                            {activeTab === 'kendaraanBerangkat' && <KendaraanDetailTable data={kendaraanBerangkat} />}
                            {activeTab === 'penumpang' && <PenumpangDetailTable data={data} />}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="print-only">
                <PrintableSPB data={data} ref={printRef} />
            </div>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Konfirmasi Hapus"
                message={`Apakah Anda yakin ingin menghapus data clearance dengan SPB ${data?.spb?.no_spb}?`}
            />
        </>
    );
};

export default DetailClearance;