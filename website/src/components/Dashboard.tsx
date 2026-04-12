import { useState } from 'react';
import { useGoalData, useActiveGoal } from '../store';
import { CheckCircle2, Calendar, FileText, Flame } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';

// 直接导入 recharts，通过代码分割优化
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 热力图颜色层级（仿 GitHub 绿色调）
const HEATMAP_COLORS = [
  { bg: 'bg-gray-100', label: '无活动' },
  { bg: 'bg-brand-100', label: '少量' },
  { bg: 'bg-brand-300', label: '一般' },
  { bg: 'bg-brand-500', label: '较多' },
  { bg: 'bg-brand-700', label: '很多' },
];

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];
const WEEKS = 26; // 展示 182 天（26 周）
const START_DATE = '2026-03-01'; // 固定起始日期

interface DayData {
  date: string;
  score: number;
  checkInCount: number;
  studyMinutes: number;
  completedPlans: number;
  noteCount: number;
}

export default function Dashboard() {
  const taskProgress = useGoalData((g) => g.taskProgress) ?? {};
  const checkIns = useGoalData((g) => g.checkIns) ?? [];
  const notes = useGoalData((g) => g.notes) ?? [];
  const plans = useGoalData((g) => g.plans) ?? [];
  const learningPaths = useGoalData((g) => g.learningPaths) ?? [];
  const activePathId = useGoalData((g) => g.activePathId) ?? null;
  const [tooltip, setTooltip] = useState<{ day: DayData; x: number; y: number } | null>(null);
  const activeGoal = useActiveGoal();

  // 颜色映射
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    red: 'bg-red-500',
  };
  
  // 获取当前目标的颜色
  const goalColor = activeGoal?.color ? (colorMap[activeGoal.color] || activeGoal.color) : 'bg-brand-500';

  // 当前激活路径
  const activePath = learningPaths.find((p) => p.id === activePathId) ?? learningPaths[0];
  const activePhases = activePath?.phases ?? [];

  // 计算总体进度
  const allTasks = activePhases.flatMap(phase =>
    phase.sections.flatMap(section => section.tasks)
  );
  const completedTasks = allTasks.filter(task => taskProgress[task.id]).length;
  const totalTasks = allTasks.length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 计算每个阶段的进度
  const phaseProgress = activePhases.map(phase => {
    const phaseTasks = phase.sections.flatMap(s => s.tasks);
    const completed = phaseTasks.filter(t => taskProgress[t.id]).length;
    return {
      name: `第${phase.month}月`,
      完成率: phaseTasks.length > 0 ? Math.round((completed / phaseTasks.length) * 100) : 0,
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
    const dateStr = format(date, 'yyyy-MM-dd');
    checkInsByDate.set(dateStr, true);
  });

  // 计算连续天数：今天未打卡时从昨天开始计（保留昨日连续记录直到今天结束）
  const todayStr = format(today, 'yyyy-MM-dd');
  const startOffset = checkInsByDate.has(todayStr) ? 0 : 1;
  for (let i = startOffset; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    if (checkInsByDate.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  // 计算总任务时长
  const totalHours = checkIns.reduce((sum, c) => sum + c.duration, 0) / 60;

  // ── 热力图数据计算 ──────────────────────────────────────────
  // 固定从 START_DATE 开始，向后 182 天
  const totalDays = WEEKS * 7;
  const startDate = parseISO(START_DATE);

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
  for (let i = 0; i < totalDays; i++) {
    const d = format(addDays(startDate, i), 'yyyy-MM-dd');
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
  // 找到起始日的星期，补齐开头空格使第一列从周日开始
  const startWeekDay = startDate.getDay(); // 0=日
  const paddingDays = startWeekDay;
  const cells: (DayData | null)[] = [
    ...Array(paddingDays).fill(null),
    ...Array.from({ length: totalDays }, (_, i) =>
      dayDataMap.get(format(addDays(startDate, i), 'yyyy-MM-dd')) ?? null
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

  // 获取热力图颜色 - 使用目标颜色
  const getColorClass = (score: number) => {
    if (score === 0) return HEATMAP_COLORS[0].bg;
    if (score <= 1) return goalColor + ' bg-opacity-30';
    if (score <= 3) return goalColor + ' bg-opacity-50';
    if (score <= 5) return goalColor + ' bg-opacity-70';
    return goalColor;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">任务仪表盘</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">追踪你的任务进度和成就</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">总体进度</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{overallProgress}%</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{completedTasks}/{totalTasks} 任务</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="text-brand-600" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">连续打卡</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{streak}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">天</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Flame className="text-orange-600" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">总打卡次数</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{checkIns.length}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">次</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">学习笔记</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{notes.length}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{totalHours.toFixed(1)}小时</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="text-purple-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 打卡热力图 */}
      <div className="card p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">打卡热力图</h2>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>少</span>
            {HEATMAP_COLORS.map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c.bg}`} />
            ))}
            <span>多</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="relative min-w-[600px] sm:min-w-0">
            {/* 月份标签 */}
            <div className="flex mb-1 ml-8">
              {weeks.map((_, colIdx) => {
                const monthLabel = monthLabels.find(m => m.col === colIdx);
                return (
                  <div key={colIdx} className="flex-1 min-w-0">
                    {monthLabel && (
                      <span className="text-xs text-gray-400 whitespace-nowrap">{monthLabel.label}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-0.5">
              {/* 星期标签 */}
              <div className="flex flex-col gap-0.5 mr-1 flex-shrink-0 w-7">
                {WEEKDAY_LABELS.map((label, i) => (
                  <div key={i} className="flex-1 flex items-center justify-end">
                    <span className="text-xs text-gray-400 leading-none">{label}</span>
                  </div>
                ))}
              </div>

              {/* 格子 */}
              {weeks.map((week, colIdx) => (
                <div key={colIdx} className="flex-1 flex flex-col gap-0.5">
                  {week.map((day, rowIdx) => {
                    if (!day) {
                      return <div key={rowIdx} className="w-full aspect-square rounded-sm" />;
                    }
                    return (
                      <div
                        key={rowIdx}
                        className={`w-full aspect-square rounded-sm cursor-pointer transition-opacity hover:opacity-75 ${getColorClass(day.score)} ${day.date === todayStr ? 'ring-2 ring-brand-500 ring-offset-1' : ''}`}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({ day, x: rect.left, y: rect.top });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onTouchStart={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({ day, x: rect.left, y: rect.top });
                        }}
                        onTouchEnd={() => setTimeout(() => setTooltip(null), 2000)}
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
            style={{ left: Math.min(tooltip.x, window.innerWidth - 200), top: tooltip.y - 80 }}
          >
            <p className="font-medium mb-1">{tooltip.day.date}</p>
            {tooltip.day.score === 0 ? (
              <p className="text-gray-400">无任务活动</p>
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
      <div className="card p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">各阶段完成情况</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={phaseProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="完成率" fill="#5c7cfa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 最近打卡 */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">最近打卡记录</h2>
        {sortedCheckIns.length === 0 ? (
          <p className="text-gray-500 text-center py-8">还没有打卡记录，开始你的任务之旅吧！</p>
        ) : (
          <div className="space-y-3">
            {sortedCheckIns.slice(0, 5).map((checkIn) => (
              <div key={checkIn.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-16 sm:w-20 text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(checkIn.timestamp), 'MM-dd')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(checkIn.timestamp), 'HH:mm')}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 break-words">{checkIn.content}</p>
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
