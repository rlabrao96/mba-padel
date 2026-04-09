'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { Tabs, TabKey } from '@/components/Tabs';
import { GroupsView } from '@/components/GroupsView';
import { ScheduleView } from '@/components/ScheduleView';
import { GoldCupView } from '@/components/GoldCupView';
import { SilverCupView } from '@/components/SilverCupView';
import { BronzeCupView } from '@/components/BronzeCupView';
import { RulesView } from '@/components/RulesView';
import { useTournamentState } from '@/lib/useTournamentState';
import { allGroupMatchesEntered, getClassification } from '@/lib/standings';

export default function HomePage() {
  const [tab, setTab] = useState<TabKey>('groups');
  const { state, status, lastUpdated, updateGroupMatch, updateBracketScore, resetAll } =
    useTournamentState();

  const classification = useMemo(
    () => getClassification(state.groupMatches),
    [state.groupMatches],
  );

  const handleCalculate = () => {
    if (!allGroupMatchesEntered(state.groupMatches)) {
      alert('⚠️ Please enter all group stage results before calculating classifications.');
      return;
    }
    setTab('gold');
  };

  const handleReset = () => {
    if (!confirm('Are you sure you want to reset all results?')) return;
    resetAll();
  };

  return (
    <div className="min-h-screen">
      <Header status={status} lastUpdated={lastUpdated} />
      <Tabs active={tab} onChange={setTab} />

      <main className="mx-auto max-w-6xl px-3 py-5 sm:px-4 sm:py-8">
        {tab === 'groups' && (
          <GroupsView
            groupMatches={state.groupMatches}
            onScoreChange={updateGroupMatch}
            onCalculate={handleCalculate}
            onReset={handleReset}
          />
        )}
        {tab === 'schedule' && <ScheduleView />}
        {tab === 'gold' && (
          <GoldCupView
            classification={classification}
            bracketScores={state.bracketScores}
            onChange={updateBracketScore}
          />
        )}
        {tab === 'silver' && (
          <SilverCupView
            classification={classification}
            bracketScores={state.bracketScores}
            onChange={updateBracketScore}
          />
        )}
        {tab === 'bronze' && (
          <BronzeCupView
            classification={classification}
            bracketScores={state.bracketScores}
            onChange={updateBracketScore}
          />
        )}
        {tab === 'rules' && <RulesView />}

        <footer className="mt-12 border-t border-border/40 pt-6 text-center text-[11px] text-text-dim">
          <div>Adidas MBA Padel Tournament · April 11–12, 2026</div>
          <div className="mt-1">
            Hosted at PadelHub USA · 653 Summer St., Boston, MA
          </div>
        </footer>
      </main>
    </div>
  );
}
