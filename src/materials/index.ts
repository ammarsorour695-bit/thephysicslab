import { Material } from '../types';
import { liquids } from './liquids';
import { gases } from './gases';
import { solids } from './solids';
import { lifeMaterials } from './life';
import { foodMaterials } from './food';
import { chemicalMaterials } from './chemicals';

export const materialRegistry: Record<string, Material> = {};

// Merge all categories
[...liquids, ...gases, ...solids, ...lifeMaterials, ...foodMaterials, ...chemicalMaterials].forEach(mat => {
  materialRegistry[mat.id] = mat;
});

export const getMaterial = (id: string): Material | undefined => materialRegistry[id];