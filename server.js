require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://127.0.0.1:8000'
}));
app.use(bodyParser.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'lbccc_clubmembers'
});

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD
  }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { firstName, lastName, email, password, dateOfBirth, schoolId } = req.body;

  try {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if email already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user_id
    const userId = uuidv4();

    // Insert user into database
    await pool.query(
      'INSERT INTO users (user_id, school_id, firstName, lastName, email, password, dateOfBirth) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, schoolId, firstName, lastName, email, hashedPassword, dateOfBirth]
    );

    // Generate verification token
    const verificationToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });

    // Send verification email
    const verificationLink = `http://localhost:8000/${verificationToken}`;
    await transporter.sendMail({
      from: 'lbccc532@gmail.com',
      to: email,
      subject: 'Verify Your Email',
      html: `Please click <a href="${verificationLink}">here</a> to verify your email.`
    });

    res.status(201).json({ message: 'User created. Please check your email to verify your account.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during signup' });
  }
});


// Login endpoint
app.get('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, { expiresIn: '1h' });

    // Update last login
    await pool.query('UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE user_id = ?', [user.user_id]);

    res.json({ token, user: { id: user.user_id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, firstName, lastName, email, password FROM users LIMIT 5');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
});

// Email verification endpoint
app.get('/api/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await pool.query('UPDATE users SET email_verified = TRUE WHERE user_id = ?', [decoded.userId]);
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

// Existing contact form submission endpoint
app.post('/api/submit', async (req, res) => {
  // ... (your existing code for form submission)
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));