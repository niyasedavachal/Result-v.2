
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from '../../components/GlassUI';
import { api } from '../../services/api';
import { Exam, Question, ExamSubmission } from '../../types';
import { Plus, Trash2, Calendar, Clock, CheckCircle2, List, Play, Settings, Award, Users, FileText, ChevronRight, X, Sparkles, Loader2, Image as ImageIcon, UploadCloud, AlertTriangle, Camera, Timer, Crop, Check, ScanLine, Type as TypeIcon, ScanSearch } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface Props {
    classId: string;
}

// Enhanced Cropper with Visual Instructions & Scanning Effect
const ImageCropper: React.FC<{ imageSrc: string; onCrop: (blob: Blob) => void; onCancel: () => void }> = ({ imageSrc, onCrop, onCancel }) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [cropRect, setCropRect] = useState<{x: number, y: number, w: number, h: number} | null>(null);
    const [startPos, setStartPos] = useState({x: 0, y: 0});
    const [isScanning, setIsScanning] = useState(true); // Scanning visual state

    const getMousePos = (e: any) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if(!rect) return {x:0, y:0};
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const handleMouseDown = (e: any) => {
        const pos = getMousePos(e);
        setStartPos(pos);
        setCropRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
        setIsDrawing(true);
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing) return;
        const pos = getMousePos(e);
        setCropRect({
            x: Math.min(startPos.x, pos.x),
            y: Math.min(startPos.y, pos.y),
            w: Math.abs(pos.x - startPos.x),
            h: Math.abs(pos.y - startPos.y)
        });
    };

    const handleMouseUp = () => setIsDrawing(false);

    // Initial Image Load & Canvas Draw
    useEffect(() => {
        if (imageSrc) {
            setIsScanning(true);
        }
    }, [imageSrc]);

    const handleImageLoad = () => {
        if(canvasRef.current && imgRef.current) {
            const aspect = imgRef.current.naturalWidth / imgRef.current.naturalHeight;
            let w = Math.min(window.innerWidth * 0.9, 600);
            let h = w / aspect;
            canvasRef.current.width = w;
            canvasRef.current.height = h;
            setCropRect(null);
            
            // Draw initial full image
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.drawImage(imgRef.current, 0, 0, w, h);
                // Apply slight dark overlay to indicate ready for selection
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(0, 0, w, h);
            }
            
            // Artificial delay to show "Scanning" effect for better UX on fast devices
            setTimeout(() => setIsScanning(false), 600);
        }
    };

    // Re-draw canvas when crop selection changes
    useEffect(() => {
        if (!canvasRef.current || !imgRef.current || isScanning) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Clear and Draw Base Image
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(imgRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

        // Darken Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Draw Crop Selection (Clear Rect)
        if (cropRect && cropRect.w > 0) {
            ctx.clearRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
            ctx.drawImage(
                imgRef.current, 
                // Source rect (approximate mapping since we drew scaled image)
                0, 0, imgRef.current.width, imgRef.current.height,
                0, 0, canvasRef.current.width, canvasRef.current.height
            );
            
            // Re-apply darkening to outside
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            // Top
            ctx.fillRect(0, 0, canvasRef.current.width, cropRect.y);
            // Bottom
            ctx.fillRect(0, cropRect.y + cropRect.h, canvasRef.current.width, canvasRef.current.height - (cropRect.y + cropRect.h));
            // Left
            ctx.fillRect(0, cropRect.y, cropRect.x, cropRect.h);
            // Right
            ctx.fillRect(cropRect.x + cropRect.w, cropRect.y, canvasRef.current.width - (cropRect.x + cropRect.w), cropRect.h);

            // Border
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.setLineDash([6]);
            ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
        } else {
             // Instructions Overlay if no crop
             ctx.font = "bold 14px sans-serif";
             ctx.fillStyle = "white";
             ctx.textAlign = "center";
             ctx.fillText("Drag to select text", canvasRef.current.width/2, canvasRef.current.height/2);
        }
    }, [cropRect, isScanning]);

    const performCrop = () => {
        if (!cropRect || !imgRef.current || cropRect.w < 10) {
            // Use full image if no crop
            if(imgRef.current && canvasRef.current) {
                 const scaleX = imgRef.current.naturalWidth / canvasRef.current.width;
                 const scaleY = imgRef.current.naturalHeight / canvasRef.current.height;
                 setCropRect({x:0, y:0, w: canvasRef.current.width, h: canvasRef.current.height});
                 setTimeout(() => performCrop(), 100); // Re-trigger
                 return;
            }
            return;
        }
        
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas) return;

        const scaleX = img.naturalWidth / canvas.width;
        const scaleY = img.naturalHeight / canvas.height;

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = cropRect.w * scaleX;
        cropCanvas.height = cropRect.h * scaleY;
        const ctx = cropCanvas.getContext('2d');
        
        ctx?.drawImage(
            img, 
            cropRect.x * scaleX, cropRect.y * scaleY, cropRect.w * scaleX, cropRect.h * scaleY, 
            0, 0, cropCanvas.width, cropCanvas.height
        );

        cropCanvas.toBlob(blob => {
            if(blob) onCrop(blob);
        }, 'image/jpeg');
    };

    return (
        <div className="fixed inset-0 z-[70] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
            {isScanning ? (
                <div className="flex flex-col items-center animate-fade-in-up">
                    <div className="relative mb-4">
                        <ScanSearch className="w-16 h-16 text-green-500 animate-pulse"/>
                        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-ping"></div>
                    </div>
                    <h3 className="text-white font-bold text-lg tracking-widest">SCANNING PAGE...</h3>
                    <p className="text-slate-400 text-xs">Analyzing text structure</p>
                </div>
            ) : (
                <>
                    <div className="bg-slate-800 px-6 py-2 rounded-full mb-4 flex items-center gap-2 shadow-lg border border-slate-700 animate-fade-in-up">
                        <Crop className="w-4 h-4 text-green-400"/>
                        <span className="text-white text-sm font-bold">Select the area to read</span>
                    </div>
                    
                    <div className="relative max-h-[70vh] overflow-hidden border-2 border-slate-700 rounded-lg bg-black shadow-2xl">
                        <canvas 
                            ref={canvasRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onTouchStart={handleMouseDown}
                            onTouchMove={handleMouseMove}
                            onTouchEnd={handleMouseUp}
                            className="cursor-crosshair block touch-none"
                        />
                    </div>
                    <div className="flex gap-4 mt-6 w-full max-w-sm">
                        <GlassButton variant="secondary" onClick={onCancel} className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800">Discard</GlassButton>
                        <GlassButton onClick={performCrop} className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20">
                            <Check className="w-4 h-4 mr-2"/> {cropRect && cropRect.w > 10 ? 'Crop Selection' : 'Use Full Page'}
                        </GlassButton>
                    </div>
                </>
            )}
            
            {/* Hidden Source Image */}
            <img 
                ref={imgRef} 
                src={imageSrc} 
                className="hidden" 
                onLoad={handleImageLoad}
            />
        </div>
    );
};

