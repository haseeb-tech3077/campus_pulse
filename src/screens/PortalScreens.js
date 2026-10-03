import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { CLASS_DATES, COURSE_CATALOG, STUDY_PLAN } from '../data/flexData';
import { getAssessmentAbsolute, getAttendanceStats, getCourse, getCourseRecord, getMarkSections, getMarkTotals, getOverallAttendance, getStudentCourses } from '../services/portalService';
import { ActionButton, colors, DataRow, PageTitle, Panel, StatCard, StatusTag, TableHeader, TableLine } from '../components/PortalUI';

function FooterSpace() { return <View style={{ height: 24 }} />; }

export function HomeScreen({ student, onNavigate, onUpdatePhone, onToggleTask }) {
  const { width } = useWindowDimensions();
  const [phone, setPhone] = useState(student.personal?.phone || '');
  const [phoneMessage, setPhoneMessage] = useState('');
  useEffect(() => { setPhone(student.personal?.phone || ''); setPhoneMessage(''); }, [student.id, student.personal?.phone]);
  const courses = getStudentCourses(student);
  const attendance = getOverallAttendance(student);
  const totalMarks = courses.reduce((all, course) => {
    const totals = getMarkTotals(getCourseRecord(student, course.id));
    return { obtained: all.obtained + totals.obtained, total: all.total + totals.total };
  }, { obtained: 0, total: 0 });
  const chartWidth = Math.min(width - 52, 500);
  const stats = courses.map(course => getAttendanceStats(getCourseRecord(student, course.id)));
  const belowTarget = courses.filter((course, index) => stats[index].percent < 75);
  return (
    <ScrollView contentContainerStyle={styles.screenPadding}>
      <PageTitle title={`Welcome, ${student.name}`} subtitle={`Roll No. ${student.rollNo}  ·  ${student.section}  ·  Fall 2026`} />
      <View style={styles.statRow}>
        <StatCard label="ATTENDANCE" value={`${attendance}%`} detail="Across registered courses" />
        <StatCard label="COURSES" value={courses.length} detail="Fall 2026" />
        <StatCard label="MARKS" value={`${totalMarks.obtained.toFixed(2)}/${totalMarks.total}`} detail={`${(totalMarks.total - totalMarks.obtained).toFixed(2)} absolutes lost`} />
      </View>
      <Panel title="Personal and contact information">
        <DataRow label="Father's name" value={student.personal?.fatherName || 'Not provided'} />
        <DataRow label="CNIC" value={student.personal?.cnic || 'Not provided'} />
        <DataRow label="Address" value={student.personal?.address || 'Not provided'} />
        <Text style={styles.phoneLabel}>Phone number</Text>
        <View style={styles.phoneEditor}><TextInput value={phone} onChangeText={value => { setPhone(value); setPhoneMessage(''); }} keyboardType="phone-pad" maxLength={20} placeholder="Enter phone number" style={styles.phoneInput} accessibilityLabel="Phone number" /><ActionButton title="Save" onPress={() => {
          const digits = phone.replace(/\D/g, '');
          if (!/^[0-9+() .-]+$/.test(phone.trim()) || digits.length < 7 || digits.length > 15) { setPhoneMessage('Enter a valid phone number using 7–15 digits.'); return; }
          onUpdatePhone(phone.trim()); setPhoneMessage('Phone number saved for this session.');
        }} /></View>
        {!!phoneMessage && <Text style={[styles.phoneMessage, phoneMessage.startsWith('Phone number saved') && styles.successMessage]}>{phoneMessage}</Text>}
      </Panel>
      {belowTarget.length ? <View style={styles.alert}><Text style={styles.alertStrong}>Attendance notice</Text><Text style={styles.alertText}>{belowTarget.map(course => course.code).join(', ')} {belowTarget.length === 1 ? 'is' : 'are'} below the 75% target. Review each course to see the dates.</Text></View> : null}
      <Panel title="Attendance by course">
        {courses.length ? <BarChart data={{ labels: courses.map(course => course.code), datasets: [{ data: courses.map(course => getAttendanceStats(getCourseRecord(student, course.id)).percent) }] }} width={chartWidth} height={210} fromZero yAxisSuffix="%" showValuesOnTopOfBars withInnerLines={false} chartConfig={chartConfig} style={styles.chart} /> : <Text style={styles.empty}>No courses registered yet.</Text>}
        <ActionButton title="Open attendance" secondary onPress={() => onNavigate('Attendance')} />
      </Panel>
      <Panel title="Marks overview">
        {totalMarks.total ? <PieChart data={[{ name: 'Obtained', population: totalMarks.obtained, color: colors.indigo, legendFontColor: colors.ink, legendFontSize: 12 }, { name: 'Lost', population: totalMarks.total - totalMarks.obtained, color: '#cdd4e2', legendFontColor: colors.muted, legendFontSize: 12 }]} width={chartWidth} height={190} accessor="population" backgroundColor="transparent" chartConfig={chartConfig} /> : <Text style={styles.empty}>Marks will appear here when available.</Text>}
        <ActionButton title="View all course marks" secondary onPress={() => onNavigate('Marks')} />
      </Panel>
      <Panel title="My tasks">
        {student.tasks.length ? student.tasks.map(task => <Pressable key={task.id} onPress={() => onToggleTask(task.id)} style={styles.listRow} accessibilityRole="button" accessibilityLabel={`${task.title}, ${task.done ? 'done' : 'open'}. Toggle task status`}>
          <View style={styles.flex}><Text style={[styles.rowTitle, task.done && styles.taskDone]}>{task.title}</Text><Text style={styles.rowMeta}>{getCourse(task.courseId)?.code || 'General'}  ·  Due {task.due}</Text></View>
          <StatusTag good={task.done}>{task.done ? 'Done' : 'Open'}</StatusTag>
        </Pressable>) : <Text style={styles.empty}>No study tasks yet. Add one from Study tasks.</Text>}
        <ActionButton title="Manage study tasks" secondary onPress={() => onNavigate('Planner')} />
      </Panel>
      <Panel title="Quick links"><View style={styles.quickGrid}>{[['Course registration','Registration'],['Fee details','Fees'],['Course feedback','Feedback'],['Retake exam request','RetakeRequest'],['Transcript','Transcript'],['Tentative study plan','TentativePlan'],['Study tasks','Planner']].map(([label, target]) => <Pressable key={target} onPress={() => onNavigate(target)} style={styles.quickLink}><Text style={styles.quickLinkText}>{label}  ›</Text></Pressable>)}</View></Panel>
      <FooterSpace />
    </ScrollView>
  );
}

