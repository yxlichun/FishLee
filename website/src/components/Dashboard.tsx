import { useState } from 'react';
import { useStore } from '../store';
import { learningPath } from '../data/learningPath';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Calendar, FileText, Flame } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

// 热力图颜色层级（仿 GitHub 绿色调）
const HEATMAP_COLORS = [
  { bg: 'bg-gray-100', label: '无活动' },
  { bg: 'bg-brand-100', label: '少量' },
  { bg: 'bg-brand-300', label: '一般' },
  { bg: 'bg-brand-500', label: '较多' },
  { bg: 'bg-brand-700', label: '很多' },
];

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];
const WEEKS = 26; // 展示过去 26 周

interface DayData {
  date: string;
  score: number;
  checkInCount: number;
  studyMinutes: number;
  completedPlans: number;
  noteCount: number;
}

export default function Dashboard() {
  const { taskProgress, checkIns, notes, plans } = useStore();
  const [tooltip, setTooltip] = useState<{ day: DayData; x: number; y: number } | null>(null);

  // 计算总体进度
  const allTasks = learningPath.flatMap(phase =>
    phase.sections.flatMap(section => section.tasks)
  );
  const completedTasks = allTasks.filter(task => taskProgress[task.id]).length;
  const totalTasks = allTasks.length;
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  // 计算每个阶段的进度
  const phaseProgress = learningPath.map(phase => {
    const phaseTasks = phase.sections.flatMap(s => s.tasks);
    const completed = phaseTasks.filter(t => taskProgress[t.id]).length;
    return {
      name: `第${phase.month}月`,
      完成率: Math.round((completed / phaseTasks.length) * 100),
    };
  });

  // 计算连续打卡天数（过滤掉 timestamp 无效的记录）
  const validCheckIns = checkIns.filter(c => !isNaN(new Date(c.timestamp).getTime()));
  const sortedCheckIns = [...validCheckIns].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 按日期分组打卡记录
  const checkInsByDate = new Map<string, boolean>();
  sortedCheckIns.forEach(checkIn => {
    const date = new Date(checkIn.timestamp);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];
    checkInsByDate.set(dateStr, true);
  });

  // 计算连续天数
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    if (checkInsByDate.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  // 计算总学习时长
  const totalHours = checkIns.reduce((sum, c) => sum + c.duration, 0) / 60;

  // ── 热力图数据计算 ──────────────────────────────────────────
  // 生成过去 WEEKS*7 天的日期网格（从最早到今天）
  const totalDays = WEEKS * 7;
  const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');

  // 按日期聚合打卡数据
  const checkInMap = new Map<string, { count: number; minutes: number }>();
  validCheckIns.forEach(c => {
    const d = format(new Date(c.timestamp), 'yyyy-MM-dd');
    const prev = checkInMap.get(d) ?? { count: 0, minutes: 0 };
    checkInMap.set(d, { count: prev.count + 1, minutes: prev.minutes + c.duration });
  });

  // 按日期聚合笔记数据
  const noteMap = new Map<string, number>();
  notes.forEach(n => {
    const d = format(new Date(n.createdAt), 'yyyy-MM-dd');
    noteMap.set(d, (noteMap.get(d) ?? 0) + 1);
  });

  // 按日期聚合计划完成数据
  const planMap = new Map<string, number>();
  plans.filter(p => p.completed).forEach(p => {
    planMap.set(p.date, (planMap.get(p.date) ?? 0) + 1);
  });

  // 构建每天的 DayData
  const dayDataMap = new Map<string, DayData>();
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const ci = checkInMap.get(d) ?? { count: 0, minutes: 0 };
    const noteCount = noteMap.get(d) ?? 0;
    const completedPlans = planMap.get(d) ?? 0;

    // 积分计算：打卡+1，每30分钟+1(上限3)，完成计划+1/个，写笔记+1/篇(上限2)
    const score = Math.min(
      (ci.count > 0 ? 1 : 0) +
      Math.min(Math.floor(ci.minutes / 30), 3) +
      completedPlans +
      Math.min(noteCount, 2),
      8
    );

    dayDataMap.set(d, {
      date: d,
      score,
      checkInCount: ci.count,
      studyMinutes: ci.minutes,
      completedPlans,
      noteCount,
    });
  }

  // 构建网格：按周列排列，每列7格（周日到周六）
  // 找到网格起始日（往前推到最近的周日）
  const gridStart = subDays(new Date(), totalDays - 1);
  const startWeekDay = gridStart.getDay(); // 0=日
  // 在开头补齐空格使第一列从周日开始
  const paddingDays = startWeekDay;
  const cells: (DayData | null)[] = [
    ...Array(paddingDays).fill(null),
    ...Array.from({ length: totalDays }, (_, i) =>
      dayDataMap.get(format(subDays(new Date(), totalDays - 1 - i), 'yyyy-MM-dd')) ?? null
    ),
  ];

  // 按周切割
  const weeks: (DayData | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  // 找到每个月第一次出现的周列索引，用于月份标签
  const monthLabels: { label: string; col: number }[] = [];
  weeks.forEach((week, colIdx) => {
    const firstDay = week.find(d => d !== null);
    if (firstDay) {
      const date = new Date(firstDay.date);
      if (date.getDate() <= 7) {
        const label = format(date, 'M月');
        if (!monthLabels.length || monthLabels[monthLabels.length - 1].label !== label) {
          monthLabels.push({ label, col: colIdx });
        }
      }
    }
  });

  const getColorClass = (score: number) => {
    if (score === 0) return HEATMAP_COLORS[0].bg;
    if (score <= 1) return HEATMAP_COLORS[1].bg;
    if (score <= 3) return HEATMAP_COLORS[2].bg;
    if (score <= 5) return HEATMAP_COLORS[3].bg;
    return HEATMAP_COLORS[4].bg;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">学习仪表盘</h1>
        <p className="text-gray-500 mt-2">追踪你的学习进度和成就</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总体进度</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{overallProgress}%</p>
              <p className="text-sm text-gray-500 mt-1">{completedTasks}/{totalTasks} 任务</p>
            </div>
            <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="text-brand-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">连续打卡</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{streak}</p>
              <p className="text-sm text-gray-500 mt-1">天</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总打卡次数</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{checkIns.length}</p>
              <p className="text-sm text-gray-500 mt-1">次</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">学习笔记</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{notes.length}</p>
              <p className="text-sm text-gray-500 mt-1">{totalHours.toFixed(1)}小时</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 学习热力图 */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">学习热力图</h2>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>少</span>
            {HEATMAP_COLORS.map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c.bg}`} />
            ))}
            <span>多</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="relative inline-block" style={{ minWidth: 'max-content' }}>
            {/* 月份标签 */}
            <div className="flex mb-1 ml-8">
              {weeks.map((_, colIdx) => {
                const monthLabel = monthLabels.find(m => m.col === colIdx);
                return (
                  <div key={colIdx} className="w-4 mr-0.5 flex-shrink-0">
                    {monthLabel && (
                      <span className="text-xs text-gray-400 whitespace-nowrap">{monthLabel.label}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-0.5">
              {/* 星期标签 */}
              <div className="flex flex-col gap-0.5 mr-1 flex-shrink-0">
                {WEEKDAY_LABELS.map((label, i) => (
                  <div key={i} className="w-6 h-4 flex items-center justify-end">
                    {(i === 1 || i === 3 || i === 5) && (
                      <span className="text-xs text-gray-400">{label}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* 格子 */}
              {weeks.map((week, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-0.5">
                  {week.map((day, rowIdx) => {
                    if (!day) {
                      return <div key={rowIdx} className="w-4 h-4 rounded-sm" />;
                    }
                    return (
                      <div
                        key={rowIdx}
                        className={`w-4 h-4 rounded-sm cursor-pointer transition-opacity hover:opacity-75 ${getColorClass(day.score)} ${day.date === todayStr ? 'ring-2 ring-brand-500 ring-offset-1' : ''}`}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({ day, x: rect.left, y: rect.top });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg"
            style={{ left: tooltip.x, top: tooltip.y - 80 }}
          >
            <p className="font-medium mb-1">{tooltip.day.date}</p>
            {tooltip.day.score === 0 ? (
              <p className="text-gray-400">无学习活动</p>
            ) : (
              <>
                {tooltip.day.checkInCount > 0 && <p>打卡 {tooltip.day.checkInCount} 次 · {tooltip.day.studyMinutes} 分钟</p>}
                {tooltip.day.completedPlans > 0 && <p>完成计划 {tooltip.day.completedPlans} 项</p>}
                {tooltip.day.noteCount > 0 && <p>写笔记 {tooltip.day.noteCount} 篇</p>}
              </>
            )}
          </div>
        )}
      </div>

      {/* 各阶段进度图表 */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">各阶段完成情况</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={phaseProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="完成率" fill="#5c7cfa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 最近打卡 */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">最近打卡记录</h2>
        {sortedCheckIns.length === 0 ? (
          <p className="text-gray-500 text-center py-8">还没有打卡记录，开始你的学习之旅吧！</p>
        ) : (
          <div className="space-y-3">
            {sortedCheckIns.slice(0, 5).map((checkIn) => (
              <div key={checkIn.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-20 text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(checkIn.timestamp), 'MM-dd')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(checkIn.timestamp), 'HH:mm')}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{checkIn.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{checkIn.duration}分钟 · 第{checkIn.phaseId}阶段</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
