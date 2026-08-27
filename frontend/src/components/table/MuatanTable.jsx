import { useState, useRef } from 'react';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import { MoreDotIcon } from '../../icons';

const StatusBadge = ({ status }) => {
    let styleClass = '';
    switch (String(status).toLowerCase()) {
        case 'berbahaya':
            styleClass = 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800';
            break;
        case 'umum':
            styleClass = 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800';
            break;
        default:
            styleClass = 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styleClass}`}>
            {status}
        </span>
    );
};

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

const MuatanTable = ({ muatanItems = [], jenisList = [], onEdit, onDelete }) => {
    
    const getJenisMuatanName = (jenisId) => {
        const jenis = jenisList.find(j => j.id_jenis_muatan === jenisId);
        return jenis ? jenis.nama_jenis_muatan : '-';
    };

    const getKlasifikasiName = (item) => {
        if (item.klasifikasi_muatan && item.klasifikasi_muatan.nama_klasifikasi_muatan) {
            return item.klasifikasi_muatan.nama_klasifikasi_muatan;
        }
        return '-';
    };

    const getSatuanName = (item) => {
        if (item.satuan_muatan && item.satuan_muatan.nama_satuan_muatan) {
            return item.satuan_muatan.nama_satuan_muatan;
        }
        return 'kg';
    };

    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/80">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">No.</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Kategori</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jenis Muatan</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Klasifikasi</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Satuan</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bobot per Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status Kategori</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {muatanItems.length > 0 ? (
                        muatanItems.map((item, index) => (
                            <tr key={item.id_kategori_muatan} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">{item.nama_kategori_muatan}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {getJenisMuatanName(item.id_jenis_muatan)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {getKlasifikasiName(item) !== '-' ? (
                                        <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-md text-xs font-semibold">
                                            {getKlasifikasiName(item)}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-500">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md text-xs font-semibold">
                                        {getSatuanName(item)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {item.bobot_per_unit_kg > 0 ? `${item.bobot_per_unit_kg} kg/unit` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <StatusBadge status={item.status_kategori_muatan} />
                                </td>
                                <td className="px-6 py-4 flex justify-end">
                                    <ActionDropdown item={item} onEdit={onEdit} onDelete={onDelete} />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                                Tidak ada data kategori muatan yang tersedia.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MuatanTable;