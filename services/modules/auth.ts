
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Role } from '../../types';
import { getSchoolId, getErrorMsg, parseSubjects, transformStudent } from '../utils';

export const generateRecoveryCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const randomValues = new Uint32Array(16);
    window.crypto.getRandomValues(randomValues);
    let result = 'REC';
    for (let i = 0; i < 16; i++) {
        if (i % 4 === 0) result += '-';
        result += chars[randomValues[i] % chars.length];
    }
    return result;
};

export const registerSchool = async (name: string, email: string, password: string, phone: string, place: string, recoveryCode: string, referralCode?: string) => {
    // --- DEMO MODE BYPASS ---
    if (!isSupabaseConfigured()) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        // Store locally for demo flow
        const demoUser = {
            id: 'demo-school-id',
            name: name,
            email: email,
            recoveryCode: recoveryCode
        };
        localStorage.setItem('demo_school', JSON.stringify(demoUser));
        return { success: true, schoolId: 'demo-school-id' };
    }
    // ------------------------

    try {
        const cleanEmail = email.trim().toLowerCase(); 
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
                data: {
                    school_name: name,
                    phone: phone,
                    place: place,
                    recovery_code: recoveryCode // Stored in metadata for reference
                }
            }
        });
        
        if (authError) throw authError;

        if (authData.user && !authData.session) {
            return { success: false, message: "Registration successful. Please check email to confirm." };
        }

        if (authData.user) {
            const { data: existing } = await supabase.from('schools').select('id').eq('auth_id', authData.user.id).maybeSingle();
            
            if (existing) {
                return { success: true, schoolId: existing.id };
            }

            const { data: newSchool, error: insertError } = await supabase.from('schools').insert([{
                auth_id: authData.user.id,
                name: name,
                admin_email: cleanEmail,
                phone: phone,
                place: place,
                referral_code: referralCode || null,
                allow_teacher_edit: true,
                recovery_code: recoveryCode // Stored in DB for recovery logic
            }]).select().single();

            if (insertError) {
                const { data: retry } = await supabase.from('schools').select('id').eq('auth_id', authData.user.id).maybeSingle();
                if (retry) return { success: true, schoolId: retry.id };
                return { success: false, message: "School profile creation failed: " + insertError.message };
            }

            return { success: true, schoolId: newSchool.id };
        }
        return { success: false, message: "User creation failed" };
    } catch (e: any) {
        return { success: false, message: getErrorMsg(e) };
    }
};

