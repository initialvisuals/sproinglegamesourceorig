/**
 * @file dungeonService.ts
 * @description Handles the procedural generation of dungeon levels for the game.
 * This service creates the map layout, places rooms, carves corridors, and populates the dungeon
 * with the player, enemies, items, and other entities.
 */
import { TileType, EnemyType, ItemType, HazardType, DOODAD_CHARS, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, WORLD_SCREENS_W, WORLD_SCREENS_H, PLAYER_CLASSES } from '../constants';
import type { Player, Enemy, Position, Item, Hazard, Doodad, Wizard, Altar } from '../types';

/**
 * Represents a rectangular area on the map. Used as a blueprint for rooms.
 */
interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
}

// --- TODO: FUTURE FEATURE - CORRUPTION, ALTARS, and AUGMENTS ---
// DESIGN NOTES:
// 1.  **Altars**:
//     -   Special interactable objects (`Altar`) that will be placed in the dungeon by `placeAltars`.
//     -   When the player moves onto an Altar tile, it should trigger a modal offering a choice of powerful, run-altering upgrades (`Augments`).
// 2.  **Augments**:
//     -   These are passive buffs that last for the entire run (e.g., "Arrows pierce enemies," "Melee attacks heal you," "Enemies drop more gold").
//     -   A master list of all possible Augments will need to be created in `constants.ts`.
// 3.  **Corruption**:
//     -   This is the risk/reward mechanic. Accepting an Augment from an Altar increases the player's `corruption` stat.
//     -   Higher corruption will have negative consequences, making the game harder but allowing the player to become more powerful via Augments.
//     -   Effects can be implemented throughout the codebase:
//         -   `generateDungeon`: Higher corruption could spawn more/tougher enemies.
//         -   `processEnemyTurn`: Enemies might gain extra attack damage based on player corruption.
//         -   `GameGrid`: Visual effects could be added to represent high corruption (screen static, color shifts, etc.).
// --- END TODO ---

