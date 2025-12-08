
import React, { useEffect, useState, Suspense } from 'react';
import { LoadingScreen, GlassButton, GlassCard } from '../components/GlassUI';
import { api } from '../services/api';
import { SchoolConfig, ClassData, AssessmentProgram, Student, FeeStructure } from '../types';
import { CheckCircle2, Home, Users, Table, ClipboardList, Wallet, Settings, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminHeader } from './admin_components/AdminHeader';
import { NoticeModal, PublishModal, StudentEntryModal } from './admin_components/AdminModals';

// Tabs
const OverviewTab = React.lazy(() => import('./admin_tabs/OverviewTab'));
const ClassesTab = React.lazy(() => import('./admin_tabs/ClassesTab'));
const AssessmentsTab = React.lazy(() => import('./admin_tabs/AssessmentsTab'));
const FeesTab = React.lazy(() => import('./admin_tabs/FeesTab'));
const SettingsTab = React.lazy(() => import('./admin_tabs/SettingsTab'));
const BillingTab = React.lazy(() => import('./admin_tabs/BillingTab'));
const ReportsTab = React.lazy(() => import('./admin_tabs/ReportsTab'));

const DashboardAdmin: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'home'|'classes'|'assessments'|'fees'|'settings'|'billing'|'reports'>('home');
    
    const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [assessments, setAssessments] = useState<AssessmentProgram[]>([]);
    const [pendingAdmissions, setPendingAdmissions] = useState<Student[]>([]);
    const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [modules, setModules] = useState({ fees: true, assessments: true });

    // Modal States
    const [showNotice, setShowNotice] = useState(false);
    const [noticeData, setNoticeData] = useState({ title: '', message: '' });
    const [noticeTime, setNoticeTime] = useState('');
    const [posting, setPosting] = useState(false);

    const [showPublish, setShowPublish] = useState(false);
    const [pubDate, setPubDate] = useState('');
    const [publishing, setPublishing] = useState(false);

    const [showEntry, setShowEntry] = useState(false);
    const [entryMode, setEntryMode] = useState<'PUBLIC' | 'DELEGATE' | 'BULK' | 'SINGLE'>('PUBLIC');
    const [entryClassId, setEntryClassId] = useState('');
    const [newStudent, setNewStudent] = useState({ name: '', regNo: '', rollNo: '', dob: '', gender: 'Male', fatherName: '', motherName: '', photoUrl: '' });
    const [addingStudent, setAddingStudent] = useState(false);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [draftSaved, setDraftSaved] = useState(false);
    
    // Shared
    const [successMsg, setSuccessMsg] = useState('');
    const [shareData, setShareData] = useState<any>(null); // For Classes Tab popup if needed
    const [receiptData, setReceiptData] = useState<any>(null); // For Fees Tab

    useEffect(() => { loadData(); }, []);

    // Autosave Draft
    useEffect(() => {
        const saved = localStorage.getItem('student_draft');
        if(saved) { try{ const p = JSON.parse(saved); setNewStudent(p); if(p.classId) setEntryClassId(p.classId); }catch(e){} }
    }, []);

    useEffect(() => {
        if(showEntry && entryMode === 'SINGLE' && newStudent.name) {
            localStorage.setItem('student_draft', JSON.stringify({...newStudent, classId: entryClassId}));
            setDraftSaved(true);
            const t = setTimeout(()=>setDraftSaved(false), 2000);
            return ()=>clearTimeout(t);
        }
    }, [newStudent, entryClassId, showEntry]);

    const loadData = async () => {
        setLoading(true);
        const [config, settings] = await Promise.all([api.getSchoolConfig(), api.getGlobalSettings()]);
        if (!config) { navigate('/login'); return; }
        setSchoolConfig(config);
        setModules({ fees: settings['MODULE_FEES'] !== 'FALSE', assessments: settings['MODULE_ASSESSMENTS'] !== 'FALSE' });
        if(config.scheduledPublishDate) setPubDate(config.scheduledPublishDate.slice(0, 16));
        
        const [cls, ass, fee, pend] = await Promise.all([
            api.getClasses(),
            api.getAssessmentPrograms(),
            api.getFeeStructures(),
            api.getSchoolPendingAdmissions()
        ]);
        setClasses(cls); setAssessments(ass); setFeeStructures(fee); setPendingAdmissions(pend);
        setLoading(false);
    };

    // Actions
    const handlePostNotice = async () => {
        if(!noticeData.message) return alert("Message required");
        setPosting(true);
        const res = await api.createCampusPost(schoolConfig!.id!, schoolConfig!.schoolName, noticeData.message, 'ADMIN', 'NOTICE', noticeData.title, noticeTime ? new Date(noticeTime).toISOString() : undefined);
        setPosting(false);
        if(res.success) { setShowNotice(false); setNoticeData({title:'', message:''}); setSuccessMsg("Notice Posted!"); setTimeout(()=>setSuccessMsg(''),2000); }
        else alert(res.message);
    };

    const handlePublish = async () => {
        setPublishing(true);
        const d = pubDate || new Date(Date.now() - 60000).toISOString();
        const res = await api.updateSchoolSettings({ scheduledPublishDate: d });
        setPublishing(false);
        if(res.success) { setSchoolConfig({...schoolConfig!, scheduledPublishDate: d}); setShowPublish(false); setSuccessMsg("Results Published!"); setTimeout(()=>setSuccessMsg(''),2000); }
    };

    const handleAddStudent = async (e: any) => {
        e.preventDefault();
        if(!entryClassId || !newStudent.name || !newStudent.regNo) return alert("Missing info");
        setAddingStudent(true);
        const res = await api.createStudent(entryClassId, {...newStudent, addedBy: 'Admin'});
        setAddingStudent(false);
        if(res.success) {
            setSuccessMsg(`${newStudent.name} Added`); setTimeout(()=>setSuccessMsg(''),2000);
            setNewStudent({ name: '', regNo: '', rollNo: '', dob: '', gender: 'Male', fatherName: '', motherName: '', photoUrl: '' });
            localStorage.removeItem('student_draft');
            loadData();
        } else alert(res.message);
    };

    const handleCsv = async () => {
        if(!csvFile || !entryClassId) return alert("Select File & Class");
        setAddingStudent(true);
        const text = await csvFile.text();
        const lines = text.split('\n');
        let count = 0;
        for(let i=1; i<lines.length; i++) {
            const [n, r, g, d] = lines[i].split(',').map(s=>s.trim());
            if(n && r) { await api.createStudent(entryClassId, {name:n, regNo:r, gender: g||'Male', dob: d||'2000-01-01', fatherName:'-', motherName:'-', addedBy:'CSV'}); count++; }
        }
        setAddingStudent(false); setCsvFile(null); setShowEntry(false); loadData(); setSuccessMsg(`${count} Students Imported`); setTimeout(()=>setSuccessMsg(''),2000);
    };

    if (loading) return <LoadingScreen />;
    if (!schoolConfig) return null;

    return (
        <div className="pb-20 animate-fade-in-up">
            {successMsg && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <div className="bg-slate-900/90 text-white px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center animate-fade-in-up">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2"/>
                        <span className="font-bold">{successMsg}</span>
                    </div>
                </div>
            )}

            <AdminHeader config={schoolConfig} onNoticeClick={() => setShowNotice(true)} />

            {/* TAB NAV - Google Blue Style */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-6 overflow-x-auto border border-slate-200 dark:border-slate-800">
                {[
                    {id:'home', label:'Overview', icon:Home},
                    {id:'classes', label:'Classes', icon:Users},
                    {id:'reports', label:'Reports', icon:Table},
                    ...(modules.assessments ? [{id:'assessments', label:'Assessments', icon:ClipboardList}] : []),
                    ...(modules.fees ? [{id:'fees', label:'Fees', icon:Wallet}] : []),
                    {id:'settings', label:'Settings', icon:Settings},
                    {id:'billing', label:'Billing', icon:CreditCard}
                ].map(t => (
                    <button 
                        key={t.id} 
                        onClick={() => setActiveTab(t.id as any)}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex justify-center items-center gap-2 whitespace-nowrap ${activeTab === t.id ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <t.icon className="w-4 h-4"/> {t.label}
                    </button>
                ))}
            </div>

            <Suspense fallback={<div className="flex justify-center py-20 text-slate-400 text-sm">Loading...</div>}>
                {activeTab === 'home' && <OverviewTab setActiveTab={setActiveTab} stats={stats} classes={classes} pendingAdmissions={pendingAdmissions} onRefresh={loadData} setShowPublishModal={setShowPublish} setShowStudentEntryModal={setShowEntry} />}
                {activeTab === 'classes' && <ClassesTab classes={classes} onRefresh={loadData} onShowShare={(d)=>setShareData(d)} />}
                {activeTab === 'reports' && <ReportsTab />} 
                {activeTab === 'assessments' && <AssessmentsTab assessments={assessments} classes={classes} onRefresh={loadData} />}
                {activeTab === 'fees' && <FeesTab feeStructures={feeStructures} classes={classes} schoolConfig={schoolConfig} onRefresh={loadData} onShowReceipt={setReceiptData} />}
                {activeTab === 'settings' && <SettingsTab schoolConfig={schoolConfig} onUpdate={setSchoolConfig} />}
                {activeTab === 'billing' && <BillingTab schoolConfig={schoolConfig} />}
            </Suspense>

            {/* MODALS */}
            {showNotice && <NoticeModal onClose={()=>setShowNotice(false)} data={noticeData} setData={setNoticeData} scheduleTime={noticeTime} setScheduleTime={setNoticeTime} onSubmit={handlePostNotice} loading={posting} />}
            {showPublish && <PublishModal onClose={()=>setShowPublish(false)} date={pubDate} setDate={setPubDate} onSubmit={handlePublish} loading={publishing} />}
            {showEntry && <StudentEntryModal onClose={()=>setShowEntry(false)} mode={entryMode} setMode={setEntryMode} classId={entryClassId} setClassId={setEntryClassId} classes={classes} newStudent={newStudent} setNewStudent={setNewStudent} onSubmit={handleAddStudent} onCsv={handleCsv} setCsv={setCsvFile} loading={addingStudent} saved={draftSaved} schoolId={schoolConfig.id!} />}
            
            {/* Receipt Modal (Simple Inline for now) */}
            {receiptData && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm relative">
                        <button onClick={() => setReceiptData(null)} className="absolute top-2 right-2 font-bold">✕</button>
                        <h3 className="font-bold text-center border-b pb-2 mb-4">FEE RECEIPT</h3>
                        <div className="text-center mb-4"><h4 className="font-bold">{receiptData.schoolName}</h4><p className="text-xs text-gray-500">{receiptData.place}</p></div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Name:</span><span className="font-bold">{receiptData.studentName}</span></div>
                            <div className="flex justify-between"><span>Class:</span><span>{receiptData.className}</span></div>
                            <div className="flex justify-between"><span>Fee:</span><span>{receiptData.feeName}</span></div>
                            <div className="border-t my-2 pt-2 flex justify-between font-bold text-lg"><span>Total:</span><span>₹{receiptData.amount}</span></div>
                        </div>
                        <button onClick={()=>window.print()} className="mt-6 w-full bg-slate-900 text-white py-2 rounded text-xs font-bold no-print">Print</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAdmin;
