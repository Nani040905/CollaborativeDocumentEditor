import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, Users, Zap, Shield, ArrowRight, Sparkles,
    MousePointerClick, Globe, Lock, Layers
} from 'lucide-react';

/**
 * Premium Landing Page Component for Collaborative Document Editor.
 * Showcases product features, real-time collaboration capabilities,
 * and provides clear call-to-action paths to registration and login.
 *
 * @component
 */
const HomePage = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger entrance animations after mount
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 overflow-hidden">
            {/* ─── Ambient Background Gradients ─── */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/[0.07] rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/[0.05] rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/[0.03] rounded-full blur-[140px]" />
            </div>

            {/* ─── Navigation Bar ─── */}
            <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-slate-800/50">
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="bg-blue-600 p-1.5 rounded text-white font-bold text-sm tracking-widest font-display
                                    group-hover:bg-blue-500 transition-colors duration-300">
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
                                   transition-all duration-300 hover:bg-slate-800/50"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="px-4 py-2 text-xs font-semibold text-white bg-blue-600
                                   rounded-md hover:bg-blue-500 transition-all duration-300
                                   shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* ─── Hero Section ─── */}
            <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-24 lg:pt-32 lg:pb-36">
                {/* Pill Badge */}
                <div
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-700/60
                                bg-slate-800/40 backdrop-blur-sm mb-8
                                transition-all duration-700 ease-out
                                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                >
                    <Sparkles size={13} className="text-blue-400" />
                    <span className="text-[11px] font-medium text-slate-300 tracking-wide">
                        Real-time collaboration, reimagined
                    </span>
                </div>

                {/* Main Headline */}
                <h1
                    className={`text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-white
                                leading-[1.1] max-w-3xl
                                transition-all duration-700 delay-100 ease-out
                                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                >
                    Write together.{' '}
                    <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                        In real time.
                    </span>
                </h1>

                {/* Subtitle */}
                <p
                    className={`mt-6 text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed
                                transition-all duration-700 delay-200 ease-out
                                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                >
                    A minimalist, rich-text collaborative editor built for teams. See live
                    cursors, track changes instantly, and create beautiful documents with zero friction.
                </p>

                {/* CTA Buttons */}
                <div
                    className={`mt-10 flex flex-col sm:flex-row items-center gap-4
                                transition-all duration-700 delay-300 ease-out
                                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                >
                    <Link
                        to="/register"
                        id="hero-cta-primary"
                        className="group flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white
                                   bg-blue-600 rounded-lg hover:bg-blue-500 transition-all duration-300
                                   shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40"
                    >
                        Start Writing Free
                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                    </Link>
                    <Link
                        to="/login"
                        id="hero-cta-secondary"
                        className="flex items-center gap-2 px-7 py-3 text-sm font-semibold text-slate-300
                                   border border-slate-700 rounded-lg hover:border-slate-500 hover:text-white
                                   transition-all duration-300 hover:bg-slate-800/40"
                    >
                        Sign In to Dashboard
                    </Link>
                </div>

                {/* ─── Editor Preview Mockup ─── */}
                <div
                    className={`mt-16 lg:mt-20 w-full max-w-4xl
                                transition-all duration-1000 delay-500 ease-out
                                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                >
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-sm
                                    shadow-2xl shadow-black/30 overflow-hidden">
                        {/* Window Chrome */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/60 bg-slate-900/90">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                            </div>
                            <div className="flex-1 mx-8">
                                <div className="max-w-xs mx-auto h-6 rounded bg-slate-800/80 flex items-center justify-center">
                                    <span className="text-[10px] text-slate-500 font-mono">collab-edit.app/document/project-brief</span>
                                </div>
                            </div>
                        </div>

                        {/* Fake Toolbar */}
                        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-800/40 bg-slate-900/50">
                            <div className="flex gap-1">
                                {['B', 'I', 'U'].map((label) => (
                                    <span key={label} className="w-7 h-7 flex items-center justify-center rounded text-[11px]
                                                                   font-bold text-slate-400 hover:bg-slate-700/50 cursor-default">
                                        {label}
                                    </span>
                                ))}
                            </div>
                            <div className="w-px h-5 bg-slate-700/50" />
                            <div className="flex gap-1">
                                {['H1', 'H2', '¶'].map((label) => (
                                    <span key={label} className="w-7 h-7 flex items-center justify-center rounded text-[10px]
                                                                   font-semibold text-slate-500 cursor-default">
                                        {label}
                                    </span>
                                ))}
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                {/* Live Collaborator Avatars */}
                                <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600
                                                    border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
                                        AK
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600
                                                    border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
                                        MR
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600
                                                    border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
                                        JS
                                    </div>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    3 online
                                </span>
                            </div>
                        </div>

                        {/* Fake Document Content */}
                        <div className="p-8 sm:p-10 min-h-[220px] text-left">
                            <h2 className="text-xl font-bold text-slate-100 mb-4 font-display">
                                Project Brief: Q4 Strategy
                            </h2>
                            <p className="text-sm text-slate-400 leading-relaxed mb-3">
                                Our team will focus on three core initiatives for the coming quarter.
                                This document outlines the strategic objectives, key milestones, and
                                resource allocation for each workstream.
                            </p>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                <span className="text-slate-300">1. Platform scalability</span> — Migrate
                                core services to event-driven architecture
                                <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse align-middle" />
                            </p>

                            {/* Remote Cursor Simulation */}
                            <div className="mt-4 relative">
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    <span className="text-slate-300">2. User engagement</span> — Deploy
                                    personalized onboarding workflows and
                                </p>
                                <div className="absolute -top-1 right-24 flex flex-col items-start">
                                    <svg width="12" height="16" viewBox="0 0 12 16" className="text-emerald-400 fill-current">
                                        <path d="M0 0L12 8L5 9L3 16L0 0Z" />
                                    </svg>
                                    <span className="text-[9px] font-semibold bg-emerald-500 text-white px-1.5 py-0.5
                                                     rounded -mt-0.5 ml-2 whitespace-nowrap">
                                        Maya R.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Features Section ─── */}
            <section className="relative z-10 px-6 lg:px-12 py-20 lg:py-28">
                <div className="max-w-5xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white">
                            Everything you need to{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                collaborate
                            </span>
                        </h2>
                        <p className="mt-4 text-sm text-slate-400 max-w-lg mx-auto">
                            A focused toolkit for teams who value simplicity and speed. No bloat, no distractions — just writing, together.
                        </p>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            {
                                icon: <Users size={20} />,
                                title: 'Live Collaboration',
                                description: 'Multiple users edit simultaneously with real-time delta synchronization powered by WebSockets.',
                                color: 'blue'
                            },
                            {
                                icon: <MousePointerClick size={20} />,
                                title: 'Remote Cursors',
                                description: 'See exactly where your collaborators are typing with color-coded live cursor tracking.',
                                color: 'emerald'
                            },
                            {
                                icon: <FileText size={20} />,
                                title: 'Rich Text Editor',
                                description: 'Full-featured formatting with headings, lists, code blocks, and syntax highlighting.',
                                color: 'purple'
                            },
                            {
                                icon: <Zap size={20} />,
                                title: 'Auto-Save',
                                description: 'High-frequency debounced saves ensure you never lose a single character of your work.',
                                color: 'amber'
                            },
                            {
                                icon: <Shield size={20} />,
                                title: 'Secure by Default',
                                description: 'HttpOnly JWT cookies, bcrypt hashing, rate limiting, and XSS-protected authentication.',
                                color: 'rose'
                            },
                            {
                                icon: <Globe size={20} />,
                                title: 'Access Anywhere',
                                description: 'Cloud-deployed on Render & Vercel. Access your documents from any device, anywhere.',
                                color: 'sky'
                            }
                        ].map((feature, index) => {
                            const colorMap = {
                                blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                                emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                                purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                                amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                                rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                                sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20'
                            };

                            return (
                                <div
                                    key={index}
                                    className="group p-6 rounded-xl border border-slate-800/60 bg-slate-900/40
                                               hover:bg-slate-900/70 hover:border-slate-700/60
                                               transition-all duration-300 cursor-default"
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4
                                                     border ${colorMap[feature.color]}`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-100 mb-2 font-display tracking-wide">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── Tech Stack Badges ─── */}
            <section className="relative z-10 px-6 lg:px-12 py-16 border-t border-slate-800/40">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-6">
                        Built with modern technologies
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {[
                            'React 19', 'Node.js', 'Express', 'MongoDB',
                            'Socket.io', 'Quill.js', 'Zustand', 'TailwindCSS', 'JWT', 'Vite'
                        ].map((tech) => (
                            <span
                                key={tech}
                                className="px-3.5 py-1.5 text-[11px] font-medium text-slate-400
                                           border border-slate-800/60 rounded-full bg-slate-900/40
                                           hover:border-slate-700 hover:text-slate-300
                                           transition-all duration-300"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Bottom CTA Section ─── */}
            <section className="relative z-10 px-6 lg:px-12 py-20 lg:py-28">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white">
                        Ready to collaborate?
                    </h2>
                    <p className="mt-4 text-sm text-slate-400 max-w-md mx-auto">
                        Create your free account in seconds and start editing documents with your team in real time.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            id="bottom-cta-primary"
                            className="group flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white
                                       bg-blue-600 rounded-lg hover:bg-blue-500 transition-all duration-300
                                       shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40"
                        >
                            Create Free Account
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                        </Link>
                        <Link
                            to="/login"
                            id="bottom-cta-secondary"
                            className="flex items-center gap-2 px-7 py-3 text-sm font-semibold text-slate-300
                                       border border-slate-700 rounded-lg hover:border-slate-500 hover:text-white
                                       transition-all duration-300 hover:bg-slate-800/40"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="relative z-10 px-6 lg:px-12 py-8 border-t border-slate-800/40">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1 rounded text-white font-bold text-[10px] tracking-widest font-display">
                            CDE
                        </div>
                        <span className="text-xs text-slate-500">
                            Collaborative Document Editor
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                        Built with the MERN Stack · © {new Date().getFullYear()}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
