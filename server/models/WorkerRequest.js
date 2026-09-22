import mongoose from 'mongoose';
import { PersistentCollection, isConnectedToMongo } from '../config/db.js';

const workerRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    departmentId: { type: String, required: true },
    departmentName: { type: String, default: '' },
    wardId: { type: String, default: 'ward_101' },
    wardName: { type: String, default: 'Ward 101 — Central Business District' },
    skills: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const MongoWorkerRequest =
  mongoose.models.WorkerRequest || mongoose.model('WorkerRequest', workerRequestSchema);
const persistentStore = new PersistentCollection('worker_requests');

const WorkerRequest = {
  async find(filter = {}) {
    if (isConnectedToMongo) return await MongoWorkerRequest.find(filter).sort({ createdAt: -1 });
    return await persistentStore.find(filter);
  },
  async findOne(filter = {}) {
    if (isConnectedToMongo) return await MongoWorkerRequest.findOne(filter);
    return await persistentStore.findOne(filter);
  },
  async findById(id) {
    if (isConnectedToMongo) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const doc = await MongoWorkerRequest.findById(id);
        if (doc) return doc;
      }
      return await MongoWorkerRequest.findOne({ _id: id });
    }
    return await persistentStore.findById(id);
  },
  async create(data) {
    if (isConnectedToMongo) return await MongoWorkerRequest.create(data);
    return await persistentStore.create(data);
  },
  async findByIdAndUpdate(id, update, options) {
    if (isConnectedToMongo) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const doc = await MongoWorkerRequest.findByIdAndUpdate(id, update, options);
        if (doc) return doc;
      }
      return await MongoWorkerRequest.findOneAndUpdate({ _id: id }, update, options);
    }
    return await persistentStore.findByIdAndUpdate(id, update, options);
  },
  async countDocuments(filter = {}) {
    if (isConnectedToMongo) return await MongoWorkerRequest.countDocuments(filter);
    return await persistentStore.countDocuments(filter);
  },
  async deleteMany(filter = {}) {
    if (isConnectedToMongo) return await MongoWorkerRequest.deleteMany(filter);
    return await persistentStore.deleteMany(filter);
  },
  async findByIdAndDelete(id) {
    if (isConnectedToMongo) return await MongoWorkerRequest.findByIdAndDelete(id);
    return await persistentStore.deleteMany({ _id: id });
  },
};

export default WorkerRequest;
