import { memo, useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditKellyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    initialKelly: { home: number; draw: number; away: number };
    currentKelly: { home: number; draw: number; away: number };
  }) => void;
  initialKelly?: { home: number; draw: number; away: number };
  currentKelly: { home: number; draw: number; away: number };
}

export const EditKellyModal = memo(function EditKellyModal({
  isOpen,
  onClose,
  onSave,
  initialKelly,
  currentKelly,
}: EditKellyModalProps) {
  const [initialHome, setInitialHome] = useState(initialKelly?.home?.toString() || '');
  const [initialDraw, setInitialDraw] = useState(initialKelly?.draw?.toString() || '');
  const [initialAway, setInitialAway] = useState(initialKelly?.away?.toString() || '');
  const [currentHome, setCurrentHome] = useState(currentKelly.home.toString());
  const [currentDraw, setCurrentDraw] = useState(currentKelly.draw.toString());
  const [currentAway, setCurrentAway] = useState(currentKelly.away.toString());

  useEffect(() => {
    if (initialKelly) {
      setInitialHome(initialKelly.home.toString());
      setInitialDraw(initialKelly.draw.toString());
      setInitialAway(initialKelly.away.toString());
    }
    setCurrentHome(currentKelly.home.toString());
    setCurrentDraw(currentKelly.draw.toString());
    setCurrentAway(currentKelly.away.toString());
  }, [initialKelly, currentKelly, isOpen]);

  const handleSave = () => {
    const data = {
      initialKelly: {
        home: parseFloat(initialHome) || 0,
        draw: parseFloat(initialDraw) || 0,
        away: parseFloat(initialAway) || 0,
      },
      currentKelly: {
        home: parseFloat(currentHome) || 0,
        draw: parseFloat(currentDraw) || 0,
        away: parseFloat(currentAway) || 0,
      },
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
      <div className="relative bg-bg-secondary rounded-2xl shadow-2xl w-full max-w-md border border-bg-tertiary overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-bg-tertiary">
          <h2 className="text-lg font-semibold text-text-primary">修改凯利指数</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-accent-purple/10 border border-accent-purple/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-accent-purple">
                初凯利（初始凯利值）
              </label>
              <button
                onClick={handleResetToCurrent}
                className="text-xs text-accent-purple hover:text-accent-purple/80 underline"
              >
                重置为即凯利
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-text-muted mb-1">主胜</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={initialHome}
                  onChange={(e) => setInitialHome(e.target.value)}
                  placeholder="0.85"
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-purple focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">平局</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={initialDraw}
                  onChange={(e) => setInitialDraw(e.target.value)}
                  placeholder="0.75"
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-purple focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">客胜</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={initialAway}
                  onChange={(e) => setInitialAway(e.target.value)}
                  placeholder="0.65"
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-purple focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-accent-green/10 border border-accent-green/30 rounded-xl p-4">
            <label className="text-sm font-medium text-accent-green mb-3 block">
              即凯利（最新凯利值）
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-text-muted mb-1">主胜</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={currentHome}
                  onChange={(e) => setCurrentHome(e.target.value)}
                  placeholder="0.85"
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">平局</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={currentDraw}
                  onChange={(e) => setCurrentDraw(e.target.value)}
                  placeholder="0.75"
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">客胜</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={currentAway}
                  onChange={(e) => setCurrentAway(e.target.value)}
                  placeholder="0.65"
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-green focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-bg-tertiary/50 rounded-xl p-3">
            <p className="text-xs text-text-muted leading-relaxed">
              <strong className="text-text-secondary">说明：</strong>
              初凯利是比赛开始时的初始凯利值，即凯利是当前最新的凯利值。
              两者对比可以分析凯利值的变化趋势，判断资金流向。
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-bg-tertiary bg-bg-primary">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-bg-tertiary text-text-secondary text-sm font-medium hover:bg-bg-tertiary transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl bg-accent-purple text-white text-sm font-medium hover:bg-accent-purple/90 transition-colors"
          >
            保存修改
          </button>
        </div>
      </div>
    </div>
  );
});
