import { memo } from 'react';
import type { TabType } from '../types';

interface TabNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { key: TabType; label: string; icon: string }[] = [
  { key: 'kelly', label: '凯利值', icon: '📊' },
  { key: 'odds', label: '赔率', icon: '💰' },
  { key: 'support', label: '支持率', icon: '📈' },
  { key: 'prediction', label: '预测', icon: '🔮' },
];

export const TabNav = memo(function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="sticky top-14 z-40 bg-bg-primary/95 backdrop-blur-sm border-b border-bg-tertiary/50">
      <div className="flex relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`
                flex-1 relative py-3 px-4 text-sm font-medium transition-all duration-300
                ${isActive ? 'text-accent-green' : 'text-text-secondary hover:text-text-primary'}
              `}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-accent-green rounded-full shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
});
