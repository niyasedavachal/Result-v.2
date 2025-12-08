
import React from 'react';
import { GlassButton, GlassInput, GlassSelect } from '../../components/GlassUI';
import { Shield } from 'lucide-react';
import { Role } from '../../types';

export const RoleSelector: React.FC<{
    role: Role;
    setRole: (r: Role) => void;
    flags: any;
}> = ({ role, setRole, flags }) => (
    <div className="flex bg-blue-50 dark:bg-slate-900 p-1 rounded-lg mb-6 border border-blue-100 dark:border-slate-800">
        {flags.studentLogin && (
            <button onClick={() => setRole(Role.STUDENT)} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${role === Role.STUDENT ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Student</button>
        )}
        {flags.teacherLogin && (
            <button onClick={() => setRole(Role.TEACHER)} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${role === Role.TEACHER ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Teacher</button>
        )}
        <button onClick={() => setRole(Role.ADMIN)} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${role === Role.ADMIN ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Admin</button>
    </div>
);

export const LoginFormBody: React.FC<{
    role: Role;
    formData: any;
    setFormData: (d: any) => void;
    availableClasses: any[];
    availableStudents: any[];
    loadingResources: boolean;
    handleClassChange: (e: any) => void;
    passwordRef: any;
    handleSubmit: (e: any) => void;
    loading: boolean;
    setShowForgot: (v: boolean) => void;
    flags: any;
    fromSetup: boolean;
}> = ({ role, formData, setFormData, availableClasses, availableStudents, loadingResources, handleClassChange, passwordRef, handleSubmit, loading, setShowForgot, flags, fromSetup }) => (
    <form onSubmit={handleSubmit} className="space-y-5">
        {role === Role.TEACHER && flags.teacherLogin && (
            <div>
                <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-2">Classroom</label>
                {loadingResources && availableClasses.length === 0 ? <div className="text-xs text-slate-400">Loading classes...</div> : (
                    <GlassSelect value={formData.classId} onChange={handleClassChange} required>
                        <option value="">Select Class</option>
                        {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </GlassSelect>
                )}
            </div>
        )}

        {role === Role.STUDENT && flags.studentLogin && (
            <div className="space-y-4">
                <div>
                    <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-2">Classroom</label>
                    <GlassSelect value={formData.classId} onChange={handleClassChange} required>
                        <option value="">Select Class</option>
                        {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </GlassSelect>
                </div>
                {formData.classId && (
                    <div className="animate-fade-in-up">
                        <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-2">Student Name</label>
                        {loadingResources ? <div className="text-xs text-slate-400">Loading names...</div> : (
                            <GlassSelect value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} required>
                                <option value="">Select Name</option>
                                {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.reg_no})</option>)}
                            </GlassSelect>
                        )}
                    </div>
                )}
            </div>
        )}

        {role === Role.ADMIN && (
            <div>
                <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-2">Admin Email</label>
                <GlassInput type="email" placeholder="admin@school.com" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} />
            </div>
        )}

        {(role !== Role.STUDENT || (role === Role.STUDENT && flags.studentLogin)) && (role !== Role.TEACHER || (role === Role.TEACHER && flags.teacherLogin)) && (
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{role === Role.STUDENT ? 'Date of Birth' : 'Password'}</label>
                    {role === Role.ADMIN && !fromSetup && (
                        <button type="button" onClick={() => setShowForgot(true)} className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"><Shield className="w-3 h-3" /> Recover</button>
                    )}
                </div>
                <GlassInput 
                    ref={role === Role.ADMIN ? passwordRef : null}
                    type={role === Role.STUDENT ? "date" : "password"} 
                    placeholder={role === Role.STUDENT ? "YYYY-MM-DD" : "••••••"} 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
            </div>
        )}

        <GlassButton type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? 'Authenticating...' : 'Access Portal'}
        </GlassButton>
    </form>
);
