import { useState, useRef } from 'react';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import { MoreDotIcon } from '../../icons';

const RoleBadge = ({ role }) => {
    let styleClass = '';
    switch (String(role).toLowerCase()) {
        case 'admin':
            styleClass = 'bg-blue-100 text-blue-800';
            break;
        case 'user':
            styleClass = 'bg-gray-100 text-gray-800';
            break;
        default:
            styleClass = 'bg-gray-100 text-gray-800';
            break;
    }
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styleClass}`}>
            {role}
        </span>
    );
};

const ActionDropdown = ({ item, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    return (
        <div className="relative">
            <button ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-gray-100 focus:outline-none">
                <MoreDotIcon className="h-5 w-5 text-gray-500" />
            </button>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} triggerRef={triggerRef} className="absolute right-0 top-full z-10 mt-1 flex w-40 flex-col rounded-lg border bg-white p-2 shadow-lg">
                <DropdownItem onItemClick={() => { onEdit(item); setIsOpen(false); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</DropdownItem>
                <DropdownItem onItemClick={() => { onDelete(item); setIsOpen(false);  }}className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50">Hapus</DropdownItem>
            </Dropdown>
        </div>
    );
};

const UserTable = ({ userItems = [], onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wilayah Kerja</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {userItems.length > 0 ? (
                        userItems.map((item) => (
                            <tr key={item.id_user}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.nama_lengkap || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.username || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.jabatan || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.wilayah_kerja || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><RoleBadge role={item.role} /></td>
                                <td className="px-6 py-4 flex justify-end">
                                    <ActionDropdown item={item} onEdit={onEdit} onDelete={onDelete} />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data pengguna.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;