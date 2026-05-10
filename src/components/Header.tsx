import { RefreshCw, Menu, Download } from 'lucide-react';
import { memo, useState } from 'react';

interface HeaderProps {
  title: string;
  onRefresh?: () => void;
  showRefresh?: boolean;
  onExport?: () => void;
  onImport?: () => void;
  onExportCode?: () => void;
}

export const Header = memo(function Header({ title, onRefresh, showRefresh = true, onExport, onImport, onExportCode }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bg-primary/95 backdrop-blur-sm border-b border-bg-tertiary/50">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-accent-green/50 flex items-center justify-center">
            <span className="text-bg-primary font-bold text-sm">足</span>
          </div>
          <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {showRefresh && onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors active:scale-95"
              aria-label="刷新数据"
            >
              <RefreshCw className="w-5 h-5 text-text-secondary" />
            </button>
          )}
          {(onExport || onImport) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors active:scale-95"
                aria-label="数据管理"
              >
                <Menu className="w-5 h-5 text-text-secondary" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-bg-secondary rounded-lg shadow-xl border border-bg-tertiary/50 py-1 z-50">
                  {onExport && (
                    <button
                      onClick={() => {
                        onExport();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                    >
                      导出数据
                    </button>
                  )}
                  {onImport && (
                    <button
                      onClick={() => {
                        onImport();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                    >
                      导入数据
                    </button>
                  )}
                  {onExportCode && (
                    <>
                      <div className="border-t border-bg-tertiary/50 my-1" />
                      <button
                        onClick={() => {
                          onExportCode();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-accent-blue hover:bg-bg-tertiary transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        导出代码
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
});
