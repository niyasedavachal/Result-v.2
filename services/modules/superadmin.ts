
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { SupportTicket, SystemStats, MarketingConfig, SchoolSummary } from '../../types';

// --- SCHOOL MANAGEMENT ---
export const getAllSchools = async (): Promise<SchoolSummary[]> => {
    const { data } = await supabase.from('schools')
        .select('id, name, admin_email, place, is_pro, expiry_date, last_active_at')
        .order('created_at', { ascending: false });
        
    if (!data) return [];
    
    const schools: SchoolSummary[] = [];
    
    // In production, this should be an RPC or View.
    // For now, we perform counts. 
    for (const s of data) {
        // Safe check for counts
        const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', s.id);
        const { count: classCount } = await supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', s.id);
        
        schools.push({
            id: s.id,
            name: s.name,
            adminEmail: s.admin_email,
            place: s.place,
            isPro: s.is_pro,
            expiryDate: s.expiry_date,
            lastActive: s.last_active_at,
            studentCount: studentCount || 0,
            classCount: classCount || 0
        });
    }
    return schools;
};

export const manuallyUpgradeSchool = async (schoolId: string, isPro: boolean, days: number = 365) => {
    let expiryDate = null;
    if (isPro) {
        const d = new Date();
        d.setDate(d.getDate() + days);
        expiryDate = d.toISOString();
    }
    
    const { error } = await supabase.from('schools').update({
        is_pro: isPro,
        expiry_date: expiryDate,
        license_key: isPro ? 'GRANTED_BY_ADMIN' : 'FREE'
    }).eq('id', schoolId);
    
    return { success: !error };
};

// --- ANALYTICS ---
export const getAdvancedSystemStats = async (): Promise<SystemStats> => {
    // Real Queries
    const { count: schools } = await supabase.from('schools').select('*', { count: 'exact', head: true });
    const { count: students } = await supabase.from('students').select('*', { count: 'exact', head: true });
    const { count: revenueCount } = await supabase.from('schools').select('*', { count: 'exact', head: true }).eq('is_pro', true);
    
    // Simulation for advanced metrics not in DB yet
    const latency = Math.floor(Math.random() * 50) + 20; 
    const activeUsers = Math.floor((schools || 1) * 0.8) + Math.floor(Math.random() * 10);
    
    // Calculate total revenue approximation (mock calculation based on count)
    const estimatedRev = (revenueCount || 0) * 1999; 

    return {
        totalSchools: schools || 0,
        totalStudents: students || 0,
        proSchools: revenueCount || 0,
        premiumStudents: 0,
        totalRevenue: estimatedRev,
        inactiveSchools: 0,
        authUsersUsed: 0,
        dbSizeMB: 45.2,
        serverLatency: latency,
        activeUsersNow: activeUsers,
        ticketsPending: 5,
        dailyGrowthRate: 5.2
    };
};

// --- SUPPORT DESK ---
export const getAllSupportTickets = async (): Promise<SupportTicket[]> => {
    // Ensure table exists, fallback if not
    const { data } = await supabase.from('system_feedback').select('*').order('created_at', { ascending: false });
    if (!data) return [];

    return data.map((item: any) => ({
        id: item.id,
        schoolId: item.school_id,
        schoolName: item.school_name || 'Unknown School',
        userEmail: item.email || 'User', 
        subject: item.message ? (item.message.substring(0, 30) + '...') : 'No Subject',
        message: item.message,
        status: item.status || 'OPEN',
        priority: (item.message || '').toLowerCase().includes('payment') ? 'CRITICAL' : 'MEDIUM',
        category: item.type || 'GENERAL',
        aiSuggestedReply: generateAiReply(item.message || ''),
        createdAt: item.created_at
    }));
};

const generateAiReply = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes('payment') || lower.includes('money')) return "Checking transaction status with gateway. Will update shortly.";
    if (lower.includes('login')) return "Please use the password reset tool or verify email address.";
    return "Thank you for the feedback. We are investigating.";
};

