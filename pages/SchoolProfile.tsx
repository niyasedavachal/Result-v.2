
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { SchoolProfile, AdCampaign, CampusPost, Role } from '../types';
import { Loader2, MapPin, Users, GraduationCap, Building2, CheckCircle, Search, ShieldCheck, Crown, ExternalLink, Megaphone, MessageCircle, Heart, Lock, Share2, Copy, Instagram, Linkedin, User, QrCode, ArrowRight, Info, X, Quote, Sparkles, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { GlassButton, GlassCard } from '../components/GlassUI';

const SchoolProfilePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<SchoolProfile | null>(null);
    const [ad, setAd] = useState<AdCampaign | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Live Activity State
    const [liveCount, setLiveCount] = useState(0);
    
    // Feed State
    const [posts, setPosts] = useState<CampusPost[]>([]);

    // Share Feedback
    const [copied, setCopied] = useState(false);
    
    // Ad Info State
    const [showAdInfo, setShowAdInfo] = useState(false);

    // Auth Context for "Return to Dashboard"
    const [userRole, setUserRole] = useState<string | null>(null);
    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        if (slug) {
            loadProfile(slug);
            loadRandomAd();
        }
        
        // Check Auth Status
        const storedId = localStorage.getItem('school_id');
        const role = localStorage.getItem('user_role'); // Assuming you store role somewhere, or check auth state
        // Simple check: If 'school_id' in localstorage matches the loaded school, show dashboard link
        if (storedId) {
            // We verify matching ID after profile loads
        }
    }, [slug]);

    useEffect(() => {
        if (profile) {
            loadPosts(profile.id);
            const storedId = localStorage.getItem('school_id');
            // Allow return to dashboard if local school ID matches profile ID
            if (storedId === profile.id) {
                setCanEdit(true);
                // Determine destination based on URL history or default
                // For now, simpler is just check if we have a role in memory or just send to /login which auto-redirects
            }
        }
    }, [profile]);

    // Live Count Simulation
    useEffect(() => {
        if (!profile) return;
        const base = Math.max(1, Math.floor(profile.stats.students * 0.05));
        setLiveCount(base);
        const interval = setInterval(() => {
            setLiveCount(prev => {
                const change = Math.floor(Math.random() * 5) - 2; 
                return Math.max(1, prev + change);
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [profile]);

    const loadProfile = async (s: string) => {
        setLoading(true);
        const data = await api.getSchoolPublicProfile(s);
        setProfile(data);
        setLoading(false);
    };

    const loadRandomAd = async () => {
        const campaign = await api.getRandomActiveAd();
        setAd(campaign);
    };

    const loadPosts = async (schoolId: string) => {
        const feed = await api.getCampusPosts(schoolId, 'NOTICE');
        setPosts(feed);
    };

    const handleShareProfile = async () => {
        if (!profile) return;
        const shareUrl = window.location.href; 
        const shareData = {
            title: profile.name,
            text: `Check out ${profile.name} on SchoolResult Pro!`,
            url: shareUrl
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) { copyToClipboard(shareUrl); }
        } else {
            copyToClipboard(shareUrl);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDashboardReturn = () => {
        // Since /login automatically redirects logged-in users to their dashboard,
        // we can simply navigate there.
        navigate('/login');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-blue-500"/></div>;
    if (!profile) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">School Not Found</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans selection:bg-blue-500/30">
            
            {/* FLOATING RETURN BUTTON (If Logged In) */}
            {canEdit && (
                <div className="fixed top-4 left-4 z-50 animate-fade-in-up">
                    <button 
                        onClick={handleDashboardReturn}
                        className="bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 hover:bg-black transition-all border border-white/20 font-bold text-sm"
                    >
                        <ArrowLeft className="w-4 h-4"/> Return to Dashboard
                    </button>
                </div>
            )}

            {/* POST-MODERN BENTO GRID LAYOUT */}
            <div className="max-w-7xl mx-auto p-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-min">
                    
                    {/* 1. HERO BOX (Span 3 cols) */}
                    <div className="md:col-span-3 row-span-2 relative h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden group">
                        {profile.coverPhoto ? (
                            <img src={profile.coverPhoto} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className={`w-full h-full bg-gradient-to-br from-${profile.themeColor}-900 to-slate-900`}></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 p-8 w-full">
                            <div className="flex items-end gap-6">
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-2xl flex-shrink-0">
                                    {profile.logoUrl ? <img src={profile.logoUrl} className="w-full h-full object-contain rounded-xl"/> : <Building2 className="w-full h-full text-white/50"/>}
                                </div>
                                <div className="mb-2">
                                    <h1 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight mb-2 shadow-lg">{profile.name}</h1>
                                    <p className="text-white/80 flex items-center gap-2 text-sm md:text-base font-medium">
                                        <MapPin className="w-4 h-4 text-red-400"/> {profile.place || 'Kerala, India'}
                                        {profile.isPro && <span className="bg-yellow-500/20 text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-500/50 flex items-center gap-1"><Crown className="w-3 h-3"/> VERIFIED CAMPUS</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Live Activity Pill */}
                        <div className="absolute top-6 left-6 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            {liveCount} viewing now
                        </div>

                        {/* Share Button */}
                        <button onClick={handleShareProfile} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white transition-all">
                            {copied ? <CheckCircle className="w-5 h-5 text-green-400"/> : <Share2 className="w-5 h-5"/>}
                        </button>
                    </div>

                    {/* 2. STATS BOX */}
                    <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-center gap-6 shadow-sm">
                        <div className="text-center">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Students</p>
                            <h3 className="text-4xl font-black text-slate-800 dark:text-white">{profile.stats.students}</h3>
                        </div>
                        <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>
                        <div className="text-center">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Classes</p>
                            <h3 className="text-4xl font-black text-slate-800 dark:text-white">{profile.stats.teachers}</h3>
                        </div>
                        <button 
                            onClick={() => navigate(`/register?schoolId=${profile.id}`)}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                        >
                            <GraduationCap className="w-5 h-5"/> Admission
                        </button>
                    </div>

                    {/* 3. ABOUT BOX */}
                    <div className="md:col-span-1 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] p-6 border border-blue-100 dark:border-blue-900/30">
                        <Quote className="w-8 h-8 text-blue-300 mb-2 fill-current opacity-50"/>
                        <p className="text-sm text-slate-600 dark:text-blue-100 leading-relaxed font-medium">
                            {profile.description || "A premier educational institution dedicated to academic excellence and holistic development."}
                        </p>
                    </div>

                    {/* 4. RESULT CHECKER (Important) */}
                    <div onClick={() => navigate('/result')} className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-blue-500/20 transition-transform hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform group-hover:scale-110 duration-700">
                            <Search className="w-32 h-32 text-white"/>
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold mb-4 backdrop-blur-md">STUDENT PORTAL</div>
                                <h2 className="text-3xl font-black mb-2">Check Results</h2>
                                <p className="opacity-80 max-w-sm text-sm">View your academic performance, download marklists, and track progress instantly.</p>
                            </div>
                            <div className="flex items-center gap-2 font-bold mt-6">
                                <span>Open Portal</span> <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                            </div>
                        </div>
                    </div>

                    {/* 5. NOTICE BOARD (Feed) */}
                    <div className="md:col-span-2 row-span-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                <Megaphone className="w-5 h-5 text-red-500"/> Campus Buzz
                            </h3>
                            <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">{posts.length} Posts</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[300px]">
                            {posts.length > 0 ? posts.map(post => (
                                <div key={post.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-300">
                                                {post.authorName[0]}
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{post.authorName}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{post.title}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{post.message}</p>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-slate-400 text-xs">
                                    No updates yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 6. HALL OF FAME (Top Students) */}
                    <div className="md:col-span-2 bg-slate-900 text-white rounded-[2rem] p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 blur-[50px] rounded-full"></div>
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
                            <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400"/> Hall of Fame
                        </h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                            {profile.students.map((stu) => (
                                <div key={stu.id} className="text-center group">
                                    <div className="w-16 h-16 mx-auto rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 to-transparent mb-2">
                                        <img 
                                            src={stu.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stu.name}`} 
                                            className="w-full h-full rounded-full object-cover border-2 border-slate-900 bg-slate-800"
                                        />
                                    </div>
                                    <p className="text-xs font-bold truncate px-1">{stu.name}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{stu.className}</p>
                                    
                                    {stu.socialLinks && (
                                        <div className="flex justify-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {stu.socialLinks.instagram && <a href={stu.socialLinks.instagram} target="_blank" className="text-pink-400 hover:scale-110 transition-transform"><Instagram className="w-3 h-3"/></a>}
                                            {stu.socialLinks.linkedin && <a href={stu.socialLinks.linkedin} target="_blank" className="text-blue-400 hover:scale-110 transition-transform"><Linkedin className="w-3 h-3"/></a>}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {profile.students.length === 0 && <p className="col-span-full text-center text-xs text-slate-500">Top students will appear here.</p>}
                        </div>
                    </div>

                    {/* 7. AD SPACE (Premium Spot) */}
                    {ad && (
                        <div className="md:col-span-1 row-span-2 relative group cursor-pointer" onClick={() => window.open(ad.targetUrl, '_blank')}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 rounded-[2rem]"></div>
                            <img src={ad.imageUrl} className="w-full h-full object-cover rounded-[2rem] transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute bottom-4 left-4 z-20">
                                <span className="bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded mb-2 inline-block">SPONSORED</span>
                                <p className="text-white text-xs font-medium leading-tight">Check out this offer</p>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowAdInfo(!showAdInfo); }}
                                className="absolute top-4 right-4 z-20 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                            >
                                <Info className="w-3 h-3"/>
                            </button>
                            {showAdInfo && (
                                <div className="absolute inset-0 z-30 bg-black/90 p-6 flex flex-col justify-center items-center text-center rounded-[2rem] animate-fade-in-up">
                                    <p className="text-white font-bold mb-2">Advertisement</p>
                                    <p className="text-xs text-slate-400 mb-4">This ad helps keep SchoolResult Pro free for schools.</p>
                                    <button onClick={(e) => {e.stopPropagation(); navigate('/advertise');}} className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full">
                                        Place Your Ad Here
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 8. FACULTY */}
                    <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-400"/> Faculty & Staff
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                            {profile.teachers.map(teacher => (
                                <div key={teacher.id} className="min-w-[140px] p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center hover:shadow-md transition-shadow">
                                    {teacher.photo ? (
                                        <img src={teacher.photo} className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-white dark:border-slate-700 shadow-sm"/>
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-3 flex items-center justify-center text-slate-400">
                                            <User className="w-8 h-8"/>
                                        </div>
                                    )}
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{teacher.name}</h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{teacher.className}</p>
                                </div>
                            ))}
                            {profile.teachers.length === 0 && <p className="text-xs text-slate-400 w-full text-center">Faculty list not updated.</p>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SchoolProfilePage;
