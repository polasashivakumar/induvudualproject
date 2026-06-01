const axios = require('axios');

(async () => {
  try {
    const base = 'http://localhost:5000/api';
    const login = await axios.post(base + '/auth/login', { email: 'admin@123', password: 'admin@123' });
    const token = login.data.token;
    console.log('Logged in, token length:', token?.length || 0);

    const announce = await axios.post(base + '/announcements', { title: 'Test Announcement', message: 'This is a test', type: 'info' }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Posted announcement:', announce.data.announcement?._id || announce.data);

    const list = await axios.get(base + '/announcements', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Announcements count:', list.data.length);
    console.log(list.data[0]);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
    process.exit(1);
  }
})();