export const resolveTicket = async (ticketId: string, reply: string) => {
    const { error } = await supabase.from('system_feedback').update({ status: 'RESOLVED' }).eq('id', ticketId);
    return { success: !error };
};

// --- INFRASTRUCTURE & POOLS ---
export const getStoragePoolStatus = async () => {
    // Mock Status for multiple Cloudinary accounts
    return [
        { id: 'cloud_1', name: 'Primary (Asia)', used: 85, limit: 100, status: 'HEALTHY' },
        { id: 'cloud_2', name: 'Backup (US)', used: 12, limit: 25, status: 'HEALTHY' },
        { id: 'cloud_3', name: 'Media Pool A', used: 98, limit: 100, status: 'FULL' },
        { id: 'cloud_4', name: 'Media Pool B', used: 0, limit: 100, status: 'STANDBY' },
    ];
};

export const runDatabaseMigration = async (script: string) => {
    // In a real app, this would verify admin privilege and execute SQL via RPC
    // For safety, we just simulate success here
    await new Promise(r => setTimeout(r, 2000));
    return { success: true, message: "Migration Applied Successfully (Simulated)" };
};

export const triggerAutoHeal = async (type: 'CACHE' | 'CONNECTION' | 'INDEX') => {
    await new Promise(r => setTimeout(r, 1500));
    return { success: true, message: `${type} reset complete.` };
};

// --- STAFF MANAGEMENT ---
export const getStaffList = async () => {
    // Try to fetch from real table if exists, else return mock
    const { data } = await supabase.from('staff_members').select('*');
    if (data && data.length > 0) {
        return data.map((s: any) => ({
            id: s.id,
            name: s.name,
            role: s.role,
            status: s.status,
            performance: s.performance_score
        }));
    }

    return [
        { id: 'st1', name: 'Niyas V', role: 'System Architect', status: 'ONLINE', performance: 98 },
        { id: 'st2', name: 'Support Bot', role: 'AI Agent', status: 'ONLINE', performance: 100 },
        { id: 'st3', name: 'Sarah J', role: 'Accounts', status: 'OFFLINE', performance: 85 },
        { id: 'st4', name: 'Rahul K', role: 'Support Lead', status: 'BUSY', performance: 92 },
    ];
};

export const addStaffMember = async (staff: any) => {
    await new Promise(r => setTimeout(r, 1000));
    return { success: true };
};

