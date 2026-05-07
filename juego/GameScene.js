// ============================================================
// GAME SCENE — Core gameplay
// ============================================================

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  // ── Phaser lifecycle ──────────────────────────────────────

  init(data) {
    this.playerName = data.playerName || 'Player';
    this.userProfile = data.profile || null;
    this.matchId = null;
    this.xpEarned = 0;
  }

  create() {
    const { width, height } = this.scale;

    this._initState();
    this._buildBackground(width, height);
    this._buildBoard(width, height);
    this._buildTokens();
    this._buildHUD(width, height);
    this._buildDiceUI(width, height);

    this.uiScene = this.scene.get('UIScene');
    this.scene.launch('UIScene', { gameScene: this });

    this._saveMatch();
    this._updateTurnDisplay();
    this._showMessage(`🎲 Game Start! ${this.playerName} goes first!`, '#FFD700', 2500);
  }

  // ── State Initialization ──────────────────────────────────

  _initState() {
    this.players = [
      {
        id: 'human',
        name: this.playerName,
        position: 0,
        powers: [],
        frozen: false,
        skipNextTurn: false,
        doubleNextRoll: false,
        shield: false,
        color: 0xFF6B6B,
        colorHex: '#FF6B6B',
        emoji: '🔴'
      },
      {
        id: 'ai',
        name: '🤖 Chaos Bot',
        position: 0,
        powers: [],
        frozen: false,
        skipNextTurn: false,
        doubleNextRoll: false,
        shield: false,
        color: 0x3498DB,
        colorHex: '#3498DB',
        emoji: '🔵'
      }
    ];
    this.currentPlayerIndex = 0;
    this.isAnimating = false;
    this.gameOver = false;
    this.boardCols = 6;
    this.boardRows = 5;
    this.tileSize = 80;
  }

  // ── Board Building ────────────────────────────────────────

  _buildBackground(width, height) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0D0D1A, 0x0D0D1A, 0x1A0D2E, 0x1A0D2E, 1);
    bg.fillRect(0, 0, width, height);

    // Subtle grid pattern
    const grid = this.add.graphics();
    grid.lineStyle(1, 0xFFFFFF, 0.03);
    for (let x = 0; x < width; x += 40) { grid.moveTo(x, 0); grid.lineTo(x, height); }
    for (let y = 0; y < height; y += 40) { grid.moveTo(0, y); grid.lineTo(width, y); }
    grid.strokePath();
  }

  _buildBoard(width, height) {
    const { TOTAL_TILES, TILE_EVENTS, TILE_COLORS, TILE_BORDER_COLORS, TILE_EMOJIS } = BoardConfig;
    const cols = this.boardCols;
    const rows = this.boardRows;
    const tileSize = this.tileSize;

    // Center the board
    const boardW = cols * tileSize;
    const boardH = rows * tileSize;
    this.boardOffsetX = (width - boardW) / 2;
    this.boardOffsetY = (height - boardH) / 2 - 10;

    this.tilePositions = [];
    this.tileObjects = [];

    // Board shadow
    const shadow = this.add.rectangle(
      this.boardOffsetX + boardW / 2 + 6,
      this.boardOffsetY + boardH / 2 + 6,
      boardW + 16, boardH + 16, 0x000000, 0.5
    );

    // Board background
    this.add.rectangle(
      this.boardOffsetX + boardW / 2,
      this.boardOffsetY + boardH / 2,
      boardW + 12, boardH + 12, 0x1E1E3A, 1
    ).setStrokeStyle(3, 0x4A4A8A);

    for (let i = 0; i < TOTAL_TILES; i++) {
      const pos = BoardConfig.getTilePosition(i, tileSize, cols, rows, this.boardOffsetX, this.boardOffsetY);
      this.tilePositions.push(pos);

      const eventType = TILE_EVENTS[i] || 'normal';
      const color = TILE_COLORS[eventType] || TILE_COLORS.normal;
      const borderColor = TILE_BORDER_COLORS[eventType] || TILE_BORDER_COLORS.normal;
      const emoji = TILE_EMOJIS[eventType] || '';

      // Tile body
      const tile = this.add.rectangle(pos.x, pos.y, tileSize - 4, tileSize - 4, color, 0.85)
        .setStrokeStyle(2, borderColor);

      // Tile number
      this.add.text(pos.x - tileSize / 2 + 6, pos.y - tileSize / 2 + 4, `${i + 1}`, {
        fontFamily: '"Nunito", sans-serif',
        fontSize: '10px',
        color: '#FFFFFF',
        alpha: 0.6
      });

      // Tile emoji
      if (emoji) {
        this.add.text(pos.x, pos.y, emoji, {
          fontSize: '22px'
        }).setOrigin(0.5);
      }

      // Glow effect for special tiles
      if (eventType !== 'normal' && eventType !== 'start') {
        this.tweens.add({
          targets: tile,
          alpha: 0.6,
          duration: Phaser.Math.Between(1200, 2000),
          yoyo: true,
          repeat: -1,
          delay: Phaser.Math.Between(0, 1000)
        });
      }

      this.tileObjects.push({ tile, eventType, pos });
    }

    // Draw ladders and snakes
    this._drawConnectors();
  }

  _drawConnectors() {
    const g = this.add.graphics();

    // Ladders (green)
    Object.entries(BoardConfig.LADDERS).forEach(([from, to]) => {
      const f = this.tilePositions[parseInt(from)];
      const t = this.tilePositions[parseInt(to)];
      g.lineStyle(4, 0x2ECC71, 0.7);
      g.beginPath();
      g.moveTo(f.x, f.y);
      g.lineTo(t.x, t.y);
      g.strokePath();
      // Arrow head
      this.add.text(t.x, t.y - 20, '🪜', { fontSize: '16px' }).setOrigin(0.5);
    });

    // Snakes (red)
    Object.entries(BoardConfig.SNAKES).forEach(([from, to]) => {
      const f = this.tilePositions[parseInt(from)];
      const t = this.tilePositions[parseInt(to)];
      g.lineStyle(4, 0xE74C3C, 0.7);
      g.beginPath();
      g.moveTo(f.x, f.y);
      // Curved snake path
      g.lineTo(t.x, t.y);
      g.strokePath();
      this.add.text(f.x, f.y - 20, '🐍', { fontSize: '16px' }).setOrigin(0.5);
    });
  }

  _buildTokens() {
    this.tokens = this.players.map((player, i) => {
      const pos = this.tilePositions[0];
      const offset = i === 0 ? -14 : 14;

      const token = this.add.circle(pos.x + offset, pos.y, 14, player.color)
        .setStrokeStyle(3, 0xFFFFFF)
        .setDepth(5);

      const label = this.add.text(pos.x + offset, pos.y, player.emoji, {
        fontSize: '14px'
      }).setOrigin(0.5).setDepth(6);

      // Pulsing glow
      this.tweens.add({
        targets: token,
        scaleX: 1.15, scaleY: 1.15,
        duration: 800,
        yoyo: true,
        repeat: -1,
        delay: i * 400,
        ease: 'Sine.easeInOut'
      });

      return { token, label, player };
    });
  }

  _buildHUD(width, height) {
    const hudY = 12;

    // Player HUD
    this.playerHUD = this.add.text(20, hudY, '', {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '18px',
      color: '#FF6B6B'
    }).setDepth(10);

    // AI HUD
    this.aiHUD = this.add.text(width - 20, hudY, '', {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '18px',
      color: '#3498DB'
    }).setOrigin(1, 0).setDepth(10);

    // Turn indicator
    this.turnText = this.add.text(width / 2, hudY, '', {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '20px',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5, 0).setDepth(10);

    // XP display
    this.xpDisplay = this.add.text(20, height - 30, `⭐ XP: ${this.xpEarned}`, {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '14px',
      color: '#FFD700'
    }).setDepth(10);

    // Powers display
    this.powersDisplay = this.add.text(width / 2, height - 30, 'Powers: none', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '13px',
      color: '#2ECC71'
    }).setOrigin(0.5, 1).setDepth(10);

    this._updateHUD();
  }

  _buildDiceUI(width, height) {
    const diceY = height - 68;
    const diceX = width - 90;

    // Dice background
    this.diceBg = this.add.rectangle(diceX, diceY, 72, 72, 0x1A1A2E)
      .setStrokeStyle(3, 0xFFD700)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);

    this.diceText = this.add.text(diceX, diceY, '🎲', {
      fontSize: '36px'
    }).setOrigin(0.5).setDepth(11);

    this.rollLabel = this.add.text(diceX, diceY + 44, 'ROLL', {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '14px',
      color: '#FFD700'
    }).setOrigin(0.5).setDepth(11);

    this.diceBg.on('pointerdown', () => this._onRollDice());
    this.diceBg.on('pointerover', () => {
      this.diceBg.setFillStyle(0x2D2D4E);
      this.tweens.add({ targets: [this.diceBg, this.diceText], scaleX: 1.1, scaleY: 1.1, duration: 100 });
    });
    this.diceBg.on('pointerout', () => {
      this.diceBg.setFillStyle(0x1A1A2E);
      this.tweens.add({ targets: [this.diceBg, this.diceText], scaleX: 1, scaleY: 1, duration: 100 });
    });
  }

  // ── HUD Updates ───────────────────────────────────────────

  _updateHUD() {
    const human = this.players[0];
    const ai = this.players[1];

    this.playerHUD.setText(
      `${human.emoji} ${human.name}\nTile: ${human.position + 1}/30`
    );
    this.aiHUD.setText(
      `${ai.name} ${ai.emoji}\nTile: ${ai.position + 1}/30`
    );
    this.xpDisplay.setText(`⭐ XP: ${this.xpEarned}`);

    const powers = human.powers;
    this.powersDisplay.setText(
      powers.length > 0 ? `Powers: ${powers.map(p => p.icon).join(' ')}` : 'No powers'
    );
  }

  _updateTurnDisplay() {
    const current = this.players[this.currentPlayerIndex];
    this.turnText.setText(
      this.currentPlayerIndex === 0
        ? `⚔️ YOUR TURN`
        : `🤖 AI's Turn...`
    );
    this.turnText.setColor(current.colorHex);
  }

  // ── Dice Roll ────────────────────────────────────────────

  _onRollDice() {
    if (this.isAnimating || this.gameOver) return;
    if (this.currentPlayerIndex !== 0) return; // Not player's turn

    AudioManager.playDiceRoll();
    this._animateDiceRoll(() => {
      const roll = this._rollDice();
      this._executeRoll(0, roll);
    });
  }

  _rollDice() {
    return Phaser.Math.Between(1, 6);
  }

  _animateDiceRoll(callback) {
    this.isAnimating = true;
    this.diceBg.disableInteractive();
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    let count = 0;
    const maxCount = 10;
    const interval = this.time.addEvent({
      delay: 80,
      repeat: maxCount - 1,
      callback: () => {
        this.diceText.setText(faces[Phaser.Math.Between(0, 5)]);
        count++;
        if (count >= maxCount) {
          this.time.delayedCall(100, callback);
        }
      }
    });
  }

  _showDiceResult(roll) {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    this.diceText.setText(faces[roll - 1]);
  }

  // ── Turn Execution ────────────────────────────────────────

  _executeRoll(playerIndex, roll) {
    const player = this.players[playerIndex];

    // Double roll power
    let finalRoll = roll;
    if (player.doubleNextRoll) {
      finalRoll = roll * 2;
      player.doubleNextRoll = false;
      this._showMessage(`⚡ DOUBLE ROLL! Moving ${finalRoll} tiles!`, '#FFD700', 1500);
    }

    this._showDiceResult(roll);
    this._showMessage(`🎲 Rolled ${roll}${finalRoll !== roll ? ` → ${finalRoll}!` : '!'}`, player.colorHex, 1200);

    const newPos = Math.min(player.position + finalRoll, BoardConfig.TOTAL_TILES - 1);
    this._moveToken(playerIndex, newPos, () => {
      // Check for win
      if (newPos >= BoardConfig.TOTAL_TILES - 1) {
        this._triggerWin(playerIndex);
        return;
      }

      // Check for ladder/snake
      const ladder = BoardConfig.LADDERS[newPos];
      const snake = BoardConfig.SNAKES[newPos];

      if (ladder !== undefined) {
        this._showMessage('🪜 LADDER! Climbing up!', '#2ECC71', 1200);
        this.time.delayedCall(800, () => {
          this._moveToken(playerIndex, ladder, () => this._triggerTileEvent(playerIndex));
        });
      } else if (snake !== undefined) {
        AudioManager.playTrap();
        this._showMessage('🐍 SNAKE! Sliding down!', '#E74C3C', 1200);
        this.time.delayedCall(800, () => {
          this._moveToken(playerIndex, snake, () => this._triggerTileEvent(playerIndex));
        });
      } else {
        this._triggerTileEvent(playerIndex);
      }
    });
  }

  // ── Token Movement ────────────────────────────────────────

  _moveToken(playerIndex, newPosition, onComplete) {
    const player = this.players[playerIndex];
    const tokenObj = this.tokens[playerIndex];
    const offset = playerIndex === 0 ? -14 : 14;

    const targetPos = this.tilePositions[newPosition];
    const steps = this._getPath(player.position, newPosition);

    player.position = newPosition;
    this._animateAlongPath(tokenObj, steps, offset, () => {
      this._updateHUD();
      this.isAnimating = false;
      onComplete && onComplete();
    });
  }

  _getPath(from, to) {
    const path = [];
    if (to > from) {
      for (let i = from + 1; i <= to; i++) path.push(this.tilePositions[i]);
    } else {
      for (let i = from - 1; i >= to; i--) path.push(this.tilePositions[i]);
    }
    return path;
  }

  _animateAlongPath(tokenObj, path, offset, onComplete) {
    if (path.length === 0) { onComplete && onComplete(); return; }

    let step = 0;
    const moveStep = () => {
      if (step >= path.length) { onComplete && onComplete(); return; }
      const pos = path[step];
      AudioManager.playMove();
      this.tweens.add({
        targets: [tokenObj.token, tokenObj.label],
        x: pos.x + offset,
        y: pos.y,
        duration: 180,
        ease: 'Power1',
        onComplete: () => { step++; moveStep(); }
      });
    };
    moveStep();
  }

  // ── Tile Events ───────────────────────────────────────────

  _triggerTileEvent(playerIndex) {
    const player = this.players[playerIndex];
    const tileObj = this.tileObjects[player.position];
    const eventType = tileObj ? tileObj.eventType : 'normal';
    const isHuman = playerIndex === 0;

    switch (eventType) {
      case 'riddle':
        this._handleRiddleEvent(playerIndex, isHuman);
        break;
      case 'prefer':
        this._handlePreferEvent(playerIndex, isHuman);
        break;
      case 'power':
        this._handlePowerEvent(playerIndex, isHuman);
        break;
      case 'trap':
        this._handleTrapEvent(playerIndex, isHuman);
        break;
      default:
        this._endTurn(playerIndex);
        break;
    }
  }

  _handleRiddleEvent(playerIndex, isHuman) {
    const player = this.players[playerIndex];
    const riddles = window.GAME_QUESTIONS.filter(q => q.type === 'riddle');
    const riddle = riddles[Phaser.Math.Between(0, riddles.length - 1)];

    AudioManager.playPrefer();

    if (isHuman) {
      // Show riddle UI
      this.events.emit('showRiddle', {
        riddle,
        onAnswer: (correct) => {
          if (correct) {
            AudioManager.playCorrect();
            this._addXP(50);
            this._showMessage(`✅ Correct! Advance ${riddle.reward} tiles!`, '#2ECC71', 1500);
            const newPos = Math.min(player.position + riddle.reward, BoardConfig.TOTAL_TILES - 1);
            this.time.delayedCall(1000, () => this._moveToken(playerIndex, newPos, () => this._endTurn(playerIndex)));
          } else {
            AudioManager.playWrong();
            this._showMessage(`❌ Wrong! Go back ${Math.abs(riddle.penalty)} tiles!`, '#E74C3C', 1500);
            const newPos = Math.max(player.position + riddle.penalty, 0);
            this.time.delayedCall(1000, () => this._moveToken(playerIndex, newPos, () => this._endTurn(playerIndex)));
          }
        }
      });
    } else {
      // AI: 60% chance correct
      const correct = Math.random() < 0.6;
      this.time.delayedCall(1200, () => {
        if (correct) {
          this._showMessage(`🤖 AI answered correctly! Advances!`, '#3498DB', 1500);
          const newPos = Math.min(player.position + riddle.reward, BoardConfig.TOTAL_TILES - 1);
          this.time.delayedCall(1000, () => this._moveToken(playerIndex, newPos, () => this._endTurn(playerIndex)));
        } else {
          this._showMessage(`🤖 AI got it wrong! Falls back!`, '#E74C3C', 1500);
          const newPos = Math.max(player.position + riddle.penalty, 0);
          this.time.delayedCall(1000, () => this._moveToken(playerIndex, newPos, () => this._endTurn(playerIndex)));
        }
      });
    }
  }

  _handlePreferEvent(playerIndex, isHuman) {
    const player = this.players[playerIndex];
    const preferqs = window.GAME_QUESTIONS.filter(q => q.type === 'prefer');
    const q = preferqs[Phaser.Math.Between(0, preferqs.length - 1)];

    AudioManager.playPrefer();

    if (isHuman) {
      this.events.emit('showPrefer', {
        question: q,
        onChoice: (optionIndex) => {
          this._applyPreferEffect(playerIndex, q.options[optionIndex].effect, () => this._endTurn(playerIndex));
        }
      });
    } else {
      // AI picks randomly
      const choice = Phaser.Math.Between(0, q.options.length - 1);
      this._showMessage(`🤖 AI chose: ${q.options[choice].text.substring(0, 30)}...`, '#3498DB', 1800);
      this.time.delayedCall(1200, () => {
        this._applyPreferEffect(playerIndex, q.options[choice].effect, () => this._endTurn(playerIndex));
      });
    }
  }

  _applyPreferEffect(playerIndex, effect, onDone) {
    const player = this.players[playerIndex];
    const other = this.players[1 - playerIndex];

    switch (effect.type) {
      case 'advance':
        const newPos = Math.max(0, Math.min(player.position + effect.amount, BoardConfig.TOTAL_TILES - 1));
        this._showMessage(`${effect.amount > 0 ? '⬆️ Moving forward!' : '⬇️ Going back!'}`, effect.amount > 0 ? '#2ECC71' : '#E74C3C', 1200);
        this.time.delayedCall(800, () => this._moveToken(playerIndex, newPos, onDone));
        break;

      case 'gamble':
        const won = Math.random() < 0.5;
        const move = won ? effect.win : effect.lose;
        this._showMessage(won ? `🎰 JACKPOT! +${effect.win} tiles!` : `💸 No luck! ${effect.lose} tiles!`, won ? '#FFD700' : '#E74C3C', 1500);
        this.time.delayedCall(800, () => {
          const gPos = Math.max(0, Math.min(player.position + move, BoardConfig.TOTAL_TILES - 1));
          this._moveToken(playerIndex, gPos, onDone);
        });
        break;

      case 'extra_roll':
        this._showMessage('🎲 Extra roll incoming!', '#FFD700', 1000);
        this.time.delayedCall(800, () => {
          const roll = this._rollDice();
          this._executeRoll(playerIndex, roll);
          // onDone called inside executeRoll chain
        });
        break;

      case 'double_roll':
        this._showMessage('⚡ Next roll will be doubled!', '#FFD700', 1500);
        player.doubleNextRoll = true;
        this.time.delayedCall(800, onDone);
        break;

      case 'teleport':
        const tileTarget = Math.min(effect.tile - 1, BoardConfig.TOTAL_TILES - 1);
        this._showMessage(`🌀 Teleporting to tile ${effect.tile}!`, '#9B59B6', 1200);
        this.time.delayedCall(800, () => this._moveToken(playerIndex, tileTarget, onDone));
        break;

      case 'swap':
        this._showMessage('🔄 Swapping positions!', '#9B59B6', 1200);
        AudioManager.playPower();
        const pPos = player.position;
        const oPos = other.position;
        this.time.delayedCall(800, () => {
          this._moveToken(playerIndex, oPos, () => {
            this._moveToken(1 - playerIndex, pPos, onDone);
          });
        });
        break;

      case 'random_power':
        this._grantRandomPower(playerIndex);
        this.time.delayedCall(800, onDone);
        break;

      case 'power_skip':
        player.skipNextTurn = true;
        this._grantPowerById(playerIndex, effect.power);
        this._showMessage('🛡️ Got a Shield! But skip next turn.', '#3498DB', 1500);
        this.time.delayedCall(800, onDone);
        break;

      default:
        onDone && onDone();
    }
    this._updateHUD();
  }

  _handlePowerEvent(playerIndex, isHuman) {
    AudioManager.playPower();
    this._addXP(30);
    this._grantRandomPower(playerIndex);
    this.time.delayedCall(1500, () => this._endTurn(playerIndex));
  }

  _handleTrapEvent(playerIndex, isHuman) {
    const player = this.players[playerIndex];

    // Check for shield
    if (player.shield) {
      player.shield = false;
      this._showMessage('🛡️ Shield blocked the trap!', '#3498DB', 1500);
      this.time.delayedCall(1200, () => this._endTurn(playerIndex));
      return;
    }

    const traps = window.GAME_TRAPS;
    const trap = traps[Phaser.Math.Between(0, traps.length - 1)];
    AudioManager.playTrap();
    this._showMessage(`${trap.name}\n${trap.description}`, '#E74C3C', 2000);

    this.time.delayedCall(1200, () => {
      this._applyTrapEffect(playerIndex, trap.effect, () => this._endTurn(playerIndex));
    });
  }

  _applyTrapEffect(playerIndex, effect, onDone) {
    const player = this.players[playerIndex];
    switch (effect.type) {
      case 'advance':
        const newPos = Math.max(0, player.position + effect.amount);
        this._moveToken(playerIndex, newPos, onDone);
        break;
      case 'lose_turn':
        player.skipNextTurn = true;
        this._showMessage("😴 Turn skipped next round!", '#E67E22', 1200);
        this.time.delayedCall(800, onDone);
        break;
      case 'random_teleport':
        const randPos = Phaser.Math.Between(0, Math.max(player.position - 5, 0));
        this._showMessage(`🌪️ Teleported to tile ${randPos + 1}!`, '#E67E22', 1200);
        this._moveToken(playerIndex, randPos, onDone);
        break;
      default:
        onDone && onDone();
    }
    this._updateHUD();
  }

  // ── Powers ────────────────────────────────────────────────

  _grantRandomPower(playerIndex) {
    const powers = window.GAME_POWERS;
    const power = powers[Phaser.Math.Between(0, powers.length - 1)];
    this._grantPowerById(playerIndex, power.id);
  }

  _grantPowerById(playerIndex, powerId) {
    const power = window.GAME_POWERS.find(p => p.id === powerId);
    if (!power) return;
    const player = this.players[playerIndex];
    player.powers.push(power);
    this._showMessage(`${power.icon} Got power: ${power.name}!`, '#2ECC71', 1800);
    AudioManager.playPower();
    this._updateHUD();

    if (playerIndex === 0) {
      this.events.emit('powersUpdated', player.powers);
    }
  }

  usePower(powerIndex) {
    const player = this.players[0];
    if (powerIndex >= player.powers.length || this.isAnimating || this.gameOver) return;
    const power = player.powers[powerIndex];

    AudioManager.playPower();
    this._applyPower(0, power);
    player.powers.splice(powerIndex, 1);
    this.events.emit('powersUpdated', player.powers);
    this._updateHUD();
  }

  _applyPower(playerIndex, power) {
    const player = this.players[playerIndex];
    const other = this.players[1 - playerIndex];

    switch (power.id) {
      case 'double_roll':
        player.doubleNextRoll = true;
        this._showMessage('⚡ Double Roll activated!', '#FFD700', 1500);
        break;
      case 'push_back':
        const pushPos = Math.max(other.position - 4, 0);
        this._showMessage('💨 Pushed AI back 4 tiles!', '#FF6B6B', 1500);
        this._moveToken(1, pushPos, () => {});
        break;
      case 'swap':
        const pP = player.position; const oP = other.position;
        this._showMessage('🔄 Swapped positions with AI!', '#9B59B6', 1500);
        player.position = oP; other.position = pP;
        this._teleportToken(0, oP);
        this._teleportToken(1, pP);
        break;
      case 'shield':
        player.shield = true;
        this._showMessage('🛡️ Shield active!', '#3498DB', 1500);
        break;
      case 'skip_ai':
        other.skipNextTurn = true;
        this._showMessage("😴 AI's next turn skipped!", '#1ABC9C', 1500);
        break;
      case 'teleport_forward':
        const fwdPos = Math.min(player.position + 8, BoardConfig.TOTAL_TILES - 1);
        this._showMessage('🌀 Warped 8 tiles forward!', '#E67E22', 1500);
        this._moveToken(playerIndex, fwdPos, () => {});
        break;
    }
  }

  _teleportToken(playerIndex, position) {
    const tokenObj = this.tokens[playerIndex];
    const pos = this.tilePositions[position];
    const offset = playerIndex === 0 ? -14 : 14;
    tokenObj.token.setPosition(pos.x + offset, pos.y);
    tokenObj.label.setPosition(pos.x + offset, pos.y);
    this.players[playerIndex].position = position;
    this._updateHUD();
  }

  // ── Turn Management ───────────────────────────────────────

  _endTurn(playerIndex) {
    this._saveMatchState();
    this._updateHUD();

    if (this.gameOver) return;

    // Switch to next player
    const nextIndex = 1 - playerIndex;
    this.currentPlayerIndex = nextIndex;
    this._updateTurnDisplay();

    // Re-enable dice for human
    if (nextIndex === 0) {
      this.diceBg.setInteractive({ useHandCursor: true });
      this.isAnimating = false;
    } else {
      // AI turn
      this.time.delayedCall(1000, () => this._runAITurn());
    }
  }

  _runAITurn() {
    const ai = this.players[1];

    if (ai.skipNextTurn) {
      ai.skipNextTurn = false;
      this._showMessage("🤖 AI's turn skipped!", '#3498DB', 1500);
      this.time.delayedCall(1500, () => this._endTurn(1));
      return;
    }

    // Use a power if available (30% chance)
    if (ai.powers.length > 0 && Math.random() < 0.3) {
      const power = ai.powers.shift();
      this._applyPower(1, power);
      this.time.delayedCall(1200, () => this._doAIRoll());
    } else {
      this._doAIRoll();
    }
  }

  _doAIRoll() {
    this.isAnimating = true;
    AudioManager.playDiceRoll();
    this._animateDiceRoll(() => {
      const roll = this._rollDice();
      this._executeRoll(1, roll);
    });
  }

  // ── Win/Lose ──────────────────────────────────────────────

  _triggerWin(playerIndex) {
    this.gameOver = true;
    const winner = this.players[playerIndex];
    const isHuman = playerIndex === 0;

    if (isHuman) {
      AudioManager.playWin();
      this._addXP(200);
      if (SupabaseService.currentUser) {
        SupabaseService.recordWin(SupabaseService.currentUser.id);
        SupabaseService.updateUserXP(SupabaseService.currentUser.id, this.xpEarned);
      }
    } else {
      AudioManager.playLose();
    }

    this.time.delayedCall(500, () => {
      this.scene.start('GameOverScene', {
        winner: winner.name,
        isHuman,
        xpEarned: this.xpEarned,
        playerName: this.playerName
      });
    });
  }

  // ── Helpers ───────────────────────────────────────────────

  _showMessage(text, color = '#FFFFFF', duration = 2000) {
    const { width, height } = this.scale;
    const msg = this.add.text(width / 2, height / 2 - 120, text, {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '20px',
      color,
      stroke: '#000',
      strokeThickness: 4,
      align: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 16, y: 8 },
      wordWrap: { width: 380 }
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({ targets: msg, y: msg.y - 10, alpha: 0, duration, delay: duration * 0.6, ease: 'Power1', onComplete: () => msg.destroy() });
  }

  _addXP(amount) {
    this.xpEarned += amount;
    this._updateHUD();
    // Float XP text
    const { width } = this.scale;
    const xpText = this.add.text(width - 60, 60, `+${amount} XP`, {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '20px',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: xpText, y: xpText.y - 40, alpha: 0, duration: 1500, onComplete: () => xpText.destroy() });
  }

  async _saveMatch() {
    const result = await SupabaseService.saveMatch({
      players: this.players.map(p => ({ id: p.id, name: p.name })),
      currentTurn: 0,
      state: { positions: [0, 0] }
    });
    if (result) this.matchId = result.id;
  }

  _saveMatchState() {
    if (!this.matchId) return;
    SupabaseService.updateMatch(this.matchId, {
      currentTurn: this.currentPlayerIndex,
      state: {
        positions: this.players.map(p => p.position),
        xp: this.xpEarned
      }
    });
  }
}

window.GameScene = GameScene;
