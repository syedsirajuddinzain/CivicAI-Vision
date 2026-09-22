import mongoose from 'mongoose';
import { PersistentCollection, isConnectedToMongo } from '../config/db.js';

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const MongoDepartment = mongoose.models.Department || mongoose.model('Department', departmentSchema);
const persistentStore = new PersistentCollection('departments');

const Department = {
  async find(filter = {}) {
    if (isConnectedToMongo) return await MongoDepartment.find(filter);
    return await persistentStore.find(filter);
  },
  async findOne(filter = {}) {
    if (isConnectedToMongo) return await MongoDepartment.findOne(filter);
    return await persistentStore.findOne(filter);
  },
  async findById(id) {
    if (isConnectedToMongo) return await MongoDepartment.findById(id);
    return await persistentStore.findById(id);
  },
  async create(data) {
    if (isConnectedToMongo) return await MongoDepartment.create(data);
    return await persistentStore.create(data);
  },
  async insertMany(docs) {
    if (isConnectedToMongo) return await MongoDepartment.insertMany(docs);
    return await persistentStore.insertMany(docs);
  },
  async countDocuments(filter = {}) {
    if (isConnectedToMongo) return await MongoDepartment.countDocuments(filter);
    return await persistentStore.countDocuments(filter);
  },
  async deleteMany(filter = {}) {
    if (isConnectedToMongo) return await MongoDepartment.deleteMany(filter);
    return await persistentStore.deleteMany(filter);
  },
};

export default Department;
