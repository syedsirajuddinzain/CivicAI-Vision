import mongoose from 'mongoose';
import { PersistentCollection, isConnectedToMongo } from '../config/db.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },
    ticketId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'assigned', 'in_progress', 'verification', 'rework', 'resolved', 'alert'],
      default: 'info',
    },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const MongoNotification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const persistentStore = new PersistentCollection('notifications');

const Notification = {
  async find(filter = {}) {
    if (isConnectedToMongo) return await MongoNotification.find(filter).sort({ createdAt: -1 });
    return await persistentStore.find(filter);
  },
  async findOne(filter = {}) {
    if (isConnectedToMongo) return await MongoNotification.findOne(filter);
    return await persistentStore.findOne(filter);
  },
  async findById(id) {
    if (isConnectedToMongo) return await MongoNotification.findById(id);
    return await persistentStore.findById(id);
  },
  async create(data) {
    if (isConnectedToMongo) return await MongoNotification.create(data);
    return await persistentStore.create(data);
  },
  async insertMany(docs) {
    if (isConnectedToMongo) return await MongoNotification.insertMany(docs);
    return await persistentStore.insertMany(docs);
  },
  async findByIdAndUpdate(id, update, options) {
    if (isConnectedToMongo) return await MongoNotification.findByIdAndUpdate(id, update, options);
    return await persistentStore.findByIdAndUpdate(id, update, options);
  },
  async updateMany(filter, update) {
    if (isConnectedToMongo) return await MongoNotification.updateMany(filter, update);
    return await persistentStore.updateMany(filter, update);
  },
  async countDocuments(filter = {}) {
    if (isConnectedToMongo) return await MongoNotification.countDocuments(filter);
    return await persistentStore.countDocuments(filter);
  },
  async deleteMany(filter = {}) {
    if (isConnectedToMongo) return await MongoNotification.deleteMany(filter);
    return await persistentStore.deleteMany(filter);
  },
};

export default Notification;
