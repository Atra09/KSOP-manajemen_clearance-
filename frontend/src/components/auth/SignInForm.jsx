import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import InputField from "../form/InputField";
import Button from "../ui/Button";
import axiosInstance from '../../api/axiosInstance'; 
import { useAuth } from '../../context/AuthContext';

export default function SignInForm() {
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const response = await axiosInstance.post('/users/login', {
                username: formData.username,
                password: formData.password
            });

            const token = response.data.token;
            if (token) {
                await login(token);
                toast.success('Login berhasil! Mengarahkan ke dashboard...');
                navigate('/');
            } else {
                const msg = "Gagal login: Token tidak diterima.";
                setError(msg);
            }

        } catch (error) {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan. Coba lagi.";
            setError(errorMessage);
            console.error("Login Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-1 flex-col overflow-y-auto lg:w-1/2">
            <div className="mx-auto flex flex-1 w-full max-w-md flex-col justify-center">
                <div>
                    <div className="mb-8">
                        <h1 className="mb-2 text-2xl font-semibold text-gray-800 sm:text-3xl">
                            Sign In
                        </h1>
                        <p className="text-sm text-gray-500">
                            Masukkan username dan password Anda untuk masuk!
                        </p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {error && (
                                <div className="p-3 text-sm text-center text-red-800 bg-red-100 border border-red-300 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div>
                                <Label htmlFor="username">Username</Label>
                                <InputField 
                                    id="username" 
                                    name="username" 
                                    type="text" 
                                    placeholder="Masukkan username Anda" 
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <InputField
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Masukkan password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <EyeIcon className="h-5 w-5 fill-gray-500" />
                                        ) : (
                                            <EyeCloseIcon className="h-5 w-5 fill-gray-500" />
                                        )}
                                    </span>
                                </div>
                            </div>
                            <hr class="border-t border-gray-500 w-1/2 mx-auto my-6"></hr>
                            <div>
                                <Button className="w-full" type="submit" disabled={loading}>
                                    {loading ? 'Memproses...' : 'Sign In'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}