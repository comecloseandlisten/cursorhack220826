import { Types } from 'mongoose';

export type IdPrefix = 'msg' | 'canvas';

export function newId(prefix: IdPrefix): string {
  return `${prefix}_${new Types.ObjectId().toHexString()}`;
}
