const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['citizen', 'field_officer', 'department_admin', 'government_admin'],
      default: 'citizen'
    },
    department: String, // department code, for officer/admin roles
    phone: String,
    preferredLanguage: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
    accessibility: {
      highContrast: { type: Boolean, default: false },
      fontScale: { type: Number, default: 1 },
      simpleLanguage: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

userSchema.methods.verifyPassword = function verifyPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