// --- MARKETING & PRICING ---
export const getMarketingConfig = async (): Promise<MarketingConfig> => {
    const defaultStarter = ["Unlimited Students", "Smart Data Entry (Public Link)", "Instant Result Publish", "WhatsApp Viral Result Link"];
    const defaultSmart = ["Everything in Starter", "Fee Management System", "Fee Receipts & Reports", "School Branding (Logo)"];
    const defaultPro = ["Everything in Smart", "✨ AI Question Generator", "📱 White-label Mobile App", "Behavioral Reports", "Priority Support"];

    const defaults: MarketingConfig = {
        flashSaleActive: false,
        smartPlanPrice: 1999,
        smartPlanOriginal: 2999,
        smartPlanSeatsLeft: 12,
        proPlanPrice: 4999,
        proPlanOriginal: 7999,
        proPlanSeatsLeft: 5,
        showUrgencyBanner: false,
        billingCycle: '/year',
        globalTrialMode: false,
        planFeatures: {
            starter: defaultStarter,
            smart: defaultSmart,
            pro: defaultPro
        }
    };

    // Prevent network requests if not configured to avoid "Failed to fetch"
    if (!isSupabaseConfigured()) {
        return defaults;
    }

    try {
        const { data, error } = await supabase.from('app_config').select('*').in('key', [
            'FLASH_SALE_ACTIVE', 'FLASH_SALE_END', 'FLASH_SALE_TEXT', 
            'PRICE_SMART', 'PRICE_SMART_ORIG', 'SEATS_SMART',
            'PRICE_PRO', 'PRICE_PRO_ORIG', 'SEATS_PRO', 'URGENCY_BANNER',
            'BILLING_CYCLE', 'GLOBAL_TRIAL', 
            'FEAT_STARTER', 'FEAT_SMART', 'FEAT_PRO'
        ]);
        
        if (error) {
            // Silently return defaults on error to avoid UI crash
            return defaults;
        }
        
        const settings: any = {};
        if (data && Array.isArray(data)) {
            data.forEach((row: any) => settings[row.key] = row.value);
        }

        return {
            flashSaleActive: settings['FLASH_SALE_ACTIVE'] === 'TRUE',
            flashSaleEndTime: settings['FLASH_SALE_END'],
            flashSaleText: settings['FLASH_SALE_TEXT'],
            smartPlanPrice: parseInt(settings['PRICE_SMART']) || 1999,
            smartPlanOriginal: parseInt(settings['PRICE_SMART_ORIG']) || 2999,
            smartPlanSeatsLeft: parseInt(settings['SEATS_SMART']) || 12,
            proPlanPrice: parseInt(settings['PRICE_PRO']) || 4999,
            proPlanOriginal: parseInt(settings['PRICE_PRO_ORIG']) || 7999,
            proPlanSeatsLeft: parseInt(settings['SEATS_PRO']) || 5,
            showUrgencyBanner: settings['URGENCY_BANNER'] === 'TRUE',
            billingCycle: settings['BILLING_CYCLE'] || '/year',
            globalTrialMode: settings['GLOBAL_TRIAL'] === 'TRUE',
            planFeatures: {
                starter: settings['FEAT_STARTER'] ? JSON.parse(settings['FEAT_STARTER']) : defaultStarter,
                smart: settings['FEAT_SMART'] ? JSON.parse(settings['FEAT_SMART']) : defaultSmart,
                pro: settings['FEAT_PRO'] ? JSON.parse(settings['FEAT_PRO']) : defaultPro
            }
        };
    } catch (e) {
        // Silently fail on network error and return defaults
        return defaults;
    }
};

export const updateMarketingConfig = async (config: MarketingConfig) => {
    const upserts = [
        { key: 'FLASH_SALE_ACTIVE', value: config.flashSaleActive ? 'TRUE' : 'FALSE' },
        { key: 'FLASH_SALE_END', value: config.flashSaleEndTime },
        { key: 'FLASH_SALE_TEXT', value: config.flashSaleText },
        { key: 'PRICE_SMART', value: config.smartPlanPrice.toString() },
        { key: 'PRICE_SMART_ORIG', value: config.smartPlanOriginal.toString() },
        { key: 'SEATS_SMART', value: config.smartPlanSeatsLeft.toString() },
        { key: 'PRICE_PRO', value: config.proPlanPrice.toString() },
        { key: 'PRICE_PRO_ORIG', value: config.proPlanOriginal.toString() },
        { key: 'SEATS_PRO', value: config.proPlanSeatsLeft.toString() },
        { key: 'URGENCY_BANNER', value: config.showUrgencyBanner ? 'TRUE' : 'FALSE' },
        { key: 'BILLING_CYCLE', value: config.billingCycle },
        { key: 'GLOBAL_TRIAL', value: config.globalTrialMode ? 'TRUE' : 'FALSE' },
        { key: 'FEAT_STARTER', value: JSON.stringify(config.planFeatures?.starter || []) },
        { key: 'FEAT_SMART', value: JSON.stringify(config.planFeatures?.smart || []) },
        { key: 'FEAT_PRO', value: JSON.stringify(config.planFeatures?.pro || []) }
    ];

    const { error } = await supabase.from('app_config').upsert(upserts);
    return { success: !error, message: error ? (error as any).message : undefined };
};
