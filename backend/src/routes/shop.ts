import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { ShopResult } from '../models/ShopResult.js';
import { mlService } from '../services/mlService.js';

const router = Router();
router.use(authMiddleware);

router.post('/lookup', async (req: Request, res: Response) => {
  try {
    const { referenceImageUrl } = req.body;

    if (!referenceImageUrl) {
      return res.status(400).json({ message: 'referenceImageUrl is required' });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const cachedResult = await ShopResult.findOne({
      userId: req.user?.userId,
      referenceImageUrl,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 });

    if (cachedResult) {
      return res.json({ results: cachedResult.results, cached: true });
    }

    const mlResponse = await mlService.shopLookup(referenceImageUrl);
    const results = mlResponse.results;

    await ShopResult.create({
      userId: req.user?.userId,
      referenceImageUrl,
      results
    });

    res.json({ results, cached: false });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to perform shop lookup', error: error.message });
  }
});

export default router;
