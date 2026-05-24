import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../store/useAuthStore';
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';

/**
 * Register Account Creation Component.
 * Integrates `react-hook-form` to robustly parse form values, enforces frontend password length
 * and email format validation Regexes, dispatches credentials to MERN auth endpoints, 
 * and handles UI loading states and success redirects.
 * 
 * @component
 */
const Register = () => {
    // Navigator for routing user to dashboard upon account creation success
    const navigate = useNavigate();
    
    // Extract account creator dispatch and global error variables from Zustand authentication store
    const { register: registerUserStore, error: authError, clearErrors } = useAuthStore();
    
    // Local UI state tracking parameters
    const [loading, setLoading] = useState(false); // Manages button loading spinner
    const [formError, setFormError] = useState(null); // Local API fallback error message tracking
    const [showPassword, setShowPassword] = useState(false); // Controls password visibility eye toggle

    // Initialize React Hook Form utilities
    // `register` binds inputs to validation rules, `handleSubmit` processes valid data,
    // `errors` object contains validation failure messages to render inline.
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    /**
     * Submit callback triggered ONLY upon successful frontend validation checks via `react-hook-form`.
     * Receives securely sanitized object of inputs.
     * 
     * @param {object} data - Validated form field inputs (name, email, password).
     */
    const onSubmit = async (data) => {
        setFormError(null); // Clear previous local fallback errors
        clearErrors(); // Flush previous global authentication stores errors to prevent stale messages
        setLoading(true); // Trigger UI loading spinner and lock submit buttons

        // Dispatch registration credentials to Express auth server endpoint
        const res = await registerUserStore(data.name, data.email, data.password);
        
        // Remove UI lock
        setLoading(false);

        if (res.success) {
            // Redirect immediately to dashboard on HTTP 201 success
            navigate('/dashboard');
        } else {
            // Handle error callbacks (e.g. HTTP 400 Email already in use)
            setFormError(res.error || 'Registration failed. Please try again.');
        }
    };

    return (
        // Wrapper for centering the form modal
        <div className="flex h-screen w-screen items-center justify-center bg-slate-950 px-4">
            {/* Main Form Container Card */}
            <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900/60 p-8 shadow-sm">
                
                {/* Intro Headers */}
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-100">Create Account</h2>
                    <p className="mt-2 text-xs text-slate-400">Join the minimalist real-time collaboration canvas</p>
                </div>

                {/* Top-level Error Banner Alert */}
                {/* Triggers if API rejects the request or throws network errors */}
                {(formError || authError) && (
                    <div className="mb-4 rounded border border-red-900 bg-red-950/40 p-3 text-xs text-red-400">
                        {formError || authError}
                    </div>
                )}

                {/* Form Elements mapped with react-hook-form validation hooks */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    
                    {/* Full Name Input Box */}
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
                                // Dynamic border styling based on active validation errors
                                className={`w-full rounded border bg-slate-950/80 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                                    errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-800'
                                    }`}
                                // Bind to hook-form state
                                {...register('name', { required: 'Name is required' })}
                            />
                        </div>
                        {/* Display inline validation error message for Name */}
                        {errors.name && (
                            <span className="mt-1 block text-[11px] text-red-400 font-medium">{errors.name.message}</span>
                        )}
                    </div>

                    {/* Email Address Input Box */}
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
                                // Strict regex validation for proper email formats
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address format',
                                    },
                                })}
                            />
                        </div>
                        {/* Display inline validation error message for Email */}
                        {errors.email && (
                            <span className="mt-1 block text-[11px] text-red-400 font-medium">{errors.email.message}</span>
                        )}
                    </div>

                    {/* Secure Password Input Box */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <Lock size={16} />
                            </span>
                            <input
                                // Toggle visibility of password string
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={`w-full rounded border bg-slate-950/80 py-2 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                                    errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-800'
                                    }`}
                                // Enforce password strength minimums
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters long',
                                    },
                                })}
                            />
                            {/* Interactive toggle switch for revealing typing content */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {/* Display inline validation error message for Password */}
                        {errors.password && (
                            <span className="mt-1 block text-[11px] text-red-400 font-medium">{errors.password.message}</span>
                        )}
                    </div>

                    {/* Submission CTA Button */}
                    {/* Disables HTML interactions during async registration dispatches to prevent duplicates */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer mt-4"
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

                {/* Redirect logic back to login if they already exist */}
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
