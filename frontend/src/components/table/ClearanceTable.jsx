import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import { MoreDotIcon } from '../../icons';
import axiosInstance from '../../api/axiosInstance';

const colorMap = {
  emerald: {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
    item: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
    row: 'bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 border-l-4 border-l-emerald-500'
  },
  amber: {
    badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300',
    item: 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40',
    row: 'bg-amber-50/90 dark:bg-amber-950/40 hover:bg-amber-100/90 border-l-4 border-l-amber-500 text-amber-950 dark:text-amber-200 font-medium'
  },
  red: {
    badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300',
    item: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40',
    row: 'bg-red-50/90 dark:bg-red-950/40 hover:bg-red-100/90 border-l-4 border-l-red-500 text-red-950 dark:text-red-200 font-medium'
  },
  blue: {
    badge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300',
    item: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40',
    row: 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/60 border-l-4 border-l-blue-500'
  },
  purple: {
    badge: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300',
    item: 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40',
    row: 'bg-purple-50/70 dark:bg-purple-950/30 hover:bg-purple-100/80 border-l-4 border-l-purple-500'
  },
  gray: {
    badge: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300',
    item: 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/40',
    row: 'bg-gray-50/50 dark:bg-gray-800/40 hover:bg-gray-100/60'
  }
};

const ActionDropdown = ({ item, onSuccess, statusCategories = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

  const handleUpdateStatus = async (newStatusKode) => {
    try {
      await axiosInstance.patch(`/perjalanan/status-pelayaran/${item.id_perjalanan}`, {
        status_pelayaran: newStatusKode
      });
      toast.success(`Status pelayaran diubah menjadi ${newStatusKode}!`);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Gagal mengubah status pelayaran.');
      console.error('Update status error:', error);
    } finally {
      setIsOpen(false);
    }
  };

  const handleDelete = (itemToDelete) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-800">
          Apakah Anda yakin ingin menghapus <strong>{itemToDelete.spb?.no_spb || 'data ini'}</strong>?
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axiosInstance.delete(`/perjalanan/delete/${itemToDelete.id_perjalanan}`);
                toast.success('Data berhasil dihapus!');
                if (onSuccess) onSuccess();
              } catch (error) {
                toast.error("Gagal menghapus data.");
                console.error("Delete error:", error);
              }
            }}
            className="w-full px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Ya, Hapus
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Batal
          </button>
        </div>
      </div>
    ));
  };

  const currentStatus = (item.status_pelayaran || 'Terbit').toUpperCase();

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        <MoreDotIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        className="absolute right-0 top-full z-20 mt-1 flex w-52 flex-col rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:bg-gray-800 dark:border-gray-700"
      >
        <Link to={`/clearance/${item.id_perjalanan}`} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Lihat Detail
        </Link>
        
        <Link to={`/clearance/edit/${item.id_perjalanan}`} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Data
        </Link>

        <div className="my-1 border-t border-gray-100 dark:border-gray-700"></div>

        {/* Dynamic Status Actions loaded from Database */}
        {statusCategories
          .filter(cat => cat.kode_status.toUpperCase() !== currentStatus)
          .map(cat => {
            const style = colorMap[cat.badge_color] || colorMap.emerald;
            const labelText = cat.kode_status.toUpperCase() === 'TERBIT' 
              ? 'Set Terbit (Aktif)' 
              : `Tandai ${cat.kode_status}`;

            return (
              <DropdownItem
                key={cat.id_status || cat.kode_status}
                onItemClick={() => handleUpdateStatus(cat.kode_status)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${style.item}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {labelText}
              </DropdownItem>
            );
          })}

        <div className="my-1 border-t border-gray-100 dark:border-gray-700"></div>

        <DropdownItem onItemClick={() => { handleDelete(item); setIsOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Hapus
        </DropdownItem>
      </Dropdown>
    </div>
  );
};

const getSortIcon = (columnKey, sortConfig) => {
    const baseClasses = "ml-1 h-3 w-3 inline-block flex-none rounded";
    if (!sortConfig || sortConfig.key !== columnKey) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} text-gray-300`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        );
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} text-indigo-600`} viewBox="0 0 20 20" fill="currentColor">
             <path d={sortConfig.direction === 'ASC' ? "M3 10h14l-7-7-7 7z" : "M3 10h14l-7 7-7-7z"} />
        </svg>
    );
};

