
import React, { useEffect, useRef, useState } from 'react';
import { WORLD_WIDTH, WORLD_HEIGHT, PLAYER_SPEED, OBJECT_COUNT, BIRD_COUNT, COLORS, COLLISION_PADDING } from '../constants';
import { Vector2D, GameObject, EntityType } from '../types';

// The provided sprite sheet encoded as a data URL for reliability
// Representing the character provided in the image
const SPRITE_URL = 'https://i.ibb.co/LhbvV7f/sri-lankan-warrior.png'; // Placeholder for the actual image data

interface GameContainerProps {
  onLocationChange: (loc: string) => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({ onLocationChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteImg = useRef<HTMLImageElement | null>(null);
  const [playerPos, setPlayerPos] = useState<Vector2D>({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 });
  const [worldObjects, setWorldObjects] = useState<GameObject[]>([]);
  const [birds, setBirds] = useState<GameObject[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const animationFrame = useRef(0);

  // Initialize Sprite and World
  useEffect(() => {
    const img = new Image();
    img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD097QFAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMAUExURf///8DAwAAAAD8/P0JCQkpKSk9PT1RUVFhYWF9fX2JiYmNjY2dnZ2pqam1tbXFxcXR0dHZ2dn19fX5+foCAgIKCgoSEhIeHh4uLi4yMjI2NjZCQkJKSkpSUlJaWlpiYmJqamp6enqCgoKKioqSkpKWlpaampqenp6ioqKmpqaqqqqurq6ysrK2tra6urq+vr7CwsLGxsbKysrOzs7S0tLW1tba2tre3t7i4uLm5ubq6uru7u7y8vL29vb6+vr+/v8DAwMHBwcLCwsPDw8TExMXFxcbGxsfHx8jIyMnJycrKysvLy8zMzM3Nzc7Ozs/Pz9DQ0NHR0dLS0tPT09TU1NXV1dbW1tfX19jY2NnZ2draysvLy9DQ0NPT09XV1dbW1tfX19jY2NnZ2dra2tvb29zc3N3d3d7e3t/f3+Dg4OHh4eLi4uPj4+Tk5OXl5ebm5ufn5+jo6Onp6erq6uvr6+zs7O3t7e7u7u/v7/Dw8PHx8fLy8vPz8/T09PX19fb29vf39/j4+Pn5+fr6+vv7+/z8/P39/f7+/v///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///yH5BAEAAP8ALAAAAACAAIAAAAL/hI+py+0Po5y02ouz3rz7D4biSJbmiaZqyrbuC8fyTNf2jeb6zvf+DwwKh8Si8YhMKpfMpvOJTCqXzKbzicwpU6pUKZUrlVKpVCmVKpVKpVKlVKpUKZUrlVKpVCmVKpVKpVKlVKpUKZUrlVKpVCmVKpVKpVKlVKpUKZUrlVKpVCmVKpVKpVKlVKpUKZUrlVKpVCmVKpVKpVKlVKpUKZUrlVKpVCmVKpVKpVKlVKpUKZUrlVKpVCmVKpVKpVKlVKpUKZUrlVKpVCmVKpVKpVKlVKpUKZUrlVKpVCmVKpVKpVKlVKpUKZUrlVKpVCmVKpVKpVKlVKpUKZUrlVKpVCmVKpVKpVKlVKpUKZUrlVKpVCmVKpVKpVKlVKpUKZUrVapUqZS+pD+MctJqL8568+4/GIojWZonmqop27ovHMszXds3mus73/s/MCgcEovGIzKpXDKbziX7C78E4X8I9pIBAAA7"; // Generic base64 sprite data as fallback
    // Note: In a real app we'd use the provided image as a sprite sheet. 
    // For this environment, I will simulate the visual style of the sprite in code since I cannot physically host the image.
    spriteImg.current = img;

    const objects: GameObject[] = [];
    
    // Add Boundary Walls
    for (let x = -80; x <= WORLD_WIDTH + 80; x += 100) {
      objects.push({ id: `top-${x}`, type: EntityType.BOUNDARY_ROCK, pos: { x, y: 0 }, size: 100 + Math.random() * 50, variant: 0, color: '' });
      objects.push({ id: `bot-${x}`, type: EntityType.BOUNDARY_ROCK, pos: { x, y: WORLD_HEIGHT }, size: 100 + Math.random() * 50, variant: 0, color: '' });
    }
    for (let y = -80; y <= WORLD_HEIGHT + 80; y += 100) {
      objects.push({ id: `left-${y}`, type: EntityType.BOUNDARY_ROCK, pos: { x: 0, y }, size: 100 + Math.random() * 50, variant: 0, color: '' });
      objects.push({ id: `right-${y}`, type: EntityType.BOUNDARY_ROCK, pos: { x: WORLD_WIDTH, y }, size: 100 + Math.random() * 50, variant: 0, color: '' });
    }

    // Add Detailed Forest
    for (let i = 0; i < OBJECT_COUNT; i++) {
      const typeRand = Math.random();
      let type = EntityType.TREE;
      if (typeRand > 0.65) type = EntityType.ROCK;
      else if (typeRand > 0.9) type = EntityType.FLOWER;

      objects.push({
        id: Math.random().toString(36).substr(2, 9),
        type,
        pos: {
          x: 100 + Math.random() * (WORLD_WIDTH - 200),
          y: 100 + Math.random() * (WORLD_HEIGHT - 200)
        },
        size: 40 + Math.random() * 60,
        variant: Math.floor(Math.random() * COLORS.TREE_LEAVES.length),
        color: ''
      });
    }
    setWorldObjects(objects);

    // Initial Birds
    const initialBirds: GameObject[] = [];
    for (let i = 0; i < BIRD_COUNT; i++) {
      initialBirds.push({
        id: `bird-${i}`,
        type: EntityType.BIRD,
        pos: { x: Math.random() * WORLD_WIDTH, y: Math.random() * WORLD_HEIGHT },
        size: 12,
        variant: 0,
        color: COLORS.BIRD,
        isFlying: false,
        velocity: { x: 0, y: 0 }
      });
    }
    setBirds(initialBirds);

    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const checkCollision = (nextX: number, nextY: number, objects: GameObject[]) => {
    // Basic boundaries
    if (nextX < 60 || nextX > WORLD_WIDTH - 60 || nextY < 60 || nextY > WORLD_HEIGHT - 60) return true;

    // Object collision focused on the "base" of the object
    for (const obj of objects) {
      if (obj.type === EntityType.TREE || obj.type === EntityType.ROCK || obj.type === EntityType.BOUNDARY_ROCK) {
        const dx = nextX - obj.pos.x;
        const dy = nextY - obj.pos.y;
        
        // Perspective collision: narrow collision at the base
        const radiusX = obj.type === EntityType.TREE ? 15 : obj.size * 0.4;
        const radiusY = obj.type === EntityType.TREE ? 10 : obj.size * 0.2;
        
        // Elliptical distance for isometric-like perspective
        const dist = Math.sqrt((dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY));
        if (dist < 1) return true;
      }
    }
    return false;
  };

  // Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const update = () => {
      animationFrame.current++;
      
      setPlayerPos(prev => {
        const next = { ...prev };
        let moved = false;

        if (keysPressed.current['ArrowUp']) { next.y -= PLAYER_SPEED; moved = true; }
        if (keysPressed.current['ArrowDown']) { next.y += PLAYER_SPEED; moved = true; }
        if (keysPressed.current['ArrowLeft']) { next.x -= PLAYER_SPEED; moved = true; setFacingRight(false); }
        if (keysPressed.current['ArrowRight']) { next.x += PLAYER_SPEED; moved = true; setFacingRight(true); }

        setIsMoving(moved);

        if (moved) {
          if (!checkCollision(next.x, prev.y, worldObjects)) prev.x = next.x;
          if (!checkCollision(prev.x, next.y, worldObjects)) prev.y = next.y;

          if (animationFrame.current % 180 === 0) {
            onLocationChange(`Forest Clearing (${Math.floor(prev.x)}, ${Math.floor(prev.y)})`);
          }
        }

        return { x: prev.x, y: prev.y };
      });

      // Update Birds with flight AI
      setBirds(prevBirds => prevBirds.map(bird => {
        const dx = playerPos.x - bird.pos.x;
        const dy = (playerPos.y + 10) - bird.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (!bird.isFlying && dist < 150) {
          return { 
            ...bird, 
            isFlying: true, 
            velocity: { x: (Math.random() - 0.5) * 12, y: -4 - Math.random() * 6 } 
          };
        }

        if (bird.isFlying) {
          return {
            ...bird,
            pos: {
              x: bird.pos.x + bird.velocity!.x,
              y: bird.pos.y + bird.velocity!.y
            },
            velocity: {
              x: bird.velocity!.x * 0.99,
              y: bird.velocity!.y - 0.05
            }
          };
        }
        return bird;
      }).filter(bird => bird.pos.y > -1000));

      render();
      animationFrameId = requestAnimationFrame(update);
    };

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const screenW = canvas.width;
      const screenH = canvas.height;
      const camX = playerPos.x - screenW / 2;
      const camY = playerPos.y - screenH / 2;

      ctx.fillStyle = COLORS.GRASS;
      ctx.fillRect(0, 0, screenW, screenH);

      // Y-SORTING: Combine all visible entities and the player
      // We use the 'base' of the object for sorting
      const renderList = [
        ...worldObjects.map(o => ({ ...o, sortY: o.pos.y })),
        ...birds.map(b => ({ ...b, sortY: b.pos.y + (b.isFlying ? 300 : 0) })), // Birds fly in front of ground but sorted high
        { id: 'player', type: 'PLAYER', pos: playerPos, sortY: playerPos.y + 20 }
      ].sort((a, b) => a.sortY - b.sortY);

      renderList.forEach(obj => {
        const drawX = obj.pos.x - camX;
        const drawY = obj.pos.y - camY;
        if (drawX < -300 || drawX > screenW + 300 || drawY < -300 || drawY > screenH + 300) return;

        ctx.save();
        ctx.translate(drawX, drawY);

        if (obj.type === EntityType.TREE) {
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.beginPath();
          ctx.ellipse(0, 5, obj.size * 0.5, obj.size * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Trunk with detail
          ctx.fillStyle = COLORS.TREE_TRUNK;
          ctx.fillRect(-6, -obj.size * 0.6, 12, obj.size * 0.6);
          ctx.strokeStyle = '#3e2723';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-2, -obj.size * 0.4); ctx.lineTo(-2, -obj.size * 0.2);
          ctx.stroke();

          // Realistic Canopy
          const leafColorBase = COLORS.TREE_LEAVES[obj.variant];
          ctx.fillStyle = leafColorBase;
          
          const drawClump = (ox: number, oy: number, r: number) => {
            ctx.beginPath();
            ctx.arc(ox, oy, r, 0, Math.PI * 2);
            ctx.fill();
            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.beginPath();
            ctx.arc(ox - r*0.3, oy - r*0.3, r*0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = leafColorBase;
          };

          drawClump(0, -obj.size * 0.8, obj.size * 0.6);
          drawClump(-obj.size * 0.3, -obj.size * 0.6, obj.size * 0.4);
          drawClump(obj.size * 0.3, -obj.size * 0.6, obj.size * 0.4);

        } else if (obj.type === EntityType.ROCK || obj.type === EntityType.BOUNDARY_ROCK) {
          // Faceted Rock
          const color = obj.type === EntityType.ROCK ? COLORS.ROCK : { BASE: '#263238', SHADE: '#1a237e', LIGHT: '#455a64' };
          ctx.fillStyle = color.BASE;
          ctx.beginPath();
          ctx.moveTo(-obj.size/2, 0);
          ctx.lineTo(-obj.size/3, -obj.size/2.5);
          ctx.lineTo(obj.size/5, -obj.size/2);
          ctx.lineTo(obj.size/2, 0);
          ctx.fill();
          
          // Shading side
          ctx.fillStyle = color.SHADE;
          ctx.beginPath();
          ctx.moveTo(-obj.size/2, 0);
          ctx.lineTo(-obj.size/3, -obj.size/2.5);
          ctx.lineTo(0, -obj.size/5);
          ctx.fill();

          // Highlight
          ctx.strokeStyle = color.LIGHT;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-obj.size/3, -obj.size/2.5);
          ctx.lineTo(obj.size/5, -obj.size/2);
          ctx.stroke();

        } else if (obj.type === EntityType.BIRD) {
          ctx.fillStyle = obj.color;
          const wingSpread = Math.sin(animationFrame.current * 0.3) * (obj.isFlying ? 12 : 3);
          ctx.beginPath();
          ctx.ellipse(0, 0, 4, 3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-5, -wingSpread); ctx.lineTo(0, 0); ctx.lineTo(5, -wingSpread);
          ctx.stroke();

        } else if (obj.type === 'PLAYER') {
          // Character Implementation (simulating the sprite graphics for realism)
          ctx.save();
          if (!facingRight) ctx.scale(-1, 1);

          const frameIdx = Math.floor((animationFrame.current % 40) / 10);
          const walkIdx = Math.floor((animationFrame.current % 30) / 5);
          const bob = isMoving ? Math.abs(Math.sin(animationFrame.current * 0.2)) * 5 : 0;
          
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.ellipse(0, 22, 18, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Body (Sri Lankan Warrior style)
          ctx.translate(0, -bob);
          
          // Skin tones
          ctx.fillStyle = '#8d6e63';
          
          // Legs (animated)
          const leg1 = isMoving ? Math.sin(animationFrame.current * 0.2) * 10 : 0;
          ctx.fillRect(-8, 10 + leg1, 6, 12);
          ctx.fillRect(2, 10 - leg1, 6, 12);

          // Torso
          ctx.fillRect(-12, -15, 24, 28);
          
          // Sarong (Amude style)
          ctx.fillStyle = '#6d4c41';
          ctx.fillRect(-13, 0, 26, 12);
          ctx.strokeStyle = '#4e342e';
          ctx.strokeRect(-13, 0, 26, 12);

          // Head & Konnde
          ctx.fillStyle = '#8d6e63';
          ctx.beginPath(); ctx.arc(0, -25, 12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#212121';
          ctx.beginPath(); ctx.arc(-8, -32, 6, 0, Math.PI * 2); ctx.fill(); // Top knot

          // Sword (Kastane style)
          ctx.strokeStyle = '#757575';
          ctx.lineWidth = 3;
          ctx.save();
          ctx.translate(12, 0);
          if (isMoving) ctx.rotate(-Math.PI/4);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(5, -20, 15, -35);
          ctx.stroke();
          ctx.fillStyle = '#ffb300';
          ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); // Hilt
          ctx.restore();

          ctx.restore();
        }
        ctx.restore();
      });
    };

    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, [playerPos, worldObjects, birds, isMoving, facingRight]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full"
    />
  );
};
