
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { SchoolConfig, SchoolProfile } from '../../types';
import { getSchoolId, getErrorMsg, compressImage } from '../utils';

export const getSchoolByIdOrSlug = async (identifier: string) => {
    if (!isSupabaseConfigured()) return null;
    try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        if (isUUID) {
             const { data } = await supabase.from('schools').select('id, name, place, logo_url, is_pro, theme_color').eq('id', identifier).maybeSingle();
             if (data) return data;
        }
        return await getSchoolBySlug(identifier);
    } catch (e) { return null; }
};

export const getSchoolBySlug = async (slug: string) => {
    if (!isSupabaseConfigured()) return null;
    try {
        const { data, error } = await supabase.from('schools').select('id, name, place, logo_url, is_pro, theme_color').eq('slug', slug.trim().toLowerCase()).maybeSingle();
        if (error) return null;
        return data;
    } catch (e) { return null; }
};

export const getSchoolByAdmissionToken = async (token: string) => {
    if (!isSupabaseConfigured()) return null;
    try {
        const { data, error } = await supabase.from('schools').select('id, name, allow_public_admission').eq('admission_token', token.trim()).maybeSingle();
        if (error) return null;
        return data;
    } catch (e) { return null; }
};

export const regenerateAdmissionToken = async () => {
    const schoolId = getSchoolId();
    if (!schoolId) return { success: false, message: "Session expired" };
    
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    const token = Array.from(array, dec => dec.toString(36)).join('');

    const { error } = await supabase.from('schools').update({ admission_token: token }).eq('id', schoolId);
    if (error) return { success: false, message: getErrorMsg(error) };
    return { success: true, token };
};

export const updateSchoolSlug = async (slug: string) => {
    const schoolId = getSchoolId();
    if (!schoolId) return { success: false, message: "Session expired" };
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''); 
    if (cleanSlug.length < 3) return { success: false, message: "Code too short" };

    const { data: existing } = await supabase.from('schools').select('id').eq('slug', cleanSlug).maybeSingle();
    if (existing && existing.id !== schoolId) return { success: false, message: "Code taken." };

    const { error } = await supabase.from('schools').update({ slug: cleanSlug }).eq('id', schoolId);
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};

export const findSchoolByEmailOrName = async (query: string) => {
  if (!isSupabaseConfigured()) return [];
  try {
      const { data: slugMatch } = await supabase.from('schools').select('id, name, slug').eq('slug', query.toLowerCase()).maybeSingle();
      if (slugMatch) return [slugMatch];

      const { data: emailMatch } = await supabase.from('schools').select('id, name, slug').eq('admin_email', query.toLowerCase()).maybeSingle();
      if (emailMatch) return [emailMatch];

      const { data: nameMatch } = await supabase.from('schools').select('id, name, slug').ilike('name', `%${query}%`).limit(5);
      return nameMatch || [];
  } catch (e) { return []; }
};

