
import { Student, Marks, SubjectConfig } from '../types';

export const getSchoolId = () => localStorage.getItem('school_id');

export const getErrorMsg = (e: any): string => {
    // 1. Handle specific Supabase Auth Errors (Suppress console log for these known issues)
    if (e?.name === 'AuthInvalidTokenResponseError' || (e?.status === 500 && e?.__isAuthError)) {
        return "Authentication Service Error: The system could not verify your credentials. Please check your API Keys or internet connection.";
    }
    
    if (e === 'Auth session or user missing' || e?.message === 'Auth session or user missing') {
        return "Session invalid. Please login again.";
    }

    // 2. Log unknown errors for debugging
    try {
        console.error("API Error Details:", e);
        if (typeof e === 'object' && e !== null) {
             console.error(JSON.stringify(e, null, 2));
        }
    } catch (err) {
        console.error("API Error (Unloggable)");
    }

    if (!e) return "An unknown error occurred.";
    if (typeof e === 'string') return e;
    
    // Check if it's a standard Error object
    if (e instanceof Error) return e.message;

    if (e.message) {
        return typeof e.message === 'object' ? JSON.stringify(e.message) : String(e.message);
    }
    if (e.error_description) return String(e.error_description);
    if (e.details) return String(e.details);
    if (e.hint) return String(e.hint);
    
    try {
        const json = JSON.stringify(e);
        if (json !== '{}') return json;
    } catch {}
    
    return "An unexpected error occurred.";
};

export const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 500; 
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas is empty'));
                }, 'image/jpeg', 0.8);
            };
        };
        reader.onerror = (error) => reject(error);
    });
};

// NEW: Date Formatter (YYYY-MM-DD -> DD-MM-YYYY)
export const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return '-';
    // Check if already in DD-MM-YYYY to prevent double formatting
    if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) return dateString;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Fallback
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
};

export const parseSubjects = (json: any): SubjectConfig[] => {
    if (!json) return [];
    let parsed = typeof json === 'string' ? JSON.parse(json) : json;
    
    if (Array.isArray(parsed)) {
        if (parsed.length === 0) return [];
        if (typeof parsed[0] === 'string') {
            return parsed.map((s: string) => ({ name: s, maxMarks: 50, passMarks: 18 }));
        }
        return parsed.map((s: any) => ({
            name: s.name,
            maxMarks: s.maxMarks || 50,
            passMarks: s.passMarks || (s.maxMarks ? Math.floor(s.maxMarks * 0.3) : 18)
        }));
    }
    return [];
}

export const transformStudent = (s: any): Student => ({
    id: s.id,
    regNo: s.reg_no,
    rollNo: s.roll_no, 
    name: s.name,
    classId: s.class_id,
    dob: s.dob,
    gender: s.gender, 
    fatherName: s.father_name,
    motherName: s.mother_name,
    isVerified: s.is_verified,
    photoUrl: s.photo_url,
    isPremium: s.is_premium || false, 
    premiumExpiry: s.premium_expiry,
    addedBy: s.added_by,
    verifiedBy: s.verified_by,
    socialLinks: s.social_links // JSONB column mapping
});

export const transformMarks = (m: any): Marks => {
    return {
        studentId: m.student_id,
        term: m.term,
        subjects: typeof m.subjects === 'string' ? JSON.parse(m.subjects) : m.subjects,
        total: m.total,
        grade: m.grade,
        resultStatus: m.grade === 'F' ? 'FAILED' : 'PASS' 
    };
};
