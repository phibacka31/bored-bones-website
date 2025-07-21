'use client';

import React, { useRef, useEffect, useState } from 'react';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const GROUND_Y = GAME_HEIGHT - 80;
const PLAYER_SIZE = 60;
const GRAVITY = 1.2;
const JUMP_VELOCITY = -18;
const OBSTACLE_MIN_WIDTH = 40;
const OBSTACLE_MAX_WIDTH = 90;
const OBSTACLE_MIN_HEIGHT = 40;
const OBSTACLE_MAX_HEIGHT = 120;
const OBSTACLE_MIN_GAP = 180;
const OBSTACLE_MAX_GAP = 350;
const INITIAL_SPEED = 4; // Slower start
const SPEED_INCREMENT = 0.3; // Much faster progression

// Secure scoring system
const generatePlayerId = () => {
  return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const getPlayerId = () => {
  if (typeof window === 'undefined') return null;
  let playerId = localStorage.getItem('boneDashPlayerId');
  if (!playerId) {
    playerId = generatePlayerId();
    localStorage.setItem('boneDashPlayerId', playerId);
  }
  return playerId;
};

const getStoredUsername = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('boneDashUsername');
};

const setStoredUsername = (username) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('boneDashUsername', username);
};

const getLeaderboard = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('boneDashLeaderboard') || '[]');
};

const setLeaderboard = (leaderboard) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('boneDashLeaderboard', JSON.stringify(leaderboard));
};

// Competition timer system
const getCompetitionEndTime = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('boneDashCompetitionEndTime');
};

const setCompetitionEndTime = (endTime) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('boneDashCompetitionEndTime', endTime);
};

const isCompetitionEnded = () => {
  const endTime = getCompetitionEndTime();
  if (!endTime) return false;
  return Date.now() > parseInt(endTime);
};

const startCompetition = (durationDays) => {
  const endTime = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
  setCompetitionEndTime(endTime.toString());
  return endTime;
};

const getTimeRemaining = () => {
  const endTime = getCompetitionEndTime();
  if (!endTime) return null;
  const remaining = parseInt(endTime) - Date.now();
  if (remaining <= 0) return 0;
  
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  
  return { days, hours, minutes, total: remaining };
};

// Admin authentication
const ADMIN_WALLET_ADDRESSES = [
  // Add your wallet address here
  '0x66606C24b4A24b5Fd06BbCA9B85DFcEdaF6A65C2', // Your admin wallet
  // You can add multiple admin wallets
];

const isAdmin = () => {
  // Check if current player is admin
  const playerId = getPlayerId();
  if (!playerId) return false;
  
  // Check if player has submitted a wallet that matches admin list
  const lb = getLeaderboard();
  const playerEntry = lb.find(entry => entry.playerId === playerId);
  
  if (playerEntry?.walletAddress) {
    return ADMIN_WALLET_ADDRESSES.includes(playerEntry.walletAddress.toLowerCase());
  }
  
  return false;
};

const validateScore = (score, gameTime, obstaclesHit) => {
  // Basic anti-cheat: score should roughly match game time
  const expectedScore = Math.floor(gameTime);
  const scoreDiff = Math.abs(score - expectedScore);
  
  // Allow small variance due to frame rate differences
  if (scoreDiff > 5) {
    console.warn('Suspicious score detected:', score, 'expected:', expectedScore);
    return false;
  }
  
  // Check for reasonable game duration (minimum 1 second, maximum 10 minutes)
  if (gameTime < 1 || gameTime > 600) {
    console.warn('Suspicious game duration:', gameTime);
    return false;
  }
  
  return true;
};

const validateWalletAddress = (address) => {
  // Basic Ethereum address validation
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
};

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => resolve(img);
  });

