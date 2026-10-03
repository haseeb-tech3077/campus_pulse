import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import AdminPanelScreen from './src/screens/AdminPanelScreen';
import {
  AttendanceScreen, CourseDetailsScreen, FeedbackScreen, FeesScreen,
  HomeScreen, MarksScreen, PlannerScreen, RegistrationScreen, RetakeRequestScreen, TentativeStudyPlanScreen, TranscriptScreen,
} from './src/screens/PortalScreens';
import { COURSE_CATALOG, STUDENTS } from './src/data/flexData';
import { getOverallAttendance, getStudentCourses } from './src/services/portalService';
import { colors } from './src/components/PortalUI';

const NAV_ITEMS = [
  { id: 'Home', label: 'Home' },
  { id: 'Attendance', label: 'Attendance' },
  { id: 'Marks', label: 'Marks' },
  { id: 'Registration', label: 'Course registration' },
  { id: 'Fees', label: 'Fee details' },
  { id: 'Feedback', label: 'Feedback' },
  { id: 'RetakeRequest', label: 'Retake exam request' },
  { id: 'Transcript', label: 'Transcript' },
  { id: 'TentativePlan', label: 'Tentative study plan' },
  { id: 'Planner', label: 'Study plan' },
  { id: 'Admin', label: 'Admin panel' },
];

function copyStudent(student) {
  if (!student) return null;
  return JSON.parse(JSON.stringify(student));
}

