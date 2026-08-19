import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Liability from '../src/models/Liability.js';
import Document from '../src/models/Document.js';
import BeneficiaryRelationship from '../src/models/BeneficiaryRelationship.js';
import Permission from '../src/models/Permission.js';
import ActivationRequest from '../src/models/ActivationRequest.js';
import { config } from '../src/config/env.js';

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(config.mongoUri);
  const db = mongoose.connection.db;
  console.log('Connected. Clearing application collections...');

  await Promise.all([
    User.deleteMany({}),
    Liability.deleteMany({}),
    Document.deleteMany({}),
    BeneficiaryRelationship.deleteMany({}),
    Permission.deleteMany({}),
    ActivationRequest.deleteMany({}),
  ]);

  // Clear GridFS bucket
  try {
    await db.collection('vaultFiles.files').deleteMany({});
    await db.collection('vaultFiles.chunks').deleteMany({});
  } catch (e) {
    // collections may not exist yet
  }

  console.log('Creating demo users...');
  const admin = await User.create({
    name: 'Vault Admin',
    email: 'admin@nextgenvault.demo',
    password: await bcrypt.hash('Admin@123', 10),
    role: 'ADMIN',
    active: true,
  });

  const owner = await User.create({
    name: 'Demo Owner',
    email: 'owner@nextgenvault.demo',
    password: await bcrypt.hash('Owner@123', 10),
    role: 'OWNER',
    active: true,
  });

  const beneficiary = await User.create({
    name: 'Demo Beneficiary',
    email: 'beneficiary@nextgenvault.demo',
    password: await bcrypt.hash('Beneficiary@123', 10),
    role: 'BENEFICIARY',
    active: true,
  });

  console.log('Creating accepted relationship...');
  const rel = await BeneficiaryRelationship.create({
    ownerId: owner._id,
    beneficiaryId: beneficiary._id,
    relationship: 'Sibling',
    invitationStatus: 'ACCEPTED',
    active: true,
  });

  console.log('Creating liabilities...');
  const now = new Date();
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  const emi = await Liability.create({
    ownerId: owner._id,
    liabilityType: 'EMI',
    title: 'Home Loan - HDFC',
    providerName: 'HDFC Bank',
    maskedReference: 'XXXX-XXXX-4521',
    currency: 'INR',
    outstandingAmount: 2500000,
    amountAsOf: now,
    nextDueDate: inFiveDays,
    autoPayEnabled: true,
    status: 'ACTIVE',
    notes: 'Primary home loan. EMI auto-debited on the 5th of each month.',
    lastReviewedAt: now,
    emiDetails: {
      emiAmount: 24500,
      frequency: 'MONTHLY',
      remainingInstallments: 102,
      interestRate: 8.7,
      maturityDate: new Date(now.getFullYear() + 8, now.getMonth(), now.getDate()),
      loanCategory: 'HOME',
    },
  });

  const card = await Liability.create({
    ownerId: owner._id,
    liabilityType: 'CREDIT_CARD',
    title: 'Axis Bank Credit Card',
    providerName: 'Axis Bank',
    maskedReference: 'XXXX-XXXX-7841',
    currency: 'INR',
    outstandingAmount: 45200,
    amountAsOf: now,
    nextDueDate: inFiveDays,
    autoPayEnabled: false,
    status: 'ACTIVE',
    notes: 'Statement generated on the 12th. Pay full due before the 2nd of next month.',
    lastReviewedAt: now,
    cardDetails: {
      totalDue: 45200,
      minimumDue: 2260,
      billingCycleDate: new Date(now.getFullYear(), now.getMonth(), 12),
      lastFourDigits: '7841',
      cardIssuer: 'Axis Bank',
    },
  });

  // Overdue example (EMI)
  const overdueEmi = await Liability.create({
    ownerId: owner._id,
    liabilityType: 'EMI',
    title: 'Education Loan - SBI',
    providerName: 'State Bank of India',
    maskedReference: 'XXXX-XXXX-9930',
    currency: 'INR',
    outstandingAmount: 320000,
    amountAsOf: tenDaysAgo,
    nextDueDate: tenDaysAgo,
    autoPayEnabled: false,
    status: 'OVERDUE',
    notes: 'Missed last EMI. Contact the branch to regularize.',
    lastReviewedAt: tenDaysAgo,
    emiDetails: {
      emiAmount: 9800,
      frequency: 'MONTHLY',
      remainingInstallments: 33,
      interestRate: 9.2,
      maturityDate: new Date(now.getFullYear() + 3, now.getMonth(), now.getDate()),
      loanCategory: 'EDUCATION',
    },
  });

  console.log('Uploading a demo document for the EMI liability via GridFS...');
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'vaultFiles' });
  const storedName = `seed-emi-schedule-${Date.now()}.pdf`;
  const uploadStream = bucket.openUploadStream(storedName, {
    contentType: 'application/pdf',
    metadata: { ownerId: owner._id.toString(), parentId: emi._id.toString() },
  });
  const pdfContent = Buffer.from('%PDF-1.4\n%Next Gen Vault demo EMI schedule\n%%EOF');
  const gridFsFileId = await new Promise((resolve, reject) => {
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.end(pdfContent);
  });

  const doc = await Document.create({
    ownerId: owner._id,
    parentType: 'LIABILITY',
    parentId: emi._id,
    gridFsFileId,
    originalName: 'hdfc-emi-schedule.pdf',
    storedName,
    mimeType: 'application/pdf',
    size: pdfContent.length,
    category: 'EMI_SCHEDULE',
    status: 'ACTIVE',
  });

  console.log('Granting permission only for the EMI (not the card, not the document)...');
  await Permission.create({
    ownerId: owner._id,
    beneficiaryId: beneficiary._id,
    targetType: 'LIABILITY',
    targetId: emi._id,
    status: 'ACTIVE',
    grantedAt: now,
  });

  console.log('\n========================================');
  console.log('Seed complete!');
  console.log('========================================');
  console.log('Demo accounts:');
  console.log('  Admin:       admin@nextgenvault.demo / Admin@123');
  console.log('  Owner:       owner@nextgenvault.demo / Owner@123');
  console.log('  Beneficiary: beneficiary@nextgenvault.demo / Beneficiary@123');
  console.log('========================================');
  console.log('No approved activation request was created.');
  console.log('The beneficiary sees the owner but the vault is locked.');
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
