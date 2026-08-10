import mongoose, { Document, Schema } from 'mongoose';

export interface IClosetItem extends Document {
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  cloudinaryId?: string;
  category?: string;
  color?: string;
  pattern?: string;
  tags: string[];
  embeddingId?: string;
  createdAt: Date;
}

const closetItemSchema = new Schema<IClosetItem>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  imageUrl: { type: String, required: true },
  cloudinaryId: { type: String },
  category: { 
    type: String, 
    enum: ['top', 'bottom', 'dress', 'outerwear', 'footwear', 'bag', 'accessory', 'other'],
    default: 'other'
  },
  color: { type: String },
  pattern: { type: String },
  tags: { type: [String], default: [] },
  embeddingId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const ClosetItem = mongoose.model<IClosetItem>('ClosetItem', closetItemSchema);
