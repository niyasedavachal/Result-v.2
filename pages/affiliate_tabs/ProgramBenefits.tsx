
import React from 'react';
import { GlassCard } from '../../components/GlassUI';
import { Banknote, Users, ShieldCheck } from 'lucide-react';

const ProgramBenefits: React.FC = () => {
    return (
        <div className="space-y-6">
            <GlassCard className="h-full bg-white dark:bg-slate-800">
                <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-6">Why become a Partner?</h3>
                
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                            <Banknote className="w-6 h-6 text-green-600"/>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white">High Earnings</h4>
                            <p className="text-sm text-slate-500">Earn up to ₹500 for every paid school subscription you refer.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                            <Users className="w-6 h-6 text-blue-600"/>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white">Easy for Computer Centers</h4>
                            <p className="text-sm text-slate-500">Perfect for Akshaya Centers and Freelancers who already work with schools.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-purple-600"/>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white">Instant Activation</h4>
                            <p className="text-sm text-slate-500">Register below and get your code instantly. No waiting.</p>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default ProgramBenefits;
