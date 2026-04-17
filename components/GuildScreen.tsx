'use client';
import { useState } from 'react';
import { PlayerState } from '@/lib/gameState';
import { Header, Card, Button, CurrencyDisplay, EmptyState } from './ui/DesignSystem';
import { motion } from 'motion/react';

interface GuildScreenProps {
  state: PlayerState;
  onBack: () => void;
  onAlert: (msg: string) => void;
  onNavigate: (screen: string) => void;
}

export default function GuildScreen({ state, onBack, onAlert, onNavigate }: GuildScreenProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'quests'>('info');
  const [donationAmount, setDonationAmount] = useState(1000);

  const hasGuild = state.guildId !== null;
  
  const sampleMembers = [
    { name: state.playerName, rank: 'leader', contribution: state.guildContribution || 0 },
    { name: 'Hero2', rank: 'officer', contribution: 5000 },
    { name: 'Hero3', rank: 'member', contribution: 1200 },
    { name: 'Hero4', rank: 'recruit', contribution: 0 },
  ];

  const sampleQuests = [
    { id: 'q1', name: 'Daily Donation', description: 'Donate 1000 zel', progress: Math.min(1, state.guildContribution ? state.guildContribution / 1000 : 0), reward: 50 },
    { id: 'q2', name: 'Battle Training', description: 'Win 5 battles', progress: 0.6, reward: 100 },
    { id: 'q3', name: 'Unit Collection', description: 'Collect 10 units', progress: 1, reward: 75 },
  ];

  const handleDonate = () => {
    if (state.zel < donationAmount) {
      onAlert('Not enough zel!');
      return;
    }
    onAlert(`Donated ${donationAmount} zel! +${Math.floor(donationAmount / 100)} Guild Coins`);
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'leader': return 'text-purple-400';
      case 'officer': return 'text-blue-400';
      case 'member': return 'text-green-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <Header 
        title="Guild" 
        icon="🏰"
        onBack={onBack}
        rightContent={
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm font-bold">🪙 {state.guildCoins || 0}</span>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-4">
        {!hasGuild ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <EmptyState 
              icon="🏰"
              title="No Guild"
              description="Join or create a guild to unlock social features, guild quests, and exclusive rewards!"
            />
            <div className="flex gap-4 w-full max-w-sm">
              <Button variant="primary" className="flex-1" onClick={() => onAlert('Guild creation coming soon!')}>
                Create Guild
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => onAlert('Guild list coming soon!')}>
                Find Guild
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Guild Info Card */}
            <Card variant="gold" className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-amber-400">{state.guildName || 'My Guild'}</h2>
                  <p className="text-xs text-zinc-400">Level {state.guildLevel || 1}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-400">{sampleMembers.length}</div>
                  <div className="text-xs text-zinc-500">Members</div>
                </div>
              </div>
              
              {/* Donation */}
              <div className="bg-zinc-900/50 rounded-lg p-3">
                <p className="text-xs text-zinc-400 mb-2">Support your guild</p>
                <div className="flex gap-2">
                  <select 
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                    className="bg-zinc-800 text-white text-sm rounded px-2 py-1 border border-zinc-700"
                  >
                    <option value={500}>500 zel</option>
                    <option value={1000}>1,000 zel</option>
                    <option value={5000}>5,000 zel</option>
                    <option value={10000}>10,000 zel</option>
                  </select>
                  <Button 
                    size="sm" 
                    variant="primary" 
                    onClick={handleDonate}
                    disabled={state.zel < donationAmount}
                  >
                    Donate
                  </Button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">+{Math.floor(donationAmount / 100)} Guild Coins per donation</p>
              </div>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'info' ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}
              >
                Info
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'members' ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab('quests')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'quests' ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}
              >
                Quests
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
              <Card className="mb-4">
                <h3 className="font-bold text-zinc-300 mb-3">Guild Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Contribution</span>
                    <span className="text-amber-400">{state.guildContribution?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Guild Level</span>
                    <span className="text-white">{state.guildLevel || 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Members</span>
                    <span className="text-white">{sampleMembers.length}/50</span>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'members' && (
              <div className="space-y-2">
                {sampleMembers.map((member, idx) => (
                  <Card key={idx} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{member.name}</div>
                        <div className={`text-xs ${getRankColor(member.rank)}`}>{member.rank.toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 text-sm font-bold">{member.contribution.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-500">contribution</div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'quests' && (
              <div className="space-y-3">
                {sampleQuests.map(quest => (
                  <Card key={quest.id} className="py-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-white">{quest.name}</h4>
                        <p className="text-xs text-zinc-400">{quest.description}</p>
                      </div>
                      <div className="text-amber-400 text-sm font-bold">+{quest.reward} 🪙</div>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-amber-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${quest.progress * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">{Math.floor(quest.progress * 100)}% complete</div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}