const ClearanceTable = ({ clearanceItems = [], onSuccess, onSort, sortConfig }) => {
  const [statusCategories, setStatusCategories] = useState([]);

  useEffect(() => {
    const fetchStatusCategories = async () => {
      try {
        const res = await axiosInstance.get('/status-pelayaran');
        setStatusCategories(res.data?.datas || []);
      } catch (err) {
        console.error("Gagal memuat kategori status pelayaran di ClearanceTable:", err);
      }
    };
    fetchStatusCategories();
  }, []);

  const renderHeader = (label, sortKey) => (
    <th 
        className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-tight cursor-pointer hover:bg-gray-100 select-none transition-colors dark:text-gray-400 dark:hover:bg-gray-700"
        onClick={() => onSort && onSort(sortKey)}
    >
        <div className="flex items-center">
            {label}
            {getSortIcon(sortKey, sortConfig)}
        </div>
    </th>
  );

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {renderHeader("No. SPB", "no_spb")}
            {renderHeader("No. Register", "no_urut")}
            {renderHeader("No. PPK", "ppk")}
            {renderHeader("Kapal", "nama_kapal")}
            {renderHeader("Nahkoda", "nama_nahkoda")}
            {renderHeader("Tujuan", "tujuan_akhir")}
            {renderHeader("Waktu Keberangkatan", "pukul_kapal_berangkat")}
            {renderHeader("Agen", "nama_agen")}
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800 text-sm">
          {clearanceItems?.length > 0 ? (
            clearanceItems.map((item) => {
              const relStatus = item.status_pelayaran_rel;
              const rawStatus = (relStatus?.kode_status || item.status_pelayaran || 'Terbit').toUpperCase();
              const matchedCat = relStatus || statusCategories.find(c => c.kode_status.toUpperCase() === rawStatus);
              const colorKey = matchedCat?.badge_color || (rawStatus === 'RUSAK' ? 'red' : rawStatus === 'BATAL' ? 'amber' : 'emerald');
              const styleConfig = colorMap[colorKey] || colorMap.emerald;

              const isDefaultTerbit = rawStatus === 'TERBIT';
              const rowStyle = isDefaultTerbit 
                ? "hover:bg-gray-50 transition-colors"
                : styleConfig.row;

              return (
                <tr key={item.id_perjalanan} className={rowStyle}>
                  <td className="px-3 py-3 whitespace-nowrap font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className={!isDefaultTerbit ? 'font-bold' : 'text-indigo-600 dark:text-indigo-400'}>
                        {item.spb?.no_spb || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-medium">{item.no_urut || '-'}</td>
                  <td className="px-3 py-3 whitespace-nowrap opacity-80">{item.ppk || '-'}</td>
                  <td className="px-3 py-3 whitespace-nowrap font-semibold">{item.kapal?.nama_kapal || '-'}</td>
                  <td className="px-3 py-3 whitespace-nowrap opacity-80">{item.nahkoda?.nama_nahkoda || '-'}</td>
                  <td className="px-3 py-3 whitespace-nowrap opacity-80">{item.tujuan_akhir?.nama_kecamatan || '-'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="font-medium">{item.pukul_kapal_berangkat || '-'}</div>
                    <div className="text-xs opacity-70">
                      {item.tanggal_berangkat ? new Date(item.tanggal_berangkat).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap opacity-80">{item.agen?.nama_agen || '-'}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!isDefaultTerbit && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${styleConfig.badge}`}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {rawStatus}
                        </span>
                      )}

                      <ActionDropdown item={item} onSuccess={onSuccess} statusCategories={statusCategories} />
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" className="px-3 py-4 text-center text-gray-500 italic dark:text-gray-400">Tidak ada data clearance yang cocok.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClearanceTable;