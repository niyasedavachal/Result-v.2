

import { supabase } from '../supabaseClient';
import { Exam, Question, ExamSubmission } from '../../types';
import { getSchoolId, getErrorMsg } from '../utils';

export const createExam = async (exam: Partial<Exam>) => {
    const schoolId = getSchoolId();
    if (!schoolId) return { success: false, message: "Session expired" };
    
    const { error } = await supabase.from('exams').insert([{
        school_id: schoolId,
        class_id: exam.classId,
        title: exam.title,
        description: exam.description,
        start_time: exam.startTime,
        end_time: exam.endTime,
        duration_minutes: exam.durationMinutes,
        questions: exam.questions,
        settings: exam.settings, // Added Settings
        is_published: true
    }]);
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};

export const deleteExam = async (id: string) => {
    const { error } = await supabase.from('exams').delete().eq('id', id);
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};

export const getExamsForClass = async (classId: string) => {
    const { data } = await supabase.from('exams')
        .select('*')
        .eq('class_id', classId)
        .order('start_time', { ascending: false });
    
    return (data || []).map((e: any) => ({
        id: e.id,
        schoolId: e.school_id,
        classId: e.class_id,
        title: e.title,
        description: e.description,
        startTime: e.start_time,
        endTime: e.end_time,
        durationMinutes: e.duration_minutes,
        questions: e.questions,
        isPublished: e.is_published,
        settings: e.settings, // Mapped
        createdAt: e.created_at
    } as Exam));
};

export const getExamSubmission = async (examId: string, studentId: string) => {
    const { data } = await supabase.from('exam_submissions')
        .select('*')
        .eq('exam_id', examId)
        .eq('student_id', studentId)
        .maybeSingle();
    
    if (!data) return null;
    return {
        id: data.id,
        examId: data.exam_id,
        studentId: data.student_id,
        answers: data.answers,
        score: data.score,
        totalMarks: data.total_marks,
        submittedAt: data.submitted_at
    } as ExamSubmission;
};

export const submitExam = async (examId: string, studentId: string, answers: Record<string, number>, score: number, totalMarks: number) => {
    const { error } = await supabase.from('exam_submissions').insert([{
        exam_id: examId,
        student_id: studentId,
        answers: answers,
        score: score,
        total_marks: totalMarks
    }]);
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};

export const getExamSubmissionsForTeacher = async (examId: string) => {
    const { data } = await supabase.from('exam_submissions')
        .select('*, students(name, roll_no)')
        .eq('exam_id', examId)
        .order('score', { ascending: false }); // Ordered by rank
        
    return (data || []).map((s: any) => ({
        id: s.id,
        examId: s.exam_id,
        studentId: s.student_id,
        studentName: s.students?.name,
        rollNo: s.students?.roll_no,
        answers: s.answers,
        score: s.score,
        totalMarks: s.total_marks,
        submittedAt: s.submitted_at
    } as ExamSubmission));
};