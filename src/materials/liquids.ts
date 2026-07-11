import { Material } from '../types';
import Matter from 'matter-js';

export const liquids: Material[] = [
  {
    id: 'water',
    label: 'Water',
    category: 'liquid' as any,
    color: '#3a7aaa',
    density: 0.004,
    friction: 0.5,
    restitution: 0.02,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: (body: Matter.Body) => {
      // spread horizontally when near ground
      if (Math.abs(body.velocity.y) < 0.5 && body.position.y > window.innerHeight - 50) {
        Matter.Body.applyForce(body, body.position, { x: (Math.random()-0.5)*0.03, y: 0 });
      }
    }
  },
  {
    id: 'oil',
    label: 'Oil',
    category: 'liquid' as any,
    color: '#5a3a1a',
    density: 0.0015,
    friction: 0.4,
    restitution: 0.05,
    isStatic: false,
    isParticle: true,
    isFloat: true,
    behavior: (body: Matter.Body) => {
      Matter.Body.applyForce(body, body.position, { x: 0, y: -0.001 });
      if (Math.abs(body.velocity.y) < 0.5) {
        Matter.Body.applyForce(body, body.position, { x: (Math.random()-0.5)*0.01, y: 0 });
      }
    }
  },
  {
    id: 'acid',
    label: 'Acid',
    category: 'liquid' as any,
    color: '#4a7a2a',
    density: 0.003,
    friction: 0.4,
    restitution: 0.02,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: (body: Matter.Body) => {
      if (Math.abs(body.velocity.y) < 0.5 && body.position.y > window.innerHeight - 50) {
        Matter.Body.applyForce(body, body.position, { x: (Math.random()-0.5)*0.03, y: 0 });
      }
    }
  },
  {
    id: 'lava',
    label: 'Lava',
    category: 'liquid' as any,
    color: '#aa4a1a',
    density: 0.006,
    friction: 0.8,
    restitution: 0.01,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: (body: Matter.Body) => {
      // slow down, heavy
      Matter.Body.setVelocity(body, {
        x: body.velocity.x * 0.98,
        y: body.velocity.y * 0.98
      });
      if (Math.abs(body.velocity.y) < 0.2) {
        Matter.Body.applyForce(body, body.position, { x: (Math.random()-0.5)*0.005, y: 0 });
      }
    }
  },
  {
    id: 'napalm',
    label: 'Napalm',
    category: 'liquid' as any,
    color: '#8a3a1a',
    density: 0.004,
    friction: 0.9,
    restitution: 0.01,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: (body: Matter.Body) => {
      Matter.Body.setVelocity(body, {
        x: body.velocity.x * 0.95,
        y: body.velocity.y * 0.95
      });
    }
  }
];