export function AttendanceScreen({ student, onSelectCourse }) {
  const courses = getStudentCourses(student);
  return <FlatList style={styles.flex} contentContainerStyle={styles.screenPadding} data={courses} keyExtractor={course => course.id} ListHeaderComponent={<><PageTitle title="Attendance" subtitle="Select a course to review each class and its attendance record." /><View style={styles.statRow}><StatCard label="OVERALL" value={`${getOverallAttendance(student)}%`} detail="Across all recorded classes" /></View><Text style={styles.sectionLabel}>ATTENDANCE BY COURSE</Text></>} renderItem={({ item: course }) => {
    const stats = getAttendanceStats(getCourseRecord(student, course.id));
    return <Pressable onPress={() => onSelectCourse(course.id)} style={styles.courseSummary} accessibilityRole="button" accessibilityLabel={`${course.code}, ${stats.percent}% attendance. Open attendance details`}>
      <View style={styles.flex}><Text style={styles.rowTitle}>{course.code} · {course.name}</Text><Text style={styles.rowMeta}>{stats.present} present · {stats.absent} absent · {stats.total} classes</Text></View>
      <View style={styles.marksTotal}><Text style={styles.marksValue}>{stats.percent}%</Text><Text style={styles.rowMeta}>attendance</Text></View><Text style={styles.chevron}>›</Text>
    </Pressable>;
  }} ListEmptyComponent={<Text style={styles.empty}>No registered courses to display attendance for.</Text>} ListFooterComponent={<FooterSpace />} />;
}

