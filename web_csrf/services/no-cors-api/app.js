const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Custom logger
const logStream = fs.createWriteStream(path.join(logsDir, 'no-cors-api.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));
app.use(morgan('dev')); // Console logging

// VULNERABLE: No CORS restrictions
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Session management (insecure)
let sessions = {};

// In-memory data
let students = {
  'alice123': { 
    name: 'Alice Smith', 
    studentId: 'alice123',
    email: 'alice.smith@university.edu',
    gpa: 3.8,
    credits: 45,
    courses: ['CS101', 'MATH200', 'ENG150']
  },
  'bob456': { 
    name: 'Bob Johnson', 
    studentId: 'bob456',
    email: 'bob.johnson@university.edu',
    gpa: 3.2,
    credits: 38,
    courses: ['CS101', 'PHYS150']
  }
};

let teachers = {
  'teacher123': {
    name: 'Dr. John Teacher',
    teacherId: 'teacher123',
    email: 'john.teacher@university.edu',
    department: 'Computer Science'
  }
};

let grades = {
  'alice123': { 'CS101': 'A', 'MATH200': 'A-', 'ENG150': 'B+' },
  'bob456': { 'CS101': 'B', 'PHYS150': 'B-' }
};

// Available courses catalog
const availableCourses = [
  { code: 'CS201', name: 'Data Structures' },
  { code: 'MATH300', name: 'Linear Algebra' },
  { code: 'PHYS200', name: 'Modern Physics' },
  { code: 'CHEM101', name: 'General Chemistry' },
  { code: 'ENG200', name: 'Advanced Composition' },
  { code: 'HIST101', name: 'World History' }
];

// Authentication endpoint
app.post('/api/login', (req, res) => {
  const { teacherId, password } = req.body;

  // Handle teacher login
  if (teachers[teacherId] && password === 'password123') {
    const sessionId = Math.random().toString(36).substr(2, 16);
    sessions[sessionId] = { userId: teacherId, userType: 'teacher' };

    // VULNERABLE
    res.cookie('teacherSession', sessionId, { 
       httpOnly: false, 
       secure: false,   
      //  sameSite: 'none' 
    });
    
    res.json({ success: true, teacher: teachers[teacherId] });
    return;
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// VULNERABLE: Change grade endpoint without CSRF protection
app.post('/api/change-grade', (req, res) => {
  const sessionId = req.cookies.teacherSession;
  const sessionData = sessions[sessionId];
  
  if (!sessionData) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const { course, newGrade, targetStudent } = req.body;
  
  let targetStudentId;
  if (sessionData.userType === 'teacher' && targetStudent) {
    targetStudentId = targetStudent;
  } else {
    return res.status(400).json({ error: 'Invalid request - missing target student' });
  }
  
  if (grades[targetStudentId] && grades[targetStudentId][course]) {
    const oldGrade = grades[targetStudentId][course];
    grades[targetStudentId][course] = newGrade;
    
    res.json({ 
      success: true, 
      message: `Grade changed for ${course}: ${oldGrade} -> ${newGrade}`,
      targetStudent: targetStudentId
    });
  } else {
    res.status(400).json({ error: 'Course not found for student' });
  }
});

// VULNERABLE: Register for course without CSRF protection
app.post('/api/register-course', (req, res) => {
  const sessionId = req.cookies.teacherSession;
  const sessionData = sessions[sessionId];
  
  if (!sessionData) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const { courseCode, targetStudent } = req.body;
  
  let targetStudentId;
  if (sessionData.userType === 'teacher' && targetStudent) {
    targetStudentId = targetStudent;
  } else {
    return res.status(400).json({ error: 'Invalid request - missing target student' });
  }
  
  if (students[targetStudentId] && !students[targetStudentId].courses.includes(courseCode)) {
    students[targetStudentId].courses.push(courseCode);
    students[targetStudentId].credits += 3;
    grades[targetStudentId][courseCode] = 'IP'; // In Progress
    
    res.json({ 
      success: true, 
      message: `Successfully registered for ${courseCode}`,
      newCreditCount: students[targetStudentId].credits,
      targetStudent: targetStudentId
    });
  } else {
    res.status(400).json({ error: 'Already registered for this course or student not found' });
  }
});

// Get all students (for dropdowns)
app.get('/api/students', (req, res) => {
  const sessionId = req.cookies.teacherSession;
  const sessionData = sessions[sessionId];
  
  if (!sessionData) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Return list of students for teacher portal
  const studentList = Object.values(students);
  res.json({ 
    students: studentList
  });
});

// Get available courses
app.get('/api/courses', (req, res) => {
  const sessionId = req.cookies.teacherSession;
  const sessionData = sessions[sessionId];
  
  if (!sessionData) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({ 
    availableCourses: availableCourses
  });
});

// Get student profile
app.get('/api/profile', (req, res) => {
  const sessionId = req.cookies.teacherSession;
  const sessionData = sessions[sessionId];
  
  if (!sessionData) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const targetStudent = req.query.targetStudent;
  let targetStudentId;
  
  if (sessionData.userType === 'teacher' && targetStudent) {
    targetStudentId = targetStudent;
  } else {
    return res.status(400).json({ error: 'Invalid request - missing target student' });
  }
  
  if (students[targetStudentId]) {
    res.json({ 
      student: students[targetStudentId],
      grades: grades[targetStudentId]
    });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

// Get grades
app.get('/api/grades', (req, res) => {
  const sessionId = req.cookies.teacherSession;
  const sessionData = sessions[sessionId];
  
  if (!sessionData) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const targetStudent = req.query.targetStudent;
  let targetStudentId;
  
  if (sessionData.userType === 'teacher' && targetStudent) {
    targetStudentId = targetStudent;
  } else {
    return res.status(400).json({ error: 'Invalid request - missing target student' });
  }
  
  if (grades[targetStudentId]) {
    res.json({ 
      studentId: targetStudentId,
      grades: grades[targetStudentId]
    });
  } else {
    res.status(404).json({ error: 'Student grades not found' });
  }
});

// API status
app.get('/api/status', (req, res) => {
  res.json({ 
    api: 'no-cors-api',
    protection: 'none',
    cors: 'none',
    csrf: 'none',
    cookies: 'sameSite: none + secure',
    https: 'enabled with shared CA',
    warning: 'This portal is intentionally vulnerable to CSRF',
    endpoints: [
      'POST /api/login',
      'POST /api/change-grade',
      'POST /api/register-course',
      'GET /api/students',
      'GET /api/courses',
      'GET /api/profile',
      'GET /api/grades',
      'POST /api/logout'
    ]
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  const sessionId = req.cookies.teacherSession;
  delete sessions[sessionId];
  res.clearCookie('teacherSession', {
    secure: true,
    sameSite: 'none'
  });
  res.json({ success: true });
});

// SSL Configuration using shared certificates
const PORT = process.env.PORT || 3001;

try {
  // Load shared SSL certificates
  const sslOptions = {
    key: fs.readFileSync('/app/ssl/server.key'),
    cert: fs.readFileSync('/app/ssl/server.crt')
  };

  // Create HTTPS server
  const server = https.createServer(sslOptions, app);
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`No CORS API running on HTTPS port ${PORT}`);
    console.log(`Access at: https://localhost:${PORT}`);
    console.log('Demo accounts:');
    console.log('  Teachers: teacher123/password123');
    console.log('');
  });
  
} catch (error) {
  console.error('Failed to start HTTPS server:', error.message);
  console.log('Make sure shared SSL certificates are mounted at /app/ssl/');
  process.exit(1);
}

module.exports = app;
