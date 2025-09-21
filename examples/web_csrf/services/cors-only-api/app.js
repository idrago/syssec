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
const logStream = fs.createWriteStream(path.join(logsDir, 'cors-only-api.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));
app.use(morgan('dev')); // Console logging

// CORS-ONLY PROTECTION: Restrict to specific origins
const allowedOrigins = [
  'https://localhost:3002',
  'https://localhost:8001',
  'https://localhost:8002',  // Compromissed third-party site - it will update records without login 
];

app.use((req, res, next) => {
  const origin = req.get('Origin');
  
  // Check if the origin is in our allowlist
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    console.log(`[CORS-ONLY-API] Allowed origin: ${origin}`);
  } else {
    // Don't set CORS headers for disallowed origins
    console.log(`[CORS-ONLY-API] Blocked origin: ${origin || 'No Origin'}`);
  }

  // Common headers / methods allowed for preflight
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );

  // If this is a preflight (OPTIONS) request, respond immediately
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Session management
let sessions = {};

// In-memory data (same as vulnerable API for consistency)
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
    
    // CORS-ONLY: More secure cookie settings
    res.cookie('teacherSession', sessionId, { 
      httpOnly: true,   // JavaScript cannot access
      secure: true,     // HTTPS only
      sameSite: 'lax'   // Some cross-site protection
    });
    
    res.json({ success: true, teacher: teachers[teacherId] });
    return;
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// STILL VULNERABLE: Change grade endpoint without CSRF protection (but with CORS)
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

// STILL VULNERABLE: Register for course without CSRF protection (but with CORS)
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
    api: 'cors-only-api',
    protection: 'cors-only',
    cors: 'restricted-origins',
    csrf: 'none',
    cookies: 'httpOnly + sameSite: lax (partial protection)',
    https: 'enabled with shared CA',
    allowedOrigins: allowedOrigins,
    warning: 'This portal has CORS protection but no CSRF tokens - still vulnerable to attacks from allowed origins',
    endpoints: [
      'POST /api/login',
      'POST /api/change-grade (CORS-PROTECTED)',
      'POST /api/register-course (CORS-PROTECTED)', 
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
    sameSite: 'lax'
  });
  res.json({ success: true });
});

// SSL Configuration using shared certificates
const PORT = process.env.PORT || 3002;

try {
  // Load shared SSL certificates
  const sslOptions = {
    key: fs.readFileSync('/app/ssl/server.key'),
    cert: fs.readFileSync('/app/ssl/server.crt')
  };

  // Create HTTPS server
  const server = https.createServer(sslOptions, app);
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`CORS-Only API running on HTTPS port ${PORT}`);
    console.log(`Access at: https://localhost:${PORT}`);
    console.log('Security: CORS-ONLY - Allows requests from specific origins only');
    console.log('CORS Configuration: Restricted to allowed origins');
    console.log('Cookie Configuration: httpOnly=true + sameSite=lax');
    console.log(`Allowed Origins: ${allowedOrigins.join(', ')}`);
    console.log('Available endpoints:');
    console.log('  GET /api/students - List all students');
    console.log('  GET /api/courses - List available courses');
    console.log('  GET /api/profile?targetStudent=X - Get student profile');
    console.log('  POST /api/change-grade - CORS-PROTECTED (no CSRF)');
    console.log('  POST /api/register-course - CORS-PROTECTED (no CSRF)');
  });
  
} catch (error) {
  console.error('Failed to start HTTPS server:', error.message);
  console.log('Make sure shared SSL certificates are mounted at /app/ssl/');
  process.exit(1);
}

module.exports = app;