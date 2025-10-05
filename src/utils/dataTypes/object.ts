import { isPlainObject } from '@reduxjs/toolkit';
import type { ObjectType } from 'utils/types';

export const stripUndefined = (obj: ObjectType) => {
  if (!isPlainObject(obj)) {
    return obj;
  }
  const copy: ObjectType = { ...obj };
  for (const [k, v] of Object.entries(copy)) {
    if (typeof v === 'undefined') delete copy[k];
  }
  return copy;
};
