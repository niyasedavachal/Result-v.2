
import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from '../../components/GlassUI';
import { api } from '../../services/api';
import { AssessmentProgram, ClassData, AssessmentSchedule } from '../../types';
import { ArrowLeft, Sparkles, Star, Smile, Meh, Frown, ThumbsUp, ThumbsDown, Trash2, Plus, Clock, Target, ClipboardList, Edit, Calendar } from 'lucide-react';

interface Props {
    assessments: AssessmentProgram[];
    classes: ClassData[];
    onRefresh: () => void;
}

const AssessmentsTab: React.FC<Props> = ({ assessments, classes, onRefresh }) => {
    const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
    const [creatingAssessment, setCreatingAssessment] = useState(false);
    const [showAssessmentConfirm, setShowAssessmentConfirm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    const [newAssessment, setNewAssessment] = useState<{
        name: string;
        type: 'STAR' | 'EMOJI' | 'YESNO' | 'MARK';
        frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ONETIME';
        assignee: 'TEACHER' | 'PARENT' | 'BOTH';
        targetClassIds: string[];
        questions: { id: string, text: string, maxVal: number, assignee?: 'TEACHER' | 'PARENT' }[];
        sessionCount: number;
        schedules: AssessmentSchedule[];
    }>({
        name: '',
        type: 'STAR',
        frequency: 'WEEKLY',
        assignee: 'TEACHER',
        targetClassIds: [],
        questions: [{ id: 'q1', text: 'Homework', maxVal: 5 }],
        sessionCount: 1,
        schedules: [{ name: 'Term 1', startDate: new Date().toISOString().split('T')[0], endDate: '', startTime: '09:00', endTime: '16:00' }]
    });

    const toggleTargetClass = (classId: string) => {
        setNewAssessment(prev => {
            const exists = prev.targetClassIds.includes(classId);
            let updated;
            if (exists) updated = prev.targetClassIds.filter(id => id !== classId);
            else updated = [...prev.targetClassIds, classId];
            return { ...prev, targetClassIds: updated };
        });
    };

    const toggleAllClasses = () => {
        setNewAssessment(prev => {
            if (prev.targetClassIds.length === classes.length) {
                return { ...prev, targetClassIds: [] }; // Deselect All
            } else {
                return { ...prev, targetClassIds: classes.map(c => c.id) }; // Select All
            }
        });
    };

    const addQuestion = () => {
        setNewAssessment(prev => ({
            ...prev,
            questions: [...prev.questions, { 
                id: `q${Date.now()}`, 
                text: '', 
                maxVal: prev.type === 'STAR' ? 5 : prev.type === 'EMOJI' ? 3 : 10,
                assignee: 'TEACHER' 
            }]
        }));
    };

    const updateQuestion = (idx: number, field: string, val: any) => {
        const updated = [...newAssessment.questions];
        updated[idx] = { ...updated[idx], [field]: val };
        setNewAssessment(prev => ({ ...prev, questions: updated }));
    };

    const removeQuestion = (idx: number) => {
        const updated = [...newAssessment.questions];
        updated.splice(idx, 1);
        setNewAssessment(prev => ({ ...prev, questions: updated }));
    };

    const updateSchedule = (idx: number, field: keyof AssessmentSchedule, value: string) => {
        setNewAssessment(prev => {
            const updated = [...prev.schedules];
            updated[idx] = { ...updated[idx], [field]: value };
            return { ...prev, schedules: updated };
        });
    };

    const handlePreCreateAssessment = () => {
        if (!newAssessment.name) return alert("Please enter a program name");
        if (newAssessment.questions.some(q => !q.text)) return alert("Please fill all questions");
        
        const invalidSchedule = newAssessment.schedules.some(s => !s.startDate || !s.endDate);
        if (invalidSchedule) return alert("Please fill start and end dates for all sessions.");

        setShowAssessmentConfirm(true);
    };

    const handleConfirmAssessment = async () => {
        setCreatingAssessment(true);
        const payload = {
            ...newAssessment,
            targetClassIds: newAssessment.targetClassIds.length === 0 ? classes.map(c=>c.id) : newAssessment.targetClassIds,
            startDate: newAssessment.schedules[0]?.startDate, 
            endDate: newAssessment.schedules[newAssessment.schedules.length - 1]?.endDate
        };

        let res;
        if (editingId) {
            res = await api.updateAssessmentProgram(editingId, payload);
        } else {
            res = await api.createAssessmentProgram(payload);
        }
        
        setCreatingAssessment(false);
        setShowAssessmentConfirm(false);

        if (res.success) {
            setIsCreatingAssessment(false);
            setEditingId(null);
            onRefresh();
            // Reset
            setNewAssessment({
                name: '', type: 'STAR', frequency: 'WEEKLY', assignee: 'TEACHER', targetClassIds: [],
                questions: [{ id: 'q1', text: 'Homework', maxVal: 5 }], sessionCount: 1,
                schedules: [{ name: 'Term 1', startDate: new Date().toISOString().split('T')[0], endDate: '', startTime: '09:00', endTime: '16:00' }]
            });
        } else {
            alert("Failed: " + (typeof res.message === 'string' ? res.message : JSON.stringify(res.message)));
        }
    };

    const handleEdit = (prog: AssessmentProgram) => {
        setEditingId(prog.id);
        setNewAssessment({
            name: prog.name,
            type: prog.type,
            frequency: prog.frequency,
            assignee: prog.assignee,
            targetClassIds: prog.targetClassIds || [],
            questions: prog.questions,
            sessionCount: prog.schedules?.length || 1,
            schedules: prog.schedules?.length ? prog.schedules : [{ name: 'Term 1', startDate: prog.startDate || '', endDate: prog.endDate || '' }]
        });
        setIsCreatingAssessment(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Unpublish this assessment? Data will be deleted.")) return;
        const res = await api.deleteAssessmentProgram(id);
        if (res.success) onRefresh();
        else alert("Failed to delete.");
    };

    const getProgramStatus = (prog: AssessmentProgram) => {
        if (prog.schedules && prog.schedules.length > 0) {
            const now = new Date();
            const activeSession = prog.schedules.find(s => {
                const start = new Date(s.startDate);
                const end = new Date(s.endDate);
                end.setHours(23, 59, 59);
                return now >= start && now <= end;
            });

            if (activeSession) return { label: `ACTIVE: ${activeSession.name}`, color: 'text-green-600 bg-green-100', active: true };
            const nextSession = prog.schedules.find(s => new Date(s.startDate) > now);
            if (nextSession) {
                 const diff = Math.ceil((new Date(nextSession.startDate).getTime() - now.getTime()) / (1000 * 3600 * 24));
                 return { label: `STARTS IN ${diff} DAYS`, color: 'text-yellow-600 bg-yellow-100', active: false };
            }
            return { label: 'ENDED', color: 'text-slate-500 bg-slate-100', active: false };
        }
        return { label: 'ACTIVE', color: 'text-green-600 bg-green-100', active: true };
    };

    const renderPreviewControls = (type: string) => {
        switch(type) {
            case 'STAR': 
                return <div className="flex gap-0.5">{[...Array(5)].map((_,i) => <Star key={i} size={14} className={i<3?'fill-yellow-400 text-yellow-400':'text-slate-200'} />)}</div>;
            case 'EMOJI': 
                return <div className="flex gap-2"><Smile size={20} className="text-green-500" /><Meh size={20} className="text-slate-300" /><Frown size={20} className="text-slate-300" /></div>;
            case 'YESNO': 
                return <div className="flex gap-2"><div className="bg-green-500 text-white p-1 rounded-md shadow-sm"><ThumbsUp size={12}/></div><div className="bg-slate-100 text-slate-400 p-1 rounded-md"><ThumbsDown size={12}/></div></div>;
            case 'MARK': 
                return <div className="border border-slate-300 rounded px-2 py-1 text-xs font-bold w-12 text-center text-slate-700 bg-white">45</div>;
            default: return null;
        }
    };

    return (
        <div className="animate-fade-in-up">
            {isCreatingAssessment ? (
                <div className="max-w-4xl mx-auto">
                    <GlassButton variant="secondary" onClick={() => { setIsCreatingAssessment(false); setEditingId(null); }} className="mb-6 flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4"/> Back to List
                    </GlassButton>
                    
                    <GlassCard className="mb-6 border-t-4 border-t-purple-600">
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center shrink-0">
                                <ClipboardList className="w-6 h-6 text-purple-600 dark:text-purple-400"/>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{editingId ? 'Edit Assessment' : 'New Assessment'}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Configure program details</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Program Name</label>
                                    <GlassInput 
                                        placeholder="e.g. Daily Hygiene Check" 
                                        value={newAssessment.name}
                                        onChange={e => setNewAssessment({...newAssessment, name: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Evaluation Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['STAR', 'EMOJI', 'YESNO', 'MARK'].map(type => (
                                            <div 
                                                key={type}
                                                onClick={() => setNewAssessment({...newAssessment, type: type as any})}
                                                className={`cursor-pointer p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${newAssessment.type === type ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'}`}
                                            >
                                                {renderPreviewControls(type)}
                                                <span className="text-[10px] font-bold">{type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Frequency</label>
                                        <GlassSelect 
                                            value={newAssessment.frequency}
                                            onChange={e => setNewAssessment({...newAssessment, frequency: e.target.value as any})}
                                        >
                                            <option value="DAILY">Daily</option>
                                            <option value="WEEKLY">Weekly</option>
                                            <option value="BIWEEKLY">Bi-Weekly</option>
                                            <option value="MONTHLY">Monthly</option>
                                            <option value="ONETIME">One Time</option>
                                        </GlassSelect>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Assignee</label>
                                        <GlassSelect 
                                            value={newAssessment.assignee}
                                            onChange={e => setNewAssessment({...newAssessment, assignee: e.target.value as any})}
                                        >
                                            <option value="TEACHER">Teacher Only</option>
                                            <option value="PARENT">Parent Only</option>
                                            <option value="BOTH">Both</option>
                                        </GlassSelect>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Target Classes</label>
                                        <button onClick={toggleAllClasses} className="text-[10px] font-bold text-blue-600 hover:underline">
                                            {newAssessment.targetClassIds.length === classes.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-2 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                        {classes.map(cls => (
                                            <button
                                                key={cls.id}
                                                onClick={() => toggleTargetClass(cls.id)}
                                                className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${newAssessment.targetClassIds.includes(cls.id) ? 'bg-purple-600 text-white shadow-md' : 'bg-white dark:bg-slate-700 text-slate-500 border border-slate-200 dark:border-slate-600'}`}
                                            >
                                                {cls.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Assessment Criteria</label>
                                    <div className="space-y-2">
                                        {newAssessment.questions.map((q, idx) => (
                                            <div key={idx} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <div className="bg-slate-200 dark:bg-slate-700 w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-slate-500 shrink-0">{idx+1}</div>
                                                <div className="flex-1 space-y-1">
                                                    <GlassInput 
                                                        className="h-8 text-sm"
                                                        placeholder="Question / Criteria" 
                                                        value={q.text}
                                                        onChange={e => updateQuestion(idx, 'text', e.target.value)}
                                                    />
                                                    {newAssessment.assignee === 'BOTH' && (
                                                        <select 
                                                            className="text-[10px] bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-1 py-0.5 w-full"
                                                            value={q.assignee || 'TEACHER'}
                                                            onChange={e => updateQuestion(idx, 'assignee', e.target.value)}
                                                        >
                                                            <option value="TEACHER">For Teacher</option>
                                                            <option value="PARENT">For Parent</option>
                                                        </select>
                                                    )}
                                                </div>
                                                {newAssessment.type === 'MARK' && (
                                                    <GlassInput 
                                                        type="number" 
                                                        className="w-16 text-center h-8 text-sm" 
                                                        placeholder="Max" 
                                                        value={q.maxVal}
                                                        onChange={e => updateQuestion(idx, 'maxVal', parseInt(e.target.value))}
                                                    />
                                                )}
                                                <button onClick={() => removeQuestion(idx)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                        <button onClick={addQuestion} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-3 py-2 rounded">
                                            <Plus className="w-3 h-3"/> Add Criteria
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Visual Schedule</label>
                                    {newAssessment.schedules.map((s, idx) => (
                                        <div key={idx} className="flex gap-2 mb-2">
                                            <GlassInput 
                                                type="date" 
                                                value={s.startDate}
                                                onChange={e => updateSchedule(idx, 'startDate', e.target.value)}
                                            />
                                            <span className="self-center text-slate-400">to</span>
                                            <GlassInput 
                                                type="date" 
                                                value={s.endDate}
                                                onChange={e => updateSchedule(idx, 'endDate', e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                            <GlassButton variant="secondary" onClick={() => { setIsCreatingAssessment(false); setEditingId(null); }}>Cancel</GlassButton>
                            <GlassButton onClick={handlePreCreateAssessment} className="bg-purple-600 hover:bg-purple-700 w-40">
                                {editingId ? 'Update Program' : 'Review & Create'}
                            </GlassButton>
                        </div>
                    </GlassCard>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white">Assessment Programs</h3>
                            <p className="text-slate-500 text-sm">Manage behavioral and skill-based assessments.</p>
                        </div>
                        <GlassButton onClick={() => setIsCreatingAssessment(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
                            <Plus className="w-4 h-4"/> Create New
                        </GlassButton>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assessments.map(prog => {
                            const status = getProgramStatus(prog);
                            return (
                                <GlassCard key={prog.id} className="relative group border-l-4 border-l-purple-500 hover:shadow-lg transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`text-[10px] font-black px-2 py-1 rounded uppercase ${status.color}`}>
                                            {status.label}
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEdit(prog)} className="p-1.5 text-slate-400 hover:text-blue-500"><Edit className="w-4 h-4"/></button>
                                            <button onClick={() => handleDelete(prog.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{prog.name}</h4>
                                    
                                    {/* Visual Timeline/Calendar */}
                                    <div className="my-3 flex items-center gap-1 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
                                        <Calendar className="w-3 h-3 text-slate-400 shrink-0"/>
                                        {prog.schedules?.map((s, i) => {
                                            const isActive = new Date() >= new Date(s.startDate) && new Date() <= new Date(s.endDate || '2099-01-01');
                                            return (
                                                <div key={i} className={`flex-shrink-0 text-[9px] font-bold px-2 py-0.5 rounded border ${isActive ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                                                    {s.name || `Session ${i+1}`}
                                                </div>
                                            );
                                        })}
                                        {!prog.schedules?.length && <span className="text-[10px] text-slate-400">Continuous</span>}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {prog.frequency}</span>
                                        <span className="flex items-center gap-1"><Target className="w-3 h-3"/> {prog.questions.length} Criteria</span>
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <div className="flex-1 text-center border-r border-slate-100 dark:border-slate-700">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">Type</p>
                                            <p className="text-sm font-bold text-purple-600">{prog.type}</p>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">Target</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{(prog.targetClassIds?.length || 0) === classes.length ? 'All Classes' : `${prog.targetClassIds?.length} Classes`}</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            )
                        })}
                        {assessments.length === 0 && (
                            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400">
                                    <ClipboardList className="w-8 h-8"/>
                                </div>
                                <h3 className="font-bold text-slate-700 dark:text-slate-300">No Assessments Yet</h3>
                                <p className="text-slate-500 text-sm mb-6">Create programs like "Daily Hygiene", "Reading Log", or "Prayer Tracker".</p>
                                <GlassButton onClick={() => setIsCreatingAssessment(true)} variant="secondary">Create First Program</GlassButton>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showAssessmentConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <GlassCard className="max-w-md w-full">
                        <h3 className="font-bold text-lg mb-4">{editingId ? 'Update Assessment' : 'Confirm Assessment'}</h3>
                        <div className="space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-300">
                            <p><strong>Name:</strong> {newAssessment.name}</p>
                            <p><strong>Type:</strong> {newAssessment.type}</p>
                            <p><strong>Schedules:</strong> {newAssessment.sessionCount} Sessions</p>
                            <div className="max-h-32 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                {newAssessment.schedules.map((s, i) => (
                                    <p key={i} className="text-xs">{s.name || `Session ${i+1}`}: {s.startDate} to {s.endDate}</p>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <GlassButton onClick={handleConfirmAssessment} disabled={creatingAssessment} className="flex-1">
                                {creatingAssessment ? 'Saving...' : 'Confirm & Save'}
                            </GlassButton>
                            <GlassButton variant="secondary" onClick={() => setShowAssessmentConfirm(false)} className="flex-1">
                                Cancel
                            </GlassButton>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default AssessmentsTab;
