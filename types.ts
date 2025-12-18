
export interface Vector2D {
  x: number;
  y: number;
}

export enum EntityType {
  TREE = 'TREE',
  ROCK = 'ROCK',
  FLOWER = 'FLOWER',
  ANIMAL = 'ANIMAL',
  BIRD = 'BIRD',
  BOUNDARY_ROCK = 'BOUNDARY_ROCK'
}

export interface GameObject {
  id: string;
  type: EntityType;
  pos: Vector2D;
  size: number;
  variant: number;
  color: string;
  isFlying?: boolean;
  velocity?: Vector2D;
}

export interface GameState {
  playerPos: Vector2D;
  cameraPos: Vector2D;
  worldObjects: GameObject[];
  isMoving: boolean;
  score: number;
  currentMessage: string;
}

export interface LoreResponse {
  message: string;
}
