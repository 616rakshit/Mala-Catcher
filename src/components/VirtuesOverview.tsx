/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BookOpen, HelpCircle, Eye, Compass, Heart, Award, ShieldAlert, Sparkles, Sunrise } from "lucide-react";
import { JainFact } from "../types";

export default function VirtuesOverview() {
  const [activeTab, setActiveTab] = useState<"bhikshu" | "navkar" | "premises">("bhikshu");

  const FACT_SHEETS: JainFact[] = [
    {
      title: "Pure Soul Dharma",
      description: "Acharya Bhikshu created a bold demarcation between social charity (helpful behaviors to improve standard survival conditions) and spiritual dharma (cleansing inner anger, ego, and attachment). He emphasized that pure religion is exclusively concerned with soul-purifying vows.",
      significance: "Saves practitioners from commercializing or trivializing spiritual practice into worldly trades."
    },
    {
      title: "The Path of Thirteen (Terapanth)",
      description: "In Vikram Samvat 1817 (A.D. 1760), along with 13 monks who sought pure self-conduct, Acharya Bhikshu organized the Terapanth order. A famous poem says: 'O Lord, this is your path (Tera-panth)! Or, those who have 13 vows: 5 great vows (Mahavratas), 5 path-consciousnesses (Samitis), and 3 mental/vocal controls (Guptis).'",
      significance: "Establishes absolute self-discipline and compliance across the order under one leader (Acharya)."
    },
    {
      title: "Anuvrat Movement",
      description: "Initiated by Acharya Tulsi in 1949, Anuvrat allows normal householders to take simple, practical moral codes of non-injury, honesty, and simplicity to transform humanity without religious barriers.",
      significance: "Brings lofty Jain ethics into standard daily life for common people of all faiths."
    },
    {
      title: "Preksha Meditation",
      description: "Systematized by Acharya Mahapragya, Preksha Dhyana is a highly practical meditation technique focusing on observing the physical body, nervous flow, breathing rates, and colorful light layers (Leshyas).",
      significance: "Reduces stress, cleanses psychological blockages, and bridges ancient spirituality with modern neuroscience."
    }
  ];

  return (
    <div className="bg-white border border-stone-100 p-6 rounded-3xl shadow-sm" id="virtues-reference-deck">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-100 pb-5 mb-6" id="virtue-deck-header">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <BookOpen className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider font-mono">Swadhyay (Holy Library & Cultural Wisdom)</h3>
            <p className="text-[11px] text-stone-400">Discover Terapanth principles, Bhikshu history, and Navkar Verse analysis</p>
          </div>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-stone-100 p-1 rounded-xl scroll-bar-hide overflow-x-auto w-full md:w-auto" id="wisdom-tab-group">
          <button
            onClick={() => setActiveTab("bhikshu")}
            className={`py-1.5 px-4 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              activeTab === "bhikshu" ? "bg-white text-amber-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            Acharya Bhikshu
          </button>
          <button
            onClick={() => setActiveTab("navkar")}
            className={`py-1.5 px-4 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              activeTab === "navkar" ? "bg-white text-amber-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            Navkar Mantra
          </button>
          <button
            onClick={() => setActiveTab("premises")}
            className={`py-1.5 px-4 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              activeTab === "premises" ? "bg-white text-amber-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            Terapanth Values
          </button>
        </div>
      </div>

      {/* Wisdom contents */}
      <div id="wisdom-card-viewscreen">
        {activeTab === "bhikshu" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="acharya-bhikshu-wisdom">
            <div className="md:col-span-1 flex flex-col items-center text-center p-6 bg-gradient-to-br from-amber-50/50 to-white border border-amber-100/50 rounded-2xl relative" id="bhikshu-portrait-card">
              <div className="absolute top-4 right-4 text-amber-500">
                <Sparkles className="w-5 h-5 animate-bounce" />
              </div>
              
              <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center text-3xl font-serif border-2 border-amber-200/50 text-amber-800 shadow-inner mb-4">
                भिक्षु
              </div>
              <h4 className="text-sm font-bold text-amber-900">Mahashraman Acharya Bhikshu</h4>
              <p className="text-[10px] text-stone-400 font-mono mt-1">Founder of Terapanth (1726 - 1803)</p>
              
              <div className="w-full h-[1px] bg-amber-100 my-4" />
              
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                An exceptional philosopher, reformer, and yogi, who departed from corrupted spiritual traditions of his era, advocating for absolute adherence to Jain monastic self-discipline (Dharma Shuddhi).
              </p>
            </div>

            <div className="md:col-span-2 flex flex-col gap-4 text-xs" id="bhikshu-history-timeline">
              <h4 className="font-bold text-stone-800 flex items-center gap-2 text-xs">
                <Sunrise className="w-4 h-4 text-amber-500" />
                The Core Tenets of Acharya Bhikshu
              </h4>

              <div className="space-y-3.5 mt-2">
                <div className="p-4 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors">
                  <h5 className="font-semibold text-amber-900 mb-1">Lokottara (Supramundane) Dharma</h5>
                  <p className="text-stone-600 leading-normal font-light">
                    Religion is of the soul. Outer actions such as offering material gifts, worldly charity, or erecting massive structures can be helpful social services, but they are not spiritual virtues that directly liberate the soul. Dharma lies in developing patience, reducing desire, and extinguishing ego.
                  </p>
                </div>

                <div className="p-4 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors">
                  <h5 className="font-semibold text-amber-900 mb-1">Pratham Prerna (First Vows)</h5>
                  <p className="text-stone-600 leading-normal font-light">
                    Pure monks must never use fire, do construction, or handle money, for everything causes minor harm to invisible creatures (Ekendriya jivas). Simplifying life to the maximum represents the highest level of Ahimsa.
                  </p>
                </div>

                <div className="p-4 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors">
                  <h5 className="font-semibold text-amber-900 mb-1">Supreme Hierarchy in Leadership</h5>
                  <p className="text-stone-600 leading-normal font-light">
                    Every monk must strictly follow the words of the Acharya. There cannot be sub-factions or separate centers. All resources, texts, and retreats belong directly to the supreme monk organization, ensuring 100% integrity and unity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "navkar" && (
          <div className="flex flex-col gap-6" id="navkar-mantra-wisdom">
            <div className="text-center bg-amber-50/30 border border-amber-100 p-6 rounded-2xl mb-2" id="holy-prakrit-text">
              <h4 className="text-amber-800 font-bold mb-4 font-serif text-lg tracking-wide">Sacred Namokar Maha-Mantra (प्राकृत पाठ)</h4>
              
              <div className="space-y-3 text-sm text-stone-800 font-serif leading-relaxed font-medium">
                <p className="hover:scale-[1.01] transition-transform">णमो अरिहंताणं || <span className="text-stone-400 text-xs font-sans">(I bow to the destroyers of inner enemies)</span></p>
                <p className="hover:scale-[1.01] transition-transform">णमो सिद्धाणं || <span className="text-stone-400 text-xs font-sans">(I bow to the fully liberated, perfect souls)</span></p>
                <p className="hover:scale-[1.01] transition-transform">णमो आयरियाणं || <span className="text-stone-400 text-xs font-sans">(I bow to the heads of spiritual orders)</span></p>
                <p className="hover:scale-[1.01] transition-transform">णमो उवज्झायाणं || <span className="text-stone-400 text-xs font-sans">(I bow to the monastic teachers who explain sutras)</span></p>
                <p className="hover:scale-[1.01] transition-transform">णमो लोए सव्व साहूणं || <span className="text-stone-400 text-xs font-sans">(I bow to all pure wandering spiritual saints)</span></p>
                <div className="h-[1px] bg-amber-200/50 max-w-sm mx-auto my-3" />
                <p className="text-xs text-amber-700/80 leading-normal font-sans">
                  एसोपंच णमुक्कारो, सव्वपावप्पणासणो | <br />
                  मंगला ण च सव्वेसिं, पढमं हवइ मंगलं ||
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" id="navkar-signif-sections">
              <div className="p-4 border border-stone-100 rounded-xl bg-white">
                <h5 className="font-bold text-amber-900 mb-2 uppercase tracking-wide font-mono flex items-center gap-1">
                  <Heart className="w-4 h-4 text-rose-500" /> Verse Analysis & Power
                </h5>
                <p className="text-stone-600 leading-relaxed font-light">
                  This mantra contains no requests for health, money, or physical healing. It is a pure, unconditioned greeting offered to the qualities of absolute purity, knowledge, and self-restraint. Focusing on these qualities draws your subconscious frequency into similar states of spiritual vibration.
                </p>
              </div>

              <div className="p-4 border border-stone-100 rounded-xl bg-white">
                <h5 className="font-bold text-amber-900 mb-2 uppercase tracking-wide font-mono flex items-center gap-1">
                  <Compass className="w-4 h-4 text-amber-500" /> Meditation Integration
                </h5>
                <p className="text-stone-600 leading-relaxed font-light">
                  During Mala chanting, we recite each stanza of the Navkar Mantra while focusing on specific energy nodes of our body (chakras or Preksha points). Moving the beads aligns your sensory coordination, creating an ironclad barrier against stress and negative thoughts.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "premises" && (
          <div className="flex flex-col gap-6" id="terapanth-values-grid">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono">
              The Four Pillars of Terapanth Shravaka Life
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" id="premises bento">
              {FACT_SHEETS.map((fact, index) => (
                <div
                  key={index}
                  className="bg-stone-50/50 border border-stone-200/50 p-5 rounded-2xl shadow-inner hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-bold font-mono mb-3">
                      {index + 1}
                    </div>
                    <h5 className="font-semibold text-xs text-stone-900 mb-1.5">{fact.title}</h5>
                    <p className="text-[11px] text-stone-600 leading-relaxed font-light mb-4">{fact.description}</p>
                  </div>
                  <div className="pt-3 border-t border-stone-200/50">
                    <span className="text-[9px] text-amber-700 uppercase font-mono font-medium block">Crucial Significance:</span>
                    <span className="text-[10px] text-stone-500 font-light italic leading-normal mt-0.5 block">{fact.significance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
