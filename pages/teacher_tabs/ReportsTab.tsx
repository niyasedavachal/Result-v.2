import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton, GlassInput } from '../../components/GlassUI';
import { Megaphone, Send, CheckCircle2 } from 'lucide-react';

interface Props {
    onPostNotice: (title: string, msg: string, scheduleTime?: string) => Promise<boolean>;
}

const ReportsTab: React.FC<Props> = ({ onPostNotice }) => {
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeMsg, setNoticeMsg] = useState('');
    const [noticeScheduleTime, setNoticeScheduleTime] = useState('');
    const [noticeSuccess, setNoticeSuccess] = useState(false);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (noticeSuccess) {
            const timer = setTimeout(() => setNoticeSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [noticeSuccess]);

    const handlePost = async () => {
        if (!noticeTitle || !noticeMsg) { 
            alert("Please enter title and message"); 
            return; 
        }
        setPosting(true);
        const success = await onPostNotice(noticeTitle, noticeMsg, noticeScheduleTime);
        setPosting(false);
        
        if (success) {
            setNoticeTitle('');
            setNoticeMsg('');
            setNoticeScheduleTime('');
            setNoticeSuccess(true);
        }
    };

    return (
        <div className="max-w-md mx-auto animate-fade-in-up">
            <GlassCard className="border-t-4 border-t-blue-500 relative overflow-hidden">
                {noticeSuccess && (
                    <div className="absolute inset-0 z-10 bg-white/95 dark:bg-slate-900/95 flex flex-col items-center justify-center text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 animate-bounce">
                            <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400"/>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{noticeScheduleTime ? 'Scheduled!' : 'Notice Posted!'}</h3>
                    </div>
                )}

                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center shrink-0">
                        <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">Post Notice</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Inform students & parents</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Title</label>
                        <GlassInput placeholder="e.g. Exam Schedule" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)}/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Message</label>
                        <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm h-32 resize-none" placeholder="Type here..." value={noticeMsg} onChange={e => setNoticeMsg(e.target.value)}></textarea>
                    </div>
                    
                    {/* SCHEDULE DATE */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Schedule for Later (Optional)</label>
                        <GlassInput 
                            type="datetime-local" 
                            value={noticeScheduleTime} 
                            onChange={(e) => setNoticeScheduleTime(e.target.value)} 
                        />
                    </div>

                    <GlassButton onClick={handlePost} disabled={posting} className="w-full flex items-center justify-center gap-2">
                        <Send className="w-4 h-4"/> 
                        {posting ? 'Posting...' : (noticeScheduleTime ? 'Schedule Post' : 'Post Notice')}
                    </GlassButton>
                </div>
            </GlassCard>
        </div>
    );
};

export default ReportsTab;