export function MarksScreen({ student, onSelectCourse }) {
  const courses = getStudentCourses(student);
  return <FlatList style={styles.flex} contentContainerStyle={styles.screenPadding} data={courses} keyExtractor={course => course.id} ListHeaderComponent={<><PageTitle title="Marks" subtitle="Choose a course to see section-weighted marks and absolutes." /><Text style={styles.sectionLabel}>REGISTERED COURSES</Text></>} renderItem={({ item: course }) => {
    const totals = getMarkTotals(getCourseRecord(student, course.id));
    const belowHalf = totals.total > 0 && totals.obtained / totals.total < 0.5;
    return <Pressable onPress={() => onSelectCourse(course.id)} style={styles.courseSummary}><View style={styles.flex}><Text style={styles.rowTitle}>{course.code} · {course.name}</Text><Text style={styles.rowMeta}>{course.credits} credits  ·  {course.teacher}</Text></View><View style={styles.marksTotal}><Text style={[styles.marksValue, belowHalf && styles.marksDanger]}>{totals.obtained.toFixed(2)}/{totals.total}</Text><Text style={[styles.rowMeta, belowHalf && styles.marksDanger]}>{totals.lost.toFixed(2)} abs. lost</Text></View><Text style={styles.chevron}>›</Text></Pressable>;
  }} ListEmptyComponent={<Text style={styles.empty}>There are no registered courses.</Text>} ListFooterComponent={<FooterSpace />} />;
}

export function CourseDetailsScreen({ student, courseId, source = 'Marks', onBack }) {
  const course = getCourse(courseId);
  if (!course) return <View style={styles.screenPadding}><Text>Course not found.</Text><Pressable onPress={onBack} style={styles.backButton}><Text style={styles.backButtonText}>‹  Back to courses</Text></Pressable></View>;
  const record = getCourseRecord(student, course.id);
  const attendance = getAttendanceStats(record);
  const totals = getMarkTotals(record);
  const belowHalf = totals.total > 0 && totals.obtained / totals.total < 0.5;
  const classes = record.attendance.map((status, index) => ({ id: `${course.id}-${index}`, lecture: index + 1, date: record.attendanceDates?.[index] || CLASS_DATES[index] || 'Date not recorded', status }));
  return <FlatList style={styles.flex} contentContainerStyle={styles.screenPadding} data={classes} keyExtractor={item => item.id} ListHeaderComponent={<>
    <PageTitle title={`${course.code} · ${course.name}`} subtitle={`${course.teacher}  ·  ${course.credits} credits  ·  ${course.section}`} />
    <View style={styles.statRow}><StatCard label="ATTENDANCE" value={`${attendance.percent}%`} detail={`${attendance.present} present / ${attendance.total} classes`} /><StatCard label="ABSENT" value={attendance.absent} detail="Recorded classes missed" />{source !== 'Attendance' ? <View style={styles.absoluteSummary}><Text style={styles.absoluteLabel}>TOTAL ABSOLUTES</Text><Text style={[styles.absoluteValue, belowHalf && styles.marksDanger]}>{totals.obtained.toFixed(2)} / {totals.total}</Text><Text style={[styles.absoluteLost, belowHalf && styles.marksDanger]}>{totals.lost.toFixed(2)} lost</Text></View> : null}</View>
    {source !== 'Attendance' ? <Panel title="Exam marks and absolutes">
      {getMarkSections(record).map(section => {
        const sectionMaximum = section.assessments.reduce((sum, assessment) => sum + assessment.absolute, 0);
        const sectionEarned = section.assessments.reduce((sum, assessment) => sum + getAssessmentAbsolute(assessment).earned, 0);
        return <View key={section.title}>
          <Text style={styles.markSectionTitle}>{section.title} · {sectionMaximum} absolutes</Text>
          <TableHeader columns={['Assessment','Raw score','Earned abs.','Lost abs.']} />
          {section.assessments.map(assessment => {
            const absolute = getAssessmentAbsolute(assessment);
            return <TableLine key={assessment.name} values={[assessment.name, `${assessment.obtained}/${assessment.total}`, absolute.earned.toFixed(2), absolute.lost.toFixed(2)]} highlightLast />;
          })}
          <View style={styles.sectionTotal}><Text style={styles.sectionTotalLabel}>Section absolutes earned</Text><Text style={styles.sectionTotalValue}>{sectionEarned.toFixed(2)} / {sectionMaximum}</Text></View>
        </View>;
      })}
      <TableHeader columns={['Total absolutes','Earned','Maximum','Lost']} />
      <TableLine values={['Right now', totals.obtained.toFixed(2), totals.total, totals.lost.toFixed(2)]} highlightLast />
      <Text style={styles.helperText}>Default weights: quizzes 5 total, assignments 5, sessionals 30, coursework 20, and final exam 40. Admins can adjust section weights. Earned absolutes are calculated from raw marks and section weights.</Text>
    </Panel> : null}
    <Text style={styles.sectionLabel}>{source === 'Attendance' ? 'CLASS-BY-CLASS ATTENDANCE' : 'ALL ATTENDANCE RECORDS'}</Text>
  </>} renderItem={({ item }) => <View style={styles.listRow}><View style={styles.flex}><Text style={styles.rowTitle}>Lecture {item.lecture}</Text><Text style={styles.rowMeta}>{item.date}</Text></View><StatusTag good={item.status === 'P'}>{item.status === 'P' ? 'Present' : 'Absent'}</StatusTag></View>} ListEmptyComponent={<Text style={styles.empty}>No attendance records are available for this course.</Text>} ListFooterComponent={<View style={styles.detailFooter}><Pressable onPress={onBack} style={styles.backButton} accessibilityRole="button"><Text style={styles.backButtonText}>‹  Back to courses</Text></Pressable></View>} />;
}

