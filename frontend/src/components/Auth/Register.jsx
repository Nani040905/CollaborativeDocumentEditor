import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../store/useAuthStore';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import InputField from '../Common/Form/InputField';
import SubmitButton from '../Common/Form/SubmitButton';

const Register = () => {
    const navigate = useNavigate();
    const { register: registerUserStore, error: authError, clearErrors } = useAuthStore();
    
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm();

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
                    
                    <InputField
                        label="Full Name"
                        type="text"
                        icon={User}
                        placeholder="John Doe"
                        error={errors.name}
                        {...register('name', { required: 'Name is required' })}
                    />

                    <InputField
                        label="Email Address"
                        type="email"
                        icon={Mail}
                        placeholder="email@example.com"
                        error={errors.email}
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address format',
                            },
                        })}
                    />

                    <InputField
                        label="Password"
                        type="password"
                        icon={Lock}
                        placeholder="••••••••"
                        error={errors.password}
                        showPasswordToggle
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters long',
                            },
                        })}
                    />

                    <SubmitButton 
                        loading={loading}
                        loadingText="Creating Account..."
                        defaultText="Sign Up"
                        icon={UserPlus}
                    />
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
