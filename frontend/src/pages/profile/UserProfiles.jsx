import { useState } from 'react';
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from '../../context/AuthContext';
import EditProfileModal from '../../components/modal/EditProfileModal';

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-gray-800 font-medium">{value || '-'}</p>
  </div>
);

export default function UserProfiles() {
  const { user, loading, refetchUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Memuat data profil...</p>
      </div>
    );
  }

  if (!loading && !user) {
    return (
      <div className="p-6 text-center">
        <p>Gagal memuat data pengguna. Sesi mungkin telah berakhir. Silakan coba login kembali.</p>
      </div>
    );
  }

  const photoSrc = user.foto 
    ? `${API_URL}/${user.foto}` 
    : "/images/user/owner.jpeg"; 

  return (
    <>
      <PageMeta
        title="Halaman Profil | KSOP Admin"
        description="Ini adalah halaman profil pengguna."
      />
      <PageBreadcrumb pageTitle="Profil" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6">
        <div className="flex items-center justify-between mb-5 lg:mb-7">
          <h3 className="text-lg font-semibold text-gray-800">
            Profil Akun
          </h3>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profil
          </button>
        </div>

        <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 border-b border-dashed pb-6 sm:flex-row">
                <div className="relative h-24 w-24 shrink-0 rounded-full border border-gray-200 overflow-hidden shadow-sm">
                    <img
                      src={photoSrc}
                      alt={user.nama_lengkap || 'User'}
                      className="h-full w-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/user/owner.jpeg";
                      }}
                    />
                </div>
                <div className="text-center sm:text-left">
                    <h4 className="text-xl font-bold text-gray-800">{user.nama_lengkap || 'Nama Belum Diisi'}</h4>
                    <p className="mt-0.5 text-sm text-gray-500">@{user.username || '-'}</p>
                    {user.role && (
                      <span className="mt-2 inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 capitalize">
                        {user.role}
                      </span>
                    )}
                </div>
            </div>

            <div className="pt-2">
                <h4 className="mb-4 text-lg font-semibold text-gray-800">
                    Informasi Pribadi
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailItem label="Nama Lengkap" value={user.nama_lengkap} />
                    <DetailItem label="Username" value={user.username} />
                    <DetailItem label="Email" value={user.email} />
                    <DetailItem label="Telepon" value={user.no_hp} />
                    <DetailItem label="Jabatan" value={user.jabatan} />
                    <DetailItem label="Wilayah Kerja" value={user.wilayah_kerja} />
                    <DetailItem label="Role" value={user.role} />
                </div>
            </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={refetchUser}
        />
      )}
    </>
  );
}