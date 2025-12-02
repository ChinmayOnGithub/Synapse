import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  user: mongoose.Types.ObjectId | null;
  room: mongoose.Types.ObjectId;
  text: string;
  type: 'text' | 'code' | 'system';
  codeLanguage?: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null,
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'code', 'system'],
    default: 'text',
  },
  codeLanguage: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient message history queries
MessageSchema.index({ room: 1, timestamp: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
