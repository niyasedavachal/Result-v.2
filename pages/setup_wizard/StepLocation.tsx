
import React from 'react';
import { GlassButton, GlassInput } from '../../components/GlassUI';
import { MapPin, Phone, ArrowRight } from 'lucide-react';

interface Props {
    place: string;
    setPlace: (val: string) => void;
    phone: string;
    setPhone: (val: string) => void;
    onNext: () => void;
    onBack: () => void;
}

const StepLocation: React.FC<Props> = ({ place, setPlace, phone, setPhone, onNext, onBack }) => {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">Where are you located?</h2>
                <p className="text-slate-500">Helping parents find you easily.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2 flex items-center gap-1"><MapPin className="w-4 h-4"/> City / Place</label>
                    <GlassInput 
                        placeholder="e.g. Malappuram"
                        value={place}
                        onChange={e => setPlace(e.target.value)}
                        autoFocus
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2 flex items-center gap-1"><Phone className="w-4 h-4"/> Phone Number</label>
                    <GlassInput 
                        type="tel"
                        placeholder="Official Contact Number"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <GlassButton variant="secondary" onClick={onBack} className="flex-1">Back</GlassButton>
                <GlassButton onClick={onNext} className="flex-[2] font-bold shadow-xl">Next <ArrowRight className="w-4 h-4 ml-2"/></GlassButton>
            </div>
        </div>
    );
};

export default StepLocation;
