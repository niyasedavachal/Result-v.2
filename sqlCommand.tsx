
import React from 'react';
import { GlassCard } from './components/GlassUI';

const SQL_CONTENT = `-- ==============================================================================
-- 🚀 RESULTMATE - ESSENTIAL DATABASE SCRIPT (v2.2)
-- ==============================================================================
-- ⚠️ WARNING: RUNNING THIS WILL WIPE ALL EXISTING DATA.
-- Use this only for the initial setup of your LIVE database.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CLEANUP
DROP TABLE IF EXISTS infrastructure_logs CASCADE;
DROP TABLE IF EXISTS staff_members CASCADE;
DROP TABLE IF EXISTS system_feedback CASCADE;
DROP TABLE IF EXISTS campus_posts CASCADE;
DROP TABLE IF EXISTS ad_campaigns CASCADE;
DROP TABLE IF EXISTS affiliates CASCADE;
DROP TABLE IF EXISTS profile_requests CASCADE;
DROP TABLE IF EXISTS assessment_logs CASCADE;
DROP TABLE IF EXISTS assessment_programs CASCADE;
DROP TABLE IF EXISTS exam_submissions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS fee_payments CASCADE;
DROP TABLE IF EXISTS fee_structures CASCADE;
DROP TABLE IF EXISTS marks CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
DROP TABLE IF EXISTS app_config CASCADE;

-- 3. GLOBAL CONFIGURATION
CREATE TABLE app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO app_config (key, value) VALUES 
('ENABLE_ADS', 'TRUE'), 
('ENABLE_STUDENT_LOGIN', 'TRUE'), 
('ENABLE_TEACHER_LOGIN', 'TRUE'),
('ENABLE_PUBLIC_REGISTRATION', 'TRUE'), 
('MODULE_FEES', 'TRUE'), 
('MODULE_ASSESSMENTS', 'TRUE'),
('MAINTENANCE_MODE', 'FALSE');

-- 4. CORE TABLES

-- SCHOOLS
CREATE TABLE schools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auth_id UUID UNIQUE, 
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    admin_email TEXT NOT NULL,
    phone TEXT,
    place TEXT,
    pincode TEXT,
    district TEXT,
    state TEXT,
    logo_url TEXT,
    cover_photo TEXT,
    theme_color TEXT DEFAULT 'blue',
    is_pro BOOLEAN DEFAULT FALSE,
    license_key TEXT DEFAULT 'FREE',
    payment_status TEXT DEFAULT 'FREE',
    expiry_date TIMESTAMP WITH TIME ZONE,
    is_paused BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    academic_year TEXT DEFAULT '2024-25',
    result_publish_date TIMESTAMP WITH TIME ZONE,
    scheduled_publish_date TIMESTAMP WITH TIME ZONE,
    allow_public_admission BOOLEAN DEFAULT TRUE,
    allow_teacher_edit BOOLEAN DEFAULT TRUE,
    admission_token TEXT,
    admission_config JSONB DEFAULT '{"askPhoto": false, "askBloodGroup": false}'::jsonb,
    enable_ai_remarks BOOLEAN DEFAULT FALSE,
    enable_ai_voice BOOLEAN DEFAULT FALSE,
    enable_ai_prediction BOOLEAN DEFAULT FALSE,
    recovery_code TEXT, -- Added for secure reset
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CLASSES
CREATE TABLE classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    teacher_name TEXT DEFAULT 'Class Teacher',
    teacher_password TEXT,
    teacher_photo TEXT,
    subjects JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id, name)
);

-- STUDENTS
CREATE TABLE students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    reg_no TEXT NOT NULL,
    roll_no INTEGER,
    name TEXT NOT NULL,
    dob DATE,
    gender TEXT DEFAULT 'Male',
    father_name TEXT,
    mother_name TEXT,
    
    -- New Fields for Smart Admission
    phone TEXT,
    address TEXT,
    blood_group TEXT,
    
    photo_url TEXT,
    password TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expiry TIMESTAMP WITH TIME ZONE,
    added_by TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id, reg_no)
);

-- MARKS
CREATE TABLE marks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    subjects JSONB NOT NULL,
    total NUMERIC DEFAULT 0,
    grade TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, term)
);

-- 5. MODULES

-- FEES
CREATE TABLE fee_structures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    due_date DATE,
    target_class_ids JSONB DEFAULT '[]'::jsonb,
    collected_by TEXT DEFAULT 'ADMIN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fee_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fee_id UUID REFERENCES fee_structures(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    amount_paid NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'PAID',
    paid_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    collected_by TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fee_id, student_id)
);

-- EXAMS
CREATE TABLE exams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    questions JSONB NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE exam_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    score NUMERIC DEFAULT 0,
    total_marks NUMERIC DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, student_id)
);

-- ASSESSMENTS
CREATE TABLE assessment_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    frequency TEXT NOT NULL,
    assignee TEXT NOT NULL,
    target_class_ids JSONB DEFAULT '[]'::jsonb,
    questions JSONB NOT NULL,
    start_date DATE,
    end_date DATE,
    schedules JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE assessment_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID REFERENCES assessment_programs(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    data JSONB NOT NULL,
    total_score NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(program_id, student_id, date)
);

-- SUPPORT & FEEDBACK
CREATE TABLE system_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    school_name TEXT,
    email TEXT,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'SUPPORT',
    status TEXT DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STAFF (Optional, for Super Admin)
CREATE TABLE staff_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'OFFLINE',
    performance_score INTEGER DEFAULT 100,
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADS & POSTS
CREATE TABLE ad_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    image_url TEXT NOT NULL,
    target_url TEXT,
    contact_info TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'ACTIVE',
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE campus_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    author_name TEXT,
    title TEXT,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT DEFAULT 'NOTICE',
    likes INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE profile_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    field TEXT NOT NULL,
    new_value TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AFFILIATES
CREATE TABLE affiliates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    code TEXT UNIQUE NOT NULL,
    earnings NUMERIC DEFAULT 0,
    schools_referred INTEGER DEFAULT 0,
    bank_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. FUNCTIONS

-- Teacher Login
CREATE OR REPLACE FUNCTION teacher_login(cls_name TEXT, pass TEXT, schl_id UUID)
RETURNS SETOF classes AS $$
BEGIN
  RETURN QUERY SELECT * FROM classes 
  WHERE name = cls_name 
  AND teacher_password = pass 
  AND school_id = schl_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Student Login
CREATE OR REPLACE FUNCTION student_login(reg_no_in TEXT, pass_in TEXT, schl_id UUID)
RETURNS SETOF students AS $$
BEGIN
  RETURN QUERY SELECT * FROM students 
  WHERE reg_no = reg_no_in 
  AND school_id = schl_id
  AND (
      password = pass_in 
      OR 
      (password IS NULL AND CAST(dob AS TEXT) = pass_in)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Marks Fetcher
CREATE OR REPLACE FUNCTION get_student_marks(stu_id UUID, term_in TEXT)
RETURNS SETOF marks AS $$
BEGIN
  RETURN QUERY SELECT * FROM marks 
  WHERE student_id = stu_id AND term = term_in;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark Saver
CREATE OR REPLACE FUNCTION save_marks(stu_id UUID, term_in TEXT, sub_json JSONB, tot NUMERIC, grd TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO marks (student_id, term, subjects, total, grade)
  VALUES (stu_id, term_in, sub_json, tot, grd)
  ON CONFLICT (student_id, term)
  DO UPDATE SET subjects = EXCLUDED.subjects, total = EXCLUDED.total, grade = EXCLUDED.grade;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECURE PASSWORD RESET RPC (Called by Client with Key)
-- NOTE: This requires enabling postgres_fdw or modifying user via Supabase internal logic. 
-- Standard PostgreSQL cannot update Supabase Auth User directly. 
-- However, for the purpose of this script, we assume the application handles it via Service Role key or client-side checks + Auth update.
-- This function is a PLACEHOLDER for logic that validates the key.
CREATE OR REPLACE FUNCTION validate_recovery_key(admin_email_in TEXT, code_in TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  exists_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO exists_count FROM schools 
  WHERE admin_email = admin_email_in 
  AND recovery_code = code_in;
  
  RETURN exists_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_schools_slug ON schools(slug);
CREATE INDEX idx_classes_school ON classes(school_id);
`;

const SqlCommand: React.FC = () => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(SQL_CONTENT);
        alert('SQL Script Copied!');
    };

    return (
        <div className="p-4 md:p-8 min-h-screen bg-slate-50 dark:bg-slate-900">
            <GlassCard className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Database Setup SQL</h2>
                    <button 
                        onClick={copyToClipboard} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                        Copy SQL
                    </button>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 overflow-auto max-h-[80vh]">
                    <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap break-all">
                        {SQL_CONTENT}
                    </pre>
                </div>
            </GlassCard>
        </div>
    );
};

export default SqlCommand;
