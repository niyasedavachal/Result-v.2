
import React, { useState } from 'react';
import { GlassCard, GlassButton } from '../components/GlassUI';
import { CheckCircle, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Affiliate } from '../types';
import AuthForm from './affiliate_tabs/AuthForm';
import DashboardView from './affiliate_tabs/DashboardView';
import ProgramBenefits from './affiliate_tabs/ProgramBenefits';

const AffiliateProgram: React.FC = () => {
    const navigate = useNavigate();
    
    // State
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const [successCode, setSuccessCode] = useState('');

    const handleLoginSuccess = (data: Affiliate) => {
        setAffiliate(data);
    };

    const handleRegisterSuccess = (code: string) => {
        setSuccessCode(code);
    };

    const handleLogout = () => {
        setAffiliate(null);
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        alert("Code Copied!");
    };

    // --- SUCCESS SCREEN AFTER REGISTRATION ---
    if (successCode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-900 p-4">
                <GlassCard className="max-w-md w-full text-center py-12 border-t-4 border-t-green-500">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600"/>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Partner!</h2>
                    <p className="text-slate-300 mb-6">Your Affiliate Account is active.</p>
                    
                    <div className="bg-white/10 p-6 rounded-xl border border-white/20 mb-8">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-2">Your Unique Referral Code</p>
                        <div className="flex items-center gap-2 justify-center">
                            <span className="text-2xl font-black text-white tracking-widest">{successCode}</span>
                            <button onClick={() => copyCode(successCode)} className="text-slate-400 hover:text-white"><Copy className="w-5 h-5"/></button>
                        </div>
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-6">
                        Share this code with Schools. When they register using your code, you earn commissions!
                    </p>

                    <div className="flex gap-3">
                        <GlassButton onClick={() => setSuccessCode('')} className="flex-1">Login to Dashboard</GlassButton>
                        <GlassButton onClick={() => navigate('/')} variant="secondary" className="flex-1">Back Home</GlassButton>
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            
            {/* HERO HEADER */}
            <div className="bg-indigo-600 pt-20 pb-32 px-4 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <h1 className="text-4xl md:text-6xl font-black mb-6 relative z-10">Partner with Us</h1>
                <p className="text-xl md:text-2xl text-indigo-100 max-w-2xl mx-auto mb-8 relative z-10">
                    Help schools modernize their results and earn attractive commissions for every referral.
                </p>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
                {affiliate ? (
                    <DashboardView affiliate={affiliate} onLogout={handleLogout} />
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Info Column */}
                        <ProgramBenefits />

                        {/* Action Column (Auth Form) */}
                        <AuthForm 
                            onLoginSuccess={handleLoginSuccess}
                            onRegisterSuccess={handleRegisterSuccess}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AffiliateProgram;