const BoneDash = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [username, setUsername] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(true);
  const [playerId, setPlayerId] = useState(null);
  const [showWalletForm, setShowWalletForm] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [achievedTop28, setAchievedTop28] = useState(false);
  const [currentRank, setCurrentRank] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [finalScore, setFinalScore] = useState(0);
  const [competitionEnded, setCompetitionEnded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showCompetitionControls, setShowCompetitionControls] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [leaderboard, setLeaderboardState] = useState(getLeaderboard());
  const [gameOver, setGameOver] = useState(false);
  // Add state for wallet submission
  const [walletPrompt, setWalletPrompt] = useState(false);
  const [walletInput, setWalletInput] = useState('');
  const [walletError, setWalletError] = useState('');

  // Game assets
  const [assets, setAssets] = useState({
    player: null,
    boneBox: null,
    moon: null,
    background: null,
  });

  // Game state
  const gameState = useRef({
    playerY: GROUND_Y - PLAYER_SIZE,
    playerVY: 0,
    obstacles: [],
    speed: INITIAL_SPEED,
    lastObstacleX: GAME_WIDTH,
    time: 0,
    started: false,
    obstaclesHit: 0,
    gameStartTime: 0,
    jumpsUsed: 0,
    maxJumps: 2,
    canJump: true,
  });

  // Competition status check function
  const checkCompetitionStatus = () => {
    const ended = isCompetitionEnded();
    setCompetitionEnded(ended);
    
    if (!ended) {
      const remaining = getTimeRemaining();
      setTimeRemaining(remaining);
    }
  };

  // Admin status check function
  const checkAdminStatus = () => {
    const adminStatus = isAdmin();
    setIsAdminUser(adminStatus);
  };

  // Initialize player ID and check for stored username
  useEffect(() => {
    const id = getPlayerId();
    setPlayerId(id);
    
    // Check if username is already stored
    const storedUsername = getStoredUsername();
    if (storedUsername) {
      setUsername(storedUsername);
      setShowUsernameInput(false);
    }
  }, []);

  // Check competition status and update timer
  useEffect(() => {
    checkCompetitionStatus();
    const interval = setInterval(checkCompetitionStatus, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  // Check admin status
  useEffect(() => {
    checkAdminStatus();
    // Re-check admin status when leaderboard changes
    const interval = setInterval(checkAdminStatus, 5000);
    
    return () => clearInterval(interval);
  }, [leaderboard]);

  // Load images
  useEffect(() => {
    let mounted = true;
    Promise.all([
      loadImage('/images/skull-icon.png'),
      loadImage('/images/bone-box.png'),
      loadImage('/images/moon.png'),
      loadImage('/images/background.png'),
    ]).then(([player, boneBox, moon, background]) => {
      if (mounted) setAssets({ player, boneBox, moon, background });
    });
    return () => { mounted = false; };
  }, []);

  // Reset game state
  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setFinalScore(0);
    gameState.current = {
      playerY: GROUND_Y - PLAYER_SIZE,
      playerVY: 0,
      obstacles: [],
      speed: INITIAL_SPEED,
      lastObstacleX: GAME_WIDTH,
      time: 0,
      started: true,
      obstaclesHit: 0,
      gameStartTime: Date.now(),
      jumpsUsed: 0,
      maxJumps: 2,
      canJump: true,
    };
  };

  // Start game
  const startGame = () => {
    if (!username.trim()) {
      alert('Please enter a username to play!');
      return;
    }
    if (username.length > 20) {
      alert('Username must be 20 characters or less!');
      return;
    }
    resetGame();
    setIsRunning(true);
    setShowUsernameInput(false);
  };

  // Handle username submission
  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && username.length <= 20) {
      setStoredUsername(username.trim()); // Store username permanently
      setShowUsernameInput(false);
    }
  };

  // Handle wallet form submission
  function handleWalletSubmit(e) {
    e.preventDefault();
    // Basic Ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletInput.trim())) {
      setWalletError('Please enter a valid Ethereum address (0x...)');
      return;
    }
    // Update leaderboard with wallet address
    setLeaderboardState(lb => {
      const updated = lb.map(entry =>
        entry.score === score && entry.username === username
          ? { ...entry, walletAddress: walletInput.trim() }
          : entry
      );
      setLeaderboard(updated);
      return updated;
    });
    setWalletPrompt(false);
    setWalletError('');
  }

  // Export leaderboard data for scraping
  const exportLeaderboardData = () => {
    const lb = getLeaderboard();
    const walletsWithData = lb
      .filter(entry => entry.walletAddress)
      .map(entry => ({
        rank: lb.indexOf(entry) + 1,
        username: entry.username,
        wallet: entry.walletAddress,
        score: entry.score,
        timestamp: entry.timestamp
      }));
    
    const dataStr = JSON.stringify(walletsWithData, null, 2);
    
    // Create download link
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bone-dash-top28-wallets-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Also log to console
    console.log('Top 28 Wallets Data:', walletsWithData);
    console.log('Total entries with wallets:', walletsWithData.length);
  };

  // Main game loop
  useEffect(() => {
    if (!isRunning || !assets.player || !assets.boneBox || !assets.moon || !assets.background) return;

    const ctx = canvasRef.current.getContext('2d');
    let lastTimestamp = null;

    const loop = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = (timestamp - lastTimestamp) / 16.67; // ~60fps
      lastTimestamp = timestamp;

      // Update game state
      const state = gameState.current;
      state.time += delta;
      
      // Speed up over time - much more dramatic
      state.speed += SPEED_INCREMENT * delta * 0.01;

      // Player physics
      state.playerY += state.playerVY * delta;
      state.playerVY += GRAVITY * delta;

      // Prevent falling through ground
      if (state.playerY > GROUND_Y - PLAYER_SIZE) {
        state.playerY = GROUND_Y - PLAYER_SIZE;
        state.playerVY = 0;
        // Reset jumps when touching ground
        state.jumpsUsed = 0;
        state.canJump = true;
      }

      // Spawn obstacles
      if (
        state.obstacles.length === 0 ||
        GAME_WIDTH - state.lastObstacleX > OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP)
      ) {
        const isBone = Math.random() < 0.5;
        const width = OBSTACLE_MIN_WIDTH + Math.random() * (OBSTACLE_MAX_WIDTH - OBSTACLE_MIN_WIDTH);
        const height = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
        state.obstacles.push({
          x: GAME_WIDTH,
          y: GROUND_Y - height,
          width,
          height,
          type: isBone ? 'bone' : 'moon',
        });
        state.lastObstacleX = GAME_WIDTH;
      }

      // Move obstacles
      state.obstacles.forEach((obs) => {
        obs.x -= state.speed * delta;
      });
      // Remove off-screen obstacles
      state.obstacles = state.obstacles.filter((obs) => obs.x + obs.width > 0);

      // Ultra tight collision detection - only the core of the skull
      const playerRect = {
        x: 40,
        y: state.playerY,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
      };

      // Create a very small collision box in the center of the skull
      const collisionMargin = 20; // Much larger margin for tighter detection
      const playerCollisionBox = {
        x: playerRect.x + collisionMargin,
        y: playerRect.y + collisionMargin,
        width: playerRect.width - (collisionMargin * 2),
        height: playerRect.height - (collisionMargin * 2),
      };

      for (const obs of state.obstacles) {
        const obsRect = {
          x: obs.x,
          y: obs.y,
          width: obs.width,
          height: obs.height,
        };

        // Ultra precise collision detection - only the center of the skull
        if (
          playerCollisionBox.x < obsRect.x + obsRect.width &&
          playerCollisionBox.x + playerCollisionBox.width > obsRect.x &&
          playerCollisionBox.y < obsRect.y + obsRect.height &&
          playerCollisionBox.y + playerCollisionBox.height > obsRect.y
        ) {
          // Collision!
          setIsRunning(false);
          setGameOver(true);
          
          // Calculate final score
          const finalScoreValue = Math.floor(state.time);
          setFinalScore(finalScoreValue);
          
          // Always save score and prompt for wallet (since you're the only player)
          if (playerId && username.trim()) {
            let lb = getLeaderboard();
            
            // Check if this player already has a higher score
            const existingEntry = lb.find((entry) => entry.playerId === playerId);
            if (!existingEntry || finalScoreValue > existingEntry.score) {
              // Remove old entry if exists
              lb = lb.filter((entry) => entry.playerId !== playerId);
              
              // Add new entry with secure data
              lb.push({
                playerId,
                username: username.trim(),
                score: finalScoreValue,
                timestamp: Date.now(),
                gameDuration: (Date.now() - state.gameStartTime) / 1000,
                obstaclesHit: state.obstaclesHit,
                sessionId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                walletAddress: existingEntry?.walletAddress || null // Preserve existing wallet address
              });
              
              // Sort by score (highest first) and keep only top 28
              lb.sort((a, b) => b.score - a.score);
              lb = lb.slice(0, 28);
              
              setLeaderboard(lb);
              setLeaderboardState(lb);
              
              // Get player rank
              const playerRank = lb.findIndex(entry => entry.playerId === playerId) + 1;
              const playerEntry = lb.find(entry => entry.playerId === playerId);
              
              // Always prompt for wallet if they don't have one
              if (!playerEntry?.walletAddress) {
                setCurrentRank(playerRank);
                setAchievedTop28(true);
                setShowWalletForm(true);
              }
            }
          }
          return;
        }
      }

      // Update score
      setScore(Math.floor(state.time));

      // Draw everything
      // Background
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.drawImage(assets.background, 0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Ground
      ctx.fillStyle = '#333';
      ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

      // Obstacles
      for (const obs of state.obstacles) {
        const img = obs.type === 'bone' ? assets.boneBox : assets.moon;
        ctx.drawImage(img, obs.x, obs.y, obs.width, obs.height);
      }

      // Player
      ctx.drawImage(assets.player, playerRect.x, playerRect.y, playerRect.width, playerRect.height);

      // Score
      ctx.fillStyle = '#fff';
      ctx.font = '24px monospace';
      ctx.fillText(`Score: ${Math.floor(state.time)}`, 20, 40);

      // Speed indicator with color coding
      const speedColor = state.speed > 8 ? '#ff4444' : state.speed > 6 ? '#ffaa00' : '#00ff00';
      ctx.fillStyle = speedColor;
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`Speed: ${state.speed.toFixed(1)}`, 20, 70);

      // Jump indicator
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.fillText(`Jumps: ${state.maxJumps - state.jumpsUsed}`, 20, 100);

      // Next frame
      if (isRunning) {
        animationRef.current = requestAnimationFrame(loop);
      }
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line
  }, [isRunning, assets, username, playerId]);

  // Space bar to jump (double jump)
  useEffect(() => {
    if (!isRunning) return;
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        jump();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning]);

  // Add jump function for both keyboard and tap
  const jump = () => {
    const state = gameState.current;
    // Allow jump if on ground or if jumps remaining
    if (state.playerY >= GROUND_Y - PLAYER_SIZE - 2 || state.jumpsUsed < state.maxJumps) {
      if (state.playerY >= GROUND_Y - PLAYER_SIZE - 2) {
        // Ground jump
        state.playerVY = JUMP_VELOCITY;
        state.jumpsUsed = 1;
      } else if (state.jumpsUsed < state.maxJumps) {
        // Air jump
        state.playerVY = JUMP_VELOCITY;
        state.jumpsUsed++;
      }
    }
  };

  // Reset game on username change
  useEffect(() => {
    setIsRunning(false);
    setGameOver(false);
    setScore(0);
  }, [username]);

  // Refresh leaderboard when it changes
  useEffect(() => {
    setLeaderboardState(getLeaderboard());
  }, []);

  // After game over, check if score is top 28 and show prompt
  useEffect(() => {
    if (gameOver && score > 0) {
      // Check if score is in top 28 and player hasn't submitted wallet
      const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
      const top28 = sorted.slice(0, 28);
      const isTop28 = top28.some(entry => entry.score === score && entry.username === username);
      const alreadyHasWallet = top28.find(entry => entry.score === score && entry.username === username && entry.walletAddress);
      if (isTop28 && !alreadyHasWallet) {
        setWalletPrompt(true);
      } else {
        setWalletPrompt(false);
      }
    } else {
      setWalletPrompt(false);
    }
  }, [gameOver, score, leaderboard, username]);

  // Wallet form modal
  if (showWalletForm) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: '#222',
          padding: '30px',
          borderRadius: '10px',
          textAlign: 'center',
          maxWidth: '400px',
          color: 'white'
        }}>
          <h2>🎉 Congratulations! 🎉</h2>
          <p>You've made it to the Top 28!</p>
          <p style={{ fontSize: '14px', color: '#ccc', marginBottom: '20px' }}>
            Rank #{currentRank} - Score: {finalScore}
          </p>
          <p style={{ fontSize: '14px', color: '#ccc' }}>
            Submit your wallet address to be eligible for NFT minting
          </p>
          
          <form onSubmit={handleWalletSubmit} style={{ marginTop: '20px' }}>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter your wallet address (0x...)"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                marginBottom: '10px',
                backgroundColor: '#333',
                color: 'white'
              }}
            />
            {submissionStatus && (
              <div style={{ 
                marginBottom: '10px',
                color: submissionStatus.includes('✅') ? '#28a745' : '#dc3545',
                fontSize: '14px'
              }}>
                {submissionStatus}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Submit Wallet
              </button>
              <button
                type="button"
                onClick={() => setShowWalletForm(false)}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Skip for Now
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (showUsernameInput) {
    return (
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2>Bone Dash</h2>
        <div style={{ marginBottom: 20 }}>
          <p>Enter your username to start playing!</p>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            Your score will be securely tracked with a unique ID
          </p>
          <form onSubmit={handleUsernameSubmit}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username (max 20 chars)"
              maxLength={20}
              style={{
                padding: '8px 12px',
                fontSize: '16px',
                marginRight: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '200px'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                fontSize: '16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Start Game
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <h2 style={{ fontSize: '2.8em', fontWeight: 900, letterSpacing: '0.04em', textShadow: '2px 2px 12px #000', color: '#fff', margin: 0 }}>
        Bone Dash
      </h2>
      <div style={{ marginBottom: 10 }}>
        <strong>Player:</strong> {username}
        <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
          ID: {playerId?.slice(-8)}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        style={{ border: '2px solid #333', background: '#111' }}
      />
      {/* Mobile Tap-to-Jump Button */}
      <div className="bone-dash-mobile-jump" style={{ marginTop: 16 }}>
        <button
          onClick={jump}
          style={{
            display: 'inline-block',
            width: '90vw',
            maxWidth: 400,
            padding: '18px 0',
            fontSize: '1.5em',
            fontWeight: 700,
            background: '#ff6b35',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            boxShadow: '0 2px 8px #0008',
            cursor: 'pointer',
            margin: '0 auto',
            zIndex: 10
          }}
        >
          Tap to Jump
        </button>
      </div>
      <style jsx>{`
        @media (min-width: 700px) {
          .bone-dash-mobile-jump { display: none; }
        }
        @media (max-width: 699px) {
          .bone-dash-mobile-jump { display: block; }
        }
      `}</style>
      <div style={{ marginTop: 16 }}>
        <strong>Score:</strong> {score}
      </div>
      <div style={{ marginTop: 8, fontSize: '14px', color: '#666' }}>
        Press SPACE to jump (double jump available)
      </div>
      
      {/* Competition Timer */}
      {timeRemaining && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: competitionEnded ? '#dc3545' : '#28a745',
          color: 'white',
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          {competitionEnded ? (
            <strong>🏆 Competition Ended! 🏆</strong>
          ) : (
            <div>
              <strong>⏰ Competition Active</strong>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m remaining
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Competition Controls (Admin Only) */}
      {isAdminUser && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ 
            padding: '8px', 
            background: '#28a745', 
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '8px'
          }}>
            🔑 Admin Access Granted
          </div>
          <button
            onClick={() => setShowCompetitionControls(!showCompetitionControls)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          >
            {showCompetitionControls ? 'Hide' : 'Show'} Admin Controls
          </button>
          
          {showCompetitionControls && (
            <div style={{ 
              padding: '12px', 
              background: '#f8f9fa', 
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Competition Controls:</strong>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    startCompetition(1);
                    window.location.reload();
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Start 1 Day
                </button>
                <button
                  onClick={() => {
                    startCompetition(7);
                    window.location.reload();
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Start 7 Days
                </button>
                <button
                  onClick={() => {
                    setCompetitionEndTime(Date.now().toString());
                    window.location.reload();
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  End Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <button
        onClick={startGame}
        disabled={isRunning}
        style={{ 
          marginTop: 8,
          padding: '8px 16px',
          fontSize: '16px',
          backgroundColor: isRunning ? '#666' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isRunning ? 'not-allowed' : 'pointer'
        }}
      >
        {gameOver ? 'Restart Game' : 'Start Game'}
      </button>

      {/* Always show leaderboard below the game */}
      <div style={{ marginTop: 32, maxWidth: '900px', margin: '32px auto 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '2em', fontWeight: 900, letterSpacing: '0.03em', color: '#fff', margin: 0, textAlign: 'center', width: '100%' }}>Top 28 Leaderbored</h3>
          {isAdminUser && (
            <button
              onClick={exportLeaderboardData}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              title="Export top 28 wallets data (Admin Only)"
            >
              📥 Export Data
            </button>
          )}
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '10px',
          marginTop: '16px'
        }}>
          {leaderboard.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1', 
              padding: '20px', 
              background: '#222', 
              borderRadius: '8px',
              color: '#666'
            }}>
              No scores yet. Be the first to play!
            </div>
          ) : (
            leaderboard.slice(0, 28).map((entry, idx) => (
              <div key={entry.sessionId} style={{
                background: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : '#333',
                color: idx < 3 ? '#000' : '#fff',
                padding: '12px',
                borderRadius: '8px',
                border: playerId === entry.playerId ? '2px solid #ff6b6b' : '1px solid #444',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '4px', 
                  left: '8px', 
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  #{idx + 1}
                </div>
                <div style={{ 
                  marginTop: '16px', 
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {entry.username}
                </div>
                <div style={{ 
                  textAlign: 'center', 
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginTop: '4px'
                }}>
                  {entry.score}
                </div>
                {entry.walletAddress && (
                  <div style={{ 
                    textAlign: 'center', 
                    fontSize: '10px',
                    marginTop: '4px',
                    color: idx < 3 ? '#666' : '#28a745'
                  }}>
                    {competitionEnded 
                      ? `${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}`
                      : 'Wallet Submitted ✓'
                    }
                  </div>
                )}
                {playerId === entry.playerId && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '4px', 
                    right: '8px',
                    fontSize: '12px',
                    color: '#ff6b6b',
                    fontWeight: 'bold'
                  }}>
                    YOU
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {gameOver && (
        <div style={{ color: 'red', marginTop: 16, fontWeight: 'bold' }}>
          Game Over! Press "Restart Game" to play again.
        </div>
      )}
      {gameOver && walletPrompt && (
        <div style={{ margin: '32px auto', maxWidth: 400, background: '#181818', borderRadius: 12, padding: 24, textAlign: 'center', color: '#fff', boxShadow: '0 2px 8px #0008' }}>
          <div style={{ fontSize: '1.3em', fontWeight: 700, marginBottom: 12 }}>Congrats. Please enter your wallet address below.</div>
          <form onSubmit={handleWalletSubmit}>
            <input
              type="text"
              value={walletInput}
              onChange={e => setWalletInput(e.target.value)}
              placeholder="0x..."
              style={{ width: '100%', padding: '12px', fontSize: '1.1em', borderRadius: 6, border: '1px solid #444', marginBottom: 10, background: '#222', color: '#fff' }}
            />
            {walletError && <div style={{ color: '#ff4444', marginBottom: 8 }}>{walletError}</div>}
            <button type="submit" style={{ padding: '10px 24px', fontSize: '1.1em', borderRadius: 8, background: '#ff6b35', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Submit Wallet
            </button>
          </form>
          <div style={{ fontSize: '0.95em', color: '#aaa', marginTop: 8 }}>
            (This can be a delegate wallet. No wallet connect required.)
          </div>
        </div>
      )}
    </div>
  );
};

export default BoneDash; 