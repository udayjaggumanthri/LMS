import { Course } from '../types';

export function courseFacultyIds(course: Pick<Course, 'instructorId' | 'instructorIds'>): string[] {
  const ids: string[] = [];
  const push = (value?: string) => {
    const id = String(value || '');
    if (id && !ids.includes(id)) ids.push(id);
  };
  (course.instructorIds || []).forEach((id) => push(id));
  push(course.instructorId);
  return ids;
}

export function userTeachesCourse(course: Pick<Course, 'instructorId' | 'instructorIds'>, userId?: string): boolean {
  if (!userId) return false;
  return courseFacultyIds(course).includes(String(userId));
}
