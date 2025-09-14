const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/straycare';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Volunteer Application Schema
const volunteerApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    min: 16,
    max: 80
  },
  role: {
    type: String,
    required: true,
    enum: ['animal-care', 'foster-care', 'transport', 'fundraising', 'outreach']
  },
  availability: {
    type: String,
    required: true,
    enum: ['weekdays', 'weekends', 'flexible', 'evenings']
  },
  experience: {
    type: String,
    trim: true
  },
  motivation: {
    type: String,
    required: true,
    trim: true
  },
  terms: {
    type: Boolean,
    required: true
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'contacted'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  reviewedBy: {
    type: String,
    trim: true
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const VolunteerApplication = mongoose.model('VolunteerApplication', volunteerApplicationSchema);

// Rescue Case Schema
const rescueCaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  reportedBy: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  assignedVolunteer: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const RescueCase = mongoose.model('RescueCase', rescueCaseSchema);

// Medical Record Schema
const medicalRecordSchema = new mongoose.Schema({
  animalName: { type: String, required: true },
  animalId: { type: String, required: true, unique: true },
  breed: { type: String, required: true },
  age: { type: String, required: true },
  healthStatus: { type: String, enum: ['healthy', 'under-treatment', 'recovered', 'critical'], required: true },
  lastVaccination: { type: Date },
  vaccinationType: { type: String },
  nextVaccinationDue: { type: Date },
  sterilizationStatus: { type: String, enum: ['done', 'scheduled', 'not-done'], default: 'not-done' },
  sterilizationDate: { type: Date },
  medicalNotes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

// Volunteer Schema (approved volunteers)
const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
  availability: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

// API Routes

// Submit volunteer application
app.post('/api/volunteer-applications', async (req, res) => {
  try {
    const applicationData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'role', 'availability', 'motivation', 'terms'];
    const missingFields = requiredFields.filter(field => !applicationData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      });
    }

    // Check if email already exists
    const existingApplication = await VolunteerApplication.findOne({ email: applicationData.email });
    if (existingApplication) {
      return res.status(409).json({
        error: 'An application with this email already exists',
        existingApplicationId: existingApplication._id
      });
    }

    // Create new application
    const newApplication = new VolunteerApplication(applicationData);
    const savedApplication = await newApplication.save();

    console.log('New volunteer application received:', {
      id: savedApplication._id,
      name: savedApplication.name,
      email: savedApplication.email,
      role: savedApplication.role
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: savedApplication._id
    });

  } catch (error) {
    console.error('Error saving volunteer application:', error);
    res.status(500).json({
      error: 'Failed to submit application',
      details: error.message
    });
  }
});

// Get all volunteer applications (for admin)
app.get('/api/volunteer-applications', async (req, res) => {
  try {
    const { status, role, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get applications with pagination
    const applications = await VolunteerApplication
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VolunteerApplication.countDocuments(filter);

    res.json({
      success: true,
      applications,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: applications.length,
        totalApplications: total
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      error: 'Failed to fetch applications',
      details: error.message
    });
  }
});

// Get single volunteer application
app.get('/api/volunteer-applications/:id', async (req, res) => {
  try {
    const application = await VolunteerApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      application
    });

  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      error: 'Failed to fetch application',
      details: error.message
    });
  }
});

// Update volunteer application status (for admin)
app.patch('/api/volunteer-applications/:id', async (req, res) => {
  try {
    const { status, adminNotes, reviewedBy } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
      updateData.reviewedAt = new Date();
    }

    const updatedApplication = await VolunteerApplication.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        error: 'Application not found'
      });
    }

    console.log('Application updated:', {
      id: updatedApplication._id,
      status: updatedApplication.status,
      reviewedBy: updatedApplication.reviewedBy
    });

    res.json({
      success: true,
      message: 'Application updated successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      error: 'Failed to update application',
      details: error.message
    });
  }
});

