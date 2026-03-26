import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { recipesRouter } from './routes/recipes';
import { mealPlansRouter } from './routes/meal-plans';
import { shoppingListRouter } from './routes/shopping-list';
import { authRouter } from './routes/auth';
import { nutritionRouter } from './routes/nutrition';
import { usersRouter } from './routes/users';
import { commentsRouter } from './routes/comments';
import { dailyLogsRouter } from './routes/daily-logs';
import { conditionsRouter } from './routes/conditions';
import { wissenRouter } from './routes/wissen';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    const allowed = (process.env.ALLOWED_ORIGIN || 'http://localhost:3000').split(',').map(s => s.trim());
    if (!origin || allowed.includes(origin)) cb(null, true);
    else cb(null, false);
  },
}));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true, legacyHeaders: false }));

// Public routes
app.use('/api/auth', authRouter);
app.use('/api/conditions', conditionsRouter);
app.use('/api/wissen', wissenRouter);

// Protected routes
app.use('/api/users', authMiddleware, usersRouter);
app.use('/api/recipes', authMiddleware, recipesRouter);
app.use('/api/comments', authMiddleware, commentsRouter);
app.use('/api/meal-plans', authMiddleware, mealPlansRouter);
app.use('/api/shopping-list', authMiddleware, shoppingListRouter);
app.use('/api/nutrition', authMiddleware, nutritionRouter);
app.use('/api/daily-logs', authMiddleware, dailyLogsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'Heilkueche API' }));

export { app };

app.listen(PORT, () => {
  console.log(`Heilkueche API running on port ${PORT}`);
});
