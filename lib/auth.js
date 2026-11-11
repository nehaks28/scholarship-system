import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const sign = (u) => jwt.sign({ id: u.user_id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

export function me(roles) {
  try {
    const u = jwt.verify(cookies().get('token')?.value, process.env.JWT_SECRET);
    return !roles || roles.includes(u.role) ? u : null;
  } catch {
    return null;
  }
}