export const getSchoolConfig = async (): Promise<SchoolConfig | null> => {
    // --- DEMO MODE MOCK ---
    if (!isSupabaseConfigured()) {
        const demoData = JSON.parse(localStorage.getItem('demo_school') || '{}');
        return {
            id: 'demo-school-id',
            schoolName: demoData.name || 'Demo School',
            slug: 'demo',
            sheetUrl: '',
            licenseKey: 'DEMO-KEY',
            isPro: true,
            planType: 'PRO',
            themeColor: 'blue',
            adminEmail: demoData.email || 'admin@demo.com',
            phone: '9999999999',
            place: 'Demo City',
            paymentStatus: 'PAID',
            allowTeacherSubjectEdit: true,
            allowPublicAdmission: true,
            admissionConfig: { askPhoto: false, askBloodGroup: false },
            resultDisplayType: 'PASS_FAIL',
            academicYear: '2024-25',
            layoutTemplate: 'STANDARD',
            showPassFailStatus: true,
            showGrades: true,
            showRank: false,
            enableAiRemarks: true,
            enableAiVoice: true,
            enableAiPrediction: true
        } as SchoolConfig;
    }
    // ----------------------

    const schoolId = getSchoolId();
    if (!schoolId) return null;
    try {
        const { data } = await supabase.from('schools').select('*').eq('id', schoolId).single();
        if (!data) return null;
        
        let isPro = data.is_pro || false;
        if (isPro && data.expiry_date) {
            const expiry = new Date(data.expiry_date);
            if (expiry < new Date()) {
                isPro = false;
            }
        }

        return {
            id: data.id,
            schoolName: data.name,
            slug: data.slug,
            sheetUrl: '',
            licenseKey: data.license_key || 'FREE',
            isPro: isPro,
            planType: data.is_pro ? 'PRO' : 'STARTER',
            themeColor: data.theme_color || 'blue',
            logoUrl: data.logo_url,
            expiryDate: data.expiry_date,
            adminEmail: data.admin_email,
            phone: data.phone,
            place: data.place,
            
            pincode: data.pincode,
            district: data.district,
            state: data.state,
            region: data.region,
            
            paymentStatus: data.payment_status || 'FREE',
            transactionRef: data.transaction_ref,
            allowTeacherSubjectEdit: data.allow_teacher_edit ?? true, 
            allowPublicAdmission: data.allow_public_admission ?? true, 
            admissionToken: data.admission_token,
            admissionApprover: data.admission_approver || 'TEACHER',
            admissionConfig: data.admission_config || { askPhoto: false, askBloodGroup: false },
            
            feeManagerRole: data.fee_manager_role || 'ADMIN',

            resultPublishDate: data.result_publish_date,
            scheduledPublishDate: data.scheduled_publish_date,
            
            examName: data.exam_name,
            showPassFailStatus: data.show_pass_fail_status ?? true,
            showGrades: data.show_grades ?? true,
            resultDisplayType: data.result_display_type || 'PASS_FAIL', 
            academicYear: data.academic_year || new Date().getFullYear().toString(), 
            sortingMethod: data.sorting_method || 'GENDER_ROLL', 
            showRank: data.show_rank ?? false,
            lastActiveAt: data.last_active_at,
            isPaused: data.is_paused,
            
            coverPhoto: data.cover_photo,
            coverTheme: data.cover_theme,
            description: data.description,
            layoutTemplate: data.layout_template || 'STANDARD',
            
            enableAiRemarks: data.enable_ai_remarks ?? false,
            enableAiVoice: data.enable_ai_voice ?? false,
            enableAiPrediction: data.enable_ai_prediction ?? false,
            allowStudentSocials: data.allow_student_socials ?? false
        };
    } catch (e) {
        return null;
    }
};