export function RegistrationScreen({ student, onToggleCourse }) {
  return <FlatList style={styles.flex} contentContainerStyle={styles.screenPadding} data={COURSE_CATALOG} keyExtractor={course => course.id} ListHeaderComponent={<PageTitle title="Course registration" subtitle="Review the Fall 2026 course catalogue and your current registration." />} renderItem={({ item: course }) => {
    const registered = student.registeredCourseIds.includes(course.id);
    return <View style={styles.courseSummary}><View style={styles.flex}><Text style={styles.rowTitle}>{course.code} · {course.name}</Text><Text style={styles.rowMeta}>{course.credits} credits  ·  {course.section}  ·  {course.teacher}</Text></View><View style={styles.registrationAction}>{registered ? <StatusTag good>Registered</StatusTag> : null}<ActionButton title={registered ? 'Drop' : 'Register'} secondary={!registered} onPress={() => onToggleCourse(course.id)} /></View></View>;
  }} ListFooterComponent={<><Text style={styles.helperText}>Registration changes are saved in this demo session only. Dropping a course removes it from the current student view.</Text><FooterSpace /></>} />;
}

export function FeesScreen({ student }) {
  const { fees } = student;
  const balance = Math.max(0, fees.tuition - fees.paid);
  return <ScrollView contentContainerStyle={styles.screenPadding}><PageTitle title="Fee details" subtitle="Fall 2026 collection and payment history." />
    <Panel title="Collection detail"><View style={styles.statRow}><StatCard label="TUITION DUE" value={`Rs. ${fees.tuition.toLocaleString()}`} /><StatCard label="PAID" value={`Rs. ${fees.paid.toLocaleString()}`} /><StatCard label="BALANCE" value={`Rs. ${balance.toLocaleString()}`} detail={balance ? 'Payment outstanding' : 'Paid in full'} /></View><DataRow label="Semester" value={fees.semester} /><DataRow label="Challan number" value={fees.challanNo} /><DataRow label="Due date" value={fees.dueDate} /><DataRow label="Status" value={balance ? 'Partially paid' : 'Paid'} /></Panel>
    <Panel title="Payment history"><TableHeader columns={['Date','Method','Amount']} />{fees.payments.map(payment => <TableLine key={`${payment.date}-${payment.amount}`} values={[payment.date, payment.method, `Rs. ${payment.amount.toLocaleString()}`]} />)}</Panel><FooterSpace /></ScrollView>;
}

