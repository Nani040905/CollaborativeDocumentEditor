import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../store/useAuthStore';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { register: registerUserStore, error: authError, clearErrors } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setFormError(null);
        clearErrors();
        setLoading(true);

        const res = await registerUserStore(data.name, data.email, data.password);
        setLoading(false);

        if (res.success) {
            navigate('/dashboard');
        } else {
            setFormError(res.error || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900/60 p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-100">Create Account</h2>
                    <p className="mt-2 text-xs text-slate-400">Join the minimalist real-time collaboration canvas</p>
                </div>

                {(formError || authError) && (
                    <div className="mb-4 rounded border border-red-900 bg-red-950/40 p-3 text-xs text-red-400">
                        {formError || authError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            Full Name
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <User size={16} />
                            </span>
                            <input
                                type="text"
                                placeholder="John Doe"
                                className={`w-full rounded border bg-slate-950/80 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                                    errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-800'
                                }`}
                                {...register('name', { required: 'Name is required' })}
                            />
                        </div>
                        {errors.name && (
                            <span className="mt-1 block text-[11px] text-red-400 font-medium">{errors.name.message}</span>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <Mail size={16} />
                            </span>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                className={`w-full rounded border bg-slate-950/80 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                                    errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-800'
                                }`}
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address format',
                                    },
                                })}
                            />
                        </div>
                        {errors.email && (
                            <span className="mt-1 block text-[11px] text-red-400 font-medium">{errors.email.message}</span>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <Lock size={16} />
                            </span>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className={`w-full rounded border bg-slate-950/80 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                                    errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-800'
                                }`}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters long',
                                    },
                                })}
                            />
                        </div>
                        {errors.password && (
                            <span className="mt-1 block text-[11px] text-red-400 font-medium">{errors.password.message}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <UserPlus size={15} />
                                <span>Sign Up</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Sign in instead
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
