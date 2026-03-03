import jwt from 'jsonwebtoken';
import { AuthPayload } from '../middlewares/auth.middleware';

export const generateAccessToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
};

export const verifyRefreshToken = (token: string): AuthPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as AuthPayload;
};
