/**
 * Seed script for Saarthi platform
 * Run with:  node src/seed.js
 * (from the /server directory)
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const PwDRequest = require('./models/PwDRequest');
const Support = require('./models/Support');
const Payment = require('./models/Payment');
const Notification = require('./models/Notification');

// ─── helpers ──────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const CITIES = [
  'Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam',
  'Vadodara', 'Surat', 'Coimbatore', 'Agra', 'Varanasi',
  'Dehradun', 'Chandigarh', 'Bhubaneswar', 'Ranchi', 'Patna',
];

const DISABILITY_TYPES = [
  'Visual Impairment', 'Hearing Impairment', 'Locomotor Disability',
  'Intellectual Disability', 'Speech Impairment', 'Multiple Disabilities',
];

const DEVICE_TYPES = ['Mobility', 'Hearing', 'Vision', 'Communication', 'Cognitive'];

const AIDS = {
  Mobility:      ['Electric Wheelchair', 'Orthopaedic Walker', 'Prosthetic Limb', 'Crutches'],
  Hearing:       ['Smart Hearing Aid', 'Cochlear Implant Processor', 'Vibrating Alert Device'],
  Vision:        ['Smart Walking Stick', 'Braille Display', 'Screen Reader Device', 'Magnifier'],
  Communication: ['Communication Board', 'AAC Device', 'Speech Amplifier'],
  Cognitive:     ['Reminder Watch', 'GPS Tracker Device', 'Smart Medication Dispenser'],
};

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'Approved', 'InProgress', 'Delivered', 'Verified'];

const FIRST_NAMES = [
  'Arjun', 'Priya', 'Rahul', 'Sunita', 'Vikram', 'Meena', 'Suresh', 'Kavita',
  'Ravi', 'Anita', 'Deepak', 'Lakshmi', 'Manish', 'Pooja', 'Arun', 'Rekha',
  'Sanjay', 'Geeta', 'Rajesh', 'Usha', 'Aditya', 'Nisha', 'Sunil', 'Asha',
  'Harish', 'Savita', 'Mohit', 'Radha', 'Vikas', 'Seema',
];
const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Joshi', 'Yadav',
  'Mehta', 'Agarwal', 'Tiwari', 'Mishra', 'Chauhan', 'Bhatia', 'Nair',
];

const DONOR_NAMES = [
  'TechCorp CSR', 'Infosys Foundation', 'Reliance Industries CSR',
  'HDFC Trust', 'Tata Trusts Donor',
];

async function main() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sakshamsetu';
  if (!MONGO_URI) {
    console.error('❌  MONGO_URI is not set in .env.local');
    process.exit(1);
  }

  console.log('🔗  Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected.\n');

  // ── clean slate (only for development!) ──────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    PwDRequest.deleteMany({}),
    Support.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🗑️   Cleared all existing data.\n');

  const SALT = 10;
  const DEFAULT_PASS = '123456';

  // ── 1. Admin ──────────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@gmail.com',
    passwordHash: DEFAULT_PASS,
    role: 'Admin',
    location: 'Delhi',
    isActive: true,
    udidVerified: false,
  });
  console.log('👤  Admin created:', admin.email);

  // ── 2. Donors ────────────────────────────────────────────────────────────
  const donors = [];
  for (let i = 0; i < DONOR_NAMES.length; i++) {
    const donor = await User.create({
      name: DONOR_NAMES[i],
      email: `donor${i + 1}@gmail.com`,
      passwordHash: DEFAULT_PASS,
      role: 'Donor',
      location: pick(CITIES),
      isActive: true,
      udidVerified: false,
    });
    donors.push(donor);
  }
  console.log(`💰  Created ${donors.length} donors.\n`);

  // ── 3. PwD Users (30) ────────────────────────────────────────────────────
  const pwdUsers = [];
  for (let i = 0; i < 30; i++) {
    const name = `${FIRST_NAMES[i]} ${pick(LAST_NAMES)}`;
    const city = CITIES[i % CITIES.length];
    const disability = DISABILITY_TYPES[i % DISABILITY_TYPES.length];
    const isVerified = i < 18; // first 18 are verified

    const pwd = await User.create({
      name,
      email: `pwd${i + 1}@gmail.com`,
      passwordHash: DEFAULT_PASS,
      role: 'PwD',
      location: city,
      disabilityType: disability,
      udidNumber: isVerified ? `UDID-${2024000 + i}` : undefined,
      udidVerified: isVerified,
      verificationStatus: isVerified ? 'Approved' : 'Pending',
      consent: isVerified,
      isActive: true,
    });
    pwdUsers.push(pwd);
  }
  console.log(`♿  Created ${pwdUsers.length} PwD users.\n`);

  // ── 4. PwD Requests (50) ─────────────────────────────────────────────────
  const requests = [];
  for (let i = 0; i < 50; i++) {
    const pwd = pwdUsers[i % pwdUsers.length];
    const deviceType = pick(DEVICE_TYPES);
    const aidName = pick(AIDS[deviceType]);
    const status = STATUSES[i % STATUSES.length];

    const req = await PwDRequest.create({
      requestedBy: pwd._id,
      deviceType,
      aidName,
      description: `${pwd.name} needs ${aidName} due to ${pwd.disabilityType || 'disability'}.`,
      priority: pick(PRIORITIES),
      region: pwd.location,
      status,
      deliveredAt: ['Delivered', 'Verified'].includes(status) ? new Date(Date.now() - randInt(1, 30) * 86400000) : undefined,
      verifiedAt: status === 'Verified' ? new Date(Date.now() - randInt(1, 10) * 86400000) : undefined,
    });
    requests.push(req);
  }
  console.log(`📋  Created ${requests.length} PwD requests.\n`);

  // ── 5. Supports & Payments ───────────────────────────────────────────────
  const SUPPORT_STATUSES = ['Initiated', 'Delivered', 'Completed'];
  const PLAN_NAMES = ['Basic Plan', 'Standard Plan', 'Impact Plan', 'Monthly', 'Annual'];

  for (let i = 0; i < 20; i++) {
    const donor = donors[i % donors.length];
    const request = requests[i % requests.length];
    const supportStatus = SUPPORT_STATUSES[i % SUPPORT_STATUSES.length];

    const support = await Support.create({
      donorId: donor._id,
      requestId: request._id,
      amount: pick([0, 500, 1000, 1500]),
      status: supportStatus,
      notes: `Supporting ${request.aidName} for ${request.region}`,
      deliveredAt: supportStatus !== 'Initiated' ? new Date(Date.now() - randInt(1, 20) * 86400000) : undefined,
    });

    // Payment per donor (mock subscription)
    if (i < donors.length) {
      const plan = PLAN_NAMES[i % PLAN_NAMES.length];
      const amount = pick([499, 999, 1999, 4999, 45000]);
      await Payment.create({
        donorId: donor._id,
        plan,
        amount,
        status: 'Success',
        paymentId: `SEED_PAY_${Date.now()}_${i}`,
        razorpayOrderId: `ORDER_SEED_${i}`,
        razorpayPaymentId: `PAY_SEED_${i}`,
      });
    }
  }
  console.log(`🤝  Created 20 support records + ${donors.length} payments.\n`);

  // ── 6. Notifications ─────────────────────────────────────────────────────
  const notifMessages = [
    { title: 'Request Approved', message: 'Your device request has been approved!', type: 'Success' },
    { title: 'New Support', message: 'A donor is supporting your request.', type: 'Info' },
    { title: 'Verification Pending', message: 'Your UDID verification is under review.', type: 'Info' },
    { title: 'Device Delivered', message: 'Your requested device has been delivered. Please verify receipt.', type: 'Success' },
  ];

  for (let i = 0; i < 20; i++) {
    const user = pick([...pwdUsers, ...donors]);
    const msg = notifMessages[i % notifMessages.length];
    await Notification.create({
      userId: user._id,
      title: msg.title,
      message: msg.message,
      type: msg.type,
      read: i % 3 === 0,
    });
  }

  // Admin notifications
  for (let i = 0; i < 5; i++) {
    await Notification.create({
      userId: admin._id,
      title: 'New PwD Request',
      message: `A new request for ${requests[i].aidName} has been submitted.`,
      type: 'Info',
    });
  }
  console.log('🔔  Created 25 notifications.\n');

  // ── summary ───────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════');
  console.log('✅  Seed complete!');
  console.log('');
  console.log('Login credentials (password: 123456)');
  console.log('  Admin  : admin@gmail.com');
  console.log('  Donors : donor1@gmail.com … donor5@gmail.com');
  console.log('  PwDs   : pwd1@gmail.com … pwd30@gmail.com');
  console.log('═══════════════════════════════════════');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
