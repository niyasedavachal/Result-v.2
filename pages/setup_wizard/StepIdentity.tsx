
import React from 'react';
import { GlassButton, GlassInput } from '../../components/GlassUI';
import { School, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

interface Props {
    orgType: 'SCHOOL' | 'MADRASSA' | 'TUITION';
    setOrgType: (type: 'SCHOOL' | 'MADRASSA' | 'TUITION') => void;
    schoolName: string;
    setSchoolName: (name: string) => void;
    onNext: () => void;
}

const StepIdentity: React.FC<Props> = ({ orgType, setOrgType, schoolName, setSchoolName, onNext }) => {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">Let's build your Campus</h2>
                <p className="text-slate-500">What kind of institution is this?</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
                <button 
                    onClick={() => setOrgType('SCHOOL')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${orgType === 'SCHOOL' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}
                >
                    <School className="w-8 h-8"/>
                    <span className="text-xs font-bold">School</span>
                </button>
                <button 
                    onClick={() => setOrgType('MADRASSA')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${orgType === 'MADRASSA' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}
                >
                    <BookOpen className="w-8 h-8"/>
                    <span className="text-xs font-bold">Madrassa</span>
                </button>
                <button 
                    onClick={() => setOrgType('TUITION')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${orgType === 'TUITION' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}
                >
                    <GraduationCap className="w-8 h-8"/>
                    <span className="text-xs font-bold">Tuition</span>
                </button>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Name of your {orgType.toLowerCase()}</label>
                <GlassInput 
                    className="text-lg font-bold"
                    placeholder={`e.g. ${orgType === 'MADRASSA' ? 'Hidayathul Islam' : 'Oxford Public School'}`}
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    autoFocus
                />
            </div>

            <GlassButton onClick={onNext} className="w-full py-4 text-lg font-bold shadow-xl">
                Next Step <ArrowRight className="w-5 h-5 ml-2"/>
            </GlassButton>
        </div>
    );
};

export default StepIdentity;
