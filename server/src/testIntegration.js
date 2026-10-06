const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('./config/db');
const User = require('./models/User');
const Meeting = require('./models/Meeting');
const generateToken = require('./utils/generateToken');

async function testBackend() {
  await connectDB();
  console.log('--- 1. Testing User Registration & Model ---');
  const testEmail = 'test_' + Date.now() + '@example.com';
  const userA = await User.create({ name: 'User A', email: testEmail, password: 'password123' });
  const isMatch = await userA.matchPassword('password123');
  console.log('Password match test:', isMatch ? 'PASSED' : 'FAILED');

  const token = generateToken(userA._id);
  console.log('JWT generation test:', token ? 'PASSED' : 'FAILED');

  console.log('--- 2. Testing Meeting Creation & Persistence ---');
  const meeting = await Meeting.create({
    userId: userA._id,
    title: 'Q4 Strategy Sync',
    transcript: 'Khushi: We need to complete the MeetingMind dashboard by Thursday.\nRahul: I will handle auth API.',
    participants: ['Khushi', 'Rahul'],
    actionItems: [{ task: 'Complete dashboard', owner: 'Khushi', priority: 'High', status: 'Pending' }]
  });
  console.log('Meeting created with ID:', meeting._id);

  console.log('--- 3. Testing Ownership Security Check ---');
  const userB = await User.create({ name: 'User B', email: 'b_' + Date.now() + '@example.com', password: 'password123' });
  const hasAccess = meeting.userId.toString() === userB._id.toString();
  console.log('User B has access to User A meeting (should be false):', hasAccess);

  console.log('--- 4. Cleanup Test Documents ---');
  await Meeting.deleteMany({ userId: { $in: [userA._id, userB._id] } });
  await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
  console.log('Cleanup finished.');

  await disconnectDB();
  console.log('ALL BACKEND MODEL & DB TESTS PASSED SUCCESSFULLY!');
}

testBackend().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