export const generateDungeon = (level: number) => {
  const width = VIEWPORT_WIDTH * WORLD_SCREENS_W;
  const height = VIEWPORT_HEIGHT * WORLD_SCREENS_H;
  const map: number[][] = Array.from({ length: height }, () => Array(width).fill(TileType.WALL));
  const MIN_ROOM_SIZE = 5, MAX_ROOM_SIZE = 9;

  const zoneRooms: Room[][][] = Array.from({ length: WORLD_SCREENS_H }, () => Array.from({ length: WORLD_SCREENS_W }, () => []));

  if (level === 1) {
    const fixedStartRoom: Room = { x: 2, y: 2, width: VIEWPORT_WIDTH - 4, height: 10 };
    carveRoom(map, fixedStartRoom);
    zoneRooms[0][0].push(fixedStartRoom);
  }

  for (let zoneY = 0; zoneY < WORLD_SCREENS_H; zoneY++) {
    for (let zoneX = 0; zoneX < WORLD_SCREENS_W; zoneX++) {
      if (level === 1 && zoneX === 0 && zoneY === 0) continue;
      const roomsPerZone = 3 + Math.floor(Math.random() * 3);
      const zoneXStart = zoneX * VIEWPORT_WIDTH + 1, zoneYStart = zoneY * VIEWPORT_HEIGHT + 1;
      const zoneXEnd = (zoneX + 1) * VIEWPORT_WIDTH - 2, zoneYEnd = (zoneY + 1) * VIEWPORT_HEIGHT - 2;

      for (let i = 0; i < roomsPerZone; i++) {
        const roomWidth = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
        const roomHeight = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
        const x = Math.floor(Math.random() * (zoneXEnd - zoneXStart - roomWidth)) + zoneXStart;
        const y = Math.floor(Math.random() * (zoneYEnd - zoneYStart - roomHeight)) + zoneYStart;
        const newRoom: Room = { x, y, width: roomWidth, height: roomHeight };
        
        const intersects = zoneRooms[zoneY][zoneX].some(otherRoom => 
            newRoom.x < otherRoom.x + otherRoom.width && newRoom.x + newRoom.width > otherRoom.x &&
            newRoom.y < otherRoom.y + otherRoom.height && newRoom.y + newRoom.height > otherRoom.y
        );
        
        if (!intersects) {
          carveRoom(map, newRoom);
          const currentZoneRooms = zoneRooms[zoneY][zoneX];
          if (currentZoneRooms.length > 0) connectRooms(map, currentZoneRooms[currentZoneRooms.length - 1], newRoom);
          currentZoneRooms.push(newRoom);
        }
      }
    }
  }

  for (let y = 0; y < WORLD_SCREENS_H; y++) {
    for (let x = 0; x < WORLD_SCREENS_W - 1; x++) {
      const leftZoneRooms = zoneRooms[y][x], rightZoneRooms = zoneRooms[y][x + 1];
      if (leftZoneRooms.length > 0 && rightZoneRooms.length > 0) connectRooms(map, leftZoneRooms[Math.floor(Math.random() * leftZoneRooms.length)], rightZoneRooms[Math.floor(Math.random() * rightZoneRooms.length)]);
    }
  }
  for (let y = 0; y < WORLD_SCREENS_H - 1; y++) {
    for (let x = 0; x < WORLD_SCREENS_W; x++) {
      const topZoneRooms = zoneRooms[y][x], bottomZoneRooms = zoneRooms[y + 1][x];
      if (topZoneRooms.length > 0 && bottomZoneRooms.length > 0) connectRooms(map, topZoneRooms[Math.floor(Math.random() * topZoneRooms.length)], bottomZoneRooms[Math.floor(Math.random() * bottomZoneRooms.length)]);
    }
  }

  const allRooms = zoneRooms.flat(2);
  if (allRooms.length === 0) {
    const centerRoom = { x: Math.floor(width/2) - 3, y: Math.floor(height/2) - 3, width: 6, height: 6 };
    carveRoom(map, centerRoom);
    allRooms.push(centerRoom);
  }

  const playerStartRoom = zoneRooms[0][0][0] || allRooms[0];
  const player: Player = {
      ...PLAYER_CLASSES.Knight.stats,
      x: playerStartRoom.x + Math.floor(playerStartRoom.width / 2),
      y: playerStartRoom.y + Math.floor(playerStartRoom.height / 2),
      level: 1, xp: 0, xpToNextLevel: 100, playerClass: 'Knight',
      corruption: 0, activeAugments: [],
  } as Player;

  const allFloorPositions = getFloorPositions(map);
  const SAFE_RADIUS = 5;
  const safeZone = allFloorPositions.filter(p => Math.sqrt(Math.pow(p.x - player.x, 2) + Math.pow(p.y - player.y, 2)) <= SAFE_RADIUS);

  const lastZoneY = WORLD_SCREENS_H - 1, lastZoneX = WORLD_SCREENS_W - 1;
  const exitRoom = zoneRooms[lastZoneY][lastZoneX][0] || allRooms[allRooms.length - 1];
  const exit = placeEntityInRoom<Position>(exitRoom, map, [player, ...safeZone]);

  let occupiedForSpawning: Position[] = [player, exit, ...safeZone];
  let spawnableFloorPositions = allFloorPositions;

  let wizard: Wizard | null = null;
  if (level === 1) {
      const startRoomPositions = getFloorPositionsInRoom(playerStartRoom, map);
      wizard = placeEntity<Wizard>(startRoomPositions.filter(p => p.x !== player.x || p.y !== player.y));
      if(wizard) occupiedForSpawning.push(wizard);
      const startRoomPosSet = new Set(startRoomPositions.map(p => `${p.x},${p.y}`));
      spawnableFloorPositions = allFloorPositions.filter(p => !startRoomPosSet.has(`${p.x},${p.y}`));
  } else if (level > 1 && Math.random() < 0.25) {
      wizard = placeEntity<Wizard>(spawnableFloorPositions, occupiedForSpawning);
      if (wizard) occupiedForSpawning.push(wizard);
  }
  
  const enemies = placeEnemies(spawnableFloorPositions, level, occupiedForSpawning);
  const items = placeItems(spawnableFloorPositions, level, [...occupiedForSpawning, ...enemies]);
  
  const safeHazardPositions = spawnableFloorPositions.filter(p => {
      const isHorizontalChoke = map[p.y][p.x - 1] === TileType.WALL && map[p.y][p.x + 1] === TileType.WALL;
      const isVerticalChoke = map[p.y - 1]?.[p.x] === TileType.WALL && map[p.y + 1]?.[p.x] === TileType.WALL;
      return !isHorizontalChoke && !isVerticalChoke;
  });

  const hazards = placeHazards(safeHazardPositions, level, [...occupiedForSpawning, ...enemies, ...items]);
  // TODO: Place Altars
  const altars = placeAltars(spawnableFloorPositions, level, [...occupiedForSpawning, ...enemies, ...items, ...hazards]);
  const allEntities = [player, exit, wizard, ...enemies, ...items, ...hazards, ...altars].filter(Boolean) as Position[];
  const doodads = placeDoodads(allFloorPositions, level, allEntities);
  
  // FIX: Explicitly type the Set to Set<string> to match the GameState type.
  return { map, player, enemies, items, exit, wizard, hazards, doodads, altars, bombs: [], pickedUpItems: new Set<string>(), camera: { x: 0, y: 0 }, activeBlasts: [], damageNumbers: [] };
};

