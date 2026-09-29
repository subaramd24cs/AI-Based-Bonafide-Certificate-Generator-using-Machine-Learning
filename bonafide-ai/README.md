# AI-Based Bonafide Certificate Generator using Machine Learning

A smart web-based system that uses Machine Learning to predict bonafide certificate application eligibility, allows administrators to verify and approve applications, and automatically generates downloadable bonafide certificates in PDF format.

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend:** Node.js, Express.js, MongoDB, JWT Auth
- **ML:** Python, Scikit-learn (Decision Tree), Pandas, NumPy
- **Certificate:** PDFKit, QR Code

## Prerequisites

- Node.js (v18+)
- Python (3.8+)
- MongoDB (running locally or Atlas URI)
- npm

## Setup

### 1. ML Module

```bash
cd ml
pip install -r requirements.txt
python train_model.py
```

### 2. Backend

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Default Accounts

### Admin
- **Username:** admin
- **Password:** admin123

### Sample Student (auto-created)
- **Email:** student@gct.edu
- **Password:** student123

## Features

- Student registration and authentication
- Online bonafide certificate application
- ML-based application prediction (Decision Tree)
- Admin dashboard with analytics
- Admin approval/rejection workflow
- Automatic PDF certificate generation
- QR code verification
- Application tracking and notifications
- Responsive mobile-friendly UI
- Academic Blue Glass theme

## Project Structure

```
bonafide-ai/
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express API
├── ml/                # Python ML module
├── README.md
└── .gitignore
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register student
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Applications
- `POST /api/applications` - Create application (protected)
- `GET /api/applications` - My applications (protected)
- `GET /api/applications/:id` - Application details (protected)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats (admin)
- `GET /api/admin/applications` - All applications (admin)
- `PUT /api/admin/applications/:id/approve` - Approve (admin)
- `PUT /api/admin/applications/:id/reject` - Reject (admin)

### Certificates
- `POST /api/certificates/generate/:applicationId` - Generate (admin)
- `GET /api/certificates/:id/download` - Download (protected)
- `GET /api/certificates/verify/:certificateId` - Verify (public)

## License

MIT
