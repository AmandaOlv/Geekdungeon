const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
  PYTHON_API_URL: process.env.PYTHON_API_URL || 'http://localhost:8000',
};
