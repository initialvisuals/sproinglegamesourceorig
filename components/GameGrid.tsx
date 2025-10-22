import React from 'react';
import type { Player, Enemy, Position, Item, ArrowProjectile, Direction, Bomb, Hazard, Doodad, Wizard, DamageNumber, Altar } from '../types';
import { TileType, ENEMY_STYLES, ITEM_STYLES, HAZARD_STYLES, PLAYER_DIRECTION_INDICATOR, WIZARD_CHAR, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, PLAYER_CLASSES, ALTAR_CHAR } from '../constants';

interface GameGridProps {
  map: number[][];
  player: Player;
  enemies: Enemy[];
  items: Item[];
  exit: Position | null;
  wizard: Wizard | null;
  hazards: Hazard[];
  doodads: Doodad[];
  bombs: Bomb[];
  activeBlasts: Position[];
  arrowProjectile: ArrowProjectile | null;
  onEnemyClick: (enemy: Enemy) => void;
  camera: Position;
  isTransitioning: boolean;
  isPlayerHit: boolean;
  isPlayerPoisonedFlashing: boolean;
  damageNumbers: DamageNumber[];
  altars: Altar[];
}

const TILE_SIZE = 24; // in pixels

const Tile: React.FC<{ type: number }> = React.memo(({ type }) => {
  const isWall = type === TileType.WALL;
  const text = isWall ? ' ' : '·';
  const textColor = 'rgba(255,255,255,0.1)';
  return (
    <div 
      className={`flex items-center justify-center font-mono text-xl`}
      style={{
        backgroundColor: isWall ? 'var(--color-wall)' : 'var(--color-floor)',
        border: `0.5px solid ${isWall ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)'}`
      }}
    >
        <span style={{color: textColor}}>{text}</span>
    </div>
  );
});

const PlayerHealthBar: React.FC<{ hp: number; maxHp: number }> = ({ hp, maxHp }) => {
  const percentage = Math.max(0, (hp / maxHp) * 100);
  return (
    <div className="absolute -top-2 w-full h-1 bg-red-800 rounded-full overflow-hidden">
      <div 
        className="bg-green-500 h-full transition-all duration-200"
        style={{ width: `${percentage}%`}}
      />
    </div>
  );
};


