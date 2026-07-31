import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import { MoreDotIcon } from '../../icons';
import axiosInstance from '../../api/axiosInstance';

const ActionDropdown = ({ item, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

  const handleDelete = (itemToDelete) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p>Apakah Anda yakin ingin menghapus <strong>{itemToDelete.spb?.no_spb || 'data ini'}</strong>?</p>
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

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <MoreDotIcon className="h-5 w-5 text-gray-500" />
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        className="absolute right-0 top-full z-10 mt-1 flex w-40 flex-col rounded-lg border bg-white p-2 shadow-lg"
      >
        <Link to={`/clearance/${item.id_perjalanan}`} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Lihat Detail
        </Link>
        <Link to={`/clearance/edit/${item.id_perjalanan}`} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Edit
        </Link>
        <DropdownItem onItemClick={() => {handleDelete(item); setIsOpen(false); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50">
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
  
  const renderHeader = (label, sortKey) => (
    <th 
        className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-tight cursor-pointer hover:bg-gray-100 select-none transition-colors"
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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {renderHeader("No.Register", "no_urut")}
            {renderHeader("No. SPB", "no_spb")}
            {renderHeader("No. PPK", "ppk")}
            {renderHeader("Kapal", "nama_kapal")}
            {renderHeader("Nahkoda", "nama_nahkoda")}
            {renderHeader("Tujuan", "tujuan_akhir")}
            {renderHeader("Tgl", "tanggal_berangkat")}
            {renderHeader("Waktu", "pukul_kapal_berangkat")}
            {renderHeader("Agen", "nama_agen")}
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 text-sm">
          {clearanceItems?.length > 0 ? (
            clearanceItems.map((item) => (
              <tr key={item.id_perjalanan} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-3 whitespace-nowrap text-gray-600">{item.no_urut || '-'}</td>
                <td className="px-3 py-3 whitespace-nowrap font-medium text-gray-900">{item.spb?.no_spb || '-'}</td>
                <td className="px-3 py-3 whitespace-nowrap text-gray-500">{item.ppk || '-'}</td>
                <td className="px-3 py-3 whitespace-nowrap text-gray-500">{item.kapal?.nama_kapal || '-'}</td>
                <td className="px-3 py-3 whitespace-nowrap text-gray-500">{item.nahkoda?.nama_nahkoda || '-'}</td>
                <td className="px-3 py-3 whitespace-nowrap text-gray-500">{item.tujuan_akhir?.nama_kecamatan || '-'}</td>
                <td className="px-3 py-3 whitespace-nowrap text-gray-500">
                  {item.tanggal_berangkat ? new Date(item.tanggal_berangkat).toLocaleDateString('en-GB').replace(/\//g, '-') : '-'}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-gray-500 text-center">{item.pukul_kapal_berangkat || '-'}</td>
                <td className="px-3 py-3 whitespace-nowrap text-gray-500">{item.agen?.nama_agen || '-'}</td>
                <td className="px-3 py-3 flex justify-end">
                  <ActionDropdown item={item} onSuccess={onSuccess} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="px-3 py-4 text-center text-gray-500 italic">Tidak ada data clearance yang cocok.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClearanceTable;