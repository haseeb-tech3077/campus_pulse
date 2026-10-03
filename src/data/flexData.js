// All records below are fictional demo data for this Expo prototype.
export const CLASS_DATES = [
  '18-Aug-2026', '20-Aug-2026', '25-Aug-2026', '27-Aug-2026',
  '01-Sep-2026', '03-Sep-2026', '08-Sep-2026', '10-Sep-2026',
  '15-Sep-2026', '17-Sep-2026', '24-Sep-2026', '29-Sep-2026',
];

export const COURSE_CATALOG = [
  { id: 'ai4009', code: 'AI4009', name: 'Generative AI', credits: 3, teacher: 'Dr. Shahel Saif', section: 'SE-7A' },
  { id: 'cs3002', code: 'CS3002', name: 'Information Security', credits: 3, teacher: 'Dr. Zaheer-ul-Hassan Sani', section: 'SE-7A' },
  { id: 'cs3006', code: 'CS3006', name: 'Parallel and Distributed Computing', credits: 3, teacher: 'Dr. Zaheer-ul-Hassan Sani', section: 'SE-7A' },
  { id: 'cs4039', code: 'CS4039', name: 'Software for Mobile Devices', credits: 3, teacher: 'Dr. Junaid Khan', section: 'SE-7A' },
  { id: 'se4091', code: 'SE4091', name: 'Final Year Project I', credits: 3, teacher: 'Miss Zoya Sumbul Zaheer', section: 'SE-7A' },
  { id: 'cs4001', code: 'CS4001', name: 'Professional Practices in IT', credits: 3, teacher: 'Ms. Ayesha Noor', section: 'SE-7A' },
];

export const REGISTRATION_COURSE_IDS = ['ai4009', 'cs3002', 'cs3006', 'cs4039', 'se4091', 'cs4001'];

export const STUDY_PLAN = [
  { semester: 'Semester 1', term: 'Fall 2023', courses: [['NS1001','Applied Physics',3,'Core'],['MT1003','Calculus and Analytical Geometry',3,'Core'],['SS1012','Functional English',2,'Core'],['SL1012','Functional English - Lab',1,'Core'],['SS1013','Ideology and Constitution of Pakistan',2,'Core'],['CL1000','Introduction to Information and Communication Technology',1,'Core'],['CS1002','Programming Fundamentals',3,'Core'],['CL1002','Programming Fundamentals - Lab',1,'Core']] },
  { semester: 'Semester 2', term: 'Spring 2024', courses: [['EE1005','Digital Logic Design',3,'Core'],['EL1005','Digital Logic Design - Lab',1,'Core'],['CS1005','Discrete Structures',3,'Core'],['SE1001','Introduction to Software Engineering',3,'Core'],['MT1008','Multivariable Calculus',3,'Core'],['CS1004','Object Oriented Programming',3,'Core'],['CL1004','Object Oriented Programming - Lab',1,'Core']] },
  { semester: 'Semester 3', term: 'Fall 2024', courses: [['EE2003','Computer Organization and Assembly Language',3,'Core'],['EL2003','Computer Organization and Assembly Language - Lab',1,'Core'],['CS2001','Data Structures',3,'Core'],['CL2001','Data Structures - Lab',1,'Core'],['SS1007','Islamic Studies/Ethics',2,'Core'],['MT1004','Linear Algebra',3,'Core'],['SSX21','Social Science Elective - I',2,'Elective'],['SE2001','Software Requirements Engineering',3,'Core'],['SS1019','Understanding Sirat-Un-Nabi (PBUH)',1,'Non Credit']] },
  { semester: 'Semester 4', term: 'Spring 2025', courses: [['CS2005','Database Systems',3,'Core'],['CL2005','Database Systems - Lab',1,'Core'],['SS1014','Expository Writing',2,'Core'],['SL1014','Expository Writing - Lab',1,'Core'],['CS2006','Operating Systems',3,'Core'],['CL2006','Operating Systems - Lab',1,'Core'],['MT2005','Probability and Statistics',3,'Core'],['SE2004','Software Design and Architecture',3,'Core'],['SS1018','Understanding Holy Quran',1,'Non Credit']] },
  { semester: 'Semester 5', term: 'Fall 2025', courses: [['CS2009','Design and Analysis of Algorithms',3,'Core'],['SE3005','Software Construction and Development',3,'Core'],['SE3002','Software Quality Engineering',3,'Core'],['SS2012','Technical and Business Writing',2,'Core'],['SEX01','SE Elective - I',3,'Elective']] },
  { semester: 'Semester 6', term: 'Spring 2026', courses: [['AI2002','Artificial Intelligence',3,'Core'],['SS2043','Civics and Community Engagement',2,'Core'],['CS3001','Computer Networks',3,'Core'],['SE4002','Fundamentals of Software Project Management',3,'Core'],['SEX02','SE Elective - II',3,'Elective'],['SEX03','SE Elective - III',3,'Elective']] },
  { semester: 'Semester 7', term: 'Fall 2026', courses: [['SE4091','Final Year Project - I',3,'Core'],['CS3002','Information Security',3,'Core'],['CS3006','Parallel and Distributed Computing',3,'Core'],['SE Elective - IV','SE Elective - IV',3,'Elective'],['SE Elective - V','SE Elective - V',3,'Elective']] },
  { semester: 'Semester 8', term: 'Spring 2027', courses: [['MG4011','Entrepreneurship',3,'Core'],['SE4092','Final Year Project - II',3,'Core'],['CS4001','Professional Practices in IT',3,'Core'],['SE Elective - VI','SE Elective - VI',3,'Elective'],['SEX21','SE Supporting - I',3,'Elective'],['CS2019','Computing Internship',3,'Core']] },
];

