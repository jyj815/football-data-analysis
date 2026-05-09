# 足球数据分析模型 - 技术架构文档

## 1. 技术架构设计

```
┌─────────────────────────────────────────────────────────┐
│                      移动端视图层                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │比赛列表  │  │凯利分析 │  │赔率趋势 │  │支持率图  │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │
└───────┼───────────┼───────────┼─────────────┼──────────┘
        │           │           │             │
┌───────┴───────────┴───────────┴─────────────┴──────────┐
│                      React 组件层                         │
│  ┌──────────────────────────────────────────────────┐    │
│  │  MatchCard | KellyChart | OddsTrend | SupportRate │   │
│  └──────────────────────────────────────────────────┘    │
└───────────────────────────┬──────────────────────────────┘
                            │
┌───────────────────────────┴──────────────────────────────┐
│                      业务逻辑层 (Hooks)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │useMatchData  │  │useKellyCalc  │  │useOddsHistory│    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└───────────────────────────┬──────────────────────────────┘
                            │
┌───────────────────────────┴──────────────────────────────┐
│                      数据层                               │
│  ┌──────────────────────────────────────────────────┐    │
│  │         Mock Data + 数据计算工具函数              │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 2. 技术选型

### 2.1 核心框架
- **React 18**: 组件化开发，虚拟DOM优化
- **Vite**: 快速开发服务器和构建工具
- **TypeScript**: 类型安全，提高代码质量

### 2.2 样式方案
- **Tailwind CSS**: 原子化CSS，快速构建UI
- **CSS Variables**: 主题色彩管理
- **PostCSS**: CSS后处理

### 2.3 图表库
- **Recharts**: React-native图表库，轻量且易用
- **纯CSS动画**: 减少依赖，提升性能

### 2.4 状态管理
- **React Context**: 轻量级全局状态
- **useState/useReducer**: 组件局部状态

### 2.5 工具库
- **dayjs**: 日期时间处理
- **clsx**: 条件类名合并

---

## 3. 目录结构

```
/workspace/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/                 # 静态资源
│   │   └── logo.svg
│   ├── components/             # React组件
│   │   ├── MatchCard.tsx       # 比赛卡片
│   │   ├── KellyChart.tsx      # 凯利值图表
│   │   ├── OddsTrend.tsx       # 赔率趋势图
│   │   ├── SupportRate.tsx     # 支持率图表
│   │   ├── TabNav.tsx          # 导航Tab
│   │   └── Header.tsx          # 顶部导航
│   ├── hooks/                  # 自定义Hooks
│   │   ├── useMatchData.ts     # 比赛数据
│   │   ├── useKellyCalc.ts     # 凯利计算
│   │   └── useOddsHistory.ts   # 赔率历史
│   ├── data/                   # 模拟数据
│   │   └── mockData.ts
│   ├── utils/                  # 工具函数
│   │   └── calculations.ts      # 计算公式
│   ├── types/                  # TypeScript类型
│   │   └── index.ts
│   ├── App.tsx                 # 主应用
│   ├── main.tsx               # 入口文件
│   └── index.css              # 全局样式
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── postcss.config.js
```

---

## 4. 数据模型

### 4.1 比赛数据结构
```typescript
interface Match {
  id: string;
  homeTeam: string;          // 主队名称
  awayTeam: string;          // 客队名称
  homeTeamLogo: string;      // 主队Logo
  awayTeamLogo: string;      // 客队Logo
  matchTime: string;          // 比赛时间
  status: 'upcoming' | 'live' | 'finished';
  league: string;            // 联赛名称
  score?: { home: number; away: number }; // 比分
}
```

### 4.2 赔率数据结构
```typescript
interface OddsData {
  matchId: string;
  company: string;
  initial: { home: number; draw: number; away: number };  // 初始赔率
  current: { home: number; draw: number; away: number };  // 即时赔率
  history: OddsPoint[];     // 赔率历史
}

interface OddsPoint {
  time: string;
  home: number;
  draw: number;
  away: number;
}
```

### 4.3 支持率数据结构
```typescript
interface SupportRate {
  matchId: string;
  home: number;             // 主队支持率 %
  draw: number;             // 平局支持率 %
  away: number;             // 客队支持率 %
  history: SupportPoint[];  // 历史变化
  totalBets: number;        // 总投注数
}

