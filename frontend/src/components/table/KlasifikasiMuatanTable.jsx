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
            <button ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors">
                <MoreDotIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} triggerRef={triggerRef} className="absolute right-0 top-full z-10 mt-1 flex w-40 flex-col rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <DropdownItem onItemClick={handleEditClick} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 font-medium">
                    Edit
                </DropdownItem>
                <DropdownItem onItemClick={() => { onDelete(item); setIsOpen(false); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium">
                    Hapus
                </DropdownItem>
            </Dropdown>
        </div>
    );
};

function KlasifikasiMuatanTable({ data = [], onEdit, onDelete }) {
    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/80">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">No.</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Klasifikasi</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keterangan</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <tr key={item.id_klasifikasi_muatan} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-200">{item.nama_klasifikasi_muatan}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.keterangan_klasifikasi || '-'}</td>
                                <td className="px-6 py-4 flex justify-end">
                                    <ActionDropdown item={item} onEdit={onEdit} onDelete={onDelete} />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                                Tidak ada data klasifikasi muatan yang tersedia.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default KlasifikasiMuatanTable;
