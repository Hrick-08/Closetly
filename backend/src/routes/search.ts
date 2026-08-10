import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';
import { ClosetItem } from '../models/ClosetItem.js';
import { mlService } from '../services/mlService.js';

const router = Router();
router.use(authMiddleware);

router.post('/reference', uploadMiddleware.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Reference image is required' });
    }

    const mlResponse = await mlService.searchSimilar(req.file.buffer, req.user?.userId as string);
    const { matches } = mlResponse;

    if (!matches || matches.length === 0) {
      return res.json({ matches: [] });
    }

    const embeddingIds = matches.map(m => m.embeddingId);
    
    const items = await ClosetItem.find({ embeddingId: { $in: embeddingIds } });

    const populatedMatches = matches.map(match => {
      const item = items.find(i => i.embeddingId === match.embeddingId);
      return {
        item,
        score: match.score
      };
    }).filter(m => m.item);

    res.json({ matches: populatedMatches });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to perform similarity search', error: error.message });
  }
});

export default router;
