
import { supabase } from '../supabaseClient';
import { SystemStats, InactiveSchool, Feedback, PricingPlan, AdCampaign, CampusPost, Affiliate } from '../../types';
import { getSchoolId, getErrorMsg } from '../utils';

// ... (Other functions like createAffiliate, getAffiliateStats, getSystemStats, getInactiveSchools etc. remain unchanged) ...
export const createAffiliate = async (data: { name: string, email: string, phone: string, code: string }) => {
    const { error } = await supabase.from('affiliates').insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        code: data.code.toUpperCase(),
        earnings: 0,
        schools_referred: 0
    }]);
    
    if (error) {
        if(error.code === '23505') return { success: false, message: "Code already taken. Try another." };
        return { success: false, message: getErrorMsg(error) };
    }
    return { success: true, code: data.code.toUpperCase() };
};

export const getAffiliateStats = async (email: string, code: string) => {
    const { data, error } = await supabase.from('affiliates')
      .select('*')
      .eq('email', email)
      .eq('code', code.toUpperCase())
      .maybeSingle();
    
    if (error) return { success: false, message: getErrorMsg(error) };
    if (!data) return { success: false, message: "Invalid Email or Code. Please check." };
    
    return { success: true, affiliate: {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        code: data.code,
        earnings: data.earnings || 0,
        schoolsReferred: data.schools_referred || 0,
        bankDetails: data.bank_details,
        createdAt: data.created_at
    } as Affiliate };
};

export const getSystemStats = async (): Promise<SystemStats | null> => {
    const { data, error } = await supabase.rpc('get_system_stats');
    if (error) { console.error(error); return null; }
    if (Array.isArray(data)) {
        return data.length > 0 ? data[0] : null;
    }
    return data || null;
};

export const getInactiveSchools = async (): Promise<InactiveSchool[]> => {
    const { data, error } = await supabase.rpc('get_inactive_schools');
    if (error) return [];
    return data;
};

export const getSystemHealth = async () => {
    const { count: ghosts } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_verified', false).lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    const { count: drafts } = await supabase.from('classes').select('*', { count: 'exact', head: true }).eq('status', 'DRAFT').lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    const { count: oldLogs } = await supabase.from('assessment_logs').select('*', { count: 'exact', head: true }).lt('date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());
    const { count: inactiveSchools } = await supabase.from('schools').select('*', { count: 'exact', head: true }).lt('last_active_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

    return {
        ghosts: ghosts || 0,
        drafts: drafts || 0,
        oldLogs: oldLogs || 0,
        inactiveSchools: inactiveSchools || 0
    };
};

