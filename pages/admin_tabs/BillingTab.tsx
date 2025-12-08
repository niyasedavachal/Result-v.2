
import React from 'react';
import { GlassCard } from '../../components/GlassUI';
import { SchoolConfig } from '../../types';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, Calendar } from 'lucide-react';

interface Props {
    schoolConfig: SchoolConfig;
}

const BillingTab: React.FC<Props> = ({ schoolConfig }) => {
    const today = new Date();
    const expiry = schoolConfig.expiryDate ? new Date(schoolConfig.expiryDate) : null;
    
    // Logic for alerts
    const daysLeft = expiry ? Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const isExpired = expiry && daysLeft < 0;
    const isExpiringSoon = expiry && daysLeft > 0 && daysLeft <= 30; // 1 Month Alert
    
    // Helper Text
    const getValidityText = () => {
        if (!schoolConfig.isPro) return "Unlimited (Free Plan)";
        if (isExpired) return "EXPIRED";
        if (!expiry) return "Unknown";
        return expiry.toLocaleDateString();
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
            
            {/* ALERT BOX */}
            {isExpiringSoon && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5"/>
                    <div>
                        <h4 className="font-bold text-orange-800 dark:text-orange-200">Plan Expiring Soon</h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                            Your Smart/Pro plan expires in <b>{daysLeft} days</b>. Renew now to avoid losing access to premium features. 
                            Don't worry, your validity will be extended from the current expiry date.
                        </p>
                    </div>
                </div>
            )}

            {isExpired && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5"/>
                    <div>
                        <h4 className="font-bold text-red-800 dark:text-red-200">Plan Expired</h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            Your account has been downgraded to <b>Starter (Free)</b>. Premium features like AI, Fees, and Custom Branding are locked.
                            <br/>Renew immediately to restore full access. No data has been deleted.
                        </p>
                    </div>
                </div>
            )}

            {/* MAIN PLAN CARD */}
            <GlassCard className={`relative overflow-hidden ${schoolConfig.isPro ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white' : 'bg-white dark:bg-slate-800'}`}>
                {schoolConfig.isPro && <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard className="w-32 h-32"/></div>}
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <h3 className={`text-xl font-bold mb-1 ${!schoolConfig.isPro ? 'text-slate-800 dark:text-white' : ''}`}>Current Plan</h3>
                        <p className={`text-4xl font-black mb-1 ${schoolConfig.isPro ? 'text-yellow-400' : 'text-blue-600'}`}>
                            {schoolConfig.isPro ? (schoolConfig.planType === 'PRO' ? 'Institute Pro' : 'Smart Campus') : 'Starter Plan'}
                        </p>
                        <p className={`text-sm font-medium opacity-80 ${!schoolConfig.isPro ? 'text-slate-500' : ''}`}>
                            {schoolConfig.isPro ? 'Active Subscription' : 'Free Forever'}
                        </p>
                    </div>
                    {schoolConfig.isPro && (
                        <div className="text-right">
                            <p className="text-xs font-bold opacity-60 uppercase mb-1">Valid Until</p>
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
                                <Calendar className="w-4 h-4"/>
                                <span className="font-mono font-bold">{getValidityText()}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2 text-sm relative z-10">
                    {schoolConfig.isPro ? (
                        <>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400"/> <span>Premium Features Unlocked</span></div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400"/> <span>Priority Support</span></div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><CheckCircle2 className="w-4 h-4 text-green-500"/> <span>Basic Results</span></div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><CheckCircle2 className="w-4 h-4 text-green-500"/> <span>Smart Data Entry</span></div>
                        </>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 relative z-10 flex gap-4">
                    <button 
                        onClick={() => window.open('https://wa.me/919074960817?text=I%20want%20to%20renew/upgrade%20my%20SchoolResult%20Pro%20Plan', '_blank')} 
                        className={`font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2 ${schoolConfig.isPro ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        {schoolConfig.isPro ? (isExpiringSoon || isExpired ? 'Renew Now' : 'Extend Validity') : 'Upgrade to Smart/Pro'}
                    </button>
                    {schoolConfig.isPro && (
                        <p className="text-[10px] opacity-60 max-w-xs self-center leading-tight">
                            *Renewal adds time to your current expiry date. You won't lose any days.
                        </p>
                    )}
                </div>
            </GlassCard>
            
            {/* PAYMENT HISTORY */}
            <GlassCard>
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400"/> Transaction History
                </h3>
                {schoolConfig.paymentStatus === 'PAID' ? (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex justify-between items-center border border-green-200 dark:border-green-800">
                        <div>
                            <p className="font-bold text-green-800 dark:text-green-300">Subscription Active</p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Ref: {schoolConfig.transactionRef || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Purchased on</p>
                            <p className="text-sm font-mono text-slate-700 dark:text-slate-200">{schoolConfig.createdAt ? new Date(schoolConfig.createdAt).toLocaleDateString() : '-'}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">No payment history available.</p>
                )}
            </GlassCard>
        </div>
    );
};

export default BillingTab;
