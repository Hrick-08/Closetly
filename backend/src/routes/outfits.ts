import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { Outfit } from '../models/Outfit.js';
import { ClosetItem } from '../models/ClosetItem.js';
import { mlService } from '../services/mlService.js';
import mongoose from 'mongoose';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const outfits = await Outfit.find({ userId: req.user?.userId })
      .populate('itemIds')
      .sort({ createdAt: -1 });
    res.json(outfits);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch outfits', error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, itemIds } = req.body;

    if (!name || !itemIds || !Array.isArray(itemIds)) {
      return res.status(400).json({ message: 'Name and itemIds array are required' });
    }

    const items = await ClosetItem.find({
      _id: { $in: itemIds.map(id => new mongoose.Types.ObjectId(id)) },
      userId: req.user?.userId
    });

    if (items.length !== itemIds.length) {
      return res.status(400).json({ message: 'One or more items not found or do not belong to you' });
    }

    let compatibilityScore = undefined;
    const embeddingIds = items.map(item => item.embeddingId).filter(Boolean) as string[];

    if (embeddingIds.length === items.length && items.length > 1) {
      try {
        const mlScoreResponse = await mlService.getCompatibilityScore(embeddingIds);
        compatibilityScore = mlScoreResponse.compatibilityScore;
      } catch (mlError) {
        console.warn('ML Service failed to calculate compatibility score.', mlError);
      }
    }

    const outfit = await Outfit.create({
      userId: req.user?.userId,
      name,
      itemIds,
      compatibilityScore
    });

    res.status(201).json(outfit);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create outfit', error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const outfit = await Outfit.findById(req.params.id);
    
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    if (outfit.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this outfit' });
    }

    await outfit.deleteOne();
    res.json({ message: 'Outfit deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete outfit', error: error.message });
  }
});

export default router;