export const performMaintenance = async (tool: 'GHOST_BUSTER' | 'DRAFT_SHREDDER' | 'LOG_ROTATOR' | 'DEEP_CLEAN') => {
    let error = null;
    let message = '';

    if (tool === 'GHOST_BUSTER') {
        const res = await supabase.from('students').delete().eq('is_verified', false).lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        error = res.error;
        message = "Ghost students removed.";
    }
    else if (tool === 'DRAFT_SHREDDER') {
        const res = await supabase.from('classes').delete().eq('status', 'DRAFT').lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        error = res.error;
        message = "Old draft classes shredded.";
    }
    else if (tool === 'LOG_ROTATOR') {
        const res = await supabase.from('assessment_logs').delete().lt('date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());
        error = res.error;
        message = "Old assessment logs cleared.";
    }
    else if (tool === 'DEEP_CLEAN') {
        const res = await supabase.from('schools').delete().lt('last_active_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());
        error = res.error;
        message = "Inactive schools & data deep cleaned.";
    }

    return { success: !error, message: error ? getErrorMsg(error) : message };
};

export const cleanupJunkData = async (type: 'INACTIVE_SCHOOLS' | 'DRAFT_CLASSES') => {
    if (type === 'INACTIVE_SCHOOLS') return performMaintenance('DEEP_CLEAN');
    if (type === 'DRAFT_CLASSES') return performMaintenance('DRAFT_SHREDDER');
    return { success: false };
};

export const sendWarningToSchool = async (schoolId: string) => {
    await new Promise(r => setTimeout(r, 800)); 
    return { success: true };
};

export const pauseSchool = async (schoolId: string, currentStatus: boolean) => {
    const { error } = await supabase.from('schools').update({ is_paused: !currentStatus }).eq('id', schoolId);
    return { success: !error };
};

export const getSystemFeedback = async (): Promise<Feedback[]> => {
    const { data } = await supabase.from('system_feedback').select('*').order('created_at', { ascending: false });
    return (data || []).map((f: any) => ({
        id: f.id,
        schoolId: f.school_id,
        schoolName: f.school_name,
        message: f.message,
        type: f.type,
        status: f.status,
        createdAt: f.created_at
    }));
};

export const createSystemFeedback = async (msg: string, type: 'BUG'|'FEATURE'|'SUPPORT', schoolName: string, errorDetails?: any) => {
    const finalMsg = errorDetails ? `${msg} \nDetails: ${JSON.stringify(errorDetails)}` : msg;
    const schoolId = getSchoolId();
    
    const { error } = await supabase.from('system_feedback').insert([{
        school_id: schoolId || null, 
        school_name: schoolName,
        message: finalMsg,
        type,
        status: 'OPEN'
    }]);
    return { success: !error };
};

export const resolveFeedback = async (id: string) => {
    const { error } = await supabase.from('system_feedback').update({ status: 'RESOLVED' }).eq('id', id);
    return { success: !error };
};

export const getPricingPlans = async (): Promise<PricingPlan[]> => {
    const { data } = await supabase.from('pricing_plans').select('*').order('selling_price', { ascending: true });
    if (!data) return [];
    return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        originalPrice: p.original_price,
        sellingPrice: p.selling_price,
        discountPercent: p.discount_percent,
        features: p.features,
        isPopular: p.is_popular,
        seatsLeft: p.seats_left,
        offerEndsAt: p.offer_ends_at
    }));
};

export const updatePricingPlan = async (plan: PricingPlan) => {
    const { error } = await supabase.from('pricing_plans').update({
        name: plan.name,
        original_price: plan.originalPrice,
        selling_price: plan.sellingPrice,
        discount_percent: plan.discountPercent,
        seats_left: plan.seatsLeft,
        is_popular: plan.isPopular,
        offer_ends_at: plan.offerEndsAt
    }).eq('id', plan.id);
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};

export const createAdCampaign = async (imageUrl: string, targetUrl: string) => {
    const { error } = await supabase.from('ad_campaigns').insert([{
        image_url: imageUrl,
        target_url: targetUrl,
        is_active: true
    }]);
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};

export const createSelfServiceAd = async (imageUrl: string, targetUrl: string, contactInfo: string) => {
    const { error } = await supabase.from('ad_campaigns').insert([{
        image_url: imageUrl,
        target_url: targetUrl,
        contact_info: contactInfo,
        is_active: true, 
        status: 'ACTIVE'
    }]);
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};

export const getAdCampaigns = async (): Promise<AdCampaign[]> => {
    const { data } = await supabase.from('ad_campaigns').select('*').order('created_at', { ascending: false });
    return (data || []).map((ad: any) => ({
        id: ad.id,
        imageUrl: ad.image_url,
        targetUrl: ad.target_url,
        isActive: ad.is_active,
        views: ad.views,
        clicks: ad.clicks,
        createdAt: ad.created_at,
        status: ad.status,
        contactInfo: ad.contact_info
    }));
};

export const toggleAdStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('ad_campaigns').update({ is_active: !currentStatus }).eq('id', id);
    return { success: !error };
};

export const deleteAdCampaign = async (id: string) => {
    const { error } = await supabase.from('ad_campaigns').delete().eq('id', id);
    return { success: !error };
};

export const getRandomActiveAd = async (): Promise<AdCampaign | null> => {
     const { data } = await supabase.from('ad_campaigns').select('*').eq('is_active', true);
     if (!data || data.length === 0) return null;
     const randomAd = data[Math.floor(Math.random() * data.length)];
     return {
        id: randomAd.id,
        imageUrl: randomAd.image_url,
        targetUrl: randomAd.target_url,
        isActive: randomAd.is_active,
        views: randomAd.views,
        clicks: randomAd.clicks,
        createdAt: randomAd.created_at
     };
};

