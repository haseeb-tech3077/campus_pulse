import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { appendAssessment, appendAttendance, getAttendanceStats, getCourseRecord, getMarkSections, getMarkTotals, getStudentCourses, setAssessmentScore as updateAssessmentScore, setProjectRecord, setSectionAbsolute } from '../services/portalService';
import { ActionButton, colors, DataRow, PageTitle, Panel, TableHeader, TableLine } from '../components/PortalUI';

function Choice({ label, selected, onPress }) {
  return <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text></Pressable>;
}

function validDate(value) {
  const iso = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const readable = value.trim().match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const year = iso ? Number(iso[1]) : readable ? Number(readable[3]) : NaN;
  const month = iso ? Number(iso[2]) : readable ? months.indexOf(readable[2].toLowerCase()) + 1 : NaN;
  const day = iso ? Number(iso[3]) : readable ? Number(readable[1]) : NaN;
  if (!year || !month || !day) return false;
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    && year === today.getFullYear() && date <= today;
}

export default function AdminPanelScreen({ students, onUpdateStudent }) {
  const roster = Array.isArray(students) ? students.filter(item => item && item.id) : [];
  const [studentId, setStudentId] = useState(roster[0]?.id || '');
  const [courseId, setCourseId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('P');
  const [assessmentKey, setAssessmentKey] = useState('');
  const [assessmentScore, setAssessmentScoreInput] = useState('');
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionWeight, setSectionWeight] = useState('');
  const [newAssessmentType, setNewAssessmentType] = useState('Quizzes');
  const [newAssessmentName, setNewAssessmentName] = useState('');
  const [newAssessmentScore, setNewAssessmentScore] = useState('');
  const [newAssessmentTotal, setNewAssessmentTotal] = useState('10');
  const [grade, setGrade] = useState('');
  const [semester, setSemester] = useState('Fall 2026');
  const [message, setMessage] = useState('');

  const selectedStudent = roster.find(item => item.id === studentId) || roster[0];
  const courses = selectedStudent ? getStudentCourses(selectedStudent) : [];
  const selectedCourse = courses.find(item => item.id === courseId) || courses[0];
  const record = selectedStudent && selectedCourse ? getCourseRecord(selectedStudent, selectedCourse.id) : { attendance: [], marks: [] };
  const sections = getMarkSections(record);
  const assessments = sections.flatMap(section => section.assessments.map(assessment => ({ section: section.title, assessment })));
  const selectedAssessment = assessments.find(item => `${item.section}:${item.assessment.name}` === assessmentKey) || assessments[0];
  const selectedSection = sections.find(item => item.title === sectionTitle) || sections[0];

  useEffect(() => {
    const nextStudent = roster.find(item => item.id === studentId) || roster[0];
    const nextCourse = nextStudent ? getStudentCourses(nextStudent)[0] : null;
    setCourseId(nextCourse?.id || '');
    setAssessmentKey(''); setAssessmentScoreInput(''); setSectionTitle(''); setSectionWeight(''); setMessage('');
  }, [studentId]);
  useEffect(() => {
    setAssessmentKey(''); setAssessmentScoreInput(''); setMessage('');
    const nextRecord = selectedStudent && courseId ? getCourseRecord(selectedStudent, courseId) : null;
    const nextSections = nextRecord ? getMarkSections(nextRecord) : [];
    setSectionTitle(nextSections[0]?.title || '');
    setSectionWeight(String(nextSections[0]?.assessments.reduce((sum, item) => sum + item.absolute, 0) || ''));
  }, [courseId, studentId]);

  if (!selectedStudent) return <View style={styles.wrap}><Text style={styles.empty}>There are no student records available to display.</Text></View>;
  const attendanceStats = getAttendanceStats(record);
  const markTotals = getMarkTotals(record);

  const addAttendance = () => {
    if (!selectedCourse) { setMessage('Select a registered course first.'); return; }
    if (!validDate(attendanceDate)) { setMessage(`Use a valid date in ${new Date().getFullYear()} that is not later than today (DD-MMM-YYYY or YYYY-MM-DD).`); return; }
    onUpdateStudent(selectedStudent.id, current => appendAttendance(current, selectedCourse.id, attendanceStatus, attendanceDate.trim()));
    setAttendanceDate(''); setMessage(`Attendance added for ${selectedCourse.code}.`);
  };
  const saveMark = () => {
    if (!selectedAssessment) { setMessage('This course has no assessment records to update.'); return; }
    const scoreText = typeof assessmentScore === 'string' ? assessmentScore.trim() : '';
    const score = Number(scoreText);
    if (!scoreText || !Number.isFinite(score) || score < 0 || score > selectedAssessment.assessment.total) {
      setMessage(`Enter a score between 0 and ${selectedAssessment.assessment.total}.`); return;
    }
    onUpdateStudent(selectedStudent.id, current => updateAssessmentScore(current, selectedCourse.id, selectedAssessment.section, selectedAssessment.assessment.name, score));
    setMessage(`${selectedAssessment.assessment.name} score updated for ${selectedCourse.code}.`);
  };
  const saveSectionWeight = () => {
    if (!selectedSection) { setMessage('This course has no mark sections to adjust.'); return; }
    const requested = Number(sectionWeight);
    if (!sectionWeight.trim() || !Number.isFinite(requested) || requested < 0 || requested > 100) {
      setMessage('Enter a section weight from 0 to 100 absolutes.'); return;
    }
    const currentSectionWeight = selectedSection.assessments.reduce((sum, item) => sum + item.absolute, 0);
    const currentCourseWeight = sections.reduce((sum, section) => sum + section.assessments.reduce((part, item) => part + item.absolute, 0), 0);
    if (currentCourseWeight - currentSectionWeight + requested > 100) {
      setMessage(`The course total cannot exceed 100 absolutes. Other sections already use ${(currentCourseWeight - currentSectionWeight).toFixed(2)}.`); return;
    }
    onUpdateStudent(selectedStudent.id, current => setSectionAbsolute(current, selectedCourse.id, selectedSection.title, requested));
    setMessage(`${selectedSection.title} weight updated to ${requested} absolutes.`);
  };
  const addAssessment = () => {
    if (!selectedCourse) { setMessage('Select a registered course first.'); return; }
    const total = Number(newAssessmentTotal);
    const obtained = Number(newAssessmentScore);
    if (!Number.isFinite(total) || total <= 0 || total > 100 || !newAssessmentTotal.trim()) { setMessage('Assessment maximum must be greater than 0 and no more than 100.'); return; }
    if (!newAssessmentScore.trim() || !Number.isFinite(obtained) || obtained < 0 || obtained > total) { setMessage(`Enter a score between 0 and ${total}.`); return; }
    const existingItems = newAssessmentType === 'Quizzes' ? (record.marks.quizzes || []) : (record.marks.assignments || []);
    const defaultName = `${newAssessmentType === 'Quizzes' ? 'Quiz' : 'Assignment'} ${existingItems.length + 1}`;
    const name = newAssessmentName.trim() || defaultName;
    if (existingItems.some(item => item.name.toLowerCase() === name.toLowerCase())) { setMessage('An assessment with this name already exists.'); return; }
    onUpdateStudent(selectedStudent.id, current => appendAssessment(current, selectedCourse.id, newAssessmentType, { name, obtained, total }));
    setNewAssessmentName(''); setNewAssessmentScore(''); setNewAssessmentTotal('10');
    setMessage(`${name} added. ${newAssessmentType.toLowerCase()} weights were redistributed evenly.`);
  };
  const addProject = () => {
    const final = record.marks.finalExam;
    const allocation = Math.min(20, final?.absolute || 0);
    onUpdateStudent(selectedStudent.id, current => {
      let next = setProjectRecord(current, selectedCourse.id, { name: 'Project', obtained: 0, total: 20, absolute: allocation });
      if (final && allocation) next = setSectionAbsolute(next, selectedCourse.id, 'Final exam', final.absolute - allocation);
      return next;
    });
    setMessage(`Project added with ${allocation} absolutes. The final-exam weight was adjusted to keep the course at or below 100.`);
  };
  const removeProject = () => {
    const projectWeight = record.marks.project?.absolute || 0;
    const finalWeight = record.marks.finalExam?.absolute || 0;
    onUpdateStudent(selectedStudent.id, current => {
      let next = setProjectRecord(current, selectedCourse.id, null);
      if (projectWeight) next = setSectionAbsolute(next, selectedCourse.id, 'Final exam', finalWeight + projectWeight);
      return next;
    });
    setMessage('Project removed. Its weight was returned to the final exam.');
  };
  const saveGrade = () => {
    const value = grade.trim().toUpperCase();
    if (!selectedCourse) { setMessage('Select a registered course first.'); return; }
    if (!/^(A\+|A-|A|B\+|B-|B|C\+|C-|C|D\+|D-|D|F|I|S|U|W)$/.test(value)) { setMessage('Use a valid grade such as A, B+, C-, F, or I.'); return; }
    if (!/^(Spring|Summer|Fall)\s+20\d{2}$/i.test(semester.trim())) { setMessage('Enter a semester such as Fall 2026 or Spring 2027.'); return; }
    onUpdateStudent(selectedStudent.id, current => {
      const transcript = [...(current.transcript || [])];
      const index = transcript.findIndex(item => item.semester === semester.trim());
      const previous = index >= 0 ? transcript[index] : null;
      const courseGrades = [...(previous?.courses || [])];
      const gradeIndex = courseGrades.findIndex(item => item.code === selectedCourse.code);
      const entry = { code: selectedCourse.code, name: selectedCourse.name, grade: value };
      if (gradeIndex >= 0) courseGrades[gradeIndex] = entry; else courseGrades.push(entry);
      const latest = transcript[transcript.length - 1];
      const next = previous ? { ...previous, courses: courseGrades } : { semester: semester.trim(), sgpa: latest?.sgpa || 0, cgpa: latest?.cgpa || 0, courses: courseGrades };
      if (index >= 0) transcript[index] = next; else transcript.push(next);
      return { ...current, transcript };
    });
    setMessage(`${value} grade saved for ${selectedCourse.code} in ${semester.trim()}.`);
    setGrade('');
  };

  return <ScrollView contentContainerStyle={styles.wrap}>
    <PageTitle title="Admin panel" subtitle="Review student records and maintain attendance, marks, and transcript grades." />
    <Panel title="Student roster">
      {roster.map(item => <Pressable key={item.id} onPress={() => setStudentId(item.id)} style={[styles.studentRow, item.id === studentId && styles.studentSelected]}>
        <View style={styles.studentIdentity}><Text style={styles.studentName}>{item.name}</Text><Text style={styles.meta}>{item.rollNo} · {item.section}</Text></View>
        <Text style={styles.meta}>{item.registeredCourseIds.length} courses</Text>
      </Pressable>)}
    </Panel>
    <Panel title="Student information">
      <DataRow label="Name" value={selectedStudent.name} /><DataRow label="Roll number" value={selectedStudent.rollNo} /><DataRow label="Section" value={selectedStudent.section} />
      <DataRow label="Father's name" value={selectedStudent.personal?.fatherName || 'Not provided'} /><DataRow label="CNIC" value={selectedStudent.personal?.cnic || 'Not provided'} /><DataRow label="Address" value={selectedStudent.personal?.address || 'Not provided'} /><DataRow label="Phone" value={selectedStudent.personal?.phone || 'Not provided'} />
      <DataRow label="Fee balance" value={`Rs. ${Math.max(0, (selectedStudent.fees?.tuition || 0) - (selectedStudent.fees?.paid || 0)).toLocaleString()}`} />
    </Panel>
    <Panel title="Course records">
      <View style={styles.choiceRow}>{courses.map(course => <Choice key={course.id} label={course.code} selected={selectedCourse?.id === course.id} onPress={() => setCourseId(course.id)} />)}</View>
      {selectedCourse ? <>
        <Text style={styles.courseTitle}>{selectedCourse.name}</Text>
        <View style={styles.statRow}><View style={styles.statCard}><Text style={styles.label}>ATTENDANCE</Text><Text style={styles.statValue}>{attendanceStats.percent}%</Text><Text style={styles.meta}>{attendanceStats.present} present · {attendanceStats.absent} absent · {attendanceStats.total} classes</Text></View><View style={styles.statCard}><Text style={styles.label}>ABSOLUTES</Text><Text style={styles.statValue}>{markTotals.obtained.toFixed(2)} / {markTotals.total}</Text><Text style={styles.meta}>{markTotals.lost.toFixed(2)} lost</Text></View></View>
        <Text style={styles.sectionTitle}>Attendance records</Text>
        <TableHeader columns={['Class #','Date','Status']} />
        {record.attendance.map((status, index) => <TableLine key={`${selectedCourse.id}-${index}`} values={[index + 1, record.attendanceDates?.[index] || `Class date ${index + 1}`, status === 'P' ? 'Present' : 'Absent']} />)}
        {sections.map(section => <View key={section.title}><Text style={styles.sectionTitle}>{section.title}</Text><TableHeader columns={['Assessment','Raw score','Weight']} />{section.assessments.map(item => <TableLine key={item.name} values={[item.name, `${item.obtained}/${item.total}`, item.absolute]} />)}</View>)}
        <Text style={styles.sectionTitle}>Transcript and grades</Text>
        {selectedStudent.transcript.map(term => <View key={term.semester} style={styles.transcriptTerm}><Text style={styles.termTitle}>{term.semester} · SGPA {term.sgpa.toFixed(2)} · CGPA {term.cgpa.toFixed(2)}</Text>{term.courses.map(item => <Text key={item.code} style={styles.gradeLine}>{item.code} · {item.name}: <Text style={styles.gradeValue}>{item.grade}</Text></Text>)}</View>)}
      </> : <Text style={styles.empty}>This student has no registered courses.</Text>}
    </Panel>
    {selectedCourse ? <Panel title="Update records">
      <Text style={styles.sectionTitle}>Add attendance</Text>
      <TextInput value={attendanceDate} onChangeText={setAttendanceDate} placeholder={`Class date this year (e.g. 02-Oct-${new Date().getFullYear()})`} style={styles.input} accessibilityLabel="Class date, current year and not in the future" />
      <View style={styles.choiceRow}><Choice label="Present" selected={attendanceStatus === 'P'} onPress={() => setAttendanceStatus('P')} /><Choice label="Absent" selected={attendanceStatus === 'A'} onPress={() => setAttendanceStatus('A')} /></View>
      <ActionButton title="Add attendance record" onPress={addAttendance} />
      <Text style={styles.sectionTitle}>Update assessment mark</Text>
      <View style={styles.choiceRow}>{assessments.map(item => { const key = `${item.section}:${item.assessment.name}`; return <Choice key={key} label={item.assessment.name} selected={(selectedAssessment && key === `${selectedAssessment.section}:${selectedAssessment.assessment.name}`)} onPress={() => { setAssessmentKey(key); setAssessmentScoreInput(String(item.assessment.obtained)); }} />; })}</View>
      {selectedAssessment ? <><Text style={styles.meta}>Score out of {selectedAssessment.assessment.total} · {selectedAssessment.section}</Text><TextInput value={typeof assessmentScore === 'string' ? (assessmentScore || (!assessmentKey ? String(selectedAssessment.assessment.obtained) : '')) : ''} onChangeText={setAssessmentScoreInput} keyboardType="decimal-pad" placeholder="Obtained score" style={styles.input} accessibilityLabel="Assessment score" /><ActionButton title="Save mark" onPress={saveMark} /></> : <Text style={styles.empty}>No assessment marks are available for this course.</Text>}
      <Text style={styles.sectionTitle}>Adjust section absolutes</Text>
      <View style={styles.choiceRow}>{sections.map(section => <Choice key={section.title} label={section.title} selected={selectedSection?.title === section.title} onPress={() => { setSectionTitle(section.title); setSectionWeight(String(section.assessments.reduce((sum, item) => sum + item.absolute, 0))); }} />)}</View>
      {selectedSection ? <><Text style={styles.meta}>Current {selectedSection.title} weight: {selectedSection.assessments.reduce((sum, item) => sum + item.absolute, 0).toFixed(2)} absolutes. Weight is split evenly across this section's assessments.</Text><TextInput value={sectionWeight} onChangeText={setSectionWeight} keyboardType="decimal-pad" placeholder="Section total absolutes" style={styles.input} accessibilityLabel="Section total absolutes" /><ActionButton title="Save section weight" onPress={saveSectionWeight} /></> : <Text style={styles.empty}>No mark sections are available for this course.</Text>}
      <Text style={styles.sectionTitle}>Add a quiz or assignment</Text>
      <View style={styles.choiceRow}><Choice label="Quiz" selected={newAssessmentType === 'Quizzes'} onPress={() => setNewAssessmentType('Quizzes')} /><Choice label="Assignment" selected={newAssessmentType === 'Assignments'} onPress={() => setNewAssessmentType('Assignments')} /></View>
      <TextInput value={newAssessmentName} onChangeText={setNewAssessmentName} maxLength={40} placeholder={`Optional name (e.g. ${newAssessmentType === 'Quizzes' ? 'Quiz' : 'Assignment'} ${newAssessmentType === 'Quizzes' ? (record.marks.quizzes?.length || 0) + 1 : (record.marks.assignments?.length || 0) + 1})`} style={styles.input} accessibilityLabel="New assessment name" />
      <View style={styles.assessmentInputRow}><TextInput value={newAssessmentScore} onChangeText={setNewAssessmentScore} keyboardType="decimal-pad" placeholder="Score" style={[styles.input, styles.assessmentInput]} accessibilityLabel="New assessment score" /><TextInput value={newAssessmentTotal} onChangeText={setNewAssessmentTotal} keyboardType="decimal-pad" placeholder="Out of" style={[styles.input, styles.assessmentInput]} accessibilityLabel="Assessment maximum score" /></View>
      <ActionButton title={`Add ${newAssessmentType === 'Quizzes' ? 'quiz' : 'assignment'}`} onPress={addAssessment} />
      <Text style={styles.meta}>Adding an assessment redistributes its section's existing absolutes evenly. There may be any number of quizzes and assignments.</Text>
      <Text style={styles.sectionTitle}>Optional project</Text>
      {record.marks.project ? <View style={styles.projectRow}><Text style={styles.meta}>Project is included at {record.marks.project.absolute} absolutes.</Text><ActionButton title="Remove project" secondary onPress={removeProject} /></View> : <><Text style={styles.meta}>No project is included for this course.</Text><ActionButton title="Add project" secondary onPress={addProject} /></>}
      <Text style={styles.sectionTitle}>Add or update course grade</Text>
      <TextInput value={semester} onChangeText={setSemester} maxLength={20} placeholder="Semester (e.g. Fall 2026)" style={styles.input} accessibilityLabel="Grade semester" />
      <TextInput value={grade} onChangeText={setGrade} autoCapitalize="characters" maxLength={3} placeholder="Grade (e.g. A or B+)" style={styles.input} accessibilityLabel="Course grade" />
      <ActionButton title="Save course grade" onPress={saveGrade} />
    </Panel> : null}
    {!!message && <View style={styles.messageBox}><Text style={styles.message}>{message}</Text></View>}
    <Text style={styles.footnote}>Admin changes are stored in this demo session and appear in the student views.</Text>
  </ScrollView>;
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingBottom: 24, width: '100%', maxWidth: 1220, alignSelf: 'center' },
  studentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 11, borderBottomWidth: 1, borderColor: colors.line },
  studentSelected: { backgroundColor: colors.softBlue, borderLeftWidth: 3, borderLeftColor: colors.indigo },
  studentIdentity: { flex: 1 }, studentName: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 10, marginTop: 4, lineHeight: 15 },
  courseTitle: { color: colors.ink, fontSize: 14, fontWeight: '700', marginVertical: 10 },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginVertical: 8 },
  choice: { paddingHorizontal: 11, paddingVertical: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white },
  choiceSelected: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  choiceText: { color: colors.ink, fontSize: 10, fontWeight: '700' }, choiceTextSelected: { color: colors.white },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 },
  statCard: { flex: 1, minWidth: 130, padding: 10, borderWidth: 1, borderColor: colors.line, borderTopWidth: 3, borderTopColor: colors.blue, backgroundColor: colors.white },
  label: { color: colors.muted, fontSize: 9, fontWeight: '800' }, statValue: { color: colors.indigo, fontSize: 18, fontWeight: '800', marginTop: 5 },
  sectionTitle: { color: colors.indigo, fontSize: 12, fontWeight: '800', marginTop: 14, marginBottom: 7 },
  transcriptTerm: { borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 7 },
  termTitle: { color: colors.ink, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  gradeLine: { color: colors.muted, fontSize: 10, lineHeight: 16 }, gradeValue: { color: colors.indigo, fontWeight: '800' },
  input: { minHeight: 42, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fbfcff', paddingHorizontal: 10, paddingVertical: 9, color: colors.ink, fontSize: 12, marginBottom: 8 },
  assessmentInputRow: { flexDirection: 'row', gap: 8 }, assessmentInput: { flex: 1, minWidth: 0 },
  projectRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  empty: { color: colors.muted, fontSize: 11, paddingVertical: 10 },
  messageBox: { backgroundColor: colors.softBlue, borderWidth: 1, borderColor: colors.line, padding: 10, marginBottom: 9 }, message: { color: colors.indigo, fontSize: 11 },
  footnote: { color: colors.muted, fontSize: 10, textAlign: 'center', paddingVertical: 8 },
});
