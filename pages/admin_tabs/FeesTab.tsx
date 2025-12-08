
import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from '../../components/GlassUI';
import { api } from '../../services/api';
import { FeeStructure, ClassData, SchoolConfig } from '../../types';
import { Plus, X, Receipt, Wallet, CheckCircle2 } from 'lucide-react';

interface Props {
    feeStructures: FeeStructure[];
    classes: ClassData[];
    schoolConfig: SchoolConfig;
    onRefresh: () => void;
    onShowReceipt: (data: any) => void;
}

const FeesTab: React.FC<Props> = ({ feeStructures, classes, schoolConfig, onRefresh, onShowReceipt }) => {
    const [selectedFeeId, setSelectedFeeId] = useState<string>('');
    const [feeCollectionData, setFeeCollectionData] = useState<any[]>([]);
    const [newFee, setNewFee] = useState({ 
        name: '', 
        amount: '', 
        dueDate: '', 
        targetClassIds: [] as string[],
        collectedBy: 'ADMIN' as 'ADMIN'|'TEACHER'|'BOTH',
        isRecurring: false,
        recurrenceFrequency: 'MONTHLY',
        recurrenceCount: 1
    });
    const [creatingFee, setCreatingFee] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleCreateFee = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingFee(true);
        
        const amount = parseFloat(newFee.amount);
        if(!newFee.name || isNaN(amount)) return alert("Invalid Input");

        const res = await api.createFeeStructure(
            newFee.name, 
            amount, 
            newFee.dueDate, 
            newFee.targetClassIds, 
            newFee.collectedBy,
            newFee.isRecurring ? { frequency: newFee.recurrenceFrequency, count: newFee.recurrenceCount } : undefined
        );
        
        setCreatingFee(false);
        
        if (res.success) {
            setSuccessMsg('Fee Category Created!');
            setNewFee({ 
                name: '', amount: '', dueDate: '', targetClassIds: [], 
                collectedBy: 'ADMIN', isRecurring: false, recurrenceFrequency: 'MONTHLY', recurrenceCount: 1 
            });
            onRefresh();
            setTimeout(() => setSuccessMsg(''), 2000);
        } else {
            alert("Error: " + res.message);
        }
    };

    const loadFeeCollection = async (feeId: string) => {
        setSelectedFeeId(feeId);
        setFeeCollectionData([]);
        
        const fee = feeStructures.find(f => f.id === feeId);
        if(!fee) return;
        
        const classesToFetch = (!fee.targetClassIds || fee.targetClassIds.length === 0) 
            ? classes.map(c => c.id)
            : fee.targetClassIds;
            
        let allData: any[] = [];
        setLoading(true);
        
        for(const clsId of classesToFetch) {
            const cls = classes.find(c => c.id === clsId);
            if(!cls) continue;
            
            const stats = await api.getFeeCollectionStats(feeId, clsId);
            const enriched = stats.map(s => ({...s, className: cls.name}));
            allData = [...allData, ...enriched];
        }
        
        setFeeCollectionData(allData);
        setLoading(false);
    };

    const handleMarkFeePaid = async (studentId: string) => {
        if(!selectedFeeId) return;
        setFeeCollectionData(prev => prev.map(s => {
            if(s.student.id === studentId) {
                return { ...s, status: 'PAID', paymentDetails: { paid_date: new Date().toISOString() } };
            }
            return s;
        }));
        
        const res = await api.recordFeePayment(selectedFeeId, studentId, 0, 'Admin');
        if(!res.success) {
            alert("Failed to record payment");
            loadFeeCollection(selectedFeeId);
        } else {
            loadFeeCollection(selectedFeeId);
        }
    };

    const handleGenerateReceipt = (record: any) => {
        const fee = feeStructures.find(f => f.id === selectedFeeId);
        if (!fee) return;

        onShowReceipt({
            schoolName: schoolConfig.schoolName,
            place: schoolConfig.place,
            studentName: record.student.name,
            regNo: record.student.regNo,
            className: record.className,
            feeName: fee.name,
            amount: fee.amount,
            date: new Date(record.paymentDetails?.paid_date).toLocaleDateString(),
            txnId: record.paymentDetails?.transaction_id || 'N/A'
        });
    };

    const handleDeleteFee = async (id: string) => {
        if(!window.confirm("Delete this fee structure? Payments will be unlinked.")) return;
        const res = await api.deleteFeeStructure(id);
        if(res.success) {
            onRefresh();
            if(selectedFeeId === id) {
                setSelectedFeeId('');
                setFeeCollectionData([]);
            }
        }
    };

    return (
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="md:col-span-1 space-y-6">
                <GlassCard className="border-t-4 border-t-green-500 relative overflow-hidden">
                    {successMsg && (
                        <div className="absolute inset-0 z-10 bg-white/95 dark:bg-slate-900/95 flex flex-col items-center justify-center text-center animate-fade-in-up">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 animate-bounce">
                                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400"/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{successMsg}</h3>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center shrink-0">
                            <Wallet className="w-6 h-6 text-green-600 dark:text-green-400"/>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">New Fee</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Define amount & due date</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateFee} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Fee Name</label>
                            <GlassInput 
                                placeholder="e.g. Bus Fee / Term 1" 
                                value={newFee.name}
                                onChange={e => setNewFee({...newFee, name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Amount (₹)</label>
                            <GlassInput 
                                type="number"
                                placeholder="0.00" 
                                value={newFee.amount}
                                onChange={e => setNewFee({...newFee, amount: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Due Date</label>
                            <GlassInput 
                                type="date"
                                value={newFee.dueDate}
                                onChange={e => setNewFee({...newFee, dueDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Who Collects?</label>
                            <GlassSelect 
                                value={newFee.collectedBy}
                                onChange={e => setNewFee({...newFee, collectedBy: e.target.value as any})}
                            >
                                <option value="ADMIN">Admin Only</option>
                                <option value="TEACHER">Class Teacher Only</option>
                                <option value="BOTH">Both (Hybrid)</option>
                            </GlassSelect>
                        </div>
                        
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-2">
                                <input 
                                    type="checkbox" 
                                    id="recurringCheck"
                                    className="w-4 h-4 accent-green-600"
                                    checked={newFee.isRecurring}
                                    onChange={e => setNewFee({...newFee, isRecurring: e.target.checked})}
                                />
                                <label htmlFor="recurringCheck" className="text-sm font-bold text-slate-700 dark:text-slate-300">Recurring Payment?</label>
                            </div>
                            
                            {newFee.isRecurring && (
                                <div className="space-y-3 mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg animate-fade-in-up">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Frequency</label>
                                        <GlassSelect 
                                            value={newFee.recurrenceFrequency}
                                            onChange={e => setNewFee({...newFee, recurrenceFrequency: e.target.value})}
                                        >
                                            <option value="WEEKLY">Weekly</option>
                                            <option value="BIWEEKLY">Every 2 Weeks</option>
                                            <option value="MONTHLY">Monthly</option>
                                            <option value="BIMONTHLY">Every 2 Months</option>
                                            <option value="QUARTERLY">Quarterly (3 Months)</option>
                                            <option value="HALFYEARLY">Half-Yearly (6 Months)</option>
                                            <option value="YEARLY">Yearly</option>
                                        </GlassSelect>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Total Installments</label>
                                        <GlassInput 
                                            type="number"
                                            min="2"
                                            max="24"
                                            placeholder="e.g. 12" 
                                            value={newFee.recurrenceCount}
                                            onChange={e => setNewFee({...newFee, recurrenceCount: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <GlassButton type="submit" disabled={creatingFee} className="w-full flex items-center justify-center gap-2">
                            {creatingFee ? 'Creating...' : <><Plus className="w-4 h-4"/> Create Fee</>}
                        </GlassButton>
                    </form>
                </GlassCard>
            </div>

            <div className="md:col-span-2 space-y-6">
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {feeStructures.map(fee => (
                        <div key={fee.id} className="relative group">
                            <button 
                                onClick={() => loadFeeCollection(fee.id)}
                                className={`px-4 py-2 rounded-lg border text-sm font-bold whitespace-nowrap transition-all ${selectedFeeId === fee.id ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                {fee.name} (₹{fee.amount})
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteFee(fee.id); }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                title="Delete Fee"
                            >
                                <X className="w-3 h-3"/>
                            </button>
                        </div>
                    ))}
                    {feeStructures.length === 0 && (
                        <p className="text-sm text-slate-400 italic">No fees created yet.</p>
                    )}
                </div>

                {selectedFeeId ? (
                    <GlassCard className="p-0 overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h4 className="font-bold text-slate-700 dark:text-white">Collection Status</h4>
                            <div className="flex gap-4 text-xs">
                                <span className="text-green-600 font-bold">Paid: {feeCollectionData.filter(s => s.status === 'PAID').length}</span>
                                <span className="text-red-500 font-bold">Pending: {feeCollectionData.filter(s => s.status === 'PENDING').length}</span>
                            </div>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase sticky top-0">
                                    <tr>
                                        <th className="p-3">Student</th>
                                        <th className="p-3">Class</th>
                                        <th className="p-3 text-right">Status</th>
                                        <th className="p-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {feeCollectionData.map((record: any) => (
                                        <tr key={record.student.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="p-3 font-bold text-slate-800 dark:text-white">{record.student.name}</td>
                                            <td className="p-3 text-slate-500">{record.className}</td>
                                            <td className="p-3 text-right">
                                                {record.status === 'PAID' ? (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">PAID</span>
                                                ) : (
                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">PENDING</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center flex justify-center gap-2">
                                                {record.status === 'PENDING' && (
                                                    <button 
                                                        onClick={() => handleMarkFeePaid(record.student.id)}
                                                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-bold shadow-sm"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                                {record.status === 'PAID' && (
                                                    <button 
                                                        onClick={() => handleGenerateReceipt(record)}
                                                        className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-2 py-1 rounded font-bold flex items-center gap-1"
                                                        title="Download Receipt"
                                                    >
                                                        <Receipt className="w-3 h-3"/> Receipt
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {feeCollectionData.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-400">No students found for this fee.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-2"/>
                        <p className="text-slate-500 dark:text-slate-400">Select a fee category above to manage collection.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeesTab;