const carveRoom = (map: number[][], room: Room) => {
  for (let y = room.y; y < room.y + room.height; y++) {
    for (let x = room.x; x < room.x + room.width; x++) {
        const isCorner = (x === room.x || x === room.x + room.width - 1) && (y === room.y || y === room.y + room.height - 1);
        if (isCorner && Math.random() < 0.4) continue;
        if(map[y]?.[x] !== undefined) map[y][x] = TileType.FLOOR;
    }
  }
};

const connectRooms = (map: number[][], roomA: Room, roomB: Room) => {
  const centerA = { x: Math.floor(roomA.x + roomA.width / 2), y: Math.floor(roomA.y + roomA.height / 2) };
  const centerB = { x: Math.floor(roomB.x + roomB.width / 2), y: Math.floor(roomB.y + roomB.height / 2) };
  let cur = { ...centerA };

  const carve = (p: Position) => { if(map[p.y]?.[p.x] !== undefined) map[p.y][p.x] = TileType.FLOOR; };

  if (Math.random() > 0.5) {
    while (cur.x !== centerB.x) { carve(cur); cur.x += Math.sign(centerB.x - cur.x); }
    while (cur.y !== centerB.y) { carve(cur); cur.y += Math.sign(centerB.y - cur.y); }
  } else {
    while (cur.y !== centerB.y) { carve(cur); cur.y += Math.sign(centerB.y - cur.y); }
    while (cur.x !== centerB.x) { carve(cur); cur.x += Math.sign(centerB.x - cur.x); }
  }
  carve(centerB);
};

const getFloorPositions = (map: number[][]): Position[] => {
  const positions: Position[] = [];
  for (let y = 1; y < map.length - 1; y++) {
    for (let x = 1; x < map[0].length - 1; x++) {
      if (map[y][x] === TileType.FLOOR) positions.push({ x, y });
    }
  }
  return positions;
};

const getFloorPositionsInRoom = (room: Room, map: number[][]): Position[] => {
    const positions: Position[] = [];
    for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
            if (map[y]?.[x] === TileType.FLOOR) positions.push({ x, y });
        }
    }
    return positions;
};

const placeEntityInRoom = <T extends Position>(room: Room, map: number[][], occupied: Position[] = []): T => {
    const positions = getFloorPositionsInRoom(room, map);
    return placeEntity(positions, occupied);
};

const placeEntity = <T extends Position>(floorPositions: Position[], occupied: (Position | null)[] = []): T => {
  const occupiedSet = new Set(occupied.filter(Boolean).map(o => `${o.x},${o.y}`));
  const availablePositions = floorPositions.filter(p => !occupiedSet.has(`${p.x},${p.y}`));
  const pos = availablePositions.length > 0 ? availablePositions[Math.floor(Math.random() * availablePositions.length)] : floorPositions[Math.floor(Math.random() * floorPositions.length)];
  return (pos || { x: 1, y: 1 }) as T;
};

const placeItems = (floorPositions: Position[], level: number, occupiedInitial: Position[]): Item[] => {
    const items: Item[] = [];
    if (floorPositions.length === 0) return items;
    const numItems = (2 + Math.floor(level / 2) + Math.floor(Math.random() * 2)) * (WORLD_SCREENS_W * WORLD_SCREENS_H);
    let occupied: Position[] = [...occupiedInitial];

    for (let i = 0; i < numItems; i++) {
        const pos = placeEntity<Position>(floorPositions, occupied);
        occupied.push(pos);

        const roll = Math.random();
        let type: ItemType;
        if (roll < 0.35) type = ItemType.POTION; 
        else if (roll < 0.60) type = ItemType.GOLD;
        else if (roll < 0.80) type = ItemType.ARROWS;
        else if (roll < 0.95) type = ItemType.BOMB;
        else type = ItemType.ANTIDOTE;

        items.push({ ...pos, type });
    }
    return items;
};