interface SupportPoint {
  time: string;
  home: number;
  draw: number;
  away: number;
}
```

### 4.4 凯利值数据结构
```typescript
interface KellyValue {
  matchId: string;
  home: {
    kelly: number;          // 凯利指数
    probability: number;    // 理论概率
    supportRate: number;    // 支持率
    odds: number;           // 赔率
  };
  draw: {
    kelly: number;
    probability: number;
    supportRate: number;
    odds: number;
  };
  away: {
    kelly: number;
    probability: number;
    supportRate: number;
    odds: number;
  };
  history: KellyPoint[];
}

interface KellyPoint {
  time: string;
  homeKelly: number;
  drawKelly: number;
  awayKelly: number;
}
```

---

## 5. 核心计算公式

### 5.1 凯利指数计算
```typescript
// 凯利指数 = (赔率 × 支持率) / 理论概率
// 理论概率 = (1 / 赔率) × 100

function calculateKelly(odds: number, supportRate: number): number {
  const probability = (1 / odds) * 100;
  return (odds * supportRate) / probability;
}

// 价值投注判断: 凯利指数 > 1 表示有价值的投注
function isValueBet(kellyIndex: number): boolean {
  return kellyIndex > 1;
}
```

### 5.2 赔率变化计算
```typescript
// 赔率变化率 = (当前赔率 - 初始赔率) / 初始赔率 × 100

function calculateChangeRate(current: number, initial: number): number {
  return ((current - initial) / initial) * 100;
}
```

### 5.3 返还率计算
```typescript
// 返还率 = 1 / (1/主 + 1/平 + 1/客) × 100

function calculateReturnRate(home: number, draw: number, away: number): number {
  return 1 / (1/home + 1/draw + 1/away) * 100;
}
```

---

## 6. 组件设计

### 6.1 MatchCard 比赛卡片
- 显示：主队 vs 客队、比赛时间、比分（如果有）
- 状态：未开始（灰色）、进行中（绿色脉冲）、已结束（白色）
- 交互：点击进入详情

### 6.2 KellyChart 凯利值图表
- 类型：面积图 + 折线图
- X轴：时间
- Y轴：凯利指数（0.5 - 1.5区间高亮）
- 交互：hover显示tooltip，阈值线（1.0）

### 6.3 OddsTrend 赔率趋势图
- 类型：多折线图
- 三条线：主胜(绿)、平局(黄)、客胜(红)
- 交互：点击切换显示/隐藏

### 6.4 SupportRate 支持率分布
- 类型：环形图 + 柱状图
- 显示：支持率百分比、大单标注
- 交互：点击查看详细数据

### 6.5 TabNav 导航标签
- Tab项：凯利值 | 赔率 | 支持率
- 下划线滑动动画
- 点击切换内容

---

## 7. API 接口设计（预留）

### 7.1 获取比赛列表
```
GET /api/matches
Response: { matches: Match[] }
```

### 7.2 获取比赛详情
```
GET /api/matches/:id
Response: {
  match: Match,
  odds: OddsData,
  support: SupportRate,
  kelly: KellyValue
}
```

### 7.3 获取赔率历史
```
GET /api/odds-history/:matchId
Response: { history: OddsPoint[] }
```

---

## 8. 移动端适配策略

### 8.1 视口设置
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### 8.2 触摸优化
- 按钮最小高度：44px
- 触摸反馈：active状态
- 防误触：300ms延迟

### 8.3 图表响应式
- 图表容器宽度：100%
- 字体大小随屏幕缩放
- 图表自适应容器

---

## 9. 性能优化

### 9.1 代码分割
- React.lazy 懒加载页面
- 图表组件按需加载

### 9.2 渲染优化
- useMemo缓存计算结果
- useCallback优化回调
- React.memo减少重渲染

### 9.3 图表优化
- 限制数据点数量（最多50个）
- 使用requestAnimationFrame
- CSS动画替代JS动画
