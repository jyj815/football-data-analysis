import { memo, useState, useEffect } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';

interface EditOddsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    initialOdds: { home: number; draw: number; away: number };
    currentOdds: { home: number; draw: number; away: number };
    support: { home: number; draw: number; away: number };
    manualKelly?: { home: number; draw: number; away: number };
  }) => void;
  initialOdds: { home: number; draw: number; away: number };
  currentOdds: { home: number; draw: number; away: number };
  support: { home: number; draw: number; away: number };
  manualKelly?: { home: number; draw: number; away: number };
}

export const EditOddsModal = memo(function EditOddsModal({
  isOpen,
  onClose,
  onSave,
  initialOdds,
  currentOdds,
  support,
  manualKelly,
}: EditOddsModalProps) {
  const [initialHome, setInitialHome] = useState(initialOdds.home.toString());
  const [initialDraw, setInitialDraw] = useState(initialOdds.draw.toString());
  const [initialAway, setInitialAway] = useState(initialOdds.away.toString());
  const [currentHome, setCurrentHome] = useState(currentOdds.home.toString());
  const [currentDraw, setCurrentDraw] = useState(currentOdds.draw.toString());
  const [currentAway, setCurrentAway] = useState(currentOdds.away.toString());
  const [supportHome, setSupportHome] = useState(support.home.toString());
  const [supportDraw, setSupportDraw] = useState(support.draw.toString());
  const [supportAway, setSupportAway] = useState(support.away.toString());
  const [kellyHome, setKellyHome] = useState(manualKelly?.home?.toString() || '');
  const [kellyDraw, setKellyDraw] = useState(manualKelly?.draw?.toString() || '');
  const [kellyAway, setKellyAway] = useState(manualKelly?.away?.toString() || '');

  useEffect(() => {
    setInitialHome(initialOdds.home.toString());
    setInitialDraw(initialOdds.draw.toString());
    setInitialAway(initialOdds.away.toString());
    setCurrentHome(currentOdds.home.toString());
    setCurrentDraw(currentOdds.draw.toString());
    setCurrentAway(currentOdds.away.toString());
    setSupportHome(support.home.toString());
    setSupportDraw(support.draw.toString());
    setSupportAway(support.away.toString());
    if (manualKelly) {
      setKellyHome(manualKelly.home.toString());
      setKellyDraw(manualKelly.draw.toString());
      setKellyAway(manualKelly.away.toString());
    }
  }, [initialOdds, currentOdds, support, manualKelly, isOpen]);

  const handleSave = () => {
    const data = {
      initialOdds: {
        home: parseFloat(initialHome) || 0,
        draw: parseFloat(initialDraw) || 0,
        away: parseFloat(initialAway) || 0,
      },
      currentOdds: {
        home: parseFloat(currentHome) || 0,
        draw: parseFloat(currentDraw) || 0,
        away: parseFloat(currentAway) || 0,
      },
      support: {
        home: parseFloat(supportHome) || 0,
        draw: parseFloat(supportDraw) || 0,
        away: parseFloat(supportAway) || 0,
      },
      manualKelly: (kellyHome && kellyDraw && kellyAway) ? {
        home: parseFloat(kellyHome),
        draw: parseFloat(kellyDraw),
        away: parseFloat(kellyAway),
      } : undefined,
    };
    onSave(data);
    onClose();
  };

  const handleResetToCurrent = () => {
    setInitialHome(currentHome);
    setInitialDraw(currentDraw);
    setInitialAway(currentAway);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-secondary rounded-2xl shadow-2xl border border-bg-tertiary overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-bg-tertiary">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-accent-green" />
            修改赔率
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-accent-yellow/10 border border-accent-yellow/30 rounded-xl p-4">
            <label className="text-sm text-accent-yellow font-medium mb-2 block">
              初赔（初始赔率）
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-text-muted mb-1">主胜</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={initialHome}
                  onChange={(e) => setInitialHome(e.target.value)}
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm border border-bg-tertiary focus:border-accent-yellow focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">平局</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={initialDraw}
                  onChange={(e) => setInitialDraw(e.target.value)}
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm border border-bg-tertiary focus:border-accent-yellow focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">客胜</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={initialAway}
                  onChange={(e) => setInitialAway(e.target.value)}
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm border border-bg-tertiary focus:border-accent-yellow focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-accent-green/10 border border-accent-green/30 rounded-xl p-4">
            <label className="text-sm text-accent-green font-medium mb-2 block">
              即赔（即时赔率）
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-text-muted mb-1">主胜</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={currentHome}
                  onChange={(e) => setCurrentHome(e.target.value)}
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm border border-bg-tertiary focus:border-accent-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">平局</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={currentDraw}
                  onChange={(e) => setCurrentDraw(e.target.value)}
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm border border-bg-tertiary focus:border-accent-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">客胜</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={currentAway}
                  onChange={(e) => setCurrentAway(e.target.value)}
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm border border-bg-tertiary focus:border-accent-green focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleResetToCurrent}
              className="flex-1 py-3 bg-bg-tertiary text-text-secondary rounded-xl font-medium text-sm hover:bg-bg-secondary transition-colors"
            >
              初赔=即赔
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-accent-green text-bg-primary rounded-xl font-medium text-sm hover:bg-accent-green/90 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存修改
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
