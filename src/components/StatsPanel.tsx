/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Award, Compass, Eye, Heart, BarChart2, Star, Calendar, CheckSquare, Plus, Minus, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Sankalp } from "../types";

const getLast7Days = () => {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
    result.push({ key, label });
  }
  return result;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-stone-900 border border-stone-800 text-stone-100 p-2 text-xs rounded-xl shadow-lg font-mono">
        <p className="font-semibold text-amber-400">{payload[0].payload.name}</p>
        <p className="text-[11px] mt-0.5">
          <span className="font-bold text-white">{payload[0].value}</span> Malas Completed
        </p>
        <p className="text-[9px] text-stone-400 font-light italic">
          ({payload[0].value * 108} chants)
        </p>
      </div>
    );
  }
  return null;
};

interface StatsPanelProps {
  malasCompleted: number;
  setMalasCompleted: (val: number | ((prev: number) => number)) => void;
  activeJaaps: number;
  onResetAll: () => void;
  target: number;
  setTarget: (val: number | ((prev: number) => number)) => void;
}

export default function StatsPanel({
  malasCompleted,
  setMalasCompleted,
  activeJaaps,
  onResetAll,
  target,
  setTarget,
}: StatsPanelProps) {
  const [diaryDate, setDiaryDate] = useState<string>("");

  // Load or initialize daily history
  const [historyData, setHistoryData] = useState<{ name: string; malas: number }[]>([]);

  useEffect(() => {
    const savedHistoryStr = localStorage.getItem("mala_history");
    let historyObj: Record<string, number> = {};

    if (savedHistoryStr) {
      try {
        historyObj = JSON.parse(savedHistoryStr);
      } catch (e) {
        historyObj = {};
      }
    } else {
      const days = getLast7Days();
      const mockValues = [2, 3, 1, 4, 2, 3];
      days.forEach((day, index) => {
        if (index < 6) {
          historyObj[day.key] = mockValues[index];
        }
      });
      localStorage.setItem("mala_history", JSON.stringify(historyObj));
    }

    const days = getLast7Days();
    const todayKey = days[6].key;
    historyObj[todayKey] = malasCompleted;

    localStorage.setItem("mala_history", JSON.stringify(historyObj));

    const chartData = days.map((day) => ({
      name: day.label,
      malas: historyObj[day.key] || 0,
    }));

    setHistoryData(chartData);
  }, [malasCompleted]);

  // Spiritual Diary options (Boolean states stored in localStorage)
  const [diaryChauvihar, setDiaryChauvihar] = useState<boolean>(() => {
    return localStorage.getItem("diary_chauvihar") === "true";
  });
  const [diarySwadhyay, setDiarySwadhyay] = useState<boolean>(() => {
    return localStorage.getItem("diary_swadhyay") === "true";
  });
  const [diaryAhimsa, setDiaryAhimsa] = useState<boolean>(() => {
    return localStorage.getItem("diary_ahimsa") === "true";
  });
  const [diaryKrodhControl, setDiaryKrodhControl] = useState<boolean>(() => {
    return localStorage.getItem("diary_krodh") === "true";
  });

  useEffect(() => {
    // Save state on modification
    localStorage.setItem("diary_chauvihar", String(diaryChauvihar));
    localStorage.setItem("diary_swadhyay", String(diarySwadhyay));
    localStorage.setItem("diary_ahimsa", String(diaryAhimsa));
    localStorage.setItem("diary_krodh", String(diaryKrodhControl));
  }, [diaryChauvihar, diarySwadhyay, diaryAhimsa, diaryKrodhControl]);

  useEffect(() => {
    const today = new Date();
    setDiaryDate(today.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
  }, []);

  const changeTarget = (amount: number) => {
    setTarget((prev) => Math.max(1, prev + amount));
  };

  const progressPercentage = Math.min(100, Math.round((malasCompleted / target) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="stats-dashboard-grid">
      {/* Target & Sankalp Setup */}
      <div className="bg-white border border-stone-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between" id="sankalp-planning-card">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
              <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: "30s" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider font-mono">My Daily Sankalp (Spiritual Vow)</h3>
              <p className="text-[11px] text-stone-400">Set and track your dedicated chanting goal for the day</p>
            </div>
          </div>

          <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/50 mb-5 text-center flex flex-col items-center">
            <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Target Malas</span>
            
            <div className="flex items-center gap-6 my-2">
              <button
                onClick={() => changeTarget(-1)}
                disabled={target <= 1}
                className="w-9 h-9 border border-stone-200 hover:bg-stone-100 rounded-full flex items-center justify-center text-stone-700 font-bold transition-colors disabled:opacity-40 disabled:hover:bg-transparent pointer-events-auto cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <span className="text-3xl font-extrabold text-amber-900 font-sans tracking-tight">
                {target} <span className="text-xs font-normal text-stone-400">Malas</span>
              </span>

              <button
                onClick={() => changeTarget(1)}
                className="w-9 h-9 border border-stone-200 hover:bg-stone-100 rounded-full flex items-center justify-center text-stone-700 font-bold transition-colors pointer-events-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <span className="text-[9px] text-amber-600 font-light font-mono italic">
              1 Mala = 108 chants. Total chants today target: {target * 108}.
            </span>
          </div>

          {/* Goal Completion Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end text-xs">
              <span className="text-stone-500 font-light">Siddhatva Progression</span>
              <span className="font-mono font-bold text-amber-950">{progressPercentage}% Complete</span>
            </div>
            
            <div className="h-4 bg-stone-100 rounded-full w-full overflow-hidden border border-stone-200/40 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex justify-between mt-1 text-[10px] font-mono text-stone-400">
              <span>0 / {target} Completed</span>
              {malasCompleted >= target ? (
                <span className="text-emerald-600 font-semibold uppercase animate-pulse">Sankalp Fulfilled! Pranam!</span>
              ) : (
                <span>{target - malasCompleted} Malas remaining today</span>
              )}
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="pt-6 border-t border-stone-100 flex gap-4 mt-8">
          <button
            onClick={onResetAll}
            className="text-[10px] uppercase font-bold text-red-500 hover:text-red-700 transition-colors pointer-events-auto flex items-center gap-1 cursor-pointer"
            id="btn-hard-reset-data"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Initialize Stats
          </button>
        </div>
      </div>

      {/* Shravak's Daily Spiritual Diary */}
      <div className="bg-white border border-stone-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between" id="shravak-diary-card">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider font-mono">My Spiritual Diary (Samyama)</h3>
              <p className="text-[11px] text-stone-400">Evaluate your self-conduct and mindfulness actions today</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-stone-400 text-xs font-mono font-light mb-4 border-b border-stone-100 pb-3">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>{diaryDate}</span>
          </div>

          <div className="space-y-4" id="diary-checkboxes">
            {/* 1. Chauvihar */}
            <label className="flex items-start gap-3 cursor-pointer select-none group pointer-events-auto">
              <input
                type="checkbox"
                checked={diaryChauvihar}
                onChange={() => setDiaryChauvihar(!diaryChauvihar)}
                className="mt-0.5 w-4.5 h-4.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-stone-800 group-hover:text-amber-800 transition-colors">
                  Aahar Chauvihar (Early Dinner)
                </span>
                <p className="text-[10px] text-stone-500 leading-normal font-light">
                  Avoided eating food or drinking water after sunset to protect micro-organisms.
                </p>
              </div>
            </label>

            {/* 2. Swadhyay */}
            <label className="flex items-start gap-3 cursor-pointer select-none group pointer-events-auto">
              <input
                type="checkbox"
                checked={diarySwadhyay}
                onChange={() => setDiarySwadhyay(!diarySwadhyay)}
                className="mt-0.5 w-4.5 h-4.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-stone-800 group-hover:text-amber-800 transition-colors">
                  Daily Swadhyay (Self-Study)
                </span>
                <p className="text-[10px] text-stone-500 leading-normal font-light">
                  Dedicated at least 15 minutes to reading Jain scriptures or spiritual contemplating of souls.
                </p>
              </div>
            </label>

            {/* 3. Ahimsa Speech */}
            <label className="flex items-start gap-3 cursor-pointer select-none group pointer-events-auto">
              <input
                type="checkbox"
                checked={diaryAhimsa}
                onChange={() => setDiaryAhimsa(!diaryAhimsa)}
                className="mt-0.5 w-4.5 h-4.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-stone-800 group-hover:text-amber-800 transition-colors">
                  Ahimsa Speech & Purity
                </span>
                <p className="text-[10px] text-stone-500 leading-normal font-light">
                  Spoke strictly sweet, humble words. Avoided gossip, anger, deceit, or bad mouth.
                </p>
              </div>
            </label>

            {/* 4. Anger control */}
            <label className="flex items-start gap-3 cursor-pointer select-none group pointer-events-auto">
              <input
                type="checkbox"
                checked={diaryKrodhControl}
                onChange={() => setDiaryKrodhControl(!diaryKrodhControl)}
                className="mt-0.5 w-4.5 h-4.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-stone-800 group-hover:text-amber-800 transition-colors">
                  Equanimity under Anger
                </span>
                <p className="text-[10px] text-stone-500 leading-normal font-light">
                  Controlled heavy thoughts of anger (Krodh) or ego (Ahankar) during challenging interactions today.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-150 mt-6 text-[10px] text-amber-700 italic font-light leading-normal flex items-center gap-1.5 bg-amber-50/40 p-3 rounded-xl border border-amber-100">
          <CheckSquare className="w-4 h-4 text-amber-500 shrink-0" />
          "Maintaining this spiritual diary daily cleanses your subtle karma energy field. Every vow fulfilled strengthens the soul."
        </div>
      </div>

      {/* 7-Day Consistency Tracker Recharts Bar Chart */}
      <div className="md:col-span-2 bg-white border border-stone-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between animate-fade-in" id="consistency-tracker-card">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
              <BarChart2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider font-mono">Tapasya Consistency</h3>
              <p className="text-[11px] text-stone-400">Daily Mala completion history over the last 7 calendar days</p>
            </div>
          </div>

          <div className="h-[210px] w-full mt-2 animate-fade-in" id="recharts-container-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorMalas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.95}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.55}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#a8a29e" 
                  fontSize={10} 
                  fontWeight={500}
                  tickLine={false} 
                  axisLine={false} 
                  dy={8}
                />
                <YAxis 
                  stroke="#a8a29e" 
                  fontSize={10} 
                  fontWeight={500}
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                  dx={-4}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fef3c7', opacity: 0.25 }} />
                <Bar dataKey="malas" fill="url(#colorMalas)" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 mt-6 flex flex-wrap gap-4 items-center justify-between text-[10px] font-mono text-stone-400">
          <motion.div 
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all duration-500 ${
              malasCompleted >= target 
                ? "bg-amber-500/10 text-amber-900 font-bold border border-amber-300 shadow-sm" 
                : "text-stone-400"
            }`}
            animate={
              malasCompleted >= target 
                ? { y: [0, -3, 0], scale: [1, 1.02, 1] } 
                : {}
            }
            transition={
              malasCompleted >= target 
                ? { repeat: Infinity, repeatType: "reverse", duration: 1.8, ease: "easeInOut" } 
                : {}
            }
          >
            <span>Active Streak: </span>
            <strong className={`${malasCompleted >= target ? "text-amber-700" : "text-amber-800"}`}>
              {localStorage.getItem("streak_days") || 1} Days Consistent {malasCompleted >= target ? "🏆" : "🔥"}
            </strong>
          </motion.div>
          <span className="italic text-amber-600/80">"Consistency in Tapasya builds intense internal pure energy."</span>
        </div>
      </div>
    </div>
  );
}
