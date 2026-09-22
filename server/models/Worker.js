import mongoose from 'mongoose';
import { PersistentCollection, isConnectedToMongo } from '../config/db.js';

const workerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    workerId: { type: String, default: null },
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    departmentId: { type: String, required: true },
    departmentName: { type: String, default: '' },
    wardId: { type: String, default: 'ward_101' },
    wardName: { type: String, default: 'Ward 101 — Central Business District' },
    skills: [{ type: String }],
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Assigned', 'Busy', 'Offline'],
      default: 'Available',
    },
    currentLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const MongoWorker = mongoose.models.Worker || mongoose.model('Worker', workerSchema);
const persistentStore = new PersistentCollection('workers');

const Worker = {
  async find(filter = {}) {
    if (isConnectedToMongo) return await MongoWorker.find(filter);
    return await persistentStore.find(filter);
  },
  async findOne(filter = {}) {
    if (isConnectedToMongo) return await MongoWorker.findOne(filter);
    return await persistentStore.findOne(filter);
  },
  async findById(id) {
    if (isConnectedToMongo) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const doc = await MongoWorker.findById(id);
        if (doc) return doc;
      }
      return await MongoWorker.findOne({ $or: [{ _id: id }, { workerId: id }] });
    }
    return await persistentStore.findById(id);
  },
  async create(data) {
    if (isConnectedToMongo) return await MongoWorker.create(data);
    return await persistentStore.create(data);
  },
  async insertMany(docs) {
    if (isConnectedToMongo) return await MongoWorker.insertMany(docs);
    return await persistentStore.insertMany(docs);
  },
  async findByIdAndUpdate(id, update, options) {
    if (isConnectedToMongo) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const doc = await MongoWorker.findByIdAndUpdate(id, update, options);
        if (doc) return doc;
      }
      return await MongoWorker.findOneAndUpdate({ $or: [{ _id: id }, { workerId: id }] }, update, options);
    }
    return await persistentStore.findByIdAndUpdate(id, update, options);
  },
  async findByIdAndDelete(id) {
    if (isConnectedToMongo) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const doc = await MongoWorker.findByIdAndDelete(id);
        if (doc) return doc;
      }
      return await MongoWorker.findOneAndDelete({ $or: [{ _id: id }, { workerId: id }] });
    }
    return await persistentStore.deleteMany({ _id: id });
  },
  async countDocuments(filter = {}) {
    if (isConnectedToMongo) return await MongoWorker.countDocuments(filter);
    return await persistentStore.countDocuments(filter);
  },
  async deleteMany(filter = {}) {
    if (isConnectedToMongo) return await MongoWorker.deleteMany(filter);
    return await persistentStore.deleteMany(filter);
  },
};

export default Worker;
