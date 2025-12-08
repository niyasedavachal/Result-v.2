
import React from 'react';
import { GlassCard, GlassButton } from '../../components/GlassUI';
import { Plus, Users, FileText, Rocket, CheckCircle2, ArrowRight, UserPlus } from 'lucide-react';
import { api } from '../../services/api';
import { Student, ClassData, SystemStats } from '../../types';
import { formatDate } from '../../services/utils';

interface Props {
    setActiveTab: (tab: any) => void;
    stats: SystemStats | null;
    classes: ClassData[];
    pendingAdmissions: Student[];
    onRefresh: () => void;
    setShowPublishModal: (show: boolean) => void;
    setShowStudentEntryModal: (show: boolean) => void;
}

const OverviewTab: React.FC<Props> = ({ setActiveTab, classes, pendingAdmissions, onRefresh, setShowPublishModal, setShowStudentEntryModal }) => {
    
    const handleAdmissionAction = async (studentId: string, action: 'APPROVE' | 'REJECT') => {
        if (action === 'APPROVE') {
            const res = await api.verifyStudent(studentId, 'Admin');
            if (res.success) {
                onRefresh();
            } else alert(res.message);
        } else {
            if(!window.confirm("Reject this admission?")) return;
            const res = await api.rejectAdmission(studentId);
            if (res.success) onRefresh();
        }
    };

    const hasClasses = classes.length > 0;
    const hasStudents = classes.reduce((acc, curr) => acc + (curr.studentCount || 0), 0) > 0;
    const isSubmitted = classes.some(c => c.submissionStatus === 'SUBMITTED');

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* 1. Quick Launchpad */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => setActiveTab('classes')} className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-5 rounded-2xl shadow-lg shadow-blue-500/20 text-left transition-transform hover:-translate-y-1">
                    <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                        <Plus className="w-6 h-6 text-white"/>
                    </div>
                    <h3 className="font-bold text-lg leading-none mb-1">Add Class</h3>
                    <p className="text-blue-100 text-xs opacity-80">Step 1: Create</p>
                </button>

                <button onClick={() => setShowStudentEntryModal(true)} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-left transition-transform hover:-translate-y-1">
                    <div className="bg-orange-100 dark:bg-orange-900/30 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                        <Users className="w-6 h-6 text-orange-600 dark:text-orange-400"/>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-none mb-1">Add Students</h3>
                    <p className="text-slate-500 text-xs">Step 2: Quick Entry</p>
                </button>

                <button onClick={() => setActiveTab('settings')} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-left transition-transform hover:-translate-y-1">
                    <div className="bg-purple-100 dark:bg-purple-900/30 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400"/>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-none mb-1">Exam Name</h3>
                    <p className="text-slate-500 text-xs">Step 3: Configure</p>
                </button>

                <button onClick={() => setShowPublishModal(true)} className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-5 rounded-2xl shadow-lg shadow-green-500/20 text-left transition-transform hover:-translate-y-1">
                    <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                        <Rocket className="w-6 h-6 text-white"/>
                    </div>
                    <h3 className="font-bold text-lg leading-none mb-1">Publish Result</h3>
                    <p className="text-green-100 text-xs opacity-80">Final Step: Share Link</p>
                </button>
            </div>

            {/* Pending Admissions */}
            {pendingAdmissions.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 animate-pulse">
                    <h4 className="font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2 mb-2">
                        <UserPlus className="w-5 h-5"/> Pending Admissions ({pendingAdmissions.length})
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {pendingAdmissions.map(p => (
                            <div key={p.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center shadow-sm border border-slate-100">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">{p.name}</span>
                                        <span className="text-[10px] bg-slate-100 px-1 rounded">{p.className}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">{p.gender}, {formatDate(p.dob)}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAdmissionAction(p.id, 'APPROVE')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold hover:bg-green-200">Approve</button>
                                    <button onClick={() => handleAdmissionAction(p.id, 'REJECT')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold hover:bg-red-200">Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Setup Progress Tracker */}
            <GlassCard className="border-t-4 border-t-indigo-500">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Setup Progress</h3>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ready to Publish?</span>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className={`flex-1 flex items-center gap-3 p-3 rounded-lg w-full ${hasClasses ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-100 dark:bg-slate-800 opacity-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${hasClasses ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
                            {hasClasses ? <CheckCircle2 className="w-5 h-5"/> : "1"}
                        </div>
                        <div>
                            <p className={`font-bold text-sm ${hasClasses ? 'text-green-800 dark:text-green-300' : 'text-slate-600'}`}>Create Classes</p>
                            <p className="text-[10px] text-slate-500">Add 10A, 10B etc</p>
                        </div>
                    </div>
                    <ArrowRight className="hidden md:block text-slate-300 w-5 h-5"/>
                    <div className={`flex-1 flex items-center gap-3 p-3 rounded-lg w-full ${hasStudents ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-100 dark:bg-slate-800 opacity-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${hasStudents ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
                            {hasStudents ? <CheckCircle2 className="w-5 h-5"/> : "2"}
                        </div>
                        <div>
                            <p className={`font-bold text-sm ${hasStudents ? 'text-green-800 dark:text-green-300' : 'text-slate-600'}`}>Add Students</p>
                            <p className="text-[10px] text-slate-500">Teachers login & add</p>
                        </div>
                    </div>
                    <ArrowRight className="hidden md:block text-slate-300 w-5 h-5"/>
                    <div className={`flex-1 flex items-center gap-3 p-3 rounded-lg w-full ${isSubmitted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-100 dark:bg-slate-800 opacity-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSubmitted ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
                            {isSubmitted ? <CheckCircle2 className="w-5 h-5"/> : "3"}
                        </div>
                        <div>
                            <p className={`font-bold text-sm ${isSubmitted ? 'text-green-800 dark:text-green-300' : 'text-slate-600'}`}>Enter Marks</p>
                            <p className="text-[10px] text-slate-500">Submit marks data</p>
                        </div>
                    </div>
                </div>
            </GlassCard>
            
            {/* Recent Classes Summary */}
            <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-500"/> Your Classes
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.slice(0, 6).map(cls => (
                        <div key={cls.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <p className="font-black text-lg text-slate-800 dark:text-white">{cls.name}</p>
                                <p className="text-xs text-slate-500">{cls.studentCount || 0} Students</p>
                            </div>
                            <div className={`text-xs font-bold px-2 py-1 rounded ${cls.submissionStatus === 'SUBMITTED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {cls.submissionStatus === 'SUBMITTED' ? 'READY' : 'PENDING'}
                            </div>
                        </div>
                    ))}
                    {classes.length === 0 && (
                        <div className="col-span-full text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm">
                            No classes yet. Click "Add Class" above.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
