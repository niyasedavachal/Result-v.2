

import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton } from '../../components/GlassUI';
import { api } from '../../services/api';
import { Exam, Student, ExamSubmission, Question } from '../../types';
import { Clock, CheckCircle2, Play, AlertTriangle, ArrowRight, ArrowLeft, XCircle, Check } from 'lucide-react';

interface Props {
    user: Student;
}

const ExamsTab: React.FC<Props> = ({ user }) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Exam Taking State
    const [activeExam, setActiveExam] = useState<Exam | null>(null);
    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]); // New: For shuffled order
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Result View
    const [viewResult, setViewResult] = useState<ExamSubmission | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    useEffect(() => {
        loadExams();
    }, []);

    useEffect(() => {
        if (!activeExam) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [activeExam]);

    const loadExams = async () => {
        setLoading(true);
        const data = await api.getExamsForClass(user.classId);
        setExams(data);
        setLoading(false);
    };

    const handleStartExam = async (exam: Exam) => {
        const submission = await api.getExamSubmission(exam.id, user.id);
        if (submission) {
            setViewResult(submission);
            return;
        }

        const now = new Date();
        const end = new Date(exam.endTime);
        const start = new Date(exam.startTime);
        
        if (now < start) return alert("Exam has not started yet.");
        if (now > end) return alert("Exam expired.");

        // SHUFFLE LOGIC
        let questionsToUse = [...exam.questions];
        if (exam.settings?.shuffleQuestions) {
            questionsToUse = questionsToUse.sort(() => Math.random() - 0.5);
        }

        setShuffledQuestions(questionsToUse);
        setActiveExam(exam);
        setTimeLeft(exam.durationMinutes * 60);
        setAnswers({});
        setCurrentQIndex(0);
    };

    const handleAnswer = (qId: string, optionIdx: number) => {
        setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    };

    const handleSubmitExam = async () => {
        if (!activeExam || isSubmitting) return;
        setIsSubmitting(true);
        
        let score = 0;
        let totalMarks = 0;
        
        activeExam.questions.forEach(q => {
            totalMarks += q.marks;
            if (answers[q.id] === q.correctOptionIndex) {
                score += q.marks;
            }
        });

        const res = await api.submitExam(activeExam.id, user.id, answers, score, totalMarks);
        setIsSubmitting(false);
        const examCopy = activeExam; // Preserve for settings check
        setActiveExam(null);
        
        if (res.success) {
            // Load result if allowed immediately
            if (examCopy.settings?.showResultImmediately) {
                const sub = await api.getExamSubmission(examCopy.id, user.id);
                setViewResult(sub);
            } else {
                alert("Exam Submitted! Result will be published by teacher.");
                loadExams();
            }
        } else {
            alert("Submission failed. Please contact teacher.");
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (activeExam) {
        const question = shuffledQuestions[currentQIndex];
        return (
            <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col animate-fade-in-up">
                {/* Header */}
                <div className="p-4 bg-slate-900 text-white flex justify-between items-center shadow-lg">
                    <div>
                        <h3 className="font-bold text-sm opacity-80">{activeExam.title}</h3>
                        <p className="text-xs">Q {currentQIndex + 1} / {shuffledQuestions.length}</p>
                    </div>
                    <div className={`font-mono text-xl font-bold px-3 py-1 rounded-lg ${timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Question Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 leading-relaxed">
                        {question.text}
                    </h2>
                    
                    <div className="space-y-3">
                        {question.options.map((opt, idx) => (
                            <div 
                                key={idx}
                                onClick={() => handleAnswer(question.id, idx)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[question.id] === idx ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[question.id] === idx ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300'}`}>
                                        {answers[question.id] === idx && <div className="w-2 h-2 bg-white rounded-full"/>}
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-200 font-medium">{opt}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Nav */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between gap-4">
                    <button 
                        disabled={currentQIndex === 0}
                        onClick={() => setCurrentQIndex(prev => prev - 1)}
                        className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-500 disabled:opacity-50"
                    >
                        <ArrowLeft className="w-5 h-5"/>
                    </button>
                    
                    {currentQIndex === shuffledQuestions.length - 1 ? (
                        <button 
                            onClick={handleSubmitExam}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl py-3 shadow-lg shadow-green-500/30"
                        >
                            Submit Exam
                        </button>
                    ) : (
                        <button 
                            onClick={() => setCurrentQIndex(prev => prev + 1)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2"
                        >
                            Next Question <ArrowRight className="w-5 h-5"/>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (viewResult) {
        const relatedExam = exams.find(e => e.id === viewResult.examId);
        
        return (
            <div className="animate-fade-in-up space-y-6">
                <GlassCard className="text-center py-10 bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900">
                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-blue-600"/>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Exam Completed!</h2>
                    <p className="text-slate-500 mb-6">You scored</p>
                    <div className="text-6xl font-black text-blue-600 mb-2">{viewResult.score}</div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Out of {viewResult.totalMarks}</p>
                    
                    <div className="mt-8 flex gap-3 justify-center">
                        <GlassButton onClick={() => setViewResult(null)} variant="secondary">Back to Exams</GlassButton>
                        <GlassButton onClick={() => setShowAnalysis(true)} className="bg-blue-600 text-white">View Solution</GlassButton>
                    </div>
                </GlassCard>

                {/* ANSWER KEY ANALYSIS */}
                {showAnalysis && relatedExam && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg dark:text-white">Answer Key</h3>
                        {relatedExam.questions.map((q, idx) => {
                            const userAnswer = viewResult.answers[q.id];
                            const isCorrect = userAnswer === q.correctOptionIndex;
                            const isUnanswered = userAnswer === undefined;

                            return (
                                <GlassCard key={q.id} className={`border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                                    <div className="mb-2 font-bold text-slate-800 dark:text-white text-sm">
                                        <span className="text-slate-400 mr-2">{idx + 1}.</span> {q.text}
                                    </div>
                                    <div className="space-y-1">
                                        {q.options.map((opt, oIdx) => {
                                            let style = "p-2 rounded text-xs border border-transparent";
                                            // Logic for highlighting options
                                            if (oIdx === q.correctOptionIndex) style += " bg-green-50 dark:bg-green-900/20 text-green-700 border-green-200 font-bold";
                                            else if (oIdx === userAnswer && !isCorrect) style += " bg-red-50 dark:bg-red-900/20 text-red-700 border-red-200";
                                            else style += " text-slate-500 opacity-70";

                                            return (
                                                <div key={oIdx} className={style}>
                                                    {opt} 
                                                    {oIdx === q.correctOptionIndex && <Check className="w-3 h-3 inline ml-2"/>}
                                                    {oIdx === userAnswer && !isCorrect && <XCircle className="w-3 h-3 inline ml-2"/>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in-up">
            <h3 className="font-bold text-lg dark:text-white mb-4">Scheduled Exams</h3>
            {exams.map(exam => {
                const now = new Date();
                const start = new Date(exam.startTime);
                const end = new Date(exam.endTime);
                let status = 'UPCOMING';
                if (now > end) status = 'EXPIRED';
                else if (now >= start) status = 'LIVE';

                return (
                    <GlassCard key={exam.id} className="relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${status === 'LIVE' ? 'bg-green-500' : status === 'UPCOMING' ? 'bg-yellow-500' : 'bg-slate-300'}`}></div>
                        <div className="pl-4">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 dark:text-white text-lg">{exam.title}</h4>
                                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${status === 'LIVE' ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>{status}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-4 line-clamp-2">{exam.description || 'No instructions provided.'}</p>
                            
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 mb-4">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {exam.durationMinutes} Mins</span>
                                <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {exam.questions.length} Qs</span>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleStartExam(exam)}
                                    disabled={status === 'UPCOMING'}
                                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${status === 'LIVE' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-400'}`}
                                >
                                    {status === 'LIVE' ? <><Play className="w-4 h-4 fill-white"/> Start Exam</> : status === 'UPCOMING' ? `Starts ${start.toLocaleTimeString()}` : 'View Result'}
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                );
            })}
            
            {exams.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-400 text-sm">No exams scheduled for your class.</p>
                </div>
            )}
        </div>
    );
};

export default ExamsTab;