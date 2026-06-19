/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, RotateCcw, Volume2, VolumeX, Shield, CircleDot, Info, Heart, Award, Sparkles, AlertTriangle, Maximize2, Minimize2 } from "lucide-react";
import { GameState, DroppingItem, DroppingItemType } from "../types";
import { audio } from "../utils/audio";

interface SadhanaGameProps {
  mode: GameState.PLAYING | GameState.ZEN_JAAP;
  activeJaaps: number;
  setActiveJaaps: (val: number | ((prev: number) => number)) => void;
  malasCompleted: number;
  setMalasCompleted: (val: number | ((prev: number) => number)) => void;
  onBackToHome: () => void;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  alpha: number;
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

export const getLevelDetailsByMalas = (malas: number) => {
  if (malas >= 5) {
    return { level: 5, title: "Acharya", label: "Preceptor Master 👑", multiplier: 3.5, speedMult: 1.6 };
  } else if (malas >= 3) {
    return { level: 4, title: "Sadhaka", label: "Pure Practitioner ✨", multiplier: 2.5, speedMult: 1.45 };
  } else if (malas >= 2) {
    return { level: 3, title: "Dhyani", label: "Focused Contemplator 🧘", multiplier: 2.0, speedMult: 1.3 };
  } else if (malas >= 1) {
    return { level: 2, title: "Upasaka", label: "Dedicated Seeker 🌿", multiplier: 1.5, speedMult: 1.15 };
  } else {
    return { level: 1, title: "Sravaka", label: "Beginner Devotee 🪷", multiplier: 1.0, speedMult: 1.0 };
  }
};

export default function SadhanaGame({
  mode,
  activeJaaps,
  setActiveJaaps,
  malasCompleted,
  setMalasCompleted,
  onBackToHome,
}: SadhanaGameProps) {
  const isZen = mode === GameState.ZEN_JAAP;

  // Game UI State
  const [isPlaying, setIsPlaying] = useState(false);
  const [concentration, setConcentration] = useState(100); // 0 to 100
  const [beads, setBeads] = useState<DroppingItem[]>([]);
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(audio.getMute());
  const [voiceEnabled, setVoiceEnabled] = useState(audio.getVoice());
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showTutorial, setShowTutorial] = useState(true);
  
  // Progression system states and floating popups
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [unlockedLevelDetails, setUnlockedLevelDetails] = useState<any>(null);

  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    const id = `ft-${Date.now()}-${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((ft) => ft.id !== id));
    }, 1200);
  };
  
  // Immersive Fullscreen and Swift Speed States
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [speedLevel, setSpeedLevel] = useState<"slow" | "standard" | "swift" | "mahaspeed">("slow");

  // References
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const spawnTimer = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const nextId = useRef<number>(0);

  // Quotes to show on game over or in between
  const currentQuote = "Pure thoughts are the only seeds that bloom into peaceful liberation. — Acharya Bhikshu";

  useEffect(() => {
    audio.init();
    audio.setMute(isMuted);
    audio.setVoiceEnabled(voiceEnabled);
  }, []);

  // Monitor malasCompleted to trigger game progression level up dialogs
  useEffect(() => {
    const currentDetails = getLevelDetailsByMalas(malasCompleted);
    if (isPlaying && currentDetails.level > level) {
      setLevel(currentDetails.level);
      setUnlockedLevelDetails(currentDetails);
      setShowLevelUp(true);
      
      // Play ascending sacred spiritual bells
      audio.playBell(261.63); // Accent C
      setTimeout(() => audio.playBell(329.63), 150); // Accent E
      setTimeout(() => audio.playBell(392.00), 300); // Accent G
      setTimeout(() => audio.playBell(523.25), 450); // Accent High C
      
      audio.speakChant(`Sadhana Level Up! You reached Level ${currentDetails.level}: ${currentDetails.title}`);
    } else {
      setLevel(currentDetails.level);
    }
  }, [malasCompleted, isPlaying]);

  // Update mute status in the global engine
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audio.setMute(nextMute);
  };

  const toggleVoice = () => {
    const nextVoice = !voiceEnabled;
    setVoiceEnabled(nextVoice);
    audio.setVoiceEnabled(nextVoice);
  };

  // Sound triggers
  const triggerBeadClick = (type: DroppingItemType) => {
    if (type.startsWith("vikaar")) {
      audio.playVikaarSound();
    } else if (type === "white_lotus" || type === "navkar_leaf" || type === "golden_bead") {
      audio.playSparkle();
      audio.speakChant(type === "navkar_leaf" ? "Namo Arihantanam" : "Om Bhikshu");
    } else {
      audio.playBell();
      audio.speakChant("Om Bhikshu");
    }
  };

  // Start the game loop
  const startGame = () => {
    audio.init();
    setIsPlaying(true);
    setConcentration(100);
    setBeads([]);
    setScore(0);
    setParticles([]);
    setShowTutorial(false);
    timeRef.current = 0;

    if (localStorage.getItem("drone_enabled") === "true") {
      audio.startDrone();
    }
  };

  const stopGame = () => {
    setIsPlaying(false);
    setBeads([]);
    audio.stopDrone();
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  };

  // Complete a full Mala
  const completeMalaRoutine = () => {
    setCelebrationActive(true);
    
    // Scale point rewards with progression level multiplier
    const currentDetails = getLevelDetailsByMalas(malasCompleted);
    const bonusPoints = Math.round(500 * currentDetails.multiplier);
    setScore((prev) => prev + bonusPoints);

    setMalasCompleted((prev) => prev + 1);
    setActiveJaaps(0);

    // Play traditional sweet spiritual bhajan melody and supreme bells
    audio.playBell(196); // Deep G bell
    setTimeout(() => audio.playBell(293.66), 330); 
    setTimeout(() => audio.playBhajanMelody(), 100);
    audio.speakChant("Om Bhikshu Om Bhikshu! Pranam Acharya Bhikshu!");

    // Exploding flower particles
    createCelebrationExplosion();

    setTimeout(() => {
      setCelebrationActive(false);
    }, 4500);
  };

  // Create standard click sparks
  const createSparks = (xPercent: number, yPercent: number, count = 12, color = "#fbbf24") => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const pxX = (xPercent / 100) * rect.width;
    const pxY = (yPercent / 100) * rect.height;

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      newParticles.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x: pxX,
        y: pxY,
        color,
        size: 3 + Math.random() * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Celebration petal/flower explosion
  const createCelebrationExplosion = () => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const colors = ["#ffffff", "#fef3c7", "#fca5a5", "#fde047", "#fed7aa"];
    const newParticles: Particle[] = [];

    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 6.0;
      newParticles.push({
        id: `p-celeb-${i}-${Date.now()}`,
        x: centerX,
        y: centerY,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Spawns dropping items matching духовный concepts
  const spawnItem = () => {
    if (!isPlaying) return;

    // Pick a random kind of item
    const roll = Math.random();
    let type: DroppingItemType = "bead";
    let size = 32;
    
    // Apply dynamic speed levels
    let speed = 0.6 + Math.random() * 0.8;
    let scaleModifier = 0.5;
    
    if (speedLevel === "slow") {
      speed = 0.25 + Math.random() * 0.15; // Beautiful slow meditative speed
      scaleModifier = 0.25;
    } else if (speedLevel === "swift") {
      speed = 1.4 + Math.random() * 1.1; // Fast, responsive speed
      scaleModifier = 0.9;
    } else if (speedLevel === "mahaspeed") {
      speed = 2.2 + Math.random() * 1.8; // Mahaspeed swift intense gameplay
      scaleModifier = 1.4;
    }
    let label = "Om";

    // Speed scales slightly with score
    const scoreFactor = Math.min(score / 150, 2.0) * scaleModifier;
    speed += scoreFactor;

    if (roll < 0.50) {
      // 50% Standard Bead
      type = "bead";
      size = 86;
      label = "Om";
    } else if (roll < 0.65) {
      // 15% Golden Bead (High Auspicion)
      type = "golden_bead";
      size = 80;
      label = "श्री";
    } else if (roll < 0.72) {
      // 7% Navkar Leaf
      type = "navkar_leaf";
      size = 86;
      label = "मंत्र";
    } else if (roll < 0.81) {
      // 9% White Lotus
      type = "white_lotus";
      size = 84;
      label = "शुद्ध";
    } else {
      // 19% Impure mental traits (Vikaar) - only harmful in Standard Concentration mode
      const vikaars: DroppingItemType[] = ["vikaar_anger", "vikaar_ego", "vikaar_greed"];
      type = vikaars[Math.floor(Math.random() * vikaars.length)];
      size = 76;
      speed += (speedLevel === "mahaspeed" ? 0.7 : speedLevel === "swift" ? 0.5 : 0.25); // Vikaars drop slightly faster representing emotional shifts
    }

    // Apply level-based speed multiplier for progression difficulty and high engagement
    const levelDetails = getLevelDetailsByMalas(malasCompleted);
    speed *= levelDetails.speedMult;

    const newItem: DroppingItem = {
      id: `item-${nextId.current++}`,
      type,
      x: 10 + Math.random() * 80, // percentage x: 10% to 90%
      y: -5,                      // start above
      speed,
      size,
      label,
      angle: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.05,
      wobbleAmount: 4 + Math.random() * 8,
      wobbleOffset: Math.random() * 100,
    };

    setBeads((prev) => [...prev, newItem]);
  };

  // Main game tick
  useEffect(() => {
    if (!isPlaying) return;

    const gameTick = () => {
      timeRef.current += 1;

      // Drop beads and update positions
      setBeads((prevBeads) => {
        const updatedBeads: DroppingItem[] = [];

        for (const item of prevBeads) {
          const nextY = item.y + item.speed;

          // Check if bead missed (reaches bottom)
          if (nextY >= 102) {
            // Unclicked sacred beads reduce concentration in non-Zen mode
            if (!isZen) {
              const isPure = !item.type.startsWith("vikaar");
              if (isPure && item.type !== "white_lotus") {
                setConcentration((c) => Math.max(0, c - 4)); // Small penalty for letting beads drop
              }
            }
            continue; // removes it
          }

          updatedBeads.push({
            ...item,
            y: nextY,
            angle: item.angle + 0.01,
          });
        }
        return updatedBeads;
      });

      // Update particle positions
      setParticles((prevParticles) => {
        const updatedParticles: Particle[] = [];
        for (const p of prevParticles) {
          const nextX = p.x + p.vx;
          const nextY = p.y + p.vy + 0.15; // include slight gravity
          const nextAlpha = p.alpha - 0.02; // fade out

          if (nextAlpha > 0) {
            updatedParticles.push({
              ...p,
              x: nextX,
              y: nextY,
              alpha: nextAlpha,
            });
          }
        }
        return updatedParticles;
      });

      // Periodic spawn
      let spawnFrequency = isZen ? 38 : 45; // slightly faster spawning in Zen mode
      if (speedLevel === "slow") {
        spawnFrequency = isZen ? 60 : 70; // Spawns are slower and more spaced out!
      } else if (speedLevel === "swift") {
        spawnFrequency = isZen ? 22 : 28;
      } else if (speedLevel === "mahaspeed") {
        spawnFrequency = isZen ? 14 : 18;
      }
      if (timeRef.current % spawnFrequency === 0) {
        spawnItem();
      }

      animationFrameId.current = requestAnimationFrame(gameTick);
    };

    animationFrameId.current = requestAnimationFrame(gameTick);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, isZen, score, speedLevel]);

  // Handle concentration life drop
  useEffect(() => {
    if (!isZen && concentration <= 0 && isPlaying) {
      stopGame();
      // Speak final lesson
      audio.speakChant("Om Shanti. Breathe deeply and rebuild your focus.");
    }
  }, [concentration, isZen, isPlaying]);

  // Click handler
  const handleItemClick = (id: string, type: DroppingItemType, x: number, y: number) => {
    if (!isPlaying) return;

    // Trigger visual feedback and sound
    triggerBeadClick(type);

    let pointColor = "#f59e0b";
    let changeVal = 1;
    let pointsGained = 0;
    let floatText = "";

    // Obtain multiplier from current spiritual rank
    const currentDetails = getLevelDetailsByMalas(malasCompleted);
    const multi = currentDetails.multiplier;

    switch (type) {
      case "bead":
        pointColor = "#e67e22"; // saffron amber
        changeVal = 1;
        pointsGained = Math.round(10 * multi);
        floatText = `+${pointsGained}`;
        break;
      case "golden_bead":
        pointColor = "#fbbf24"; // glittering gold
        changeVal = 5;
        pointsGained = Math.round(50 * multi);
        floatText = `+${pointsGained} ✨`;
        break;
      case "navkar_leaf":
        pointColor = "#22c55e"; // soft leaf green
        changeVal = 9;
        pointsGained = Math.round(100 * multi);
        floatText = `+${pointsGained} 🌿`;
        break;
      case "white_lotus":
        pointColor = "#ffffff"; // pure white halo
        changeVal = 0; // lotus increases health
        pointsGained = Math.round(30 * multi);
        floatText = `+${pointsGained} 🪷 (+15 Focus)`;
        setConcentration((c) => Math.min(100, c + 15));
        break;
      case "vikaar_anger":
      case "vikaar_ego":
      case "vikaar_greed":
        pointColor = "#ef4444"; // impure red
        changeVal = 0;
        pointsGained = -25;
        floatText = `-25 🛑`;
        if (!isZen) {
          setConcentration((c) => Math.max(0, c - 20));
        }
        break;
    }

    // Apply points change (never let absolute score go below 0)
    setScore((s) => Math.max(0, s + pointsGained));

    // Instantly spawn floating text at click coordinates of target particle
    if (floatText) {
      addFloatingText(floatText, x, y, pointColor);
    }

    // Update sacred Jaap counts
    if (!type.startsWith("vikaar") && type !== "white_lotus") {
      setActiveJaaps((prev) => {
        const currentCount = prev + changeVal;
        if (currentCount >= 108) {
          // completed complete Mala!
          setTimeout(completeMalaRoutine, 100);
          return 0;
        }
        return currentCount;
      });
    }

    createSparks(x, y, type === "golden_bead" ? 20 : 10, pointColor);
    setBeads((prev) => prev.filter((b) => b.id !== id));
  };

  // Get item styles and icons
  const getItemVisuals = (type: DroppingItemType) => {
    switch (type) {
      case "bead":
        return {
          bgColor: "bg-gradient-to-br from-amber-100 via-amber-350 to-amber-500 border-amber-400",
          textColor: "text-amber-950 font-extrabold",
          shadow: "shadow-[0_0_12px_rgba(245,158,11,0.5)] hover:shadow-[0_0_20px_rgba(245,158,11,0.85)]",
          shape: "rounded-full scale-100 border-2",
        };
      case "golden_bead":
        return {
          bgColor: "bg-gradient-to-tr from-yellow-200 via-amber-400 to-yellow-600 border-yellow-300",
          textColor: "text-yellow-950 font-black font-serif animate-pulse text-[11px]",
          shadow: "shadow-[0_0_22px_rgba(251,191,36,0.9)] border-2 border-amber-300",
          shape: "rounded-full scale-110",
        };
      case "navkar_leaf":
        return {
          bgColor: "bg-gradient-to-br from-emerald-450 via-green-300 to-emerald-600 border-emerald-100",
          textColor: "text-emerald-950 text-[10px] font-sans font-black uppercase tracking-tight",
          shadow: "shadow-[0_0_15px_rgba(16,185,129,0.6)]",
          shape: "rounded-tr-[15px] rounded-bl-[15px] rounded-br-[4px] rounded-tl-[4px] rotate-45 border-2",
        };
      case "white_lotus":
        return {
          bgColor: "bg-gradient-to-br from-white via-slate-50 to-amber-50/50 border-slate-300",
          textColor: "text-stone-900 text-[10px] font-black tracking-tight",
          shadow: "shadow-[0_0_18px_rgba(255,255,255,0.95)] border-[3px]",
          shape: "rounded-full scale-105 border-double",
        };
      case "vikaar_anger":
        return {
          bgColor: "bg-gradient-to-tr from-stone-800 via-red-950 to-stone-900 border-red-900",
          textColor: "text-red-300 text-[9px] font-bold tracking-tight uppercase",
          shadow: "shadow-[0_3px_8px_rgba(0,0,0,0.6)] border-2",
          shape: "rounded-lg rotate-12 scale-100",
          customLabel: "क्रोध (Anger)",
        };
      case "vikaar_ego":
        return {
          bgColor: "bg-gradient-to-br from-stone-800 via-stone-950 to-stone-700 border-stone-800",
          textColor: "text-stone-300 text-[9px] font-bold tracking-tight uppercase",
          shadow: "shadow-[0_3px_8px_rgba(0,0,0,0.6)] border-2",
          shape: "rounded-sm rotate-45 scale-95",
          customLabel: "अहंकार (Ego)",
        };
      case "vikaar_greed":
        return {
          bgColor: "bg-gradient-to-tr from-stone-800 via-stone-900 to-emerald-950 border-stone-800",
          textColor: "text-stone-300 text-[8px] font-bold tracking-tight uppercase",
          shadow: "shadow-[0_3px_8px_rgba(0,0,0,0.6)] border-2",
          shape: "rounded-full border-2",
          customLabel: "लोभ (Greed)",
        };
    }
  };

  const triggerManualBeadChant = (beadIndex: number) => {
    // Only allow clicking beads if playing or if Zen mode is true
    const ragaNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
    const freq = ragaNotes[beadIndex % ragaNotes.length];
    audio.playBell(freq);
    audio.speakChant("Om Bhikshu");
    
    // Apply score multiplier based on spiritual level
    const currentDetails = getLevelDetailsByMalas(malasCompleted);
    const manualPoints = Math.round(15 * currentDetails.multiplier);
    setScore((prev) => prev + manualPoints);

    // Show beautiful centered floating indicator
    addFloatingText(`+${manualPoints} ✨`, 50, 48, "#fbbf24");
    
    // Spawn sparks in the center of the screen
    createSparks(50, 50, 16, "#f59e0b");

    setActiveJaaps((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= 108) {
        setTimeout(completeMalaRoutine, 120);
        return 0; // reset
      }
      return nextCount;
    });
  };

  const renderCentralBigMala = () => {
    const radius = 105;
    const center = 125;
    const listBeads = [];

    for (let i = 0; i < 108; i++) {
      const angle = (i * 2 * Math.PI) / 108 - Math.PI / 2; // start from top center
      const cx = center + radius * Math.cos(angle);
      const cy = center + radius * Math.sin(angle);

      const isChanted = i < activeJaaps;
      const isActive = i === activeJaaps;

      listBeads.push(
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r={isActive ? 6.5 : isChanted ? 4.5 : 3.0}
          className={`${
            isActive
              ? "fill-orange-500 stroke-yellow-200 stroke-[1.8px] cursor-pointer"
              : isChanted
              ? "fill-amber-500 stroke-amber-600/60 stroke-[1.0px] cursor-pointer shadow-md"
              : "fill-stone-300/40 hover:fill-amber-300 stroke-stone-400/20 stroke-[0.5px] cursor-pointer"
          }`}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          whileHover={isPlaying ? {} : { scale: 1.4 }}
          whileTap={isPlaying ? {} : { scale: 0.85 }}
          onClick={(e) => {
            if (isPlaying) return; // Prevent clicks while playing
            e.stopPropagation();
            triggerManualBeadChant(i);
          }}
          animate={isActive ? { scale: [1, 1.3, 1] } : {}}
          transition={isActive ? { repeat: Infinity, duration: 1.5 } : {}}
        />
      );
    }

    return (
      <div 
        className={`relative flex items-center justify-center transition-all duration-700 ${
          isPlaying ? "pointer-events-none opacity-20 scale-[0.6]" : "pointer-events-auto opacity-100 scale-100"
        }`} 
        style={{ width: "350px", height: "350px" }}
      >
        {/* Soft immersive background glow */}
        <div className="absolute inset-0 bg-amber-500/5 blur-[70px] rounded-full pointer-events-none" />
        
        <motion.svg 
          viewBox="0 0 250 250" 
          className="w-[280px] h-[280px] md:w-[340px] md:h-[340px] z-10 filter drop-shadow-[0_15px_30px_rgba(245,158,11,0.22)] select-none animate-fade-in"
          animate={{ rotate: 360 }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        >
          {/* Main thread ring line */}
          <circle cx="125" cy="125" r={radius} className="stroke-amber-500/20 stroke-[1px]" fill="none" strokeDasharray="3,3" />
          <circle cx="125" cy="125" r={radius - 8} className="stroke-stone-700/10 stroke-[0.5px]" fill="none" />
          {listBeads}
        </motion.svg>

        {/* Center elegant HUD display & silhouette icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
          <div className="opacity-15 scale-[0.6] md:scale-75 flex flex-col items-center justify-center mt-[-15px] select-none">
            <svg width="85" height="85" viewBox="0 0 200 200" fill="none" className="text-amber-600">
              <path d="M40 160 C70 180, 130 180, 160 160 C140 150, 60 150, 40 160 Z" fill="currentColor" />
              <path d="M100 60 C80 90, 40 110, 50 150 C80 140, 95 110, 100 60 Z" fill="currentColor" />
              <path d="M100 60 C120 90, 160 110, 150 150 C120 140, 105 110, 100 60 Z" fill="currentColor" />
              <circle cx="100" cy="85" r="18" fill="currentColor" />
              <path d="M100 103 L100 145 C100 145, 75 145, 65 135 C65 135, 75 112, 100 103 Z" fill="currentColor" />
              <path d="M100 103 L100 145 C100 145, 125 145, 135 135 C135 135, 125 112, 100 103 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="text-center mt-[-8px]">
            <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-amber-500/80 leading-none block">Mala Chants</span>
            <span className="block text-xl md:text-2xl font-black font-mono text-amber-600 tracking-wide tabular-nums leading-none mt-1 shadow-sm">
              {activeJaaps}
            </span>
            <span className="text-[9px] text-stone-400 font-medium font-sans block mt-0.5">/ 108</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6" id="sadhana-game-layout">
      {/* Upper Status Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="game-stats-grid">
        {/* Count display */}
        <div className="bg-white/80 backdrop-blur border border-amber-100 p-4 rounded-2xl shadow-sm flex items-center justify-between" id="bead-count-pnl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <CircleDot className="w-6 h-6 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <p className="text-xs text-amber-600/80 uppercase font-mono tracking-wider font-semibold">Active Jaap</p>
              <h3 className="text-2xl font-bold text-amber-900 font-sans tracking-tight">
                {activeJaaps} <span className="text-xs text-amber-500 font-normal">/ 108</span>
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex gap-0.5 items-center">
              {[...Array(5)].map((_, i) => {
                const fraction = 108 / 5;
                const active = activeJaaps >= i * fraction;
                return (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full border ${
                      active ? "bg-amber-500 border-amber-600 shadow-sm" : "bg-stone-50 border-stone-200"
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-[10px] text-stone-400 mt-1 uppercase font-mono">Spiritual Progress</p>
          </div>
        </div>

        {/* Completed Malas Display */}
        <div className="bg-white/80 backdrop-blur border border-amber-100 p-4 rounded-2xl shadow-sm flex items-center justify-between" id="completed-mala-pnl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-amber-600/80 uppercase font-mono tracking-wider font-semibold">Completed Malas</p>
              <h3 className="text-2xl font-bold text-amber-900 font-sans tracking-tight">
                {malasCompleted} <span className="text-xs text-amber-500 font-normal">Full Rosary</span>
              </h3>
            </div>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-amber-50 text-amber-700 font-mono text-sm font-bold border border-amber-200/50 flex-shrink-0">
            {malasCompleted}
          </div>
        </div>

        {/* Health / Concentration Bar */}
        <div className="bg-white/80 backdrop-blur border border-amber-100 p-4 rounded-2xl shadow-sm flex flex-col justify-center" id="concen-meter-pnl">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-stone-500 font-mono font-medium flex items-center gap-1">
              <Heart className={`w-3.5 h-3.5 text-rose-500 ${isPlaying && !isZen ? 'animate-pulse' : ''}`} />
              {isZen ? "ZEN ATTAINMENT" : "DHYANA FOCUS"}
            </span>
            <span className="text-xs font-mono font-bold text-stone-700">
              {isZen ? "∞" : `${concentration}%`}
            </span>
          </div>

          {isZen ? (
            <div className="h-3 bg-gradient-to-r from-teal-400 via-amber-200 to-rose-400 rounded-full w-full opacity-80" />
          ) : (
            <div className="h-3 bg-stone-100 rounded-full w-full overflow-hidden border border-stone-200/50">
              <motion.div
                className={`h-full ${
                  concentration > 50
                    ? "bg-amber-500"
                    : concentration > 25
                    ? "bg-orange-500"
                    : "bg-red-500 animate-pulse"
                }`}
                animate={{ width: `${concentration}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
          <span className="text-[9px] text-stone-400 mt-1 uppercase font-mono text-right">
            {isZen ? "Tranquil focus - No penalties" : "Harvest Pure • Avoid Impurities"}
          </span>
        </div>

