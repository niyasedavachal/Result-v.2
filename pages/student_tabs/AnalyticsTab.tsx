
import React from 'react';
import { GlassCard } from '../../components/GlassUI';
import { Marks, Student } from '../../types';
import { BarChart3, TrendingUp, Award, Frown, BookOpen } from 'lucide-react';

interface Props {
    marks: Marks | null;
    user: Student;
}

const AnalyticsTab: React.FC<Props> = ({ marks, user }) => {
    
    if (!marks) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 animate-fade-in-up">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Frown className="w-10 h-10 text-slate-400"/>
                </div>
                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">No Data Available</h3>
                <p className="text-sm text-slate-500 mt-2">
                    Marks for the current term haven't been published yet.
                </p>
            </div>
        );
    }

    const subjects = Object.entries(marks.subjects);
    const maxPossible = subjects.length * 100; // Assumption
    const percentage = maxPossible > 0 ? (marks.total / maxPossible) * 100 : 0;

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* OVERVIEW CARD */}
            <div className="grid grid-cols-2 gap-4">
                <GlassCard className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
                    <p className="text-xs font-bold opacity-70 uppercase mb-1">Total Score</p>
                    <h2 className="text-3xl font-black">{marks.total}</h2>
                    <div className="mt-2 text-[10px] bg-white/20 inline-block px-2 py-0.5 rounded">
                        {percentage.toFixed(1)}% Secured
                    </div>
                </GlassCard>
                <GlassCard className="bg-white dark:bg-slate-800 flex flex-col justify-center items-center text-center">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
                        <Award className="w-6 h-6 text-purple-600"/>
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Grade</p>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">{marks.grade}</h2>
                </GlassCard>
            </div>

            {/* VISUAL CHART */}
            <GlassCard>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500"/> Subject Analysis
                    </h3>
                </div>
                
                {/* CSS Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-40 mb-2 border-b border-slate-100 dark:border-slate-700 pb-2 px-1">
                    {subjects.map(([sub, score], idx) => {
                        const val = typeof score === 'number' ? score : 0;
                        const height = Math.min(100, Math.max(10, val)); 
                        // Color logic
                        const colorClass = val >= 90 ? 'bg-green-500' : val >= 75 ? 'bg-blue-500' : val >= 40 ? 'bg-yellow-500' : 'bg-red-500';
                        
                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded transition-opacity pointer-events-none z-10 whitespace-nowrap">
                                    {sub}: {val}
                                </div>
                                <div className={`text-[9px] font-bold ${val >= 90 ? 'text-green-600' : 'text-slate-400'}`}>{val}</div>
                                <div 
                                    className={`w-full rounded-t-md transition-all duration-1000 ease-out hover:opacity-80 ${colorClass}`} 
                                    style={{ height: `${height}%` }}
                                ></div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase px-1">
                    {subjects.map(([sub], i) => (
                        <div key={i} className="flex-1 text-center truncate px-0.5">{sub.substring(0,3)}</div>
                    ))}
                </div>
            </GlassCard>

            {/* DETAILED LIST */}
            <div className="space-y-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm ml-1 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-500"/> Report Card
                </h3>
                {subjects.map(([sub, score], idx) => {
                    const val = typeof score === 'number' ? score : 0;
                    return (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`w-1 h-8 rounded-full ${val >= 40 ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white text-sm">{sub}</p>
                                    <p className="text-[10px] text-slate-500">Maximum: 100</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black text-slate-800 dark:text-white">{val}</p>
                                <p className={`text-[10px] font-bold ${val >= 40 ? 'text-green-500' : 'text-red-500'}`}>
                                    {val >= 40 ? 'PASS' : 'FAIL'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AnalyticsTab;
