import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { MatchCard } from './components/MatchCard';
import Empty from './components/Empty';
import { TabNav } from './components/TabNav';
import { AddMatchModal } from './components/AddMatchModal';
import { EditOddsModal } from './components/EditOddsModal';
import { EditKellyModal } from './components/EditKellyModal';
import { EditSupportModal } from './components/EditSupportModal';
import { KellyChart } from './components/KellyChart';
import { OddsTrend } from './components/OddsTrend';
import { SupportRateChart } from './components/SupportRateChart';
import { PredictionChart } from './components/PredictionChart';
import type { Match, OddsData, SupportRate, KellyValue, TabType } from './types';
import { generateKellyValue } from './utils/calculations';
import { generatePrediction } from './services/predictionService';
import { Plus, Trash2 } from 'lucide-react';

function createOddsHistoryFromTwoPoints(initial: { home: number; draw: number; away: number }, current: { home: number; draw: number; away: number }) {
  const history = [];
  const points = 13;
  for (let i = points; i >= 0; i--) {
    const progress = i / points;
    history.push({
      time: `${String(20 - Math.floor(i * 0.5)).padStart(2, '0')}:${String(Math.floor((i * 5) % 60)).padStart(2, '0')}`,
      home: parseFloat((initial.home + (current.home - initial.home) * (1 - progress)).toFixed(2)),
      draw: parseFloat((initial.draw + (current.draw - initial.draw) * (1 - progress)).toFixed(2)),
      away: parseFloat((initial.away + (current.away - initial.away) * (1 - progress)).toFixed(2)),
    });
  }
  return history;
}

