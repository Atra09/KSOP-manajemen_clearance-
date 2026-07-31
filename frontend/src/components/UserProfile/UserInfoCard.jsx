const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value || '-'}</p>
  </div>
);

export default function UserInfoCard({ user }) {
  if (!user) return null;

  return (
    <div className="rounded-lg border p-4">
      <h5 className="mb-4 text-lg font-semibold text-gray-800">Informasi Pribadi</h5>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailItem label="Nama Lengkap" value={user.name} />
        <DetailItem label="Email" value={user.email} />
        <DetailItem label="Telepon" value={user.phone} />
        <DetailItem label="Jabatan" value={user.bio} />
      </div>
    </div>
  );
}