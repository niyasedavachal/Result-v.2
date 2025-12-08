
import React, { useEffect, useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from '../../components/GlassUI';
import { api } from '../../services/api';
import { MarketingConfig } from '../../types';
import { Megaphone, Timer, DollarSign, TrendingUp, Save, AlertCircle, Calendar, Zap, ListChecks } from 'lucide-react';

const MarketingTab: React.FC = () => {
    const [config, setConfig] = useState<MarketingConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // List of all possible features to toggle
    const AVAILABLE_FEATURES = [
        "Unlimited Students",
        "Smart Data Entry (Public Link)",
        "Instant Result Publish",
        "WhatsApp Viral Result Link",
        "Data Backup & Export",
        "Fee Management System",
        "Fee Receipts & Reports",
        "School Branding (Logo)",
        "No Ads on Results",
        "✨ AI Question Generator",
        "📱 White-label Mobile App",
        "Behavioral Reports",
        "Priority Support",
        "Multiple Admin Logins"
    ];

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        const data = await api.getMarketingConfig();
        setConfig(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        await api.updateMarketingConfig(config);
        setSaving(false);
        alert("Marketing & Plan settings updated!");
    };

    const toggleFeature = (plan: 'starter' | 'smart' | 'pro', feature: string) => {
        if (!config || !config.planFeatures) return;
        const currentList = config.planFeatures[plan];
        let newList;
        if (currentList.includes(feature)) {
            newList = currentList.filter(f => f !== feature);
        } else {
            newList = [...currentList, feature];
        }
        setConfig({
            ...config,
            planFeatures: { ...config.planFeatures, [plan]: newList }
        });
    };

    if (loading || !config) return <div>Loading Command Center...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
            
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-yellow-500"/> Marketing Command Center
                    </h2>
                    <p className="text-slate-400 text-sm">Control Pricing, Offers & Plan Features</p>
                </div>
                <GlassButton onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2"/> Save Changes</>}
                </GlassButton>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                
                {/* 1. FLASH SALE CONTROLS */}
                <GlassCard className="bg-slate-900 border-slate-800">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Timer className="w-5 h-5 text-orange-500"/> Flash Sale Engine
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                            <span className="text-sm text-white font-bold">Activate Flash Sale</span>
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 accent-orange-500"
                                checked={config.flashSaleActive}
                                onChange={e => setConfig({...config, flashSaleActive: e.target.checked})}
                            />
                        </div>
                        
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Countdown End Time</label>
                            <GlassInput 
                                type="datetime-local" 
                                value={config.flashSaleEndTime || ''}
                                onChange={e => setConfig({...config, flashSaleEndTime: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Banner Text</label>
                            <GlassInput 
                                placeholder="Monsoon Offer: 50% OFF Ends Soon!" 
                                value={config.flashSaleText || ''}
                                onChange={e => setConfig({...config, flashSaleText: e.target.value})}
                            />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg mt-2">
                            <span className="text-sm text-white font-bold">Global Urgency Banner</span>
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 accent-red-500"
                                checked={config.showUrgencyBanner}
                                onChange={e => setConfig({...config, showUrgencyBanner: e.target.checked})}
                            />
                        </div>
                    </div>
                </GlassCard>

                {/* 2. DYNAMIC PRICING */}
                <GlassCard className="bg-slate-900 border-slate-800">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-500"/> Dynamic Pricing
                    </h3>
                    
                    <div className="mb-4">
                        <label className="text-xs text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Billing Cycle Display</label>
                        <GlassInput 
                            placeholder="/year" 
                            value={config.billingCycle || '/year'}
                            onChange={e => setConfig({...config, billingCycle: e.target.value})}
                            className="font-mono text-center text-yellow-400"
                        />
                    </div>

                    {/* Smart Plan */}
                    <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <h4 className="text-sm font-black text-blue-400 uppercase mb-3">Plan B: Smart Campus</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold">Selling Price (₹)</label>
                                <input className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-mono" type="number" value={config.smartPlanPrice} onChange={e => setConfig({...config, smartPlanPrice: parseInt(e.target.value)})}/>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold">Fake Original (₹)</label>
                                <input className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-400 font-mono" type="number" value={config.smartPlanOriginal} onChange={e => setConfig({...config, smartPlanOriginal: parseInt(e.target.value)})}/>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-red-500"/>
                            <label className="text-xs text-slate-400">Seats Left Display:</label>
                            <input className="w-16 bg-slate-900 border border-slate-600 rounded p-1 text-white text-center font-bold" type="number" value={config.smartPlanSeatsLeft} onChange={e => setConfig({...config, smartPlanSeatsLeft: parseInt(e.target.value)})}/>
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <h4 className="text-sm font-black text-purple-400 uppercase mb-3">Plan C: Institute Pro</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold">Selling Price (₹)</label>
                                <input className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-mono" type="number" value={config.proPlanPrice} onChange={e => setConfig({...config, proPlanPrice: parseInt(e.target.value)})}/>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold">Fake Original (₹)</label>
                                <input className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-400 font-mono" type="number" value={config.proPlanOriginal} onChange={e => setConfig({...config, proPlanOriginal: parseInt(e.target.value)})}/>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-red-500"/>
                            <label className="text-xs text-slate-400">Seats Left Display:</label>
                            <input className="w-16 bg-slate-900 border border-slate-600 rounded p-1 text-white text-center font-bold" type="number" value={config.proPlanSeatsLeft} onChange={e => setConfig({...config, proPlanSeatsLeft: parseInt(e.target.value)})}/>
                        </div>
                    </div>
                </GlassCard>
            </div>
            
            {/* 3. FEATURE MATRIX */}
            <GlassCard className="bg-slate-900 border-slate-800">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-blue-400"/> Feature Assignment Matrix
                </h3>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800 text-xs uppercase text-slate-400">
                            <tr>
                                <th className="p-4">Feature Name</th>
                                <th className="p-4 text-center text-slate-300">Starter (Free)</th>
                                <th className="p-4 text-center text-blue-400">Smart</th>
                                <th className="p-4 text-center text-purple-400">Pro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {AVAILABLE_FEATURES.map((feature) => (
                                <tr key={feature} className="hover:bg-slate-800/50">
                                    <td className="p-3 text-slate-300">{feature}</td>
                                    <td className="p-3 text-center">
                                        <input 
                                            type="checkbox" 
                                            checked={config.planFeatures?.starter.includes(feature)}
                                            onChange={() => toggleFeature('starter', feature)}
                                            className="w-4 h-4 accent-slate-500"
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <input 
                                            type="checkbox" 
                                            checked={config.planFeatures?.smart.includes(feature)}
                                            onChange={() => toggleFeature('smart', feature)}
                                            className="w-4 h-4 accent-blue-500"
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <input 
                                            type="checkbox" 
                                            checked={config.planFeatures?.pro.includes(feature)}
                                            onChange={() => toggleFeature('pro', feature)}
                                            className="w-4 h-4 accent-purple-500"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
            
            {/* GOLDEN HOUR (FEATURE TASTING) */}
            <GlassCard className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-white text-lg flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400"/> Golden Hour Strategy (Feature Tasting)</h3>
                        <p className="text-sm text-slate-400 mt-1">Unlock 'Pro' features for ALL free users temporarily to increase upgrade desire.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold uppercase ${config.globalTrialMode ? 'text-green-400 animate-pulse' : 'text-slate-500'}`}>
                            {config.globalTrialMode ? 'ACTIVE NOW' : 'INACTIVE'}
                        </span>
                        <button 
                            onClick={() => setConfig({...config, globalTrialMode: !config.globalTrialMode})}
                            className={`w-14 h-8 rounded-full transition-colors relative ${config.globalTrialMode ? 'bg-green-500' : 'bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${config.globalTrialMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default MarketingTab;