export const updateSchoolSettings = async (settings: Partial<SchoolConfig>) => {
    const schoolId = getSchoolId();
    if (!schoolId) return { success: false, message: "Session expired" };
    
    // Demo Mode Bypass
    if (!isSupabaseConfigured()) {
        return { success: true, message: "Settings saved (Demo)" };
    }

    const payload: any = {};
    
    if (settings.allowTeacherSubjectEdit !== undefined) payload.allow_teacher_edit = settings.allowTeacherSubjectEdit;
    if (settings.allowPublicAdmission !== undefined) payload.allow_public_admission = settings.allowPublicAdmission;
    if (settings.admissionConfig !== undefined) payload.admission_config = settings.admissionConfig;
    if (settings.resultPublishDate !== undefined) payload.result_publish_date = settings.resultPublishDate;
    if (settings.scheduledPublishDate !== undefined) payload.scheduled_publish_date = settings.scheduledPublishDate;
    if (settings.schoolName !== undefined) payload.name = settings.schoolName;
    if (settings.phone !== undefined) payload.phone = settings.phone;
    if (settings.place !== undefined) payload.place = settings.place;
    if (settings.pincode !== undefined) payload.pincode = settings.pincode;
    if (settings.district !== undefined) payload.district = settings.district;
    if (settings.state !== undefined) payload.state = settings.state;
    if (settings.region !== undefined) payload.region = settings.region;
    if (settings.themeColor !== undefined) payload.theme_color = settings.themeColor;
    if (settings.logoUrl !== undefined) payload.logo_url = settings.logoUrl;
    if (settings.examName !== undefined) payload.exam_name = settings.examName;
    if (settings.showPassFailStatus !== undefined) payload.show_pass_fail_status = settings.showPassFailStatus;
    if (settings.resultDisplayType !== undefined) payload.result_display_type = settings.resultDisplayType;
    if (settings.academicYear !== undefined) payload.academic_year = settings.academicYear;
    if (settings.sortingMethod !== undefined) payload.sorting_method = settings.sortingMethod;
    if (settings.showRank !== undefined) payload.show_rank = settings.showRank;
    if (settings.admissionApprover !== undefined) payload.admission_approver = settings.admissionApprover;
    if (settings.feeManagerRole !== undefined) payload.fee_manager_role = settings.feeManagerRole;
    if (settings.coverPhoto !== undefined) payload.cover_photo = settings.coverPhoto;
    if (settings.coverTheme !== undefined) payload.cover_theme = settings.coverTheme;
    if (settings.description !== undefined) payload.description = settings.description;
    if (settings.layoutTemplate !== undefined) payload.layout_template = settings.layoutTemplate;
    if (settings.enableAiRemarks !== undefined) payload.enable_ai_remarks = settings.enableAiRemarks;
    if (settings.enableAiVoice !== undefined) payload.enable_ai_voice = settings.enableAiVoice;
    if (settings.enableAiPrediction !== undefined) payload.enable_ai_prediction = settings.enableAiPrediction;
    if (settings.allowStudentSocials !== undefined) payload.allow_student_socials = settings.allowStudentSocials;

    const { error } = await supabase.from('schools').update(payload).eq('id', schoolId);
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};

export const uploadImage = async (file: File, folder: 'logos' | 'students' | 'teachers' | 'ads') => {
    let prefix = getSchoolId();
    if (!prefix) prefix = 'system'; 

    // Demo Mode: Return fake URL
    if (!isSupabaseConfigured()) {
        return { success: true, publicUrl: URL.createObjectURL(file) };
    }

    try {
        const CLOUD_NAME: string = 'ddpopvbwo'; 
        const UPLOAD_PRESET = 'glfa7zly'; 
        
        if ((CLOUD_NAME as string) === 'YOUR_CLOUD_NAME_HERE') {
           const compressedBlob = await compressImage(file);
           const fileName = `${prefix}/${folder}/${Date.now()}.jpg`;
           const { error: uploadError } = await supabase.storage.from('school-branding').upload(fileName, compressedBlob, { contentType: 'image/jpeg', upsert: true });
           
           if (uploadError) throw new Error("Please configure Cloudinary in api.ts or create 'school-branding' bucket in Supabase.");
           
           const { data } = supabase.storage.from('school-branding').getPublicUrl(fileName);
           return { success: true, publicUrl: data.publicUrl };
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', `${prefix}/${folder}`);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Cloudinary upload failed');
        }

        const data = await response.json();
        return { success: true, publicUrl: data.secure_url };

    } catch (e: any) { return { success: false, message: getErrorMsg(e) }; }
};

export const uploadSchoolLogo = async (file: File) => {
    return uploadImage(file, 'logos');
};

export const uploadSchoolCover = async (file: File) => {
     const schoolId = getSchoolId();
     if (!schoolId) return { success: false, message: "Session expired" };
     try {
         const res = await uploadImage(file, 'logos');
         return res;
    } catch (e: any) { return { success: false, message: getErrorMsg(e) }; }
};

