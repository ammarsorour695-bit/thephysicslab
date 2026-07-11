import Matter from 'matter-js';

export enum MaterialCategory {
  Life = 'life',
  Gas = 'gas',
  Liquid = 'liquid',
  Solid = 'solid',
}

export interface Material {
  id: string;
  label: string;
  category: MaterialCategory;
  color: string;
  density: number;
  friction: number;
  restitution: number;
  isStatic: boolean;
  isParticle: boolean;
  isFloat: boolean;
  life?: number;
  behavior: (body: Matter.Body) => void;
}

export interface Reaction {
  result: string;
  count?: number;
}

export type ReactionMap = Record<string, Reaction>;

export interface Tool {
  id: string;
  label: string;
  icon?: string;
}