import { initEngine, spawnMaterial, resetWorld } from './physics/engine';
import { buildToolbar } from './ui/toolbar';
import { materialRegistry } from './materials';

const container = document.getElementById('canvas-container')!;
const toolbar = document.getElementById('toolbar')!;
const width = container.clientWidth;
const height = container.clientHeight;

// Init physics
const { engine, world, render, runner } = initEngine(width, height, container);

// Build UI
buildToolbar(toolbar);

// ---------- Interaction ----------
let mouseDown = false;
let mouseX = 0, mouseY = 0;
let dragBody: Matter.Body | null = null;
const canvas = render.canvas;

function getPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const clientX = (e as any).clientX ?? (e as TouchEvent).touches[0].clientX;
  const clientY = (e as any).clientY ?? (e as TouchEvent).touches[0].clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function handleStart(e: MouseEvent | TouchEvent) {
  e.preventDefault();
  const pos = getPos(e);
  mouseX = pos.x; mouseY = pos.y;
  mouseDown = true;

  const state = (window as any).__state;
  if (state.selectedShape) {
    spawnShape(state.selectedShape, mouseX, mouseY);
    return;
  }
  if (state.selectedMaterial) {
    spawnMaterial(state.selectedMaterial, mouseX, mouseY);
    return;
  }

  if (state.selectedTool === 'drag') {
    const bodies = Matter.Composite.allBodies(world);
    for (let b of bodies) {
      if (b.isStatic) continue;
      if (Matter.Bounds.contains(b.bounds, { x: mouseX, y: mouseY })) {
        dragBody = b;
        canvas.style.cursor = 'grabbing';
        break;
      }
    }
  } else if (state.selectedTool === 'delete') {
    const bodies = Matter.Composite.allBodies(world);
    for (let b of bodies) {
      if (b.isStatic) continue;
      if (Matter.Bounds.contains(b.bounds, { x: mouseX, y: mouseY })) {
        Matter.World.remove(world, b);
        break;
      }
    }
  } else if (state.selectedTool === 'explode') {
    createExplosion(mouseX, mouseY);
  }
}

function handleMove(e: MouseEvent | TouchEvent) {
  e.preventDefault();
  const pos = getPos(e);
  mouseX = pos.x; mouseY = pos.y;
  if (mouseDown && dragBody) {
    Matter.Body.setPosition(dragBody, { x: mouseX, y: mouseY });
    Matter.Body.setVelocity(dragBody, { x: 0, y: 0 });
  }
  if (mouseDown && (window as any).__state.selectedMaterial && !dragBody) {
    if (Math.random() < 0.25) spawnMaterial((window as any).__state.selectedMaterial, mouseX, mouseY);
  }
}

function handleEnd(e: MouseEvent | TouchEvent) {
  e.preventDefault();
  mouseDown = false;
  if (dragBody) {
    dragBody = null;
    canvas.style.cursor = 'default';
  }
}

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('mouseleave', handleEnd);
canvas.addEventListener('touchstart', handleStart, { passive: false });
canvas.addEventListener('touchmove', handleMove, { passive: false });
canvas.addEventListener('touchend', handleEnd, { passive: false });
canvas.addEventListener('touchcancel', handleEnd, { passive: false });

// ---------- Helpers ----------
function spawnShape(shapeId: string, x: number, y: number) {
  // simplified: use a generic solid material
  const mat = materialRegistry['wood'] || materialRegistry['metal'];
  if (!mat) return;
  const size = 30;
  const body = Matter.Bodies.rectangle(x, y, size, size, {
    density: mat.density,
    friction: mat.friction,
    restitution: mat.restitution,
    isStatic: false,
    render: { fillStyle: mat.color },
  });
  (body as any).materialId = shapeId; // not a real material, but okay
  Matter.World.add(world, body);
}

function createExplosion(x: number, y: number) {
  const count = 30;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const dist = 10 + Math.random() * 40;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist;
    const body = Matter.Bodies.rectangle(px, py, 6, 6, {
      density: 0.0008,
      friction: 0.3,
      restitution: 0.6,
      render: { fillStyle: ['#aa4a1a','#dd6a2a','#f5b84a','#ff8844'][Math.floor(Math.random()*4)] },
    });
    (body as any).materialId = 'fire';
    (body as any).life = 200 + Math.random() * 100;
    (body as any).isParticle = true;
    Matter.World.add(world, body);
    // push nearby
    const nearby = Matter.Composite.allBodies(world);
    nearby.forEach(b => {
      if (!b.isStatic && b !== body) {
        const dx = b.position.x - x;
        const dy = b.position.y - y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 200 && d > 5) {
          const force = 0.05 / (d/100 + 0.5);
          Matter.Body.applyForce(b, b.position, { x: dx/d * force, y: dy/d * force - 0.02 });
        }
      }
    });
  }
}

// ---------- Keyboard shortcuts ----------
document.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') { resetWorld(); }
  if (e.key === ' ' || e.key === 'Space') {
    e.preventDefault();
    (window as any).__state?.togglePause?.();
  }
  if (e.key === 'b' || e.key === 'B') {
    createExplosion(mouseX || width/2, mouseY || height/2);
  }
});

// Initial spawns
setTimeout(() => {
  spawnMaterial('water', 600, 300, 15);
  spawnMaterial('fire', 400, 100, 10);
  spawnShape('box', 200, 200);
  spawnShape('ball', 350, 180);
}, 100);

// ---------- Resize ----------
window.addEventListener('resize', () => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  render.canvas.width = w;
  render.canvas.height = h;
  render.options.width = w;
  render.options.height = h;
  // rebuild walls (simplified)
  const wallOptions = { isStatic: true, friction: 0.8, restitution: 0.05 };
  const walls = [
    Matter.Bodies.rectangle(w/2, 0, w, 20, wallOptions),
    Matter.Bodies.rectangle(w/2, h, w, 20, wallOptions),
    Matter.Bodies.rectangle(0, h/2, 20, h, wallOptions),
    Matter.Bodies.rectangle(w, h/2, 20, h, wallOptions),
  ];
  // Remove old walls (assuming they are the first 4 bodies)
  const bodies = Matter.Composite.allBodies(world);
  bodies.slice(0, 4).forEach(b => Matter.World.remove(world, b));
  Matter.World.add(world, walls);
});