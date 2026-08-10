import mongoose, { Document, Schema } from 'mongoose';

export interface IShopProduct {
  productUrl: string;
  imageUrl: string;
  title: string;
  price?: number;
  source?: string;
  similarityScore?: number;
}

export interface IShopResult extends Document {
  userId?: mongoose.Types.ObjectId;
  referenceImageUrl: string;
  results: IShopProduct[];
  createdAt: Date;
}

const shopProductSchema = new Schema<IShopProduct>({
  productUrl: { type: String, required: true },
  imageUrl: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number },
  source: { type: String },
  similarityScore: { type: Number }
});

const shopResultSchema = new Schema<IShopResult>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  referenceImageUrl: { type: String, required: true },
  results: [shopProductSchema],
  createdAt: { type: Date, default: Date.now },
});

export const ShopResult = mongoose.model<IShopResult>('ShopResult', shopResultSchema);
