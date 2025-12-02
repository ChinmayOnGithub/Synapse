import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomSettings {
  canAnyoneShare: boolean;
  isLocked: boolean;
  isAnonymous: boolean;
}

export interface IRoom extends Document {
  name: string;
  joinCode: string;
  createdBy: mongoose.Types.ObjectId;
  users: mongoose.Types.ObjectId[];
  avatar?: string;
  settings: IRoomSettings;
  isArchived: boolean;
  createdAt: Date;
}

const RoomSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  joinCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  avatar: {
    type: String,
    default: null,
  },
  settings: {
    canAnyoneShare: {
      type: Boolean,
      default: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IRoom>('Room', RoomSchema);
