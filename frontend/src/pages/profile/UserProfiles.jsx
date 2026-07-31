import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from '../../context/AuthContext';

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-gray-800">{value}</p>
  </div>
);

export default function UserProfiles() {
  const { user, loading } = useAuth();
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
        <h3 className="mb-5 text-lg font-semibold text-gray-800 lg:mb-7">
          Profil Akun
        </h3>
        <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 border-b border-dashed pb-6 sm:flex-row">
                <div className="relative h-24 w-24 shrink-0 rounded-full">
                    <img
                    src={photoSrc}
                    alt={user.nama_lengkap}
                    className="h-full w-full rounded-full object-cover"
                    />
                </div>
                <div className="text-center sm:text-left">
                    <h4 className="text-xl font-bold text-gray-800">{user.nama_lengkap || 'Nama Belum Diisi'}</h4>
                    <p className="mt-0.5 text-sm text-gray-500">{user.username}</p>
                </div>
            </div>

            <div className="pt-6">
                <h4 className="mb-4 text-lg font-semibold text-gray-800">
                    Informasi Pribadi
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailItem label="Nama Lengkap" value={user.nama_lengkap || '-'} />
                    <DetailItem label="Email" value={user.email || '-'} />
                    <DetailItem label="Telepon" value={user.no_hp || '-'} />
                    <DetailItem label="Jabatan" value={user.jabatan || '-'} />
                </div>
            </div>
        </div>
      </div>
    </>
  );
}