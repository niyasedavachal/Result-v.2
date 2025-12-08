
import React, { useEffect, useRef, useState } from 'react';
import { GlassCard, GlassButton } from '../../components/GlassUI';
import { ShieldCheck, Printer, ArrowRight, Lock, Eye, Copy, Check, Camera, Download } from 'lucide-react';

interface Props {
    schoolName: string;
    place: string;
    recoveryCode: string;
    hasPrinted: boolean;
    setHasPrinted: (val: boolean) => void;
    onEnterPortal: () => void;
}

const StepSuccess: React.FC<Props> = ({ schoolName, place, recoveryCode, hasPrinted, setHasPrinted, onEnterPortal }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // --- CONFETTI ENGINE ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: any[] = [];
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                size: Math.random() * 8 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 100,
                gravity: 0.5
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;
            particles.forEach(p => {
                if (p.life > 0) {
                    active = true;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += p.gravity;
                    p.life--;
                    p.size *= 0.96;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            if (active) requestAnimationFrame(animate);
        };
        animate();
    }, []);

    const handlePrintLicense = () => {
        window.print();
        setTimeout(() => setHasPrinted(true), 1500);
    };

    const copyCode = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(recoveryCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="flex items-center justify-center min-h-[90vh] p-4 relative overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

            {/* --- OFFICIAL PRINTABLE CERTIFICATE (Hidden on Screen) --- */}
            <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-0 text-black font-sans">
                <div className="h-full w-full border-[10px] border-double border-slate-800 p-8 relative flex flex-col justify-between">
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <ShieldCheck size={400} />
                    </div>
                    <div className="text-center border-b-2 border-black pb-6">
                        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Master Recovery Document</h1>
                        <p className="text-sm font-bold tracking-[0.3em] uppercase text-slate-600">ResultMate Official Document</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                        <div>
                            <p className="text-lg italic text-slate-600 mb-2">This document certifies that</p>
                            <h2 className="text-4xl font-black uppercase underline decoration-4 decoration-yellow-400 underline-offset-4">{schoolName}</h2>
                            <p className="text-lg font-bold mt-2">{place}</p>
                        </div>
                        <p className="text-xl">is a verified partner of the ResultMate Network.</p>
                        <div className="w-full max-w-2xl border-4 border-dashed border-red-500 bg-red-50 p-8 rounded-xl relative mt-8">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 font-bold uppercase text-sm">Confidential • Master Key</div>
                            <p className="text-sm font-bold text-red-800 uppercase mb-4">In case of forgotten password, use this code to recover admin access:</p>
                            <p className="text-5xl font-mono font-black tracking-widest text-slate-900">{recoveryCode}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-end border-t-2 border-black pt-6">
                        <div className="text-sm">
                            <p className="font-bold">Authorized By:</p>
                            <p>ResultMate Systems</p>
                            <p>{new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="text-center">
                            <div className="h-16 w-32 border-b border-black mb-2"></div>
                            <p className="font-bold text-xs uppercase">Principal's Signature</p>
                        </div>
                        <div className="text-right text-xs">
                            <p className="font-bold text-red-600">IMPORTANT:</p>
                            <p>File this document securely.</p>
                            <p>Do not share the Master Key.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ON-SCREEN UI --- */}
            <GlassCard className="max-w-md w-full text-center py-8 px-6 border-t-8 border-blue-600 shadow-2xl relative z-10 animate-fade-in-up">
                
                {/* Animated Success Icon */}
                <div className="w-24 h-24 mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                    <div className="relative w-full h-full bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path className="animate-[dash_0.5s_ease-in-out]" strokeDasharray="60" strokeDashoffset="0" d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Campus Created!</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm">
                    <b>{schoolName}</b> is now live on the network.
                </p>
                
                {/* RECOVERY CODE REVEAL BOX - UPDATED STYLE */}
                <div 
                    className="relative bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 mb-2 border-2 border-dashed border-amber-400 dark:border-amber-600 cursor-pointer overflow-hidden group transition-all hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10"
                    onClick={() => setIsRevealed(true)}
                >
                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                        <Lock className="w-3 h-3"/> Master Recovery Key
                    </p>
                    
                    <div className="relative h-12 flex items-center justify-center">
                        <p className={`text-2xl font-mono font-black tracking-widest text-slate-900 dark:text-white transition-all duration-500 ${isRevealed ? 'blur-0 opacity-100' : 'blur-md opacity-50'}`}>
                            {recoveryCode}
                        </p>
                        
                        {/* Overlay when hidden */}
                        {!isRevealed && (
                            <div className="absolute inset-0 flex items-center justify-center bg-amber-50/80 dark:bg-slate-900/50 backdrop-blur-sm z-10 transition-opacity">
                                <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:scale-105 transition-transform border border-amber-200 dark:border-amber-800">
                                    <Eye className="w-3 h-3"/> Tap to Reveal
                                </div>
                            </div>
                        )}
                        
                        {/* Copy Button when revealed */}
                        {isRevealed && (
                            <button 
                                onClick={copyCode}
                                className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-amber-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                                {isCopied ? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4 text-slate-500"/>}
                            </button>
                        )}
                    </div>
                    
                    <div className="mt-2 text-[10px] text-amber-700 dark:text-amber-300 font-medium flex items-center justify-center gap-1">
                        Do not share this code with anyone.
                    </div>
                </div>

                {/* Screenshot Hint */}
                <div className="text-[10px] text-slate-400 mb-8 flex items-center justify-center gap-1">
                    <Camera className="w-3 h-3"/> Capture a screenshot for safety.
                </div>

                <div className="space-y-3">
                    <button 
                      onClick={handlePrintLicense}
                      className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2 ${
                          hasPrinted 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-300 animate-pulse'
                      }`}
                    >
                        {hasPrinted ? <><Check className="w-5 h-5"/> Step 1: Recovery Kit Saved</> : <><Download className="w-5 h-5"/> Step 1: Download Recovery Kit</>}
                    </button>

                    <GlassButton 
                      onClick={onEnterPortal} 
                      disabled={!hasPrinted}
                      className={`w-full text-lg py-4 shadow-xl transition-all duration-500 ${
                          !hasPrinted 
                          ? 'opacity-60 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-500 shadow-none border border-slate-300' 
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:to-indigo-700 hover:scale-105 text-white ring-4 ring-blue-500/20'
                      }`}
                    >
                        {hasPrinted ? <><ArrowRight className="w-5 h-5 mr-2" /> Enter Admin Dashboard</> : <><Lock className="w-4 h-4 mr-2"/> Step 2: Enter Dashboard (Locked)</>}
                    </GlassButton>
                </div>
            </GlassCard>
            
            <style>{`
                @keyframes dash {
                    from { stroke-dashoffset: 60; }
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
        </div>
    );
};

export default StepSuccess;
