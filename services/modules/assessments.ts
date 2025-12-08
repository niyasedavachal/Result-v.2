
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { AssessmentProgram, AssessmentLog, LeaderboardEntry } from '../../types';
import { getSchoolId, getErrorMsg } from '../utils';

export const createAssessmentProgram = async (program: Partial<AssessmentProgram>) => {
    const schoolId = getSchoolId();
    if (!schoolId) return { success: false, message: "Session expired" };
    if (!isSupabaseConfigured()) return { success: true };

    const { error } = await supabase.from('assessment_programs').insert([{
        school_id: schoolId,
        name: program.name,
        type: program.type,
        frequency: program.frequency,
        questions: program.questions,
        assignee: program.assignee,
        target_class_ids: program.targetClassIds || [],
        start_date: program.startDate, 
        end_date: program.endDate,
        schedules: program.schedules
    }]);
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};

export const updateAssessmentProgram = async (id: string, program: Partial<AssessmentProgram>) => {
    if (!isSupabaseConfigured()) return { success: true };
    const { error } = await supabase.from('assessment_programs').update({
        name: program.name,
        type: program.type,
        frequency: program.frequency,
        questions: program.questions,
        assignee: program.assignee,
        target_class_ids: program.targetClassIds || [],
        start_date: program.startDate, 
        end_date: program.endDate,
        schedules: program.schedules
    }).eq('id', id);
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};

export const deleteAssessmentProgram = async (id: string) => {
    if (!isSupabaseConfigured()) return { success: true };
    const { error } = await supabase.from('assessment_programs').delete().eq('id', id);
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};

export const getAssessmentPrograms = async (target?: 'TEACHER' | 'PARENT', classId?: string) => {
    if (!isSupabaseConfigured()) return [];
    const schoolId = getSchoolId();
    if (!schoolId) return [];
    let query = supabase.from('assessment_programs').select('*').eq('school_id', schoolId).order('created_at', { ascending: false });
    
    const { data } = await query;
    if (!data) return [];
    
    return data.filter((p: any) => {
        if (target && p.assignee !== 'BOTH' && p.assignee !== target) return false;
        if (classId) {
           if (p.target_class_ids && Array.isArray(p.target_class_ids) && p.target_class_ids.length > 0) {
               if (!p.target_class_ids.includes(classId)) return false;
           }
        }
        return true;
    }).map((p: any) => ({
        id: p.id,
        schoolId: p.school_id,
        name: p.name,
        type: p.type,
        frequency: p.frequency,
        questions: p.questions,
        assignee: p.assignee,
        targetClassIds: p.target_class_ids,
        startDate: p.start_date,
        endDate: p.end_date,
        schedules: p.schedules || [],
        createdAt: p.created_at
    }));
};

export const logAssessmentEntry = async (log: Partial<AssessmentLog>) => {
    if (!isSupabaseConfigured()) return { success: true };
    let total = 0;
    if (log.data) {
        total = Object.values(log.data).reduce((a, b) => a + b, 0);
    }

    const { error } = await supabase.from('assessment_logs').upsert({
        program_id: log.programId,
        student_id: log.studentId,
        date: log.date,
        data: log.data,
        total_score: total
    }, { onConflict: 'program_id, student_id, date' });

    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};

export const getAssessmentLogs = async (programId: string, date: string, studentId?: string) => {
    if (!isSupabaseConfigured()) return [];
    let query = supabase.from('assessment_logs').select('*').eq('program_id', programId).eq('date', date);
    if (studentId) query = query.eq('student_id', studentId);
    const { data } = await query;
    return (data || []).map((l: any) => ({
        id: l.id,
        programId: l.program_id,
        studentId: l.student_id,
        date: l.date,
        data: l.data,
        totalScore: l.total_score
    }));
};

export const getStudentAssessmentStats = async (studentId: string) => {
    if (!isSupabaseConfigured()) return { programs: [], history: [] };
    const { data } = await supabase.from('assessment_logs').select('program_id, total_score, date, assessment_programs(name, type, questions)').eq('student_id', studentId).order('date', { ascending: false });
    
    if (!data) return { programs: [], history: [] };
    
    const programs: Record<string, any> = {};
    const history: any[] = [];
    
    if (Array.isArray(data)) {
        data.forEach((log: any) => {
            const progName = log.assessment_programs?.name || 'Unknown';
            if (!programs[progName]) {
                programs[progName] = { name: progName, totalScore: 0, entries: 0, type: log.assessment_programs?.type };
            }
            programs[progName].totalScore += log.total_score;
            programs[progName].entries += 1;
            
            history.push({
                date: log.date,
                program: progName,
                score: log.total_score,
                type: log.assessment_programs?.type,
                max: log.assessment_programs?.questions?.length * (log.assessment_programs?.type === 'STAR' ? 5 : 3) 
            });
        });
    }

    return {
        programs: Object.values(programs).map((p: any) => ({
            ...p,
            average: (p.totalScore / p.entries).toFixed(1)
        })),
        history
    };
};

export const getLeaderboard = async (programId: string): Promise<LeaderboardEntry[]> => {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('assessment_logs')
      .select('student_id, total_score')
      .eq('program_id', programId);
    
    if (!data) return [];

    const scoreMap: Record<string, number> = {};
    if (Array.isArray(data)) {
        data.forEach((l: any) => {
            scoreMap[l.student_id] = (scoreMap[l.student_id] || 0) + l.total_score;
        });
    }

    const studentIds = Object.keys(scoreMap);
    if (studentIds.length === 0) return [];

    const { data: students } = await supabase.from('students')
      .select('id, name, classes(name), photo_url')
      .in('id', studentIds);
    
    const leaderboard = (students || []).map((s: any) => ({
        studentId: s.id,
        name: s.name,
        className: s.classes?.name,
        photoUrl: s.photo_url,
        totalScore: scoreMap[s.id],
        rank: 0
    })).sort((a, b) => b.totalScore - a.totalScore).slice(0, 100);

    leaderboard.forEach((entry, idx) => entry.rank = idx + 1);
    
    return leaderboard;
};
