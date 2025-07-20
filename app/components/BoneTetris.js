"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 38;

// Simple bone-themed colors for now
const COLORS = [
  "#2d133b", // deep purple
  "#3c1a4f", // dark purple
  "#1a1023", // almost black purple
  "#4b2066", // rich purple
  "#23112b", // blackish purple
  "#5e239d", // vibrant purple
  "#12081a", // near black
];

// Tetromino shapes (bone-themed, but using classic shapes for MVP)
const SHAPES = [
  // I
  [
    [1, 1, 1, 1],
  ],
  // O
  [
    [2, 2],
    [2, 2],
  ],
  // T
  [
    [0, 3, 0],
    [3, 3, 3],
  ],
  // S
  [
    [0, 4, 4],
    [4, 4, 0],
  ],
  // Z
  [
    [5, 5, 0],
    [0, 5, 5],
  ],
  // J
  [
    [6, 0, 0],
    [6, 6, 6],
  ],
  // L
  [
    [0, 0, 7],
    [7, 7, 7],
  ],
];

function randomShape() {
  const idx = Math.floor(Math.random() * SHAPES.length);
  return { shape: SHAPES[idx], color: COLORS[idx], type: idx + 1 };
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function canMove(board, shape, pos) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        const newRow = pos.row + r;
        const newCol = pos.col + c;
        if (
          newRow < 0 ||
          newRow >= ROWS ||
          newCol < 0 ||
          newCol >= COLS ||
          board[newRow][newCol]
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

export default function BoneTetris() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [current, setCurrent] = useState(() => {
    const { shape, color, type } = randomShape();
    return {
      shape,
      color,
      type,
      pos: { row: 0, col: 3 },
    };
  });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [intervalMs, setIntervalMs] = useState(600);
  const [started, setStarted] = useState(false);
  const requestRef = useRef();

  // Ref to always access the latest current piece in the drop interval
  const currentRef = useRef(current);
  useEffect(() => { currentRef.current = current; }, [current]);

  // Merge current piece into a copy of the board
  const getMergedBoard = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    const { shape, type, pos } = current;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          const br = pos.row + r;
          const bc = pos.col + c;
          if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS) {
            newBoard[br][bc] = type;
          }
        }
      }
    }
    return newBoard;
  }, [board, current]);

  // Drop piece by one row
  const drop = useCallback(() => {
    if (gameOver) return;
    const { shape, pos, type, color } = current;
    const nextPos = { row: pos.row + 1, col: pos.col };
    if (canMove(board, shape, nextPos)) {
      setCurrent(cur => ({ ...cur, pos: nextPos }));
    } else {
      // Merge piece into board
      const newBoard = board.map(row => [...row]);
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[0].length; c++) {
          if (shape[r][c]) {
            const br = pos.row + r;
            const bc = pos.col + c;
            if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS) {
              newBoard[br][bc] = type;
            }
          }
        }
      }
      // Clear lines
      let linesCleared = 0;
      for (let r = 0; r < ROWS; r++) {
        if (newBoard[r].every(cell => cell)) {
          newBoard.splice(r, 1);
          newBoard.unshift(Array(COLS).fill(0));
          linesCleared++;
        }
      }
      setScore(s => s + linesCleared * 100);
      if (linesCleared > 0 && intervalMs > 120) {
        setIntervalMs(i => Math.max(120, i - 40 * linesCleared));
      }
      // New piece
      const next = randomShape();
      const startPos = { row: 0, col: 3 };
      if (!canMove(newBoard, next.shape, startPos)) {
        setGameOver(true);
      } else {
        setCurrent({ ...next, pos: startPos });
      }
      setBoard(newBoard);
    }
  }, [board, current, gameOver, intervalMs]);

  const handledKeys = ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "];

  // Game loop
  useEffect(() => {
    if (!started || gameOver) return;
    const interval = setInterval(() => {
      drop();
    }, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs, gameOver, started, drop]);

  // Keyboard controls
  useEffect(() => {
    if (!started || gameOver) return;
    const handleKey = e => {
      if (e.repeat) return;
      if (handledKeys.includes(e.key)) {
        e.preventDefault();
      }
      let { shape, pos } = current;
      if (e.key === "ArrowLeft") {
        const nextPos = { row: pos.row, col: pos.col - 1 };
        if (canMove(board, shape, nextPos)) {
          setCurrent(cur => ({ ...cur, pos: nextPos }));
        }
      } else if (e.key === "ArrowRight") {
        const nextPos = { row: pos.row, col: pos.col + 1 };
        if (canMove(board, shape, nextPos)) {
          setCurrent(cur => ({ ...cur, pos: nextPos }));
        }
      } else if (e.key === "ArrowDown") {
        drop();
      } else if (e.key === "ArrowUp") {
        const rotated = rotate(shape);
        if (canMove(board, rotated, pos)) {
          setCurrent(cur => ({ ...cur, shape: rotated }));
        }
      } else if (e.key === " ") {
        // Hard drop
        let nextRow = pos.row;
        while (canMove(board, shape, { row: nextRow + 1, col: pos.col })) {
          nextRow++;
        }
        setCurrent(cur => ({ ...cur, pos: { ...pos, row: nextRow } }));
      }
    };
    window.addEventListener("keydown", handleKey, { passive: false });
    return () => window.removeEventListener("keydown", handleKey);
  }, [board, current, gameOver, started, drop]);

  // Restart
  const restart = () => {
    setBoard(createEmptyBoard());
    const next = randomShape();
    setCurrent({ ...next, pos: { row: 0, col: 3 } });
    setScore(0);
    setGameOver(false);
    setIntervalMs(600);
    setStarted(true);
  };

  const startGame = () => {
    setStarted(true);
  };

  // Render
  const mergedBoard = getMergedBoard();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      background: `url('/images/background.png') center/cover no-repeat`,
      padding: 36, 
      borderRadius: 20, 
      boxShadow: '0 4px 32px #000a', 
      margin: '2.5em auto', 
      maxWidth: 600,
      minHeight: 1000,
    }}>
      <h2 style={{ color: '#fff', marginBottom: 18, fontSize: '2.8em', fontWeight: 900, letterSpacing: '0.04em', textShadow: '2px 2px 12px #000', textAlign: 'center' }}>Bone Tetris</h2>
      {!started && !gameOver && (
        <button
          onClick={startGame}
          style={{
            margin: '24px auto 18px',
            padding: '16px 48px',
            fontSize: '1.3em',
            borderRadius: 12,
            background: '#2d133b',
            color: '#fff',
            border: '2px solid #fff',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0008',
            display: 'block',
          }}
        >
          Start Game
        </button>
      )}
      <div style={{ display: 'grid', gridTemplateRows: `repeat(${ROWS}, ${BLOCK_SIZE}px)`, gridTemplateColumns: `repeat(${COLS}, ${BLOCK_SIZE}px)`, background: '#111', border: '2px solid #fff', borderRadius: 8 }}>
        {mergedBoard.flat().map((cell, idx) => (
          <div key={idx} style={{
            width: BLOCK_SIZE,
            height: BLOCK_SIZE,
            background: cell ? COLORS[cell - 1] : '#181818',
            border: cell ? '2px solid #fff' : '1px solid #333',
            boxSizing: 'border-box',
            borderRadius: cell ? 6 : 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2em',
            color: '#222',
            fontWeight: 'bold',
          }}>
            {cell ? '🦴' : ''}
          </div>
        ))}
      </div>
      <div style={{ color: '#fff', marginTop: 16, fontSize: '1.2em' }}>Score: {score}</div>
      {gameOver && (
        <div style={{ color: '#ff4444', marginTop: 16, fontWeight: 'bold', fontSize: '1.2em', textAlign: 'center' }}>
          Game Over!<br />
          <button onClick={restart} style={{ marginTop: 12, padding: '10px 24px', fontSize: '1em', borderRadius: 8, background: '#fffbe6', color: '#222', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Restart</button>
        </div>
      )}
      <div style={{ color: '#aaa', marginTop: 10, fontSize: '0.95em', textAlign: 'center' }}>
        Use arrow keys to move/rotate. Space for hard drop.<br />
        Clear lines to score and speed up!
      </div>
    </div>
  );
} 