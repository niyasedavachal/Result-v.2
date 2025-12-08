
import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from '../../components/GlassUI';
import { api } from '../../services/api';
import { SchoolConfig } from '../../types';
import { Settings, Loader2, Sparkles, Upload, Link as LinkIcon, Image as ImageIcon, Share2, Layout, CheckCircle, HardDrive, Trash2, UserX, MessageSquare, FileCheck, History, AlertCircle, ShieldAlert, KeyRound, Send, Download, Save, UserPlus } from 'lucide-react';

interface Props {
    schoolConfig: SchoolConfig;
    onUpdate: (config: SchoolConfig) => void;
}

const SettingsTab: React.FC<Props> = ({ schoolConfig, onUpdate }) => {
    const [localConfig, setLocalConfig] = useState<SchoolConfig>(schoolConfig);
    const [fetchingPincode, setFetchingPincode] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [showLogoUpload, setShowLogoUpload] = useState(false);
    const [showCoverUpload, setShowCoverUpload] = useState(false);
    
    // Ownership Transfer State
    const [transferMode, setTransferMode] = useState(false);
    const [newOwnerInfo, setNewOwnerInfo] = useState('');
    
    // Backup State
    const [restoring, setRestoring] = useState(false);
    
    // Detailed Health Stats
    const [healthStats, setHealthStats] = useState({ ghosts: 0, oldPosts: 0, staleRequests: 0, oldLogs: 0 });
    const [cleaning, setCleaning] = useState<string | null>(null);

    useEffect(() => {
        loadHealth();
    }, []);

    const loadHealth = async () => {
        const stats = await api.getSchoolDetailedHealthStats();
        setHealthStats(stats);
    };

    const handleUpdateConfig = async () => {
        const res = await api.updateSchoolSettings(localConfig);
        if (res.success) { onUpdate(localConfig); alert('Settings Saved'); } 
        else alert("Failed to update settings.");
    };

    const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const pin = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setLocalConfig({ ...localConfig, pincode: pin });
        if (pin.length === 6) {
            setFetchingPincode(true);
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                const data = await response.json();
                if (data && data[0] && data[0].Status === 'Success') {
                    const details = data[0].PostOffice[0];
                    setLocalConfig(prev => ({ ...prev, pincode: pin, district: details.District, state: details.State }));
                }
            } catch (err) { console.error(err); }
            setFetchingPincode(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploadingLogo(true);
        const res = await api.uploadImage(e.target.files[0], 'logos');
        setUploadingLogo(false);
        if (res.success && res.publicUrl) {
            setLocalConfig(prev => ({ ...prev, logoUrl: res.publicUrl! }));
            setShowLogoUpload(false);
        } else alert("Upload failed: " + res.message);
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploadingCover(true);
        const res = await api.uploadImage(e.target.files[0], 'logos');
        setUploadingCover(false);
        if (res.success && res.publicUrl) {
            setLocalConfig(prev => ({ ...prev, coverPhoto: res.publicUrl! }));
            setShowCoverUpload(false);
        } else alert("Upload failed: " + res.message);
    };
    
    const handleCleanItem = async (type: 'GHOSTS' | 'OLD_POSTS' | 'STALE_REQUESTS' | 'OLD_LOGS') => {
        if (!window.confirm("Are you sure? This action cannot be undone.")) return;
        setCleaning(type);
        const res = await api.cleanSpecificJunk(type);
        setCleaning(null);
        if (res.success) {
            loadHealth();
        } else {
            alert("Cleanup Failed: " + res.message);
        }
    };

    const handleRequestTransfer = () => {
        if (!newOwnerInfo) return alert("Please enter new owner details");
        api.sendOwnershipRequest(
            schoolConfig.adminEmail || 'Current Admin',
            schoolConfig.schoolName,
            newOwnerInfo
        );
        setTransferMode(false);
    };

    // BACKUP & RESTORE
    const handleBackup = () => {
        api.exportSchoolData();
    };

    const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (!window.confirm("WARNING: This will OVERWRITE existing data. Are you sure you want to restore from this backup?")) {
            e.target.value = '';
            return;
        }

        setRestoring(true);
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const json = JSON.parse(ev.target?.result as string);
                const res = await api.restoreSchoolData(json);
                setRestoring(false);
                if (res.success) {
                    alert("Restore Successful! Please refresh the page.");
                    window.location.reload();
                } else {
                    alert("Restore Failed: " + res.message);
                }
            } catch (err) {
                setRestoring(false);
                alert("Invalid Backup File");
            }
        };
        reader.readAsText(file);
    };

    const updateAdmissionConfig = (key: 'askPhoto' | 'askBloodGroup', val: boolean) => {
        setLocalConfig(prev => ({
            ...prev,
            admissionConfig: { ...prev.admissionConfig, [key]: val } as any
        }));
    };

    return (
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
            <div className="space-y-6">
                <GlassCard>
                    <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                        <Settings className="w-5 h-5"/> General Settings
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">School Name</label>
                            <GlassInput value={localConfig.schoolName} onChange={e => setLocalConfig({...localConfig, schoolName: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Description</label>
                            <textarea className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Tell us about your campus..." value={localConfig.description || ''} onChange={e => setLocalConfig({...localConfig, description: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Exam Name</label><GlassInput placeholder="Term 1" value={localConfig.examName || ''} onChange={e => setLocalConfig({...localConfig, examName: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Academic Year</label><GlassInput placeholder="2024-25" value={localConfig.academicYear || ''} onChange={e => setLocalConfig({...localConfig, academicYear: e.target.value})} /></div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Result Type</label>
                            <GlassSelect value={localConfig.resultDisplayType} onChange={e => setLocalConfig({...localConfig, resultDisplayType: e.target.value as any})}><option value="PASS_FAIL">Pass / Fail Only</option><option value="GRADE_ONLY">Grade Only</option><option value="CLASS_DISTINCTION">Distinction / First Class</option><option value="PERCENTAGE">Percentage</option></GlassSelect>
                        </div>
                        {/* Pincode & Place */}
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Pincode</label><div className="relative"><GlassInput placeholder="686673" value={localConfig.pincode || ''} onChange={handlePincodeChange} maxLength={6} />{fetchingPincode && <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-blue-500"/>}</div></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Place</label><GlassInput value={localConfig.place || ''} onChange={e => setLocalConfig({...localConfig, place: e.target.value})} /></div>
                        </div>
                        
                        {/* Logo Upload */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">School Logo</label>
                            {!showLogoUpload ? (
                                <div className="flex gap-2"><div className="relative flex-1"><LinkIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><GlassInput className="pl-9" placeholder="Paste Image URL" value={localConfig.logoUrl || ''} onChange={e => setLocalConfig({...localConfig, logoUrl: e.target.value})} /></div><button onClick={() => setShowLogoUpload(true)} className="text-[10px] font-bold text-blue-600 underline whitespace-nowrap px-2">No Link? Upload</button></div>
                            ) : (
                                <div className="flex gap-2 items-center"><label className={`flex-1 bg-slate-200 dark:bg-slate-700 px-4 py-2.5 rounded-lg flex items-center justify-center cursor-pointer ${uploadingLogo?'opacity-50':''}`}>{uploadingLogo?<Loader2 className="w-4 h-4 animate-spin mr-2"/>:<Upload className="w-4 h-4 mr-2"/>}<span className="text-sm">Choose File</span><input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo}/></label><button onClick={() => setShowLogoUpload(false)} className="text-xs text-slate-500">Cancel</button></div>
                            )}
                            <p className="text-[10px] text-slate-400 mt-1">Recommended: Square (1:1), 500x500px, &lt; 200KB</p>
                        </div>

                        {/* Cover Upload */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Cover Photo</label>
                            {!showCoverUpload ? (
                                <div className="flex gap-2"><div className="relative flex-1"><ImageIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><GlassInput className="pl-9" placeholder="Paste Image URL" value={localConfig.coverPhoto || ''} onChange={e => setLocalConfig({...localConfig, coverPhoto: e.target.value})} /></div><button onClick={() => setShowCoverUpload(true)} className="text-[10px] font-bold text-blue-600 underline whitespace-nowrap px-2">No Link? Upload</button></div>
                            ) : (
                                <div className="flex gap-2 items-center"><label className={`flex-1 bg-slate-200 dark:bg-slate-700 px-4 py-2.5 rounded-lg flex items-center justify-center cursor-pointer ${uploadingCover?'opacity-50':''}`}>{uploadingCover?<Loader2 className="w-4 h-4 animate-spin mr-2"/>:<Upload className="w-4 h-4 mr-2"/>}<span className="text-sm">Choose File</span><input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover}/></label><button onClick={() => setShowCoverUpload(false)} className="text-xs text-slate-500">Cancel</button></div>
                            )}
                            <p className="text-[10px] text-slate-400 mt-1">Recommended: Landscape (16:9), 1280x720px, &lt; 500KB</p>
                        </div>

                        <GlassButton onClick={handleUpdateConfig} className="w-full">Save Changes</GlassButton>
                    </div>
                </GlassCard>
                
                {/* MAINTENANCE CONSOLE */}
                <GlassCard className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-sm mb-4 text-slate-700 dark:text-white uppercase flex items-center gap-2">
                        <HardDrive className="w-4 h-4"/> Maintenance Console
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {/* Card 1: Ghost Students */}
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-32 relative group">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-lg text-orange-600 dark:text-orange-400"><UserX className="w-4 h-4"/></div>
                                    <span className="text-xl font-black text-slate-800 dark:text-white">{healthStats.ghosts}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-tight">Ghost Admissions</p>
                                <p className="text-[9px] text-slate-400">Unverified</p>
                            </div>
                            <button 
                                onClick={() => handleCleanItem('GHOSTS')}
                                disabled={healthStats.ghosts === 0 || cleaning === 'GHOSTS'}
                                className="w-full py-1.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-1"
                            >
                                {cleaning === 'GHOSTS' ? <Loader2 className="w-3 h-3 animate-spin"/> : <Trash2 className="w-3 h-3"/>} Clear
                            </button>
                        </div>

                        {/* Card 2: Old Buzz */}
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-32 relative">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg text-blue-600 dark:text-blue-400"><MessageSquare className="w-4 h-4"/></div>
                                    <span className="text-xl font-black text-slate-800 dark:text-white">{healthStats.oldPosts}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-tight">Old Posts</p>
                                <p className="text-[9px] text-slate-400">&gt; 60 Days</p>
                            </div>
                            <button 
                                onClick={() => handleCleanItem('OLD_POSTS')}
                                disabled={healthStats.oldPosts === 0 || cleaning === 'OLD_POSTS'}
                                className="w-full py-1.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-1"
                            >
                                {cleaning === 'OLD_POSTS' ? <Loader2 className="w-3 h-3 animate-spin"/> : <Trash2 className="w-3 h-3"/>} Clear
                            </button>
                        </div>

                        {/* Card 3: Stale Requests */}
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-32 relative">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg text-purple-600 dark:text-purple-400"><FileCheck className="w-4 h-4"/></div>
                                    <span className="text-xl font-black text-slate-800 dark:text-white">{healthStats.staleRequests}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-tight">Stale Requests</p>
                                <p className="text-[9px] text-slate-400">Resolved</p>
                            </div>
                            <button 
                                onClick={() => handleCleanItem('STALE_REQUESTS')}
                                disabled={healthStats.staleRequests === 0 || cleaning === 'STALE_REQUESTS'}
                                className="w-full py-1.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-1"
                            >
                                {cleaning === 'STALE_REQUESTS' ? <Loader2 className="w-3 h-3 animate-spin"/> : <Trash2 className="w-3 h-3"/>} Clear
                            </button>
                        </div>

                        {/* Card 4: Old Logs */}
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-32 relative">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded-lg text-slate-500 dark:text-slate-400"><History className="w-4 h-4"/></div>
                                    <span className="text-xl font-black text-slate-800 dark:text-white">{healthStats.oldLogs}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-tight">Old Logs</p>
                                <p className="text-[9px] text-slate-400">&gt; 1 Year</p>
                            </div>
                            <button 
                                onClick={() => handleCleanItem('OLD_LOGS')}
                                disabled={healthStats.oldLogs === 0 || cleaning === 'OLD_LOGS'}
                                className="w-full py-1.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-1"
                            >
                                {cleaning === 'OLD_LOGS' ? <Loader2 className="w-3 h-3 animate-spin"/> : <Trash2 className="w-3 h-3"/>} Clear
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5"/>
                        <p className="text-[10px] text-yellow-800 dark:text-yellow-200">
                            Regular cleanup keeps your portal fast. "Clear" actions permanently delete data.
                        </p>
                    </div>
                </GlassCard>
            </div>

            <div className="space-y-6">
                
                {/* ADMISSION FORM CONFIGURATION */}
                <GlassCard className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-sm mb-4 text-slate-500 uppercase flex items-center gap-2">
                        <UserPlus className="w-4 h-4"/> Admission Form Config
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Allow Public Admission</span>
                            <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={localConfig.allowPublicAdmission} onChange={e => setLocalConfig({...localConfig, allowPublicAdmission: e.target.checked})}/>
                        </div>
                        <div className="flex items-center justify-between border-t pt-3 mt-3 border-slate-200 dark:border-slate-700">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ask for Student Photo</span>
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 accent-blue-600" 
                                checked={localConfig.admissionConfig?.askPhoto || false} 
                                onChange={e => updateAdmissionConfig('askPhoto', e.target.checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ask for Blood Group</span>
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 accent-blue-600" 
                                checked={localConfig.admissionConfig?.askBloodGroup || false} 
                                onChange={e => updateAdmissionConfig('askBloodGroup', e.target.checked)}
                            />
                        </div>
                    </div>
                </GlassCard>

                {/* DATA SAFETY (BACKUP & RESTORE) */}
                <GlassCard className="border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10">
                    <h3 className="font-bold text-sm mb-4 text-green-700 dark:text-green-400 uppercase flex items-center gap-2">
                        <Save className="w-4 h-4"/> Data Safety
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Create Backup</p>
                            <button onClick={handleBackup} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2">
                                <Download className="w-4 h-4"/> Download Full Data (.json)
                            </button>
                            <p className="text-[9px] text-slate-400 mt-1 text-center">Includes Students, Classes, Marks & Fees</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Restore Data</p>
                            <label className="w-full py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer">
                                {restoring ? <Loader2 className="w-4 h-4 animate-spin"/> : <Upload className="w-4 h-4"/>} 
                                {restoring ? 'Restoring...' : 'Upload Backup File'}
                                <input type="file" accept=".json" onChange={handleRestore} className="hidden" disabled={restoring}/>
                            </label>
                            <p className="text-[9px] text-red-400 mt-1 text-center">Warning: This will overwrite existing data.</p>
                        </div>
                    </div>
                </GlassCard>

                {/* Template Selector */}
                <GlassCard className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-sm mb-4 text-slate-500 uppercase flex items-center gap-2"><Layout className="w-4 h-4"/> Home Page Theme</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {['STANDARD', 'MODERN', 'MINIMAL'].map(t => (
                            <div key={t} onClick={() => setLocalConfig({...localConfig, layoutTemplate: t as any})} className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all relative ${localConfig.layoutTemplate === t ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}>
                                {localConfig.layoutTemplate === t && <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5 shadow-sm z-10"><CheckCircle className="w-3 h-3"/></div>}
                                <div className={`h-16 relative flex items-center justify-center ${t === 'MODERN' ? 'bg-slate-800' : t === 'MINIMAL' ? 'bg-white' : 'bg-slate-300'}`}>
                                    {t === 'STANDARD' && <div className="w-full h-full bg-slate-300"></div>}
                                    {t === 'MODERN' && <div className="w-8 h-8 bg-white/20 rounded-full"></div>}
                                    {t === 'MINIMAL' && <div className="h-2 w-8 bg-slate-800 rounded"></div>}
                                </div>
                                <div className="p-2 text-center text-[10px] font-bold capitalize text-slate-600 dark:text-slate-400">{t.toLowerCase()}</div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Feature Controls */}
                <GlassCard className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-sm mb-4 text-slate-500 uppercase">Feature Controls</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-700 dark:text-slate-300">Allow Teachers to Edit Subjects</span><input type="checkbox" className="w-5 h-5 accent-blue-600" checked={localConfig.allowTeacherSubjectEdit} onChange={e => setLocalConfig({...localConfig, allowTeacherSubjectEdit: e.target.checked})}/></div>
                        <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Ranks on Result</span><input type="checkbox" className="w-5 h-5 accent-blue-600" checked={localConfig.showRank} onChange={e => setLocalConfig({...localConfig, showRank: e.target.checked})}/></div>
                        <div className="flex items-center justify-between border-t pt-3 mt-3 border-slate-200 dark:border-slate-700"><div className="flex flex-col"><span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><Share2 className="w-4 h-4 text-blue-500"/> Allow Student Social Links</span><span className="text-[10px] text-slate-500">Students can add Instagram/LinkedIn.</span></div><input type="checkbox" className="w-5 h-5 accent-blue-600" checked={localConfig.allowStudentSocials} onChange={e => setLocalConfig({...localConfig, allowStudentSocials: e.target.checked})}/></div>
                    </div>
                </GlassCard>

                {/* OWNERSHIP TRANSFER (DANGER ZONE) */}
                <GlassCard className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
                    <h3 className="font-bold text-sm mb-4 text-red-600 dark:text-red-400 uppercase flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4"/> Danger Zone
                    </h3>
                    
                    {!transferMode ? (
                        <button 
                            onClick={() => setTransferMode(true)}
                            className="w-full py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900 text-red-600 font-bold text-xs rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                        >
                            <KeyRound className="w-4 h-4"/> Transfer Ownership
                        </button>
                    ) : (
                        <div className="space-y-3 animate-fade-in-up">
                            <p className="text-[10px] text-red-600 dark:text-red-300">
                                This will send a request to Super Admin to transfer this portal to another email.
                            </p>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">New Owner Email / Details</label>
                                <textarea 
                                    className="w-full p-2 text-sm border rounded-lg bg-white dark:bg-slate-900" 
                                    placeholder="Enter email and reason..."
                                    value={newOwnerInfo}
                                    onChange={(e) => setNewOwnerInfo(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleRequestTransfer}
                                    className="flex-1 py-2 bg-red-600 text-white font-bold text-xs rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                                >
                                    <Send className="w-3 h-3"/> Send Request
                                </button>
                                <button 
                                    onClick={() => setTransferMode(false)}
                                    className="px-4 py-2 bg-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};

export default SettingsTab;
