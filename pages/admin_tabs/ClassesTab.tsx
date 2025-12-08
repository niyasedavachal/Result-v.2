

import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from '../../components/GlassUI';
import { api } from '../../services/api';
import { ClassData } from '../../types';
import { CheckCircle2, User, Users, Lock, Link as LinkIcon, Trash2, Sparkles, School, PlusCircle, MessageCircle, Copy, X } from 'lucide-react';

interface Props {
    classes: ClassData[];
    onRefresh: () => void;
    onShowShare: (data: any) => void;
}

const ClassesTab: React.FC<Props> = ({ classes, onRefresh, onShowShare }) => {
    const [classGrade, setClassGrade] = useState('');
    const [classDivision, setClassDivision] = useState('');
    const [classTeacherName, setClassTeacherName] = useState('');
    const [classPassword, setClassPassword] = useState('');
    const [creatingClass, setCreatingClass] = useState(false);
    
    // New Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdClassData, setCreatedClassData] = useState<any>(null);

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!classGrade) {
            alert("Please enter Class/Course Name.");
            return;
        }
        
        const div = classDivision ? classDivision.trim() : '';
        const generatedName = div ? `${classGrade} ${div}` : classGrade;
        
        if (classes.some(c => c.name === generatedName)) {
            alert(`Class "${generatedName}" already exists!`);
            return;
        }
        
        let finalPassword = classPassword;
        if (!finalPassword) {
            finalPassword = Math.random().toString(36).slice(-6); 
        }

        setCreatingClass(true);
        const defaultSubjects = [
            { name: 'Subject 1', maxMarks: 50, passMarks: 18 },
            { name: 'Subject 2', maxMarks: 50, passMarks: 18 },
            { name: 'Subject 3', maxMarks: 50, passMarks: 18 }
        ];
        
        const res = await api.createClass(generatedName, finalPassword, classTeacherName, defaultSubjects);
        setCreatingClass(false);
        
        if (res.success) {
            const link = `${window.location.origin}${window.location.pathname}#/login?invite=${res.id}`;
            const successPayload = {
                className: generatedName,
                teacher: classTeacherName || 'Class Teacher',
                password: finalPassword,
                link: link
            };
            
            // Set data for modal and show it
            setCreatedClassData(successPayload);
            setShowSuccessModal(true);

            // Reset Form
            setClassGrade('');
            setClassDivision('');
            setClassTeacherName('');
            setClassPassword('');
            onRefresh();
        } else {
            const msg = (res as any).message;
            alert("Failed: " + (typeof msg === 'string' ? msg : JSON.stringify(msg)));
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (!window.confirm("Delete this class? All students and marks will be lost.")) return;
        const res = await api.deleteClass(id);
        if (res.success) onRefresh();
        else alert("Could not delete class.");
    };

    const copyInviteLink = (classId: string) => {
        const link = `${window.location.origin}${window.location.pathname}#/login?invite=${classId}`;
        navigator.clipboard.writeText(link);
        alert("Invite Link Copied!");
    };
    
    const shareViaWhatsApp = (data: any) => {
        const text = `*Class Setup Invitation*\n\nHello ${data.teacher},\n\nYou have been invited to manage *${data.className}* on SchoolResult Pro.\n\n👇 *Click to Setup:*\n${data.link}\n\n🔑 *Access Password:* ${data.password}\n\nPlease add students and enter marks.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <>
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="md:col-span-1">
                <GlassCard className="border-t-4 border-t-blue-500 sticky top-24">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center shrink-0">
                            <School className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">New Class</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Add a batch & assign teacher</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateClass} className="space-y-5">
                        <div className="grid grid-cols-5 gap-2">
                            <div className="col-span-3">
                                <label className="text-xs font-bold text-slate-500 block mb-1 uppercase">Class / Course</label>
                                <GlassInput 
                                    placeholder="e.g. 10 / BCA"
                                    value={classGrade}
                                    onChange={e => setClassGrade(e.target.value)}
                                    required
                                    list="grade-suggestions"
                                    className="font-bold"
                                />
                                <datalist id="grade-suggestions">
                                    {['Pre-KG', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 
                                      '+1 Science', '+1 Commerce', '+1 Humanities', '+2 Science', '+2 Commerce', 
                                      'BSc', 'BCom', 'BA', 'BCA', 'BBA', 'MSc', 'MCom', 'MA', 'MBA', 
                                      'Hifz', 'Madrasa 1', 'Madrasa 5', 'Madrasa 7', 'Madrasa 10',
                                      'NEET Batch', 'JEE Batch', 'KEAM', 'CA Foundation', 'IELTS', 'OET', 'PSC Coaching'
                                    ].map(g => (
                                        <option key={g} value={g}/>
                                    ))}
                                </datalist>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500 block mb-1 uppercase">Batch</label>
                                <GlassInput 
                                    placeholder="A"
                                    value={classDivision}
                                    className="text-center font-bold"
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val.length === 1) setClassDivision(val.toUpperCase());
                                        else setClassDivision(val);
                                    }}
                                />
                            </div>
                        </div>

                        {classGrade && (
                            <div className={`text-center text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 ${classes.some(c => c.name === (classDivision ? `${classGrade} ${classDivision}` : classGrade)) ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                <Sparkles className="w-3 h-3"/>
                                Preview: {classGrade} {classDivision}
                                {classes.some(c => c.name === (classDivision ? `${classGrade} ${classDivision}` : classGrade)) && <span className="block text-[10px] bg-red-200 px-1 rounded ml-1">Exists</span>}
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">Teacher Name (Optional)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400"/>
                                <GlassInput 
                                    className="pl-9"
                                    placeholder="e.g. Mrs. Smith" 
                                    value={classTeacherName}
                                    onChange={e => setClassTeacherName(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">Access Password</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400"/>
                                    <GlassInput 
                                        className="pl-9"
                                        placeholder="Set Password" 
                                        value={classPassword}
                                        onChange={e => setClassPassword(e.target.value)}
                                    />
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setClassPassword(Math.random().toString(36).slice(-6))}
                                    className="bg-purple-50 dark:bg-purple-900/20 px-3 rounded-lg text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-600 border border-purple-200 dark:border-purple-800"
                                    title="Generate Random"
                                >
                                    <Sparkles className="w-4 h-4"/>
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500"/> Leave blank to use Invite Link later.
                            </p>
                        </div>

                        <GlassButton type="submit" disabled={creatingClass} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                            {creatingClass ? 'Creating...' : <><PlusCircle className="w-4 h-4"/> Create Class</>}
                        </GlassButton>
                    </form>
                </GlassCard>
            </div>
            
            <div className="md:col-span-2 space-y-4">
                {classes.map(cls => (
                    <div key={cls.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center font-black text-slate-500 dark:text-slate-400 text-sm">
                                {cls.name.substring(0,2)}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                    {cls.name}
                                    {cls.submissionStatus === 'SUBMITTED' && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Submitted</span>}
                                </h4>
                                
                                {/* DETAILED COUNTS */}
                                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2 items-center">
                                    <span className="flex items-center gap-1 font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                        <Users className="w-3 h-3"/> {cls.studentCount || 0} Total
                                    </span>
                                    {/* Gender Breakdown */}
                                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                                        <User className="w-3 h-3"/> {cls.boysCount || 0} Boys
                                    </span>
                                    <span className="flex items-center gap-1 text-pink-600 dark:text-pink-400 font-medium bg-pink-50 dark:bg-pink-900/20 px-2 py-0.5 rounded">
                                        <User className="w-3 h-3"/> {cls.girlsCount || 0} Girls
                                    </span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-2">
                                    <span>Teacher: {cls.teacherName || 'Not Assigned'}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span className="font-mono">Pass: {cls.password || '****'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button 
                                onClick={() => copyInviteLink(cls.id)}
                                className="flex-1 sm:flex-none px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-2"
                                title="Share Login Link"
                            >
                                <LinkIcon className="w-3 h-3"/> Share Access
                            </button>
                            <button onClick={() => handleDeleteClass(cls.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                ))}
                {classes.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                            <School className="w-8 h-8 text-blue-500"/>
                        </div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-300">No classes yet</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                            Create your first class from the form on the left to start adding students.
                        </p>
                    </div>
                )}
            </div>
        </div>

        {/* SUCCESS POPUP MODAL */}
        {showSuccessModal && createdClassData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in-up">
                <GlassCard className="w-full max-w-md bg-white dark:bg-slate-900 text-center relative border-t-4 border-t-green-500">
                    <button onClick={() => setShowSuccessModal(false)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                    
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400 animate-bounce"/>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Class Created!</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                        <span className="font-bold text-slate-800 dark:text-white">{createdClassData.className}</span> is ready. Share details with the teacher.
                    </p>

                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 text-left">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">Class Password</span>
                            <span className="font-mono font-black text-lg text-blue-600 dark:text-blue-400">{createdClassData.password}</span>
                        </div>
                        <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
                        <p className="text-xs text-slate-400 mb-1">Invite Link:</p>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 font-mono break-all">
                            {createdClassData.link}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => shareViaWhatsApp(createdClassData)}
                            className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                        >
                            <MessageCircle className="w-5 h-5"/> WhatsApp
                        </button>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    `Class: ${createdClassData.className}\nLink: ${createdClassData.link}\nPassword: ${createdClassData.password}`
                                );
                                alert("Copied details!");
                            }}
                            className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200"
                        >
                            <Copy className="w-5 h-5"/> Copy All
                        </button>
                    </div>
                </GlassCard>
            </div>
        )}
        </>
    );
};

export default ClassesTab;