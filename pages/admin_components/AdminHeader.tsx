
import React from 'react';
import { GlassButton } from '../../components/GlassUI';
import { Building2, Home, Megaphone, CheckCircle } from 'lucide-react';
import { SchoolConfig } from '../../types';
import { useNavigate } from 'react-router-dom';

interface Props {
    config: SchoolConfig;
    onNoticeClick: () => void;
}

export const AdminHeader: React.FC<Props> = ({ config, onNoticeClick }) => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400">
                    {config.logoUrl ? (
                        <img src={config.logoUrl} className="w-8 h-8 object-contain" alt="Logo"/>
                    ) : (
                        <Building2 className="w-8 h-8"/>
                    )}
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                        {config.schoolName}
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">
                        <span>{config.place}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className={config.isPro ? "text-emerald-600 flex items-center gap-1" : "text-slate-400"}>
                            {config.isPro ? <><CheckCircle className="w-3 h-3"/> PRO CAMPUS</> : "FREE PLAN"}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                 <GlassButton onClick={() => navigate(`/school/${config.slug || config.id}`)} variant="secondary" className="flex-1 md:flex-none flex justify-center items-center gap-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:text-blue-600">
                    <Home className="w-4 h-4"/> Public Page
                </GlassButton>
                 <GlassButton onClick={onNoticeClick} className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                    <Megaphone className="w-4 h-4"/> Post Notice
                </GlassButton>
            </div>
        </div>
    );
};
