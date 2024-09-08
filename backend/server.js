const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Set file extension based on MIME type
        let ext = path.extname(file.originalname); // Get original extension
        if (!ext) { // If the original name doesn't have an extension
            if (file.mimetype === 'image/jpeg') {
                ext = '.jpg';
            } else if (file.mimetype === 'image/png') {
                ext = '.png';
            }
        }
        cb(null, Date.now() + ext); // Save file with the determined extension
    }
});


const upload = multer({ storage });

app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/admissionForm', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Create a schema for student admission data
const studentSchema = new mongoose.Schema({
    name: String,
    address: String,
    state: String,
    city: String,
    gender: String,
    age: Number,
    course: String,
    college: String,
    email: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    courseName: String,
    profileImage: String // Added profileImage field
});

// Create a model from the schema
const Student = mongoose.model('Student', studentSchema);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files (e.g., images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/students', upload.single('profileImage'), async (req, res) => {
    const { rollNumber, ...data } = req.body;

    if (req.file) {
        data.profileImage = `/uploads/${req.file.filename}`; // Save the file path in the database
    }

    try {
        const existingStudent = await Student.findOne({ rollNumber });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this roll number already enrolled!' });
        }

        const newStudent = new Student({ rollNumber, ...data });
        await newStudent.save();

        // Send the studentId in the response
        res.status(201).json({ studentId: newStudent._id });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while saving student data.' });
    }
});



// GET API to retrieve student data by ID
app.get('/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching student details.' });
    }
});



// GET API to retrieve student data by roll number
// GET API to retrieve student data by roll number
app.get('/students/roll/:rollNumber', async (req, res) => {
    try {
        const student = await Student.findOne({ rollNumber: req.params.rollNumber });
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.json(student);
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({ message: 'An error occurred while fetching student data.' });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
