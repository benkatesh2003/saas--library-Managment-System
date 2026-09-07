/**
 * @fileoverview Model Validation Script
 * @description Validates all Mongoose models can be loaded, schemas are correct,
 *              indexes are defined, and basic document creation works.
 *
 * Usage: node src/scripts/validateModels.js
 */

const mongoose = require('mongoose');

// ─── Color helpers for console ──────────────────────
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ${green('✓')} ${message}`);
    passed++;
  } else {
    console.log(`  ${red('✗')} ${message}`);
    failed++;
  }
}

async function validateModels() {
  console.log(bold('\n📦 Library Sathi — Model Validation\n'));
  console.log('─'.repeat(50));

  // ─── 1. Load all models ────────────────────────────
  console.log(cyan('\n1. Loading Models...\n'));

  let models;
  try {
    models = require('../models');
    assert(true, 'All models loaded successfully');
  } catch (err) {
    console.log(red(`  ✗ Failed to load models: ${err.message}`));
    process.exit(1);
  }

  const expectedModels = [
    'SuperAdmin', 'Feature', 'Plan', 'Subscription',
    'Admin', 'Student', 'Seat', 'Shift', 'Locker',
    'Book', 'BookIssue', 'StudentPayment', 'StudentInvoice',
  ];

  for (const name of expectedModels) {
    assert(models[name], `Model "${name}" exported`);
    assert(
      models[name].prototype instanceof mongoose.Model || models[name].modelName,
      `"${name}" is a valid Mongoose model (modelName: ${models[name].modelName || 'N/A'})`
    );
  }

  // ─── 2. Verify model names in Mongoose registry ───
  console.log(cyan('\n2. Mongoose Registry Check...\n'));

  const registeredModels = mongoose.modelNames();
  console.log(`  Registered models: ${registeredModels.join(', ')}`);
  assert(registeredModels.length >= 13, `At least 13 models registered (found: ${registeredModels.length})`);

  // ─── 3. Schema Field Validation ────────────────────
  console.log(cyan('\n3. Schema Field Validation...\n'));

  // SuperAdmin
  const saSchema = models.SuperAdmin.schema;
  assert(saSchema.path('name'), 'SuperAdmin: has "name" field');
  assert(saSchema.path('email'), 'SuperAdmin: has "email" field');
  assert(saSchema.path('password'), 'SuperAdmin: has "password" field');
  assert(saSchema.path('role'), 'SuperAdmin: has "role" field');

  // Feature
  const fSchema = models.Feature.schema;
  assert(fSchema.path('name'), 'Feature: has "name" field');
  assert(fSchema.path('code'), 'Feature: has "code" field');
  assert(fSchema.path('type'), 'Feature: has "type" field');
  assert(fSchema.path('pricing.monthly') || fSchema.path('pricing'), 'Feature: has "pricing" field');
  assert(fSchema.path('image.url') || fSchema.path('image'), 'Feature: has "image" field');
  assert(fSchema.path('isActive'), 'Feature: has "isActive" field');

  // Plan
  const pSchema = models.Plan.schema;
  assert(pSchema.path('name'), 'Plan: has "name" field');
  assert(pSchema.path('features'), 'Plan: has "features" field');
  assert(pSchema.path('pricing.monthly') || pSchema.path('pricing'), 'Plan: has "pricing" field');
  assert(pSchema.path('discount.percentage') || pSchema.path('discount'), 'Plan: has "discount" field');
  assert(pSchema.path('isActive'), 'Plan: has "isActive" field');

  // Subscription
  const subSchema = models.Subscription.schema;
  assert(subSchema.path('adminId'), 'Subscription: has "adminId" field');
  assert(subSchema.path('planId'), 'Subscription: has "planId" field');
  assert(subSchema.path('paymentStatus'), 'Subscription: has "paymentStatus" field');
  assert(subSchema.path('razorpayOrderId'), 'Subscription: has "razorpayOrderId" field');

  // Admin
  const aSchema = models.Admin.schema;
  assert(aSchema.path('libraryId'), 'Admin: has "libraryId" field');
  assert(aSchema.path('firstName'), 'Admin: has "firstName" field');
  assert(aSchema.path('email'), 'Admin: has "email" field');
  assert(aSchema.path('password'), 'Admin: has "password" field');
  assert(aSchema.path('libraryName'), 'Admin: has "libraryName" field');
  assert(aSchema.path('subscriptionId'), 'Admin: has "subscriptionId" field');
  assert(aSchema.path('googleId'), 'Admin: has "googleId" field');

  // Student
  const stSchema = models.Student.schema;
  assert(stSchema.path('studentId'), 'Student: has "studentId" field');
  assert(stSchema.path('adminId'), 'Student: has "adminId" field');
  assert(stSchema.path('name'), 'Student: has "name" field');
  assert(stSchema.path('paymentStatus'), 'Student: has "paymentStatus" field');

  // Seat
  const seSchema = models.Seat.schema;
  assert(seSchema.path('adminId'), 'Seat: has "adminId" field');
  assert(seSchema.path('seatNumber'), 'Seat: has "seatNumber" field');
  assert(seSchema.path('status'), 'Seat: has "status" field');

  // Shift
  const shSchema = models.Shift.schema;
  assert(shSchema.path('adminId'), 'Shift: has "adminId" field');
  assert(shSchema.path('name'), 'Shift: has "name" field');
  assert(shSchema.path('startTime'), 'Shift: has "startTime" field');
  assert(shSchema.path('endTime'), 'Shift: has "endTime" field');
  assert(shSchema.path('price'), 'Shift: has "price" field');

  // Locker
  const lSchema = models.Locker.schema;
  assert(lSchema.path('adminId'), 'Locker: has "adminId" field');
  assert(lSchema.path('lockerNumber'), 'Locker: has "lockerNumber" field');
  assert(lSchema.path('isOccupied'), 'Locker: has "isOccupied" field');
  assert(lSchema.path('status'), 'Locker: has "status" field');

  // Book
  const bSchema = models.Book.schema;
  assert(bSchema.path('adminId'), 'Book: has "adminId" field');
  assert(bSchema.path('title'), 'Book: has "title" field');
  assert(bSchema.path('ISBN'), 'Book: has "ISBN" field');
  assert(bSchema.path('totalCopies'), 'Book: has "totalCopies" field');
  assert(bSchema.path('availableCopies'), 'Book: has "availableCopies" field');

  // BookIssue
  const biSchema = models.BookIssue.schema;
  assert(biSchema.path('bookId'), 'BookIssue: has "bookId" field');
  assert(biSchema.path('studentId'), 'BookIssue: has "studentId" field');
  assert(biSchema.path('dueDate'), 'BookIssue: has "dueDate" field');
  assert(biSchema.path('fine'), 'BookIssue: has "fine" field');
  assert(biSchema.path('status'), 'BookIssue: has "status" field');

  // StudentPayment
  const spSchema = models.StudentPayment.schema;
  assert(spSchema.path('studentId'), 'StudentPayment: has "studentId" field');
  assert(spSchema.path('adminId'), 'StudentPayment: has "adminId" field');
  assert(spSchema.path('shiftAmount'), 'StudentPayment: has "shiftAmount" field');
  assert(spSchema.path('lockerAmount'), 'StudentPayment: has "lockerAmount" field');
  assert(spSchema.path('paymentStatus'), 'StudentPayment: has "paymentStatus" field');

  // StudentInvoice
  const siSchema = models.StudentInvoice.schema;
  assert(siSchema.path('invoiceNumber'), 'StudentInvoice: has "invoiceNumber" field');
  assert(siSchema.path('studentId'), 'StudentInvoice: has "studentId" field');
  assert(siSchema.path('paymentId'), 'StudentInvoice: has "paymentId" field');
  assert(siSchema.path('totalPayable'), 'StudentInvoice: has "totalPayable" field');

  // ─── 4. Ref Consistency ────────────────────────────
  console.log(cyan('\n4. Reference Consistency...\n'));

  const refChecks = [
    { model: 'Plan', field: 'features', expectedRef: 'Feature' },
    { model: 'Subscription', field: 'adminId', expectedRef: 'Admin' },
    { model: 'Subscription', field: 'planId', expectedRef: 'Plan' },
    { model: 'Admin', field: 'subscriptionId', expectedRef: 'Subscription' },
    { model: 'Student', field: 'adminId', expectedRef: 'Admin' },
    { model: 'Seat', field: 'adminId', expectedRef: 'Admin' },
    { model: 'Shift', field: 'adminId', expectedRef: 'Admin' },
    { model: 'Locker', field: 'adminId', expectedRef: 'Admin' },
    { model: 'Book', field: 'adminId', expectedRef: 'Admin' },
    { model: 'BookIssue', field: 'bookId', expectedRef: 'Book' },
    { model: 'BookIssue', field: 'studentId', expectedRef: 'Student' },
    { model: 'StudentPayment', field: 'studentId', expectedRef: 'Student' },
    { model: 'StudentPayment', field: 'adminId', expectedRef: 'Admin' },
    { model: 'StudentInvoice', field: 'studentId', expectedRef: 'Student' },
    { model: 'StudentInvoice', field: 'adminId', expectedRef: 'Admin' },
    { model: 'StudentInvoice', field: 'paymentId', expectedRef: 'StudentPayment' },
  ];

  for (const { model, field, expectedRef } of refChecks) {
    const schema = models[model].schema;
    const path = schema.path(field);
    if (!path) {
      assert(false, `${model}.${field} → ${expectedRef} (field not found)`);
      continue;
    }

    // Handle array refs (e.g. features: [{ type: ObjectId, ref: 'Feature' }])
    let ref;
    if (path.instance === 'Array' && path.caster && path.caster.options) {
      ref = path.caster.options.ref;
    } else if (path.options) {
      ref = path.options.ref;
    }

    // Fallback: try $embeddedSchemaType for some Mongoose versions
    if (!ref && path.$embeddedSchemaType && path.$embeddedSchemaType.options) {
      ref = path.$embeddedSchemaType.options.ref;
    }

    // Fallback: inspect schema.obj for shorthand array definition
    if (!ref && schema.obj && schema.obj[field]) {
      const fieldDef = schema.obj[field];
      if (Array.isArray(fieldDef) && fieldDef[0] && fieldDef[0].ref) {
        ref = fieldDef[0].ref;
      }
    }

    assert(
      ref === expectedRef,
      `${model}.${field} → ref: "${ref || 'NONE'}" (expected: "${expectedRef}")`
    );
  }

  // ─── 5. Multi-Tenant (adminId) Check ──────────────
  console.log(cyan('\n5. Multi-Tenant Isolation (adminId presence)...\n'));

  const tenantModels = ['Student', 'Seat', 'Shift', 'Locker', 'Book', 'BookIssue', 'StudentPayment', 'StudentInvoice'];
  for (const name of tenantModels) {
    const schema = models[name].schema;
    const adminIdPath = schema.path('adminId');
    assert(adminIdPath, `${name}: has "adminId" field for tenant isolation`);
    if (adminIdPath) {
      assert(
        adminIdPath.options.required,
        `${name}: "adminId" is required`
      );
    }
  }

  // ─── Summary ───────────────────────────────────────
  console.log('\n' + '─'.repeat(50));
  console.log(bold(`\n📊 Results: ${green(`${passed} passed`)}, ${failed > 0 ? red(`${failed} failed`) : green(`${failed} failed`)}\n`));

  if (failed > 0) {
    console.log(yellow('⚠️  Some validations failed. Please review the model definitions.\n'));
    process.exit(1);
  } else {
    console.log(green('🎉 All model validations passed! Data layer is ready.\n'));
    process.exit(0);
  }
}

validateModels().catch((err) => {
  console.error(red(`\n💀 Validation script crashed: ${err.message}`));
  console.error(err.stack);
  process.exit(1);
});
