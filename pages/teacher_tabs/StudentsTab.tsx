import React, { useState, useMemo } from 'react';
import { GlassCard, GlassButton, GlassInput } from '../../components/GlassUI';
import { Student, ClassData } from '../../types';
import { UserPlus, Users, Trash2, Printer, CheckCircle2, Trash, Camera, Crown, HardDrive } from 'lucide-react';
import { formatDate } from '../../services/utils';
import { api } from '../../services/api';

interface Props {
    user: ClassData & { isPro?: boolean };
    students: Student[];
    pendingAdmissions: Student[];
    stats: { total: number; male: number; female: number };
    sortingMethod?: string;
    onRefresh: () => void;
    onDeleteStudent: (id: string, name: string) => void;
    onAdmissionAction: (id: string, action: 'APPROVE' | 'REJECT') => void;
    onCleanJunk: () => void;
}

const StudentsTab: React.FC<Props> = ({ user, students, pendingAdmissions, stats, sortingMethod, onRefresh, onDeleteStudent, onAdmissionAction, onCleanJunk }) => {
    const [showRegister, setShowRegister] = useState(false);
    const [newStudent, setNewStudent] = useState<{
        regNo: string,
        rollNo: string,
        name: string,
        dob: string,
        gender: string,
        fatherName: string,
        motherName: string,
        photoUrl: string
    }>({
        regNo: '',
        rollNo: '',
        name: '',
        dob: '',
        gender: '',
        fatherName: '',
        motherName: '',
        photoUrl: ''
    });
    const [addingStudent, setAddingStudent] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({ name: false, dob: false, gender: false });
    const [successMsg, setSuccessMsg] = useState('');
    const [formError, setFormError] = useState('');
    const [showPhotoUpload, setShowPhotoUpload] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const sortedStudents = useMemo(() => {
        const method = sortingMethod || 'BOYS_FIRST';
        if (method === 'BOYS_FIRST' || method === 'GIRLS_FIRST') {
            const males = students.filter(s => s.gender === 'Male').sort((a,b) => (a.rollNo || 9999) - (b.rollNo || 9999));
            const females = students.filter(s => s.gender !== 'Male').sort((a,b) => (a.rollNo || 9999) - (b.rollNo || 9999));
            return method === 'BOYS_FIRST' ? [...males, ...females] : [...females, ...males];
        }
        return [...students].sort((a: Student, b: Student) => {
            if (method === 'ROLL_ONLY') return (a.rollNo || 9999) - (b.rollNo || 9999);
            if (method === 'NAME_ONLY') return a.name.localeCompare(b.name);
            return 0;
        });
    }, [students, sortingMethod]);

    const handleBlur = (field: 'name' | 'dob' | 'gender') => {
        if (!newStudent[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: true }));
        } else {
            setFieldErrors(prev => ({ ...prev, [field]: false }));
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (!user.isPro) { alert("Photo upload is an Elite/Pro feature."); return; }
        setUploadingPhoto(true);
        const file = e.target.files[0];
        const res = await api.uploadImage(file, 'students');
        setUploadingPhoto(false);
        if (res.success && res.publicUrl) {
            setNewStudent(prev => ({ ...prev, photoUrl: res.publicUrl! })); 
            setShowPhotoUpload(false);
        } else alert("Upload failed: " + res.message);
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setSuccessMsg('');
        setFieldErrors({ name: false, dob: false, gender: false });
        
        let hasError = false;
        if (!newStudent.name) { setFieldErrors(p => ({...p, name: true})); hasError = true; }
        if (!newStudent.dob) { setFieldErrors(p => ({...p, dob: true})); hasError = true; }
        if (!newStudent.gender) { setFieldErrors(p => ({...p, gender: true})); hasError = true; }
        if (hasError) { setFormError("⚠️ Please fill Name, DOB & Gender!"); return; }
        
        setAddingStudent(true);
        const payload = { ...newStudent, fatherName: newStudent.fatherName || 'Not Entered', motherName: newStudent.motherName || 'Not Entered', addedBy: user.teacherName || 'Class Teacher' };
        if (!payload.photoUrl) { const seed = payload.name || 'Felix'; payload.photoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=${payload.gender === 'Female' ? 'female' : 'male'}`; }
        
        const res = await api.createStudent(user.id, payload);
        setAddingStudent(false);
        
        if (res.success) {
            setSuccessMsg(`✅ ${newStudent.name} Added!`);
            setNewStudent({ regNo: '', rollNo: '', name: '', dob: '', gender: '', fatherName: '', motherName: '', photoUrl: '' });
            onRefresh();
            setTimeout(() => setSuccessMsg(''), 2500);
        } else alert("Failed: " + (res as any).message);
    };

    return (
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="md:col-span-1 space-y-6">
                {/* CLASS HEALTH WIDGET */}
                <GlassCard className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-slate-700 dark:text-white flex items-center gap-2 text-sm mb-3">
                        <HardDrive className="w-4 h-4 text-orange-500"/> Class Health
                    </h4>
                    <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-slate-500">Verified Students</span>
                        <span className="font-bold text-green-600">{stats.total}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mb-3">
                        <span className="text-slate-500">Pending/Ghost</span>
                        <span className="font-bold text-red-500">{pendingAdmissions.length}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(stats.total / ((stats.total + pendingAdmissions.length) || 1)) * 100}%` }}></div>
                    </div>
                    <button 
                        onClick={onCleanJunk}
                        disabled={pendingAdmissions.length === 0}
                        className="w-full text-xs flex items-center justify-center gap-1 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                        <Trash className="w-3 h-3"/> Delete All Unverified
                    </button>
                </GlassCard>

                {/* Add Student Form */}
                <GlassCard className="border-t-4 border-t-blue-500 relative overflow-hidden">
                    {successMsg && (
                        <div className="absolute inset-0 z-20 bg-white/95 dark:bg-slate-900/95 flex flex-col items-center justify-center text-center animate-fade-in-up">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 animate-bounce">
                                <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400"/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{successMsg}</h3>
                        </div>
                    )}
                    
                    {formError && (
                        <div className="mb-4 bg-red-50 text-red-600 p-2 rounded text-xs text-center border border-red-100">
                            {formError}
                        </div>
                    )}
                    
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center shrink-0">
                            <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">Add Student</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Fill details to register</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="mb-4 flex gap-4 items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                            <div className="relative w-16 h-16 shrink-0 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm">
                                {newStudent.photoUrl ? <img src={newStudent.photoUrl} className="w-full h-full object-cover"/> : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${newStudent.name || 'Felix'}&gender=${newStudent.gender === 'Female' ? 'female' : 'male'}`} className="w-full h-full opacity-80"/>}
                            </div>
                            <div className="flex-1 space-y-2">
                                {!showPhotoUpload ? (
                                    <div>
                                        <GlassInput className="text-xs h-8" placeholder="Paste Image URL..." value={newStudent.photoUrl} onChange={e => setNewStudent({...newStudent, photoUrl: e.target.value})}/>
                                        {user.isPro && <button type="button" onClick={() => setShowPhotoUpload(true)} className="text-[10px] text-blue-600 font-bold underline mt-1 block">Or Upload File</button>}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <label className="cursor-pointer bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded text-[10px] font-bold text-center block">{uploadingPhoto ? 'Uploading...' : 'Choose File'}<input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto}/></label>
                                        <button type="button" onClick={() => setShowPhotoUpload(false)} className="text-[10px] text-red-500">Cancel</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div><label className="text-[10px] text-slate-500 ml-1 font-bold uppercase">FULL NAME *</label><input value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value.toUpperCase()})} onBlur={() => handleBlur('name')} className={`w-full bg-white dark:bg-slate-800 font-bold rounded-lg px-4 py-2.5 outline-none border-2 ${fieldErrors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}/></div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-[10px] text-slate-500 ml-1 font-bold uppercase">Gender *</label><select className="w-full bg-white dark:bg-slate-800 px-3 py-2.5 outline-none font-medium border-2 rounded-lg" value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value})}><option value="">Select</option><option value="Male">Boy</option><option value="Female">Girl</option></select></div>
                            <div><label className="text-[10px] text-slate-500 ml-1 font-bold uppercase">DOB *</label><input type="date" value={newStudent.dob} onChange={e => setNewStudent({...newStudent, dob: e.target.value})} className={`w-full bg-white dark:bg-slate-800 font-medium rounded-lg px-3 py-2 outline-none border-2 ${fieldErrors.dob ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}/></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <GlassInput className="text-sm font-mono" placeholder="Reg No (Auto)" value={newStudent.regNo} onChange={e => setNewStudent({...newStudent, regNo: e.target.value})}/>
                            <GlassInput type="number" className="text-sm font-mono" placeholder="Roll No" value={newStudent.rollNo} onChange={e => setNewStudent({...newStudent, rollNo: e.target.value})}/>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <GlassInput className="text-sm" placeholder="Father" value={newStudent.fatherName} onChange={e => setNewStudent({...newStudent, fatherName: e.target.value})}/>
                            <GlassInput className="text-sm" placeholder="Mother" value={newStudent.motherName} onChange={e => setNewStudent({...newStudent, motherName: e.target.value})}/>
                        </div>
                    </div>
                    <div className="mt-4"><GlassButton onClick={handleAddStudent} disabled={addingStudent} className="w-full py-3 text-sm font-bold">{addingStudent ? 'Saving...' : 'Save & Add Next'}</GlassButton></div>
                </GlassCard>
            </div>

            <div className="md:col-span-2 space-y-6">
                {/* Pending List */}
                {pendingAdmissions.length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                        <h4 className="font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2 mb-2"><UserPlus className="w-5 h-5"/> Pending ({pendingAdmissions.length})</h4>
                        <div className="space-y-2">
                            {pendingAdmissions.map(p => (
                                <div key={p.id} className="bg-white dark:bg-slate-800 p-2 rounded-lg flex justify-between items-center shadow-sm">
                                    <div className="flex items-center gap-2"><span className="font-bold text-sm">{p.name}</span><span className="text-xs text-slate-500">({p.gender}, {formatDate(p.dob)})</span></div>
                                    <div className="flex gap-2"><button onClick={() => onAdmissionAction(p.id, 'APPROVE')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Approve</button><button onClick={() => onAdmissionAction(p.id, 'REJECT')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">Reject</button></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Student Table */}
                <GlassCard className="p-0 overflow-hidden min-h-[400px]">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Users className="w-5 h-5 text-blue-500"/> Class List ({students.length})</h3>
                        <GlassButton variant="secondary" onClick={() => setShowRegister(true)} className="text-xs flex items-center gap-1"><Printer className="w-3 h-3"/> Register</GlassButton>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">
                                <tr><th className="p-3 w-10">Roll</th><th className="p-3">Name</th><th className="p-3 w-24">Reg No</th><th className="p-3 w-24">DOB</th><th className="p-3 w-20 text-center">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {sortedStudents.map(s => (
                                    <tr key={s.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="p-3 text-center text-slate-500">{s.rollNo || '-'}</td>
                                        <td className="p-3 text-slate-800 dark:text-white">
                                            <div className="flex items-center gap-2 font-bold">{s.photoUrl && <img src={s.photoUrl} className="w-6 h-6 rounded-full object-cover"/>}{s.name}{s.isPremium && <Crown className="w-3 h-3 text-yellow-500" />}</div>
                                        </td>
                                        <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{s.regNo}</td>
                                        <td className="p-3 text-slate-500 font-mono">{formatDate(s.dob)}</td>
                                        <td className="p-3 text-center"><button onClick={() => onDeleteStudent(s.id, s.name)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default StudentsTab;