const placeEnemies = (floorPositions: Position[], level: number, occupiedInitial: Position[]): Enemy[] => {
    const enemies: Enemy[] = [];
    if (floorPositions.length === 0) return enemies;
    const numEnemies = Math.min(floorPositions.length / 4, (2 + level) * (WORLD_SCREENS_W * WORLD_SCREENS_H));
    let occupied: Position[] = [...occupiedInitial];
    let enemyTypes = [EnemyType.GOBLIN, EnemyType.SLIME, EnemyType.SKELETON];
    if (level >= 2) enemyTypes.push(EnemyType.SPIDER);

    for (let i = 0; i < numEnemies; i++) {
        const pos = placeEntity<Position>(floorPositions, occupied);
        occupied.push(pos);
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        let hp, attack;
        const attackScaling = Math.floor(level * 1.5);
        switch(type) {
            case EnemyType.SLIME: hp = 10 + level * 2; attack = 2 + attackScaling; break;
            case EnemyType.SKELETON: hp = 15 + level * 3; attack = 4 + attackScaling; break;
            case EnemyType.SPIDER: hp = 8 + level * 2; attack = 3 + attackScaling; break;
            case EnemyType.GOBLIN: default: hp = 12 + level * 2; attack = 3 + attackScaling; break;
        }
        enemies.push({ ...pos, id: i, type, hp, attack, isHit: false });
    }
    return enemies;
};

const placeHazards = (floorPositions: Position[], level: number, occupied: (Position | null)[]): Hazard[] => {
    const hazards: Hazard[] = [];
    if (level < 2 || floorPositions.length === 0) return hazards;
    const numHazards = (Math.floor(level / 2) + Math.floor(Math.random() * 3)) * (WORLD_SCREENS_W * WORLD_SCREENS_H);
    let occupiedWithHazards: (Position | null)[] = [...occupied];
    for (let i = 0; i < numHazards; i++) {
        const pos = placeEntity<Position>(floorPositions, occupiedWithHazards);
        if (pos) {
            const type = Math.random() < 0.1 ? HazardType.PIT : Math.random() < 0.5 ? HazardType.FIRE : HazardType.SPIKES;
            hazards.push({ ...pos, type });
            occupiedWithHazards.push(pos);
        }
    }
    return hazards;
};

// TODO: Implement Altar placement logic.
const placeAltars = (floorPositions: Position[], level: number, occupied: (Position | null)[]): Altar[] => {
    const altars: Altar[] = [];
    if (level < 2 || floorPositions.length === 0) return altars; // Altars start appearing on level 2.
    // Place one altar per world screen, for example.
    const numAltars = WORLD_SCREENS_W * WORLD_SCREENS_H;
    let occupiedWithAltars = [...occupied];

    for(let i=0; i < numAltars; i++) {
        const pos = placeEntity<Position>(floorPositions, occupiedWithAltars);
        if (pos) {
            // Try to place it in a dead end or a special spot if we can identify one.
            // For now, any random floor position is fine.
            altars.push(pos);
            occupiedWithAltars.push(pos);
        }
    }
    return altars;
}

const placeDoodads = (floorPositions: Position[], level: number, occupied: (Position | null)[]): Doodad[] => {
    const doodads: Doodad[] = [];
    if (floorPositions.length === 0) return doodads;
    const numDoodads = Math.floor(Math.random() * 8) * (WORLD_SCREENS_W * WORLD_SCREENS_H);
    let occupiedWithDoodads = [...occupied];
    for (let i=0; i < numDoodads; i++) {
        const pos = placeEntity<Position>(floorPositions, occupiedWithDoodads);
        if (pos) {
            const char = DOODAD_CHARS[Math.floor(Math.random() * DOODAD_CHARS.length)];
            doodads.push({ ...pos, char });
            occupiedWithDoodads.push(pos);
        }
    }
    return doodads;
}