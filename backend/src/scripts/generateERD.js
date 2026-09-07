const mongoose = require("mongoose");
const { mongooseToErdMain } = require("mongoose-to-erd");

// Import ALL your models
require("../models/admin.model");
require("../models/student.model");
require("../models/seat.model");
require("../models/shift.model");
require("../models/locker.model");
require("../models/book.model");
require("../models/bookIssue.model");
require("../models/studentPayment.model");
require("../models/studentInvoice.model");
require("../models/subscription.model");
require("../models/plan.model");
require("../models/feature.model");
require("../models/superAdmin.model");

async function generateERD() {
  try {
    await mongooseToErdMain(
      mongoose.modelNames(),
      mongoose.model.bind(mongoose),
      {
        scale: 0.5,
        center: true,
        pad: 100,
      }
    );

    console.log("✅ ERD generated successfully");
  } catch (error) {
    console.error("❌ Failed to generate ERD:", error);
    process.exit(1);
  }
}

generateERD();