
import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from '../../components/GlassUI';
import { Gift, LogIn, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { Affiliate } from '../../types';

interface Props {
    onLoginSuccess: (affiliate: Affiliate) => void;
    onRegisterSuccess: (code: string) => void;
}

const AuthForm: React.FC<Props> = ({ onLoginSuccess, onRegisterSuccess }) => {
    const [view, setView] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Register State
    const [regData, setRegData] = useState({ name: '', email: '', phone: '', code: '' });
    
    // Login State
    const [loginData, setLoginData] = useState({ email: '', code: '' });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await api.createAffiliate(regData);
        setLoading(false);
        
        if (res.success && res.code) {
            onRegisterSuccess(res.code);
        } else {
            alert("Registration Failed: " + res.message);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await api.getAffiliateStats(loginData.email, loginData.code);
        setLoading(false);
        
        if (res.success && res.affiliate) {
            onLoginSuccess(res.affiliate);
        } else {
            setError(res.message || "Login Failed");
        }
    };

    return (
        <GlassCard className="border-t-4 border-t-indigo-500 bg-white dark:bg-slate-800 shadow-2xl min-h-[500px]">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
                <button 
                    onClick={() => setView('REGISTER')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${view === 'REGISTER' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Join Program
                </button>
                <button 
                    onClick={() => setView('LOGIN')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${view === 'LOGIN' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Partner Login
                </button>
            </div>

            {view === 'REGISTER' ? (
                <form onSubmit={handleRegister} className="space-y-4 animate-fade-in-up">
                    <div className="mb-4">
                        <h3 className="font-bold text-2xl text-slate-900 dark:text-white">Create Account</h3>
                        <p className="text-slate-500 text-sm">Start earning commissions today.</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Name / Center Name</label>
                        <GlassInput 
                            placeholder="e.g. ABC Computers" 
                            value={regData.name}
                            onChange={e => setRegData({...regData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Mobile Number</label>
                        <GlassInput 
                            placeholder="Phone Number" 
                            value={regData.phone}
                            onChange={e => setRegData({...regData, phone: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email Address</label>
                        <GlassInput 
                            type="email"
                            placeholder="partner@gmail.com" 
                            value={regData.email}
                            onChange={e => setRegData({...regData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Preferred Code</label>
                        <div className="flex items-center gap-2">
                            <GlassInput 
                                placeholder="e.g. AKSHAYA_TVM" 
                                value={regData.code}
                                onChange={e => setRegData({...regData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '')})}
                                required
                                minLength={4}
                            />
                            <div className="text-xs text-slate-400 whitespace-nowrap">4-10 Chars</div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg flex items-center gap-3">
                        <Gift className="w-5 h-5 text-indigo-600"/>
                        <p className="text-xs text-indigo-800 dark:text-indigo-200">
                            Schools using your code get <b>10% OFF</b> on Pro plans.
                        </p>
                    </div>

                    <GlassButton type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 text-lg shadow-lg shadow-indigo-500/30">
                        {loading ? 'Creating...' : 'Get My Code'}
                    </GlassButton>
                </form>
            ) : (
                <form onSubmit={handleLogin} className="space-y-6 animate-fade-in-up">
                    <div className="mb-4">
                        <h3 className="font-bold text-2xl text-slate-900 dark:text-white">Welcome Back</h3>
                        <p className="text-slate-500 text-sm">Access your affiliate dashboard.</p>
                    </div>
                    
                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 text-sm rounded font-bold">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Registered Email</label>
                        <GlassInput 
                            type="email"
                            placeholder="partner@gmail.com" 
                            value={loginData.email}
                            onChange={e => setLoginData({...loginData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Your Partner Code</label>
                        <GlassInput 
                            placeholder="e.g. AKSHAYA_TVM" 
                            value={loginData.code}
                            onChange={e => setLoginData({...loginData, code: e.target.value.toUpperCase()})}
                            required
                        />
                    </div>

                    <GlassButton type="submit" disabled={loading} className="w-full bg-slate-800 hover:bg-slate-900 py-3 text-lg shadow-lg">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : <><LogIn className="w-4 h-4 mr-2 inline"/> Login to Dashboard</>}
                    </GlassButton>
                </form>
            )}
        </GlassCard>
    );
};

export default AuthForm;
