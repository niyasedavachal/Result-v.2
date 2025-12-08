
import { supabase } from '../supabaseClient';
import { Marks } from '../../types';
import { getErrorMsg, transformMarks } from '../utils';

export const getMarks = async (studentId: string, term: string) => {
    const { data: rpcData, error } = await supabase.rpc('get_student_marks', { stu_id: studentId, term_in: term });
    if (!error && rpcData && rpcData.length > 0) return transformMarks(rpcData[0]);
    const { data } = await supabase.from('marks').select('*').eq('student_id', studentId).eq('term', term).single();
    if (data) return transformMarks(data);
    return null;
};

export const saveMarks = async (marks: Marks) => {
    const { error } = await supabase.rpc('save_marks', {
        stu_id: marks.studentId,
        term_in: marks.term,
        sub_json: marks.subjects,
        tot: marks.total,
        grd: marks.grade
    });
    return { success: !error, message: error ? getErrorMsg(error) : undefined };
};
