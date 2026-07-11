import { Material } from '../types';
import Matter from 'matter-js';

export const lifeMaterials: Material[] = [
  {
    id: 'dummy',
    label: 'Dummy',
    category: 'life' as any,
    color: '#8a7a6a',
    density: 0.002,
    friction: 0.6,
    restitution: 0.08,
    isStatic: false,
    isParticle: false,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'moss',
    label: 'Moss',
    category: 'life' as any,
    color: '#4a7a3a',
    density: 0.001,
    friction: 0.3,
    restitution: 0.05,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'soil',
    label: 'Soil',
    category: 'life' as any,
    color: '#5a4a1a',
    density: 0.002,
    friction: 0.7,
    restitution: 0.01,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'grass',
    label: 'Grass',
    category: 'life' as any,
    color: '#3a7a2a',
    density: 0.001,
    friction: 0.4,
    restitution: 0.05,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: () => {}
  }
];