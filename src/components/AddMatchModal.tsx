import { memo, useState } from 'react';
import { X, Plus, Calendar, Clock, Trophy, Info } from 'lucide-react';
import dayjs from 'dayjs';

interface MatchInputData {
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchTime: string;
  matchDate: string;
  initialOdds?: { home: number; draw: number; away: number };
  initialSupport?: { home: number; draw: number; away: number };
  initialKelly?: { home: number; draw: number; away: number };
}

interface AddMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMatch: (matchData: MatchInputData) => void;
}

const popularLeagues = ['英超', '西甲', '德甲', '意甲', '欧冠', '欧联', '足总杯', '中超', '亚冠', '日职', '韩K', '澳超'];
const popularTeams = [
  '曼城', '阿森纳', '利物浦', '切尔西', '曼联', '热刺', '纽卡斯尔', '维拉',
  '巴萨', '皇马', '马竞', '塞维利亚', '毕尔巴鄂',
  '拜仁', '多特蒙德', '莱比锡', '勒沃库森',
  '尤文', '国米', 'AC米兰', '那不勒斯', '罗马', '拉齐奥',
  '上海海港', '上海申花', '北京国安', '山东泰山', '成都蓉城',
  '横滨水手', '川崎前锋', '利雅得胜利', '利雅得新月', '蔚山现代'
];