// Delete volunteer application (for admin)
app.delete('/api/volunteer-applications/:id', async (req, res) => {
  try {
    const deletedApplication = await VolunteerApplication.findByIdAndDelete(req.params.id);
    
    if (!deletedApplication) {
      return res.status(404).json({
        error: 'Application not found'
      });
    }

    console.log('Application deleted:', {
      id: deletedApplication._id,
      name: deletedApplication.name,
      email: deletedApplication.email
    });

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      error: 'Failed to delete application',
      details: error.message
    });
  }
});

// Rescue Cases API Routes

// Create new rescue case
app.post('/api/rescue-cases', async (req, res) => {
  try {
    const newCase = new RescueCase(req.body);
    const savedCase = await newCase.save();
    res.status(201).json({ success: true, case: savedCase });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create rescue case', details: error.message });
  }
});

// Get all rescue cases
app.get('/api/rescue-cases', async (req, res) => {
  try {
    const cases = await RescueCase.find().sort({ createdAt: -1 });
    res.json({ success: true, cases });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rescue cases', details: error.message });
  }
});

// Export rescue cases data
app.get('/api/rescue-cases/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const cases = await RescueCase.find().sort({ createdAt: -1 });
    
    if (format === 'csv') {
      // Generate CSV data
      const csvHeader = 'ID,Title,Description,Location,Reported By,Phone,Status,Priority,Assigned Volunteer,Created At\n';
      const csvRows = cases.map(case_ => {
        return [
          case_._id,
          `"${case_.title.replace(/"/g, '""')}"`,
          `"${case_.description.replace(/"/g, '""')}"`,
          `"${case_.location.replace(/"/g, '""')}"`,
          `"${case_.reportedBy.replace(/"/g, '""')}"`,
          case_.phone,
          case_.status,
          case_.priority,
          `"${case_.assignedVolunteer || 'Not Assigned'}"`,
          new Date(case_.createdAt).toISOString()
        ].join(',');
      }).join('\n');
      
      const csvData = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="rescue_cases_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
      
    } else if (format === 'json') {
      // Generate JSON data
      const exportData = {
        exportDate: new Date().toISOString(),
        totalCases: cases.length,
        cases: cases.map(case_ => ({
          id: case_._id,
          title: case_.title,
          description: case_.description,
          location: case_.location,
          reportedBy: case_.reportedBy,
          phone: case_.phone,
          status: case_.status,
          priority: case_.priority,
          assignedVolunteer: case_.assignedVolunteer,
          createdAt: case_.createdAt
        }))
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="rescue_cases_${new Date().toISOString().split('T')[0]}.json"`);
      res.json(exportData);
      
    } else {
      res.status(400).json({ error: 'Invalid format. Supported formats: json, csv' });
    }
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to export rescue cases', details: error.message });
  }
});

// Update rescue case (assign volunteer)
app.patch('/api/rescue-cases/:id', async (req, res) => {
  try {
    const updatedCase = await RescueCase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, case: updatedCase });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update rescue case', details: error.message });
  }
});

// Medical Records API Routes

// Create new medical record
app.post('/api/medical-records', async (req, res) => {
  try {
    const newRecord = new MedicalRecord(req.body);
    const savedRecord = await newRecord.save();
    res.status(201).json({ success: true, record: savedRecord });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create medical record', details: error.message });
  }
});

// Get all medical records
app.get('/api/medical-records', async (req, res) => {
  try {
    const records = await MedicalRecord.find().sort({ createdAt: -1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medical records', details: error.message });
  }
});

// Volunteers API Routes

// Get all active volunteers
app.get('/api/volunteers', async (req, res) => {
  try {
    let volunteers = await Volunteer.find({ isActive: true });
    
    // If no volunteers exist, create demo volunteers
    if (volunteers.length === 0) {
      const demoVolunteers = [
        {
          name: 'Dr. Priya Singh',
          email: 'priya@example.com',
          phone: '+91-9876543210',
          role: 'animal-care',
          availability: 'weekdays'
        },
        {
          name: 'Rahul Kumar',
          email: 'rahul@example.com',
          phone: '+91-9876543211',
          role: 'transport',
          availability: 'flexible'
        }
      ];
      
      volunteers = await Volunteer.insertMany(demoVolunteers);
    }
    
    res.json({ success: true, volunteers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volunteers', details: error.message });
  }
});

// Create new volunteer
app.post('/api/volunteers', async (req, res) => {
  try {
    const newVolunteer = new Volunteer(req.body);
    const savedVolunteer = await newVolunteer.save();
    res.status(201).json({ success: true, volunteer: savedVolunteer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create volunteer', details: error.message });
  }
});

// Get medical reminders due today
app.get('/api/medical-reminders/today', async (req, res) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find medical records with vaccinations due today
    const reminders = await MedicalRecord.find({
      nextVaccinationDue: {
        $gte: today.setHours(0, 0, 0, 0),
        $lt: tomorrow.setHours(0, 0, 0, 0)
      }
    });
    
    res.json({ success: true, reminders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medical reminders', details: error.message });
  }
});

// Get application statistics (for admin dashboard)
app.get('/api/volunteer-stats', async (req, res) => {
  try {
    const stats = await VolunteerApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const roleStats = await VolunteerApplication.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await VolunteerApplication.countDocuments();
    const recentApplications = await VolunteerApplication.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      stats: {
        total: totalApplications,
        recent: recentApplications,
        byStatus: stats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byRole: roleStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      details: error.message
    });
  }
});

// Create sample rescue cases for testing
app.post('/api/rescue-cases/sample', async (req, res) => {
  try {
    const sampleCases = [
      {
        title: 'Injured Dog - Bandra West',
        description: 'Dog with injured leg, limping and unable to walk properly. Needs immediate medical attention.',
        location: 'Bandra West, Mumbai',
        reportedBy: 'Priya Sharma',
        phone: '+91-9876543210',
        status: 'pending',
        priority: 'high'
      },
      {
        title: 'Sick Cat - Andheri East',
        description: 'Cat with respiratory infection, sneezing and difficulty breathing.',
        location: 'Andheri East, Mumbai',
        reportedBy: 'Amit Patel',
        phone: '+91-9876543211',
        status: 'in-progress',
        priority: 'medium',
        assignedVolunteer: 'Dr. Meera Singh'
      },
      {
        title: 'Abandoned Puppies - Powai',
        description: 'Three puppies found abandoned near Powai Lake. Appear to be 6-8 weeks old.',
        location: 'Powai, Mumbai',
        reportedBy: 'Rajesh Kumar',
        phone: '+91-9876543212',
        status: 'pending',
        priority: 'high'
      },
      {
        title: 'Elderly Dog - Juhu Beach',
        description: 'Old dog found near Juhu Beach, appears malnourished and weak.',
        location: 'Juhu Beach, Mumbai',
        reportedBy: 'Sunita Mehta',
        phone: '+91-9876543213',
        status: 'in-progress',
        priority: 'medium',
        assignedVolunteer: 'Dr. Priya Singh'
      },
      {
        title: 'Cat Stuck in Tree - Versova',
        description: 'Cat has been stuck in a tree for 2 days. Fire department unable to help.',
        location: 'Versova, Mumbai',
        reportedBy: 'Neha Gupta',
        phone: '+91-9876543214',
        status: 'pending',
        priority: 'urgent'
      }
    ];

    const createdCases = await RescueCase.insertMany(sampleCases);
    
    res.json({
      success: true,
      message: 'Sample rescue cases created successfully',
      cases: createdCases
    });

  } catch (error) {
    console.error('Error creating sample cases:', error);
    res.status(500).json({
      error: 'Failed to create sample cases',
      details: error.message
    });
  }
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    details: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`MongoDB URI: ${MONGODB_URI}`);
});

module.exports = app;
