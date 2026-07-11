import { Material } from '../types';
import Matter from 'matter-js';

export const solids: Material[] = [
  {
    id: 'sand',
    label: 'Sand',
    category: 'solid' as any,
    color: '#8a7a3a',
    density: 0.003,
    friction: 0.9,
    restitution: 0.02,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: () => {} // no extra behavior
  },
  {
    id: 'metal',
    label: 'Metal',
    category: 'solid' as any,
    color: '#5a7a8a',
    density: 0.02,
    friction: 0.6,
    restitution: 0.05,
    isStatic: true,
    isParticle: false,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'wood',
    label: 'Wood',
    category: 'solid' as any,
    color: '#6a4a1a',
    density: 0.005,
    friction: 0.5,
    restitution: 0.05,
    isStatic: true,
    isParticle: false,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'glass',
    label: 'Glass',
    category: 'solid' as any,
    color: '#4a6a8a',
    density: 0.008,
    friction: 0.3,
    restitution: 0.2,
    isStatic: false,
    isParticle: false,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'ice',
    label: 'Ice',
    category: 'solid' as any,
    color: '#4a7a9a',
    density: 0.006,
    friction: 0.2,
    restitution: 0.1,
    isStatic: false,
    isParticle: false,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'stone',
    label: 'Stone',
    category: 'solid' as any,
    color: '#4a4a4a',
    density: 0.01,
    friction: 0.8,
    restitution: 0.02,
    isStatic: false,
    isParticle: false,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'obsidian',
    label: 'Obsidian',
    category: 'solid' as any,
    color: '#2a2a2a',
    density: 0.015,
    friction: 0.8,
    restitution: 0.01,
    isStatic: true,
    isParticle: false,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'brick',
    label: 'Brick',
    category: 'solid' as any,
    color: '#5a2a1a',
    density: 0.012,
    friction: 0.7,
    restitution: 0.02,
    isStatic: false,
    isParticle: false,
    isFloat: false,
    behavior: () => {}
  }
];