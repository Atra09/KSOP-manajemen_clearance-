import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function ExportMonthlyModal({ isOpen, onClose, onExport, initialReportType = 'register' }) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1 - 12
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [reportType, setReportType] = useState(initialReportType); // 'register' | 'bongkar_muat'
  const [previewCount, setPreviewCount] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReportType(initialReportType);
    }
  }, [isOpen, initialReportType]);

  // Fetch count preview when month or year changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchCount = async () => {
      setLoadingPreview(true);
      try {
        const strMonth = String(selectedMonth).padStart(2, '0');
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        const startDate = `${selectedYear}-${strMonth}-01`;
        const endDate = `${selectedYear}-${strMonth}-${String(lastDay).padStart(2, '0')}`;

        const res = await axiosInstance.get('/perjalanan/filter', {
          params: {
            page: 1,
            limit: 1,
            tanggal_awal: startDate,
            tanggal_akhir: endDate
          }
        });

        if (isMounted) {
          setPreviewCount(res.data?.totalData || 0);
        }
      } catch (err) {
        console.error('Error fetching preview count:', err);
        if (isMounted) setPreviewCount(null);
      } finally {
        if (isMounted) setLoadingPreview(false);
      }
    };

    fetchCount();
    return () => { isMounted = false; };
  }, [isOpen, selectedMonth, selectedYear]);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear - 3; y <= currentYear + 1; y++) {
    yearOptions.push(y);
  }

  const handleExportClick = () => {
    onExport({
      month: selectedMonth,
      year: selectedYear,
      monthName: MONTH_NAMES[selectedMonth - 1],
      reportType
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ekspor Laporan Bulanan</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pilih periode bulan dan jenis laporan yang ingin diunduh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg p-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="py-5 space-y-4">
          
          {/* Report Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Jenis Laporan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReportType('register')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-1 ${
                  reportType === 'register'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200 dark:shadow-none'
                    : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>Laporan Register</span>
                <span className="text-[10px] opacity-80 font-normal">(Laporan SPB & Kapal)</span>
              </button>

              <button
                type="button"
                onClick={() => setReportType('bongkar_muat')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-1 ${
                  reportType === 'bongkar_muat'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200 dark:shadow-none'
                    : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>Laporan Bongkar Muat</span>
                <span className="text-[10px] opacity-80 font-normal">(Muatan & Penumpang)</span>
              </button>
            </div>
          </div>

          {/* Month & Year Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Bulan
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Tahun
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview Info Box */}
          <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-xs text-indigo-950 dark:text-indigo-200 font-medium">
                Periode: <strong className="font-bold">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</strong>
              </span>
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold bg-white dark:bg-indigo-900/60 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800">
              {loadingPreview ? (
                <span className="opacity-70">Memuat...</span>
              ) : previewCount !== null ? (
                <span>{previewCount} Transaksi</span>
              ) : (
                <span>- Data</span>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExportClick}
            disabled={loadingPreview || previewCount === 0}
            className={`px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-md transition-all flex items-center gap-2 ${
              loadingPreview || previewCount === 0
                ? 'bg-indigo-300 dark:bg-indigo-900/50 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-200 dark:shadow-none'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Unduh Excel (.xlsx)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
