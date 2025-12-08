
import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton, GlassInput } from '../components/GlassUI';
import { Megaphone, CheckCircle, UploadCloud, Link as LinkIcon, Smartphone, CreditCard, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdvertisePage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ contactInfo: '', targetUrl: '', });
    const [adImage, setAdImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [adPrice, setAdPrice] = useState('499');
    const [adOffer, setAdOffer] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await api.getGlobalSettings();
            if (settings['AD_BASE_PRICE']) setAdPrice(settings['AD_BASE_PRICE']);
            if (settings['AD_OFFER_TEXT']) setAdOffer(settings['AD_OFFER_TEXT']);
        };
        fetchSettings();
    }, []);

    const handleUploadAndPay = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adImage) return alert("Please upload an ad banner.");
        setLoading(true);
        const uploadRes = await api.uploadImage(adImage, 'ads');
        if (uploadRes.success && uploadRes.publicUrl) {
            setTimeout(async () => {
                const res = await api.createSelfServiceAd(uploadRes.publicUrl!, formData.targetUrl, formData.contactInfo);
                setLoading(false);
                if (res.success) setSuccess(true);
                else alert("Failed to create ad: " + res.message);
            }, 2000);
        } else {
            setLoading(false);
            alert("Image upload failed");
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
                <GlassCard className="max-w-md w-full text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-600"/></div>
                    <h2 className="text-2xl font-bold mb-2">Ad Live Successfully!</h2>
                    <p className="text-slate-500 mb-8">Your ad campaign has been launched across our school network.</p>
                    <GlassButton onClick={() => navigate('/')} className="w-full">Back Home</GlassButton>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 py-12 relative">
             <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"><ArrowLeft className="w-6 h-6 text-white"/></button>
             <div className="max-w-4xl mx-auto">
                 <div className="text-center mb-12">
                     <div className="inline-flex p-4 bg-purple-500/20 rounded-full mb-4 ring-4 ring-purple-500/10"><Megaphone className="w-10 h-10 text-purple-400"/></div>
                     <h1 className="text-4xl md:text-5xl font-black mb-4">One Ad. Network-wide Reach.</h1>
                     <p className="text-lg text-slate-400 max-w-2xl mx-auto">Don't just advertise locally. Promote your business on <b>500+ School Result Portals</b> instantly.</p>
                 </div>
                 <div className="grid md:grid-cols-2 gap-8">
                     <div className="order-2 md:order-1">
                         <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
                             <div className="flex items-center gap-3 mb-4 border-b pb-4"><div className="w-10 h-10 bg-blue-100 rounded-full"></div><div><div className="h-3 w-32 bg-slate-200 rounded mb-1"></div><div className="h-2 w-20 bg-slate-100 rounded"></div></div></div>
                             <div className="aspect-[4/5] bg-slate-100 rounded-xl mb-4 overflow-hidden relative group">
                                  {adImage ? <img src={URL.createObjectURL(adImage)} className="w-full h-full object-cover"/> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-400"><UploadCloud className="w-12 h-12 mb-2"/><span className="text-sm font-bold">Your Ad Banner</span><span className="text-[10px]">Mobile Optimized (400x500px, &lt; 300KB)</span></div>}
                             </div>
                             <div className="h-3 w-full bg-slate-100 rounded mb-2"></div><div className="h-3 w-2/3 bg-slate-100 rounded"></div>
                         </div>
                         <p className="text-center text-xs text-slate-500 mt-4">Preview of how your ad appears on school pages</p>
                     </div>
                     <div className="order-1 md:order-2">
                         <GlassCard className="bg-slate-800/50 border-slate-700">
                             <div className="mb-6 flex justify-between items-center"><div><h3 className="font-bold text-xl mb-1">Self-Service Portal</h3><p className="text-sm text-slate-400">Launch your campaign in 2 minutes.</p></div>{adOffer && <div className="bg-yellow-500 text-black text-xs font-black px-2 py-1 rounded animate-pulse">{adOffer}</div>}</div>
                             <form onSubmit={handleUploadAndPay} className="space-y-4">
                                 <div>
                                     <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">1. Upload Ad Banner</label>
                                     <div className="flex items-center gap-2">
                                         <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg px-4 py-3 w-full text-center text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                             <UploadCloud className="w-4 h-4"/>{adImage ? adImage.name : 'Choose Image File'}<input type="file" className="hidden" accept="image/*" onChange={e => setAdImage(e.target.files?.[0] || null)} required/>
                                         </label>
                                     </div>
                                     <p className="text-[10px] text-slate-500 mt-1">Recommended size: 800x1000px or smaller.</p>
                                 </div>
                                 <div><label className="text-xs font-bold uppercase text-slate-400 mb-1 block">2. Target Link</label><div className="relative"><LinkIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500"/><input className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="https://your-website.com or WhatsApp Link" value={formData.targetUrl} onChange={e => setFormData({...formData, targetUrl: e.target.value})} required/></div></div>
                                 <div><label className="text-xs font-bold uppercase text-slate-400 mb-1 block">3. Your Contact Info</label><div className="relative"><Smartphone className="absolute left-3 top-3 w-4 h-4 text-slate-500"/><input className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Phone Number / Email" value={formData.contactInfo} onChange={e => setFormData({...formData, contactInfo: e.target.value})} required/></div></div>
                                 <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 my-4"><div className="flex justify-between items-center mb-2"><span className="text-sm text-slate-400">Network-wide Reach</span><span className="font-bold">₹{adPrice}</span></div><div className="flex justify-between items-center text-sm"><span className="text-slate-400">Platform Fee</span><span className="font-bold text-green-400">Free</span></div><div className="border-t border-slate-700 my-2 pt-2 flex justify-between items-center text-lg font-bold text-white"><span>Total</span><span>₹{adPrice}</span></div></div>
                                 <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]">{loading ? <Loader2 className="animate-spin w-5 h-5"/> : <><CreditCard className="w-5 h-5"/> Pay & Launch</>}</button>
                                 <p className="text-center text-[10px] text-slate-500">Secured by Stripe / Razorpay</p>
                             </form>
                         </GlassCard>
                     </div>
                 </div>
             </div>
        </div>
    );
};

export default AdvertisePage;
