import { materialRegistry } from '../materials';
import { spawnMaterial, resetWorld, togglePause, setSlow, setFast, setNormalSpeed, getEngine } from '../physics/engine';
import Matter from 'matter-js';

type Tool = { id: string; label: string; action?: () => void; isTool?: boolean };

const tools: Tool[] = [
  { id: 'drag', label: 'grab', isTool: true },
  { id: 'delete', label: 'del', isTool: true },
  { id: 'reset', label: 'reset', action: resetWorld },
  { id: 'pause', label: 'pause', action: togglePause },
  { id: 'slow', label: 'slow', action: setSlow },
  { id: 'fast', label: 'fast', action: setFast },
  { id: 'wind', label: 'wind', isTool: true },
  { id: 'explode', label: 'boom', isTool: true },
];

const shapeIds = ['box', 'ball', 'plank', 'heavy', 'spike', 'pyramid', 'dummy', 'wheel', 'bridge'];

const categories = [
  { id: 'life', label: 'Life', materialIds: ['dummy', 'moss', 'soil', 'grass'] },
  { id: 'gas', label: 'Gases', materialIds: ['fire', 'smoke', 'gas', 'plasma', 'steam'] },
  { id: 'liquid', label: 'Liquids', materialIds: ['water', 'oil', 'acid', 'lava', 'napalm'] },
  { id: 'solid', label: 'Solids', materialIds: ['sand', 'metal', 'wood', 'glass', 'ice', 'stone', 'obsidian', 'brick'] },
];

let selectedTool = 'drag';
let selectedMaterial: string | null = null;
let selectedShape: string | null = null;
let modifier: 'normal' | 'light' | 'heavy' = 'normal';
let isPaused = false;
let windActive = false;
let windDirection = 1;

export function buildToolbar(container: HTMLElement) {
  // Tools group
  const toolsGroup = document.createElement('div');
  toolsGroup.className = 'group';
  const toolsLabel = document.createElement('span');
  toolsLabel.className = 'group-label';
  toolsLabel.textContent = 'Tools';
  toolsGroup.appendChild(toolsLabel);

  tools.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'pixel-btn';
    if (t.id === 'drag') btn.classList.add('tool-active');
    btn.textContent = t.label;
    btn.dataset.tool = t.id;
    btn.addEventListener('click', () => {
      if (t.action) { t.action(); return; }
      if (t.id === 'wind') {
        windActive = !windActive;
        windDirection = windActive ? (windDirection > 0 ? -1 : 1) : 1;
        btn.textContent = windActive ? `wind:${windDirection > 0 ? '→' : '←'}` : 'wind';
        return;
      }
      if (t.id === 'explode') {
        // handled in main via mouse
        return;
      }
      // tool selection
      document.querySelectorAll('[data-tool]').forEach(b => b.classList.remove('tool-active'));
      btn.classList.add('tool-active');
      selectedTool = t.id;
      selectedMaterial = null;
      selectedShape = null;
      document.querySelectorAll('[data-material]').forEach(b => b.classList.remove('tool-active'));
      document.querySelectorAll('[data-shape]').forEach(b => b.classList.remove('tool-active'));
      if (t.id === 'slow') { setSlow(); }
      else if (t.id === 'fast') { setFast(); }
      else if (t.id === 'pause') { /* already handled */ }
      else { setNormalSpeed(); }
    });
    toolsGroup.appendChild(btn);
  });
  container.appendChild(toolsGroup);

  // Shapes group
  const shapesGroup = document.createElement('div');
  shapesGroup.className = 'group';
  const shapesLabel = document.createElement('span');
  shapesLabel.className = 'group-label';
  shapesLabel.textContent = 'Shapes';
  shapesGroup.appendChild(shapesLabel);

  shapeIds.forEach(id => {
    const btn = document.createElement('button');
    btn.className = 'pixel-btn';
    btn.textContent = id;
    btn.dataset.shape = id;
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-shape]').forEach(b => b.classList.remove('tool-active'));
      btn.classList.add('tool-active');
      selectedShape = id;
      selectedMaterial = null;
      document.querySelectorAll('[data-material]').forEach(b => b.classList.remove('tool-active'));
      selectedTool = 'drag';
      document.querySelectorAll('[data-tool]').forEach(b => b.classList.remove('tool-active'));
      document.querySelector('[data-tool="drag"]')?.classList.add('tool-active');
    });
    shapesGroup.appendChild(btn);
  });
  container.appendChild(shapesGroup);

  // Modifiers group
  const modGroup = document.createElement('div');
  modGroup.className = 'group';
  const modLabel = document.createElement('span');
  modLabel.className = 'group-label';
  modLabel.textContent = 'mod';
  modGroup.appendChild(modLabel);

  ['light', 'heavy'].forEach(mod => {
    const btn = document.createElement('button');
    btn.className = 'pixel-btn';
    btn.textContent = mod;
    btn.dataset.mod = mod;
    btn.addEventListener('click', () => {
      if (modifier === mod) {
        modifier = 'normal';
        btn.classList.remove('modifier-active');
      } else {
        document.querySelectorAll('[data-mod]').forEach(b => b.classList.remove('modifier-active'));
        modifier = mod as 'light' | 'heavy';
        btn.classList.add('modifier-active');
      }
    });
    modGroup.appendChild(btn);
  });
  container.appendChild(modGroup);

  // Materials groups by category
  categories.forEach(cat => {
    const group = document.createElement('div');
    group.className = 'group';
    const label = document.createElement('span');
    label.className = 'group-label';
    label.textContent = cat.label;
    group.appendChild(label);

    cat.materialIds.forEach(matId => {
      const mat = materialRegistry[matId];
      if (!mat) return;
      const btn = document.createElement('button');
      btn.className = 'pixel-btn material';
      btn.textContent = mat.label.slice(0, 3);
      btn.dataset.material = matId;
      // Add color class if exists
      const colorClass = `btn-${matId}`;
      btn.classList.add(colorClass);
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-material]').forEach(b => b.classList.remove('tool-active'));
        btn.classList.add('tool-active');
        selectedMaterial = matId;
        selectedShape = null;
        document.querySelectorAll('[data-shape]').forEach(b => b.classList.remove('tool-active'));
        selectedTool = 'drag';
        document.querySelectorAll('[data-tool]').forEach(b => b.classList.remove('tool-active'));
        document.querySelector('[data-tool="drag"]')?.classList.add('tool-active');
      });
      group.appendChild(btn);
    });
    container.appendChild(group);
  });

  // Expose state for main
  (window as any).__state = {
    get selectedTool() { return selectedTool; },
    get selectedMaterial() { return selectedMaterial; },
    get selectedShape() { return selectedShape; },
    get modifier() { return modifier; },
    get windActive() { return windActive; },
    get windDirection() { return windDirection; },
  };
}