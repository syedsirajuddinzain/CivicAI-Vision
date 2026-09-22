import mongoose from 'mongoose';
import { PersistentCollection, isConnectedToMongo } from '../config/db.js';

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    citizenId: { type: String, default: null },
    imageUrl: { type: String, default: '' },
    imageName: { type: String, default: '' },
    resolutionImageUrl: { type: String, default: null },
    resolutionImageName: { type: String, default: '' },
    issueType: { type: String, required: true },
    description: { type: String, default: '' },
    aiConfidence: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    wardId: { type: String, default: null },
    ward: { type: String, default: '' },
    wardName: { type: String, default: '' },
    departmentId: { type: String, default: null },
    department: { type: String, default: '' },
    departmentName: { type: String, default: '' },
    assignedWorkerId: { type: String, default: null },
    assignedWorkerName: { type: String, default: null },
    assignedWorkerPhone: { type: String, default: null },
    status: {
      type: String,
      enum: [
        'Reported',
        'Assigned',
        'In Progress',
        'Pending Verification',
        'Rework Required',
        'Resolved',
        'Rejected',
        'Manual Review',
      ],
      default: 'Reported',
    },
    verification: {
      verificationStatus: { type: String, default: null },
      confidence: { type: Number, default: null },
      reason: { type: String, default: null },
      requiresHumanReview: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null },
    },
    resolutionNote: { type: String, default: null },
    voiceTranscription: { type: String, default: '' },
    completedAt: { type: Date, default: null },
    completedBy: { type: String, default: null },
    startedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

const MongoTicket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
const persistentStore = new PersistentCollection('tickets');

const Ticket = {
  async find(filter = {}) {
    if (isConnectedToMongo) return await MongoTicket.find(filter).sort({ createdAt: -1 });
    return await persistentStore.find(filter);
  },
  async findOne(filter = {}) {
    if (isConnectedToMongo) return await MongoTicket.findOne(filter);
    return await persistentStore.findOne(filter);
  },
  async findById(id) {
    if (isConnectedToMongo) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const doc = await MongoTicket.findById(id);
        if (doc) return doc;
      }
      return await MongoTicket.findOne({ ticketId: id });
    }
    return await persistentStore.findById(id);
  },
  async create(data) {
    if (isConnectedToMongo) return await MongoTicket.create(data);
    return await persistentStore.create(data);
  },
  async insertMany(docs) {
    if (isConnectedToMongo) return await MongoTicket.insertMany(docs);
    return await persistentStore.insertMany(docs);
  },
  async findByIdAndUpdate(id, update, options) {
    if (isConnectedToMongo) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const doc = await MongoTicket.findByIdAndUpdate(id, update, options);
        if (doc) return doc;
      }
      return await MongoTicket.findOneAndUpdate({ ticketId: id }, update, options);
    }
    return await persistentStore.findByIdAndUpdate(id, update, options);
  },
  async findByIdAndDelete(id) {
    if (isConnectedToMongo) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const doc = await MongoTicket.findByIdAndDelete(id);
        if (doc) return doc;
      }
      return await MongoTicket.findOneAndDelete({ ticketId: id });
    }
    return await persistentStore.deleteMany({ _id: id });
  },
  async countDocuments(filter = {}) {
    if (isConnectedToMongo) return await MongoTicket.countDocuments(filter);
    return await persistentStore.countDocuments(filter);
  },
  async deleteMany(filter = {}) {
    if (isConnectedToMongo) return await MongoTicket.deleteMany(filter);
    return await persistentStore.deleteMany(filter);
  },
};

export default Ticket;