function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [oddsData, setOddsData] = useState<Record<string, OddsData>>({});
  const [supportData, setSupportData] = useState<Record<string, SupportRate>>({});
  const [kellyData, setKellyData] = useState<Record<string, KellyValue>>({});
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('kelly');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOddsEditModal, setShowOddsEditModal] = useState(false);
  const [showKellyEditModal, setShowKellyEditModal] = useState(false);
  const [showSupportEditModal, setShowSupportEditModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);

  const handleExportData = useCallback(() => {
    const allData = {
      matches,
      oddsData,
      supportData,
      kellyData,
      exportTime: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(allData, null, 2);
    const fileName = `football_data_${Date.now()}.json`;
    
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.target = '_blank';
    link.click();
    
    setTimeout(() => {
      alert('数据导出完成！\n\n如果文件没有自动保存，请查看浏览器的下载记录。\n\n重要提示：您的数据已自动保存在本地存储中，刷新页面不会丢失。');
    }, 500);
  }, [matches, oddsData, supportData, kellyData]);

  const handleImportData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.matches) setMatches(data.matches);
          if (data.oddsData) setOddsData(data.oddsData);
          if (data.supportData) setSupportData(data.supportData);
          if (data.kellyData) setKellyData(data.kellyData);
          alert('数据导入成功！');
        } catch (error) {
          alert('导入失败，请确保文件格式正确');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  useEffect(() => {
    const savedMatches = localStorage.getItem('footballMatches');
    const savedOdds = localStorage.getItem('footballOdds');
    const savedSupport = localStorage.getItem('footballSupport');
    const savedKelly = localStorage.getItem('footballKelly');

    if (savedMatches) {
      const loadedMatches = JSON.parse(savedMatches);
      setMatches(loadedMatches);
      
      if (savedOdds) {
        setOddsData(JSON.parse(savedOdds));
      }
      if (savedSupport) {
        setSupportData(JSON.parse(savedSupport));
      }
      if (savedKelly) {
        setKellyData(JSON.parse(savedKelly));
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('footballMatches', JSON.stringify(matches));
    localStorage.setItem('footballOdds', JSON.stringify(oddsData));
    localStorage.setItem('footballSupport', JSON.stringify(supportData));
    localStorage.setItem('footballKelly', JSON.stringify(kellyData));
  }, [matches, oddsData, supportData, kellyData, isLoaded]);

  const handleDeleteMatch = useCallback((matchId: string) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
    setOddsData(prev => {
      const newData = { ...prev };
      delete newData[matchId];
      return newData;
    });
    setSupportData(prev => {
      const newData = { ...prev };
      delete newData[matchId];
      return newData;
    });
    setKellyData(prev => {
      const newData = { ...prev };
      delete newData[matchId];
      return newData;
    });
    if (selectedMatchId === matchId) {
      setSelectedMatchId(null);
    }
  }, [selectedMatchId]);

  const handleUpdateScore = useCallback((matchId: string, score: { home: number; away: number }) => {
    setMatches(prev => prev.map(m => 
      m.id === matchId ? { ...m, score } : m
    ));
  }, []);

  const handleSaveOdds = useCallback((matchId: string, data: {
    initialOdds: { home: number; draw: number; away: number };
    currentOdds: { home: number; draw: number; away: number };
    support: { home: number; draw: number; away: number };
    manualKelly?: { home: number; draw: number; away: number };
  }) => {
    const odds: OddsData = {
      matchId,
      company: '自定义',
      initial: data.initialOdds,
      current: data.currentOdds,
      history: createOddsHistoryFromTwoPoints(data.initialOdds, data.currentOdds),
    };
    setOddsData(prev => ({ ...prev, [matchId]: odds }));

    const baseSupport = data.support;
    const supportHistory = [];
    const now = new Date();
    const points = 13;
    for (let i = points; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 10 * 60 * 1000);
      const progress = i / points;
      supportHistory.push({
        time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        home: parseFloat((baseSupport.home + (baseSupport.home * 0.1 * (Math.random() - 0.5)) * (1 - progress)).toFixed(1)),
        draw: parseFloat((baseSupport.draw + (baseSupport.draw * 0.1 * (Math.random() - 0.5)) * (1 - progress)).toFixed(1)),
        away: parseFloat((baseSupport.away + (baseSupport.away * 0.1 * (Math.random() - 0.5)) * (1 - progress)).toFixed(1)),
      });
    }
    const normalizedHistory = supportHistory.map(h => {
      const total = h.home + h.draw + h.away;
      return {
        ...h,
        home: parseFloat((h.home / total * 100).toFixed(1)),
        draw: parseFloat((h.draw / total * 100).toFixed(1)),
        away: parseFloat((h.away / total * 100).toFixed(1)),
      };
    });

    const support: SupportRate = {
      matchId,
      home: baseSupport.home,
      draw: baseSupport.draw,
      away: baseSupport.away,
      history: normalizedHistory,
      totalBets: 10000,
      initial: data.support,
    };
    setSupportData(prev => ({ ...prev, [matchId]: support }));

    const kelly = generateKellyValue(odds, support);
    
    const existingKelly = kellyData[matchId];
    
    kelly.initial = existingKelly?.initial || {
      home: kelly.home.kelly,
      draw: kelly.draw.kelly,
      away: kelly.away.kelly,
    };

    if (existingKelly?.manualKelly) {
      kelly.manualKelly = existingKelly.manualKelly;
      kelly.home.kelly = existingKelly.manualKelly.home;
      kelly.draw.kelly = existingKelly.manualKelly.draw;
      kelly.away.kelly = existingKelly.manualKelly.away;
    } else if (data.manualKelly) {
      kelly.manualKelly = data.manualKelly;
      kelly.home.kelly = data.manualKelly.home;
      kelly.draw.kelly = data.manualKelly.draw;
      kelly.away.kelly = data.manualKelly.away;
    }

    setKellyData(prev => ({ ...prev, [matchId]: kelly }));
  }, [kellyData]);

  const handleSaveKelly = useCallback((matchId: string, data: {
    initialKelly: { home: number; draw: number; away: number };
    currentKelly: { home: number; draw: number; away: number };
  }) => {
    setKellyData(prev => {
      const existing = prev[matchId];
      if (!existing) return prev;
      
      const newKelly = {
        ...existing,
        initial: data.initialKelly,
        manualKelly: data.currentKelly,
        home: { ...existing.home, kelly: data.currentKelly.home },
        draw: { ...existing.draw, kelly: data.currentKelly.draw },
        away: { ...existing.away, kelly: data.currentKelly.away },
      };
      
      return { ...prev, [matchId]: newKelly };
    });
  }, []);

  const handleSaveSupport = useCallback((matchId: string, data: {
    initialSupport: { home: number; draw: number; away: number };
    currentSupport: { home: number; draw: number; away: number };
  }) => {
    const supportHistory = [];
    const now = new Date();
    const points = 13;
    const initial = data.initialSupport;
    const current = data.currentSupport;
    
    for (let i = points; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 10 * 60 * 1000);
      const progress = i / points;
      supportHistory.push({
        time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        home: parseFloat((initial.home + (current.home - initial.home) * (1 - progress)).toFixed(1)),
        draw: parseFloat((initial.draw + (current.draw - initial.draw) * (1 - progress)).toFixed(1)),
        away: parseFloat((initial.away + (current.away - initial.away) * (1 - progress)).toFixed(1)),
      });
    }

    const normalizedHistory = supportHistory.map(h => {
      const total = h.home + h.draw + h.away;
      return {
        ...h,
        home: parseFloat((h.home / total * 100).toFixed(1)),
        draw: parseFloat((h.draw / total * 100).toFixed(1)),
        away: parseFloat((h.away / total * 100).toFixed(1)),
      };
    });

    const support: SupportRate = {
      matchId,
      home: current.home,
      draw: current.draw,
      away: current.away,
      history: normalizedHistory,
      totalBets: 10000,
      initial: data.initialSupport,
    };

    setSupportData(prev => ({ ...prev, [matchId]: support }));

    const existingKelly = kellyData[matchId];
    if (existingKelly) {
      const updatedKelly = {
        ...existingKelly,
        home: { ...existingKelly.home, kelly: existingKelly.manualKelly?.home || existingKelly.home.kelly },
        draw: { ...existingKelly.draw, kelly: existingKelly.manualKelly?.draw || existingKelly.draw.kelly },
        away: { ...existingKelly.away, kelly: existingKelly.manualKelly?.away || existingKelly.away.kelly },
      };
      setKellyData(prev => ({ ...prev, [matchId]: updatedKelly }));
    }
  }, [kellyData]);

  const handleAddMatch = useCallback((matchData: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    matchTime: string;
    matchDate: string;
    initialOdds?: { home: number; draw: number; away: number };
    initialSupport?: { home: number; draw: number; away: number };
    initialKelly?: { home: number; draw: number; away: number };
  }) => {
    const newId = `custom-${Date.now()}`;
    const newMatch: Match = {
      id: newId,
      homeTeam: matchData.homeTeam,
      awayTeam: matchData.awayTeam,
      homeTeamLogo: `https://api.dicebear.com/7.x/shapes/svg?seed=${matchData.homeTeam}`,
      awayTeamLogo: `https://api.dicebear.com/7.x/shapes/svg?seed=${matchData.awayTeam}`,
      matchTime: matchData.matchTime,
      matchDate: matchData.matchDate,
      status: 'upcoming',
      league: matchData.league,
    };

    const initialOddsData = matchData.initialOdds || { home: 2.0, draw: 3.3, away: 3.5 };
    const currentOdds = { ...initialOddsData };
    
    const odds: OddsData = {
      matchId: newId,
      company: '自定义',
      initial: initialOddsData,
      current: currentOdds,
      history: createOddsHistoryFromTwoPoints(initialOddsData, currentOdds),
    };

    const initialSupportData = matchData.initialSupport || { home: 50, draw: 25, away: 25 };
    const now = new Date();
    const history = [];
    for (let i = 13; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 10 * 60 * 1000);
      history.push({
        time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        home: initialSupportData.home,
        draw: initialSupportData.draw,
        away: initialSupportData.away,
      });
    }

    const support: SupportRate = {
      matchId: newId,
      home: initialSupportData.home,
      draw: initialSupportData.draw,
      away: initialSupportData.away,
      history,
      totalBets: 10000,
      initial: initialSupportData,
    };

    const kelly = generateKellyValue(odds, support);
    
    const initialKellyData = matchData.initialKelly || {
      home: kelly.home.kelly,
      draw: kelly.draw.kelly,
      away: kelly.away.kelly,
    };
    
    kelly.initial = initialKellyData;
    
    if (matchData.initialKelly) {
      kelly.manualKelly = matchData.initialKelly;
      kelly.home.kelly = matchData.initialKelly.home;
      kelly.draw.kelly = matchData.initialKelly.draw;
      kelly.away.kelly = matchData.initialKelly.away;
    }

    setMatches(prev => [...prev, newMatch]);
    setOddsData(prev => ({ ...prev, [newId]: odds }));
    setSupportData(prev => ({ ...prev, [newId]: support }));
    setKellyData(prev => ({ ...prev, [newId]: kelly }));
  }, []);

  const selectedMatch = matches.find(m => m.id === selectedMatchId) || null;
  const selectedOdds = selectedMatchId ? oddsData[selectedMatchId] : undefined;
  const selectedSupport = selectedMatchId ? supportData[selectedMatchId] : undefined;
  const selectedKelly = selectedMatchId ? kellyData[selectedMatchId] : undefined;

  const prediction = selectedMatchId && selectedOdds && selectedSupport && selectedKelly
    ? generatePrediction(selectedOdds, selectedSupport, selectedKelly)
    : undefined;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header title="足球数据分析" onExport={handleExportData} onImport={handleImportData} />
      
      <div className="max-w-md mx-auto pb-20">
        {selectedMatch && (
          <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-sm border-b border-bg-tertiary">
            <div className="p-3">
              <button
                onClick={() => setSelectedMatchId(null)}
                className="flex items-center gap-2 text-sm text-accent-green hover:underline mb-3"
              >
                ← 返回列表
              </button>
              
              <div className="flex items-center justify-between bg-bg-secondary rounded-xl p-3 border border-bg-tertiary">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center">
                      <span className="text-xs font-medium">{selectedMatch.homeTeam.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{selectedMatch.homeTeam}</div>
                      <div className="text-xs text-text-muted">{selectedMatch.league}</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center px-3">
                  <div className="text-lg font-bold text-text-primary">VS</div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 justify-end">
                    <div>
                      <div className="text-sm font-medium text-text-primary text-right">{selectedMatch.awayTeam}</div>
                      <div className="text-xs text-text-muted text-right">
                        {selectedMatch.matchDate} {selectedMatch.matchTime}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center">
                      <span className="text-xs font-medium">{selectedMatch.awayTeam.charAt(0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="flex-1" />
                <div className="text-center px-3">
                  {selectedMatch.score ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-accent-green">{selectedMatch.score.home}</span>
                      <span className="text-lg text-text-muted">-</span>
                      <span className="text-2xl font-bold text-accent-red">{selectedMatch.score.away}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        id="score-home"
                        className="w-12 px-2 py-1 bg-bg-primary rounded-lg text-center text-xl font-bold text-text-primary border border-bg-tertiary focus:border-accent-green focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const homeInput = document.getElementById('score-home') as HTMLInputElement;
                            const awayInput = document.getElementById('score-away') as HTMLInputElement;
                            const home = parseInt(homeInput.value) || 0;
                            const away = parseInt(awayInput.value) || 0;
                            if (home >= 0 && away >= 0) {
                              handleUpdateScore(selectedMatch.id, { home, away });
                            }
                          }
                        }}
                      />
                      <span className="text-lg text-text-muted">-</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        id="score-away"
                        className="w-12 px-2 py-1 bg-bg-primary rounded-lg text-center text-xl font-bold text-text-primary border border-bg-tertiary focus:border-accent-red focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const homeInput = document.getElementById('score-home') as HTMLInputElement;
                            const awayInput = document.getElementById('score-away') as HTMLInputElement;
                            const home = parseInt(homeInput.value) || 0;
                            const away = parseInt(awayInput.value) || 0;
                            if (home >= 0 && away >= 0) {
                              handleUpdateScore(selectedMatch.id, { home, away });
                            }
                          }
                        }}
                      />
                      <span className="text-xs text-text-muted ml-1">回车确认</span>
                    </div>
                  )}
                </div>
                <div className="flex-1" />
              </div>

              <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>
        )}

        {selectedMatch ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setShowKellyEditModal(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-accent-purple text-white text-sm font-medium hover:bg-accent-purple/90 transition-colors"
              >
                修改凯利
              </button>
              <button
                onClick={() => setShowOddsEditModal(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-accent-green text-bg-primary text-sm font-medium hover:bg-accent-green/90 transition-colors"
              >
                修改赔率
              </button>
              <button
                onClick={() => setShowSupportEditModal(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-accent-yellow text-bg-primary text-sm font-medium hover:bg-accent-yellow/90 transition-colors"
              >
                修改支持率
              </button>
            </div>

            {activeTab === 'kelly' && selectedKelly && (
              <KellyChart kellyData={selectedKelly} />
            )}
            {activeTab === 'odds' && selectedOdds && (
              <OddsTrend oddsData={selectedOdds} />
            )}
            {activeTab === 'support' && selectedSupport && (
              <SupportRateChart supportData={selectedSupport} />
            )}
            {activeTab === 'prediction' && prediction && selectedOdds && selectedKelly && selectedSupport && (
              <PredictionChart
                data={prediction}
                oddsData={selectedOdds}
                kellyData={selectedKelly}
                supportData={selectedSupport}
              />
            )}
          </div>
        ) : (
          <div className="p-4">
            {matches.length === 0 ? (
              <Empty />
            ) : (
              <div className="space-y-3">
                {matches.map((match) => (
                  <div key={match.id} className="relative">
                    <MatchCard
                      match={match}
                      onClick={() => setSelectedMatchId(match.id)}
                      isSelected={selectedMatchId === match.id}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMatch(match.id);
                      }}
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-accent-red/20 text-accent-red hover:bg-accent-red/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {!selectedMatch && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-accent-green rounded-full flex items-center justify-center shadow-lg hover:bg-accent-green/90 active:scale-95 transition-all z-20"
        >
          <Plus className="w-6 h-6 text-bg-primary" />
        </button>
      )}

      <AddMatchModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddMatch={handleAddMatch}
      />

      <EditOddsModal
        isOpen={showOddsEditModal}
        onClose={() => setShowOddsEditModal(false)}
        onSave={(data) => {
          if (selectedMatchId) {
            handleSaveOdds(selectedMatchId, data);
          }
        }}
        initialOdds={selectedOdds?.initial || { home: 1.8, draw: 3.4, away: 4.5 }}
        currentOdds={{
          home: selectedOdds?.current.home || 1.8,
          draw: selectedOdds?.current.draw || 3.4,
          away: selectedOdds?.current.away || 4.5,
        }}
        support={{
          home: selectedSupport?.home || 50,
          draw: selectedSupport?.draw || 30,
          away: selectedSupport?.away || 20,
        }}
        manualKelly={selectedKelly?.manualKelly}
      />

      <EditKellyModal
        isOpen={showKellyEditModal}
        onClose={() => setShowKellyEditModal(false)}
        onSave={(data) => {
          if (selectedMatchId) {
            handleSaveKelly(selectedMatchId, data);
          }
        }}
        initialKelly={selectedKelly?.initial}
        currentKelly={{
          home: selectedKelly?.home.kelly || 0,
          draw: selectedKelly?.draw.kelly || 0,
          away: selectedKelly?.away.kelly || 0,
        }}
      />

      <EditSupportModal
        isOpen={showSupportEditModal}
        onClose={() => setShowSupportEditModal(false)}
        onSave={(data) => {
          if (selectedMatchId) {
            handleSaveSupport(selectedMatchId, data);
          }
        }}
        initialSupport={selectedSupport?.initial}
        currentSupport={{
          home: selectedSupport?.home || 0,
          draw: selectedSupport?.draw || 0,
          away: selectedSupport?.away || 0,
        }}
      />
    </div>
  );
}

export default App;
