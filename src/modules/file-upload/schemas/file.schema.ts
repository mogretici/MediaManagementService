import { Schema } from 'dynamoose';

export const FileSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
  },
  filename: {
    type: String,
  },
  timestamp: {
    type: String,
  },
  type: {
    type: String,
  },
  size: {
    type: Number,
  },
  url: {
    type: String,
  },
});