(function() {
  "use strict";

  // ---------- Matter.js setup ----------
  const { Engine, Render, Runner, Bodies, Body, World, Events, Composite } = Matter;
  const container = document.getElementById('canvas-container');
  const width = container.clientWidth;
  const height = container.clientHeight;

  const engine = Engine.create({
    gravity: { x: 0, y: 1.0 },
    positionIterations: 10,
    velocityIterations: 8,
    constraintIterations: 6,
    enableSleeping: false,
  });
  const world = engine.world;

  const render = Render.create({
    canvas: document.createElement('canvas'),
    engine: engine,
    options: {
      width: width,
      height: height,
      wireframes: false,
      background: '#000000',
      pixelRatio: 1,
      showAngleIndicator: false,
      showVelocity: false,
    }
  });
  container.appendChild(render.canvas);
  const runner = Runner.create();
  Runner.run(runner, engine);
  Render.run(render);

  // ---------- World boundaries ----------
  const wallOptions = { isStatic: true, friction: 0.8, restitution: 0.05, render: { fillStyle: '#1a1a1a' } };
  const walls = [
    Bodies.rectangle(width/2, 0, width, 20, wallOptions),
    Bodies.rectangle(width/2, height, width, 20, wallOptions),
    Bodies.rectangle(0, height/2, 20, height, wallOptions),
    Bodies.rectangle(width, height/2, 20, height, wallOptions),
  ];
  World.add(world, walls);

  // ---------- State ----------
  let selectedTool = 'drag';
  let selectedShape = null;        // e.g. 'box', 'ball', etc.
  let selectedMaterial = null;     // e.g. 'water', 'fire', etc.
  let modifier = 'normal';         // 'normal', 'light', 'heavy'
  let isPaused = false;
  let speedMode = 'normal';        // 'normal', 'slow', 'fast'
  let mouseDown = false;
  let mouseX = 0, mouseY = 0;
  let dragBody = null;
  let windActive = false;
  let windDirection = 1;

  // ---------- Shape definitions ----------
  const shapeDefs = {
    box:     { material: 'wood',    density: 0.003, size: 30, color: '#8a7a5a' },
    ball:    { material: 'metal',   density: 0.004, size: 30, color: '#8a9aaa' },
    plank:   { material: 'wood',    density: 0.002, size: [60, 12], color: '#7a6a4a' },
    heavy:   { material: 'stone',   density: 0.06,  size: 30, color: '#6a5a4a' },
    spike:   { material: 'metal',   density: 0.005, size: 30, color: '#7a7a7a' },
    pyramid: { material: 'stone',   density: 0.003, size: 30, color: '#7a6a5a' },
    dummy:   { material: 'wood',    density: 0.002, size: 30, color: '#8a7a6a' },
    wheel:   { material: 'metal',   density: 0.004, size: 30, color: '#5a5a5a' },
    bridge:  { material: 'wood',    density: 0.002, size: 30, color: '#6a5a3a' },
  };

  // ---------- Material colors ----------
  const materialColors = {
    water: '#3a7aaa', fire: '#aa4a1a', oil: '#5a3a1a', acid: '#4a7a2a', lava: '#aa4a1a',
    smoke: '#5a5a5a', gas: '#3a6a4a', sand: '#8a7a3a', metal: '#5a7a8a', wood: '#6a4a1a',
    chemical: '#6a3a6a', glass: '#4a6a8a', ice: '#4a7a9a', plasma: '#6a3a8a', napalm: '#8a3a1a',
    stone: '#4a4a4a', steam: '#7a9aaa', slick: '#4a4a3a', toxicfumes: '#5a8a3a',
    soot: '#2a2a2a', bubbles: '#5a8aaa', mud: '#5a4a2a', rust: '#7a4a2a', moss: '#4a7a3a',
    acidwater: '#4a7a2a', lens: '#6a8aaa', iceblock: '#5a8a9a', explosion: '#ff8844',
    floatingfire: '#aa4a1a', largefire: '#cc5a2a', acidfumes: '#5a8a3a', magma: '#cc4a1a',
    smog: '#4a4a4a', glasspane: '#5a7a8a', moltenmetal: '#aa7a3a', ash: '#3a3a3a',
    plasmafire: '#8a5aaa', moltenglass: '#7a8a7a', supernova: '#ffaa44', inferno: '#cc4a1a',
    toxicsludge: '#4a5a2a', tar: '#2a2a1a', fuel: '#4a3a1a', tarsand: '#5a4a2a',
    lubricant: '#4a4a3a', preservedwood: '#6a4a1a', plastic: '#4a6a4a', smudge: '#3a3a3a',
    frozenoil: '#4a4a3a', obsidian: '#2a2a2a', chokinghazard: '#4a5a3a', mustardgas: '#6a8a2a',
    dissolvedsand: '#6a5a3a', hydrogengas: '#5a7a6a', rot: '#3a3a1a', etchedglass: '#5a7a8a',
    radioactiveslop: '#6a5a3a', corrosivefire: '#8a4a1a', ashcloud: '#3a3a3a', charcoal: '#2a2a1a',
    magmacore: '#cc4a1a', duststorm: '#6a5a3a', nervegas: '#6a3a6a', smokedglass: '#3a4a4a',
    frostymist: '#5a8a9a', aurora: '#7a5aaa', thicksmoke: '#2a2a2a', quicksand: '#5a4a2a',
    vaportrail: '#5a6a5a', condensation: '#5a7a8a', dryice: '#5a8a8a', fuelairblast: '#ff8844',
    alloy: '#6a7a8a', soil: '#4a3a1a', permafrost: '#4a6a6a', fulgurite: '#6a7a7a',
    stickysand: '#5a4a2a', reinforcedwood: '#6a5a2a', battery: '#6a6a3a', mirror: '#8a9aaa',
    coldmetal: '#4a6a7a', railguncore: '#8a6aaa', heatedmetal: '#aa7a3a', framedglass: '#5a7a8a',
    frozenwood: '#4a5a3a', beaker: '#5a7a8a', slush: '#5a7a6a', neonlight: '#aa5aaa',
    brittle: '#5a7a7a', steamcloud: '#7a9aaa', maxdestruction: '#ff8844'
  };

  // ---------- Cursor mapping ----------
  const cursorMap = {
    'drag': 'cursor-grab', 'delete': 'cursor-delete',
    'water': 'cursor-water', 'fire': 'cursor-fire', 'acid': 'cursor-acid',
    'oil': 'cursor-oil', 'lava': 'cursor-lava', 'smoke': 'cursor-smoke',
    'gas': 'cursor-gas', 'sand': 'cursor-sand', 'metal': 'cursor-metal',
    'wood': 'cursor-wood', 'chemical': 'cursor-chemical', 'glass': 'cursor-glass',
    'ice': 'cursor-ice', 'plasma': 'cursor-plasma', 'napalm': 'cursor-napalm',
  };

  function updateCursor() {
    const canvas = render.canvas;
    Object.values(cursorMap).forEach(cls => canvas.classList.remove(cls));
    canvas.classList.remove('cursor-default', 'cursor-grabbing');
    let cursorClass = 'cursor-default';
    if (selectedTool === 'drag') cursorClass = 'cursor-grab';
    else if (selectedTool === 'delete') cursorClass = 'cursor-delete';
    else if (selectedMaterial && cursorMap[selectedMaterial]) cursorClass = cursorMap[selectedMaterial];
    else if (selectedShape) cursorClass = 'cursor-default';
    canvas.classList.add(cursorClass);
  }

  // ---------- Spawning functions ----------
  function getDensityMultiplier() {
    if (modifier === 'light') return 0.2;
    if (modifier === 'heavy') return 4.0;
    return 1.0;
  }

  function spawnShape(shapeType, x, y) {
    if (isPaused) return;
    const def = shapeDefs[shapeType];
    if (!def) return;
    const size = def.size;
    const baseDensity = def.density;
    const density = baseDensity * getDensityMultiplier();
    const color = def.color;
    const material = def.material;

    let body;
    if (shapeType === 'box' || shapeType === 'plank' || shapeType === 'heavy') {
      const w = (shapeType === 'plank') ? size[0] : size;
      const h = (shapeType === 'plank') ? size[1] : size;
      body = Bodies.rectangle(x, y, w, h, { density, friction: 0.5, restitution: 0.1, render: { fillStyle: color } });
    } else if (shapeType === 'ball' || shapeType === 'wheel') {
      const radius = (shapeType === 'wheel') ? size/2 : size/2;
      body = Bodies.circle(x, y, radius, { density, friction: 0.3, restitution: 0.3, render: { fillStyle: color } });
    } else if (shapeType === 'spike') {
      body = Bodies.fromVertices(x, y, [
        { x: 0, y: -size/2 }, { x: -size/2, y: size/2 }, { x: size/2, y: size/2 }
      ], { density, friction: 0.4, restitution: 0.1, render: { fillStyle: color } });
    } else if (shapeType === 'pyramid') {
      const parts = [];
      for (let i = 0; i < 5; i++) {
        const w = size - i*4;
        const h = 10;
        const px = x - w/2 + i*4/2;
        const py = y - 8 - i*(h+2);
        const b = Bodies.rectangle(px, py, w, h, { density: density*0.8, friction: 0.5, render: { fillStyle: color } });
        parts.push(b);
      }
      const compound = Body.create({ parts: parts, friction: 0.5, restitution: 0.05 });
      compound.materialType = material;
      compound.label = 'shape';
      World.add(world, compound);
      return;
    } else if (shapeType === 'dummy') {
      const head = Bodies.circle(x, y-20, 14, { density: density*0.5, friction: 0.4, restitution: 0.1, render: { fillStyle: '#8a7a6a' } });
      const torso = Bodies.rectangle(x, y+6, 28, 24, { density: density*0.8, friction: 0.5, render: { fillStyle: '#7a6a5a' } });
      const leftLeg = Bodies.rectangle(x-8, y+28, 8, 20, { density: density*0.5, render: { fillStyle: '#6a5a4a' } });
      const rightLeg = Bodies.rectangle(x+8, y+28, 8, 20, { density: density*0.5, render: { fillStyle: '#6a5a4a' } });
      const leftArm = Bodies.rectangle(x-16, y+2, 8, 18, { density: density*0.4, render: { fillStyle: '#7a6a5a' } });
      const rightArm = Bodies.rectangle(x+16, y+2, 8, 18, { density: density*0.4, render: { fillStyle: '#7a6a5a' } });
      const dummy = Body.create({ parts: [head, torso, leftLeg, rightLeg, leftArm, rightArm], friction: 0.6, restitution: 0.08 });
      dummy.materialType = material;
      dummy.label = 'shape';
      World.add(world, dummy);
      return;
    } else if (shapeType === 'bridge') {
      const parts = [];
      const segments = 8;
      for (let i = 0; i < segments; i++) {
        const bx = x - (segments/2)*16 + i*16 + 8;
        const by = y + Math.sin(i * 0.5) * 8;
        const b = Bodies.rectangle(bx, by, 14, 4, { density: density*0.6, friction: 0.5, render: { fillStyle: color } });
        parts.push(b);
      }
      const bridge = Body.create({ parts: parts, friction: 0.5, restitution: 0.05 });
      bridge.materialType = material;
      bridge.label = 'shape';
      World.add(world, bridge);
      return;
    } else {
      return;
    }

    if (body) {
      body.materialType = material;
      body.label = 'shape';
      World.add(world, body);
    }
  }

  const particleMaterials = [
    'fire', 'smoke', 'gas', 'plasma', 'steam', 'toxicfumes', 'acidfumes',
    'smog', 'mustardgas', 'nervegas', 'aurora', 'ashcloud', 'duststorm',
    'frostymist', 'thicksmoke', 'vaportrail', 'condensation', 'floatingfire',
    'largefire', 'corrosivefire', 'hydrogengas', 'fuel', 'fuelairblast'
  ];

  function spawnMaterial(mat, x, y, count = null) {
    if (isPaused) return;
    const color = materialColors[mat] || '#aaaaaa';
    const isParticle = particleMaterials.includes(mat);
    const cnt = count || (isParticle ? 20 : 10);
    for (let i = 0; i < cnt; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 4 + Math.random() * 25;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist - 6;
      const size = 3 + Math.random() * 8;
      const opts = {
        density: isParticle ? 0.0003 : 0.002,
        friction: 0.3,
        restitution: 0.1,
        render: { fillStyle: color },
        isSensor: false,
        label: mat,
      };
      let body;
      if (['water', 'oil', 'acid', 'napalm', 'slick', 'acidwater', 'moltenmetal', 'moltenglass', 'lubricant', 'frozenoil'].includes(mat)) {
        body = Bodies.rectangle(px, py, size*0.8, size*0.8, opts);
      } else if (['sand', 'mud', 'tarsand', 'quicksand', 'stickysand', 'soil', 'permafrost'].includes(mat)) {
        body = Bodies.rectangle(px, py, size*0.6, size*0.6, opts);
      } else if (['lava', 'glass', 'ice', 'stone', 'obsidian', 'glasspane', 'iceblock', 'dryice', 'fulgurite', 'brittle', 'coldmetal', 'frozenwood'].includes(mat)) {
        body = Bodies.rectangle(px, py, size*0.7, size*0.7, opts);
      } else {
        body = Bodies.rectangle(px, py, size*0.7, size*0.7, opts);
      }
      body.materialType = mat;
      if (isParticle) {
        body.life = 300 + Math.random() * 150;
        body.isParticle = true;
      } else {
        body.isParticle = false;
        body.life = Infinity;
      }
      World.add(world, body);
    }
  }

  function createExplosion(x, y, power = 30) {
    for (let i = 0; i < power; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const dist = 10 + Math.random() * 40;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      const size = 4 + Math.random() * 10;
      const colors = ['#aa4a1a', '#dd6a2a', '#f5b84a', '#ff8844'];
      const body = Bodies.rectangle(px, py, size, size, {
        density: 0.0008,
        friction: 0.3,
        restitution: 0.6,
        render: { fillStyle: colors[Math.floor(Math.random() * colors.length)] },
        label: 'fire'
      });
      body.materialType = 'fire';
      body.isParticle = true;
      body.life = 400 + Math.random() * 200;
      World.add(world, body);
      const nearby = Composite.allBodies(world);
      nearby.forEach(b => {
        if (!b.isStatic && b !== body) {
          const dx = b.position.x - x;
          const dy = b.position.y - y;
          const dist2 = Math.sqrt(dx*dx + dy*dy);
          if (dist2 < 200 && dist2 > 5) {
            const force = 0.05 / (dist2 / 100 + 0.5);
            Body.applyForce(b, b.position, { x: dx/dist2 * force, y: dy/dist2 * force - 0.02 });
          }
        }
      });
    }
  }

  function spawnSmoke(x, y, count = 8, color = '#5a5a5a') {
    for (let i = 0; i < count; i++) {
      const s = Bodies.rectangle(x + (Math.random()-0.5)*20, y-10, 6, 6, {
        density: 0.0003, isSensor: true, render: { fillStyle: color }, label: 'smoke'
      });
      s.isParticle = true;
      s.life = 400 + Math.random() * 200;
      s.materialType = 'smoke';
      World.add(world, s);
    }
  }

  function spawnStone(x, y, color = '#4a4a4a', label = 'stone') {
    const stone = Bodies.rectangle(x, y, 20, 20, {
      density: 0.008, friction: 0.8, render: { fillStyle: color }, label: label
    });
    stone.materialType = label;
    stone.isParticle = false;
    World.add(world, stone);
  }

  // ---------- Reaction system ----------
  const reactionMap = {
    'water_fire': { result: 'steam', count: 15 },
    'water_oil': { result: 'slick', count: 8 },
    'water_acid': { result: 'toxicfumes', count: 12 },
    'water_lava': { result: 'stone', count: 1 },
    'water_smoke': { result: 'soot', count: 10 },
    'water_gas': { result: 'bubbles', count: 10 },
    'water_sand': { result: 'mud', count: 8 },
    'water_metal': { result: 'rust', count: 5 },
    'water_wood': { result: 'moss', count: 6 },
    'water_chemical': { result: 'acidwater', count: 10 },
    'water_glass': { result: 'lens', count: 1 },
    'water_ice': { result: 'iceblock', count: 1 },
    'water_plasma': { result: 'explosion', count: 20 },
    'water_napalm': { result: 'floatingfire', count: 10 },
    'fire_oil': { result: 'largefire', count: 15 },
    'fire_acid': { result: 'acidfumes', count: 12 },
    'fire_lava': { result: 'magma', count: 8 },
    'fire_smoke': { result: 'smog', count: 12 },
    'fire_gas': { result: 'explosion', count: 20 },
    'fire_sand': { result: 'glasspane', count: 1 },
    'fire_metal': { result: 'moltenmetal', count: 6 },
    'fire_wood': { result: 'ash', count: 10 },
    'fire_chemical': { result: 'plasmafire', count: 8 },
    'fire_glass': { result: 'moltenglass', count: 6 },
    'fire_ice': { result: 'water', count: 10 },
    'fire_plasma': { result: 'supernova', count: 15 },
    'fire_napalm': { result: 'inferno', count: 15 },
    'oil_acid': { result: 'toxicsludge', count: 8 },
    'oil_lava': { result: 'inferno', count: 15 },
    'oil_smoke': { result: 'tar', count: 8 },
    'oil_gas': { result: 'fuel', count: 10 },
    'oil_sand': { result: 'tarsand', count: 6 },
    'oil_metal': { result: 'lubricant', count: 6 },
    'oil_wood': { result: 'preservedwood', count: 6 },
    'oil_chemical': { result: 'plastic', count: 6 },
    'oil_glass': { result: 'smudge', count: 4 },
    'oil_ice': { result: 'frozenoil', count: 6 },
    'oil_plasma': { result: 'explosion', count: 20 },
    'oil_napalm': { result: 'napalm', count: 10 },
    'acid_lava': { result: 'obsidian', count: 1 },
    'acid_smoke': { result: 'chokinghazard', count: 10 },
    'acid_gas': { result: 'mustardgas', count: 12 },
    'acid_sand': { result: 'dissolvedsand', count: 6 },
    'acid_metal': { result: 'hydrogengas', count: 8 },
    'acid_wood': { result: 'rot', count: 8 },
    'acid_chemical': { result: 'explosion', count: 20 },
    'acid_glass': { result: 'etchedglass', count: 4 },
    'acid_ice': { result: 'acidwater', count: 10 },
    'acid_plasma': { result: 'radioactiveslop', count: 12 },
    'acid_napalm': { result: 'corrosivefire', count: 10 },
    'lava_smoke': { result: 'ashcloud', count: 12 },
    'lava_gas': { result: 'explosion', count: 20 },
    'lava_sand': { result: 'glasspane', count: 1 },
    'lava_metal': { result: 'moltenmetal', count: 8 },
    'lava_wood': { result: 'charcoal', count: 8 },
    'lava_chemical': { result: 'explosion', count: 20 },
    'lava_glass': { result: 'moltenglass', count: 6 },
    'lava_ice': { result: 'obsidian', count: 1 },
    'lava_plasma': { result: 'magmacore', count: 8 },
    'lava_napalm': { result: 'inferno', count: 15 },
    'smoke_gas': { result: 'smog', count: 12 },
    'smoke_sand': { result: 'duststorm', count: 10 },
    'smoke_metal': { result: 'soot', count: 6 },
    'smoke_wood': { result: 'charredwood', count: 6 },
    'smoke_chemical': { result: 'nervegas', count: 12 },
    'smoke_glass': { result: 'smokedglass', count: 4 },
    'smoke_ice': { result: 'frostymist', count: 10 },
    'smoke_plasma': { result: 'aurora', count: 8 },
    'smoke_napalm': { result: 'thicksmoke', count: 12 },
    'gas_sand': { result: 'quicksand', count: 8 },
    'gas_metal': { result: 'rust', count: 6 },
    'gas_wood': { result: 'vaportrail', count: 8 },
    'gas_chemical': { result: 'toxicfumes', count: 12 },
    'gas_glass': { result: 'condensation', count: 6 },
    'gas_ice': { result: 'dryice', count: 6 },
    'gas_plasma': { result: 'explosion', count: 20 },
    'gas_napalm': { result: 'fuelairblast', count: 15 },
    'sand_metal': { result: 'alloy', count: 6 },
    'sand_wood': { result: 'soil', count: 6 },
    'sand_chemical': { result: 'acidwater', count: 8 },
    'sand_glass': { result: 'glasspane', count: 1 },
    'sand_ice': { result: 'permafrost', count: 6 },
    'sand_plasma': { result: 'fulgurite', count: 6 },
    'sand_napalm': { result: 'stickysand', count: 8 },
    'metal_wood': { result: 'reinforcedwood', count: 6 },
    'metal_chemical': { result: 'battery', count: 6 },
    'metal_glass': { result: 'mirror', count: 1 },
    'metal_ice': { result: 'coldmetal', count: 6 },
    'metal_plasma': { result: 'railguncore', count: 6 },
    'metal_napalm': { result: 'heatedmetal', count: 6 },
    'wood_chemical': { result: 'rot', count: 8 },
    'wood_glass': { result: 'framedglass', count: 1 },
    'wood_ice': { result: 'frozenwood', count: 6 },
    'wood_plasma': { result: 'ash', count: 10 },
    'wood_napalm': { result: 'inferno', count: 15 },
    'chemical_glass': { result: 'beaker', count: 1 },
    'chemical_ice': { result: 'slush', count: 8 },
    'chemical_plasma': { result: 'radioactiveslop', count: 12 },
    'chemical_napalm': { result: 'explosion', count: 20 },
    'glass_ice': { result: 'brittle', count: 6 },
    'glass_plasma': { result: 'neonlight', count: 8 },
    'glass_napalm': { result: 'smokedglass', count: 4 },
    'ice_plasma': { result: 'steamcloud', count: 15 },
    'ice_napalm': { result: 'water', count: 10 },
    'plasma_napalm': { result: 'supernova', count: 15 },
  };

  function handleReaction(a, b, posX, posY) {
    const matA = a.materialType || a.label;
    const matB = b.materialType || b.label;
    if (!matA || !matB) return;
    const key1 = matA + '_' + matB;
    const key2 = matB + '_' + matA;
    const reaction = reactionMap[key1] || reactionMap[key2];
    if (!reaction) return;

    World.remove(world, a);
    World.remove(world, b);

    const result = reaction.result;
    const count = reaction.count || 10;

    const blockResults = [
      'stone', 'obsidian', 'glasspane', 'mirror', 'beaker', 'framedglass', 'lens', 'iceblock',
      'dryice', 'fulgurite', 'etchedglass', 'smokedglass', 'brittle', 'coldmetal', 'frozenwood',
      'permafrost', 'alloy', 'reinforcedwood', 'preservedwood', 'plastic', 'lubricant',
      'moltenmetal', 'moltenglass', 'charcoal', 'ash', 'soot', 'tar', 'rust', 'mud', 'soil',
      'tarsand', 'quicksand', 'stickysand', 'dissolvedsand', 'toxicsludge', 'rot', 'moss',
      'slick', 'smudge', 'frozenoil', 'condensation', 'vaportrail', 'hydrogengas', 'fuel',
      'battery', 'railguncore', 'magmacore', 'heatedmetal', 'floatingfire', 'corrosivefire',
      'acidwater', 'slush', 'neonlight', 'aurora'
    ];
    if (blockResults.includes(result)) {
      spawnStone(posX, posY, materialColors[result] || '#4a4a4a', result);
    } else if (['explosion', 'supernova', 'inferno', 'fuelairblast', 'maxdestruction', 'largefire', 'magma'].includes(result)) {
      createExplosion(posX, posY, 25);
    } else if (result === 'water' || result === 'steam' || result === 'steamcloud') {
      spawnMaterial('water', posX, posY, 10);
    } else {
      spawnMaterial(result, posX, posY, count);
    }
  }

  // ---------- Impact damage ----------
  function checkImpactDamage(bodyA, bodyB) {
    if (!bodyA || !bodyB || bodyA.isStatic || bodyB.isStatic) return;
    if (bodyA.label !== 'shape' || bodyB.label !== 'shape') return;
    const speedA = Math.sqrt(bodyA.velocity.x * bodyA.velocity.x + bodyA.velocity.y * bodyA.velocity.y);
    const speedB = Math.sqrt(bodyB.velocity.x * bodyB.velocity.x + bodyB.velocity.y * bodyB.velocity.y);
    const relativeSpeed = Math.abs(speedA - speedB);
    const heightDiff = bodyA.position.y - bodyB.position.y;
    if (relativeSpeed > 10 && heightDiff > 50) {
      const massRatio = bodyA.mass / bodyB.mass;
      if (massRatio > 2.5) {
        World.remove(world, bodyB);
        spawnSmoke(bodyB.position.x, bodyB.position.y, 5);
      } else if (massRatio < 0.4) {
        World.remove(world, bodyA);
        spawnSmoke(bodyA.position.x, bodyA.position.y, 5);
      }
    }
  }

  // ---------- Event listeners ----------
  Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
      const a = pair.bodyA;
      const b = pair.bodyB;
      if (a.isStatic || b.isStatic) return;
      const posX = (a.position.x + b.position.x) / 2;
      const posY = (a.position.y + b.position.y) / 2;
      handleReaction(a, b, posX, posY);
      checkImpactDamage(a, b);
    });
  });

  Events.on(engine, 'beforeUpdate', () => {
    if (windActive) {
      const bodies = Composite.allBodies(world);
      bodies.forEach(body => {
        if (!body.isStatic && body.label && particleMaterials.includes(body.label)) {
          Body.applyForce(body, body.position, { x: windDirection * 0.003, y: -0.001 });
        }
      });
    }
    const bodies = Composite.allBodies(world);
    bodies.forEach(body => {
      if (body.isParticle && body.life !== undefined && body.life < Infinity) {
        body.life -= 1;
        if (body.life < 0) World.remove(world, body);
      }
    });
  });

  // ---------- Mouse / Touch handling ----------
  function getPos(e) {
    const rect = render.canvas.getBoundingClientRect();
    const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    const clientY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function handleStart(e) {
    e.preventDefault();
    const pos = getPos(e);
    mouseX = pos.x; mouseY = pos.y;
    mouseDown = true;

    if (selectedShape) {
      spawnShape(selectedShape, mouseX, mouseY);
      return;
    }
    if (selectedMaterial) {
      spawnMaterial(selectedMaterial, mouseX, mouseY);
      return;
    }

    if (selectedTool === 'drag') {
      const bodies = Composite.allBodies(world);
      for (let b of bodies) {
        if (b.isStatic) continue;
        if (Matter.Bounds.contains(b.bounds, { x: mouseX, y: mouseY })) {
          dragBody = b;
          render.canvas.classList.add('cursor-grabbing');
          break;
        }
      }
    } else if (selectedTool === 'delete') {
      const bodies = Composite.allBodies(world);
      for (let b of bodies) {
        if (b.isStatic) continue;
        if (Matter.Bounds.contains(b.bounds, { x: mouseX, y: mouseY })) {
          World.remove(world, b);
          break;
        }
      }
    } else if (selectedTool === 'explode') {
      createExplosion(mouseX, mouseY, 35);
    }
  }

  function handleMove(e) {
    e.preventDefault();
    const pos = getPos(e);
    mouseX = pos.x; mouseY = pos.y;
    if (mouseDown && dragBody) {
      Body.setPosition(dragBody, { x: mouseX, y: mouseY });
      Body.setVelocity(dragBody, { x: 0, y: 0 });
    }
    if (mouseDown && selectedMaterial && !dragBody && !selectedShape) {
      if (Math.random() < 0.25) spawnMaterial(selectedMaterial, mouseX, mouseY);
    }
  }

  function handleEnd(e) {
    e.preventDefault();
    mouseDown = false;
    if (dragBody) {
      dragBody = null;
      render.canvas.classList.remove('cursor-grabbing');
    }
  }

  const canvas = render.canvas;
  canvas.addEventListener('mousedown', handleStart);
  canvas.addEventListener('mousemove', handleMove);
  canvas.addEventListener('mouseup', handleEnd);
  canvas.addEventListener('mouseleave', handleEnd);
  canvas.addEventListener('touchstart', handleStart, { passive: false });
  canvas.addEventListener('touchmove', handleMove, { passive: false });
  canvas.addEventListener('touchend', handleEnd, { passive: false });
  canvas.addEventListener('touchcancel', handleEnd, { passive: false });

  // ---------- Toolbar buttons ----------
  document.querySelectorAll('[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.tool;
      if (tool === 'reset') {
        const bodies = Composite.allBodies(world);
        bodies.forEach(b => { if (!b.isStatic) World.remove(world, b); });
        return;
      }
      if (tool === 'pause') {
        isPaused = !isPaused;
        btn.textContent = isPaused ? 'play' : 'pause';
        if (isPaused) Runner.stop(runner); else Runner.start(runner, engine);
        return;
      }
      if (tool === 'slow') {
        speedMode = 'slow';
        engine.gravity.y = 0.3;
        document.querySelector('[data-tool="slow"]').classList.add('tool-active');
        document.querySelector('[data-tool="fast"]').classList.remove('tool-active');
        document.querySelector('[data-tool="slow"]').textContent = 'slow';
        document.querySelector('[data-tool="fast"]').textContent = 'fast';
        return;
      }
      if (tool === 'fast') {
        speedMode = 'fast';
        engine.gravity.y = 2.0;
        document.querySelector('[data-tool="fast"]').classList.add('tool-active');
        document.querySelector('[data-tool="slow"]').classList.remove('tool-active');
        document.querySelector('[data-tool="fast"]').textContent = 'fast';
        document.querySelector('[data-tool="slow"]').textContent = 'slow';
        return;
      }
      if (tool === 'wind') {
        windActive = !windActive;
        windDirection = windActive ? (windDirection > 0 ? -1 : 1) : 1;
        btn.textContent = windActive ? 'wind:' + (windDirection > 0 ? '→' : '←') : 'wind';
        return;
      }
      if (tool === 'explode') return;

      selectedShape = null;
      selectedMaterial = null;
      document.querySelectorAll('[data-shape]').forEach(b => b.classList.remove('tool-active'));
      document.querySelectorAll('[data-material]').forEach(b => b.classList.remove('tool-active'));

      document.querySelectorAll('[data-tool]').forEach(b => {
        b.classList.remove('tool-active');
        if (b.dataset.tool === 'slow' || b.dataset.tool === 'fast') {
          if (speedMode === 'normal' && (b.dataset.tool === 'slow' || b.dataset.tool === 'fast')) {
            b.classList.remove('tool-active');
          }
        }
      });
      btn.classList.add('tool-active');
      selectedTool = tool;
      if (tool !== 'slow' && tool !== 'fast') {
        speedMode = 'normal';
        engine.gravity.y = 1.0;
        document.querySelector('[data-tool="slow"]').classList.remove('tool-active');
        document.querySelector('[data-tool="fast"]').classList.remove('tool-active');
        document.querySelector('[data-tool="slow"]').textContent = 'slow';
        document.querySelector('[data-tool="fast"]').textContent = 'fast';
      }
      updateCursor();
    });
  });

  // Shape buttons
  document.querySelectorAll('[data-shape]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedMaterial = null;
      document.querySelectorAll('[data-material]').forEach(b => b.classList.remove('tool-active'));
      if (selectedShape === btn.dataset.shape) {
        selectedShape = null;
        btn.classList.remove('tool-active');
      } else {
        document.querySelectorAll('[data-shape]').forEach(b => b.classList.remove('tool-active'));
        btn.classList.add('tool-active');
        selectedShape = btn.dataset.shape;
      }
      selectedTool = 'drag';
      document.querySelectorAll('[data-tool]').forEach(b => b.classList.remove('tool-active'));
      document.querySelector('[data-tool="drag"]').classList.add('tool-active');
      updateCursor();
    });
  });

  // Material buttons
  document.querySelectorAll('[data-material]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedShape = null;
      document.querySelectorAll('[data-shape]').forEach(b => b.classList.remove('tool-active'));
      if (selectedMaterial === btn.dataset.material) {
        selectedMaterial = null;
        btn.classList.remove('tool-active');
      } else {
        document.querySelectorAll('[data-material]').forEach(b => b.classList.remove('tool-active'));
        btn.classList.add('tool-active');
        selectedMaterial = btn.dataset.material;
      }
      selectedTool = 'drag';
      document.querySelectorAll('[data-tool]').forEach(b => b.classList.remove('tool-active'));
      document.querySelector('[data-tool="drag"]').classList.add('tool-active');
      updateCursor();
    });
  });

  // Modifier buttons
  document.querySelectorAll('[data-mod]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mod = btn.dataset.mod;
      if (modifier === mod) {
        modifier = 'normal';
        btn.classList.remove('modifier-active');
      } else {
        document.querySelectorAll('[data-mod]').forEach(b => b.classList.remove('modifier-active'));
        modifier = mod;
        btn.classList.add('modifier-active');
      }
    });
  });

  // ---------- Resize ----------
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    render.canvas.width = w;
    render.canvas.height = h;
    render.options.width = w;
    render.options.height = h;
    World.remove(world, walls);
    const newWalls = [
      Bodies.rectangle(w/2, 0, w, 20, wallOptions),
      Bodies.rectangle(w/2, h, w, 20, wallOptions),
      Bodies.rectangle(0, h/2, 20, h, wallOptions),
      Bodies.rectangle(w, h/2, 20, h, wallOptions),
    ];
    World.add(world, newWalls);
    walls.splice(0, walls.length, ...newWalls);
  });

  // ---------- Keyboard shortcuts ----------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
      const bodies = Composite.allBodies(world);
      bodies.forEach(b => { if (!b.isStatic) World.remove(world, b); });
    }
    if (e.key === ' ' || e.key === 'Space') {
      e.preventDefault();
      isPaused = !isPaused;
      const btn = document.querySelector('[data-tool="pause"]');
      btn.textContent = isPaused ? 'play' : 'pause';
      if (isPaused) Runner.stop(runner); else Runner.start(runner, engine);
    }
    if (e.key === 'b' || e.key === 'B') {
      createExplosion(mouseX || width/2, mouseY || height/2, 30);
    }
  });

  // ---------- Initialization ----------
  updateCursor();
  setTimeout(() => {
    spawnShape('box', 200, 200);
    spawnShape('ball', 350, 180);
    spawnShape('plank', 500, 200);
    spawnShape('heavy', 150, 300);
    spawnShape('dummy', 400, 300);
    spawnMaterial('water', 600, 300, 15);
    spawnMaterial('fire', 400, 100, 10);
  }, 100);

})();