export const getCampusPosts = async (schoolId: string, category: 'BUZZ' | 'NOTICE' = 'BUZZ'): Promise<CampusPost[]> => {
    let query = supabase.from('campus_posts')
        .select('*')
        .eq('school_id', schoolId)
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(50);

    // Only fetch scheduled posts that are due or past due
    // NOTE: This relies on DB having correct time or client side filtering. 
    // Supabase allows .lte comparisons.
    query = query.lte('scheduled_at', new Date().toISOString());

    if (category === 'BUZZ') {
        query = query.gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    }

    const { data } = await query;

    return (data || []).map((p: any) => ({
        id: p.id,
        schoolId: p.school_id,
        authorName: p.author_name,
        title: p.title,
        message: p.message,
        type: p.type,
        category: p.category || 'BUZZ',
        likes: p.likes || 0,
        createdAt: p.created_at
    }));
};

export const createCampusPost = async (schoolId: string, author: string, msg: string, type: 'STUDENT' | 'TEACHER' | 'ADMIN', category: 'BUZZ'|'NOTICE' = 'BUZZ', title?: string, scheduledAt?: string) => {
    const { error } = await supabase.from('campus_posts').insert([{
        school_id: schoolId,
        author_name: author,
        message: msg,
        type: type,
        category: category,
        title: title,
        likes: 0,
        scheduled_at: scheduledAt || new Date().toISOString() // Default to now if not provided
    }]);
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};

export const likePost = async (postId: string) => {
    const { error } = await supabase.rpc('like_post', { post_id: postId });
    return { success: !error };
};

export const exportSchoolData = async () => {
    const schoolId = getSchoolId();
    if (!schoolId) return;

    try {
        const { data: classes } = await supabase.from('classes').select('*').eq('school_id', schoolId);
        const { data: students } = await supabase.from('students').select('*').eq('school_id', schoolId);
        const { data: fees } = await supabase.from('fee_structures').select('*').eq('school_id', schoolId);
        
        const studentIds = students?.map(s => s.id) || [];
        let allMarks: any[] = [];
        let allPayments: any[] = [];
        
        if (studentIds.length > 0) {
            const { data: marks } = await supabase.from('marks').select('*').in('student_id', studentIds);
            allMarks = marks || [];
            
            const { data: payments } = await supabase.from('fee_payments').select('*').in('student_id', studentIds);
            allPayments = payments || [];
        }

        const backupData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            schoolId,
            classes,
            students,
            marks: allMarks,
            fees,
            feePayments: allPayments
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SchoolBackup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        return { success: true };
    } catch (e: any) {
        return { success: false, message: getErrorMsg(e) };
    }
};

export const restoreSchoolData = async (jsonData: any) => {
    // This is a complex operation that ideally happens on server-side or via very careful batching.
    // For now, we will simulate a success if structure is valid, or attempt a partial restore for essential tables.
    // Note: Due to Foreign Key constraints, order matters: Classes -> Students -> Marks/Fees.
    
    const schoolId = getSchoolId();
    if (!schoolId || !jsonData || jsonData.schoolId !== schoolId) {
        return { success: false, message: "Invalid backup file or school mismatch." };
    }

    try {
        // 1. Classes
        if (jsonData.classes && jsonData.classes.length > 0) {
             const { error } = await supabase.from('classes').upsert(jsonData.classes);
             if (error) throw error;
        }
        
        // 2. Students
        if (jsonData.students && jsonData.students.length > 0) {
             const { error } = await supabase.from('students').upsert(jsonData.students);
             if (error) throw error;
        }

        // 3. Marks
        if (jsonData.marks && jsonData.marks.length > 0) {
             const { error } = await supabase.from('marks').upsert(jsonData.marks);
             if (error) throw error;
        }
        
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { success: false, message: "Restore Failed: " + e.message };
    }
};

export const updateGlobalSetting = async (key: string, value: string) => {
    const { error } = await supabase.from('app_config').upsert({ key, value });
    return { success: !error };
};
