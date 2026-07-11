import { Material } from '../types';
import Matter from 'matter-js';

export const foodMaterials: Material[] = [
  {
    id: 'bread',
    label: 'Bread',
    category: 'life' as any,
    color: '#c8a86a',
    density: 0.002,
    friction: 0.6,
    restitution: 0.05,
    isStatic: false,
    isParticle: false,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'meat',
    label: 'Meat',
    category: 'life' as any,
    color: '#8a3a2a',
    density: 0.003,
    friction: 0.5,
    restitution: 0.05,
    isStatic: false,
    isParticle: false,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'cheese',
    label: 'Cheese',
    category: 'life' as any,
    color: '#eace7a',
    density: 0.002,
    friction: 0.4,
    restitution: 0.08,
    isStatic: false,
    isParticle: false,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'apple',
    label: 'Apple',
    category: 'life' as any,
    color: '#aa3a2a',
    density: 0.003,
    friction: 0.5,
    restitution: 0.15,
    isStatic: false,
    isParticle: false,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'egg',
    label: 'Egg',
    category: 'life' as any,
    color: '#f5e8c8',
    density: 0.002,
    friction: 0.3,
    restitution: 0.2,
    isStatic: false,
    isParticle: false,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'sugar',
    label: 'Sugar',
    category: 'life' as any,
    color: '#f5f0e0',
    density: 0.001,
    friction: 0.2,
    restitution: 0.1,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'salt',
    label: 'Salt',
    category: 'life' as any,
    color: '#f5f5f0',
    density: 0.002,
    friction: 0.3,
    restitution: 0.05,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: () => {}
  },
];