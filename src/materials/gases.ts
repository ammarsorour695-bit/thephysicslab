import { Material } from '../types';
import Matter from 'matter-js';

export const gases: Material[] = [
  {
    id: 'fire',
    label: 'Fire',
    category: 'gas' as any,
    color: '#aa4a1a',
    density: 0.0001,
    friction: 0.1,
    restitution: 0.3,
    isStatic: false,
    isParticle: true,
    isFloat: true,
    life: 200,
    behavior: (body: Matter.Body) => {
      Matter.Body.applyForce(body, body.position, { x: (Math.random()-0.5)*0.01, y: -0.015 });
      Matter.Body.applyForce(body, body.position, { x: (Math.random()-0.5)*0.005, y: 0 });
    }
  },
  {
    id: 'smoke',
    label: 'Smoke',
    category: 'gas' as any,
    color: '#5a5a5a',
    density: 0.00005,
    friction: 0.1,
    restitution: 0.1,
    isStatic: false,
    isParticle: true,
    isFloat: true,
    life: 300,
    behavior: (body: Matter.Body) => {
      Matter.Body.applyForce(body, body.position, { x: (Math.random()-0.5)*0.02, y: -0.02 });
      Matter.Body.applyForce(body, body.position, { x: (Math.random()-0.5)*0.01, y: 0 });
    }
  },
  {
    id: 'gas',
    label: 'Gas',
    category: 'gas' as any,
    color: '#3a6a4a',
    density: 0.0001,
    friction: 0.1,
    restitution: 0.2,
    isStatic: false,
    isParticle: true,
    isFloat: true,
    life: 250,
    behavior: (body: Matter.Body) => {
      Matter.Body.applyForce(body, body.position, { x: (Math.random()-0.5)*0.005, y: -0.015 });
    }
  },
  {
    id: 'steam',
    label: 'Steam',
    category: 'gas' as any,
    color: '#7a9aaa',
    density: 0.00005,
    friction: 0.05,
    restitution: 0.1,
    isStatic: false,
    isParticle: true,
    isFloat: true,
    life: 200,
    behavior: (body: Matter.Body) => {
      Matter.Body.applyForce(body, body.position, { x: (Math.random()-0.5)*0.01, y: -0.025 });
    }
  }
];