export function FeedbackScreen({ student, onSaveFeedback }) {
  const courses = getStudentCourses(student);
  const [selectedId, setSelectedId] = useState(courses[0]?.id || '');
  const saved = student.feedback[selectedId] || { satisfied: null, conceptsCovered: null, materialsUseful: null, workloadManageable: null, recommendCourse: null, description: '' };
  const [satisfied, setSatisfied] = useState(saved.satisfied);
  const [conceptsCovered, setConceptsCovered] = useState(saved.conceptsCovered);
  const [materialsUseful, setMaterialsUseful] = useState(saved.materialsUseful);
  const [workloadManageable, setWorkloadManageable] = useState(saved.workloadManageable);
  const [recommendCourse, setRecommendCourse] = useState(saved.recommendCourse);
  const [description, setDescription] = useState(saved.description);
  const [message, setMessage] = useState('');
  const selectCourse = id => {
    const next = student.feedback[id] || { satisfied: null, conceptsCovered: null, materialsUseful: null, workloadManageable: null, recommendCourse: null, description: '' };
    setSelectedId(id); setSatisfied(next.satisfied); setConceptsCovered(next.conceptsCovered); setMaterialsUseful(next.materialsUseful); setWorkloadManageable(next.workloadManageable); setRecommendCourse(next.recommendCourse); setDescription(next.description); setMessage('');
  };
  const submit = () => {
    if ([satisfied, conceptsCovered, materialsUseful, workloadManageable, recommendCourse].some(answer => answer === null)) { setMessage('Please answer all five course questions.'); return; }
    if (description.trim().length < 10) { setMessage('Please add a description of at least 10 characters.'); return; }
    onSaveFeedback(selectedId, { satisfied, conceptsCovered, materialsUseful, workloadManageable, recommendCourse, description: description.trim() });
    setMessage('Feedback saved for this demo session.');
  };
  return <ScrollView contentContainerStyle={styles.screenPadding}><PageTitle title="Course feedback" subtitle="Share a short, course-specific learning experience." />
    <View style={styles.feedbackCourseList}><FlatList horizontal data={courses} keyExtractor={course => course.id} showsHorizontalScrollIndicator={false} renderItem={({ item: course }) => <Pressable onPress={() => selectCourse(course.id)} style={[styles.courseChoice, selectedId === course.id && styles.courseChoiceSelected]}><Text style={[styles.courseChoiceText, selectedId === course.id && styles.courseChoiceTextSelected]}>{course.code}</Text></Pressable>} /></View>
    {selectedId ? <Panel title={`${getCourse(selectedId)?.code} · Feedback`}>
      <Text style={styles.question}>Are you satisfied with this course?</Text><View style={styles.answerRow}>{[['Yes', true], ['No', false]].map(([label, value]) => <Pressable key={`s-${label}`} onPress={() => setSatisfied(value)} style={[styles.answerChoice, satisfied === value && styles.answerSelected]}><Text style={[styles.answerText, satisfied === value && styles.answerTextSelected]}>{label}</Text></Pressable>)}</View>
      <Text style={styles.question}>Has the teacher explained the course concepts clearly?</Text><View style={styles.answerRow}>{[['Yes', true], ['No', false]].map(([label, value]) => <Pressable key={`c-${label}`} onPress={() => setConceptsCovered(value)} style={[styles.answerChoice, conceptsCovered === value && styles.answerSelected]}><Text style={[styles.answerText, conceptsCovered === value && styles.answerTextSelected]}>{label}</Text></Pressable>)}</View>
      <Text style={styles.question}>Were the course materials and resources helpful?</Text><View style={styles.answerRow}>{[['Yes', true], ['No', false]].map(([label, value]) => <Pressable key={`m-${label}`} onPress={() => setMaterialsUseful(value)} style={[styles.answerChoice, materialsUseful === value && styles.answerSelected]}><Text style={[styles.answerText, materialsUseful === value && styles.answerTextSelected]}>{label}</Text></Pressable>)}</View>
      <Text style={styles.question}>Was the course workload manageable?</Text><View style={styles.answerRow}>{[['Yes', true], ['No', false]].map(([label, value]) => <Pressable key={`w-${label}`} onPress={() => setWorkloadManageable(value)} style={[styles.answerChoice, workloadManageable === value && styles.answerSelected]}><Text style={[styles.answerText, workloadManageable === value && styles.answerTextSelected]}>{label}</Text></Pressable>)}</View>
      <Text style={styles.question}>Would you recommend this course to another student?</Text><View style={styles.answerRow}>{[['Yes', true], ['No', false]].map(([label, value]) => <Pressable key={`r-${label}`} onPress={() => setRecommendCourse(value)} style={[styles.answerChoice, recommendCourse === value && styles.answerSelected]}><Text style={[styles.answerText, recommendCourse === value && styles.answerTextSelected]}>{label}</Text></Pressable>)}</View>
      <Text style={styles.question}>Feedback description</Text><TextInput value={description} onChangeText={setDescription} multiline maxLength={500} placeholder="What is working well, or what could improve?" style={styles.feedbackInput} textAlignVertical="top" accessibilityLabel="Feedback description" />
      <Text style={styles.characterCount}>{description.length}/500</Text>{!!message && <Text style={[styles.message, message.startsWith('Feedback saved') && styles.successMessage]}>{message}</Text>}<ActionButton title="Save feedback" onPress={submit} />
      {student.feedback[selectedId] ? <Text style={styles.helperText}>Previously submitted in this session.</Text> : null}
    </Panel> : <Text style={styles.empty}>Register for a course to leave feedback.</Text>}
    <FooterSpace /></ScrollView>;
}

