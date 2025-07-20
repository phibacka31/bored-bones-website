'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Game constants
const gameAreaHeight = 200; // Height of the visible game area
const groundHeight = 20;    // Height of the ground graphic
const skullSize = 60;       // Size of the skull image
const gravity = 0.2;        // How fast the skull falls
const jumpStrength = 15;    // Initial upward velocity when jumping

const minObstacleWidth = 20; // Minimum width of obstacles
const maxObstacleWidth = 50; // Maximum width of obstacles
const minObstacleHeight = 30; // Minimum height of obstacles
const maxObstacleHeight = 80; // Maximum height of obstacles
const obstacleSpeed = 3;    // How fast obstacles move towards the skull
const obstacleInterval = 1800; // Time in ms between new obstacle groups

const SkullJumpingGame = () => {
  // State to manage the skull's vertical position (distance from the bottom of the game area)
  const [skullPosition, setSkullPosition] = useState(groundHeight); // Start on the ground
  // State to manage the skull's vertical velocity
  const [skullVelocityY, setSkullVelocityY] = useState(0);
  // State to track if the skull is currently on the ground
  const [isOnGround, setIsOnGround] = useState(true);
  // State to manage if the game is over
  const [isGameOver, setIsGameOver] = useState(false);
  // State to manage the list of obstacles [{ id, left, height, width, imageSrc }]
  const [obstacles, setObstacles] = useState([]);
   // State to manage the player's score
  const [score, setScore] = useState(0);


  // Ref to hold the game loop ID for requestAnimationFrame
  const gameLoopId = useRef();
  // Ref to hold the obstacle generation interval ID
  const obstacleTimerId = useRef();

  // Effect hook for the main game loop (movement, physics, collision, filtering, scoring)
  useEffect(() => {
    if (isGameOver) {
        // Stop game loop and obstacle timer if game is over
        cancelAnimationFrame(gameLoopId.current);
        clearInterval(obstacleTimerId.current);
        console.log('Game Over: Game loop and obstacle generation stopped.');
        return;
    }

    const gameLoop = () => {
      // --- Skull Movement and Physics ---
      setSkullPosition(prevPos => {
        let newPos = prevPos + skullVelocityY;

        // Prevent falling through the ground
        if (newPos <= groundHeight) {
          newPos = groundHeight;
          setIsOnGround(true);
          setSkullVelocityY(0); // Stop vertical movement on the ground
        } else {
           setIsOnGround(false);
        }

        // Apply gravity to velocity
        setSkullVelocityY(prevVel => prevVel - gravity);

        return newPos;
      });

      // --- Obstacle Movement, Filtering, and Scoring ---
       setObstacles(prevObstacles => {
           const updatedObstacles = [];
           let scoreIncrease = 0;

           for (const obstacle of prevObstacles) {
               // Move obstacle to the left
               const newLeft = obstacle.left - obstacleSpeed;

               if (newLeft > -obstacle.width) { // Check if entirely off-screen using obstacle's width
                   // Obstacle is still on screen, keep it with updated position
                   updatedObstacles.push({ ...obstacle, left: newLeft });
               } else {
                   // Obstacle moved off-screen, increment score
                   scoreIncrease++;
               }
           }

           // Update score state
           if (scoreIncrease > 0) {
               setScore(prevScore => prevScore + scoreIncrease);
           }

           return updatedObstacles; // Return the filtered and updated obstacles
       });


      // --- Collision Detection (Simplified Axis-Aligned Bounding Box check) ---
      // Skull position relative to game area: left: 50px, bottom: skullPosition
      // Skull bounds: left: 50, right: 50 + skullSize, bottom: skullPosition, top: skullPosition + skullSize

      const skullLeft = 50;
      const skullRight = skullLeft + skullSize;
      const skullBottom = skullPosition;
      const skullTop = skullPosition + skullSize;

      // Check against the current state of obstacles AFTER they have been moved/filtered
      for (const obstacle of obstacles) { // Note: This 'obstacles' is the state from the render before this effect runs
          // Recalculate obstacle bounds using the just-calculated newLeft (position for this frame)
          const obstacleLeft = obstacle.left - obstacleSpeed;
          const obstacleRight = obstacleLeft + obstacle.width; // Use obstacle's width
          const obstacleBottom = groundHeight;
          const obstacleTop = groundHeight + obstacle.height;


          // Check for overlap on both axes
          const overlapX = skullRight > obstacleLeft && skullLeft < obstacleRight;
          const overlapY = skullTop > obstacleBottom && skullBottom < obstacleTop;


          if (overlapX && overlapY) {
              console.log("Collision Detected!"); // For debugging
              setIsGameOver(true); // Set game over state
              // The effects will handle stopping loops based on isGameOver
              break; // Stop checking collisions once one is found
          }
      }

      // Request the next frame if not game over (checked at the start of the effect)
      // This part is handled by the `if (isGameOver) return;` check at the top
      if (!isGameOver) {
        gameLoopId.current = requestAnimationFrame(gameLoop);
      }
    };

    // Start the game loop initially
    gameLoopId.current = requestAnimationFrame(gameLoop);


    // Cleanup function: Cancel the animation frame when the component unmounts or game over
    return () => {
      cancelAnimationFrame(gameLoopId.current);
    }

  }, [isGameOver, skullVelocityY, skullPosition, obstacles]); // Depend on states that affect rendering or logic


  // Effect hook to handle user input (spacebar for jumping and restart)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        if (isGameOver) {
          // Restart the game
          setIsGameOver(false);
          setSkullPosition(groundHeight);
          setSkullVelocityY(0);
          setIsOnGround(true);
          setObstacles([]);
          setScore(0);
          console.log('Game Restarted!'); // Log restart
        } else if (isOnGround) {
          // Regular jump
          setIsOnGround(false);
          setSkullVelocityY(jumpStrength);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);

  }, [isOnGround, isGameOver]); // Depends on isOnGround and isGameOver

  // Effect hook to generate obstacles periodically
  useEffect(() => {
    if (isGameOver) {
      clearInterval(obstacleTimerId.current);
      console.log('Game Over: Obstacle generation stopped.');
      return;
    }

    console.log('Starting obstacle generation interval.');
    // Start the interval for obstacle generation, clear previous one if exists
    obstacleTimerId.current = setInterval(() => {
      const numObstacles = Math.floor(Math.random() * 2) + 1; // Generate 1 or 2 obstacles
      const newObstacles = [];
      let currentLeft = 600; // Start position for the group

      for (let i = 0; i < numObstacles; i++) {
          const randomHeight = Math.random() * (maxObstacleHeight - minObstacleHeight) + minObstacleHeight;
          const randomWidth = Math.random() * (maxObstacleWidth - minObstacleWidth) + minObstacleWidth;
          const obstacleSpacing = 30; // Horizontal space between obstacles in a group

          // Randomly select between bone-box.png and moon.png
          const imageChoices = ['/images/bone-box.png', '/images/moon.png'];
          const randomImageSrc = imageChoices[Math.floor(Math.random() * imageChoices.length)];

          newObstacles.push({
              id: Date.now() + i, // Unique ID for each obstacle in the group
              left: currentLeft,
              height: randomHeight,
              width: randomWidth, // Include width
              imageSrc: randomImageSrc, // Include image source
          });

          currentLeft += randomWidth + obstacleSpacing; // Position the next obstacle
      }

      setObstacles(prevObstacles => [...prevObstacles, ...newObstacles]); // Add the new group
      console.log('Generated obstacles:', newObstacles);
    }, obstacleInterval);

    return () => {
       clearInterval(obstacleTimerId.current);
       console.log('Obstacle generation interval cleared.');
    }

  }, [isGameOver]); // Depends on isGameOver. This effect manages the timer.


  return (
    <div style={{
      width: '100%',
      height: gameAreaHeight + 'px',
      border: '1px solid black',
      position: 'relative',
      overflow: 'hidden',
      // Background image styles (Changed from backgroundColor)
      backgroundImage: 'url(/images/My_Bones.png)',
      backgroundSize: 'cover', // Cover the entire area
      backgroundRepeat: 'no-repeat', // Don't repeat the image
      backgroundPosition: 'center', // Center the image
      margin: '20px auto',
      maxWidth: '600px', // Max width of game area
      boxSizing: 'content-box',
      outline: 'none',
    }}
    tabIndex={0}
    autoFocus
    >
      {/* Score Display */}
      <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: 'white',
          fontSize: '1.5em',
          zIndex: 2, // Ensure score is above game elements
          textShadow: '1px 1px 2px black',
      }}>
          Score: {score}
      </div>


      {/* The skull icon */}
      <Image
        src="/images/skull-icon.png"
        alt="Jumping Skull"
        width={skullSize}
        height={skullSize}
        style={{
          position: 'absolute',
          bottom: skullPosition + 'px',
          left: '50px', // Fixed horizontal position
          imageRendering: 'pixelated',
          zIndex: 1,
          border: 'none',
          outline: 'none',
          transform: 'translateZ(0)',
        }}
      />

      {/* Render the obstacles using Image component */}
      {obstacles.map(obstacle => (
        <Image
          key={obstacle.id} // Use the unique ID as the key
          src={obstacle.imageSrc} // Use the image source stored in the obstacle object
          alt="Obstacle"             // Generic alt text, could be more specific if needed
          width={obstacle.width}     // Use obstacle's width
          height={obstacle.height}   // Use obstacle's height
          style={{
            position: 'absolute',
            left: obstacle.left + 'px', // Obstacle's horizontal position
            bottom: groundHeight + 'px', // Obstacle is on the ground
            imageRendering: 'pixelated', // Keep pixel art sharp
            zIndex: 1, // Ensure obstacles are above the ground
            transform: 'translateZ(0)',
            // If the obstacle images have extra transparent space,
            // you might need to adjust the bottom positioning here
            // or the collision detection logic slightly.
          }}
        />
      ))}

      {/* The ground */}
      {/* Keep the ground div for collision detection and visual base if needed */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: groundHeight + 'px', // Use groundHeight constant
        backgroundColor: '#545454', // Graphite color for the ground
        zIndex: 0,
      }}></div>

      {/* Game Over text */}
      {isGameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'red',
          fontSize: '2em',
          fontWeight: 'bold',
          zIndex: 2,
          textShadow: '2px 2px 4px black', // Add shadow for visibility on dark background
        }}>
          Game Over! Press Space to Restart.
        </div>
      )}

    </div>
  );
};

export default SkullJumpingGame;