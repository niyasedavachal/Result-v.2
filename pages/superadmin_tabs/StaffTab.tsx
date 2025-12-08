

import React, { useEffect, useState } from 'react';
import { GlassCard, GlassButton } from '../../components/GlassUI';
import { api } from '../../services/api';
import { Users, UserPlus, Shield, BarChart2, Circle, ArrowLeft, Mail, Clock, CheckCircle } from 'lucide-react';
import { StaffProfile } from '../../types';

const StaffTab: React.FC = () => {
    const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
    const [staff, setStaff] = useState<StaffProfile[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        const data = await api.getStaffList();
        setStaff(data as any);
    };

    const handleSelectStaff = (s: StaffProfile) => {
        setSelectedStaff(s);
        setView('DETAIL');
    };

    // --- SUB VIEW: DETAIL ---
    if (view === 'DETAIL' && selectedStaff) {
        return (
            <div className="animate-fade-in-up">
                <button onClick={() => setView('LIST')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4"/> Back to Team
                </button>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <GlassCard className="bg-slate-900 border-slate-800 flex flex-col items-center text-center py-8">
                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center font-black text-3xl text-slate-500 mb-4 border-4 border-slate-800 shadow-xl">
                            {selectedStaff.name.substring(0,2)}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">{selectedStaff.name}</h2>
                        <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-xs font-bold mb-6 border border-blue-900/50">
                            {selectedStaff.role}
                        </span>
                        
                        <div className="w-full border-t border-slate-800 pt-6 flex justify-around">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Status</p>
                                <div className={`flex items-center justify-center gap-1 text-sm font-bold ${selectedStaff.status === 'ONLINE' ? 'text-green-500' : 'text-slate-400'}`}>
                                    <Circle className="w-2 h-2 fill-current"/> {selectedStaff.status}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Rating</p>
                                <p className="text-sm font-bold text-white">{selectedStaff.performance}%</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Stats & Logs */}
                    <div className="md:col-span-2 space-y-6">
                        <GlassCard className="bg-slate-900 border-slate-800">
                            <h3 className="font-bold text-white mb-4">Performance Metrics</h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <CheckCircle className="w-4 h-4"/> Tickets Closed
                                    </div>
                                    <p className="text-2xl font-black text-white">1,240</p>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <Clock className="w-4 h-4"/> Avg Response
                                    </div>
                                    <p className="text-2xl font-black text-white">4m 12s</p>
                                </div>
                            </div>
                            
                            <h4 className="font-bold text-slate-400 text-xs uppercase mb-3">Activity Log</h4>
                            <div className="space-y-2">
                                {[1,2,3].map(i => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg text-sm">
                                        <span className="text-slate-300">Resolved Ticket #884{i}</span>
                                        <span className="text-slate-500 text-xs">2h ago</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                        
                        <div className="flex gap-4">
                            <button className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">
                                Edit Role
                            </button>
                            <button className="flex-1 py-3 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 rounded-xl font-bold transition-colors">
                                Deactivate
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN VIEW: LIST ---
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-500"/> Team Management
                </h3>
                <GlassButton onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-xs flex items-center gap-2">
                    <UserPlus className="w-4 h-4"/> Add Staff
                </GlassButton>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map(s => (
                    <GlassCard 
                        key={s.id} 
                        className="bg-slate-900 border-slate-800 relative group hover:border-blue-500/30 transition-all cursor-pointer"
                        onClick={() => handleSelectStaff(s)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-900/30 group-hover:text-blue-400 transition-colors">
                                    {s.name.substring(0,2)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{s.name}</h4>
                                    <p className="text-xs text-blue-400 flex items-center gap-1"><Shield className="w-3 h-3"/> {s.role}</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-bold ${s.status === 'ONLINE' ? 'text-green-500' : 'text-slate-500'}`}>
                                <Circle className="w-2 h-2 fill-current"/> {s.status}
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-800">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1"><BarChart2 className="w-3 h-3"/> Performance</span>
                                <span className="text-xs font-mono text-white">{s.performance}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${s.performance > 90 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${s.performance}%`}}></div>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

export default StaffTab;