export function TranscriptScreen({ student }) {
  const transcript = student.transcript;
  const latest = transcript[transcript.length - 1];
  return <FlatList style={styles.flex} contentContainerStyle={styles.screenPadding} data={transcript} keyExtractor={semester => semester.semester} ListHeaderComponent={<><PageTitle title="Student transcript" subtitle={`${student.name}  ·  ${student.rollNo}  ·  ${student.section}`} /><View style={styles.statRow}><StatCard label="CGPA" value={latest?.cgpa.toFixed(2) || '0.00'} detail="Cumulative GPA" /><StatCard label="SGPA" value={latest?.sgpa.toFixed(2) || '0.00'} detail={latest?.semester || 'Current semester'} /></View></>} renderItem={({ item: semester }) => <Panel title={semester.semester}><TableHeader columns={['Code','Course name','Grade']} />{semester.courses.map(course => <TableLine key={course.code} values={[course.code, course.name, course.grade]} />)}<DataRow label="Semester GPA" value={semester.sgpa.toFixed(2)} /><DataRow label="Cumulative GPA" value={semester.cgpa.toFixed(2)} /></Panel>} ListFooterComponent={<FooterSpace />} />;
}

export function TentativeStudyPlanScreen() {
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 2 : 1;
  return <FlatList key={columns} style={styles.flex} contentContainerStyle={styles.screenPadding} data={STUDY_PLAN} keyExtractor={semester => semester.semester} numColumns={columns} columnWrapperStyle={columns === 2 ? styles.studyPlanRow : undefined} ListHeaderComponent={<PageTitle title="Tentative study plan" subtitle="Sample degree roadmap organized by semester, course hours, and course type." />} renderItem={({ item: semester }) => <Panel title={`${semester.semester} · ${semester.term}`} style={styles.studyPlanCard}><TableHeader columns={['Code','Course name','CrHrs','Type']} />{semester.courses.map(([code, name, credits, type], index) => <TableLine key={`${code}-${index}`} values={[code, name, credits, type]} />)}</Panel>} ListFooterComponent={<FooterSpace />} />;
}

export function RetakeRequestScreen({ student, onSubmitRequest }) {
  const courses = getStudentCourses(student);
  const [selectedId, setSelectedId] = useState(courses[0]?.id || '');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submit = () => {
    if (!selectedId) { setMessage('Please select a course.'); return; }
    if (reason.trim().length < 15) { setMessage('Please provide a specific reason (at least 15 characters).'); return; }
    onSubmitRequest({ id: `retake-${Date.now()}`, courseId: selectedId, reason: reason.trim(), submittedAt: new Date().toLocaleDateString() });
    setSubmitted(true);
    setMessage('Your application has been submitted. Please visit the concerned academic office for further processing.');
  };
  return <ScrollView contentContainerStyle={styles.screenPadding}>
    <PageTitle title="Retake exam request" subtitle="Select the course and explain why you are requesting a retake." />
    {submitted ? <View style={styles.successBanner}><Text style={styles.successTitle}>Application submitted</Text><Text style={styles.successText}>Your retake request for {getCourse(selectedId)?.code} has been submitted. Please visit the concerned academic office for further processing.</Text></View> : <Panel title="Request details">
      <Text style={styles.question}>Select course</Text>
      <View style={styles.answerRow}>{courses.map(course => <Pressable key={course.id} onPress={() => { setSelectedId(course.id); setMessage(''); }} style={[styles.courseChoice, selectedId === course.id && styles.courseChoiceSelected]}><Text style={[styles.courseChoiceText, selectedId === course.id && styles.courseChoiceTextSelected]}>{course.code}</Text></Pressable>)}</View>
      {selectedId ? <Text style={styles.rowMeta}>{getCourse(selectedId)?.name}</Text> : <Text style={styles.empty}>No courses are registered.</Text>}
      <Text style={styles.question}>Specific reason for retake</Text>
      <TextInput value={reason} onChangeText={value => { setReason(value); setMessage(''); }} multiline maxLength={1000} placeholder="Explain the circumstances and why you need to retake this exam." style={styles.feedbackInput} textAlignVertical="top" accessibilityLabel="Specific reason for retake" />
      <Text style={styles.characterCount}>{reason.length}/1000 · 15–1000 characters required</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}
      <ActionButton title="Submit application" onPress={submit} disabled={!courses.length} />
    </Panel>}
    {submitted ? <View style={styles.submissionMeta}><Text style={styles.rowMeta}>Submitted {student.retakeRequests?.[student.retakeRequests.length - 1]?.submittedAt || ''}</Text><Pressable onPress={() => { setSubmitted(false); setReason(''); setMessage(''); }} style={styles.secondaryLink}><Text style={styles.secondaryLinkText}>Submit another request</Text></Pressable></View> : null}
    <FooterSpace />
  </ScrollView>;
}

