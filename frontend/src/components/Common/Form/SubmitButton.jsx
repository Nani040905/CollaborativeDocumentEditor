import React from 'react';

const SubmitButton = ({ loading, loadingText, defaultText, icon: Icon }) => {
    return (
        <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer mt-4"
        >
            {loading ? (
                <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>{loadingText}</span>
                </>
            ) : (
                <>
                    {Icon && <Icon size={15} />}
                    <span>{defaultText}</span>
                </>
            )}
        </button>
    );
};

export default SubmitButton;
