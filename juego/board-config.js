// ============================================================
// BOARD CONFIGURATION
// Defines the 30-tile board layout and tile types
// ============================================================

window.BoardConfig = {
  TOTAL_TILES: 30,

  // Tile type definitions
  TILE_TYPES: {
    NORMAL:   'normal',
    RIDDLE:   'riddle',
    PREFER:   'prefer',
    POWER:    'power',
    TRAP:     'trap',
    LADDER:   'ladder', // bonus: advance several tiles
    SNAKE:    'snake',  // classic: go back
    START:    'start',
    END:      'end'
  },

  // Which tiles have which events (1-indexed, tile 0 = start, 29 = end)
  TILE_EVENTS: {
    0:  'start',
    3:  'riddle',
    5:  'ladder',   // +6
    7:  'trap',
    9:  'prefer',
    11: 'power',
    13: 'riddle',
    15: 'snake',    // -5
    17: 'prefer',
    18: 'trap',
    19: 'power',
    20: 'riddle',
    22: 'ladder',   // +4
    23: 'prefer',
    24: 'trap',
    25: 'power',
    26: 'riddle',
    27: 'prefer',
    28: 'snake',    // -4
    29: 'end'
  },

  // Ladder destinations (tile → jump to)
  LADDERS: {
    5:  11,
    22: 26
  },

  // Snake destinations (tile → fall to)
  SNAKES: {
    15: 10,
    28: 23
  },

  // Visual board layout — path of tiles in display order
  // Returns [col, row] for a given tile index
  getTilePosition(index, tileSize, cols, rows, offsetX, offsetY) {
    // Snake/boustrophedon path
    const row = Math.floor(index / cols);
    const col = row % 2 === 0
      ? index % cols
      : (cols - 1) - (index % cols);

    const displayRow = (rows - 1) - row;
    return {
      x: offsetX + col * tileSize + tileSize / 2,
      y: offsetY + displayRow * tileSize + tileSize / 2
    };
  },

  // Color mapping for tile types
  TILE_COLORS: {
    normal: 0x2C3E50,
    riddle: 0x8E44AD,
    prefer: 0xE67E22,
    power:  0x27AE60,
    trap:   0xC0392B,
    ladder: 0x16A085,
    snake:  0xD35400,
    start:  0x2980B9,
    end:    0xF39C12
  },

  TILE_BORDER_COLORS: {
    normal: 0x34495E,
    riddle: 0x9B59B6,
    prefer: 0xF39C12,
    power:  0x2ECC71,
    trap:   0xE74C3C,
    ladder: 0x1ABC9C,
    snake:  0xE67E22,
    start:  0x3498DB,
    end:    0xF1C40F
  },

  TILE_EMOJIS: {
    normal: '',
    riddle: '❓',
    prefer: '⚖️',
    power:  '⚡',
    trap:   '💀',
    ladder: '🪜',
    snake:  '🐍',
    start:  '🏁',
    end:    '🏆'
  }
};