export function PlannerScreen({ student, onToggleTask, onAddTask }) {
  const courses = getStudentCourses(student);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [message, setMessage] = useState('');
  const add = () => {
    if (title.trim().length < 4) { setMessage('Enter at least four characters.'); return; }
    onAddTask({ id: `task-${Date.now()}`, title: title.trim(), courseId, due: 'Added today', done: false });
    setTitle(''); setMessage('Task added.');
  };
  return <FlatList style={styles.flex} contentContainerStyle={styles.screenPadding} data={student.tasks} keyExtractor={task => task.id} ListHeaderComponent={<><PageTitle title="Study plan" subtitle="A small next step is easier to keep than a long to-do list." /><Panel title="Quick add"><TextInput value={title} onChangeText={setTitle} maxLength={120} placeholder="e.g. Review lecture notes" style={styles.feedbackInput} accessibilityLabel="New task title" /><View style={styles.answerRow}>{courses.map(course => <Pressable key={course.id} onPress={() => setCourseId(course.id)} style={[styles.courseChoice, course.id === courseId && styles.courseChoiceSelected]}><Text style={[styles.courseChoiceText, course.id === courseId && styles.courseChoiceTextSelected]}>{course.code}</Text></Pressable>)}</View>{!!message && <Text style={styles.helperText}>{message}</Text>}<ActionButton title="Add task" onPress={add} /></Panel><Text style={styles.sectionLabel}>YOUR TASKS</Text></>} renderItem={({ item: task }) => <Pressable onPress={() => onToggleTask(task.id)} style={styles.listRow}><View style={styles.flex}><Text style={styles.rowTitle}>{task.title}</Text><Text style={styles.rowMeta}>{getCourse(task.courseId)?.code || 'General'}  ·  {task.due}</Text></View><StatusTag good={task.done}>{task.done ? 'Done' : 'Open'}</StatusTag></Pressable>} ListEmptyComponent={<Text style={styles.empty}>No tasks yet.</Text>} ListFooterComponent={<FooterSpace />} />;
}

