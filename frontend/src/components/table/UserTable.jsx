import { useState, useRef } from 'react';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import { MoreDotIcon } from '../../icons';

const RoleBadge = ({ role }) => {
    let styleClass = '';
    const roleLower = String(role || '').toLowerCase();
    switch (roleLower) {
        case 'superuser':
        case 'admin':
            styleClass = 'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800';
            break;
        case 'koordinator':
            styleClass = 'bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800';
            break;
        case 'user':
            styleClass = 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800';
            break;
        default:
            styleClass = 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
            break;
    }
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styleClass}`}>
            {role}
        </span>
    );
};

const ActionDropdown = ({ item, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    return (
        <div className="relative">
            <button ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors">
                <MoreDotIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} triggerRef={triggerRef} className="absolute right-0 top-full z-10 mt-1 flex w-40 flex-col rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <DropdownItem onItemClick={() => { onEdit(item); setIsOpen(false); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 font-medium">Edit</DropdownItem>
                <DropdownItem onItemClick={() => { onDelete(item); setIsOpen(false); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium">Hapus</DropdownItem>
            </Dropdown>
        </div>
    );
};

const UserTable = ({ userItems = [], onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/80">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Lengkap</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jabatan</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Wilayah Kerja</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {userItems.length > 0 ? (
                        userItems.map((item) => (
                            <tr key={item.id_user} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">{item.nama_lengkap || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{item.username || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{item.jabatan || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{item.wilayah_kerja || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><RoleBadge role={item.role} /></td>
                                <td className="px-6 py-4 flex justify-end">
                                    <ActionDropdown item={item} onEdit={onEdit} onDelete={onDelete} />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400 italic">Tidak ada data pengguna.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;