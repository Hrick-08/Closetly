import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { ChatSession } from '../models/ChatSession.js';
import { mlService } from '../services/mlService.js';

const router = Router();
router.use(authMiddleware);

router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let session;
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Chat session not found' });
      }
      if (session.userId.toString() !== req.user?.userId) {
        return res.status(403).json({ message: 'Not authorized to access this session' });
      }
    } else {
      session = new ChatSession({ userId: req.user?.userId, messages: [] });
    }

    session.messages.push({ role: 'user', content: message, createdAt: new Date() });

    const mlResponse = await mlService.ragQuery(message, req.user?.userId as string, sessionId);

    session.messages.push({ role: 'assistant', content: mlResponse.reply, createdAt: new Date() });
    
    await session.save();

    res.json({
      reply: mlResponse.reply,
      sessionId: session._id,
      sourcesUsed: mlResponse.sourcesUsed
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to process chat message', error: error.message });
  }
});

router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user?.userId })
      .sort({ createdAt: -1 })
      .select('_id createdAt messages');

    const mappedSessions = sessions.map(session => ({
      _id: session._id,
      createdAt: session.createdAt,
      firstMessagePreview: session.messages.length > 0 ? session.messages[0].content.substring(0, 100) : ''
    }));

    res.json(mappedSessions);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch chat sessions', error: error.message });
  }
});

router.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized to access this session' });
    }

    res.json(session);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch chat session', error: error.message });
  }
});

export default router;
