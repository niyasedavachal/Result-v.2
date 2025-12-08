
import React from 'react';
import { GlassCard } from '../../components/GlassUI';
import { Users, DollarSign, Gift, Copy, Wallet } from 'lucide-react';
import { Affiliate } from '../../types';

interface Props {
    affiliate: Affiliate;
    onLogout: () => void;
}

const DashboardView: React.FC<Props> = ({ affiliate, onLogout }) => {
    
    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        alert("Code Copied!");
    };

    return (
        <div className="animate-fade-in-up">
            <GlassCard className="bg-white dark:bg-slate-800 shadow-2xl border-t-4 border-t-indigo-500 mb-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome, {affiliate.name}</h2>
                        <p className="text-slate-500">Affiliate Dashboard</p>
                    </div>
                    <button onClick={onLogout} className="text-sm text-red-500 hover:underline">Logout</button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/20 rounded-lg"><DollarSign className="w-6 h-6"/></div>
                            <span className="text-xs font-bold uppercase opacity-80">Total Earnings</span>
                        </div>
                        <h3 className="text-4xl font-black">₹{affiliate.earnings.toLocaleString()}</h3>
                        <p className="text-sm mt-2 opacity-90">Pending Payout: ₹{affiliate.earnings}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600"><Users className="w-6 h-6"/></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Referrals</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-800 dark:text-white">{affiliate.schoolsReferred}</h3>
                        <p className="text-sm mt-2 text-slate-500">Schools Joined</p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-6 border border-purple-100 dark:border-purple-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600"><Gift className="w-6 h-6"/></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Your Code</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-purple-200 dark:border-purple-700">
                            <span className="text-xl font-mono font-bold text-purple-700 dark:text-purple-300 flex-1 text-center">{affiliate.code}</span>
                            <button onClick={() => copyCode(affiliate.code)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><Copy className="w-4 h-4 text-slate-400"/></button>
                        </div>
                        <p className="text-xs mt-3 text-center text-purple-600 dark:text-purple-400">Share this code for 10% Discount</p>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5"/> Payment Details
                    </h3>
                    {affiliate.bankDetails ? (
                        <div className="p-4 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-mono text-slate-600 dark:text-slate-300">{affiliate.bankDetails}</p>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded border border-yellow-200 dark:border-yellow-800">
                            <span className="text-sm text-yellow-800 dark:text-yellow-200">No bank details added. Contact support to add account for payouts.</span>
                            <button onClick={() => window.open('mailto:niyasedavachal@gmail.com')} className="text-xs font-bold text-yellow-700 underline">Contact Support</button>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default DashboardView;
