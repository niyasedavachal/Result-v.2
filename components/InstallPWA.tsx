

import React, { useEffect, useState } from 'react';
import { Download, X, Share, Smartphone } from 'lucide-react';

const InstallPWA: React.FC = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);
    const [isAppInstalled, setIsAppInstalled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    
    // Custom Branding State
    const [schoolName, setSchoolName] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        // Check local storage for branding context
        const name = localStorage.getItem('school_name');
        const logo = localStorage.getItem('school_logo');
        if (name) setSchoolName(name);
        if (logo) setLogoUrl(logo);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
            setIsAppInstalled(true);
            return;
        }

        const handler = (e: any) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };
        
        window.addEventListener('beforeinstallprompt', handler);

        // Detect iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS) {
            setSupportsPWA(true);
            setShowIOSPrompt(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const onClick = (evt: React.MouseEvent) => {
        evt.preventDefault();
        if (!promptInstall) {
            if (showIOSPrompt) {
                alert("To install on iOS:\n1. Tap the 'Share' icon below ⬇️\n2. Select 'Add to Home Screen' ⊞");
            }
            return;
        }
        promptInstall.prompt();
    };

    if (!supportsPWA || isAppInstalled || !isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-[100] animate-fade-in-up">
            <div className="bg-slate-900/95 dark:bg-white/95 backdrop-blur text-white dark:text-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-200 flex items-center justify-between gap-4 max-w-sm ml-auto">
                <div className="flex items-center gap-3">
                    {logoUrl ? (
                        <img src={logoUrl} className="w-10 h-10 rounded-xl bg-white p-0.5 object-contain" alt="Logo"/>
                    ) : (
                        <div className="bg-blue-600 p-2.5 rounded-xl shrink-0">
                            <Smartphone className="w-5 h-5 text-white" />
                        </div>
                    )}
                    <div>
                        <p className="font-bold text-sm leading-tight">{schoolName ? `Install ${schoolName}` : 'Install App'}</p>
                        <p className="text-[10px] opacity-80">Faster access on mobile</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onClick}
                        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                    >
                        Install
                    </button>
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="p-1.5 hover:bg-white/10 dark:hover:bg-slate-900/10 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 opacity-60"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPWA;