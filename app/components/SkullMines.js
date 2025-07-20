'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';

// Define game parameters - Made smaller for better UX
const ROWS = 16; // Reduced from 28
const COLS = 16; // Reduced from 28
const SKULL_COUNT = 40; // Reduced from 150 - about 15% mine density

// Helper function to create the initial empty board, place skulls randomly, and calculate adjacent counts
const createBoard = () => {
  const board = [];
  const skullPositions = new Set();

  // Initialize the empty board structure
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push({
        isSkull: false,
        isRevealed: false,
        isFlagged: false,
        adjacentSkulls: 0,
        row: r,
        col: c,
      });
    }
    board.push(row);
  }

  // Randomly place skulls
  while (skullPositions.size < SKULL_COUNT) {
    const randomRow = Math.floor(Math.random() * ROWS);
    const randomCol = Math.floor(Math.random() * COLS);
    const position = `${randomRow}-${randomCol}`;

    if (!skullPositions.has(position)) {
      skullPositions.add(position);
      board[randomRow][randomCol].isSkull = true;
    }
  }

  // Calculate adjacent skulls for each non-skull cell
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c].isSkull) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;

            const newRow = r + dr;
            const newCol = c + dc;

            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
              if (board[newRow][newCol].isSkull) {
                count++;
              }
            }
          }
        }
        board[r][c].adjacentSkulls = count;
      }
    }
  }

  return board;
};

const SkullMines = () => {
  const [board, setBoard] = useState(() => createBoard());
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [unrevealedNonSkulls, setUnrevealedNonSkulls] = useState(ROWS * COLS - SKULL_COUNT);

  const resetGame = useCallback(() => {
    const newBoard = createBoard();
    setBoard(newBoard);
    setIsGameOver(false);
    setIsGameWon(false);
    setUnrevealedNonSkulls(ROWS * COLS - SKULL_COUNT);
  }, []);

  const revealCell = useCallback((r, c, currentBoard) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || currentBoard[r][c].isRevealed || currentBoard[r][c].isSkull || currentBoard[r][c].isFlagged) {
      return;
    }

    currentBoard[r][c].isRevealed = true;

    if (currentBoard[r][c].adjacentSkulls === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          revealCell(r + dr, c + dc, currentBoard);
        }
      }
    }
  }, [ROWS, COLS]);

  const handleCellClick = useCallback((row, col) => {
    if (isGameOver || isGameWon || board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }

    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    let cellsToRevealCount = 0;

    if (newBoard[row][col].isSkull) {
      newBoard[row][col].isRevealed = true;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (newBoard[r][c].isSkull) {
            newBoard[r][c].isRevealed = true;
          }
        }
      }
      setBoard(newBoard);
      setIsGameOver(true);
    } else {
      const tempBoardForReveal = board.map(row => row.map(cell => ({ ...cell })));
      revealCell(row, col, tempBoardForReveal);

      const finalBoard = board.map((row, r) => row.map((cell, c) => {
        if (tempBoardForReveal[r][c].isRevealed && !cell.isRevealed && !cell.isSkull) {
          cellsToRevealCount++;
        }
        return tempBoardForReveal[r][c];
      }));

      setBoard(finalBoard);
      setUnrevealedNonSkulls(prev => prev - cellsToRevealCount);
    }
  }, [board, isGameOver, isGameWon, revealCell]);

  useEffect(() => {
    if (!isGameOver && unrevealedNonSkulls === 0 && !isGameWon) {
      setIsGameWon(true);
    }
  }, [unrevealedNonSkulls, isGameOver, isGameWon]);

  const getNumberColor = (count) => {
    switch (count) {
      case 1: return '#0000ff';
      case 2: return '#008000';
      case 3: return '#ff0000';
      case 4: return '#000080';
      case 5: return '#800000';
      case 6: return '#008080';
      case 7: return '#000000';
      case 8: return '#808080';
      default: return '#000';
    }
  };

  return (
    <div className="skull-mines-container" style={{ 
      position: 'relative', 
      display: 'inline-block',
      padding: '0',
      backgroundColor: 'transparent',
      borderRadius: '0',
      boxShadow: 'none',
      minWidth: '420px',
      minHeight: '520px',
    }}>
      <h2 style={{ 
        color: '#fff', 
        textAlign: 'center', 
        marginBottom: '25px',
        fontSize: '2.8em',
        fontWeight: 900,
        letterSpacing: '0.04em',
        textShadow: '2px 2px 12px #000',
      }}>
        Skull Mines
      </h2>
      {/* Game Over Overlay (Loss) */}
      {isGameOver && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: '#ff4444',
            fontWeight: 'bold',
            fontSize: '1.2em',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 10,
            textAlign: 'center',
            borderRadius: '18px',
          }}
          onClick={resetGame}
        >
          <p style={{ marginBottom: '15px' }}>The Void is always watching. Try again...</p>
          <Image src="/images/skull-icon.png" alt="skull" width={60} height={60} />
        </div>
      )}
      {/* Game Won Overlay */}
      {isGameWon && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 128, 0, 0.9)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2em',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 10,
            textAlign: 'center',
            borderRadius: '18px',
          }}
          onClick={resetGame}
        >
          <p>The Void Welcomes You!</p>
        </div>
      )}
      <div className="game-board" style={{ display: 'inline-block' }}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row" style={{ display: 'flex' }}>
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`board-cell ${cell.isRevealed ? 'revealed' : ''}`}
                style={{
                  width: '28px',
                  height: '28px',
                  border: '1.5px solid #444',
                  backgroundColor: cell.isRevealed ? '#ddd' : '#888',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: isGameOver || isGameWon ? 'default' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'background-color 0.1s ease',
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (isGameOver || isGameWon) return;
                  e.stopPropagation();
                  if (e.button === 0) {
                    handleCellClick(rowIndex, colIndex);
                  } else if (e.button === 2) {
                    // Right-click to toggle flag
                    e.preventDefault();
                    setBoard(prev => {
                      const newBoard = prev.map(row => row.map(cell => ({ ...cell })));
                      if (!newBoard[rowIndex][colIndex].isRevealed) {
                        newBoard[rowIndex][colIndex].isFlagged = !newBoard[rowIndex][colIndex].isFlagged;
                      }
                      return newBoard;
                    });
                  }
                }}
                onContextMenu={e => e.preventDefault()}
                onTouchStart={e => {
                  if (isGameOver || isGameWon) return;
                  if (e.touches && e.touches.length === 2) {
                    // Two-finger tap for flag on mobile
                    setBoard(prev => {
                      const newBoard = prev.map(row => row.map(cell => ({ ...cell })));
                      if (!newBoard[rowIndex][colIndex].isRevealed) {
                        newBoard[rowIndex][colIndex].isFlagged = !newBoard[rowIndex][colIndex].isFlagged;
                      }
                      return newBoard;
                    });
                  }
                }}
              >
                {cell.isRevealed ? (
                  cell.isSkull ? (
                    <Image src="/images/skull-icon.png" alt="skull" width={14} height={14} />
                  ) : (
                    cell.adjacentSkulls > 0 ? (
                      <span style={{ color: getNumberColor(cell.adjacentSkulls) }}>
                        {cell.adjacentSkulls}
                      </span>
                    ) : (
                      <span></span>
                    )
                  )
                ) : (
                  cell.isFlagged ? (
                    <span>🚩</span>
                  ) : (
                    <span></span>
                  )
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Game Stats */}
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center',
        color: '#fff',
        fontSize: '1.1em',
      }}>
        <p>Mines: {SKULL_COUNT} | Remaining: {unrevealedNonSkulls}</p>
        <p style={{ fontSize: '0.95em', color: '#aaa', marginTop: 6 }}>
          Left-click to reveal. Right-click (or two-finger tap) to flag suspected skulls.
        </p>
      </div>
    </div>
  );
};

export default SkullMines;