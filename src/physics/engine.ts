import Matter from 'matter-js';
import { materialRegistry } from '../materials';
import { getReaction } from './reactions';
import { Material } from '../types';

let engine: Matter.Engine;
let world: Matter.World;
let render: Matter.Render;
let runner: Matter.Runner;

const wallOptions = { isStatic: true, friction: 0.8, restitution: 0.05, render: { fillStyle: '#1a1a1a' } };

export function initEngine(width: number, height: number, container: HTMLElement) {
  engine = Matter.Engine.create({
    gravity: { x: 0, y: 1 },
    positionIterations: 10,
    velocityIterations: 8,
  });
  world = engine.world;

  // Walls
  const walls = [
    Matter.Bodies.rectangle(width/2, 0, width, 20, wallOptions),
    Matter.Bodies.rectangle(width/2, height, width, 20, wallOptions),
    Matter.Bodies.rectangle(0, height/2, 20, height, wallOptions),
    Matter.Bodies.rectangle(width, height/2, 20, height, wallOptions),
  ];
  Matter.World.add(world, walls);

  // Renderer
  render = Matter.Render.create({
    canvas: document.createElement('canvas'),
    engine,
    options: { width, height, wireframes: false, background: '#000000', pixelRatio: 1 },
  });
  container.appendChild(render.canvas);
  Matter.Render.run(render);

  // Runner
  runner = Matter.Runner.create();
  Matter.Runner.run(runner, engine);

  // ---- Behaviors ----
  Matter.Events.on(engine, 'beforeUpdate', () => {
    const bodies = Matter.Composite.allBodies(world);
    bodies.forEach(body => {
      const matId = (body as any).materialId as string;
      if (matId && materialRegistry[matId]) {
        const mat = materialRegistry[matId];
        if (mat.behavior) mat.behavior(body);
      }
      // particle life
      if ((body as any).life !== undefined && (body as any).life < Infinity) {
        (body as any).life -= 1;
        if ((body as any).life < 0) Matter.World.remove(world, body);
      }
    });
  });

  // ---- Reactions ----
  Matter.Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
      const a = pair.bodyA;
      const b = pair.bodyB;
      if (a.isStatic || b.isStatic) return;
      const matA = (a as any).materialId;
      const matB = (b as any).materialId;
      if (!matA || !matB) return;
      const reaction = getReaction(matA, matB);
      if (!reaction) return;
      const posX = (a.position.x + b.position.x) / 2;
      const posY = (a.position.y + b.position.y) / 2;
      // Remove both
      Matter.World.remove(world, a);
      Matter.World.remove(world, b);
      // Spawn result
      spawnMaterial(reaction.result, posX, posY, reaction.count || 10);
    });
  });

  return { engine, world, render, runner };
}

export function spawnMaterial(matId: string, x: number, y: number, count: number = 10) {
  const mat = materialRegistry[matId];
  if (!mat) return;

  const isSolid = mat.category === 'solid' && !mat.isParticle;
  const isStatic = mat.isStatic;
  const color = mat.color;
  const size = isSolid ? 20 : 3 + Math.random() * 8;

  if (isSolid) {
    // Spawn single body
    const body = Matter.Bodies.rectangle(x, y, size, size, {
      density: mat.density,
      friction: mat.friction,
      restitution: mat.restitution,
      isStatic: isStatic,
      render: { fillStyle: color },
    });
    (body as any).materialId = matId;
    Matter.World.add(world, body);
    return;
  }

  // Particles
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const dist = 4 + Math.random() * 25;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist - 6;
    const s = 3 + Math.random() * 8;
    const body = Matter.Bodies.rectangle(px, py, s * 0.7, s * 0.7, {
      density: mat.density,
      friction: mat.friction,
      restitution: mat.restitution,
      isStatic: false,
      render: { fillStyle: color },
    });
    (body as any).materialId = matId;
    (body as any).life = mat.life ?? Infinity;
    (body as any).isParticle = true;
    Matter.World.add(world, body);
  }
}

export function resetWorld() {
  const bodies = Matter.Composite.allBodies(world);
  bodies.forEach(b => {
    if (!b.isStatic) Matter.World.remove(world, b);
  });
}

export function getEngine() { return engine; }
export function togglePause() {
  if (runner.enabled) Matter.Runner.stop(runner);
  else Matter.Runner.start(runner, engine);
}
export function setSlow() {
  engine.gravity.y = 0.3;
}
export function setFast() {
  engine.gravity.y = 2.0;
}
export function setNormalSpeed() {
  engine.gravity.y = 1.0;
}