const ExamsTab: React.FC<Props> = ({ classId }) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [creating, setCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Result View State
    const [viewingResultId, setViewingResultId] = useState<string | null>(null);
    const [rankList, setRankList] = useState<ExamSubmission[]>([]);
    const [resultLoading, setResultLoading] = useState(false);

    // AI Generation State
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiMode, setAiMode] = useState<'SCAN' | 'TOPIC'>('SCAN'); 
    const [aiTopic, setAiTopic] = useState('');
    const [aiCount, setAiCount] = useState(5);
    const [aiLevel, setAiLevel] = useState('From Book Only'); // Default changed dynamically
    const [aiLang, setAiLang] = useState('Malayalam');
    const [aiImages, setAiImages] = useState<string[]>([]);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [processingImage, setProcessingImage] = useState(false);
    
    // Cropper State
    const [imgToCrop, setImgToCrop] = useState<string | null>(null);
    
    // Rate Limit Cooldown
    const [cooldownTime, setCooldownTime] = useState(0);

    // Review State
    const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
    const [selectedQIndices, setSelectedQIndices] = useState<number[]>([]);
    const [reviewingAi, setReviewingAi] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [duration, setDuration] = useState(30);
    const [settings, setSettings] = useState({ shuffleQuestions: false, showResultImmediately: true });
    const [questions, setQuestions] = useState<Question[]>([
        { id: '1', text: '', options: ['', '', '', ''], correctOptionIndex: 0, marks: 1 }
    ]);

    useEffect(() => {
        loadExams();
    }, []);

    // Smart Defaults Logic
    useEffect(() => {
        if (aiMode === 'SCAN') {
            setAiLevel('From Book Only');
        } else {
            setAiLevel('UP School'); // Default for Topic
        }
    }, [aiMode]);

    useEffect(() => {
        let timer: any;
        if (cooldownTime > 0) {
            timer = setInterval(() => {
                setCooldownTime((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldownTime]);

    const loadExams = async () => {
        const data = await api.getExamsForClass(classId);
        setExams(data);
    };

    const loadResults = async (examId: string) => {
        setViewingResultId(examId);
        setResultLoading(true);
        const data = await api.getExamSubmissionsForTeacher(examId);
        setRankList(data);
        setResultLoading(false);
    };

    const addQuestion = () => {
        setQuestions([...questions, { 
            id: Date.now().toString(), 
            text: '', 
            options: ['', '', '', ''], 
            correctOptionIndex: 0, 
            marks: 1 
        }]);
    };

    const updateQuestion = (idx: number, field: string, val: any) => {
        const updated = [...questions];
        if (field === 'text') updated[idx].text = val;
        else if (field === 'correct') updated[idx].correctOptionIndex = val;
        else if (field === 'marks') updated[idx].marks = val;
        setQuestions(updated);
    };

    const updateOption = (qIdx: number, oIdx: number, val: string) => {
        const updated = [...questions];
        updated[qIdx].options[oIdx] = val;
        setQuestions(updated);
    };

    const removeQuestion = (idx: number) => {
        const updated = [...questions];
        updated.splice(idx, 1);
        setQuestions(updated);
    };

    const handleCreateExam = async () => {
        if (!title || !startTime || !endTime) return alert("Please fill basic details");
        if (questions.some(q => !q.text || q.options.some(o => !o))) return alert("Fill all questions and options");

        setLoading(true);
        const res = await api.createExam({
            classId,
            title,
            description: desc,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            durationMinutes: duration,
            questions,
            settings
        });
        setLoading(false);

        if (res.success) {
            setCreating(false);
            loadExams();
            setTitle(''); setDesc(''); setSettings({ shuffleQuestions: false, showResultImmediately: true });
            setQuestions([{ id: '1', text: '', options: ['', '', '', ''], correctOptionIndex: 0, marks: 1 }]);
        } else {
            alert("Failed: " + res.message);
        }
    };

    const handleDelete = async (id: string) => {
        if(!window.confirm("Delete this exam?")) return;
        await api.deleteExam(id);
        loadExams();
    };

    // --- CROPPER HANDLER ---
    const handleCropSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = () => setImgToCrop(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
        // Reset Input
        e.target.value = '';
    };

    const onCropComplete = (blob: Blob) => {
        setProcessingImage(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            const base64Data = base64String.split(',')[1];
            
            if (aiImages.length < 5) {
                setAiImages(prev => [...prev, base64Data]);
            }
            
            setImgToCrop(null);
            setTimeout(() => setProcessingImage(false), 500); // Fake delay for UX
        };
        reader.readAsDataURL(blob);
    };

    const removeImage = (index: number) => {
        setAiImages(prev => prev.filter((_, i) => i !== index));
    };

    // AI GENERATION LOGIC
    const generateAiQuestions = async () => {
        if (aiMode === 'TOPIC' && !aiTopic) return alert("Please enter a topic.");
        if (aiMode === 'SCAN' && aiImages.length === 0) return alert("Please upload at least one page.");
        
        setIsGeneratingAi(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const model = 'gemini-2.5-flash';
            
            const requestCount = aiCount + 3; // Request a few extra
            const parts: any[] = [];
            
            let promptText = `Generate ${requestCount} multiple choice questions.
            Language: ${aiLang}.
            Provide the output in JSON format with 'text', 'options' (array of 4 strings), 'correctOptionIndex' (0-3 number), and 'marks' (default 1).`;

            if (aiLevel === 'From Book Only') {
                promptText += ` STRICT INSTRUCTION: Generate questions ONLY using the text content found in the provided images. Do NOT use outside knowledge.`;
            } else {
                promptText += ` The questions should be appropriate for ${aiLevel} level students.`;
            }

            if (aiMode === 'SCAN') {
                aiImages.forEach(imgData => {
                    parts.push({
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: imgData
                        }
                    });
                });
                promptText += ` Analyze the images thoroughly. Focus on key facts, definitions, and concepts found in the text.`;
            } else {
                promptText += ` The topic is: "${aiTopic}".`;
            }

            parts.push({ text: promptText });

            const response = await ai.models.generateContent({
                model: model,
                contents: { parts: parts },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correctOptionIndex: { type: Type.INTEGER },
                                marks: { type: Type.INTEGER }
                            }
                        }
                    }
                }
            });

            const generatedData = JSON.parse(response.text || '[]');
            
            if (Array.isArray(generatedData) && generatedData.length > 0) {
                const formattedQuestions: Question[] = generatedData.map((q: any) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    text: q.text,
                    options: q.options,
                    correctOptionIndex: q.correctOptionIndex,
                    marks: q.marks || 1
                }));

                setGeneratedQuestions(formattedQuestions);
                setSelectedQIndices(generatedData.slice(0, aiCount).map((_, i) => i));
                setReviewingAi(true); 
                setShowAiModal(false);
            } else {
                alert("AI could not generate valid questions. Try a different topic/image.");
            }

        } catch (error: any) {
            if (error.message && error.message.includes('429')) {
                setCooldownTime(60);
            } else {
                alert("AI Generation failed. Please try again.");
            }
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const confirmAiSelection = () => {
        const selected = generatedQuestions.filter((_, i) => selectedQIndices.includes(i));
        if (questions.length === 1 && !questions[0].text) {
            setQuestions(selected);
        } else {
            setQuestions(prev => [...prev, ...selected]);
        }
        setReviewingAi(false);
        setGeneratedQuestions([]);
        setAiTopic('');
        setAiImages([]);
    };

    const toggleAiSelection = (idx: number) => {
        if (selectedQIndices.includes(idx)) setSelectedQIndices(prev => prev.filter(i => i !== idx));
        else setSelectedQIndices(prev => [...prev, idx]);
    };

    if (imgToCrop) {
        return <ImageCropper imageSrc={imgToCrop} onCrop={onCropComplete} onCancel={() => setImgToCrop(null)} />;
    }

    if (viewingResultId) {
        const currentExam = exams.find(e => e.id === viewingResultId);
        return (
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => setViewingResultId(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <ChevronRight className="w-6 h-6 rotate-180"/>
                    </button>
                    <div>
                        <h3 className="font-bold text-xl dark:text-white">{currentExam?.title} - Rank List</h3>
                        <p className="text-xs text-slate-500">{rankList.length} Submissions</p>
                    </div>
                </div>
                <GlassCard className="p-0 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase">
                            <tr><th className="p-3">Rank</th><th className="p-3">Student</th><th className="p-3 text-right">Score</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {rankList.map((sub, idx) => (
                                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="p-3 font-bold text-slate-500 w-12 text-center">{idx + 1}</td>
                                    <td className="p-3"><p className="font-bold dark:text-white">{sub.studentName}</p><p className="text-[10px] text-slate-400">Roll: {sub.rollNo}</p></td>
                                    <td className="p-3 text-right font-mono font-bold text-blue-600">{sub.score} / {sub.totalMarks}</td>
                                </tr>
                            ))}
                            {rankList.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-slate-400">No submissions yet</td></tr>}
                        </tbody>
                    </table>
                </GlassCard>
            </div>
        );
    }

    if (creating) {
        return (
            <div className="max-w-3xl mx-auto animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl dark:text-white">Create Exam</h3>
                    <GlassButton variant="secondary" onClick={() => setCreating(false)}>Cancel</GlassButton>
                </div>

                <GlassCard className="mb-6 border-t-4 border-t-blue-600">
                    <div className="space-y-4">
                        <GlassInput placeholder="Exam Title" value={title} onChange={e => setTitle(e.target.value)} />
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Start Time</label><GlassInput type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">End Time</label><GlassInput type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Duration (Min)</label><GlassInput type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} /></div>
                        </div>
                        <label className="flex items-center gap-2 pt-2"><input type="checkbox" className="w-4 h-4" checked={settings.shuffleQuestions} onChange={e => setSettings({...settings, shuffleQuestions: e.target.checked})}/><span className="text-xs font-bold text-slate-600 dark:text-slate-300">Shuffle Questions</span></label>
                    </div>
                </GlassCard>

                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300">Questions ({questions.length})</h4>
                    <button 
                        onClick={() => setShowAiModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Sparkles className="w-4 h-4 text-yellow-300"/> AI Auto-Generate
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    {questions.map((q, qIdx) => (
                        <GlassCard key={q.id} className="relative">
                            <div className="absolute top-2 right-2 text-slate-300 font-bold text-6xl opacity-20">{qIdx + 1}</div>
                            <div className="mb-4 pr-12">
                                <GlassInput placeholder="Question" value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)} className="font-bold mb-2"/>
                                <div className="flex gap-2">
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className={`flex-1 flex items-center gap-2 p-2 rounded border ${q.correctOptionIndex === oIdx ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                            <input type="radio" name={`q-${q.id}`} checked={q.correctOptionIndex === oIdx} onChange={() => updateQuestion(qIdx, 'correct', oIdx)} className="accent-green-600"/>
                                            <input className="w-full bg-transparent outline-none text-sm" placeholder={`Option ${oIdx+1}`} value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-3">
                                <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-500">Marks:</span><input type="number" className="w-12 bg-slate-100 dark:bg-slate-700 rounded p-1 text-center text-sm font-bold" value={q.marks} onChange={e => updateQuestion(qIdx, 'marks', parseInt(e.target.value))} /></div>
                                <button onClick={() => removeQuestion(qIdx)} className="text-xs text-red-500 hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3"/> Remove</button>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                <div className="flex gap-4 sticky bottom-4 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
                    <button onClick={addQuestion} className="flex-1 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"><Plus className="w-5 h-5"/> Add Question</button>
                    <GlassButton onClick={handleCreateExam} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">{loading ? 'Saving...' : 'Review & Schedule'}</GlassButton>
                </div>

                {/* AI MODAL */}
                {showAiModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 animate-fade-in-up">
                        <GlassCard className="max-w-md w-full relative border-t-4 border-t-purple-500 overflow-hidden flex flex-col max-h-[90vh]">
                            <button onClick={() => {setShowAiModal(false); setAiImages([]);}} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5"/></button>
                            
                            <div className="text-center pt-4 pb-2">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-pulse"/>
                                </div>
                                <h3 className="text-lg font-bold dark:text-white">AI Question Generator</h3>
                            </div>

                            {/* TABS */}
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 mx-4 rounded-xl mb-4">
                                <button onClick={() => setAiMode('SCAN')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${aiMode === 'SCAN' ? 'bg-white dark:bg-slate-700 shadow text-purple-600' : 'text-slate-500'}`}>
                                    <ScanLine className="w-4 h-4"/> Scan from Book
                                </button>
                                <button onClick={() => setAiMode('TOPIC')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${aiMode === 'TOPIC' ? 'bg-white dark:bg-slate-700 shadow text-purple-600' : 'text-slate-500'}`}>
                                    <TypeIcon className="w-4 h-4"/> Enter Topic
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                                
                                {aiMode === 'SCAN' ? (
                                    <>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[0, 1, 2, 3, 4].map((idx) => {
                                                const hasImage = aiImages[idx];
                                                return (
                                                    <div key={idx} className="aspect-[3/4] relative group">
                                                        {hasImage ? (
                                                            <>
                                                                <img src={`data:image/jpeg;base64,${hasImage}`} className="w-full h-full object-cover rounded-lg border-2 border-purple-500"/>
                                                                <button onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"><X className="w-3 h-3"/></button>
                                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1 rounded-b-lg">Page {idx + 1}</div>
                                                            </>
                                                        ) : (
                                                            <label className="w-full h-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/50">
                                                                <Camera className="w-6 h-6 text-slate-400 mb-1"/>
                                                                <span className="text-[10px] font-bold text-slate-500">Page {idx + 1}</span>
                                                                <input type="file" accept="image/*" className="hidden" onChange={handleCropSelect} />
                                                            </label>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="text-[10px] text-slate-400 text-center">Click a box to upload & crop textbook pages.</p>
                                    </>
                                ) : (
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Topic Name</label>
                                        <GlassInput placeholder="e.g. Photosynthesis, Mughal Empire" value={aiTopic} onChange={e => setAiTopic(e.target.value)} />
                                        <p className="text-[10px] text-slate-400 mt-2">AI will generate questions based on this topic.</p>
                                    </div>
                                )}

                                <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Language</label><GlassSelect value={aiLang} onChange={e => setAiLang(e.target.value)}><option value="Malayalam">Malayalam</option><option value="English">English</option><option value="Arabic">Arabic</option><option value="Arabi-Malayalam">Arabi-Malayalam</option><option value="Hindi">Hindi</option></GlassSelect></div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Level</label>
                                        <GlassSelect value={aiLevel} onChange={e => setAiLevel(e.target.value)}>
                                            <option value="From Book Only">From Book Only (Strict)</option>
                                            <option value="LKG">LKG</option>
                                            <option value="UKG">UKG</option>
                                            <option value="LP School">LP School (1-4)</option>
                                            <option value="UP School">UP School (5-7)</option>
                                            <option value="High School">High School (8-10)</option>
                                            <option value="HSS">Higher Secondary (+1/+2)</option>
                                            <option value="UG">Undergraduate (Degree)</option>
                                            <option value="PG">Postgraduate (PG)</option>
                                            <option value="Madrassa">Madrassa</option>
                                        </GlassSelect>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Questions</label>
                                    <div className="flex items-center gap-2">
                                        <input type="range" min="3" max="50" value={aiCount} onChange={e => setAiCount(parseInt(e.target.value))} className="flex-1 accent-purple-600"/>
                                        <span className="text-sm font-bold w-8">{aiCount}</span>
                                    </div>
                                </div>

                                <GlassButton 
                                    onClick={generateAiQuestions} 
                                    disabled={isGeneratingAi || cooldownTime > 0} 
                                    className={`w-full py-3 shadow-lg ${cooldownTime > 0 ? 'bg-red-500' : 'bg-purple-600 hover:bg-purple-700'}`}
                                >
                                    {cooldownTime > 0 ? `Wait ${cooldownTime}s` : isGeneratingAi ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/> Thinking...</> : 'Generate Questions'}
                                </GlassButton>
                            </div>
                            
                            {/* Processing Overlay */}
                            {processingImage && (
                                <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
                                        <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                                    </div>
                                    <p className="mt-4 font-bold text-slate-700 dark:text-white">Analyzing Image...</p>
                                </div>
                            )}
                        </GlassCard>
                    </div>
                )}

                {/* REVIEW AI MODAL */}
                {reviewingAi && (
                    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/90 p-4 animate-fade-in-up">
                        <GlassCard className="max-w-2xl w-full h-[80vh] flex flex-col p-0 relative border-t-4 border-t-purple-500">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-between items-center">
                                <div><h3 className="font-bold text-lg dark:text-white">Select Questions</h3><p className="text-xs text-slate-500">{selectedQIndices.length} Selected</p></div>
                                <button onClick={() => setReviewingAi(false)} className="text-slate-400 hover:text-red-500 font-bold">Discard</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
                                {generatedQuestions.map((q, idx) => (
                                    <div key={idx} onClick={() => toggleAiSelection(idx)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedQIndices.includes(idx) ? 'border-purple-500 bg-white dark:bg-slate-900 shadow-md' : 'border-transparent bg-slate-100 dark:bg-slate-900/50 opacity-70'}`}>
                                        <div className="flex justify-between gap-2">
                                            <div className="flex-1"><p className="font-bold text-sm text-slate-800 dark:text-white mb-2">{q.text}</p><div className="grid grid-cols-2 gap-2">{q.options.map((o, i) => <div key={i} className={`text-xs px-2 py-1 rounded ${i === q.correctOptionIndex ? 'bg-green-100 text-green-800 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{o}</div>)}</div></div>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${selectedQIndices.includes(idx) ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-400'}`}>{selectedQIndices.includes(idx) && <Check className="w-4 h-4"/>}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-end">
                                <GlassButton onClick={confirmAiSelection} className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">Confirm Selection</GlassButton>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl dark:text-white">Exams</h3>
                <GlassButton onClick={() => setCreating(true)} className="flex items-center gap-2"><Plus className="w-4 h-4"/> New Exam</GlassButton>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                {exams.map(exam => (
                    <GlassCard key={exam.id} className="relative overflow-hidden group">
                        <h4 className="font-bold text-lg dark:text-white mb-1">{exam.title}</h4>
                        <p className="text-xs text-slate-500 mb-4">{exam.questions.length} Questions • {exam.durationMinutes} Mins</p>
                        <div className="flex gap-2">
                            <button onClick={() => handleDelete(exam.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                            <button onClick={() => loadResults(exam.id)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-xs font-bold py-2 rounded-lg hover:bg-slate-200">Results</button>
                        </div>
                    </GlassCard>
                ))}
                {exams.length === 0 && <div className="col-span-full text-center py-12 text-slate-400">No exams yet.</div>}
            </div>
        </div>
    );
};

export default ExamsTab;
