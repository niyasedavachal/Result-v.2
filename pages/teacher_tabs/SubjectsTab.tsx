import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from '../../components/GlassUI';
import { SubjectConfig } from '../../types';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

interface Props {
    subjects: SubjectConfig[];
    onAddSubject: (name: string, max: number, pass: number) => Promise<boolean>;
    onDeleteSubject: (idx: number) => Promise<void>;
    canEdit: boolean;
}

const SubjectsTab: React.FC<Props> = ({ subjects, onAddSubject, onDeleteSubject, canEdit }) => {
    const [newSubject, setNewSubject] = useState({ name: '', max: '50', pass: '18' });
    const [adding, setAdding] = useState(false);

    const handleAdd = async () => {
        if (!newSubject.name) return;
        setAdding(true);
        const max = parseInt(newSubject.max) || 50;
        const pass = parseInt(newSubject.pass) || 18;
        const success = await onAddSubject(newSubject.name, max, pass);
        setAdding(false);
        if (success) {
            setNewSubject({ name: '', max: '50', pass: '18' });
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in-up">
            <GlassCard>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                        <BookOpen className="w-6 h-6"/>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Manage Subjects</h3>
                        <p className="text-xs text-slate-500">Add or remove subjects for this class.</p>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-3 mb-8">
                    {subjects.map((sub, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{sub.name}</p>
                                <p className="text-xs text-slate-500">Max: {sub.maxMarks} | Pass: {sub.passMarks}</p>
                            </div>
                            {canEdit && (
                                <button onClick={() => onDeleteSubject(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            )}
                        </div>
                    ))}
                    {subjects.length === 0 && <p className="text-center text-slate-400 text-sm">No subjects added.</p>}
                </div>

                {/* Add Form */}
                {canEdit ? (
                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl">
                        <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3 uppercase">Add New Subject</h4>
                        <div className="flex gap-2 mb-3">
                            <GlassInput 
                                placeholder="Subject Name (e.g. Maths)" 
                                value={newSubject.name}
                                onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                                className="flex-[2]"
                            />
                            <div className="flex-1">
                                <GlassInput 
                                    type="number" 
                                    placeholder="Max" 
                                    value={newSubject.max}
                                    onChange={e => setNewSubject({...newSubject, max: e.target.value})}
                                />
                            </div>
                            <div className="flex-1">
                                <GlassInput 
                                    type="number" 
                                    placeholder="Pass" 
                                    value={newSubject.pass}
                                    onChange={e => setNewSubject({...newSubject, pass: e.target.value})}
                                />
                            </div>
                        </div>
                        <GlassButton onClick={handleAdd} disabled={adding} className="w-full flex justify-center items-center gap-2">
                            {adding ? 'Adding...' : <><Plus className="w-4 h-4"/> Add Subject</>}
                        </GlassButton>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-yellow-50 text-yellow-700 text-sm rounded-lg border border-yellow-200">
                        Subject editing is disabled by Admin.
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default SubjectsTab;