const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

const { setMemoryStore } = require('./store/memoryHelper');
const memStore = require('./store/inMemoryStore');
const { seedData } = memStore;
setMemoryStore(memStore);

const User = require('./models/User');
const Application = require('./models/Application');
const Certificate = require('./models/Certificate');
const Notification = require('./models/Notification');

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const mlRoutes = require('./routes/ml');
const adminRoutes = require('./routes/admin');
const certificateRoutes = require('./routes/certificates');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Bonafide Express Backend',
    dbState: 'in-memory',
    timestamp: new Date().toISOString()
  });
});

seedData().then(() => {
  app.listen(PORT, () => {
    console.log(`Express Backend Server running on port ${PORT}`);
    console.log('Database: In-Memory Store');
    console.log('Admin: admin@gct.edu / admin123');
    console.log('Student: arun@gct.edu / password123');
  });
});
