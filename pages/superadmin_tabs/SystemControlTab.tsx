
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/GlassUI';
import { api } from '../../services/api';
import { ToggleLeft, ShieldAlert, Database, CloudOff, Lock, Unlock, RefreshCw } from 'lucide-react';

const SystemControlTab: React.FC = () => {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const data = await api.getGlobalSettings();
        setSettings(data);
        setLoading(false);
    };

    const toggleSetting = async (key: string) => {
        const current = settings[key] === 'TRUE';
        const newVal = current ? 'FALSE' : 'TRUE';
        setSettings({ ...settings, [key]: newVal }); // Optimistic UI
        await api.updateGlobalSetting(key, newVal);
    };

    if (loading) return <div>Loading Controls...</div>;

    const FeatureToggle = ({ label, keyName, desc }: { label: string, keyName: string, desc: string }) => {
        const isOn = settings[keyName] === 'TRUE';
        return (
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                    <h4 className={`font-bold ${isOn ? 'text-white' : 'text-slate-500'}`}>{label}</h4>
                    <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <button onClick={() => toggleSetting(keyName)} className={`relative w-12 h-7 rounded-full transition-colors ${isOn ? 'bg-green-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${isOn ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            
            {/* 1. Global Feature Flags */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <ToggleLeft className="w-4 h-4"/> Global Modules
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <FeatureToggle label="Public Registration" keyName="ENABLE_PUBLIC_REGISTRATION" desc="Allow new students to register via public links" />
                    <FeatureToggle label="Teacher Login" keyName="ENABLE_TEACHER_LOGIN" desc="Enable/Disable teacher access globally" />
                    <FeatureToggle label="Student Login" keyName="ENABLE_STUDENT_LOGIN" desc="Enable/Disable student result checking" />
                    <FeatureToggle label="Fees Module" keyName="MODULE_FEES" desc="Show/Hide Fees tab for all schools" />
                    <FeatureToggle label="Assessments Module" keyName="MODULE_ASSESSMENTS" desc="Show/Hide Assessments tab for all schools" />
                    <FeatureToggle label="Ads System" keyName="ENABLE_ADS" desc="Display ads on result pages" />
                </div>
            </div>

            {/* 2. Emergency Controls */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4"/> Danger Zone
                </h3>
                <div className="p-6 bg-red-900/10 border border-red-900/30 rounded-xl flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-bold text-lg">System Maintenance Mode</h4>
                        <p className="text-slate-400 text-sm">This will block ALL public access. Only Super Admin can login.</p>
                    </div>
                    <button 
                        onClick={() => toggleSetting('MAINTENANCE_MODE')}
                        className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 ${settings['MAINTENANCE_MODE'] === 'TRUE' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-red-500 border border-red-900/50'}`}
                    >
                        {settings['MAINTENANCE_MODE'] === 'TRUE' ? <><Lock className="w-4 h-4"/> MAINTENANCE ACTIVE</> : <><Unlock className="w-4 h-4"/> ACTIVATE LOCKDOWN</>}
                    </button>
                </div>
            </div>

            {/* 3. Database Tools */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4"/> Database Tools
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <button className="p-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-left transition-colors">
                        <div className="bg-blue-900/30 p-2 rounded-lg w-fit mb-2 text-blue-400"><RefreshCw className="w-5 h-5"/></div>
                        <h4 className="font-bold text-white text-sm">Clear Cache</h4>
                        <p className="text-[10px] text-slate-500">Reset Redis/Local cache</p>
                    </button>
                    <button className="p-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-left transition-colors">
                        <div className="bg-orange-900/30 p-2 rounded-lg w-fit mb-2 text-orange-400"><CloudOff className="w-5 h-5"/></div>
                        <h4 className="font-bold text-white text-sm">Purge Logs</h4>
                        <p className="text-[10px] text-slate-500">Delete logs older than 90 days</p>
                    </button>
                </div>
            </div>

        </div>
    );
};

export default SystemControlTab;
