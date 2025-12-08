
import React, { useState, useRef, useEffect } from 'react';
import { GlassButton, GlassInput } from '../../components/GlassUI';
import { Mail, Key, Check, X, Gift, Loader2, Rocket, Eye, EyeOff, ArrowRight, ShieldCheck, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
    formData: any;
    setFormData: (data: any) => void;
    onBack: () => void;
    onRegister: () => void;
    loading: boolean;
}

const StepSecurity: React.FC<Props> = ({ formData, setFormData, onBack, onRegister, loading }) => {
    const [showPromo, setShowPromo] = useState(false);
    const [shakePass, setShakePass] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Hold Button State
    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const holdInterval = useRef<any>(null);

    // Validation Logic
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(formData.email || '');
    const passLength = formData.password?.length || 0;
    const isLengthValid = passLength >= 6;
    const isMatch = formData.password && formData.password === formData.confirmPassword;
    const isMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;
    
    // All conditions must be met to enable the hold button
    const isReady = isEmailValid && isLengthValid && isMatch;

    // Check on mount if promo exists
    useEffect(() => {
        if (formData.referralCode) setShowPromo(true);
    }, []);

    // Trigger registration when hold is complete
    useEffect(() => {
        if (holdProgress === 100 && !loading) {
            onRegister();
        }
    }, [holdProgress, loading, onRegister]);

    const startHold = () => {
        if (loading || !isReady) {
            if (!isReady) {
                setShakePass(true);
                setTimeout(() => setShakePass(false), 500);
            }
            return;
        }

        setIsHolding(true);
        if (holdInterval.current) clearInterval(holdInterval.current);
        
        holdInterval.current = setInterval(() => {
            setHoldProgress(prev => {
                if (prev >= 100) {
                    clearInterval(holdInterval.current);
                    return 100;
                }
                return prev + 2; // Fill speed
            });
        }, 16); // ~60fps
    };

    const endHold = () => {
        setIsHolding(false);
        clearInterval(holdInterval.current);
        if (holdProgress < 100) {
            setHoldProgress(0); // Snap back to 0 for slider effect
        }
    };

    // Dynamic Button Text
    const getButtonText = () => {
        if (loading) return { icon: <Loader2 className="w-5 h-5 animate-spin text-slate-400"/>, text: "INITIALIZING..." };
        if (holdProgress >= 100) return { icon: <Rocket className="w-5 h-5 text-white animate-bounce"/>, text: "SUCCESS" };
        
        if (isHolding) return { icon: null, text: "AGREEING..." };
        
        // Detailed Validation States
        if (!isEmailValid) return { icon: <Mail className="w-4 h-4"/>, text: "ENTER VALID EMAIL" };
        if (!isLengthValid) return { icon: <Key className="w-4 h-4"/>, text: "ENTER PASSWORD (6+ CHARS)" };
        if (!isMatch) return { icon: <Key className="w-4 h-4"/>, text: "CONFIRM PASSWORD" };
        
        return { icon: <ChevronRight className="w-5 h-5 animate-pulse"/>, text: "HOLD TO AGREE & REGISTER" };
    };

    const btnContent = getButtonText();

    return (
        <div className="space-y-6 animate-fade-in-up relative">
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes nudge {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(3px); }
                    75% { transform: translateX(-1px); }
                }
                .shimmer-text {
                    background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, #1e3a8a 100%);
                    background-size: 200% 100%;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    animation: shimmer 3s infinite linear;
                }
                .dark .shimmer-text {
                    background: linear-gradient(90deg, #93c5fd 0%, #ffffff 50%, #93c5fd 100%);
                    background-size: 200% 100%;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }
                .animate-nudge {
                    animation: nudge 1s infinite ease-in-out;
                }
            `}</style>

            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">Admin Access</h2>
                <p className="text-slate-500">Secure your digital campus.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2 flex items-center gap-1">
                        <Mail className="w-4 h-4"/> Admin Email
                    </label>
                    <div className="relative">
                        <GlassInput 
                            type="email"
                            placeholder="admin@school.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className={`transition-colors ${formData.email && !isEmailValid ? 'border-red-300 focus:border-red-500' : ''}`}
                        />
                        {formData.email && isEmailValid && (
                            <Check className="absolute right-3 top-3 w-5 h-5 text-green-500 animate-in fade-in zoom-in"/>
                        )}
                    </div>
                    {formData.email && !isEmailValid && (
                        <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-3 h-3"/> Invalid email format
                        </p>
                    )}
                </div>
                
                {/* PASSWORD FIELDS WITH VISUAL FEEDBACK */}
                <div className="grid grid-cols-2 gap-4">
                    <div className={`relative transition-transform duration-300 ${shakePass ? 'translate-x-[-5px] rotate-[-1deg]' : ''}`}>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2 flex items-center gap-1"><Key className="w-4 h-4"/> Password</label>
                        <GlassInput 
                            type={showPassword ? "text" : "password"}
                            placeholder="******"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            className={`pr-8 transition-colors ${isMismatch ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : (isMatch && isLengthValid) ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}`}
                        />
                        {/* Toggle Visibility */}
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        </button>
                    </div>
                    <div className={`transition-transform duration-300 ${shakePass ? 'translate-x-[5px] rotate-[1deg]' : ''}`}>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Confirm</label>
                        <div className="relative">
                            <GlassInput 
                                type={showPassword ? "text" : "password"}
                                placeholder="******"
                                value={formData.confirmPassword}
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                className={`transition-colors ${isMismatch ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-200' : (isMatch && isLengthValid) ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-900 dark:text-green-200' : ''}`}
                            />
                            {/* VISUAL ICONS */}
                            <div className="absolute right-3 top-2.5 pointer-events-none">
                                {(isMatch && isLengthValid) && <Check className="w-5 h-5 text-green-500 animate-bounce"/>}
                                {isMismatch && <X className="w-5 h-5 text-red-500 animate-pulse"/>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Requirements Visualization */}
                <div className="flex gap-4 px-1">
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${isLengthValid ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                        <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all ${isLengthValid ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-600'}`}>
                            {isLengthValid && <Check className="w-2 h-2 text-white"/>}
                        </div>
                        6+ Characters
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${isMatch && formData.confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                        <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all ${isMatch && formData.confirmPassword ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-600'}`}>
                            {(isMatch && formData.confirmPassword) && <Check className="w-2 h-2 text-white"/>}
                        </div>
                        Passwords Match
                    </div>
                </div>
                
                {/* Promo Code Logic */}
                <div className="pt-2">
                    {!showPromo ? (
                        <button 
                          onClick={() => setShowPromo(true)}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-all"
                        >
                            <Gift className="w-3 h-3"/> I have a Promo Code
                        </button>
                    ) : (
                        <div className="animate-fade-in-up">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2 flex items-center gap-1">
                                <Gift className="w-4 h-4 text-purple-500"/> Promo Code
                            </label>
                            <div className="flex gap-2">
                                <GlassInput 
                                    placeholder="Enter Code"
                                    value={formData.referralCode}
                                    onChange={e => setFormData({...formData, referralCode: e.target.value})}
                                    className="border-purple-200 focus:border-purple-500"
                                />
                                <button onClick={() => { setShowPromo(false); setFormData({...formData, referralCode: ''}); }} className="text-slate-400 hover:text-red-500">
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8">
                {/* EXECUTIVE SLIDER BUTTON */}
                <div 
                    className={`relative h-16 w-full rounded-full overflow-hidden select-none transition-all duration-300 border-2 ${isReady ? 'cursor-pointer shadow-xl shadow-blue-500/20 border-blue-100 dark:border-blue-900' : 'cursor-not-allowed opacity-80 border-slate-200 dark:border-slate-700'}`}
                    onMouseDown={startHold}
                    onMouseUp={endHold}
                    onMouseLeave={endHold}
                    onTouchStart={startHold}
                    onTouchEnd={endHold}
                >
                    {/* Track Background */}
                    <div className={`absolute inset-0 transition-colors duration-500 ${isReady ? 'bg-white dark:bg-slate-900' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
                    
                    {/* Progress Fill */}
                    <div 
                        className={`absolute top-0 left-0 h-full transition-all ease-linear ${holdProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        style={{ width: `${holdProgress}%`, transitionDuration: isHolding ? '0ms' : '300ms' }}
                    ></div>

                    {/* Text Label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 px-4">
                        <div className={`flex items-center gap-2 font-bold uppercase text-[10px] sm:text-xs tracking-widest transition-all duration-500 whitespace-nowrap ${
                            isReady 
                                ? (holdProgress > 50 ? 'text-white' : 'shimmer-text opacity-100')
                                : 'text-slate-400 dark:text-slate-500'
                        }`}>
                            {btnContent.icon} {btnContent.text}
                        </div>
                    </div>

                    {/* Slider Thumb (Handle) */}
                    {isReady && (
                        <div 
                            className="absolute top-1 left-1 bottom-1 aspect-square bg-white rounded-full shadow-md flex items-center justify-center transition-all ease-linear z-20 border border-slate-100"
                            style={{ 
                                left: `calc(${holdProgress}% + 4px)`, 
                                transform: holdProgress > 0 ? 'translateX(-100%)' : 'none',
                                transitionDuration: isHolding ? '0ms' : '300ms'
                            }}
                        >
                            {holdProgress >= 100 ? (
                                <Check className="w-6 h-6 text-emerald-600 animate-scale-in"/>
                            ) : (
                                <ArrowRight className={`w-6 h-6 text-blue-600 ${!isHolding ? 'animate-nudge' : ''}`}/>
                            )}
                        </div>
                    )}
                </div>
                
                {/* TERMS DISCLAIMER */}
                <div className="flex flex-col items-center justify-center mt-4 gap-2">
                    <p className="text-[10px] text-slate-400 text-center">
                        By holding, you agree to our <Link to="/terms" className="underline hover:text-blue-500" target="_blank">Terms of Service</Link> & <Link to="/privacy" className="underline hover:text-blue-500" target="_blank">Privacy Policy</Link>.
                    </p>
                    <button onClick={onBack} disabled={loading} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline mt-2">
                        Back to Previous Step
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StepSecurity;