function makeAssessmentMarks(quizzes, sessionalOne, sessionalTwo, courseworkName, courseworkObtained, finalObtained) {
  const hasProject = courseworkName !== 'Assignment';
  return {
    quizzes: quizzes.map((obtained, index) => ({ name: `Quiz ${index + 1}`, obtained, total: 10, absolute: 1 })),
    assignments: [{ name: 'Assignment 1', obtained: Math.min(10, Math.round(courseworkObtained / 2)), total: 10, absolute: 5 }],
    sessionals: [
      { name: 'Sessional I', obtained: sessionalOne, total: 30, absolute: 15 },
      { name: 'Sessional II', obtained: sessionalTwo, total: 30, absolute: 15 },
    ],
    project: hasProject ? { name: courseworkName, obtained: courseworkObtained, total: 20, absolute: 20 } : null,
    finalExam: { name: 'Final Exam', obtained: finalObtained, total: hasProject ? 40 : 60, absolute: hasProject ? 40 : 60 },
  };
}

export const STUDENTS = [
  {
    id: 'abdul', name: 'Abdul Haseeb', rollNo: '23I-3077', password: 'abdulhaseeb', section: 'SE-7A',
    personal: { fatherName: 'Muhammad Saleem Aftab', cnic: '36103-6179978-7', address: 'Al-Rehman House, Chak no. 168/10-R, Khanewal', phone: '0328-7515770' },
    registeredCourseIds: ['ai4009', 'cs3002', 'cs3006', 'cs4039'],
    courseRecords: {
      ai4009: { attendance: ['P','P','P','P','P','A','P','P','P','P','P','P'], marks: makeAssessmentMarks([9, 8, 10, 9, 9], 26, 27, 'Project', 17, 32) },
      cs3002: { attendance: ['P','P','P','A','P','P','P','P','A','P','P','P'], marks: makeAssessmentMarks([8, 9, 7, 8, 8], 25, 24, 'Assignment', 18, 31) },
      cs3006: { attendance: ['P','P','P','P','P','P','P','A','P','P','A','P'], marks: makeAssessmentMarks([9, 10, 8, 9, 9], 29, 27, 'Lab work', 18, 34) },
      cs4039: { attendance: ['P','P','P','P','A','P','P','P','P','A','P','P'], marks: makeAssessmentMarks([10, 9, 10, 9, 10], 27, 28, 'Project', 19, 36) },
    },
    fees: { semester: 'Fall 2026', tuition: 182500, paid: 120000, dueDate: '04-Sep-2026', challanNo: '32633307701', payments: [{ date: '28-Aug-2026', amount: 120000, method: 'Bank challan' }] },
    transcript: [
      { semester: 'Fall 2023', sgpa: 2.71, cgpa: 2.71, courses: [{ code: 'CS1002', name: 'Programming Fundamentals', grade: 'C-' }, { code: 'MT1003', name: 'Calculus', grade: 'C+' }] },
      { semester: 'Spring 2024', sgpa: 2.96, cgpa: 2.84, courses: [{ code: 'CS1004', name: 'Object Oriented Programming', grade: 'C+' }, { code: 'CS1005', name: 'Discrete Structures', grade: 'A-' }] },
      { semester: 'Fall 2024', sgpa: 3.41, cgpa: 3.04, courses: [{ code: 'EE2003', name: 'Computer Organization', grade: 'B-' }, { code: 'CS2001', name: 'Data Structures', grade: 'A-' }] },
      { semester: 'Spring 2025', sgpa: 3.06, cgpa: 3.04, courses: [{ code: 'CS2005', name: 'Database Systems', grade: 'B-' }, { code: 'MT2005', name: 'Probability and Statistics', grade: 'B' }] },
      { semester: 'Fall 2025', sgpa: 3.33, cgpa: 3.10, courses: [{ code: 'CS2009', name: 'Design and Analysis of Algorithms', grade: 'B+' }, { code: 'SE3005', name: 'Software Construction', grade: 'B' }] },
      { semester: 'Spring 2026', sgpa: 3.50, cgpa: 3.17, courses: [{ code: 'AI2002', name: 'Artificial Intelligence', grade: 'A' }, { code: 'CS3001', name: 'Computer Networks', grade: 'A-' }] },
    ],
    feedback: {}, tasks: [
      { id: 'a1', title: 'Review mobile navigation patterns', courseId: 'cs4039', due: 'Today', done: false },
      { id: 'a2', title: 'Prepare for the AI quiz', courseId: 'ai4009', due: 'Tomorrow', done: false },
    ],
  },
  {
    id: 'saad', name: 'Saad Ahmad', rollNo: '23I-3076', password: 'saadahmad', section: 'SE-7A',
    personal: { fatherName: 'Aftab Ahmad', cnic: '35202-4567891-3', address: 'G-9, Islamabad, Pakistan', phone: '0300-1234567' },
    registeredCourseIds: ['ai4009', 'cs3002', 'cs3006', 'cs4039'],
    courseRecords: {
      ai4009: { attendance: ['P','P','P','P','P','P','P','P','P','A','P','P'], marks: makeAssessmentMarks([8, 9, 8, 7, 8], 24, 25, 'Project', 18, 30) },
      cs3002: { attendance: ['P','P','A','P','P','P','P','P','P','P','P','A'], marks: makeAssessmentMarks([7, 8, 9, 8, 8], 26, 25, 'Assignment', 17, 32) },
      cs3006: { attendance: ['P','P','P','P','P','P','A','P','P','P','P','P'], marks: makeAssessmentMarks([9, 8, 9, 9, 8], 27, 28, 'Lab work', 18, 33) },
      cs4039: { attendance: ['P','P','P','P','P','P','P','P','A','P','P','P'], marks: makeAssessmentMarks([9, 9, 8, 9, 9], 25, 26, 'Project', 16, 35) },
    },
    fees: { semester: 'Fall 2026', tuition: 182500, paid: 100000, dueDate: '04-Sep-2026', challanNo: '32633307601', payments: [{ date: '20-Aug-2026', amount: 100000, method: 'Bank challan' }] },
    transcript: [
      { semester: 'Fall 2023', sgpa: 3.05, cgpa: 3.05, courses: [{ code: 'CS1002', name: 'Programming Fundamentals', grade: 'B-' }, { code: 'MT1003', name: 'Calculus', grade: 'C+' }] },
      { semester: 'Spring 2024', sgpa: 3.22, cgpa: 3.14, courses: [{ code: 'CS1004', name: 'Object Oriented Programming', grade: 'B' }, { code: 'CS1005', name: 'Discrete Structures', grade: 'B+' }] },
      { semester: 'Fall 2024', sgpa: 3.30, cgpa: 3.20, courses: [{ code: 'EE2003', name: 'Computer Organization', grade: 'B' }, { code: 'CS2001', name: 'Data Structures', grade: 'B+' }] },
      { semester: 'Spring 2025', sgpa: 3.10, cgpa: 3.18, courses: [{ code: 'CS2005', name: 'Database Systems', grade: 'B' }, { code: 'MT2005', name: 'Probability and Statistics', grade: 'B-' }] },
      { semester: 'Fall 2025', sgpa: 3.45, cgpa: 3.23, courses: [{ code: 'CS2009', name: 'Design and Analysis of Algorithms', grade: 'A-' }, { code: 'SE3005', name: 'Software Construction', grade: 'B+' }] },
      { semester: 'Spring 2026', sgpa: 3.37, cgpa: 3.25, courses: [{ code: 'AI2002', name: 'Artificial Intelligence', grade: 'B+' }, { code: 'CS3001', name: 'Computer Networks', grade: 'A-' }] },
    ],
    feedback: {}, tasks: [{ id: 's1', title: 'Finish information security revision', courseId: 'cs3002', due: 'Friday', done: false }],
  },
  {
    id: 'ahmed', name: 'Ahmed Hassan', rollNo: '23I-3057', password: 'ahmedhassan', section: 'SE-7A',
    personal: { fatherName: 'Shafqat Iqbal', cnic: '61101-2345678-5', address: 'Gulzar-e-Quaid, Rawalpindi, Pakistan', phone: '0312-2345678' },
    registeredCourseIds: ['ai4009', 'cs3002', 'cs3006', 'cs4039'],
    courseRecords: {
      ai4009: { attendance: ['P','P','P','A','P','P','P','P','P','P','P','P'], marks: makeAssessmentMarks([10, 9, 10, 9, 10], 28, 29, 'Project', 19, 37) },
      cs3002: { attendance: ['P','P','P','P','P','P','P','P','P','P','P','P'], marks: makeAssessmentMarks([9, 10, 9, 8, 9], 28, 27, 'Assignment', 19, 36) },
      cs3006: { attendance: ['P','P','P','P','A','P','P','P','P','P','A','P'], marks: makeAssessmentMarks([8, 9, 8, 9, 8], 27, 26, 'Lab work', 19, 35) },
      cs4039: { attendance: ['P','P','P','P','P','P','P','P','P','P','P','A'], marks: makeAssessmentMarks([10, 10, 9, 10, 10], 29, 30, 'Project', 20, 38) },
    },
    fees: { semester: 'Fall 2026', tuition: 182500, paid: 182500, dueDate: '04-Sep-2026', challanNo: '32633305701', payments: [{ date: '18-Aug-2026', amount: 100000, method: 'Bank challan' }, { date: '28-Aug-2026', amount: 82500, method: 'KuickPay' }] },
    transcript: [
      { semester: 'Fall 2023', sgpa: 3.45, cgpa: 3.45, courses: [{ code: 'CS1002', name: 'Programming Fundamentals', grade: 'A-' }, { code: 'MT1003', name: 'Calculus', grade: 'B+' }] },
      { semester: 'Spring 2024', sgpa: 3.60, cgpa: 3.53, courses: [{ code: 'CS1004', name: 'Object Oriented Programming', grade: 'A-' }, { code: 'CS1005', name: 'Discrete Structures', grade: 'A' }] },
      { semester: 'Fall 2024', sgpa: 3.50, cgpa: 3.52, courses: [{ code: 'EE2003', name: 'Computer Organization', grade: 'B+' }, { code: 'CS2001', name: 'Data Structures', grade: 'A-' }] },
      { semester: 'Spring 2025', sgpa: 3.65, cgpa: 3.55, courses: [{ code: 'CS2005', name: 'Database Systems', grade: 'A-' }, { code: 'MT2005', name: 'Probability and Statistics', grade: 'A-' }] },
      { semester: 'Fall 2025', sgpa: 3.72, cgpa: 3.58, courses: [{ code: 'CS2009', name: 'Design and Analysis of Algorithms', grade: 'A' }, { code: 'SE3005', name: 'Software Construction', grade: 'A-' }] },
      { semester: 'Spring 2026', sgpa: 3.80, cgpa: 3.62, courses: [{ code: 'AI2002', name: 'Artificial Intelligence', grade: 'A' }, { code: 'CS3001', name: 'Computer Networks', grade: 'A' }] },
    ],
    feedback: {}, tasks: [{ id: 'h1', title: 'Check the mobile app project rubric', courseId: 'cs4039', due: 'Today', done: false }],
  },
  {
    id: 'haseeb', name: 'Haseeb Sajjad', rollNo: '23I-3074', password: 'haseebsajjad', section: 'SE-7A',
    personal: { fatherName: 'Sajjad', cnic: '61101-3456789-1', address: 'Unknown area, Rawalpindi, Pakistan', phone: '0333-3456789' },
    registeredCourseIds: ['ai4009', 'cs3002', 'cs3006', 'cs4039'],
    courseRecords: {
      ai4009: { attendance: ['P','P','P','P','A','P','P','P','P','P','P','P'], marks: makeAssessmentMarks([8, 9, 8, 7, 8], 25, 24, 'Project', 16, 33) },
      cs3002: { attendance: ['P','P','P','P','P','A','P','P','P','P','P','P'], marks: makeAssessmentMarks([9, 8, 9, 7, 9], 24, 25, 'Assignment', 17, 30) },
      cs3006: { attendance: ['P','P','A','P','P','P','P','P','P','P','P','P'], marks: makeAssessmentMarks([7, 8, 9, 8, 7], 26, 24, 'Lab work', 18, 32) },
      cs4039: { attendance: ['P','P','P','P','P','P','P','A','P','P','P','P'], marks: makeAssessmentMarks([8, 9, 8, 9, 8], 26, 27, 'Project', 18, 34) },
    },
    fees: { semester: 'Fall 2026', tuition: 182500, paid: 90000, dueDate: '04-Sep-2026', challanNo: '32633307401', payments: [{ date: '26-Aug-2026', amount: 90000, method: 'Bank challan' }] },
    transcript: [
      { semester: 'Fall 2023', sgpa: 2.90, cgpa: 2.90, courses: [{ code: 'CS1002', name: 'Programming Fundamentals', grade: 'C+' }, { code: 'MT1003', name: 'Calculus', grade: 'B-' }] },
      { semester: 'Spring 2024', sgpa: 3.10, cgpa: 3.00, courses: [{ code: 'CS1004', name: 'Object Oriented Programming', grade: 'B-' }, { code: 'CS1005', name: 'Discrete Structures', grade: 'B' }] },
      { semester: 'Fall 2024', sgpa: 3.00, cgpa: 3.00, courses: [{ code: 'EE2003', name: 'Computer Organization', grade: 'C+' }, { code: 'CS2001', name: 'Data Structures', grade: 'B' }] },
      { semester: 'Spring 2025', sgpa: 3.15, cgpa: 3.04, courses: [{ code: 'CS2005', name: 'Database Systems', grade: 'B' }, { code: 'MT2005', name: 'Probability and Statistics', grade: 'B+' }] },
      { semester: 'Fall 2025', sgpa: 3.20, cgpa: 3.07, courses: [{ code: 'CS2009', name: 'Design and Analysis of Algorithms', grade: 'B' }, { code: 'SE3005', name: 'Software Construction', grade: 'B+' }] },
      { semester: 'Spring 2026', sgpa: 3.30, cgpa: 3.11, courses: [{ code: 'AI2002', name: 'Artificial Intelligence', grade: 'B+' }, { code: 'CS3001', name: 'Computer Networks', grade: 'B+' }] },
    ],
    feedback: {}, tasks: [{ id: 'j1', title: 'Read the distributed systems notes', courseId: 'cs3006', due: 'Monday', done: false }],
  },
];
