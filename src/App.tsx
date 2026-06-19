/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  Award,
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  MessageSquare,
  Flame,
  User,
  CheckCircle,
  HelpCircle,
  X,
  Play,
  Moon,
  Sun,
  FlameKindling,
} from "lucide-react";
import { GameState } from "./types";
import { audio } from "./utils/audio";
import SadhanaGame from "./components/SadhanaGame";
import AIGuide from "./components/AIGuide";
import VirtuesOverview from "./components/VirtuesOverview";
import StatsPanel from "./components/StatsPanel";

export default function App() {
  // Global States
  const [currentScreen, setCurrentScreen] = useState<GameState>(GameState.HOME);
  const [activeJaaps, setActiveJaaps] = useState<number>(0);
  const [malasCompleted, setMalasCompleted] = useState<number>(() => {
    return Number(localStorage.getItem("malas_completed") || "0");
  });
  const [streakDays, setStreakDays] = useState<number>(() => {
    return Number(localStorage.getItem("streak_days") || "1");
  });

  // Daily target configuration state & confetti particle arrays
  const [target, setTarget] = useState<number>(() => {
    return Number(localStorage.getItem("mala_target") || "3");
  });

  interface ConfettiParticle {
    id: number;
    size: number;
    color: string;
    duration: number;
    delay: number;
    angle: number;
    speed: number;
  }
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

  // User Settings Profile
  const [seekerName, setSeekerName] = useState<string>(() => {
    return localStorage.getItem("seeker_name") || "";
  });
  const [isNameModalOpen, setIsNameModalOpen] = useState(!localStorage.getItem("seeker_name"));
  const [tempName, setTempName] = useState("");

  // Sound Preferences
  const [isGlobalMuted, setIsGlobalMuted] = useState(audio.getMute());
  const [droneEnabled, setDroneEnabled] = useState<boolean>(() => {
    return localStorage.getItem("drone_enabled") === "true";
  });

  // Custom Modals
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  // Rosary Spiritual Theme and Bead Tooltip Hover States
  const [rosaryTheme, setRosaryTheme] = useState<"saffron" | "emerald" | "sky">(() => {
    return (localStorage.getItem("rosary_theme") as "saffron" | "emerald" | "sky") || "saffron";
  });
  const [hoveredBead, setHoveredBead] = useState<number | null>(null);

  // States for chain reaction sequential animation upon Mala completion
  const [isAnimatingChain, setIsAnimatingChain] = useState(false);
  const [chainBeadIndex, setChainBeadIndex] = useState<number | null>(null);
  const prevMalaCount = useRef(malasCompleted);

  // Listen for Mala completions to run a sophisticated chain reaction sequential glow around the beads
  useEffect(() => {
    if (malasCompleted > prevMalaCount.current) {
      setIsAnimatingChain(true);
      let index = 0;
      const interval = setInterval(() => {
        setChainBeadIndex(index);
        index++;
        if (index >= 108) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnimatingChain(false);
            setChainBeadIndex(null);
          }, 800);
        }
      }, 12);
    }
    prevMalaCount.current = malasCompleted;
  }, [malasCompleted]);

  useEffect(() => {
    localStorage.setItem("rosary_theme", rosaryTheme);
  }, [rosaryTheme]);

  // Keep persistent quantities
  useEffect(() => {
    localStorage.setItem("malas_completed", String(malasCompleted));
  }, [malasCompleted]);

  // Handle Drone change
  useEffect(() => {
    localStorage.setItem("drone_enabled", String(droneEnabled));
    if (droneEnabled && !isGlobalMuted) {
      audio.startDrone();
    } else {
      audio.stopDrone();
    }
  }, [droneEnabled, isGlobalMuted]);

  // Sync date streak
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const lastSession = localStorage.getItem("last_sadhana_date");
    if (lastSession && lastSession !== todayStr) {
      // Check if it was yesterday
      const lastDate = new Date(lastSession);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        setStreakDays((s) => {
          const nextS = s + 1;
          localStorage.setItem("streak_days", String(nextS));
          return nextS;
        });
      } else if (diffDays > 1) {
        setStreakDays(1);
        localStorage.setItem("streak_days", "1");
      }
    }
    localStorage.setItem("last_sadhana_date", todayStr);
  }, []);

  // Sync / Keep target value persistent
  useEffect(() => {
    localStorage.setItem("mala_target", String(target));
  }, [target]);

  // Track target completion to fire golden sparks!
  const prevMalasCompleted = useRef<number>(malasCompleted);
  useEffect(() => {
    if (malasCompleted > 0 && malasCompleted >= target && prevMalasCompleted.current < target) {
      triggerTargetCelebration();
    }
    prevMalasCompleted.current = malasCompleted;
  }, [malasCompleted, target]);

  const triggerTargetCelebration = () => {
    audio.playBell(523.25);
    setTimeout(() => audio.playBell(659.25), 180);
    setTimeout(() => audio.playBell(783.99), 360);

    const newConfetti = Array.from({ length: 45 }).map((_, i) => {
      const angle = (Math.PI * 1.0) + (Math.random() * Math.PI * 1.0); // shoot outwards
      const speed = 7 + Math.random() * 18;
      return {
        id: Date.now() + i + Math.random(),
        size: 4 + Math.random() * 6,
        color: [
          "#fbbf24", // Gold
          "#f59e0b", // Amber
          "#10b981", // Emerald
          "#34d399", // Mint
          "#60a5fa", // Sky
          "#ec4899", // Pink
        ][Math.floor(Math.random() * 6)],
        duration: 1.5 + Math.random() * 1.5,
        delay: Math.random() * 0.2,
        angle: angle,
        speed: speed,
      };
    });

    setConfetti((prev) => [...prev, ...newConfetti]);

    setTimeout(() => {
      setConfetti((prev) => prev.filter((p) => !newConfetti.find((x) => x.id === p.id)));
    }, 4500);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setSeekerName(tempName.trim());
      localStorage.setItem("seeker_name", tempName.trim());
      setIsNameModalOpen(false);
      audio.init();
      audio.speakChant(`Welcome Seeker ${tempName.trim()}`);
    }
  };

  const executeManualJaap = () => {
    audio.init();
    audio.playBell();
    audio.speakChant("Om Bhikshu");

    setActiveJaaps((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= 108) {
        setMalasCompleted((m) => m + 1);
        audio.playBell(196); // deep complete chime
        setTimeout(() => audio.speakChant("Om Bhikshu! Pranam Acharya Bhikshu!"), 300);
        return 0; // reset
      }
      return nextCount;
    });
  };

  const toggleMute = () => {
    const nextMuted = !isGlobalMuted;
    setIsGlobalMuted(nextMuted);
    audio.setMute(nextMuted);
  };

  const handleResetData = () => {
    setShowResetConfirm(true);
  };

  const confirmResetData = () => {
    setMalasCompleted(0);
    setActiveJaaps(0);
    setStreakDays(1);
    localStorage.setItem("malas_completed", "0");
    localStorage.setItem("streak_days", "1");
    localStorage.removeItem("diary_chauvihar");
    localStorage.removeItem("diary_swadhyay");
    localStorage.removeItem("diary_ahimsa");
    localStorage.removeItem("diary_krodh");
    localStorage.removeItem("mala_history");
    
    setShowResetConfirm(false);
    setShowResetSuccess(true);
  };

  // Generate the 108 circular rosary beads SVG
  const renderVirtualMala = () => {
    const radius = 41;
    const center = 50;
    const listBeads = [];

    const themeColors = {
      saffron: {
        activeBead: "fill-orange-500 stroke-yellow-300 stroke-[1.0px] animate-pulse",
        chantedBead: "fill-amber-600 stroke-amber-700/30 stroke-[0.4px] transition-all duration-300 shadow-inner",
        unchantedBead: "fill-stone-200 hover:fill-amber-300 transition-colors",
        trackRing: "stroke-stone-150/50",
        progressRing: malasCompleted >= target ? "stroke-amber-500 drop-shadow-[0_0_3px_rgba(245,158,11,0.6)]" : "stroke-amber-600",
        medallionBg: "fill-orange-50/95 stroke-amber-200/40",
        medallionText: "fill-amber-950",
        chantsText: "fill-amber-700"
      },
      emerald: {
        activeBead: "fill-emerald-400 stroke-teal-200 stroke-[1.0px] animate-pulse",
        chantedBead: "fill-emerald-600 stroke-emerald-700/30 stroke-[0.4px] transition-all duration-300 shadow-inner",
        unchantedBead: "fill-stone-200 hover:fill-emerald-300 transition-colors",
        trackRing: "stroke-stone-150/50",
        progressRing: malasCompleted >= target ? "stroke-emerald-500 drop-shadow-[0_0_3px_rgba(16,185,129,0.6)]" : "stroke-emerald-600",
        medallionBg: "fill-emerald-50/95 stroke-emerald-100/40",
        medallionText: "fill-emerald-950",
        chantsText: "fill-emerald-700"
      },
      sky: {
        activeBead: "fill-sky-400 stroke-cyan-100 stroke-[1.0px] animate-pulse",
        chantedBead: "fill-sky-600 stroke-sky-750/30 stroke-[0.4px] transition-all duration-300 shadow-inner",
        unchantedBead: "fill-stone-200 hover:fill-sky-350 transition-colors",
        trackRing: "stroke-stone-150/50",
        progressRing: malasCompleted >= target ? "stroke-sky-500 drop-shadow-[0_0_3px_rgba(14,165,233,0.6)]" : "stroke-sky-600",
        medallionBg: "fill-sky-50/95 stroke-sky-100/40",
        medallionText: "fill-sky-950",
        chantsText: "fill-sky-700"
      }
    };

    const currentTheme = themeColors[rosaryTheme];

    for (let i = 0; i < 108; i++) {
      const angle = (i * 2 * Math.PI) / 108 - Math.PI / 2; // start from top center
      const cx = center + radius * Math.cos(angle);
      const cy = center + radius * Math.sin(angle);

      // determine style of bead
      const isChanted = i < activeJaaps;
      const isActive = i === activeJaaps;

      let beadClass = "";
      let beadRadius = isActive ? 3.4 : isChanted ? 2.3 : 1.5;

      if (isAnimatingChain && chainBeadIndex !== null) {
        if (i === chainBeadIndex) {
          beadClass = "fill-yellow-300 stroke-yellow-101 stroke-[1.5px] drop-shadow-[0_0_6px_rgba(253,224,71,0.95)]";
          beadRadius = 5.2;
        } else if (i < chainBeadIndex && chainBeadIndex - i < 18) {
          const dist = chainBeadIndex - i;
          if (dist < 5) {
            beadClass = "fill-yellow-400 stroke-amber-200 stroke-[1.2px] drop-shadow-[0_0_4px_rgba(245,158,11,0.85)]";
            beadRadius = 4.2;
          } else if (dist < 11) {
            beadClass = "fill-amber-500 stroke-orange-400 stroke-[1.0px] drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]";
            beadRadius = 3.3;
          } else {
            beadClass = "fill-orange-600 stroke-red-500/40 stroke-[0.6px]";
            beadRadius = 2.5;
          }
        } else if (i > chainBeadIndex) {
          beadClass = isChanted ? currentTheme.chantedBead : currentTheme.unchantedBead;
        } else {
          beadClass = currentTheme.chantedBead;
        }
      } else {
        beadClass = isActive
          ? currentTheme.activeBead
          : isChanted
          ? currentTheme.chantedBead
          : currentTheme.unchantedBead;
      }

      listBeads.push(
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r={beadRadius}
          className={`${beadClass} cursor-pointer transition-all duration-300`}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          whileHover={{ scale: 1.6 }}
          onMouseEnter={() => setHoveredBead(i)}
          onMouseLeave={() => setHoveredBead(null)}
        />
      );
    }

    const ringRadius = 47.0;
    const ringCircumference = 2 * Math.PI * ringRadius; // 295.31
    const progressPercentage = Math.min(malasCompleted / target, 1);
    const strokeDashoffset = ringCircumference - progressPercentage * ringCircumference;

    // Create the beautiful pointing tooltip element inside the SVG
    let tooltipEl = null;
    if (hoveredBead !== null) {
      const angle = (hoveredBead * 2 * Math.PI) / 108 - Math.PI / 2;
      const tcx = center + radius * Math.cos(angle);
      const tcy = center + radius * Math.sin(angle);
      
      const pushOutRadius = radius + 6.3; 
      const tx = center + pushOutRadius * Math.cos(angle);
      const ty = center + pushOutRadius * Math.sin(angle) - 0.5; 
      
      tooltipEl = (
        <g className="pointer-events-none select-none">
          <line x1={tcx} y1={tcy} x2={tx} y2={ty} className="stroke-stone-500/40 stroke-[0.25px]" strokeDasharray="0.5,0.5" />
          <rect
            x={tx - 7.5}
            y={ty - 3.8}
            width="15"
            height="5"
            rx="1.2"
            className="fill-stone-900/95 stroke-white/10 stroke-[0.1px]"
          />
          <text
            x={tx}
            y={ty - 1.2}
            textAnchor="middle"
            className="font-mono font-black fill-white"
            style={{ fontSize: "2.5px" }}
          >
            BEAD {hoveredBead + 1}
          </text>
        </g>
      );
    }

    return (
      <svg viewBox="0 0 100 100" className="w-[270px] h-[270px] md:w-[310px] md:h-[310px] lg:w-[320px] lg:h-[320px] z-10 filter drop-shadow-xl transition-all duration-500 select-none">
        {/* Track Progress Ring */}
        <circle
          cx="50"
          cy="50"
          r={ringRadius}
          fill="none"
          className="stroke-stone-150/50"
          strokeWidth="1.6"
        />
        
        {/* Animated Radial Progress Ring */}
        <motion.circle
          cx="50"
          cy="50"
          r={ringRadius}
          fill="none"
          className={currentTheme.progressRing}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={ringCircumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          transform="rotate(-90 50 50)"
        />

        {/* Soft decorative background paths */}
        <circle cx="50" cy="50" r={radius} className="stroke-amber-500/20 stroke-[0.5px]" fill="none" strokeDasharray="1,2" />
        <circle cx="50" cy="50" r={radius - 5} className="stroke-stone-100 stroke-[0.3px]" fill="none" />
        
        {listBeads}
        {tooltipEl}
        
        {/* Center elegant medallion design */}
        <circle cx="50" cy="50" r="16" className={`${currentTheme.medallionBg} stroke-[0.5px] drop-shadow-sm`} />
        
        {hoveredBead !== null ? (
          <>
            <text
              x="50"
              y="44"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`font-sans font-extrabold text-[3px] ${currentTheme.medallionText} uppercase tracking-wider`}
            >
              Focusing
            </text>
            <text
              x="50"
              y="49.5"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-sans text-[2.5px] text-stone-400 uppercase tracking-widest"
            >
              Bead Num
            </text>
            <text
              x="50"
              y="58"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`font-mono text-[7px] font-extrabold ${currentTheme.chantsText} tabular-nums`}
            >
              #{hoveredBead + 1}
            </text>
          </>
        ) : (
          <>
            <text
              x="50"
              y="46"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`font-serif font-black text-[6.5px] ${currentTheme.medallionText} tracking-wider`}
            >
              ॐ भिक्षु
            </text>
            <text
              x="50"
              y="54"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-sans text-[4.5px] font-bold text-stone-400 uppercase tracking-widest"
            >
              chants
            </text>
            <text
              x="50"
              y="61"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`font-mono text-[7px] font-extrabold ${currentTheme.chantsText} tabular-nums ${activeJaaps > 0 ? "animate-pulse" : ""}`}
            >
              {activeJaaps}
            </text>
          </>
        )}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/75 text-stone-800 flex flex-col font-sans" id="applet-primary-root">
      
      {/* Top spiritual ambient header */}
      <header className="bg-white border-b border-stone-100 px-6 py-4 sticky top-0 z-40 shadow-sm flex items-center justify-between" id="app-main-headers-bar">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200/50 flex items-center justify-center text-amber-700 text-lg font-bold font-serif shadow-inner">
            ॐ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-600 uppercase">Jain Terapanth</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-amber-950 font-sans uppercase">Mala Catcher</h1>
          </div>
        </div>

        {/* Global Nav Toggles */}
        <div className="flex items-center gap-3" id="quick-controls-suite">
          {/* Audio toggle button */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isGlobalMuted
                ? "bg-stone-100 border-stone-200 text-stone-400 hover:bg-stone-200"
                : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
            }`}
            title={isGlobalMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isGlobalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Profile Name setup shortcut */}
          <button
            onClick={() => setIsNameModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-mono text-stone-500 hover:bg-stone-50 transition-all pointer-events-auto cursor-pointer"
            id="btn-edit-profile"
          >
            <User className="w-3.5 h-3.5 text-amber-500" />
            <span>{seekerName || "Sadhaka"}</span>
          </button>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6" id="app-contents-container">
        
        {/* Dynamic Nav Tabs */}
        <div className="bg-white border border-stone-200 p-2 rounded-2xl flex items-center gap-1 overflow-x-auto select-none scroll-bar-hide" id="app-view-tab-pnl">
          <button
            onClick={() => {
              setCurrentScreen(GameState.HOME);
              audio.stopDrone();
            }}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              currentScreen === GameState.HOME
                ? "bg-amber-600 text-white shadow"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            <Compass className="w-4 h-4" /> Dashboard
          </button>
          
          <button
            onClick={() => setCurrentScreen(GameState.PLAYING)}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              currentScreen === GameState.PLAYING
                ? "bg-amber-600 text-white shadow"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            <Play className="w-4 h-4 text-emerald-500 animate-pulse" /> Mala Catcher Game
          </button>

          <button
            onClick={() => setCurrentScreen(GameState.ZEN_JAAP)}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              currentScreen === GameState.ZEN_JAAP
                ? "bg-amber-600 text-white shadow"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            <Moon className="w-4 h-4 text-teal-400" /> Zen Jaap Mode
          </button>

          <button
            onClick={() => {
              setCurrentScreen(GameState.AI_GURU);
              audio.stopDrone();
            }}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              currentScreen === GameState.AI_GURU
                ? "bg-amber-600 text-white shadow"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-500" /> AI Swadhyay Guru
          </button>
        </div>

        {/* Selected Dashboard / View Render */}
        <div className="flex-1 min-h-[70vh]">
          <AnimatePresence mode="wait">
            {currentScreen === GameState.HOME && (
              <motion.div
                key="home-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
                id="view-pane-dashboard"
              >
                {/* Visual Banner, Name Greeting, & Active Rosary row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-hero-row">
                  {/* Left Greeting & Summary panel */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-amber-950 to-stone-950 text-white p-6 md:p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-md" id="greeting-hero-banner">
                    {/* Glowing yellow filter background */}
                    <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-yellow-500/10 blur-[150px] pointer-events-none rounded-full" />
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="py-1 px-3 bg-white/10 rounded-full text-[9px] font-mono tracking-widest uppercase">
                          Sadhaka Path
                        </span>
                        <div className="relative overflow-visible">
                          <motion.div
                            id="streak-celebrative-badge"
                            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-bold font-mono transition-all duration-500 border ${
                              malasCompleted >= target
                                ? "bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            }`}
                            animate={
                              malasCompleted >= target
                                ? {
                                    y: [0, -6, 0],
                                    scale: [1, 1.05, 1],
                                  }
                                : {}
                            }
                            transition={
                              malasCompleted >= target
                                ? {
                                    y: {
                                      repeat: Infinity,
                                      repeatType: "reverse",
                                      duration: 1.5,
                                      ease: "easeInOut",
                                    },
                                    scale: {
                                      repeat: Infinity,
                                      repeatType: "reverse",
                                      duration: 2.5,
                                      ease: "easeInOut",
                                    },
                                  }
                                : {}
                            }
                          >
                            <FlameKindling className={`w-3.5 h-3.5 ${malasCompleted >= target ? "text-amber-400 animate-pulse" : "text-emerald-400"}`} />
                            <span>
                              {malasCompleted >= target ? "🏆 SANKALP FULFILLED • " : ""}Active {streakDays} Day Streak!
                            </span>
                          </motion.div>

                          {/* Render floating golden confetti particles */}
                          {confetti.map((c) => (
                            <motion.div
                              key={c.id}
                              className="absolute pointer-events-none rounded-full z-50"
                              style={{
                                width: c.size,
                                height: c.size,
                                backgroundColor: c.color,
                                left: "50%",
                                top: "50%",
                              }}
                              initial={{ x: 0, y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
                              animate={{
                                x: Math.cos(c.angle) * c.speed * 4,
                                y: Math.sin(c.angle) * c.speed * 4 + 180, // grav direction
                                opacity: 0,
                                scale: [0.5, 1.2, 0],
                                rotate: Math.random() * 360
                              }}
                              transition={{
                                duration: c.duration,
                                delay: c.delay,
                                ease: "easeOut"
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <h2 className="text-2xl font-bold font-sans tracking-tight max-w-xl text-orange-50">
                        {seekerName ? `Jai Jinendra, Seeker ${seekerName}!` : "Jai Jinendra, Devoted Seeker!"}
                      </h2>
                      <p className="text-xs text-stone-300/80 leading-relaxed font-light mt-2 max-w-md">
                        Welcome to your tranquil oasis of Jain spiritual devotions. Click below to practice mindfulness, count chants manually, or run our dedicated interactive catch games.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-6 mt-6 border-t border-white/10" id="quick-action-triggers">
                      <button
                        onClick={() => setCurrentScreen(GameState.PLAYING)}
                        className="py-2.5 px-5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer pointer-events-auto"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Play Mala Catcher
                      </button>
                      <button
                        onClick={() => setCurrentScreen(GameState.ZEN_JAAP)}
                        className="py-2.5 px-5 border border-white/20 hover:bg-white/10 text-orange-50 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer pointer-events-auto"
                      >
                        <Moon className="w-3.5 h-3.5 text-teal-300" /> Zen Chants
                      </button>
                    </div>
                  </div>

                  {/* Right circular rosary card */}
                  <div className="bg-white border border-stone-100 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-between" id="active-rosary-visualizer-card">
                    <div className="w-full flex justify-between items-start mb-1">
                      <div className="text-left">
                        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono">Completed ring activity</h3>
                        <p className="text-[10px] text-stone-400 mt-0.5">Your live Virtual Mala progress</p>
                      </div>
                      
                      {/* Spiritual Theme Selector */}
                      <div className="flex items-center gap-1 bg-stone-50 border border-stone-100 p-1 rounded-full shadow-xs" title="Select Spiritual Theme">
                        {(["saffron", "emerald", "sky"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setRosaryTheme(t);
                              audio.playBell(t === "saffron" ? 392.00 : t === "emerald" ? 329.63 : 440.00);
                            }}
                            className={`w-4 h-4 rounded-full transition-all relative ${
                              t === "saffron" ? "bg-amber-500" : t === "emerald" ? "bg-emerald-500" : "bg-sky-400"
                            } ${
                              rosaryTheme === t
                                ? "ring-2 ring-stone-900 border border-white scale-115 shadow-sm"
                                : "opacity-60 hover:opacity-100 hover:scale-105"
                            } cursor-pointer`}
                            title={`${t.charAt(0).toUpperCase() + t.slice(1)} Theme`}
                          >
                            {rosaryTheme === t && (
                              <span className="absolute inset-0 flex items-center justify-center text-[5px] text-white font-mono font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Circular standard SVG rosary */}
                    <div className="relative my-4 flex items-center justify-center p-2">
                      {renderVirtualMala()}
                    </div>

                    {/* Daily Goal Radial Progress Info Block */}
                    <div className="w-full flex flex-col gap-1.5 p-3.5 bg-stone-50/50 border border-stone-150/40 rounded-2xl mb-4 text-center select-none animate-fade-in shadow-xs">
                      <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono">
                        <span className="uppercase tracking-widest font-semibold flex items-center gap-1">
                          <Compass className={`w-3 h-3 ${
                            rosaryTheme === "saffron" ? "text-amber-500" : rosaryTheme === "emerald" ? "text-emerald-500" : "text-sky-500"
                          }`} /> SANKALP PROGRESS
                        </span>
                        <span className={`font-black ${
                          rosaryTheme === "saffron" ? "text-amber-700" : rosaryTheme === "emerald" ? "text-emerald-700" : "text-sky-700"
                        } font-mono`}>
                          {Math.round(Math.min(malasCompleted / target, 1) * 100)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-0.5 text-xs">
                        <span className="font-extrabold text-stone-800 font-sans flex items-center gap-1.5 select-none">
                          <span>{malasCompleted}</span>
                          <span className="text-stone-400 font-normal">/</span>
                          <span className="flex items-center gap-1 bg-stone-100 hover:bg-stone-200/80 p-1 py-0.5 rounded-lg transition-colors border border-stone-200/30">
                            <button
                              onClick={() => {
                                setTarget((prev) => Math.max(1, prev - 1));
                                audio.playBell(261.63);
                              }}
                              disabled={target <= 1}
                              className="w-4 h-4 flex items-center justify-center text-[11px] font-black text-stone-500 hover:text-stone-900 disabled:opacity-30 cursor-pointer pointer-events-auto"
                              title="Decrease Daily Target"
                            >
                              -
                            </button>
                            <span className="text-stone-850 font-black font-mono text-xs px-1">{target}</span>
                            <button
                              onClick={() => {
                                setTarget((prev) => prev + 1);
                                audio.playBell(329.63);
                              }}
                              className="w-4 h-4 flex items-center justify-center text-[11px] font-black text-stone-500 hover:text-stone-900 cursor-pointer pointer-events-auto"
                              title="Increase Daily Target"
                            >
                              +
                            </button>
                          </span>
                          <span className="text-stone-500 font-semibold font-mono text-[10px]">Malas</span>
                        </span>
                        
                        {malasCompleted >= target ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-55 border border-emerald-100 rounded-full px-2 py-0.5 uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                            🏆 Daily Vow Met
                          </span>
                        ) : (
                          <span className={`text-[9px] font-bold ${
                            rosaryTheme === "saffron"
                              ? "text-amber-800 bg-amber-100/50 border-amber-200/40"
                              : rosaryTheme === "emerald"
                              ? "text-emerald-800 bg-emerald-100/50 border-emerald-200/40"
                              : "text-sky-850 bg-sky-100/50 border-sky-200/40"
                          } rounded-full px-2 py-0.5 tracking-tight font-sans`}>
                            {target - malasCompleted} left today
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Manual chant triggers */}
                    <div className="w-full flex flex-col gap-2">
                      <button
                        onClick={executeManualJaap}
                        className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold font-mono text-xs cursor-pointer shadow-sm pointer-events-auto"
                      >
                        TAP TO CHANT MANUALLY (ॐ)
                      </button>
                      
                      <div className="flex justify-between items-center px-1 text-[9px] font-mono text-stone-400">
                        <span>Tap beads in game to auto-increment</span>
                        <button
                          onClick={() => setActiveJaaps(0)}
                          className="hover:text-red-500 uppercase font-bold"
                        >
                          Clear Active Chants
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ambient Drone setting */}
                <div className="bg-white border border-stone-100 p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center justify-between" id="ambient-drone-ctrl">
                  <div className="flex gap-2 items-center text-stone-600 text-xs text-left">
                    <Moon className="w-4 h-4 text-teal-400 shrink-0" />
                    <div>
                      <span className="font-semibold block text-stone-700">Ambient Sound Bowl (Yoga Drone)</span>
                      <span className="text-[10px] text-stone-400 font-light">Play continuous background hum. Increases concentration effect.</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDroneEnabled(!droneEnabled)}
                    className={`py-1 px-4 rounded-xl text-xs font-semibold cursor-pointer border transition-colors ${
                      droneEnabled
                        ? "bg-amber-600 border-amber-700 text-white"
                        : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    {droneEnabled ? "Drone: ENABLED" : "Drone: DISABLED"}
                  </button>
                </div>

                {/* Vow Track and Self-Refile diary rows */}
                <StatsPanel
                  malasCompleted={malasCompleted}
                  setMalasCompleted={setMalasCompleted}
                  activeJaaps={activeJaaps}
                  onResetAll={handleResetData}
                  target={target}
                  setTarget={setTarget}
                />

                {/* Quick Info Deck */}
                <VirtuesOverview />
              </motion.div>
            )}

            {currentScreen === GameState.PLAYING && (
              <motion.div
                key="play-arcade-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SadhanaGame
                  mode={GameState.PLAYING}
                  activeJaaps={activeJaaps}
                  setActiveJaaps={setActiveJaaps}
                  malasCompleted={malasCompleted}
                  setMalasCompleted={setMalasCompleted}
                  onBackToHome={() => setCurrentScreen(GameState.HOME)}
                />
              </motion.div>
            )}

            {currentScreen === GameState.ZEN_JAAP && (
              <motion.div
                key="play-zen-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SadhanaGame
                  mode={GameState.ZEN_JAAP}
                  activeJaaps={activeJaaps}
                  setActiveJaaps={setActiveJaaps}
                  malasCompleted={malasCompleted}
                  setMalasCompleted={setMalasCompleted}
                  onBackToHome={() => setCurrentScreen(GameState.HOME)}
                />
              </motion.div>
            )}

            {currentScreen === GameState.AI_GURU && (
              <motion.div
                key="ai-guru-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AIGuide />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Seeker Name Entry Modal */}
      <AnimatePresence>
        {isNameModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-stone-200/50 max-w-sm w-full p-6 p-y-8 rounded-3xl shadow-2xl flex flex-col items-center relative"
              id="name-setup-modal"
            >
              {seekerName && (
                <button
                  onClick={() => setIsNameModalOpen(false)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 pointer-events-auto"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-4 shadow-inner">
                <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: "12s" }} />
              </div>

              <h3 className="text-lg font-bold font-sans text-stone-900 text-center mb-1">Noble Seeker Entrance</h3>
              <p className="text-[11px] text-stone-400 leading-normal text-center mb-6">
                Enter your name to initiate your spiritual registers, track lifetime rosaries, and customize AI spiritual guidance.
              </p>

              <form onSubmit={handleSaveName} className="w-full flex flex-col gap-3">
                <input
                  type="text"
                  required
                  placeholder="Enter Seeker Name (e.g. Rahul, Meera)"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full py-2.5 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500/80 focus:outline-none text-xs text-stone-800 transition-all font-light"
                  id="seeker-name-input-field"
                />
                
                <button
                  type="submit"
                  disabled={!tempName.trim()}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow hover:shadow-lg font-medium text-xs transition-all flex items-center justify-center gap-1 cursor-pointer pointer-events-auto"
                  id="btn-confirm-seeker"
                >
                  <CheckCircle className="w-4 h-4" /> Enter Sadhana Space
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Reset Confirmation Custom Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-stone-200/50 max-w-sm w-full p-6 py-8 rounded-3xl shadow-2xl flex flex-col items-center relative text-center"
              id="reset-confirm-modal"
            >
              <button
                onClick={() => setShowResetConfirm(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 cursor-pointer pointer-events-auto"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 shadow-inner">
                <HelpCircle className="w-8 h-8 animate-pulse" />
              </div>

              <h3 className="text-lg font-bold font-sans text-stone-900 mb-1">Reset Spiritual Registers?</h3>
              <p className="text-[11px] text-stone-400 leading-normal mb-6">
                Are you sure you want to initialize all your Sadhana counters, completed Malas, and Spiritual Diary entries? This action cannot be undone.
              </p>

              <div className="w-full flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-xs font-semibold hover:bg-stone-50 cursor-pointer pointer-events-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResetData}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow font-semibold text-xs cursor-pointer pointer-events-auto"
                  id="btn-reset-confirm"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Reset Success Custom Modal */}
        {showResetSuccess && (
          <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-stone-200/50 max-w-sm w-full p-6 py-8 rounded-3xl shadow-2xl flex flex-col items-center text-center"
              id="reset-success-modal"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-bold font-sans text-stone-900 mb-1">Registers Initialized</h3>
              <p className="text-[11px] text-stone-400 leading-normal mb-6">
                Your spiritual registers and counters have been reset successfully to restore your focus.
              </p>

              <button
                onClick={() => {
                  setShowResetSuccess(false);
                  window.location.reload();
                }}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow font-semibold text-xs cursor-pointer pointer-events-auto"
              >
                Return to Sadhana Space
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer credits lines */}
      <footer className="bg-white border-t border-stone-100 py-6 px-6 mt-auto text-center" id="page-credits-foot bg">
        <p className="text-[10px] text-stone-400 font-light">
          Mala Catcher: Terapanth Spiritual Sadhana Devotions • Created for Jain Shravakas
        </p>
        <p className="text-[9px] text-stone-300 mt-1 uppercase font-mono">
          "अहिंसा परमो धर्मः" • Ahimsa (Non-violence) is the highest religion
        </p>
      </footer>
    </div>
  );
}
