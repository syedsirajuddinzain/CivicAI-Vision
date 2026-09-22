import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PersistentCollection, isConnectedToMongo } from '../config/db.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['citizen', 'authority', 'worker'],
      default: 'citizen',
    },
    departmentId: { type: String, default: null },
    department: { type: String, default: null },
    wardId: { type: String, default: null },
    ward: { type: String, default: null },
    workerId: { type: String, default: null },
    status: {
      type: String,
      enum: ['active', 'pending_approval', 'rejected'],
      default: 'active',
    },
    approvedBy: { type: String, default: null },
    approvedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const MongoUser = mongoose.models.User || mongoose.model('User', userSchema);
const persistentStore = new PersistentCollection('users');

// Unified Model Wrapper
const User = {
  async find(filter = {}) {
    if (isConnectedToMongo) return await MongoUser.find(filter);
    return await persistentStore.find(filter);
  },
  async findOne(filter = {}) {
    if (isConnectedToMongo) return await MongoUser.findOne(filter);
    return await persistentStore.findOne(filter);
  },
  async findById(id) {
    if (isConnectedToMongo) return await MongoUser.findById(id);
    return await persistentStore.findById(id);
  },
  async create(data) {
    let hashedPassword = data.password;
    if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(data.password, salt);
    }
    const userPayload = { ...data, password: hashedPassword };

    if (isConnectedToMongo) return await MongoUser.create(userPayload);
    return await persistentStore.create(userPayload);
  },
  async findByIdAndUpdate(id, update, options) {
    if (update.password && !update.password.startsWith('$2a$') && !update.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
    }
    if (isConnectedToMongo) return await MongoUser.findByIdAndUpdate(id, update, options);
    return await persistentStore.findByIdAndUpdate(id, update, options);
  },
  async countDocuments(filter = {}) {
    if (isConnectedToMongo) return await MongoUser.countDocuments(filter);
    return await persistentStore.countDocuments(filter);
  },
  async matchPassword(enteredPassword, storedPassword) {
    if (!enteredPassword || !storedPassword) return false;
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
      return await bcrypt.compare(enteredPassword, storedPassword);
    }
    return enteredPassword === storedPassword;
  },
  async deleteMany(filter = {}) {
    if (isConnectedToMongo) return await MongoUser.deleteMany(filter);
    return await persistentStore.deleteMany(filter);
  },
  async findByIdAndDelete(id) {
    if (isConnectedToMongo) return await MongoUser.findByIdAndDelete(id);
    return await persistentStore.deleteMany({ _id: id });
  },
};

export default User;
