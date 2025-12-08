import React from 'react';
import { GlassCard, GlassButton } from '../../components/GlassUI';
import { Marks, SubjectConfig } from '../../types';
import { Save, Lock, CheckCircle2, Unlock } from 'lucide-react';

interface Props {
    students: { id: string; name: string; rollNo?: number }[];
    marks: Record<string, Marks>;
    subjects: SubjectConfig[];
    isSubmitted: boolean;
    loading: boolean;
    onMarkChange: (studentId: string, subject: string, value: string) => void;
    onSaveAll: () => void;
    onSubmitResults: () => void;
}

const MarksTab: React.FC<Props> = ({ students, marks, subjects, isSubmitted, loading, onMarkChange, onSaveAll, onSubmitResults }) => {
    
    // Sort students by Roll No for entry
    const sortedStudents = [...students].sort((a,b) => (a.rollNo || 9999) - (b.rollNo || 9999));

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Enter Marks</h2>
                    {isSubmitted && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold flex items-center gap-1"><Lock className="w-3 h-3"/> Locked</span>}
                </div>
                <div className="flex gap-2">
                    <GlassButton onClick={onSaveAll} variant="secondary" disabled={loading || isSubmitted}>
                        <Save className="w-4 h-4 mr-2 inline"/> Save Draft
                    </GlassButton>
                    <GlassButton onClick={onSubmitResults} className={isSubmitted ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"}>
                        {isSubmitted ? <><Unlock className="w-4 h-4 mr-2 inline"/> Request Unlock</> : <><CheckCircle2 className="w-4 h-4 mr-2 inline"/> Submit to Admin</>}
                    </GlassButton>
                </div>
            </div>
            
            <GlassCard className="overflow-x-auto p-0">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="p-3 w-16 text-center">Roll</th>
                            <th className="p-3 w-48 sticky left-0 bg-slate-100 dark:bg-slate-800 z-10">Student Name</th>
                            {subjects.map(sub => (
                                <th key={sub.name} className="p-3 text-center min-w-[80px]">
                                    {sub.name.substring(0, 10)}
                                    <span className="block text-[9px] opacity-60">Max: {sub.maxMarks}</span>
                                </th>
                            ))}
                            <th className="p-3 w-24 text-center font-black">Total</th>
                            <th className="p-3 w-16 text-center">Grade</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {sortedStudents.map(student => {
                            const studentMarks = marks[student.id];
                            if (!studentMarks) return null;

                            return (
                                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="p-3 text-center font-mono text-slate-500">{student.rollNo || '-'}</td>
                                    <td className="p-3 font-bold text-slate-700 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        {student.name}
                                    </td>
                                    {subjects.map(sub => (
                                        <td key={sub.name} className="p-2 text-center">
                                            <input 
                                                type="text" 
                                                className={`w-12 text-center p-1.5 rounded border outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500 ${isSubmitted ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                                                value={studentMarks.subjects[sub.name] || ''}
                                                onChange={(e) => onMarkChange(student.id, sub.name, e.target.value)}
                                                disabled={isSubmitted}
                                                placeholder="-"
                                            />
                                        </td>
                                    ))}
                                    <td className="p-3 text-center font-black text-blue-600 dark:text-blue-400">
                                        {studentMarks.total}
                                    </td>
                                    <td className={`p-3 text-center font-bold ${studentMarks.grade === 'F' ? 'text-red-500' : 'text-green-600'}`}>
                                        {studentMarks.grade}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    );
};

export default MarksTab;