export const login = async (role: Role, credentials: any) => {
    // --- DEMO MODE BYPASS ---
    if (!isSupabaseConfigured()) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (role === Role.ADMIN) {
            // Check against local demo data if available, or just allow
            const demoData = JSON.parse(localStorage.getItem('demo_school') || '{}');
            return { 
                success: true, 
                user: { 
                    id: 'demo-school-id', 
                    name: demoData.name || 'Demo School', 
                    admin_email: credentials.email,
                    is_pro: true, // Auto pro for demo
                    themeColor: 'blue'
                } 
            };
        }
        return { success: false, message: "Demo Mode: Only Admin login is simulated. Connect DB for full features." };
    }
    // ------------------------

    try {
        if (role === Role.ADMIN) {
            const cleanEmail = credentials.email.trim(); 
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password: credentials.password
            });
            if (error) return { success: false, message: getErrorMsg(error) };

            const { data } = await supabase.from('schools').select('*').eq('auth_id', authData.user?.id).maybeSingle();
            
            if (data) {
                await supabase.from('schools').update({ last_active_at: new Date().toISOString() }).eq('id', data.id);
                localStorage.setItem('school_id', data.id); 
                return { 
                    success: true, 
                    user: { ...data, logoUrl: data.logo_url, themeColor: data.theme_color || 'blue' } 
                };
            } else {
                const meta = authData.user?.user_metadata;
                if (meta && meta.school_name) {
                     const { data: newSchool, error: healError } = await supabase.from('schools').insert([{
                          auth_id: authData.user?.id,
                          name: meta.school_name,
                          admin_email: cleanEmail,
                          phone: meta.phone,
                          place: meta.place
                      }]).select().single();

                      if (newSchool && !healError) {
                           localStorage.setItem('school_id', newSchool.id); 
                           return { 
                               success: true, 
                               user: { ...newSchool, logoUrl: newSchool.logo_url, themeColor: newSchool.theme_color || 'blue' } 
                           };
                      }
                }
                
                return { 
                    success: false, 
                    message: "Login successful but School Profile not found. Please Report.", 
                    canReport: true, 
                    errorDetails: { email: cleanEmail, authId: authData.user?.id } 
                };
            }
        }
        
        if (role === Role.TEACHER) {
            const { data: cls } = await supabase.from('classes').select('name').eq('id', credentials.classId).single();
            if (!cls) return { success: false, message: "Class not found" };

            const { data, error } = await supabase.rpc('teacher_login', {
                cls_name: cls.name, 
                pass: credentials.password.toLowerCase(),
                schl_id: getSchoolId()
            });
            
            if (error) return { success: false, message: getErrorMsg(error) };

            if (data) {
                const clsData = data as any;
                localStorage.setItem('school_id', clsData.school_id);
                const {data: s} = await supabase.from('schools').select('name, place, logo_url, theme_color, is_pro').eq('id', clsData.school_id).single();

                return { 
                    success: true, 
                    user: { 
                        ...clsData, 
                        name: clsData.name, 
                        teacherName: clsData.teacher_name, 
                        teacherPhoto: clsData.teacher_photo,
                        submissionStatus: clsData.status || 'DRAFT', 
                        subjects: parseSubjects(clsData.subjects),
                        schoolName: s?.name, 
                        schoolPlace: s?.place,
                        schoolLogoUrl: s?.logo_url,
                        schoolThemeColor: s?.theme_color,
                        isPro: s?.is_pro,
                        schoolId: clsData.school_id
                    } 
                };
            }
        }

        if (role === Role.STUDENT) {
            const { data, error } = await supabase.rpc('student_login', {
                reg_no_in: credentials.id,
                pass_in: credentials.password.toLowerCase(),
                schl_id: getSchoolId()
            });

            if (error) return { success: false, message: getErrorMsg(error) };

            if (data) {
                const stuData = data as any;
                localStorage.setItem('school_id', stuData.school_id);
                const {data: s} = await supabase.from('schools').select('logo_url, theme_color').eq('id', stuData.school_id).single();
                return { 
                    success: true, 
                    user: { ...transformStudent(stuData), schoolLogoUrl: s?.logo_url, schoolThemeColor: s?.theme_color }
                };
            }
        }
        
        return { success: false, message: "Invalid Credentials" };

    } catch (e) { 
        console.error("Login error", e); 
        return { success: false, message: getErrorMsg(e) };
    }
};

export const resetPasswordWithRecoveryCode = async (email: string, code: string, newPassword: string) => {
    // --- DEMO MODE BYPASS ---
    if (!isSupabaseConfigured()) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const demoData = JSON.parse(localStorage.getItem('demo_school') || '{}');
        if (demoData.email === email && demoData.recoveryCode === code) {
            return { success: true, message: "Password reset successfully (Demo Mode)" };
        }
        if (!demoData.email) return { success: true, message: "Simulated Success (No Demo Data)" };
        return { success: false, message: "Invalid Recovery Key (Demo)" };
    }
    // ------------------------

    try {
        // First verify code against school record
        const { data: school } = await supabase.from('schools')
            .select('auth_id, recovery_code')
            .eq('admin_email', email.trim().toLowerCase())
            .maybeSingle();

        if (!school) {
            return { success: false, message: "Email not found." };
        }

        if (school.recovery_code !== code.trim()) {
            return { success: false, message: "Invalid Recovery Key." };
        }

        // If code matches, update the user password
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        
        // Note: `updateUser` only works if the user is currently logged in. 
        // For forgot password flow without login, we need to use Admin API (not available on client) 
        // OR rely on the `reset_password_with_code` RPC if implemented on backend.
        // Falling back to RPC logic which assumes a backend function exists to handle this secure op.
        
        const { data: rpcSuccess, error: rpcError } = await supabase.rpc('reset_admin_password', {
            admin_email: email.trim(),
            new_password: newPassword
        });

        if (rpcError) {
            // Fallback for simple setups: Return success message asking them to use email link if RPC fails
            console.warn("RPC reset failed, likely missing function.", rpcError);
            return { success: false, message: "Key Verified. Please use the 'Send Email Link' option to finalize reset." };
        }

        return { success: true, message: "Password reset successfully!" };

    } catch (e: any) {
        return { success: false, message: getErrorMsg(e) };
    }
};

export const recoverPassword = async (email: string) => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: window.location.origin + '/#/login?reset=true'
        });
        if (error) throw error;
        return { success: true, message: "Password reset link sent." };
    } catch (e: any) {
        return { success: false, message: getErrorMsg(e) };
    }
};

export const updateUserPassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};
