import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

/**
 * Login Authentication Form Component.
 * Captures user credentials, verifies non-empty states, dispatches auth store login actions,
 * handles API responses and dynamic redirection to secured dashboard workspace.
 */
const Login = () => {
    const navigate = useNavigate();
    
    // Extract authentication states and actions from the Zustand global store
    const { login, error: authError, clearErrors } = useAuthStore();
    
    // Local input and loading state parameters
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Submit handler for user credentials authentication.
     * Restricts empty values and submits request to API servers.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        clearErrors(); // Flush previous authentication stores errors prior to new submit

        // Assert form validity
        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password.');
            return;
        }

        setLoading(true);
        // Dispatch credential logins
        const res = await login(email, password);
        setLoading(false);

        // Redirect user to workspace dashboard on successful login
        if (res.success) {
            navigate('/dashboard');
        } else {
            // Render specific response errors
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

                {/* Render error warnings dynamically */}
                {(error || authError) && (
                    <div className="mb-4 rounded border border-red-900 bg-red-950/40 p-3 text-xs text-red-400">
                        {error || authError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <Mail size={16} />
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full rounded border border-slate-800 bg-slate-950/80 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <Lock size={16} />
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded border border-slate-800 bg-slate-950/80 py-2 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Disable button to prevent duplicate requests while API call resolves */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <span>Signing In...</span>
                            </>
                        ) : (
                            <>
                                <LogIn size={15} />
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
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
