
import React, { useEffect, useState } from 'react';
import { GlassCard, GlassButton } from '../../components/GlassUI';
import { api } from '../../services/api';
import { SupportTicket } from '../../types';
import { MessageSquare, CheckCircle, Clock, AlertTriangle, User, Send, Bot, RefreshCw } from 'lucide-react';

const SupportDeskTab: React.FC = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [replyText, setReplyText] = useState('');
    const [resolving, setResolving] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        const data = await api.getAllSupportTickets();
        setTickets(data);
        setLoading(false);
    };

    const handleSelectTicket = (t: SupportTicket) => {
        setSelectedTicket(t);
        setReplyText(t.aiSuggestedReply || '');
    };

    const handleResolve = async () => {
        if (!selectedTicket || !replyText) return;
        setResolving(true);
        await api.resolveTicket(selectedTicket.id, replyText);
        setResolving(false);
        setSelectedTicket(null);
        loadTickets();
        alert("Ticket Resolved & User Notified");
    };

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6 animate-fade-in-up">
            
            {/* Ticket List */}
            <div className="w-1/3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-500"/> Inbox ({tickets.filter(t=>t.status==='OPEN').length})
                    </h3>
                    <button onClick={loadTickets} className="text-slate-500 hover:text-white"><RefreshCw className="w-4 h-4"/></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {tickets.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No tickets found.</div>}
                    {tickets.map(t => (
                        <div 
                            key={t.id} 
                            onClick={() => handleSelectTicket(t)}
                            className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors ${selectedTicket?.id === t.id ? 'bg-slate-800 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${t.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                                    {t.priority}
                                </span>
                                <span className="text-[10px] text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className={`text-sm font-bold mb-1 truncate ${t.status === 'RESOLVED' ? 'text-slate-500 line-through' : 'text-white'}`}>{t.subject}</h4>
                            <p className="text-xs text-slate-400 truncate">{t.schoolName}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ticket Detail / Action */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col relative">
                {selectedTicket ? (
                    <>
                        <div className="p-6 border-b border-slate-800 bg-slate-900">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">{selectedTicket.subject}</h2>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><User className="w-3 h-3"/> {selectedTicket.userEmail}</span>
                                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                        <span>{selectedTicket.schoolName}</span>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded text-xs font-bold ${selectedTicket.status === 'OPEN' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
                                    {selectedTicket.status}
                                </div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg text-sm text-slate-300 leading-relaxed">
                                {selectedTicket.message}
                            </div>
                        </div>

                        {/* AI Suggestion Box */}
                        {selectedTicket.status !== 'RESOLVED' && (
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="bg-purple-900/10 border border-purple-500/30 p-3 rounded-lg mb-4">
                                    <div className="flex items-center gap-2 mb-2 text-purple-400 text-xs font-bold uppercase">
                                        <Bot className="w-4 h-4"/> AI Auto-Draft
                                    </div>
                                    <p className="text-sm text-slate-300 italic">"{selectedTicket.aiSuggestedReply}"</p>
                                    <button 
                                        onClick={() => setReplyText(selectedTicket.aiSuggestedReply || '')}
                                        className="mt-2 text-xs text-purple-400 hover:text-purple-300 underline"
                                    >
                                        Use this reply
                                    </button>
                                </div>

                                <textarea 
                                    className="w-full flex-1 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Type your reply here..."
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                ></textarea>
                                
                                <div className="flex justify-end mt-4">
                                    <GlassButton onClick={handleResolve} disabled={resolving} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                                        {resolving ? 'Sending...' : <><Send className="w-4 h-4"/> Approve & Send Reply</>}
                                    </GlassButton>
                                </div>
                            </div>
                        )}
                        
                        {selectedTicket.status === 'RESOLVED' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                                <CheckCircle className="w-16 h-16 mb-4 text-green-900"/>
                                <p>This ticket has been resolved.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                        <MessageSquare className="w-20 h-20 mb-4 opacity-20"/>
                        <p>Select a ticket to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportDeskTab;
