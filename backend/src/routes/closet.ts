import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';
import { ClosetItem } from '../models/ClosetItem.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { mlService } from '../services/mlService.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const filter: any = { userId: req.user?.userId };

    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.color) {
      filter.color = req.query.color;
    }

    const items = await ClosetItem.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch closet items', error: error.message });
  }
});

router.post('/', uploadMiddleware.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'closetly/items');
    
    let embeddingId = undefined;
    let mlTags: string[] = [];
    
    try {
      const mlResponse = await mlService.getEmbeddingAndTags(req.file.buffer);
      embeddingId = mlResponse.embeddingId;
      mlTags = mlResponse.suggestedTags || [];
    } catch (mlError) {
      console.warn('ML Service failed to process image, continuing without ML metadata.', mlError);
    }

    const tags = Array.from(new Set([...mlTags, ...(req.body.tags ? JSON.parse(req.body.tags) : [])]));

    const newItem = await ClosetItem.create({
      userId: req.user?.userId,
      imageUrl: url,
      cloudinaryId: publicId,
      category: req.body.category || 'other',
      color: req.body.color,
      pattern: req.body.pattern,
      tags,
      embeddingId,
    });

    res.status(201).json(newItem);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create closet item', error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const item = await ClosetItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete item', error: error.message });
  }
});

export default router;