export const getSchoolDetailsPublic = async (schoolIdOrSlug: string) => {
    if (!isSupabaseConfigured()) return null;
    try {
        let query = supabase.from('schools').select('id, name, admission_config, allow_public_admission');
        
        const cleanInput = schoolIdOrSlug.trim();
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanInput);
        
        if (isUUID) {
            query = query.eq('id', cleanInput);
        } else {
            query = query.eq('slug', cleanInput.toLowerCase());
        }
        
        const { data } = await query.maybeSingle();
        return data;
    } catch (e) { return null; }
};

export const getSchoolPublicProfile = async (slugOrId: string): Promise<SchoolProfile | null> => {
     if (!isSupabaseConfigured()) return null;
     try {
         let school = null;
         if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId)) {
             const {data} = await supabase.from('schools').select('*').eq('id', slugOrId).maybeSingle();
             school = data;
         } else {
             const {data} = await supabase.from('schools').select('*').eq('slug', slugOrId.toLowerCase()).maybeSingle();
             school = data;
         }
         
         if (!school) return null;
         
         const { data: teachers } = await supabase.from('classes').select('id, teacher_name, teacher_photo, name').eq('school_id', school.id).not('teacher_name', 'is', null).neq('teacher_name', 'Class Teacher').limit(8);
         const { data: students } = await supabase.from('students').select('id, name, photo_url, is_premium, classes(name), social_links').eq('school_id', school.id).eq('is_verified', true).or('is_premium.eq.true,photo_url.not.is.null').order('is_premium', { ascending: false }).limit(10);
         const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', school.id);
         const { count: teacherCount } = await supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', school.id);

         return {
             id: school.id,
             name: school.name,
             slug: school.slug,
             place: school.place,
             logoUrl: school.logo_url,
             coverPhoto: school.cover_photo,
             coverTheme: school.cover_theme,
             description: school.description,
             themeColor: school.theme_color,
             isPro: school.is_pro,
             layoutTemplate: school.layout_template || 'STANDARD',
             stats: {
                 students: studentCount || 0,
                 teachers: teacherCount || 0
             },
             teachers: (teachers || []).map((t: any) => ({ 
                 id: t.id, 
                 name: t.teacher_name, 
                 photo: t.teacher_photo, 
                 className: t.name 
             })),
             students: (students || []).map((s: any) => ({
                 id: s.id,
                 name: s.name,
                 photo: s.photo_url,
                 isPremium: s.is_premium,
                 className: s.classes?.name,
                 socialLinks: s.social_links
             }))
         };

     } catch(e) { console.error(e); return null; }
};

export const activateSchoolProLicenseAuto = async (txnId: string) => {
    const schoolId = getSchoolId();
    if (!schoolId) return { success: false };
    
    if (!isSupabaseConfigured()) return { success: true };

    const { data: current } = await supabase.from('schools').select('expiry_date').eq('id', schoolId).single();
    
    let expiry = new Date();
    if (current?.expiry_date) {
        const currentExp = new Date(current.expiry_date);
        if (currentExp > new Date()) {
            expiry = currentExp;
        }
    }
    
    expiry.setFullYear(expiry.getFullYear() + 1);
    
    const { error } = await supabase.from('schools').update({ 
        is_pro: true, 
        license_key: `PRO-AUTO-${txnId.slice(0,6)}`, 
        expiry_date: expiry.toISOString(),
        payment_status: 'PAID',
        transaction_ref: txnId
    }).eq('id', schoolId);
    
    return { success: !error, message: error ? getErrorMsg(error) : "Pro License Activated!" };
};

export const activateLicense = async (key: string) => {
    const schoolId = getSchoolId();
    if (!schoolId) return { success: false };
    if (!isSupabaseConfigured()) return { success: true };

    if (key.startsWith('PRO-')) {
        const { data: current } = await supabase.from('schools').select('expiry_date').eq('id', schoolId).single();
        let expiry = new Date();
        if (current?.expiry_date) {
            const currentExp = new Date(current.expiry_date);
            if (currentExp > new Date()) expiry = currentExp;
        }
        expiry.setFullYear(expiry.getFullYear() + 1);
        
        await supabase.from('schools').update({ is_pro: true, license_key: key, expiry_date: expiry.toISOString() }).eq('id', schoolId);
        return { success: true, message: `Pro License Activated` };
    }
    return { success: false, message: "Invalid Key" };
};

