import { CLASS_DATES, COURSE_CATALOG } from '../data/flexData';

export function getCourse(courseId) {
  return COURSE_CATALOG.find(course => course.id === courseId);
}

export function getStudentCourses(student) {
  return student.registeredCourseIds.map(getCourse).filter(Boolean);
}

export function getCourseRecord(student, courseId) {
  return student.courseRecords[courseId] || { attendance: [], marks: [] };
}

export function getAttendanceStats(record) {
  const present = record.attendance.filter(status => status === 'P').length;
  const total = record.attendance.length;
  return { present, total, absent: total - present, percent: total ? Math.round((present / total) * 100) : 0 };
}

export function getMarkTotals(record) {
  const sections = getMarkSections(record);
  const total = sections.reduce((sum, section) => sum + section.assessments.reduce((part, assessment) => part + assessment.absolute, 0), 0);
  const obtained = sections.reduce((sum, section) => sum + section.assessments.reduce((part, assessment) => part + (assessment.obtained / assessment.total) * assessment.absolute, 0), 0);
  const roundedObtained = Math.round(obtained * 100) / 100;
  const roundedTotal = Math.round(total * 100) / 100;
  return { total: roundedTotal, obtained: roundedObtained, lost: Math.round((roundedTotal - roundedObtained) * 100) / 100 };
}

export function getMarkSections(record) {
  const marks = record.marks;
  if (!marks || Array.isArray(marks)) return [];
  return [
    { title: 'Quizzes', assessments: marks.quizzes || [] },
    { title: 'Assignments', assessments: Array.isArray(marks.assignments) ? marks.assignments : marks.assignment ? [marks.assignment] : [] },
    { title: 'Sessionals', assessments: marks.sessionals || [] },
    { title: 'Project', assessments: marks.project ? [marks.project] : marks.coursework ? [marks.coursework] : [] },
    { title: 'Final exam', assessments: marks.finalExam ? [marks.finalExam] : [] },
  ].filter(section => section.assessments.length > 0);
}

export function setSectionAbsolute(student, courseId, sectionTitle, totalAbsolute) {
  const record = getCourseRecord(student, courseId);
  const marks = record.marks || {};
  const keys = { Quizzes: 'quizzes', Assignments: 'assignments', Sessionals: 'sessionals', Project: 'project', Coursework: 'coursework', 'Final exam': 'finalExam' };
  const key = keys[sectionTitle];
  if (!key) return student;
  const assessments = Array.isArray(marks[key]) ? marks[key] : marks[key] ? [marks[key]] : [];
  if (!assessments.length) return student;
  const eachAbsolute = totalAbsolute / assessments.length;
  const nextValues = assessments.map(item => ({ ...item, absolute: eachAbsolute }));
  const nextMarks = Array.isArray(marks[key]) ? nextValues : { ...marks[key], absolute: eachAbsolute };
  return { ...student, courseRecords: { ...student.courseRecords, [courseId]: { ...record, marks: { ...marks, [key]: nextMarks } } } };
}

export function getAssessmentAbsolute(assessment) {
  const earned = (assessment.obtained / assessment.total) * assessment.absolute;
  const roundedEarned = Math.round(earned * 100) / 100;
  return { earned: roundedEarned, lost: Math.round((assessment.absolute - roundedEarned) * 100) / 100 };
}

export function getAttendanceRows(student) {
  return getStudentCourses(student).flatMap(course => {
    const record = getCourseRecord(student, course.id);
    return record.attendance.map((status, index) => ({
      id: `${course.id}-${index}`,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      lecture: index + 1,
      date: record.attendanceDates?.[index] || CLASS_DATES[index] || 'Date not recorded',
      status,
    }));
  });
}

export function getOverallAttendance(student) {
  const rows = getAttendanceRows(student);
  const present = rows.filter(row => row.status === 'P').length;
  return rows.length ? Math.round((present / rows.length) * 100) : 0;
}

export function appendAttendance(student, courseId, status, date) {
  const record = getCourseRecord(student, courseId);
  const index = record.attendance.length;
  const dates = [...(record.attendanceDates || [])];
  dates[index] = date;
  return {
    ...student,
    courseRecords: {
      ...student.courseRecords,
      [courseId]: { ...record, attendance: [...record.attendance, status], attendanceDates: dates },
    },
  };
}

export function setAssessmentScore(student, courseId, sectionTitle, assessmentName, score) {
  const record = getCourseRecord(student, courseId);
  const marks = record.marks || {};
  const keyByTitle = { Quizzes: 'quizzes', Assignments: 'assignments', Sessionals: 'sessionals', Project: 'project', Coursework: 'coursework', 'Final exam': 'finalExam' };
  const key = keyByTitle[sectionTitle];
  if (!key) return student;
  if (key === 'coursework' || key === 'project' || key === 'finalExam') {
    const assessment = marks[key];
    if (!assessment || assessment.name !== assessmentName) return student;
    return { ...student, courseRecords: { ...student.courseRecords, [courseId]: { ...record, marks: { ...marks, [key]: { ...assessment, obtained: score } } } } };
  }
  return {
    ...student,
    courseRecords: {
      ...student.courseRecords,
      [courseId]: {
        ...record,
        marks: { ...marks, [key]: (marks[key] || []).map(assessment => assessment.name === assessmentName ? { ...assessment, obtained: score } : assessment) },
      },
    },
  };
}

export function appendAssessment(student, courseId, sectionTitle, assessment) {
  const record = getCourseRecord(student, courseId);
  const marks = record.marks || {};
  const key = sectionTitle === 'Quizzes' ? 'quizzes' : sectionTitle === 'Assignments' ? 'assignments' : null;
  if (!key) return student;
  const existing = marks[key] || [];
  const existingWeight = existing.reduce((sum, item) => sum + item.absolute, 0);
  const sectionWeight = existing.length ? existingWeight : 5;
  const nextItems = [...existing, { ...assessment, absolute: 0 }];
  const eachAbsolute = sectionWeight / nextItems.length;
  const balanced = nextItems.map(item => ({ ...item, absolute: eachAbsolute }));
  return { ...student, courseRecords: { ...student.courseRecords, [courseId]: { ...record, marks: { ...marks, [key]: balanced } } } };
}

export function setProjectRecord(student, courseId, project) {
  const record = getCourseRecord(student, courseId);
  const marks = record.marks || {};
  return { ...student, courseRecords: { ...student.courseRecords, [courseId]: { ...record, marks: { ...marks, project } } } };
}

export function upsertTranscriptGrade(student, semester, course, grade) {
  const transcript = [...(student.transcript || [])];
  const index = transcript.findIndex(entry => entry.semester === semester);
  const current = index >= 0 ? transcript[index] : null;
  const latest = transcript[transcript.length - 1];
  const courses = [...(current?.courses || [])];
  const courseIndex = courses.findIndex(entry => entry.code === course.code);
  const gradeEntry = { code: course.code, name: course.name, grade };
  if (courseIndex >= 0) courses[courseIndex] = gradeEntry;
  else courses.push(gradeEntry);
  const next = current
    ? { ...current, courses }
    : { semester, sgpa: latest?.sgpa || 0, cgpa: latest?.cgpa || 0, courses };
  if (index >= 0) transcript[index] = next;
  else transcript.push(next);
  return { ...student, transcript };
}
