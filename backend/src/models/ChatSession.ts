import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface IChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const chatSessionSchema = new Schema<IChatSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
});

export const ChatSession = mongoose.model<IChatSession>('ChatSession', chatSessionSchema);
