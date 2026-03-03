import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { loginSchema, refreshSchema, registerSchema } from '../validators/auth.validator';
import { AuthRequest } from '../middlewares/auth.middleware';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const slug = req.headers['x-academy-slug'] as string || 'academia-elite';
      const result = await authService.login(slug, email, password);
      res.json({ status: 'success', data: result });
    } catch (e) { next(e); }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      const result = await authService.refresh(refreshToken);
      res.json({ status: 'success', data: result });
    } catch (e) { next(e); }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.userId);
      res.json({ status: 'success', message: 'Logged out' });
    } catch (e) { next(e); }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.user!.userId);
      res.json({ status: 'success', data: user });
    } catch (e) { next(e); }
  },

  async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const user = await authService.createUser(req.user!.academyId, data);
      res.status(201).json({ status: 'success', data: user });
    } catch (e) { next(e); }
  },
};
