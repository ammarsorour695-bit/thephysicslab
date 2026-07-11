import { Material } from '../types';
import Matter from 'matter-js';

export const chemicalMaterials: Material[] = [
  {
    id: 'chemical',
    label: 'Chemical',
    category: 'liquid' as any,
    color: '#6a3a6a',
    density: 0.003,
    friction: 0.3,
    restitution: 0.05,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'sulfur',
    label: 'Sulfur',
    category: 'solid' as any,
    color: '#eace3a',
    density: 0.004,
    friction: 0.4,
    restitution: 0.05,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'saltpeter',
    label: 'Saltpeter',
    category: 'solid' as any,
    color: '#d0d0d0',
    density: 0.003,
    friction: 0.3,
    restitution: 0.05,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: () => {}
  },
  {
    id: 'phosphorus',
    label: 'Phosphorus',
    category: 'solid' as any,
    color: '#aa6a2a',
    density: 0.003,
    friction: 0.3,
    restitution: 0.05,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: (body: Matter.Body) => {
      // glows slightly – add a small upward force
      Matter.Body.applyForce(body, body.position, { x: (Math.random()-0.5)*0.002, y: -0.001 });
    }
  },
  {
    id: 'mercury',
    label: 'Mercury',
    category: 'liquid' as any,
    color: '#8a9aaa',
    density: 0.008,
    friction: 0.2,
    restitution: 0.02,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: (body: Matter.Body) => {
      if (Math.abs(body.velocity.y) < 0.5 && body.position.y > window.innerHeight - 50) {
        Matter.Body.applyForce(body, body.position, { x: (Math.random()-0.5)*0.02, y: 0 });
      }
    }
  },
  {
    id: 'radioactive',
    label: 'Radioactive',
    category: 'liquid' as any,
    color: '#5aaa3a',
    density: 0.005,
    friction: 0.3,
    restitution: 0.05,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    life: 400,
    behavior: (body: Matter.Body) => {
      // glows and drifts
      Matter.Body.applyForce(body, body.position, { x: (Math.random()-0.5)*0.005, y: -0.002 });
    }
  },
];