export const toggleSchoolStatus = async (schoolId: string, currentStatus: boolean) => {
    if (!isSupabaseConfigured()) return { success: true };
    const { error } = await supabase.from('schools').update({ is_pro: !currentStatus }).eq('id', schoolId);
    return { success: !error };
};

export const deleteSchool = async (schoolId: string) => {
    if (!isSupabaseConfigured()) return { success: true };
    const { error } = await supabase.from('schools').delete().eq('id', schoolId);
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};

export const getSchoolDetailedHealthStats = async () => {
    if (!isSupabaseConfigured()) return { ghosts: 0, oldPosts: 0, staleRequests: 0, oldLogs: 0 };
    const schoolId = getSchoolId();
    if(!schoolId) return { ghosts: 0, oldPosts: 0, staleRequests: 0, oldLogs: 0 };
    
    try {
        const { count: ghosts } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_verified', false);
        const cutoffDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
        const { count: oldPosts } = await supabase.from('campus_posts').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('category', 'BUZZ').lt('created_at', cutoffDate);
        const { count: staleRequests } = await supabase.from('profile_requests').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).neq('status', 'PENDING');
        const logCutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        const { data: programs } = await supabase.from('assessment_programs').select('id').eq('school_id', schoolId);
        let oldLogs = 0;
        if (programs && programs.length > 0) {
            const progIds = programs.map(p => p.id);
            const { count } = await supabase.from('assessment_logs').select('*', { count: 'exact', head: true }).in('program_id', progIds).lt('date', logCutoff);
            oldLogs = count || 0;
        }

        return {
            ghosts: ghosts || 0,
            oldPosts: oldPosts || 0,
            staleRequests: staleRequests || 0,
            oldLogs: oldLogs
        };
    } catch (e) {
        return { ghosts: 0, oldPosts: 0, staleRequests: 0, oldLogs: 0 };
    }
};

export const cleanSpecificJunk = async (type: 'GHOSTS' | 'OLD_POSTS' | 'STALE_REQUESTS' | 'OLD_LOGS') => {
    const schoolId = getSchoolId();
    if(!schoolId) return { success: false };
    if (!isSupabaseConfigured()) return { success: true };
    
    let error = null;

    if (type === 'GHOSTS') {
        const { error: e } = await supabase.from('students').delete().eq('school_id', schoolId).eq('is_verified', false);
        error = e;
    }
    else if (type === 'OLD_POSTS') {
        const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
        const { error: e } = await supabase.from('campus_posts').delete().eq('school_id', schoolId).eq('category', 'BUZZ').lt('created_at', cutoff);
        error = e;
    }
    else if (type === 'STALE_REQUESTS') {
        const { error: e } = await supabase.from('profile_requests').delete().eq('school_id', schoolId).neq('status', 'PENDING');
        error = e;
    }
    else if (type === 'OLD_LOGS') {
        const logCutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        const { data: programs } = await supabase.from('assessment_programs').select('id').eq('school_id', schoolId);
        if (programs && programs.length > 0) {
             const progIds = programs.map(p => p.id);
             const { error: e } = await supabase.from('assessment_logs').delete().in('program_id', progIds).lt('date', logCutoff);
             error = e;
        }
    }

    return { success: !error, message: error ? (error as any).message : "Cleaned Successfully" };
};

export const getGlobalSettings = async () => {
    if (!isSupabaseConfigured()) return {};
    try {
        const { data } = await supabase.from('app_config').select('*');
        const settings: Record<string, string> = {};
        if (data && Array.isArray(data)) {
            data.forEach((row: any) => settings[row.key] = row.value);
        }
        return settings;
    } catch (e) {
        return {};
    }
};
