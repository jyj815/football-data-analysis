import { memo } from 'react';
import type { Match } from '../types';
import { Clock, Zap, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

interface MatchCardProps {
  match: Match;
  onClick?: () => void;
  isSelected?: boolean;
}

export const MatchCard = memo(function MatchCard({ match, onClick, isSelected }: MatchCardProps) {
  const now = dayjs();
  const matchDateTime = dayjs(`${match.matchDate} ${match.matchTime}`);
  const isPastMatch = matchDateTime.isBefore(now);

  const statusConfig = {
    live: {
      label: '进行中',
      bgColor: 'bg-accent-green/10',
      textColor: 'text-accent-green',
      borderColor: 'border-accent-green/30',
    },
    upcoming: {
      label: isPastMatch ? '已完赛' : '未开始',
      bgColor: isPastMatch ? 'bg-bg-tertiary/50' : 'bg-bg-secondary',
      textColor: isPastMatch ? 'text-text-muted' : 'text-text-secondary',
      borderColor: 'border-bg-tertiary',
    },
    finished: {
      label: '已结束',
      bgColor: 'bg-bg-tertiary/50',
      textColor: 'text-text-muted',
      borderColor: 'border-bg-tertiary',
    },
  };

  const config = statusConfig[match.status];

  const formatDate = (dateStr: string) => {
    const date = dayjs(dateStr);
    const today = dayjs().startOf('day');
    const tomorrow = today.add(1, 'day');
    const matchDay = date.startOf('day');

    if (matchDay.isSame(today, 'day')) {
      return '今天';
    } else if (matchDay.isSame(tomorrow, 'day')) {
      return '明天';
    } else if (matchDay.isSame(today.subtract(1, 'day'), 'day')) {
      return '昨天';
    } else {
      return date.format('MM/DD');
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 rounded-xl border transition-all duration-200 active:scale-[0.98]
        ${config.bgColor} ${config.borderColor}
        ${isSelected ? 'ring-2 ring-accent-green/50 shadow-lg shadow-accent-green/10' : ''}
        hover:border-accent-green/30
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 text-xs rounded-full bg-bg-tertiary/50 text-text-secondary">
            {match.league}
          </span>
          {match.status === 'live' && (
            <span className={`flex items-center gap-1 text-xs font-medium ${config.textColor}`}>
              <Zap className="w-3 h-3 animate-pulse" />
              {config.label}
            </span>
          )}
          {match.status !== 'live' && (
            <span className={`text-xs ${config.textColor}`}>{config.label}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-xs ${config.textColor}`}>
            <Calendar className="w-3 h-3" />
            <span>{formatDate(match.matchDate)}</span>
          </div>
          <div className={`flex items-center gap-1 text-xs ${config.textColor}`}>
            <Clock className="w-3 h-3" />
            <span>{match.matchTime}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <img
            src={match.homeTeamLogo}
            alt={match.homeTeam}
            className="w-10 h-10 rounded-full bg-bg-tertiary p-1"
          />
          <span className="font-medium text-text-primary text-sm truncate">
            {match.homeTeam}
          </span>
        </div>

        {match.score && (
          <div className="px-4 flex items-center gap-2">
            <span className="text-xl font-bold text-text-primary font-mono">
              {match.score.home}
            </span>
            <span className="text-text-muted">-</span>
            <span className="text-xl font-bold text-text-primary font-mono">
              {match.score.away}
            </span>
          </div>
        )}

        {!match.score && (
          <div className="px-4 text-lg text-text-muted">VS</div>
        )}

        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="font-medium text-text-primary text-sm truncate">
            {match.awayTeam}
          </span>
          <img
            src={match.awayTeamLogo}
            alt={match.awayTeam}
            className="w-10 h-10 rounded-full bg-bg-tertiary p-1"
          />
        </div>
      </div>
    </button>
  );
});
