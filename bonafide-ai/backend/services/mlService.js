const axios = require('axios');

const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';

const predictEligibility = async (applicationData) => {
  try {
    const payload = {
      attendance: Number(applicationData.attendance || 75.0),
      cgpa: Number(applicationData.cgpa || 7.5),
      feeStatus: applicationData.feeStatus || 'Paid',
      semester: Number(applicationData.semester || 1),
      academicStatus: applicationData.academicStatus || 'Good',
      previousBonafideCount: Number(applicationData.previousBonafideCount || 0),
      purpose: applicationData.purpose || 'Scholarship',
      previousApplicationStatus: applicationData.previousApplicationStatus || 'Approved',
      disciplinaryStatus: applicationData.disciplinaryStatus || 'Clear',
      course: applicationData.course || 'MCA',
      department: applicationData.department || 'Computer Science'
    };

    console.log('Sending payload to FastAPI ML Service:', payload);

    const response = await axios.post(`${mlServiceUrl}/predict`, payload, { timeout: 8000 });
    return {
      prediction: response.data.prediction || 'Approved',
      confidence: response.data.confidence !== undefined ? response.data.confidence : 0.90
    };
  } catch (error) {
    console.error('ML Service connection failed:', error.message);
    // Fallback in case python service is offline
    const att = Number(applicationData.attendance || 75);
    const cg = Number(applicationData.cgpa || 7.5);
    const fee = applicationData.feeStatus || 'Paid';
    const isApproved = att >= 70 && fee === 'Paid' && cg >= 6.0;

    return {
      prediction: isApproved ? 'Approved' : 'Rejected',
      confidence: isApproved ? 0.88 : 0.72
    };
  }
};

module.exports = { predictEligibility };