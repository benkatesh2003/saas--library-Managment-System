/**
 * @file idGenerator.js
 * @description Auto-ID generators for various entities.
 */

const { Admin, Student, Feature, StudentInvoice } = require('../models');

/**
 * Generates the next library ID (e.g., 'LIB-001').
 * @returns {Promise<string>} The generated Library ID.
 */
const generateLibraryId = async () => {
  try {
    const lastAdmin = await Admin.findOne({}, { libraryId: 1 }).sort({ createdAt: -1 });
    let nextNum = 1;

    if (lastAdmin && lastAdmin.libraryId) {
      const match = lastAdmin.libraryId.match(/^LIB-(\d+)$/);
      if (match && match[1]) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    
    return `LIB-${nextNum.toString().padStart(3, '0')}`;
  } catch (error) {
    throw new Error(`Failed to generate Library ID: ${error.message}`);
  }
};

/**
 * Generates the next student ID for a specific tenant (e.g., 'STU-00001').
 * @param {string} adminId - The tenant's Admin ID.
 * @returns {Promise<string>} The generated Student ID.
 */
const generateStudentId = async (adminId) => {
  try {
    const lastStudent = await Student.findOne({ adminId }, { studentId: 1 }).sort({ createdAt: -1 });
    let nextNum = 1;

    if (lastStudent && lastStudent.studentId) {
      const match = lastStudent.studentId.match(/^STU-(\d+)$/);
      if (match && match[1]) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    return `STU-${nextNum.toString().padStart(5, '0')}`;
  } catch (error) {
    throw new Error(`Failed to generate Student ID: ${error.message}`);
  }
};

/**
 * Generates the next feature code (e.g., 'FEAT-001').
 * @returns {Promise<string>} The generated Feature Code.
 */
const generateFeatureCode = async () => {
  try {
    const lastFeature = await Feature.findOne({}, { code: 1 }).sort({ createdAt: -1 });
    let nextNum = 1;

    if (lastFeature && lastFeature.code) {
      const match = lastFeature.code.match(/^FEAT-(\d+)$/);
      if (match && match[1]) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    return `FEAT-${nextNum.toString().padStart(3, '0')}`;
  } catch (error) {
    throw new Error(`Failed to generate Feature Code: ${error.message}`);
  }
};

/**
 * Generates an invoice number (e.g., 'INV-YYYYMMDD-00001').
 * Daily counter per admin.
 * @param {string} adminId - The tenant's Admin ID.
 * @returns {Promise<string>} The generated Invoice Number.
 */
const generateInvoiceNumber = async (adminId) => {
  try {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const prefix = `INV-${dateStr}-`;
    
    // Find highest invoice number for this admin today
    const lastInvoice = await StudentInvoice.findOne({ 
      adminId, 
      invoiceNumber: { $regex: `^${prefix}` } 
    }, { invoiceNumber: 1 }).sort({ invoiceNumber: -1 });

    let nextNum = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.split('-');
      if (match.length === 3) {
        nextNum = parseInt(match[2], 10) + 1;
      }
    }

    return `${prefix}${nextNum.toString().padStart(5, '0')}`;
  } catch (error) {
    throw new Error(`Failed to generate Invoice Number: ${error.message}`);
  }
};

module.exports = {
  generateLibraryId,
  generateStudentId,
  generateFeatureCode,
  generateInvoiceNumber,
};
