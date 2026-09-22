import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

// Ensure data directory exists for persistent storage
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export let isConnectedToMongo = false;

/**
 * Connect to MongoDB with automatic local persistence fallback
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civic_ai';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnectedToMongo = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    isConnectedToMongo = false;
    console.warn(`[Database] MongoDB connection warning (${error.message}).`);
    console.log(`[Database] Initializing Persistent Server Data Store at: ${DATA_DIR}`);
    return null;
  }
}

function matchesFilter(item, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      const orMatched = val.some((subFilter) => matchesFilter(item, subFilter));
      if (!orMatched) return false;
      continue;
    }
    if (key === '$and' && Array.isArray(val)) {
      const andMatched = val.every((subFilter) => matchesFilter(item, subFilter));
      if (!andMatched) return false;
      continue;
    }
    if (val && typeof val === 'object') {
      if (val.$in && Array.isArray(val.$in)) {
        if (!val.$in.includes(item[key])) return false;
        continue;
      }
      if (val.$nin && Array.isArray(val.$nin)) {
        if (val.$nin.includes(item[key])) return false;
        continue;
      }
      if (val.$ne !== undefined) {
        if (item[key] === val.$ne) return false;
        continue;
      }
    }
    if (item[key] !== val) {
      return false;
    }
  }
  return true;
}

/**
 * Robust Disk-Persistent Collection for Collections when MongoDB daemon is offline.
 * Implements Mongoose-compatible Model interface with full disk persistence.
 */
export class PersistentCollection {
  constructor(collectionName) {
    this.name = collectionName;
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]), 'utf8');
    }
  }

  _read() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      return content ? JSON.parse(content) : [];
    } catch (err) {
      console.warn(`Error reading ${this.name} data:`, err);
      return [];
    }
  }

  _write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error(`Error writing ${this.name} data:`, err);
    }
  }

  async find(filter = {}) {
    let items = this._read();
    items = items.filter((item) => matchesFilter(item, filter));
    // Return Mongoose-like chainable object
    return {
      sort: (sortObj = {}) => {
        const [field, order] = Object.entries(sortObj)[0] || ['createdAt', -1];
        items.sort((a, b) => {
          if (a[field] < b[field]) return order === 1 ? -1 : 1;
          if (a[field] > b[field]) return order === 1 ? 1 : -1;
          return 0;
        });
        return items;
      },
      populate: () => items,
      then: (resolve) => resolve(items),
    };
  }

  async findOne(filter = {}) {
    const items = this._read();
    return items.find((item) => matchesFilter(item, filter)) || null;
  }

  async findById(id) {
    const items = this._read();
    return items.find((item) => String(item._id) === String(id) || item.ticketId === id) || null;
  }

  async create(doc) {
    const items = this._read();
    const newDoc = {
      _id: doc._id || `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newDoc);
    this._write(items);
    return newDoc;
  }

  async insertMany(docs) {
    const items = this._read();
    const created = docs.map((doc) => ({
      _id: doc._id || `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    items.push(...created);
    this._write(items);
    return created;
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    const items = this._read();
    const index = items.findIndex((item) => String(item._id) === String(id) || item.ticketId === id);
    if (index === -1) return null;

    const current = items[index];
    const updated = {
      ...current,
      ...(update.$set || update),
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
    this._write(items);
    return updated;
  }

  async updateOne(filter, update) {
    const items = this._read();
    const index = items.findIndex((item) => {
      for (const [key, val] of Object.entries(filter)) {
        if (item[key] !== val) return false;
      }
      return true;
    });
    if (index === -1) return { modifiedCount: 0 };
    items[index] = {
      ...items[index],
      ...(update.$set || update),
      updatedAt: new Date().toISOString(),
    };
    this._write(items);
    return { modifiedCount: 1 };
  }

  async updateMany(filter, update) {
    const items = this._read();
    let count = 0;
    const updated = items.map((item) => {
      let matches = true;
      for (const [key, val] of Object.entries(filter)) {
        if (item[key] !== val) {
          matches = false;
          break;
        }
      }
      if (matches) {
        count++;
        return {
          ...item,
          ...(update.$set || update),
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    this._write(updated);
    return { modifiedCount: count };
  }

  async deleteMany(filter = {}) {
    if (Object.keys(filter).length === 0) {
      this._write([]);
      return { deletedCount: 1 };
    }
    const items = this._read();
    const remaining = items.filter((item) => {
      for (const [key, val] of Object.entries(filter)) {
        if (item[key] === val) return false;
      }
      return true;
    });
    this._write(remaining);
    return { deletedCount: items.length - remaining.length };
  }

  async countDocuments(filter = {}) {
    const items = this._read();
    if (Object.keys(filter).length === 0) return items.length;
    return items.filter((item) => {
      for (const [key, val] of Object.entries(filter)) {
        if (val && typeof val === 'object' && val.$in) {
          if (!val.$in.includes(item[key])) return false;
        } else if (item[key] !== val) {
          return false;
        }
      }
      return true;
    }).length;
  }
}