export const GameGrid: React.FC<GameGridProps> = ({ map, player, enemies, items, exit, wizard, hazards, doodads, bombs, activeBlasts, arrowProjectile, onEnemyClick, camera, isTransitioning, isPlayerHit, isPlayerPoisonedFlashing, damageNumbers, altars }) => {
  const getArrowRotation = (direction: Direction) => {
      switch(direction) {
          case 'ArrowUp': return '-rotate-90';
          case 'ArrowDown': return 'rotate-90';
          case 'ArrowLeft': return 'rotate-180';
          case 'ArrowRight': return '';
      }
  }

  const worldWidth = map[0].length * TILE_SIZE;
  const worldHeight = map.length * TILE_SIZE;
  const offsetX = camera.x * VIEWPORT_WIDTH * TILE_SIZE;
  const offsetY = camera.y * VIEWPORT_HEIGHT * TILE_SIZE;

  return (
    <div
      className="relative overflow-hidden bg-black"
      style={{
        width: VIEWPORT_WIDTH * TILE_SIZE,
        height: VIEWPORT_HEIGHT * TILE_SIZE
      }}
    >
      <div
        className="absolute"
        style={{
          width: worldWidth,
          height: worldHeight,
          transform: `translate(-${offsetX}px, -${offsetY}px)`,
          transition: isTransitioning ? 'transform 0.3s ease-in-out' : 'none',
        }}
      >
        <div 
            className="grid absolute"
            style={{
                gridTemplateColumns: `repeat(${map[0].length}, ${TILE_SIZE}px)`,
                gridTemplateRows: `repeat(${map.length}, ${TILE_SIZE}px)`,
                width: worldWidth,
                height: worldHeight,
            }}
        >
          {map.map((row, y) => row.map((tile, x) => <Tile key={`${x}-${y}`} type={tile} />))}
        </div>
        
        {doodads.map((doodad, i) => (
            <div
              key={`doodad-${i}`}
              className="absolute flex items-center justify-center text-base"
              style={{ width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${doodad.x * TILE_SIZE}px, ${doodad.y * TILE_SIZE}px)`, color: 'var(--color-doodad)' }}
            >
              {doodad.char}
            </div>
        ))}
        
        {hazards.map((hazard, i) => (
            <div
              key={`hazard-${i}`}
              className="absolute flex items-center justify-center text-lg"
              style={{ width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${hazard.x * TILE_SIZE}px, ${hazard.y * TILE_SIZE}px)` }}
            >
              {HAZARD_STYLES[hazard.type].char}
            </div>
        ))}

        {altars.map((altar, i) => (
          <div
            key={`altar-${i}`}
            className="absolute flex items-center justify-center text-xl animate-pulse"
            style={{ width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${altar.x * TILE_SIZE}px, ${altar.y * TILE_SIZE}px)`, color: 'var(--color-accent1)' }}
          >
            {ALTAR_CHAR}
          </div>
        ))}
        
        {items.map((item, i) => (
            <div
              key={`item-${i}`}
              className="absolute flex items-center justify-center text-xl animate-pulse"
              style={{ width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${item.x * TILE_SIZE}px, ${item.y * TILE_SIZE}px)` }}
            >
              {ITEM_STYLES[item.type].char}
            </div>
        ))}
        
        {bombs.map((bomb) => (
          <div
              key={`bomb-${bomb.id}`}
              className="absolute flex items-center justify-center text-xl bomb-warning"
              style={{ width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${bomb.x * TILE_SIZE}px, ${bomb.y * TILE_SIZE}px)` }}
            >
              💣
            </div>
        ))}
        
        {activeBlasts.map((blast, i) => (
          <div
              key={`blast-${i}-${blast.x}-${blast.y}`}
              className="absolute flex items-center justify-center text-3xl text-red-500"
              style={{ width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${blast.x * TILE_SIZE}px, ${blast.y * TILE_SIZE}px)` }}
            >
              🔥
            </div>
        ))}

        {exit && (
            <div
              className="absolute flex items-center justify-center text-xl animate-pulse"
              style={{ width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${exit.x * TILE_SIZE}px, ${exit.y * TILE_SIZE}px)`, color: '#82EEFD' }}
            >
              {'🌀'}
            </div>
        )}
        
        {wizard && (
            <div
              className="absolute flex items-center justify-center text-xl animate-pulse"
              style={{ width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${wizard.x * TILE_SIZE}px, ${wizard.y * TILE_SIZE}px)` }}
            >
              {WIZARD_CHAR}
            </div>
        )}

        {enemies.map(enemy => enemy.hp > 0 && (
          <div
            key={enemy.id}
            className={`absolute flex items-center justify-center text-xl transition-all duration-150 ease-out cursor-pointer hover:scale-150 ${enemy.isHit ? 'damage-flash' : ''}`}
            style={{ width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${enemy.x * TILE_SIZE}px, ${enemy.y * TILE_SIZE}px)` }}
            onClick={() => onEnemyClick(enemy)}
          >
            {ENEMY_STYLES[enemy.type].char}
          </div>
        ))}

        {arrowProjectile?.visible && (
          <div
              className={`absolute flex items-center justify-center text-xl transition-all duration-75 ease-linear ${getArrowRotation(arrowProjectile.direction)}`}
              style={{ width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${arrowProjectile.x * TILE_SIZE}px, ${arrowProjectile.y * TILE_SIZE}px)` }}
          >
              {'➡️'}
          </div>
        )}
        
        <div
          className={`absolute flex items-center justify-center text-xl transition-all duration-150 ease-out ${isPlayerHit ? 'damage-flash' : ''} ${isPlayerPoisonedFlashing ? 'poison-flash' : ''}`}
          style={{
            width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${player.x * TILE_SIZE}px, ${player.y * TILE_SIZE}px)`,
            transitionTimingFunction: 'cubic-bezier(0.1, 1.5, 0.5, 1)',
          }}
        >
          <PlayerHealthBar hp={player.hp} maxHp={player.maxHp} />
          {PLAYER_CLASSES[player.playerClass]?.char || '🤠'}
          {player.lastMoveDirection && (
            <span className="absolute text-xs" style={PLAYER_DIRECTION_INDICATOR[player.lastMoveDirection].style}>
              {PLAYER_DIRECTION_INDICATOR[player.lastMoveDirection].char}
            </span>
          )}
        </div>
        
        {damageNumbers.map(dn => (
            <div
                key={dn.id}
                className="absolute flex items-center justify-center text-lg font-bold pointer-events-none"
                style={{
                    width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${dn.x * TILE_SIZE}px, ${dn.y * TILE_SIZE}px)`,
                    color: dn.type === 'player' ? 'red' : 'white', textShadow: '1px 1px 2px black',
                    animation: 'damage-number-animation 1s ease-out forwards',
                }}
            >
                {dn.amount}
            </div>
        ))}
      </div>
    </div>
  );
};