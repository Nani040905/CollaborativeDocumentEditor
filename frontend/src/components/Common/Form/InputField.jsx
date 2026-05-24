import React, { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = forwardRef(({ 
    label, 
    type, 
    icon: Icon, 
    placeholder, 
    error, 
    showPasswordToggle, 
    showPassword, 
    onTogglePassword, 
    ...rest 
}, ref) => {
    return (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Icon size={16} />
                    </span>
                )}
                <input
                    type={showPasswordToggle ? (showPassword ? "text" : "password") : type}
                    placeholder={placeholder}
                    className={`w-full rounded border bg-slate-950/80 py-2 pl-10 pr-${showPasswordToggle ? '10' : '4'} text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                        error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-800'
                    }`}
                    ref={ref}
                    {...rest}
                />
                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
            {error && (
                <span className="mt-1 block text-[11px] text-red-400 font-medium">{error.message || error}</span>
            )}
        </div>
    );
});

InputField.displayName = 'InputField';

export default InputField;
