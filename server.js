const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = process.env.VERCEL
  ? path.join('/tmp', 'enquiries.json')
  : path.join(__dirname, 'enquiries.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Contact form API
app.post('/api/contact', (req, res) => {
  const { parentName, childAge, email, phone, message } = req.body;

  if (!parentName || !childAge || !email) {
    return res.status(400).json({ error: 'Name, child age, and email are required.' });
  }

  const enquiry = {
    id: Date.now(),
    parentName,
    childAge,
    email,
    phone: phone || '',
    message: message || '',
    submittedAt: new Date().toISOString()
  };

  // Read existing enquiries, append, and write back
  let enquiries = [];
  if (fs.existsSync(DATA_FILE)) {
    enquiries = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  enquiries.push(enquiry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(enquiries, null, 2));

  console.log(`New enquiry from ${parentName} (${email})`);
  res.status(201).json({ message: 'Enquiry received.' });
});

// View all enquiries (simple admin endpoint)
app.get('/api/enquiries', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.json([]);
  }
  const enquiries = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  res.json(enquiries);
});

app.listen(PORT, () => {
  console.log(`Heguru Learning Centre running at http://localhost:${PORT}`);
});

module.exports = app;
