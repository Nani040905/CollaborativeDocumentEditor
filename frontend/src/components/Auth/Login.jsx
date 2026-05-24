import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

/**
 * Login Authentication Form Component.
 * Captures user credentials, verifies non-empty states, dispatches auth store login actions,
 * handles API responses, and performs dynamic redirection to secured dashboard workspace.
 * 
 * @component
 */
const Login = () => {
    // Router navigation hook for client-side redirects post-login
    const navigate = useNavigate();
    
    // Extract authentication states and actions from the Zustand global store
    // `login` handles the API handshake, `error` extracts global auth errors, `clearErrors` flushes state
    const { login, error: authError, clearErrors } = useAuthStore();
    
    // Local component state for form input binding
    const [email, setEmail] = useState(''); // Tracks email input string
    const [password, setPassword] = useState(''); // Tracks raw password input string
    const [showPassword, setShowPassword] = useState(false); // Toggles password field masking
    const [loading, setLoading] = useState(false); // Tracks form submission loading state for UI feedback
    const [error, setError] = useState(null); // Local validation error tracking

    /**
     * Submit handler for user credentials authentication.
     * Restricts empty values, triggers global loading states, and submits payload to API servers.
     * 
     * @param {React.FormEvent} e - HTML form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent native browser page refresh
        setError(null); // Clear previous local errors
        clearErrors(); // Flush previous global authentication store errors

        // Assert form validity: ensure fields aren't completely blank or whitespace only
        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password.');
            return; // Abort submission
        }

        // Enable spinner on login button
        setLoading(true);
        
        // Dispatch credential payloads to the backend API via Zustand store
        const res = await login(email, password);
        
        // Disable loading state once API responds
        setLoading(false);

        // Evaluate server response success flag
        if (res.success) {
            // Redirect user securely to workspace dashboard on successful login
            navigate('/dashboard');
        } else {
            // Render specific API rejection messages or fallback generic error
            setError(res.error || 'Invalid credentials');
        }
    };

    return (
        // Main full-screen wrapper centering the form vertically and horizontally
        <div className="flex h-screen w-screen items-center justify-center bg-slate-950 px-4">
            
            {/* Form Container Card */}
            <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900/60 p-8 shadow-sm">
                
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-100">Welcome Back</h2>
                    <p className="mt-2 text-xs text-slate-400">Sign in to your collaborative editor workspace</p>
                </div>

                {/* Dynamic Error Rendering Alert Box */}
                {/* Shows either local validation errors OR global API rejection errors */}
                {(error || authError) && (
                    <div className="mb-4 rounded border border-red-900 bg-red-950/40 p-3 text-xs text-red-400">
                        {error || authError}
                    </div>
                )}

                {/* Login Form Implementation */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Email Input Field Group */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            {/* Input Icon Adornment */}
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <Mail size={16} />
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} // Bind input to local state
                                placeholder="email@example.com"
                                className="w-full rounded border border-slate-800 bg-slate-950/80 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Password Input Field Group */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            {/* Input Icon Adornment */}
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <Lock size={16} />
                            </span>
                            <input
                                // Dynamically switch input type based on eye-toggle state
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} // Bind input to local state
                                placeholder="••••••••"
                                className="w-full rounded border border-slate-800 bg-slate-950/80 py-2 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            {/* Eye Toggle Button for Password Visibility */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)} // Toggle visibility flag
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Action Button */}
                    {/* Disables interactions to prevent duplicate HTTP requests while API call resolves */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? (
                            // Render loading spinner when resolving
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <span>Signing In...</span>
                            </>
                        ) : (
                            // Render static log-in icon otherwise
                            <>
                                <LogIn size={15} />
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Redirection to Registration */}
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
