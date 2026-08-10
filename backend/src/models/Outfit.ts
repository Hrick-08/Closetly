import mongoose, { Document, Schema } from 'mongoose';

export interface IOutfit extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  itemIds: mongoose.Types.ObjectId[];
  compatibilityScore?: number;
  createdAt: Date;
}

const outfitSchema = new Schema<IOutfit>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  itemIds: [{ type: Schema.Types.ObjectId, ref: 'ClosetItem' }],
  compatibilityScore: { type: Number, min: 0, max: 1 },
  createdAt: { type: Date, default: Date.now },
});

export const Outfit = mongoose.model<IOutfit>('Outfit', outfitSchema);
