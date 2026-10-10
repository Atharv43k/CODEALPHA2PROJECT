import React, { useState } from 'react';
import {
  LogOut,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  Loader2,
  Award,
  Layers,
  FileCode,
  Flame,
} from 'lucide-react';
import { User } from '../types/auth';
import { ButterflyWingLogo } from './ButterflyWingLogo';
import { apiClient } from '../api/client';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onOpenVivaModal: () => void;
  onUserUpdated: (updatedUser: User) => void;
}

const STAGES = [
  {
    stage: 1,
    title: 'The Chrysalis',
    subtitle: 'Silent incubation of limitless potential',
    description:
      'Within the sacred dark of the cocoon, old structures dissolve. You are not losing yourself; you are preparing to reconstruct who you are meant to be.',
    quote: '"What the caterpillar calls the end of the world, the master calls a butterfly."',
    color: 'from-violet-600 to-indigo-700',
    borderColor: 'border-violet-500/40',
    activeBadge: 'text-violet-300 bg-violet-950/60',
  },
  {
    stage: 2,
    title: 'The Awakening',
    subtitle: 'First tremors of conscious rebirth',
    description:
      'Cellular memories realign. The impulse to break free stirs deeply within. Doubt yields to determination as light filters through the boundary.',
    quote: '"The cave you fear to enter holds the treasure that you seek."',
    color: 'from-indigo-600 to-blue-600',
    borderColor: 'border-indigo-500/40',
    activeBadge: 'text-indigo-300 bg-indigo-950/60',
  },
  {
    stage: 3,
    title: 'The Emergence',
    subtitle: 'Shattering the cocoon and meeting the air',
    description:
      'Pushing through the membrane pumps life into nascent wings. The struggle is the very mechanism that grants you strength to fly.',
    quote: '"You must be willing to let go of the life you planned so as to have the life that is waiting for you."',
    color: 'from-blue-600 to-cyan-500',
    borderColor: 'border-cyan-500/40',
    activeBadge: 'text-cyan-300 bg-cyan-950/60',
  },
  {
    stage: 4,
    title: 'True Metamorphosis',
    subtitle: 'Flight across endless horizons',
    description:
      'Transmuted, empowered, and fully evolved. You navigate the winds with grace, a testament to the beauty that emerges through persistent transformation.',
    quote: '"May your wings unfold with iridescent clarity. You have become."',
    color: 'from-cyan-500 via-violet-500 to-fuchsia-500',
    borderColor: 'border-cyan-400/60',
    activeBadge: 'text-cyan-200 bg-cyan-950/60',
  },
];

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onLogout,
  onOpenVivaModal,
  onUserUpdated,
}) => {
  const currentStageInfo = STAGES.find((s) => s.stage === user.transformationStage) || STAGES[0];
  const [selectedStage, setSelectedStage] = useState(user.transformationStage);
  const [reflection, setReflection] = useState(user.reflection || '');
  const [evolving, setEvolving] = useState(false);
  const [evolutionNotice, setEvolutionNotice] = useState<string | null>(null);

  const handleEvolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvolving(true);
    setEvolutionNotice(null);
    try {
      const res = await apiClient.evolve(selectedStage, reflection.trim());
      if (res.success && res.user) {
        onUserUpdated(res.user);
        setEvolutionNotice('Transformation stage updated in C++ persistent storage file!');
        setTimeout(() => setEvolutionNotice(null), 5000);
      }
    } catch (err: any) {
      setEvolutionNotice(`Update failed: ${err.message}`);
    } finally {
      setEvolving(false);
    }
  };

  const token = apiClient.getToken();
  const tokenPreview = token ? `${token.substring(0, 16)}...${token.substring(token.length - 8)}` : 'Active';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-7 pb-12">
      {/* Top Header Bar */}
      <header className="p-4 sm:p-6 rounded-2xl bg-[#0f0d1b]/80 border border-violet-500/20 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <ButterflyWingLogo size="sm" stage={user.transformationStage} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
                Authenticated Portal
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                C++ Session Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-cyan-300 to-white">{user.username}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onOpenVivaModal}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200 bg-violet-900/30 hover:bg-violet-800/40 border border-violet-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Inspect C++ Backend</span>
            <span className="sm:hidden">Viva</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Hero Metamorphosis Showcase Card */}
      <div className="relative p-7 sm:p-10 rounded-3xl bg-gradient-to-b from-[#120f26]/90 via-[#0e0c1e]/90 to-[#090814]/95 border border-violet-500/30 shadow-2xl shadow-indigo-950/40 overflow-hidden">
        {/* Ambient Glow Aura */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Visual Wing Center */}
          <div className="lg:col-span-5 flex flex-col items-center text-center">
            <div className="relative p-6 sm:p-8 rounded-full bg-violet-950/30 border border-cyan-400/20 shadow-inner">
              <ButterflyWingLogo size="xl" stage={user.transformationStage} />
            </div>

            <div className="mt-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-950/50 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-3 h-3" />
                <span>Stage {user.transformationStage} of 4: {currentStageInfo.title}</span>
              </div>
            </div>
          </div>

          {/* Descriptive Transformation Narrative */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-violet-400 font-semibold">
                Your Evolution Path
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                {currentStageInfo.title}
              </h2>
              <p className="text-sm font-medium text-cyan-300 mt-0.5">
                {currentStageInfo.subtitle}
              </p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {currentStageInfo.description}
            </p>

            <blockquote className="p-3.5 rounded-xl bg-violet-950/30 border-l-2 border-cyan-400 text-xs italic text-slate-300">
              {currentStageInfo.quote}
            </blockquote>

            {/* User reflection / personal note */}
            {user.reflection && (
              <div className="p-3 rounded-xl bg-[#171330]/60 border border-violet-500/20 text-xs text-slate-300">
                <span className="font-semibold text-violet-300">Personal Reflection: </span>
                <span>{user.reflection}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Evolutionary Stages Timeline & Interactive Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stages Progression Cards (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Metamorphic Journey Stages</span>
            </h3>
            <span className="text-xs text-slate-400">
              Click stage to evolve
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {STAGES.map((st) => {
              const isActive = user.transformationStage === st.stage;
              const isSelected = selectedStage === st.stage;
              return (
                <div
                  key={st.stage}
                  onClick={() => setSelectedStage(st.stage)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#181333] border-cyan-400/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/40'
                      : isActive
                      ? 'bg-[#141029] border-violet-500/50'
                      : 'bg-[#0f0d1c]/60 border-violet-500/15 hover:border-violet-500/35 hover:bg-[#14102b]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Stage 0{st.stage}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Current
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white mt-1.5">{st.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{st.subtitle}</p>
                </div>
              );
            })}
          </div>

          {/* Advance Stage Form */}
          <form
            onSubmit={handleEvolve}
            className="p-5 rounded-2xl bg-[#0f0d1b]/80 border border-violet-500/20 backdrop-blur-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="dashboard-reflection"
                className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                <span>Advance Transformation Stage & Update Reflection</span>
              </label>
              <span className="text-xs text-violet-300">
                Selected: Stage {selectedStage}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                id="dashboard-reflection"
                type="text"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Write your declaration of transformation..."
                className="flex-1 px-4 py-2 rounded-xl bg-[#141126] border border-violet-500/25 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              />
              <button
                type="submit"
                disabled={evolving}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {evolving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Writing to C++ file...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Save to File</span>
                  </>
                )}
              </button>
            </div>

            {evolutionNotice && (
              <p className="text-xs text-cyan-300 font-medium">{evolutionNotice}</p>
            )}
          </form>
        </div>

        {/* Security & File Record Audit Card (1 Column) */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>C++ File Persistence Audit</span>
          </h3>

          <div className="p-5 rounded-2xl bg-[#0f0d1b]/80 border border-violet-500/20 backdrop-blur-md space-y-4 text-xs">
            <div>
              <div className="text-slate-400">Account Username</div>
              <div className="text-sm font-bold text-white mt-0.5">{user.username}</div>
            </div>

            <div className="pt-3 border-t border-violet-500/15">
              <div className="text-slate-400">Persistent User ID</div>
              <div className="font-mono text-cyan-300 mt-0.5">#{user.id}</div>
            </div>

            <div className="pt-3 border-t border-violet-500/15">
              <div className="text-slate-400">Credential Storage</div>
              <div className="text-slate-200 font-medium mt-0.5 flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-violet-400" />
                <span>backend/data/users.dat</span>
              </div>
            </div>

            <div className="pt-3 border-t border-violet-500/15">
              <div className="text-slate-400">Encryption Standard</div>
              <div className="text-emerald-400 font-semibold mt-0.5">
                Argon2id (Memory-Hard Hashing)
              </div>
            </div>

            <div className="pt-3 border-t border-violet-500/15">
              <div className="text-slate-400">Created At (UTC)</div>
              <div className="text-slate-300 font-mono mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.createdAt}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-violet-500/15">
              <div className="text-slate-400">Last Successful Login</div>
              <div className="text-slate-300 font-mono mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.lastLogin}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-violet-500/15">
              <div className="text-slate-400">Session Token (Bearer)</div>
              <div className="font-mono text-[11px] text-cyan-300/80 truncate mt-0.5">
                {tokenPreview}
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenVivaModal}
              className="w-full mt-2 py-2 px-3 rounded-xl text-xs font-semibold text-center text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 transition-all cursor-pointer"
            >
              Inspect Raw users.dat File →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
