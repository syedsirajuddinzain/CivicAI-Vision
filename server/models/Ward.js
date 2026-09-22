import mongoose from 'mongoose';
import { PersistentCollection, isConnectedToMongo } from '../config/db.js';

const wardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    boundary: {
      type: {
        type: String,
        enum: ['Polygon', 'MultiPolygon'],
        default: 'Polygon',
      },
      coordinates: {
        type: Array,
        default: [],
      },
    },
    centerCoordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    radiusKm: { type: Number, default: 5 },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const MongoWard = mongoose.models.Ward || mongoose.model('Ward', wardSchema);
const persistentStore = new PersistentCollection('wards');

const Ward = {
  async find(filter = {}) {
    if (isConnectedToMongo) return await MongoWard.find(filter);
    return await persistentStore.find(filter);
  },
  async findOne(filter = {}) {
    if (isConnectedToMongo) return await MongoWard.findOne(filter);
    return await persistentStore.findOne(filter);
  },
  async findById(id) {
    if (isConnectedToMongo) return await MongoWard.findById(id);
    return await persistentStore.findById(id);
  },
  async create(data) {
    if (isConnectedToMongo) return await MongoWard.create(data);
    return await persistentStore.create(data);
  },
  async insertMany(docs) {
    if (isConnectedToMongo) return await MongoWard.insertMany(docs);
    return await persistentStore.insertMany(docs);
  },
  async countDocuments(filter = {}) {
    if (isConnectedToMongo) return await MongoWard.countDocuments(filter);
    return await persistentStore.countDocuments(filter);
  },
  async deleteMany(filter = {}) {
    if (isConnectedToMongo) return await MongoWard.deleteMany(filter);
    return await persistentStore.deleteMany(filter);
  },
};

export default Ward;