export const AddMatchModal = memo(function AddMatchModal({
  isOpen,
  onClose,
  onAddMatch,
}: AddMatchModalProps) {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [league, setLeague] = useState('');
  const [matchDate, setMatchDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [matchHour, setMatchHour] = useState('20');
  const [matchMinute, setMatchMinute] = useState('00');
  const [showHomeDropdown, setShowHomeDropdown] = useState(false);
  const [showAwayDropdown, setShowAwayDropdown] = useState(false);
  const [initialHome, setInitialHome] = useState('');
  const [initialDraw, setInitialDraw] = useState('');
  const [initialAway, setInitialAway] = useState('');
  const [supportHome, setSupportHome] = useState('');
  const [supportDraw, setSupportDraw] = useState('');
  const [supportAway, setSupportAway] = useState('');
  const [kellyHome, setKellyHome] = useState('');
  const [kellyDraw, setKellyDraw] = useState('');
  const [kellyAway, setKellyAway] = useState('');

  const handleSubmit = () => {
    if (!homeTeam || !awayTeam || !league) return;
    if (homeTeam === awayTeam) return;

    const matchTime = `${matchHour}:${matchMinute}`;
    
    const initialOdds = (initialHome && initialDraw && initialAway) ? {
      home: parseFloat(initialHome),
      draw: parseFloat(initialDraw),
      away: parseFloat(initialAway),
    } : undefined;

    const initialSupport = (supportHome && supportDraw && supportAway) ? {
      home: parseFloat(supportHome),
      draw: parseFloat(supportDraw),
      away: parseFloat(supportAway),
    } : undefined;

    const initialKelly = (kellyHome && kellyDraw && kellyAway) ? {
      home: parseFloat(kellyHome),
      draw: parseFloat(kellyDraw),
      away: parseFloat(kellyAway),
    } : undefined;

    onAddMatch({ homeTeam, awayTeam, league, matchTime, matchDate, initialOdds, initialSupport, initialKelly });
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setHomeTeam('');
    setAwayTeam('');
    setLeague('');
    setInitialHome('');
    setInitialDraw('');
    setInitialAway('');
    setSupportHome('');
    setSupportDraw('');
    setSupportAway('');
    setKellyHome('');
    setKellyDraw('');
    setKellyAway('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full sm:max-w-md bg-bg-secondary rounded-t-2xl sm:rounded-2xl border border-bg-tertiary shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-bg-tertiary">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Plus className="w-5 h-5 text-accent-green" />
            添加比赛
          </h2>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
              <Trophy className="w-4 h-4" />
              联赛
            </label>
            <input
              type="text"
              value={league}
              onChange={(e) => setLeague(e.target.value)}
              placeholder="输入联赛名称"
              className="w-full p-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted border border-bg-tertiary focus:border-accent-green focus:outline-none"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {popularLeagues.map((l) => (
                <button
                  key={l}
                  onClick={() => setLeague(l)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${league === l ? 'bg-accent-green text-bg-primary' : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-text-secondary mb-2">主队</label>
              <div className="relative">
                <input
                  type="text"
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  onFocus={() => setShowHomeDropdown(true)}
                  placeholder="输入或选择"
                  className="w-full p-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted border border-bg-tertiary focus:border-accent-green focus:outline-none"
                />
                {showHomeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-bg-tertiary rounded-lg border border-bg-tertiary shadow-xl max-h-40 overflow-y-auto">
                    {popularTeams.filter((t) => t.includes(homeTeam) && t !== awayTeam).map((t) => (
                      <button
                        key={t}
                        onClick={() => { setHomeTeam(t); setShowHomeDropdown(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-secondary transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">客队</label>
              <div className="relative">
                <input
                  type="text"
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  onFocus={() => setShowAwayDropdown(true)}
                  placeholder="输入或选择"
                  className="w-full p-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted border border-bg-tertiary focus:border-accent-green focus:outline-none"
                />
                {showAwayDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-bg-tertiary rounded-lg border border-bg-tertiary shadow-xl max-h-40 overflow-y-auto">
                    {popularTeams.filter((t) => t.includes(awayTeam) && t !== homeTeam).map((t) => (
                      <button
                        key={t}
                        onClick={() => { setAwayTeam(t); setShowAwayDropdown(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-secondary transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                <Calendar className="w-4 h-4" />
                比赛日期
              </label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full p-3 bg-bg-tertiary rounded-lg text-text-primary border border-bg-tertiary focus:border-accent-green focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                <Clock className="w-4 h-4" />
                比赛时间
              </label>
              <div className="flex items-center gap-1">
                <select
                  value={matchHour}
                  onChange={(e) => setMatchHour(e.target.value)}
                  className="flex-1 p-3 bg-bg-tertiary rounded-lg text-text-primary border border-bg-tertiary focus:border-accent-green focus:outline-none"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}时</option>
                  ))}
                </select>
                <span className="text-text-muted">:</span>
                <select
                  value={matchMinute}
                  onChange={(e) => setMatchMinute(e.target.value)}
                  className="flex-1 p-3 bg-bg-tertiary rounded-lg text-text-primary border border-bg-tertiary focus:border-accent-green focus:outline-none"
                >
                  {['00', '15', '30', '45'].map((m) => (
                    <option key={m} value={m}>{m}分</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-accent-green/10 border border-accent-green/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-accent-green" />
              <span className="text-sm font-medium text-accent-green">初始数据录入</span>
            </div>
            <p className="text-xs text-text-secondary mb-3">
              输入比赛的初始数据，系统将自动生成后续变化趋势
            </p>
            
            <div className="mb-4">
              <label className="text-sm text-text-secondary mb-2 block font-medium text-accent-yellow">
                初赔率（初始赔率）
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
                    placeholder="1.80"
                    className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-yellow focus:outline-none"
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
                    placeholder="3.40"
                    className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-yellow focus:outline-none"
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
                    placeholder="4.50"
                    className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-yellow focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-text-secondary mb-2 block font-medium text-accent-blue">
                初支持率（初始支持率 %）
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-text-muted mb-1">主胜%</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={supportHome}
                    onChange={(e) => setSupportHome(e.target.value)}
                    placeholder="55"
                    className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">平局%</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={supportDraw}
                    onChange={(e) => setSupportDraw(e.target.value)}
                    placeholder="25"
                    className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">客胜%</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={supportAway}
                    onChange={(e) => setSupportAway(e.target.value)}
                    placeholder="20"
                    className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-blue focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-xs text-text-muted mt-1">支持率总和应接近100%</p>
            </div>

            <div>
              <label className="text-sm text-text-secondary mb-2 block font-medium text-accent-purple">
                初凯利值（初始凯利值）
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-text-muted mb-1">主胜</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={kellyHome}
                    onChange={(e) => setKellyHome(e.target.value)}
                    placeholder="0.85"
                    className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-purple focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">平局</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={kellyDraw}
                    onChange={(e) => setKellyDraw(e.target.value)}
                    placeholder="0.75"
                    className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-purple focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">客胜</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={kellyAway}
                    onChange={(e) => setKellyAway(e.target.value)}
                    placeholder="0.65"
                    className="w-full p-2 bg-bg-primary rounded-lg text-text-primary text-sm placeholder:text-text-muted border border-bg-tertiary focus:border-accent-purple focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-xs text-text-muted mt-1">留空将根据赔率和支持率自动计算</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={!homeTeam || !awayTeam || !league || homeTeam === awayTeam}
              className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all ${homeTeam && awayTeam && league && homeTeam !== awayTeam ? 'bg-accent-green text-bg-primary hover:bg-accent-green/90 active:scale-[0.98]' : 'bg-bg-tertiary text-text-muted cursor-not-allowed'}`}
            >
              添加比赛
            </button>
            {(!initialHome) && (
              <p className="text-xs text-text-muted mt-2 text-center">
                初赔率留空将自动生成模拟数据进行演示
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
