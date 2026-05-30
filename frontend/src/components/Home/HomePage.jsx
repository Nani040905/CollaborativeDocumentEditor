import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Zap, Shield, ArrowRight } from 'lucide-react';

/**
 * Simple landing page for the Collaborative Document Editor.
 * @component
 */
const HomePage = () => {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">

            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-slate-800/50">
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="bg-blue-600 p-1.5 rounded text-white font-bold text-sm tracking-widest font-display">
                        CDE
                    </div>
                    <span className="font-semibold text-slate-100 font-display tracking-wider text-sm">
                        COLLAB EDIT
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white
                                   rounded-md border border-slate-700/50 hover:border-slate-600
                                   transition-all duration-200"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="px-4 py-2 text-xs font-semibold text-white bg-blue-600
                                   rounded-md hover:bg-blue-500 transition-all duration-200"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
                <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white max-w-xl leading-tight">
                    Edit documents together, at the same time
                </h1>

                <p className="mt-4 text-sm text-slate-400 max-w-md leading-relaxed">
                    A simple document editor where you and your team can write and edit the same
                    document at the same time. You can see who's typing, and changes show up instantly.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                    <Link
                        to="/register"
                        className="group flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white
                                   bg-blue-600 rounded-lg hover:bg-blue-500 transition-all duration-200"
                    >
                        Create an Account
                        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link
                        to="/login"
                        className="px-6 py-2.5 text-sm font-semibold text-slate-400
                                   border border-slate-700 rounded-lg hover:border-slate-600 hover:text-slate-200
                                   transition-all duration-200"
                    >
                        I already have an account
                    </Link>
                </div>

                {/* What you can do */}
                <div className="mt-16 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        {
                            icon: <Users size={18} />,
                            title: 'Work together',
                            desc: 'Multiple people can edit the same document at once.'
                        },
                        {
                            icon: <FileText size={18} />,
                            title: 'Rich text editing',
                            desc: 'Bold, headings, lists, code blocks — the basics you need.'
                        },
                        {
                            icon: <Zap size={18} />,
                            title: 'Auto-saves your work',
                            desc: 'Your changes are saved automatically so you don\'t lose anything.'
                        },
                        {
                            icon: <Shield size={18} />,
                            title: 'Secure login',
                            desc: 'Your account is protected with encrypted passwords and tokens.'
                        }
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="p-5 rounded-lg border border-slate-800/60 bg-slate-900/40 text-left"
                        >
                            <div className="text-blue-400 mb-3">{item.icon}</div>
                            <h3 className="text-sm font-semibold text-slate-200 mb-1">{item.title}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 lg:px-12 py-6 border-t border-slate-800/40 text-center">
                <p className="text-[11px] text-slate-600">
                    Collaborative Document Editor · Built with MERN Stack · © {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
};

export default HomePage;
