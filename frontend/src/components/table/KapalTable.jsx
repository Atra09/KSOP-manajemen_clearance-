import { useState, useRef } from 'react';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import { MoreDotIcon } from '../../icons';

const ActionDropdown = ({ item, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

  const handleEditClick = () => {
    onEdit(item);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
        <MoreDotIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </button>
      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} triggerRef={triggerRef} className="absolute right-0 top-full z-10 mt-1 flex w-40 flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 shadow-lg">
        <DropdownItem onItemClick={handleEditClick} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Edit</DropdownItem>
        <DropdownItem onItemClick={() => { onDelete(item); setIsOpen(false);  }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50">Hapus</DropdownItem>
      </Dropdown>
    </div>
  );
};

const KapalTable = ({ data = [], onEdit, onDelete, jenisList = [], benderaList = [] }) => {
  function getkapalName(jenisId) {
    let jenis = jenisList.find(j => j.id_jenis === jenisId)
    return jenis ? jenis.nama_jenis : "Tidak diketahui"
  }

  function getBendera(benderaId) {
    let bendera = benderaList.find(b => b.id_negara === benderaId)
    return bendera ? bendera.kode_negara : "Tidak diketahui"
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Kapal</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jenis</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bendera</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kedudukan Kapal</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GT / NT</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No. & Tanda Selar</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No. IMO / Call Sign</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {data.map((item) => (
            <tr key={item.id_kapal}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.nama_kapal}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getkapalName(item.id_jenis)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getBendera(item.id_bendera)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.asal_kapal?.nama_asal_kapal || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.gt} / {item.nt}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.nomor_selar} / {item.tanda_selar}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.nomor_imo} / {item.call_sign}</td>
              <td className="px-6 py-4 flex justify-end">
                <ActionDropdown item={item} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KapalTable;