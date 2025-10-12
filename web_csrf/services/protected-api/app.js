const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const crypto = require('crypto');

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
const logStream = fs.createWriteStream(path.join(logsDir, 'protected-api.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));
app.use(morgan('dev')); // Console logging

// SECURE CORS: Strictly controlled origins
const allowedOrigins = [
  'https://localhost:3003',
  'https://localhost:8001',
  'https://localhost:8002', // Compromissed third-party site - cannot update records without X-CSRF-Token
];

app.use((req, res, next) => {
  const origin = req.get('Origin');
  
  // Strict origin checking
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    console.log(`[PROTECTED-API] Allowed origin: ${origin}`);
  } else {
    // Log blocked attempts
    console.log(`[PROTECTED-API] BLOCKED origin: ${origin || 'No Origin'}`);
  }

  // Only allow specific headers and methods
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Session management with CSRF tokens
let sessions = {};

// In-memory data (same as other APIs for consistency)
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

const availableCourses = [
  { code: 'CS201', name: 'Data Structures' },
  { code: 'MATH300', name: 'Linear Algebra' },
  { code: 'PHYS200', name: 'Modern Physics' },
  { code: 'CHEM101', name: 'General Chemistry' },
  { code: 'ENG200', name: 'Advanced Composition' },
  { code: 'HIST101', name: 'World History' }
];

// Generate cryptographically secure CSRF token
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

// CSRF Protection Middleware
function requireCSRFToken(req, res, next) {
  const sessionId = req.cookies.teacherSession;
  const sessionData = sessions[sessionId];
  
  if (!sessionData) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const providedToken = req.headers['x-csrf-token'];
  const validToken = sessionData.csrfToken;
  
  if (!providedToken || !validToken || providedToken !== validToken) {
    return res.status(403).json({ 
      error: 'CSRF token validation failed',
      attack_blocked: true,
      protection: 'csrf-token-validation',
      message: 'This request was blocked because it did not include a valid CSRF token. This prevents unauthorized actions from being performed on behalf of authenticated users.'
    });
  }
  
  next();
}

// Authentication endpoint
app.post('/api/login', (req, res) => {
  const { teacherId, password } = req.body;

  if (teachers[teacherId] && password === 'password123') {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const csrfToken = generateCSRFToken();
    
    sessions[sessionId] = { 
      userId: teacherId, 
      userType: 'teacher',
      csrfToken: csrfToken,
      createdAt: new Date()
    };
    
    // SECURE: Properly configured cookie
    res.cookie('teacherSession', sessionId, { 
      httpOnly: true,     // JavaScript cannot access
      secure: true,       // HTTPS only
      sameSite: 'strict', // Strong cross-site protection
      maxAge: 1000 * 60 * 60 * 2 // 2 hours
    });
    
    res.json({ 
      success: true, 
      teacher: teachers[teacherId],
      csrfToken: csrfToken // Return token for client to use
    });
    return;
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// PROTECTED: Change grade endpoint with CSRF protection
app.post('/api/change-grade', requireCSRFToken, (req, res) => {
  const sessionId = req.cookies.teacherSession;
  const sessionData = sessions[sessionId];
  
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
      targetStudent: targetStudentId,
      protection: 'csrf-protected'
    });
  } else {
    res.status(400).json({ error: 'Course not found for student' });
  }
});

// PROTECTED: Register for course with CSRF protection
app.post('/api/register-course', requireCSRFToken, (req, res) => {
  const sessionId = req.cookies.teacherSession;
  const sessionData = sessions[sessionId];
  
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
      targetStudent: targetStudentId,
      protection: 'csrf-protected'
    });
  } else {
    res.status(400).json({ error: 'Already registered for this course or student not found' });
  }
});

// Get all students (authentication required but no CSRF for GET)
app.get('/api/students', (req, res) => {
  const sessionId = req.cookies.teacherSession;
  const sessionData = sessions[sessionId];
  
  if (!sessionData) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

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
    api: 'protected-api',
    protection: 'FULL - CSRF + CORS',
    cors: 'restricted-origins',
    csrf: 'REQUIRED - cryptographic tokens',
    cookies: 'SECURE - httpOnly + sameSite: strict + secure',
    https: 'enabled with shared CA',
    allowedOrigins: allowedOrigins,
    security: {
      csrfTokens: 'Required for all state-changing operations',
      cookiePolicy: 'httpOnly + secure + sameSite=strict',
      originValidation: 'Strict allowlist enforcement',
      sessionSecurity: 'Cryptographically secure session IDs',
      tokenGeneration: 'crypto.randomBytes(32)'
    },
    endpoints: [
      'POST /api/login',
      'POST /api/change-grade (CSRF-PROTECTED)',
      'POST /api/register-course (CSRF-PROTECTED)', 
      'GET /api/students',
      'GET /api/courses',
      'GET /api/profile',
      'GET /api/grades',
      'POST /api/logout'
    ]
  });
});

// Logout (CSRF protection for logout too)
app.post('/api/logout', requireCSRFToken, (req, res) => {
  const sessionId = req.cookies.teacherSession;
  
  if (sessions[sessionId]) {
    delete sessions[sessionId];
  }
  
  res.clearCookie('teacherSession', {
    secure: true,
    sameSite: 'strict'
  });
  res.json({ success: true });
});

// Session cleanup (remove expired sessions)
setInterval(() => {
  const now = new Date();
  const twoHours = 2 * 60 * 60 * 1000;
  
  Object.keys(sessions).forEach(sessionId => {
    const session = sessions[sessionId];
    if (now - session.createdAt > twoHours) {
      delete sessions[sessionId];
    }
  });
}, 15 * 60 * 1000); // Check every 15 minutes

// SSL Configuration
const PORT = process.env.PORT || 3004;

try {
  const sslOptions = {
    key: fs.readFileSync('/app/ssl/server.key'),
    cert: fs.readFileSync('/app/ssl/server.crt')
  };

  const server = https.createServer(sslOptions, app);
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Protected  API running on HTTPS port ${PORT}`);
    console.log(`Access at: https://localhost:${PORT}`);
    console.log('');
    console.log('Security: CSRF + CORS + Secure Cookies');
    console.log('CORS: Restricted to specific allowed origins only');
    console.log('CSRF: Required cryptographic tokens for all state changes');
    console.log('Cookies: httpOnly + secure + sameSite=strict');
    console.log('Sessions: Cryptographically secure with automatic cleanup');
    console.log('Available endpoints (PROTECTED):');
    console.log('  GET /api/students - Authenticated access only');
    console.log('  GET /api/courses - List available courses');
    console.log('  GET /api/profile?targetStudent=X - Get student profile');
    console.log('  POST /api/change-grade - CSRF-PROTECTED');
    console.log('  POST /api/register-course - CSRF-PROTECTED');
    console.log('  POST /api/logout - CSRF-PROTECTED');
  });
  
} catch (error) {
  console.error('Failed to start HTTPS server:', error.message);
  console.log('Make sure shared SSL certificates are mounted at /app/ssl/');
  process.exit(1);
}

module.exports = app;