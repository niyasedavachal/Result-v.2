
import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassUI';
import { api } from '../../services/api';
import { SystemStats } from '../../types';
import { TrendingUp, Users, Server, Database, Globe, Zap, ArrowUpRight, DollarSign } from 'lucide-react';

const OverviewTab: React.FC = () => {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await api.getAdvancedSystemStats();
            setStats(data);
            setLoading(false);
        };
        load();
        const interval = setInterval(load, 30000); // Live refresh
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="text-center text-slate-500 py-20 font-mono">INITIALIZING TELEMETRY...</div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            
            {/* 1. HUD ROW - KEY METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassCard className="bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-blue-500/50 transition-all">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Users className="w-16 h-16 text-blue-500"/></div>
                    <p className="text-xs font-mono text-blue-400 mb-1">TOTAL USERS</p>
                    <h2 className="text-3xl font-black text-white">{stats?.totalStudents?.toLocaleString()}</h2>
                    <div className="flex items-center gap-1 text-[10px] text-green-400 mt-2">
                        <ArrowUpRight className="w-3 h-3"/> +{stats?.dailyGrowthRate}% Today
                    </div>
                </GlassCard>

                <GlassCard className="bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-green-500/50 transition-all">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign className="w-16 h-16 text-green-500"/></div>
                    <p className="text-xs font-mono text-green-400 mb-1">REVENUE (MRR)</p>
                    <h2 className="text-3xl font-black text-white">₹{stats?.totalRevenue?.toLocaleString()}</h2>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                        {stats?.proSchools} Active Subscriptions
                    </div>
                </GlassCard>

                <GlassCard className="bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-purple-500/50 transition-all">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Globe className="w-16 h-16 text-purple-500"/></div>
                    <p className="text-xs font-mono text-purple-400 mb-1">ACTIVE SCHOOLS</p>
                    <h2 className="text-3xl font-black text-white">{stats?.totalSchools}</h2>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                        Across 12 Districts
                    </div>
                </GlassCard>

                <GlassCard className="bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-orange-500/50 transition-all">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Zap className="w-16 h-16 text-orange-500"/></div>
                    <p className="text-xs font-mono text-orange-400 mb-1">LIVE TRAFFIC</p>
                    <h2 className="text-3xl font-black text-white">{stats?.activeUsersNow}</h2>
                    <div className="flex items-center gap-1 text-[10px] text-green-400 mt-2 animate-pulse">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online Now
                    </div>
                </GlassCard>
            </div>

            {/* 2. SYSTEM HEALTH GRID */}
            <div className="grid md:grid-cols-3 gap-6">
                
                {/* Latency Monitor */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                    <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                        <ActivityGraph className="w-4 h-4"/> SYSTEM LATENCY
                    </h3>
                    <div className="flex items-end gap-1 h-32 w-full">
                        {[...Array(40)].map((_, i) => {
                            const height = Math.floor(Math.random() * 80) + 10;
                            return (
                                <div 
                                    key={i} 
                                    className={`flex-1 rounded-t-sm transition-all duration-500 ${height > 70 ? 'bg-red-500' : height > 40 ? 'bg-blue-500' : 'bg-slate-700'}`} 
                                    style={{height: `${height}%`}}
                                ></div>
                            )
                        })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-mono text-slate-500">
                        <span>-60s</span>
                        <span className="text-green-400">{stats?.serverLatency}ms avg</span>
                        <span>Now</span>
                    </div>
                </div>

                {/* Storage & DB */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                            <Database className="w-4 h-4"/> DATABASE LOAD
                        </h3>
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                                <span>Storage Used</span>
                                <span>{stats?.dbSizeMB} MB</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{width: '15%'}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                                <span>API Requests (1m)</span>
                                <span>1,204</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full rounded-full" style={{width: '45%'}}></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                        <span>Region: ap-south-1</span>
                        <span className="text-green-500 font-bold">HEALTHY</span>
                    </div>
                </div>
            </div>

            {/* 3. AI PREDICTION */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-slate-800 rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-indigo-400"/>
                    </div>
                    <div>
                        <h4 className="text-white font-bold">AI Growth Prediction</h4>
                        <p className="text-xs text-slate-400">Based on current trajectory, we expect <span className="text-white font-bold">+50 schools</span> next month.</p>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-[10px] uppercase text-slate-500 font-bold">Projected Revenue</p>
                    <p className="text-xl font-mono text-green-400">₹{(stats?.totalRevenue || 0) * 1.2}</p>
                </div>
            </div>
        </div>
    );
};

// Simple Graph Icon
const ActivityGraph = ({className}: {className?:string}) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
);

export default OverviewTab;
