

import React, { useEffect, useState } from 'react';
import { GlassCard, GlassButton } from '../../components/GlassUI';
import { api } from '../../services/api';
import { Database, Cloud, RefreshCw, AlertTriangle, Play, Server, HardDrive, ArrowLeft, ChevronRight, Activity, Globe } from 'lucide-react';

const InfrastructureTab: React.FC = () => {
    const [view, setView] = useState<'OVERVIEW' | 'DB_DETAILS' | 'STORAGE_DETAILS'>('OVERVIEW');
    const [pools, setPools] = useState<any[]>([]);
    const [sqlScript, setSqlScript] = useState('');
    const [migrating, setMigrating] = useState(false);
    const [migrationResult, setMigrationResult] = useState('');

    useEffect(() => {
        loadPools();
    }, []);

    const loadPools = async () => {
        const data = await api.getStoragePoolStatus();
        setPools(data);
    };

    const handleRunMigration = async () => {
        if (!sqlScript.trim()) return;
        setMigrating(true);
        const res = await api.runDatabaseMigration(sqlScript);
        setMigrating(false);
        setMigrationResult(res.message || 'Done');
        setTimeout(() => setMigrationResult(''), 3000);
    };

    const handleAutoHeal = async (type: 'CACHE' | 'CONNECTION') => {
        if(!confirm("Are you sure? This will reset active connections.")) return;
        await api.triggerAutoHeal(type);
        alert("Healing sequence initiated.");
    };

    // --- SUB VIEW: DATABASE DETAILS ---
    if (view === 'DB_DETAILS') {
        return (
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => setView('OVERVIEW')} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5"/>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-white">Database Control</h2>
                        <p className="text-xs text-slate-500">PostgreSQL 15.2 (Supabase)</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Migrator */}
                    <GlassCard className="bg-slate-900 border-slate-800 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2"><Database className="w-4 h-4 text-orange-500"/> SQL Migrator</h3>
                            <span className="text-[10px] text-slate-500">Admin Mode</span>
                        </div>
                        <textarea 
                            className="flex-1 bg-slate-950 font-mono text-xs text-green-400 p-3 rounded-lg border border-slate-800 outline-none resize-none mb-4"
                            placeholder="-- Enter SQL command to repair/migrate tables..."
                            rows={8}
                            value={sqlScript}
                            onChange={e => setSqlScript(e.target.value)}
                        ></textarea>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-green-500 font-mono">{migrationResult}</span>
                            <GlassButton onClick={handleRunMigration} disabled={migrating || !sqlScript} className="bg-orange-600 hover:bg-orange-700 text-xs py-2">
                                {migrating ? 'Running...' : <><Play className="w-3 h-3 mr-1"/> Execute</>}
                            </GlassButton>
                        </div>
                    </GlassCard>

                    {/* Auto Heal */}
                    <div className="space-y-6">
                        <GlassCard className="bg-slate-900 border-slate-800">
                            <h3 className="font-bold text-white flex items-center gap-2 mb-6"><AlertTriangle className="w-4 h-4 text-red-500"/> Emergency Operations</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-red-900/10 border border-red-900/30 rounded-lg">
                                    <div>
                                        <h4 className="font-bold text-slate-200 text-sm">Purge Redis Cache</h4>
                                        <p className="text-[10px] text-slate-500">Clears session data & temp keys.</p>
                                    </div>
                                    <button onClick={() => handleAutoHeal('CACHE')} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded">
                                        Purge
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                                    <div>
                                        <h4 className="font-bold text-slate-200 text-sm">Reset Connection Pool</h4>
                                        <p className="text-[10px] text-slate-500">Disconnects active clients.</p>
                                    </div>
                                    <button onClick={() => handleAutoHeal('CONNECTION')} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded">
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                        
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                            <h4 className="text-white text-sm font-bold mb-2">Replica Status</h4>
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                <span>Read Replica (SG)</span>
                                <span className="text-green-500">Synced</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1 rounded-full"><div className="w-full h-full bg-green-500 rounded-full"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN VIEW: OVERVIEW ---
    return (
        <div className="space-y-8 animate-fade-in-up">
            
            <div className="grid grid-cols-2 gap-4">
                <div onClick={() => setView('DB_DETAILS')} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500 cursor-pointer group transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-900/20 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                            <Database className="w-8 h-8"/>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500"/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Core Database</h3>
                    <p className="text-sm text-slate-500 mb-4">Manage SQL, Migrations, and Auto-healing.</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-green-400">
                        <Activity className="w-3 h-3"/> 99.9% Uptime
                    </div>
                </div>

                <div onClick={() => setView('STORAGE_DETAILS')} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-purple-500 cursor-pointer group transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-900/20 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                            <Cloud className="w-8 h-8"/>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-500"/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Storage Mesh</h3>
                    <p className="text-sm text-slate-500 mb-4">Manage Cloudinary pools and CDN nodes.</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                        <Globe className="w-3 h-3"/> 4 Active Nodes
                    </div>
                </div>
            </div>

            {/* QUICK PREVIEW OF POOLS */}
            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Live Node Status</h3>
                <div className="grid md:grid-cols-4 gap-4">
                    {pools.map(pool => (
                        <div key={pool.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-white text-xs">{pool.name}</h4>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${pool.status === 'HEALTHY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {pool.status}
                                </span>
                            </div>
                            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-2">
                                <div 
                                    className={`h-full rounded-full ${pool.used > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                    style={{width: `${(pool.used/pool.limit)*100}%`}}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InfrastructureTab;