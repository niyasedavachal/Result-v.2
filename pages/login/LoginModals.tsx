
import React from 'react';
import { GlassCard, GlassButton, GlassInput } from '../../components/GlassUI';
import { KeyRound, Mail, X, Search, Lock, Calendar, ShieldCheck, FileText } from 'lucide-react';

export const ForgotPasswordModal: React.FC<{
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    email: string;
    setEmail: (v: string) => void;
    recoveryKey: string;
    setRecoveryKey: (v: string) => void;
    newPassword: string;
    setNewPassword: (v: string) => void;
    loading: boolean;
    message: { type: string, text: string };
    onSendLink: () => void;
}> = ({ onClose, onSubmit, email, setEmail, recoveryKey, setRecoveryKey, newPassword, setNewPassword, loading, message, onSendLink }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in-up">
        <GlassCard className="w-full max-w-md relative border-t-4 border-t-amber-500 bg-white dark:bg-slate-900">
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
                    <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400"/>
                </div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Secure Recovery</h2>
                <p className="text-xs text-zinc-500">Use your Master Recovery Key to reset.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Admin Email</label>
                    <GlassInput type="email" placeholder="admin@school.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                
                <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Master Recovery Key</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-[14px] w-4 h-4 text-zinc-400"/>
                        <GlassInput 
                            className="pl-9 font-mono tracking-widest text-center" 
                            placeholder="REC-XXXX-XXXX" 
                            value={recoveryKey} 
                            onChange={(e) => setRecoveryKey(e.target.value.toUpperCase())} 
                            required 
                        />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1.5 flex items-start gap-1">
                        <FileText className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>Find this code on the <b>Recovery Kit (PDF)</b> downloaded during setup.</span>
                    </p>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">New Password</label>
                    <GlassInput type="password" placeholder="Min 6 Chars" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                </div>

                {message.text && (
                    <div className={`p-2 rounded text-xs text-center font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
                
                <GlassButton type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20">
                    {loading ? 'Verifying...' : 'Reset & Login'}
                </GlassButton>
            </form>
            
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-400 mb-2">Don't have the key?</p>
                <button type="button" onClick={onSendLink} className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-center gap-1 w-full">
                    <Mail className="w-3 h-3"/> Send Reset Link to Email
                </button>
            </div>
        </GlassCard>
    </div>
);

export const TrackApplicationModal: React.FC<{
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    phone: string;
    setPhone: (v: string) => void;
    method: 'PASSWORD' | 'DOB';
    setMethod: (v: 'PASSWORD' | 'DOB') => void;
    credential: string;
    setCredential: (v: string) => void;
    loading: boolean;
    result: any;
    onReset: () => void;
    onLogin: (match: any) => void;
}> = ({ onClose, onSubmit, phone, setPhone, method, setMethod, credential, setCredential, loading, result, onReset, onLogin }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in-up">
        <GlassCard className="w-full max-w-md relative flex flex-col max-h-[80vh] border-t-4 border-t-green-600">
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 font-bold"><X className="w-5 h-5"/></button>
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-green-600 dark:text-green-400"/>
                </div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Track Admission</h2>
            </div>

            <div className="overflow-y-auto flex-1 p-1">
                {!result ? (
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Phone Number</label>
                            <GlassInput type="tel" placeholder="Registered Mobile" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Verify Using</label>
                            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg mb-3">
                                <button type="button" onClick={() => { setMethod('PASSWORD'); setCredential(''); }} className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${method === 'PASSWORD' ? 'bg-white dark:bg-zinc-800 shadow text-slate-900 dark:text-white' : 'text-zinc-500'}`}>Password</button>
                                <button type="button" onClick={() => { setMethod('DOB'); setCredential(''); }} className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${method === 'DOB' ? 'bg-white dark:bg-zinc-800 shadow text-slate-900 dark:text-white' : 'text-zinc-500'}`}>Date of Birth</button>
                            </div>
                            {method === 'PASSWORD' ? (
                                <div className="relative"><Lock className="absolute left-3 top-[14px] w-4 h-4 text-zinc-400"/><GlassInput className="pl-9" type="password" placeholder="Enter Password" value={credential} onChange={(e) => setCredential(e.target.value)} required /></div>
                            ) : (
                                <div className="relative"><Calendar className="absolute left-3 top-[14px] w-4 h-4 text-zinc-400"/><GlassInput className="pl-9" type="date" value={credential} onChange={(e) => setCredential(e.target.value)} required /></div>
                            )}
                        </div>
                        <GlassButton type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">{loading ? 'Checking...' : 'Check Status'}</GlassButton>
                    </form>
                ) : (
                    <div className="space-y-4">
                        {result.found && result.matches ? (
                            <>
                                <p className="text-xs text-center text-zinc-500 mb-2">Found {result.matches.length} matches:</p>
                                {result.matches.map((match: any, idx: number) => (
                                    <div key={idx} className={`p-4 rounded-lg border ${match.status === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                                        <h3 className={`text-sm font-black ${match.status === 'APPROVED' ? 'text-green-800' : 'text-orange-800'}`}>{match.status === 'APPROVED' ? 'APPROVED' : 'UNDER REVIEW'}</h3>
                                        <p className="text-sm font-bold mt-1 text-slate-800">{match.student.name}</p>
                                        <p className="text-xs text-zinc-500">{match.student.className}</p>
                                        {match.status === 'APPROVED' ? (
                                            <button onClick={() => onLogin(match)} className="mt-3 bg-green-600 text-white px-4 py-2 rounded text-xs font-bold w-full hover:bg-green-700">Login Now</button>
                                        ) : <p className="text-[10px] text-zinc-500 mt-2">Waiting for teacher approval.</p>}
                                    </div>
                                ))}
                                <button onClick={onReset} className="text-xs text-zinc-500 underline w-full text-center mt-2">Search Again</button>
                            </>
                        ) : (
                            <div className="p-4 bg-zinc-50 rounded-lg text-center border border-zinc-200">
                                <p className="text-red-600 font-bold text-sm">Not Found</p>
                                <p className="text-xs text-zinc-500 mt-1">{result.message}</p>
                                <button onClick={onReset} className="text-xs text-blue-600 underline mt-2">Try Again</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </GlassCard>
    </div>
);
