"use client";
import { cn } from "../../lib/utils.js";
import { motion, AnimatePresence } from "motion/react";
import React, { useRef, useState, useEffect } from "react";

export const BackgroundBeamsWithCollision = ({
  children,
  className,
}) => {
  const containerRef = useRef(null);
  const parentRef = useRef(null);

  // More evenly distributed beams with better timing
  const beams = [
    {
      initialX: 80,
      translateX: 80,
      duration: 4,
      repeatDelay: 0.5,
      delay: 0,
      className: "h-8",
    },
    {
      initialX: 200,
      translateX: 200,
      duration: 5,
      repeatDelay: 0.8,
      delay: 0.5,
      className: "h-12",
    },
    {
      initialX: 320,
      translateX: 320,
      duration: 3.5,
      repeatDelay: 0.6,
      delay: 1,
      className: "h-6",
    },
    {
      initialX: 440,
      translateX: 440,
      duration: 4.5,
      repeatDelay: 0.7,
      delay: 1.5,
      className: "h-10",
    },
    {
      initialX: 560,
      translateX: 560,
      duration: 6,
      repeatDelay: 1,
      delay: 2,
      className: "h-14",
    },
    {
      initialX: 680,
      translateX: 680,
      duration: 3.8,
      repeatDelay: 0.9,
      delay: 2.5,
      className: "h-8",
    },
    {
      initialX: 800,
      translateX: 800,
      duration: 5.2,
      repeatDelay: 0.4,
      delay: 3,
      className: "h-6",
    },
    {
      initialX: 920,
      translateX: 920,
      duration: 4.2,
      repeatDelay: 0.8,
      delay: 0.2,
      className: "h-16",
    },
    {
      initialX: 1040,
      translateX: 1040,
      duration: 3.7,
      repeatDelay: 0.6,
      delay: 0.8,
      className: "h-10",
    },
    {
      initialX: 1160,
      translateX: 1160,
      duration: 5.5,
      repeatDelay: 0.5,
      delay: 1.2,
      className: "h-12",
    },
    {
      initialX: 1280,
      translateX: 1280,
      duration: 4.8,
      repeatDelay: 0.7,
      delay: 1.8,
      className: "h-8",
    },
    {
      initialX: 1400,
      translateX: 1400,
      duration: 3.9,
      repeatDelay: 0.9,
      delay: 2.2,
      className: "h-6",
    },
    {
      initialX: 160,
      translateX: 160,
      duration: 6.2,
      repeatDelay: 0.3,
      delay: 2.8,
      className: "h-14",
    },
    {
      initialX: 360,
      translateX: 360,
      duration: 4.7,
      repeatDelay: 0.8,
      delay: 3.2,
      className: "h-10",
    },
    {
      initialX: 720,
      translateX: 720,
      duration: 5.8,
      repeatDelay: 0.4,
      delay: 3.8,
      className: "h-12",
    },
  ];

  return (
    <div
      ref={parentRef}
      className={cn(
        "fixed inset-0 w-full h-full bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden",
        className
      )}
    >
      {beams.map((beam, index) => (
        <CollisionMechanism
          key={`beam-${index}-${beam.initialX}`}
          beamOptions={beam}
          containerRef={containerRef}
          parentRef={parentRef}
        />
      ))}

      {/* Content container */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>

      {/* Collision detection area at the very bottom edge */}
      <div
        ref={containerRef}
        className="absolute bottom-0 left-0 right-0 h-5 w-full pointer-events-none z-5"
      />
    </div>
  );
};

const CollisionMechanism = React.forwardRef(({ parentRef, containerRef, beamOptions = {} }, ref) => {
  const beamRef = useRef(null);
  const [collision, setCollision] = useState({
    detected: false,
    coordinates: null,
  });
  const [beamKey, setBeamKey] = useState(0);
  const [isColliding, setIsColliding] = useState(false);

  useEffect(() => {
    const checkCollision = () => {
      if (
        beamRef.current &&
        containerRef.current &&
        parentRef.current &&
        !isColliding
      ) {
        const beamRect = beamRef.current.getBoundingClientRect();
        const parentRect = parentRef.current.getBoundingClientRect();

        // Check if beam has reached the very bottom edge of the screen
        if (beamRect.bottom >= window.innerHeight - 30) {
          const relativeX = beamRect.left - parentRect.left + beamRect.width / 2;
          const relativeY = window.innerHeight - parentRect.top - 20;

          setCollision({
            detected: true,
            coordinates: {
              x: relativeX,
              y: relativeY,
            },
          });
          setIsColliding(true);

          // Quick reset for continuous animation
          setTimeout(() => {
            setIsColliding(false);
            setCollision({ detected: false, coordinates: null });
          }, 800);
        }
      }
    };

    const animationInterval = setInterval(checkCollision, 16); // 60fps check

    return () => clearInterval(animationInterval);
  }, [isColliding, containerRef]);

  return (
    <>
      <motion.div
        key={`beam-${beamKey}`}
        ref={beamRef}
        animate={{
          translateY: ["calc(-100vh - 100px)", "calc(100vh + 100px)"],
          translateX: beamOptions.translateX || "0px",
        }}
        transition={{
          duration: beamOptions.duration || 4,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
          delay: beamOptions.delay || 0,
          repeatDelay: beamOptions.repeatDelay || 0.5,
        }}
        className={cn(
          "absolute left-0 top-0 w-px rounded-full bg-gradient-to-t from-blue-400 via-cyan-400 to-transparent z-1 opacity-90",
          beamOptions.className || "h-12"
        )}
        style={{
          filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.7))",
          left: beamOptions.initialX || 0,
        }}
      />
      <AnimatePresence>
        {collision.detected && collision.coordinates && (
          <Explosion
            key={`explosion-${Date.now()}-${collision.coordinates.x}`}
            style={{
              left: `${collision.coordinates.x}px`,
              top: `${collision.coordinates.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
});

CollisionMechanism.displayName = "CollisionMechanism";

const Explosion = ({ ...props }) => {
  const spans = Array.from({ length: 30 }, (_, index) => ({
    id: index,
    initialX: 0,
    initialY: 0,
    directionX: Math.floor(Math.random() * 140 - 70),
    directionY: Math.floor(Math.random() * -100 - 20),
    scale: Math.random() * 1 + 0.5,
    duration: Math.random() * 1.5 + 0.6,
  }));

  return (
    <div {...props} className={cn("absolute z-50 h-4 w-4", props.className)}>
      {/* Main explosion flash */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 2, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute -inset-x-10 -inset-y-6 m-auto h-6 w-20 rounded-full bg-gradient-to-r from-transparent via-blue-300 to-transparent blur-sm"
      />
      
      {/* Bright center flash */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute -inset-3 m-auto h-6 w-6 rounded-full bg-cyan-200 blur-sm"
      />

      {/* Particle explosion */}
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ 
            x: span.initialX, 
            y: span.initialY, 
            opacity: 1, 
            scale: span.scale 
          }}
          animate={{
            x: span.directionX,
            y: span.directionY,
            opacity: 0,
            scale: 0,
          }}
          transition={{ 
            duration: span.duration, 
            ease: "easeOut",
            delay: Math.random() * 0.15
          }}
          className="absolute h-1.5 w-1.5 rounded-full bg-gradient-to-b from-blue-200 via-cyan-300 to-blue-400"
          style={{
            filter: "drop-shadow(0 0 3px rgba(59, 130, 246, 0.9))",
          }}
        />
      ))}

      {/* Secondary ring explosion */}
      {Array.from({ length: 12 }).map((_, index) => {
        const angle = (index * 30) * (Math.PI / 180);
        const distance = 50 + Math.random() * 30;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        return (
          <motion.span
            key={`ring-${index}`}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: x,
              y: y,
              opacity: 0,
              scale: 0,
            }}
            transition={{ 
              duration: 1.8, 
              ease: "easeOut",
              delay: 0.1 + Math.random() * 0.1
            }}
            className="absolute h-1 w-1 rounded-full bg-cyan-200"
            style={{
              filter: "drop-shadow(0 0 2px rgba(59, 130, 246, 0.8))",
            }}
          />
        );
      })}
    </div>
  );
};