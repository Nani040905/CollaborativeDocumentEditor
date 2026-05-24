import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import { Mail, Lock, LogIn } from 'lucide-react';
import InputField from '../Common/Form/InputField';
import SubmitButton from '../Common/Form/SubmitButton';

const Login = () => {
    const navigate = useNavigate();
    const { login, error: authError, clearErrors } = useAuthStore();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        clearErrors();

        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password.');
            return;
        }

        setLoading(true);
        const res = await login(email, password);
        setLoading(false);

        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.error || 'Invalid credentials');
        }
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900/60 p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-100">Welcome Back</h2>
                    <p className="mt-2 text-xs text-slate-400">Sign in to your collaborative editor workspace</p>
                </div>

                {(error || authError) && (
                    <div className="mb-4 rounded border border-red-900 bg-red-950/40 p-3 text-xs text-red-400">
                        {error || authError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <InputField
                        label="Email Address"
                        type="email"
                        icon={Mail}
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <InputField
                        label="Password"
                        type="password"
                        icon={Lock}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        showPasswordToggle
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                    />

                    <SubmitButton 
                        loading={loading}
                        loadingText="Signing In..."
                        defaultText="Sign In"
                        icon={LogIn}
                    />
                </form>

                <div className="mt-6 text-center text-xs text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-500 hover:underline">
                        Create account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
