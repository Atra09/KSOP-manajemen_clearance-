import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Label from '../form/Label';
import InputField from '../form/InputField';
import Select from '../form/Select';
import Button from '../ui/Button';
import axiosInstance from '../../api/axiosInstance';

const roleOptions = [
    { value: '', label: 'Pilih Role', disabled: true },
    { value: 'superuser', label: 'Superuser' },
    { value: 'koordinator', label: 'Koordinator' },
    { value: 'user', label: 'User' },
];

const wilkerOptions = [
    { value: '', label: 'Pilih Wilayah Kerja', disabled: true },
    { value: 'Pusat', label: 'Pusat' },
    { value: 'Dungkek', label: 'Dungkek' },
];

export default function EditProfileModal({ user, onClose, onSuccess }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    nama_lengkap: user?.nama_lengkap || '',
    username: user?.username || '',
    email: user?.email || '',
    no_hp: user?.no_hp || '',
    jabatan: user?.jabatan || '',
    wilayah_kerja: user?.wilayah_kerja || '',
    password: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    user?.foto ? `${API_URL}/${user.foto}` : '/images/user/owner.jpeg'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const ext = file.name.split('.').pop().toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png'];

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      toast.error('Format file tidak sesuai! Hanya file PNG, JPG, dan JPEG yang diperbolehkan.');
      e.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Ukuran file terlalu besar! Maksimal 5MB.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('nama_lengkap', formData.nama_lengkap);
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('no_hp', formData.no_hp);
      data.append('jabatan', formData.jabatan);
      data.append('wilayah_kerja', formData.wilayah_kerja);


      if (formData.password && formData.password.trim() !== '') {
        data.append('password', formData.password);
      }

      if (selectedFile) {
        data.append('foto', selectedFile);
      }

      await axiosInstance.patch(`/users/update/${user.id_user}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Profil berhasil diperbarui!');
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui profil.';
      toast.error(errorMessage);
      console.error('Update Profile Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-bold text-gray-800">Edit Profil</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-24 w-24 rounded-full border-2 border-indigo-100 overflow-hidden shadow-sm">
                <img
                  src={previewUrl}
                  alt="Foto Profil"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/user/owner.jpeg';
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="foto"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <span>Ganti Foto Profil</span>
                </label>
                <input
                  type="file"
                  id="foto"
                  name="foto"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="mt-1 text-center text-xs text-gray-400">
                  Format: JPG, JPEG, PNG (Maks 5MB)
                </p>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                  <InputField
                    id="nama_lengkap"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <InputField
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <InputField
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@domain.com"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="no_hp">Nomor HP</Label>
                  <InputField
                    type="text"
                    id="no_hp"
                    name="no_hp"
                    value={formData.no_hp}
                    onChange={handleChange}
                    placeholder="08123456789"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="jabatan">Jabatan</Label>
                <InputField
                  id="jabatan"
                  name="jabatan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wilayah_kerja">Wilayah Kerja</Label>
                  <Select
                    name="wilayah_kerja"
                    id="wilayah_kerja"
                    value={formData.wilayah_kerja}
                    onChange={handleChange}
                    options={wilkerOptions}
                    required
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <div className="h-11 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-600 capitalize">
                    {user?.role || '-'}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Role hanya dapat diubah melalui Manajemen User</p>
                </div>
              </div>

              <div>
                <Label htmlFor="password">
                  Password Baru <span className="text-gray-400 font-normal">(Opsional)</span>
                </Label>
                <InputField
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4 rounded-b-2xl">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
