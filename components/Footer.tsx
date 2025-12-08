
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Heart, UserPlus, Mail } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">
                        ResultMate
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                        The easiest way for schools, madrassas, and tuitions to publish results online.
                    </p>
                    <div className="mt-4 text-xs text-slate-400">
                        <p className="font-bold text-slate-500 uppercase mb-1">Contact & Legal</p>
                        <p>NIYAS VALAPPIL</p>
                        <a href="mailto:niyasedavachal@gmail.com" className="hover:text-blue-600 flex items-center gap-1 justify-center md:justify-start mt-1">
                            <Mail className="w-3 h-3"/> niyasedavachal@gmail.com
                        </a>
                    </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
                     <Link to="/partner" className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                         <UserPlus className="w-4 h-4"/> Affiliate Program
                     </Link>
                     <Link to="/privacy" className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                         <ShieldCheck className="w-4 h-4"/> Privacy Policy
                     </Link>
                     <Link to="/terms" className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                         <FileText className="w-4 h-4"/> Terms of Service
                     </Link>
                </div>

                <div className="text-center md:text-right text-xs text-slate-400">
                    <p className="flex items-center justify-center md:justify-end gap-1 mb-1">
                        Made with <Heart className="w-3 h-3 text-red-500 fill-red-500"/> in India
                    </p>
                    <p>&copy; {new Date().getFullYear()} ResultMate.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;