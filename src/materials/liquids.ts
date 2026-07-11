import { Material } from '../types';
import Matter from 'matter-js';

export const liquids: Material[] = [
  // ---- Water ----
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
      // Spread horizontally when near ground
      if (Math.abs(body.velocity.y) < 0.5 && body.position.y > window.innerHeight - 50) {
        Matter.Body.applyForce(body, body.position, { x: (Math.random() - 0.5) * 0.03, y: 0 });
      }
    }
  },

  // ---- Oil ----
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
      // Floats upward (lighter than water)
      Matter.Body.applyForce(body, body.position, { x: 0, y: -0.001 });
      if (Math.abs(body.velocity.y) < 0.5) {
        Matter.Body.applyForce(body, body.position, { x: (Math.random() - 0.5) * 0.01, y: 0 });
      }
    }
  },

  // ---- Acid ----
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
      // Flows like water but corrodes (handled in reactions)
      if (Math.abs(body.velocity.y) < 0.5 && body.position.y > window.innerHeight - 50) {
        Matter.Body.applyForce(body, body.position, { x: (Math.random() - 0.5) * 0.03, y: 0 });
      }
    }
  },

  // ---- Lava ----
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
      // Very slow, heavy, viscous
      Matter.Body.setVelocity(body, {
        x: body.velocity.x * 0.98,
        y: body.velocity.y * 0.98
      });
      if (Math.abs(body.velocity.y) < 0.2) {
        Matter.Body.applyForce(body, body.position, { x: (Math.random() - 0.5) * 0.005, y: 0 });
      }
    }
  },

  // ---- Chemical (Chem) ----
  {
    id: 'chem',
    label: 'Chem',
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

  // ---- Plasma (moved from gases to match screenshot) ----
  {
    id: 'plasma',
    label: 'Plasma',
    category: 'liquid' as any,
    color: '#6a3a8a',
    density: 0.0001,
    friction: 0.05,
    restitution: 0.4,
    isStatic: false,
    isParticle: true,
    isFloat: true,
    life: 150,
    behavior: (body: Matter.Body) => {
      // Erratic, defies gravity
      const angle = Math.random() * 2 * Math.PI;
      const force = 0.01 + Math.random() * 0.02;
      Matter.Body.applyForce(body, body.position, {
        x: Math.cos(angle) * force,
        y: Math.sin(angle) * force - 0.002
      });
    }
  },

  // ---- Napalm ----
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
      // Sticky, slow flow
      Matter.Body.setVelocity(body, {
        x: body.velocity.x * 0.95,
        y: body.velocity.y * 0.95
      });
    }
  },

  // ---- Nitro ----
  {
    id: 'nitro',
    label: 'Nitro',
    category: 'liquid' as any,
    color: '#6aaa3a',
    density: 0.002,
    friction: 0.3,
    restitution: 0.1,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: () => {}
  },

  // ---- Honey ----
  {
    id: 'honey',
    label: 'Honey',
    category: 'liquid' as any,
    color: '#d4a030',
    density: 0.006,
    friction: 0.9,
    restitution: 0.01,
    isStatic: false,
    isParticle: true,
    isFloat: false,
    behavior: (body: Matter.Body) => {
      // Very slow, thick, sticky
      Matter.Body.setVelocity(body, {
        x: body.velocity.x * 0.95,
        y: body.velocity.y * 0.95
      });
    }
  }
];