const chartConfig = { backgroundColor: colors.white, backgroundGradientFrom: colors.white, backgroundGradientTo: colors.white, decimalPlaces: 0, color: opacity => `rgba(66,85,184,${opacity})`, labelColor: () => colors.muted, barPercentage: 0.6, propsForBackgroundLines: { stroke: '#e6eaf2' } };
const styles = StyleSheet.create({
  flex: { flex: 1 }, screenPadding: { paddingHorizontal: 12, paddingBottom: 24, width: '100%', maxWidth: 1220, alignSelf: 'center' },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 15 },
  phoneLabel: { color: colors.ink, fontSize: 11, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  phoneEditor: { flexDirection: 'row', alignItems: 'center', gap: 9, flexWrap: 'wrap' },
  phoneInput: { flex: 1, minWidth: 180, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fbfcff', paddingHorizontal: 10, paddingVertical: 10, color: colors.ink, fontSize: 12 },
  phoneMessage: { color: colors.red, fontSize: 10, marginTop: 7 },
  alert: { backgroundColor: colors.softYellow, borderWidth: 1, borderColor: '#f0d879', padding: 13, marginBottom: 15 }, alertStrong: { color: colors.ink, fontWeight: '800', fontSize: 12 }, alertText: { color: colors.ink, fontSize: 11, lineHeight: 17, marginTop: 4 },
  successBanner: { borderWidth: 1, borderColor: '#9bd8c1', borderLeftWidth: 5, backgroundColor: colors.softGreen, padding: 16, marginBottom: 14 },
  successTitle: { color: colors.green, fontSize: 15, fontWeight: '800', marginBottom: 6 },
  successText: { color: colors.ink, fontSize: 12, lineHeight: 19 },
  submissionMeta: { alignItems: 'center', gap: 12, padding: 12 },
  secondaryLink: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.indigo, borderRadius: 18 },
  secondaryLinkText: { color: colors.indigo, fontSize: 11, fontWeight: '700' },
  chart: { marginVertical: 10, alignSelf: 'center' }, empty: { color: colors.muted, fontSize: 12, padding: 14 }, quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, quickLink: { flexGrow: 1, flexBasis: '46%', minHeight: 44, justifyContent: 'center', backgroundColor: colors.softBlue, padding: 10 }, quickLinkText: { color: colors.indigo, fontSize: 11, fontWeight: '700' },
  sectionLabel: { color: colors.indigo, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: 5, marginBottom: 8 },
  studyPlanRow: { gap: 12, alignItems: 'flex-start' },
  studyPlanCard: { flex: 1, minWidth: 0 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, padding: 12, marginBottom: 7 },
  detailFooter: { alignItems: 'center', paddingTop: 12, paddingBottom: 18 },
  backButton: { minWidth: 150, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: colors.indigo, borderWidth: 1, borderColor: '#3548a4', paddingHorizontal: 20, paddingVertical: 11 },
  backButtonText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  courseSummary: { flexDirection: 'row', alignItems: 'center', gap: 9, flexWrap: 'wrap', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, padding: 10, marginBottom: 8 },
  rowTitle: { color: colors.ink, fontSize: 12, fontWeight: '700' }, rowMeta: { color: colors.muted, fontSize: 10, marginTop: 4 }, marksTotal: { alignItems: 'flex-end' }, marksValue: { color: colors.indigo, fontSize: 14, fontWeight: '800' }, chevron: { color: colors.indigo, fontSize: 20, paddingHorizontal: 3 },
  taskDone: { color: colors.muted, textDecorationLine: 'line-through' },
  marksDanger: { color: colors.red },
  absoluteSummary: { flex: 1, minWidth: 135, padding: 13, borderTopWidth: 3, borderTopColor: colors.blue, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  absoluteLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  absoluteValue: { color: colors.indigo, fontSize: 20, fontWeight: '700', marginTop: 6 },
  absoluteLost: { color: colors.muted, fontSize: 10, marginTop: 3 },
  markSectionTitle: { color: colors.indigo, fontSize: 12, fontWeight: '800', marginTop: 12, marginBottom: 7 },
  sectionTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 9, paddingVertical: 9, backgroundColor: colors.softBlue },
  sectionTotalLabel: { color: colors.ink, fontSize: 10, fontWeight: '700' }, sectionTotalValue: { color: colors.indigo, fontSize: 10, fontWeight: '800' },
  helperText: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 10 },
  registrationAction: { alignItems: 'flex-end', gap: 7, minWidth: 88 },
  feedbackCourseList: { marginBottom: 13 }, courseChoice: { borderWidth: 1, borderColor: colors.line, paddingVertical: 9, paddingHorizontal: 11, marginRight: 7, backgroundColor: colors.white }, courseChoiceSelected: { backgroundColor: colors.indigo, borderColor: colors.indigo }, courseChoiceText: { color: colors.ink, fontSize: 10, fontWeight: '700' }, courseChoiceTextSelected: { color: colors.white },
  question: { color: colors.ink, fontWeight: '700', fontSize: 12, marginTop: 9, marginBottom: 8 }, answerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }, answerChoice: { borderWidth: 1, borderColor: colors.line, paddingHorizontal: 18, paddingVertical: 9 }, answerSelected: { backgroundColor: colors.indigo, borderColor: colors.indigo }, answerText: { color: colors.ink, fontSize: 11, fontWeight: '700' }, answerTextSelected: { color: colors.white },
  feedbackInput: { minHeight: 94, borderWidth: 1, borderColor: colors.line, padding: 11, color: colors.ink, fontSize: 12, backgroundColor: '#fbfcff' }, characterCount: { textAlign: 'right', color: colors.muted, fontSize: 9, marginVertical: 5 }, message: { color: colors.red, fontSize: 11, marginVertical: 9 }, successMessage: { color: colors.green },
});
