import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance'; 

import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from '../../components/form/Label';
import InputField from '../../components/form/InputField';
import Button from '../../components/ui/Button';
import FileInput from '../../components/form/FileInput';

const Settings = () => {
    const { user, loading: userLoading } = useAuth();

    const [userInfo, setUserInfo] = useState({
        nama_lengkap: '',
        username: '',
        email: '',
        no_hp: '',
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [isInfoSubmitting, setIsInfoSubmitting] = useState(false);

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
    });
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setUserInfo({
                nama_lengkap: user.nama_lengkap || '',
                username: user.username || '',
                email: user.email || '',
                no_hp: user.no_hp || '',
            });
        }
    }, [user]);

    const handleInfoChange = (e) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        if (!user) return toast.error("Data pengguna tidak ditemukan.");
        setIsInfoSubmitting(true);

        const formData = new FormData();
        formData.append('nama_lengkap', userInfo.nama_lengkap);
        formData.append('username', userInfo.username);
        formData.append('email', userInfo.email);
        formData.append('no_hp', userInfo.no_hp);
        if (selectedFile) {
            formData.append('foto', selectedFile);
        }

        try {
            await axiosInstance.patch(`/users/update/${user.id_user}`, formData);
            toast.success('Informasi pribadi berhasil diperbarui!');
            window.location.reload(); 
        } catch (error) {
            const errorMessage = error.response?.data?.msg || "Gagal memperbarui informasi.";
            toast.error(errorMessage);
        } finally {
            setIsInfoSubmitting(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsPasswordSubmitting(true);
        try {
            await axiosInstance.patch('/users/change-password', passwords);
            toast.success('Password berhasil diubah!');
            setPasswords({ currentPassword: '', newPassword: '' }); 
        } catch (error) {
            const errorMessage = error.response?.data?.msg || "Gagal mengubah password.";
            toast.error(errorMessage);
        } finally {
            setIsPasswordSubmitting(false);
        }
    };

    if (userLoading) {
        return <div className="p-6 text-center">Memuat pengaturan...</div>;
    }

    return (
        <>
            <PageMeta title="Pengaturan Akun" />
            <PageBreadcrumb pageTitle="Pengaturan" />

            <div className="grid grid-cols-1 gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-5 text-lg font-semibold text-gray-800">
                        Informasi Pribadi
                    </h3>
                    <form onSubmit={handleInfoSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                                <InputField id="nama_lengkap" name="nama_lengkap" type="text" value={userInfo.nama_lengkap} onChange={handleInfoChange} />
                            </div>
                            <div>
                                <Label htmlFor="username">Username</Label>
                                <InputField id="username" name="username" type="text" value={userInfo.username} onChange={handleInfoChange} />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <InputField id="email" name="email" type="email" value={userInfo.email} onChange={handleInfoChange} />
                            </div>
                            <div className="sm:col-span-2">
                                <Label htmlFor="no_hp">Nomor Telepon</Label>
                                <InputField id="no_hp" name="no_hp" type="tel" value={userInfo.no_hp} onChange={handleInfoChange} />
                            </div>
                            <div className="sm:col-span-2">
                                <Label htmlFor="photo">Foto Profil</Label>
                                <FileInput id="photo" name="photo" onChange={handleFileChange} />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isInfoSubmitting}>
                                {isInfoSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-5 text-lg font-semibold text-gray-800">
                        Ubah Password
                    </h3>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="currentPassword">Password Saat Ini</Label>
                            <InputField id="currentPassword" name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePasswordChange} required />
                        </div>
                        <div>
                            <Label htmlFor="newPassword">Password Baru</Label>
                            <InputField id="newPassword" name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordChange} required />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPasswordSubmitting}>
                                {isPasswordSubmitting ? 'Menyimpan...' : 'Ubah Password'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Settings;