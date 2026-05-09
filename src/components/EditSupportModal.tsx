import { memo, useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    initialSupport: { home: number; draw: number; away: number };
    currentSupport: { home: number; draw: number; away: number };
  }) => void;
  initialSupport?: { home: number; draw: number; away: number };
  currentSupport: { home: number; draw: number; away: number };
}

export const EditSupportModal = memo(function EditSupportModal({
  isOpen,
  onClose,
  onSave,
  initialSupport,
  currentSupport,
}: EditSupportModalProps) {
  const [initialHome, setInitialHome] = useState(initialSupport?.home?.toString() || '');
  const [initialDraw, setInitialDraw] = useState(initialSupport?.draw?.toString() || '');
  const [initialAway, setInitialAway] = useState(initialSupport?.away?.toString() || '');
  const [currentHome, setCurrentHome] = useState(currentSupport.home.toString());
  const [currentDraw, setCurrentDraw] = useState(currentSupport.draw.toString());
  const [currentAway, setCurrentAway] = useState(currentSupport.away.toString());

  useEffect(() => {
    if (initialSupport) {
      setInitialHome(initialSupport.home.toString());
      setInitialDraw(initialSupport.draw.toString());
      setInitialAway(initialSupport.away.toString());
    }
    setCurrentHome(currentSupport.home.toString());
    setCurrentDraw(currentSupport.draw.toString());
    setCurrentAway(currentSupport.away.toString());
  }, [initialSupport, currentSupport, isOpen]);

  const handleSave = () => {
    const data = {
      initialSupport: {
        home: parseFloat(initialHome) || 0,
        draw: parseFloat(initialDraw) || 0,
        away: parseFloat(initialAway) || 0,
      },
      currentSupport: {
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
          <h2 className="text-lg font-semibold text-text-primary">修改支持率</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-accent-yellow/10 border border-accent-yellow/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-accent-yellow">
                初支持率（初始支持率）
              </label>
              <button
                onClick={handleResetToCurrent}
                className="text-xs text-accent-yellow hover:text-accent-yellow/80 underline"
              >
                重置为即支持率
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-text-muted mb-1">主胜</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={initialHome}
                  onChange={(e) => setInitialHome(e.target.value)}
                  placeholder="50"
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-yellow focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">平局</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={initialDraw}
                  onChange={(e) => setInitialDraw(e.target.value)}
                  placeholder="25"
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-yellow focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">客胜</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={initialAway}
                  onChange={(e) => setInitialAway(e.target.value)}
                  placeholder="25"
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-yellow focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-accent-green/10 border border-accent-green/30 rounded-xl p-4">
            <label className="text-sm font-medium text-accent-green mb-3 block">
              即支持率（最新支持率）
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-text-muted mb-1">主胜</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={currentHome}
                  onChange={(e) => setCurrentHome(e.target.value)}
                  placeholder="50"
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">平局</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={currentDraw}
                  onChange={(e) => setCurrentDraw(e.target.value)}
                  placeholder="25"
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">客胜</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={currentAway}
                  onChange={(e) => setCurrentAway(e.target.value)}
                  placeholder="25"
                  className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-green focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-bg-tertiary/50 rounded-xl p-3">
            <p className="text-xs text-text-muted leading-relaxed">
              <strong className="text-text-secondary">说明：</strong>
              初支持率是比赛开始时的初始支持率，即支持率是当前最新的支持率。
              两者对比可以分析玩家资金流向和投注热度的变化。
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
            className="flex-1 py-2.5 px-4 rounded-xl bg-accent-yellow text-bg-primary text-sm font-medium hover:bg-accent-yellow/90 transition-colors"
          >
            保存修改
          </button>
        </div>
      </div>
    </div>
  );
});
