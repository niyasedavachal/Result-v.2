

import React, { useEffect, useState } from 'react';
import { GlassCard, GlassButton } from '../../components/GlassUI';
import { api } from '../../services/api';
import { SchoolSummary } from '../../types';
import { School, Search, MoreVertical, ShieldCheck, ShieldAlert, Calendar, Users, Briefcase } from 'lucide-react';

const SchoolManagerTab: React.FC = () => {
    const [schools, setSchools] = useState<SchoolSummary[]>([]);
    const [filtered, setFiltered] = useState<SchoolSummary[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionSchool, setActionSchool] = useState<SchoolSummary | null>(null);
    const [upgradeDays, setUpgradeDays] = useState(365);

    useEffect(() => {
        loadSchools();
    }, []);

    useEffect(() => {
        if (!search) {
            setFiltered(schools);
        } else {
            const lower = search.toLowerCase();
            setFiltered(schools.filter(s => 
                s.name.toLowerCase().includes(lower) || 
                s.adminEmail.toLowerCase().includes(lower) ||
                s.place?.toLowerCase().includes(lower)
            ));
        }
    }, [search, schools]);

    const loadSchools = async () => {
        setLoading(true);
        const data = await api.getAllSchools();
        setSchools(data);
        setFiltered(data);
        setLoading(false);
    };

    const handleGrantUpgrade = async () => {
        if (!actionSchool) return;
        if (!confirm(`Upgrade ${actionSchool.name} to PRO for ${upgradeDays} days?`)) return;
        
        const res = await api.manuallyUpgradeSchool(actionSchool.id, true, upgradeDays);
        if (res.success) {
            alert("Upgrade Successful! School now has Pro access.");
            setActionSchool(null);
            loadSchools();
        } else {
            alert("Upgrade Failed");
        }
    };

    const handleRevoke = async () => {
        if (!actionSchool) return;
        if (!confirm(`Revoke PRO access from ${actionSchool.name}?`)) return;
        
        const res = await api.manuallyUpgradeSchool(actionSchool.id, false, 0);
        if (res.success) {
            alert("Access Revoked.");
            setActionSchool(null);
            loadSchools();
        } else {
            alert("Failed");
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in-up">
            
            {/* Header / Search */}
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                    <School className="w-6 h-6 text-blue-500"/>
                    <h2 className="text-xl font-bold text-white">School Manager</h2>
                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">{schools.length} Total</span>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500"/>
                    <input 
                        type="text" 
                        placeholder="Search schools..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                </div>
            </div>

            {/* Table */}
            <GlassCard className="flex-1 p-0 bg-slate-900 border-slate-800 overflow-hidden">
                <div className="overflow-y-auto h-[600px] custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800 text-slate-400 text-xs uppercase sticky top-0 z-10">
                            <tr>
                                <th className="p-4">School Name</th>
                                <th className="p-4">Admin Email</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Students</th>
                                <th className="p-4 text-center">Expiry</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {filtered.map(school => (
                                <tr key={school.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-bold text-white">
                                        {school.name}
                                        <p className="text-[10px] text-slate-500 font-normal">{school.place}</p>
                                    </td>
                                    <td className="p-4">{school.adminEmail}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${school.isPro ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                            {school.isPro ? 'PRO' : 'FREE'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">{school.studentCount}</td>
                                    <td className="p-4 text-center font-mono text-xs">
                                        {school.expiryDate ? new Date(school.expiryDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => setActionSchool(school)}
                                            className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
                                        >
                                            <MoreVertical className="w-4 h-4"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">No schools found matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* ACTION MODAL */}
            {actionSchool && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <GlassCard className="w-full max-w-md border-t-4 border-t-blue-500 bg-slate-900">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">{actionSchool.name}</h3>
                                <p className="text-sm text-slate-400">{actionSchool.isPro ? 'Currently Pro Plan' : 'Currently Free Plan'}</p>
                            </div>
                            <button onClick={() => setActionSchool(null)} className="text-slate-500 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-4">
                            {!actionSchool.isPro ? (
                                <div className="bg-green-900/20 p-4 rounded-xl border border-green-900/50">
                                    <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Grant Special Upgrade</h4>
                                    <p className="text-xs text-green-200 mb-3">Give this school free PRO access.</p>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" 
                                            value={upgradeDays} 
                                            onChange={e => setUpgradeDays(parseInt(e.target.value))}
                                            className="w-20 bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                                        />
                                        <button onClick={handleGrantUpgrade} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded py-2 text-xs">
                                            Grant {upgradeDays} Days
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-900/20 p-4 rounded-xl border border-red-900/50">
                                    <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Revoke Access</h4>
                                    <p className="text-xs text-red-200 mb-3">Downgrade this school back to Free Plan.</p>
                                    <button onClick={handleRevoke} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded py-2 text-xs">
                                        Revoke Pro Status
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-center mt-4">
                                <div className="bg-slate-800 p-3 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase font-bold">Students</p>
                                    <p className="text-lg font-black text-white">{actionSchool.studentCount}</p>
                                </div>
                                <div className="bg-slate-800 p-3 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase font-bold">Classes</p>
                                    <p className="text-lg font-black text-white">{actionSchool.classCount}</p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default SchoolManagerTab;