export default function App() {
  const { width } = useWindowDimensions();
  const compact = width < 560;
  const [student, setStudent] = useState(null);
  const [students, setStudents] = useState(() => STUDENTS.filter(Boolean).map(copyStudent));
  const [userRole, setUserRole] = useState('');
  const [activeScreen, setActiveScreen] = useState('Home');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourseSource, setSelectedCourseSource] = useState('');
  const [portalSummary, setPortalSummary] = useState({ attendance: 0, courses: 0 });

  useEffect(() => {
    if (!student) {
      setPortalSummary({ attendance: 0, courses: 0 });
      return;
    }
    setPortalSummary({ attendance: getOverallAttendance(student), courses: getStudentCourses(student).length });
  }, [student]);

  useEffect(() => {
    if (userRole !== 'admin') return;
    setStudents(current => {
      const validById = new Map(current.filter(item => item && item.id).map(item => [item.id, item]));
      return STUDENTS.filter(Boolean).map(seed => validById.get(seed.id) || copyStudent(seed));
    });
  }, [userRole]);

  const handleLogin = (account, role = 'student') => {
    setUserRole(role);
    setStudent(role === 'admin' ? null : copyStudent(students.find(item => item?.id === account.id) || account));
    setActiveScreen(role === 'admin' ? 'Admin' : 'Home');
    setSelectedCourseId('');
    setSelectedCourseSource('');
  };

  const toggleRegistration = courseId => {
    const course = COURSE_CATALOG.find(item => item.id === courseId);
    if (!course) return;
    setStudent(current => {
      const isRegistered = current.registeredCourseIds.includes(courseId);
      const ids = isRegistered
        ? current.registeredCourseIds.filter(id => id !== courseId)
        : [...current.registeredCourseIds, courseId];
      const records = { ...current.courseRecords };
      if (!isRegistered && !records[courseId]) records[courseId] = { attendance: [], marks: [] };
      return { ...current, registeredCourseIds: ids, courseRecords: records };
    });
  };

  const updateAdminStudent = (studentId, update) => {
    const safelyUpdate = current => {
      if (!current || current.id !== studentId) return current;
      const next = update(current);
      return next && typeof next === 'object' && next.id === studentId ? next : current;
    };
    setStudents(current => current.map(safelyUpdate));
    setStudent(safelyUpdate);
  };

  const saveFeedback = (courseId, feedback) => setStudent(current => ({
    ...current,
    feedback: { ...current.feedback, [courseId]: feedback },
  }));

  const updatePhone = phone => setStudent(current => ({
    ...current,
    personal: { ...current.personal, phone },
  }));

  const submitRetakeRequest = request => setStudent(current => ({
    ...current,
    retakeRequests: [...(current.retakeRequests || []), request],
  }));

  const addTask = task => setStudent(current => ({ ...current, tasks: [task, ...current.tasks] }));
  const toggleTask = taskId => setStudent(current => ({
    ...current,
    tasks: current.tasks.map(task => task.id === taskId ? { ...task, done: !task.done } : task),
  }));

  if (!student && userRole !== 'admin') {
    return <SafeAreaProvider><SafeAreaView style={styles.safeArea}><StatusBar style="dark" /><LoginScreen onLogin={handleLogin} /></SafeAreaView></SafeAreaProvider>;
  }

  const navItems = userRole === 'admin' ? NAV_ITEMS.filter(item => item.id === 'Admin') : NAV_ITEMS.filter(item => item.id !== 'Admin');
  const nav = (
    <View style={[styles.navWrap, { paddingHorizontal: compact ? 4 : 22 }]}>
      <FlatList horizontal data={navItems} keyExtractor={item => item.id} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navList} renderItem={({ item }) => (
        <Pressable onPress={() => { setActiveScreen(item.id); setSelectedCourseId(''); setSelectedCourseSource(''); }} style={[styles.navItem, activeScreen === item.id && !selectedCourseId && styles.navItemSelected]}>
          <Text style={[styles.navText, activeScreen === item.id && !selectedCourseId && styles.navTextSelected]}>{compact ? ({ Registration: 'Courses', Fees: 'Fees', Feedback: 'Feedback', RetakeRequest: 'Retake', TentativePlan: 'Degree plan', Planner: 'Tasks' }[item.id] || item.label) : item.label}</Text>
        </Pressable>
      )} />
    </View>
  );

  let screen;
  if (userRole === 'admin') {
    screen = <AdminPanelScreen students={students.filter(Boolean)} onUpdateStudent={updateAdminStudent} />;
  } else if (selectedCourseId) {
    screen = <CourseDetailsScreen student={student} courseId={selectedCourseId} source={selectedCourseSource} onBack={() => { setSelectedCourseId(''); setSelectedCourseSource(''); }} />;
  } else if (activeScreen === 'Home') {
    screen = <HomeScreen student={student} onNavigate={setActiveScreen} onUpdatePhone={updatePhone} onToggleTask={toggleTask} />;
  } else if (activeScreen === 'Attendance') {
    screen = <AttendanceScreen student={student} onSelectCourse={courseId => { setSelectedCourseSource('Attendance'); setSelectedCourseId(courseId); }} />;
  } else if (activeScreen === 'Marks') {
    screen = <MarksScreen student={student} onSelectCourse={courseId => { setSelectedCourseSource('Marks'); setSelectedCourseId(courseId); }} />;
  } else if (activeScreen === 'Registration') {
    screen = <RegistrationScreen student={student} onToggleCourse={toggleRegistration} />;
  } else if (activeScreen === 'Fees') {
    screen = <FeesScreen student={student} />;
  } else if (activeScreen === 'Feedback') {
    screen = <FeedbackScreen student={student} onSaveFeedback={saveFeedback} />;
  } else if (activeScreen === 'RetakeRequest') {
    screen = <RetakeRequestScreen student={student} onSubmitRequest={submitRetakeRequest} />;
  } else if (activeScreen === 'Transcript') {
    screen = <TranscriptScreen student={student} />;
  } else if (activeScreen === 'TentativePlan') {
    screen = <TentativeStudyPlanScreen />;
  } else {
    screen = <PlannerScreen student={student} onToggleTask={toggleTask} onAddTask={addTask} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <View style={[styles.topbar, compact && styles.compactTopbar]}>
          <View style={[styles.logoTile, compact && styles.compactLogoTile]}><Image source={require('./assets/flex-logo.png')} style={styles.logoImage} resizeMode="contain" accessibilityLabel="Flex Academic Portal logo" /></View>
          <View style={styles.topTitle}><Text style={styles.topTitleText}>{userRole === 'admin' ? 'Admin panel' : selectedCourseId ? 'Course details' : activeScreen === 'Registration' ? 'Course registration' : activeScreen === 'Fees' ? 'Fee details' : activeScreen === 'RetakeRequest' ? 'Retake exam request' : activeScreen === 'TentativePlan' ? 'Tentative study plan' : activeScreen}</Text><Text style={styles.topSubtitle}>{userRole === 'admin' ? 'Administrator access · Student records' : `Fall 2026  ·  ${portalSummary.courses} courses  ·  ${portalSummary.attendance}% attendance`}</Text></View>
          <View style={[styles.userArea, compact && styles.compactUserArea]}><Text style={styles.hello}>{userRole === 'admin' ? 'Administrator' : `Hello, ${student.name}`}</Text><Pressable onPress={() => { setStudent(null); setUserRole(''); setActiveScreen('Home'); setSelectedCourseId(''); setSelectedCourseSource(''); }} style={styles.logout}><Text style={styles.logoutText}>Sign out</Text></Pressable></View>
        </View>
        {nav}
        <View style={styles.content}>{screen}</View>
        <Text style={styles.footer}>Demo academic data · 2026</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  topbar: { minHeight: 68, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 12 },
  compactTopbar: { minHeight: 86, paddingHorizontal: 10, paddingVertical: 8, gap: 8, flexWrap: 'wrap' },
  logoTile: { width: 118, height: 48, paddingHorizontal: 3, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  compactLogoTile: { width: 72, height: 34 },
  logoImage: { width: '100%', height: '100%' },
  topTitle: { flex: 1, minWidth: 0 }, topTitleText: { color: colors.white, fontSize: 14, fontWeight: '700' }, topSubtitle: { color: '#d5e4ef', fontSize: 9, marginTop: 4 },
  userArea: { flexDirection: 'row', alignItems: 'center', gap: 9 }, hello: { color: colors.white, fontSize: 10, fontWeight: '700' },
  compactUserArea: { flexBasis: '100%', justifyContent: 'space-between', paddingLeft: 2 },
  logout: { borderWidth: 1, borderColor: '#b8cddd', paddingHorizontal: 9, paddingVertical: 6 }, logoutText: { color: colors.white, fontSize: 9, fontWeight: '700' },
  navWrap: { backgroundColor: colors.dark, minHeight: 48 }, navList: { alignItems: 'stretch' },
  navItem: { justifyContent: 'center', paddingHorizontal: 13, borderBottomWidth: 3, borderBottomColor: 'transparent' }, navItemSelected: { backgroundColor: '#222e3a', borderBottomColor: colors.yellow }, navText: { color: '#eff3f8', fontSize: 10, fontWeight: '600' }, navTextSelected: { color: colors.yellow },
  content: { flex: 1, minHeight: 0 }, footer: { color: '#8797a7', fontSize: 9, textAlign: 'center', paddingVertical: 7, backgroundColor: colors.paper },
});