        {/* Spiritual Progression Level Panel */}
        <div className="bg-white/80 backdrop-blur border border-amber-100 p-4 rounded-2xl shadow-sm flex flex-col justify-center" id="spiritual-level-pnl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-amber-600 font-mono font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              RANK: Level {getLevelDetailsByMalas(malasCompleted).level}
            </span>
            <span className="text-xs font-mono font-bold text-amber-700 uppercase">
              {getLevelDetailsByMalas(malasCompleted).title}
            </span>
          </div>

          {/* Progress bar to next rank */}
          {(() => {
            const currentMalas = malasCompleted;
            let nextTarget = 1;
            let prevBoundary = 0;
            if (currentMalas >= 5) {
              nextTarget = 999;
              prevBoundary = 5;
            } else if (currentMalas >= 3) {
              nextTarget = 5;
              prevBoundary = 3;
            } else if (currentMalas >= 2) {
              nextTarget = 3;
              prevBoundary = 2;
            } else if (currentMalas >= 1) {
              nextTarget = 2;
              prevBoundary = 1;
            } else {
              nextTarget = 1;
              prevBoundary = 0;
            }
            const range = nextTarget - prevBoundary;
            const progressPct = nextTarget === 999 ? 100 : Math.min(100, Math.max(0, ((currentMalas - prevBoundary) / range) * 100));
            return (
              <div className="h-3 bg-stone-100 rounded-full w-full overflow-hidden border border-stone-200/50">
                <div 
                  className="h-full bg-gradient-to-r from-amber-450 to-amber-600 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            );
          })()}

          <div className="text-[9px] text-stone-400 mt-1 font-mono flex justify-between uppercase">
            <span>Score: {getLevelDetailsByMalas(malasCompleted).multiplier}x • {getLevelDetailsByMalas(malasCompleted).label.split(" ")[0]}</span>
            <span>
              {malasCompleted >= 5 ? "MAX" : `Next: ${malasCompleted >= 3 ? 5 : malasCompleted >= 2 ? 3 : malasCompleted >= 1 ? 2 : 1}`}
            </span>
          </div>
        </div>
      </div>

      {/* Main interactive sandhana board */}
      <div
        className={`${
          isFullscreen
            ? "fixed inset-0 z-50 bg-stone-950 p-4 md:p-8 flex flex-col items-center justify-between select-none"
            : "relative w-full h-[78vh] md:h-[82vh] bg-gradient-to-b from-amber-50/20 via-white to-amber-50/40 rounded-3xl border-4 border-amber-100/70 overflow-hidden shadow-sm flex flex-col items-center justify-center select-none"
        }`}
        id="meditation-playing-arena"
      >
        {/* Soft background Zen motifs */}
        <div className="absolute inset-0 z-0 opacity-10 flex items-center justify-center pointer-events-none">
          <div className="w-[450px] h-[450px] border-4 border-dashed border-amber-700 rounded-full animate-spin" style={{ animationDuration: "120s" }} />
          <div className="absolute w-[350px] h-[350px] border border-amber-600 rounded-full animate-spin" style={{ animationDuration: "80s", animationDirection: "reverse" }} />
        </div>

        {/* Center Interactive Giant Mala Visualizer & Devotion Board */}
        <div className="absolute z-0 flex flex-col items-center justify-center select-none">
          {renderCentralBigMala()}
        </div>

        {/* Floating Quick Settings Hud (Top left of playing area under windowed mode) */}
        {!isFullscreen && (
          <div className="absolute top-4 left-4 z-40 bg-white/95 border border-amber-200/50 px-3 py-2 rounded-2xl shadow-md flex items-center gap-2.5 text-xs font-mono pointer-events-auto">
            <span className="text-amber-900 font-extrabold uppercase text-[9px] tracking-wide shrink-0">Chant Drop Speed:</span>
            <div className="flex bg-stone-100 rounded-xl p-0.5 border border-stone-200 select-none">
              <button
                type="button"
                onClick={() => {
                  setSpeedLevel("slow");
                  audio.speakChant("Slow speed");
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                  speedLevel === "slow" ? "bg-amber-600 text-white shadow-xs" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                🧘 Slow
              </button>
              <button
                type="button"
                onClick={() => {
                  setSpeedLevel("standard");
                  audio.speakChant("Standard speed");
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                  speedLevel === "standard" ? "bg-amber-600 text-white shadow-xs" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                1x Std
              </button>
              <button
                type="button"
                onClick={() => {
                  setSpeedLevel("swift");
                  audio.speakChant("Swift speed");
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                  speedLevel === "swift" ? "bg-amber-600 text-white shadow-xs" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Swift
              </button>
              <button
                type="button"
                onClick={() => {
                  setSpeedLevel("mahaspeed");
                  audio.speakChant("Hyper speed");
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                  speedLevel === "mahaspeed" ? "bg-amber-600 text-white shadow-xs" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Hyper ⚡
              </button>
            </div>
          </div>
        )}

        {/* Floating Quick Full Screen button */}
        {!isFullscreen && (
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 z-40 p-2 bg-gradient-to-r from-amber-550 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold pointer-events-auto cursor-pointer border border-amber-600/50"
            title="Go Full Screen"
            id="btn-enter-inline-fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Full Screen</span>
          </button>
        )}

        {/* Dynamic Translucent Hud overlay when isFullscreen is TRUE */}
        {isFullscreen && (
          <div className="absolute top-2 left-2 right-2 md:top-4 md:left-4 md:right-4 z-45 bg-stone-900/90 border border-stone-800 py-1.5 px-3 md:py-2 md:px-4 rounded-xl md:rounded-2xl flex flex-row flex-wrap gap-2 items-center justify-between text-white backdrop-blur-md pointer-events-auto shadow-xl">
            {/* Tiny brand badge on medium screens */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <div>
                <span className="text-[9px] font-mono font-bold text-amber-500 block uppercase tracking-wider leading-none">Sadhana Space</span>
              </div>
            </div>
            
            {/* Inline compact stats */}
            <div className="flex flex-row items-center gap-x-3 gap-y-1 text-[11px] font-mono overflow-x-auto py-0.5 shrink">
              <div className="flex items-center gap-1">
                <span className="text-stone-400 text-[9px] uppercase">Chants:</span>
                <span className="font-bold text-amber-400">{activeJaaps}/108</span>
              </div>
              <span className="text-stone-600">|</span>
              <div className="flex items-center gap-1">
                <span className="text-stone-400 text-[9px] uppercase">Malas:</span>
                <span className="font-bold text-stone-200">{malasCompleted}</span>
              </div>
              {!isZen && (
                <>
                  <span className="text-stone-600">|</span>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-400 text-[9px] uppercase">Focus:</span>
                    <span className={`font-bold ${concentration <= 30 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
                      {concentration}%
                    </span>
                  </div>
                </>
              )}
              <span className="text-stone-600">|</span>
              <div className="flex items-center gap-1">
                <span className="text-stone-400 text-[9px] uppercase">Lvl:</span>
                <span className="font-bold text-amber-500 text-[10px] flex items-center gap-0.5">
                  {getLevelDetailsByMalas(malasCompleted).level} <span className="text-[8px] bg-amber-950/40 text-amber-300 px-1 py-0.2 rounded leading-none hidden sm:inline">{getLevelDetailsByMalas(malasCompleted).title}</span>
                </span>
              </div>
              <span className="text-stone-600">|</span>
              <div className="flex items-center gap-1">
                <span className="text-stone-400 text-[9px] uppercase">Score:</span>
                <span className="font-bold text-amber-300">{score}</span>
              </div>
            </div>

            {/* Compact controls */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Drop Speed buttons (super compact text) */}
              <div className="flex bg-stone-950 border border-stone-800 rounded-md p-0.5 select-none text-[8px]">
                <button
                  type="button"
                  onClick={() => {
                    setSpeedLevel("slow");
                    audio.speakChant("Slow speed");
                  }}
                  className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    speedLevel === "slow" ? "bg-amber-600 text-white" : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  🧘 Slow
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpeedLevel("standard");
                    audio.speakChant("Standard speed");
                  }}
                  className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    speedLevel === "standard" ? "bg-amber-600 text-white" : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Std
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpeedLevel("swift");
                    audio.speakChant("Swift speed");
                  }}
                  className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    speedLevel === "swift" ? "bg-amber-600 text-white" : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Swift
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpeedLevel("mahaspeed");
                    audio.speakChant("Hyper speed");
                  }}
                  className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    speedLevel === "mahaspeed" ? "bg-amber-600 text-white" : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Hyper⚡
                </button>
              </div>

              <div className="w-[1px] h-4 bg-stone-800 shrink-0" />

              <button
                type="button"
                onClick={toggleMute}
                className={`py-0.5 px-2 rounded border text-[9px] font-medium transition-colors cursor-pointer shrink-0 ${
                  isMuted ? "border-stone-800 text-stone-500 bg-stone-900/50" : "border-amber-900/50 text-amber-400 bg-amber-950/20"
                }`}
              >
                {isMuted ? "Mute" : "Sound"}
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="py-1 px-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-heavy font-mono rounded-xl flex items-center gap-1 cursor-pointer pointer-events-auto shadow"
                title="Minimize screen"
                id="btn-immersive-exit"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Minimize</span>
              </button>
            </div>
          </div>
        )}

        {/* Rendering Particles Canvas Style or CSS Elements */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute z-30 pointer-events-none rounded-full"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.alpha,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        {/* Standard Gameplay Overlays */}
        <AnimatePresence>
          {!isPlaying && concentration > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-stone-50/80 backdrop-blur-md z-45 flex flex-col items-center justify-center p-6 text-center"
              id="game-start-overlay"
            >
              <div className="max-w-md bg-white border border-amber-100 p-8 rounded-3xl shadow-xl flex flex-col items-center">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4 shadow-inner">
                  <CircleDot className="w-10 h-10 animate-pulse" />
                </div>
                
                <h2 className="text-2xl font-bold text-amber-950 font-sans tracking-tight mb-2">
                  {isZen ? "Zen Jaap Meditation" : "Concentration Sadhana"}
                </h2>
                <p className="text-xs text-stone-500 font-light mb-6 leading-relaxed">
                  {isZen
                    ? "A calm, endless space to count your chants. No concentration penalties. Focus purely on the beautiful temple bells and divine 'Om Bhikshu' chants with slow-paced meditative dropping particles."
                    : "Train your sensory focus. Catch dropping sacred grains, beads, and white lotuses to fulfill your 108 count while avoiding negative mental desires (Vikaars)."}
                </p>

                {showTutorial && (
                  <div className="grid grid-cols-2 gap-3 w-full bg-stone-50 p-4 rounded-2xl border border-stone-200/50 mb-6 text-left">
                    <div className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-amber-400 mt-0.5 text-[10px] flex items-center justify-center text-amber-950 font-bold">Om</div>
                      <div className="text-[10px] text-stone-500"><span className="font-semibold text-stone-700">Amber Beads:</span> standard chanting grains (+1 Jaap).</div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 mt-0.5 border border-emerald-400 text-[10px] flex items-center justify-center text-emerald-800 font-bold">मंत्र</div>
                      <div className="text-[10px] text-stone-500"><span className="font-semibold text-stone-700">Navkar Leaves:</span> sacred leaf of mantra lines (+9 Jaap).</div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-white border border-slate-300 mt-0.5 text-[10px] flex items-center justify-center text-slate-700 font-bold">शुद्ध</div>
                      <div className="text-[10px] text-stone-500"><span className="font-semibold text-stone-700">White Lotus:</span> purity that restores focus/Dhyana.</div>
                    </div>
                    {!isZen && (
                      <div className="flex gap-2 items-start">
                        <div className="w-5 h-5 rounded bg-stone-800 border border-red-900 mt-0.5 text-[8px] flex items-center justify-center text-red-400 font-bold">K</div>
                        <div className="text-[10px] text-stone-500"><span className="font-semibold text-red-500">Impure Thoughts:</span> Anger/Ego; avoid tapping these!</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4 w-full" id="game-modes-launcher">
                  <button
                    onClick={startGame}
                    className="flex-1 py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md hover:shadow-lg font-medium transition-all flex items-center justify-center gap-2 pointer-events-auto cursor-pointer"
                    id="btn-sadhana-start"
                  >
                    <Play className="w-4 h-4 fill-current animate-bounce" /> Begin Sadhana
                  </button>
                  <button
                    onClick={onBackToHome}
                    className="py-3 px-5 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl font-medium transition-all pointer-events-auto cursor-pointer"
                    id="btn-return-desk"
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Game Over / Focus Distracted Screen */}
          {!isZen && concentration <= 0 && !isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/95 backdrop-blur-md z-45 flex flex-col items-center justify-center p-6 text-center shadow-inner"
              id="game-over-overlay"
            >
              <div className="max-w-md bg-stone-950 border border-stone-800 p-8 rounded-3xl shadow-xl text-white flex flex-col items-center">
                <div className="w-16 h-16 bg-red-950/40 text-red-500 border border-red-900/40 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-bold font-sans text-stone-100 mb-1">Focus Distracted (Vikaars Entered)</h3>
                <p className="text-xs text-red-400 uppercase font-mono tracking-wider font-semibold mb-4">Dhyana Concentration depleted</p>
                
                {/* Spiritual guidance box */}
                <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl text-left mb-6 text-xs leading-relaxed text-stone-300">
                  <p className="italic text-stone-400 mb-2 font-serif">"{currentQuote}"</p>
                  <span className="text-[10px] text-amber-500 font-mono block">Acharya Bhikshu Teaching:</span>
                  To control anger, ego, and greed, one must practice equanimity. Every time negative energy drops, keep your hand steady and let it pass through without reacting. Let only pure thoughts reside.
                </div>

                <div className="flex gap-4 w-full justify-center">
                  <button
                    onClick={startGame}
                    className="py-2.5 px-6 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md font-medium transition-all flex items-center gap-1.5 pointer-events-auto cursor-pointer"
                    id="btn-btn-retry"
                  >
                    <RotateCcw className="w-4 h-4" /> Retry Sadhana
                  </button>
                  <button
                    onClick={() => {
                      setIsFullscreen(false);
                      onBackToHome();
                    }}
                    className="py-2.5 px-6 border border-stone-700 hover:bg-stone-900 text-stone-300 rounded-xl font-medium transition-all pointer-events-auto cursor-pointer"
                    id="btn-btn-return"
                  >
                    Exit
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Celebration Ring / Completion Canvas overlay */}
          {celebrationActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-yellow-500/15 backdrop-blur-[2px] z-40 pointer-events-none flex flex-col items-center justify-center text-center"
              id="game-celebration-canvas"
            >
              <motion.div
                initial={{ scale: 0.6, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="bg-white/95 border-2 border-amber-400 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-2 max-w-sm pointer-events-auto"
              >
                <div className="relative">
                  <Sparkles className="w-14 h-14 text-yellow-500 animate-bounce" />
                  <div className="absolute inset-0 border border-amber-300 rounded-full animate-ping scale-150 opacity-40" />
                </div>
                <h2 className="text-xl font-bold font-sans text-amber-950">Mala Completed!</h2>
                <p className="text-xs text-amber-700 uppercase font-mono tracking-widest font-bold">108 sacred chants</p>
                <div className="w-full h-[1px] bg-amber-100 my-2" />
                <p className="text-[11px] text-stone-500 leading-normal italic">
                  "May the pure energy of your chanting bring peace, calmness, and goodwill to all beings in this cosmos. Om Bhikshuji!"
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Level Up Banner overlay */}
          {showLevelUp && unlockedLevelDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/85 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-4 pointer-events-auto shadow-2xl"
              id="game-levelup-overlay"
            >
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 15 }}
                className="bg-gradient-to-b from-amber-900/95 via-stone-900/95 to-stone-950/95 border-2 border-amber-500/60 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 max-w-sm pointer-events-auto"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/40 animate-spin" style={{ animationDuration: "14s" }}>
                    <Sparkles className="w-8 h-8 text-amber-400" />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -inset-2 border-2 border-dashed border-amber-300 rounded-full pointer-events-none" 
                  />
                </div>
                
                <div>
                  <span className="text-[10px] text-amber-400 font-mono font-black uppercase tracking-widest block mb-1">Mala Sadhana Upgrade</span>
                  <h2 className="text-2xl font-black font-sans text-stone-50 leading-tight">ASCENDED RANK!</h2>
                </div>

                <div className="bg-amber-950/35 border border-amber-500/30 px-5 py-3 rounded-2xl w-full text-center">
                  <span className="text-stone-300 text-[11px] font-mono block uppercase bg-stone-900/20 py-0.5 rounded">Spiritual Promotion</span>
                  <span className="text-lg font-bold text-amber-300 block uppercase font-serif tracking-tight mt-1">
                    Level {unlockedLevelDetails.level}: {unlockedLevelDetails.title}
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-light italic mt-1 block">"{unlockedLevelDetails.label}"</span>
                </div>

                <div className="text-left w-full space-y-2 text-xs text-stone-300 bg-stone-900/50 p-3 rounded-xl border border-stone-850">
                  <div className="flex justify-between">
                    <span>⚡ Thought Speed Rate:</span>
                    <span className="font-bold text-amber-400 font-mono">+{Math.round((unlockedLevelDetails.speedMult - 1) * 105)}% Speed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>💎 Devotion Score Boost:</span>
                    <span className="font-bold text-amber-400 font-mono">{unlockedLevelDetails.multiplier}x Points</span>
                  </div>
                </div>

                <p className="text-[11px] text-amber-200/80 leading-normal italic text-center font-serif">
                  "As the mind grows purer, the speed of meditative focus ascends. Keep your focus steady and conquer the Vikaars!"
                </p>

                <button
                  type="button"
                  onClick={() => setShowLevelUp(false)}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer border border-amber-450/30"
                >
                  Continue Sadhana
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Dropping Elements Frame */}
        <div
          ref={gameAreaRef}
          className="relative w-full h-full z-10 overflow-hidden cursor-crosshair pb-12"
          id="dropping-beads-container"
        >
          {isPlaying && beads.map((item) => {
            const visual = getItemVisuals(item.type);
            const isVikaar = item.type.startsWith("vikaar");
            
            // Adjust X with wiggle/wobble over time
            const timePassed = timeRef.current;
            const wobbleX = Math.sin(timePassed * item.wobbleSpeed + item.wobbleOffset) * item.wobbleAmount;
            const finalLeft = `calc(${item.x}% + ${wobbleX}px)`;

            return (
              <div
                key={item.id}
                className={`absolute select-none cursor-pointer flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${visual.bgColor} ${visual.shape} ${visual.shadow}`}
                style={{
                  left: finalLeft,
                  top: `${item.y}%`,
                  width: `${item.size}px`,
                  height: `${item.size}px`,
                  transform: `translate(-50%, -50%) rotate(${item.angle}rad)`,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleItemClick(item.id, item.type, item.x, item.y);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleItemClick(item.id, item.type, item.x, item.y);
                }}
              >
                {/* Text Inner inside Dropping Body */}
                {!isVikaar ? (
                  <span className={`${visual.textColor} ${item.label === "Om" ? "text-[19px] sm:text-[21px] md:text-[23px]" : "text-base sm:text-lg md:text-xl"} drop-shadow-sm font-black`}>
                    {item.label}
                  </span>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-1.5">
                    <span className={`${visual.textColor} text-[11px] sm:text-xs md:text-sm leading-tight text-red-200 font-black`}>
                      {visual.customLabel?.split(" ")[0]}
                    </span>
                    <span className="text-[9px] md:text-[10px] text-red-300 mt-1 leading-none font-bold">
                      {visual.customLabel?.split(" ")[1]?.replace("(", "")?.replace(")", "")}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Floating score text indicator elements */}
          {floatingTexts.map((ft) => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -65, scale: 1.3 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute z-40 font-mono font-black text-xs md:text-sm pointer-events-none drop-shadow"
              style={{
                left: `${ft.x}%`,
                top: `${ft.y}%`,
                color: ft.color,
                transform: "translate(-50%, -50%)",
              }}
            >
              {ft.text}
            </motion.div>
          ))}
        </div>

        {/* Live Active Panel at Bottom indicating play parameters */}
        {isPlaying && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 bg-white/95 border border-amber-150 py-2.5 px-5 rounded-full shadow-lg flex items-center gap-4 text-xs font-mono font-medium text-stone-600 backdrop-blur w-fit whitespace-nowrap pointer-events-auto" id="play-nav-bar">
            <span>Score: <b className="text-amber-800 font-bold">{score}</b></span>
            <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
            <span>Mode: <b className="text-amber-700 font-bold">{isZen ? "Zen Jaap" : "Concentrate"}</b></span>
            <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
            <button
              type="button"
              onClick={stopGame}
              className="text-stone-500 hover:text-red-500 font-bold transition-colors cursor-pointer"
              id="btn-pause-sadhana"
            >
              End Session
            </button>
          </div>
        )}
      </div>

      {/* Control preferences side menu */}
      <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between" id="game-controls-settings">
        <div className="flex gap-2 items-center text-stone-600 text-xs text-left max-w-md">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Tap falling grains to count. The dropping speed represents swift karmic thoughts. Adjust the Drop Speed level at any time as requested!</span>
        </div>

        <div className="flex gap-3" id="audio-switches">
          {/* Mute toggle button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isMuted
                ? "bg-stone-200 border-stone-300 text-stone-600 hover:bg-stone-300"
                : "bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200"
            }`}
            id="btn-toggle-mute"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isMuted ? "Sound Off" : "Sound On"}
          </button>

          {/* Voice toggle button */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              !voiceEnabled
                ? "bg-stone-200 border-stone-300 text-stone-600 hover:bg-stone-300"
                : "bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200"
            }`}
            id="btn-toggle-voice"
          >
            <Shield className="w-3.5 h-3.5" />
            {voiceEnabled ? "Mantra Speak ON" : "Mantra Speak OFF"}
          </button>
        </div>
      </div>
    </div>
  );
}
