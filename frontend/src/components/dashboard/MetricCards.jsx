import { FaShip, FaCheckCircle } from 'react-icons/fa';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';

const MetricCards = ({ 
  totalKapal = 0, 
  totalPerjalanan = 0, 
  kapalNow = 0, 
  perjalananNow = 0,
  statusStats = { total: 0, terbit: 0, batal: 0, rusak: 0 },
  clearanceLabel = "Clearance Bulan Ini"
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      
      {/* Balok 1: Jumlah Kapal Terdaftar */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 p-5 shadow-sm transition-colors flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
            <FaShip className="h-6 w-6" />
          </div>
          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-950/70 dark:text-green-400">
            +{kapalNow} Baru
          </span>
        </div>
        <div className="mt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Jumlah Kapal Terdaftar
          </span>
          <h4 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {totalKapal}
          </h4>
        </div>
      </div>

      {/* Balok 2: Clearance (Dinamis per Bulan/Tahun) */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 p-5 shadow-sm transition-colors flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
            <FaCheckCircle className="h-6 w-6" />
          </div>
          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-950/70 dark:text-green-400">
            +{perjalananNow} Baru
          </span>
        </div>
        <div className="mt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {clearanceLabel}
          </span>
          <h4 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {totalPerjalanan}
          </h4>
        </div>
      </div>

      {/* Balok 3: SPB Terbit */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 p-5 shadow-sm transition-colors flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
            <HiOutlineCheckCircle className="h-7 w-7" />
          </div>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
            Total: {statusStats.total}
          </span>
        </div>
        <div className="mt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            SPB Terbit
          </span>
          <h4 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {statusStats.terbit}
          </h4>
        </div>
      </div>

      {/* Balok 4: Status Batal & Rusak */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 p-5 shadow-sm transition-colors flex flex-col justify-between h-full">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
            STATUS
          </span>
          <div className="flex items-center gap-1">
            <div className="p-1 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400">
              <HiOutlineXCircle className="h-4 w-4" />
            </div>
            <div className="p-1 rounded-md bg-red-50 text-red-600 dark:bg-red-950/80 dark:text-red-400">
              <HiOutlineExclamationTriangle className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-800 items-center text-center">
          {/* Sub-item: Batal */}
          <div className="px-2">
            <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 block">
              Batal
            </span>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
              {statusStats.batal}
            </h4>
          </div>

          {/* Sub-item: Rusak */}
          <div className="px-2">
            <span className="text-xs font-bold uppercase text-red-600 dark:text-red-400 block">
              Rusak
            </span>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
              {statusStats.rusak}
            </h4>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MetricCards;