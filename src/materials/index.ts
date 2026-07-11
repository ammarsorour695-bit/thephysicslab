import { Material } from '../types';
import { liquids } from './liquids';
import { gases } from './gases';
import { solids } from './solids';
import { lifeMaterials } from './life';

export const materialRegistry: Record<string, Material> = {};

[...liquids, ...gases, ...solids, ...lifeMaterials].forEach(mat => {
  materialRegistry[mat.id] = mat;
});

export const getMaterial = (id: string): Material | undefined => materialRegistry[id];