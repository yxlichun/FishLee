import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Target, BookOpen, FileText, Calendar, ChevronRight, X, Fish, Loader2, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { Goal } from '../types';
import { format, addDays, parseISO } from 'date-fns';

const WEEKS = 26; // 展示 182 天（26 周）
const START_DATE = '2026-03-01'; // 固定起始日期

interface DayData {
  date: string;
  score: number;
  checkInCount: number;
  studyMinutes: number;
  goals: Array<{ id: string; title: string; color: string; count: number }>;
}

function GoalStats({ goal }: { goal: Goal }) {
  const totalTasks = goal.learningPaths.reduce(
    (sum, lp) => sum + lp.phases.reduce(
      (s, ph) => s + ph.sections.reduce((t, sec) => t + sec.tasks.length, 0), 0
    ), 0
  );
  const completedTasks = totalTasks > 0
    ? Object.keys(goal.taskProgress).filter((k) => goal.taskProgress[k]).length
    : 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex items-center gap-4 text-sm text-gray-500">
      <span className="flex items-center gap-1">
        <Calendar size={14} />
        {goal.checkIns.length} 次打卡
      </span>
      <span className="flex items-center gap-1">
        <FileText size={14} />
        {goal.notes.length} 篇笔记
      </span>
      {totalTasks > 0 && (
        <span className="flex items-center gap-1">
          <BookOpen size={14} />
          {progressPercent}% 完成
        </span>
      )}
    </div>
  );
}

function GoalCard({ goal, onClick }: { goal: Goal; onClick: () => void }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    red: 'bg-red-500',
  };
  const bgColor = goal.color ? (colorMap[goal.color] || goal.color) : 'bg-brand-500';

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-left hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 ${bgColor} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
            {goal.icon || <Target size={18} />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-sm text-gray-400 mt-0.5 truncate">{goal.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
          <GoalStats goal={goal} />
          <ChevronRight size={18} className="text-gray-300 group-hover:text-brand-500 transition-colors" />
        </div>
      </div>
    </button>
  );
}

function AddGoalModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (title: string, description: string, color: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');

  const colors = [
    { name: 'blue', label: '蓝', className: 'bg-blue-500' },
    { name: 'green', label: '绿', className: 'bg-green-500' },
    { name: 'purple', label: '紫', className: 'bg-purple-500' },
    { name: 'orange', label: '橙', className: 'bg-orange-500' },
    { name: 'pink', label: '粉', className: 'bg-pink-500' },
    { name: 'red', label: '红', className: 'bg-red-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), description.trim(), color);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">新建目标</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目标名称</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：学习英语、健身计划..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述（可选）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述这个目标..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">主题色</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={`w-8 h-8 rounded-full ${c.className} transition-all ${
                    color === c.name ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">取消</button>
            <button type="submit" disabled={!title.trim()} className="btn-primary disabled:opacity-50">创建</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Goals() {
  const goals = useStore((s) => s.goals);
  const addGoal = useStore((s) => s.addGoal);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [tooltip, setTooltip] = useState<{ day: DayData; x: number; y: number } | null>(null);
  const [showFishPanel, setShowFishPanel] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const AI_URL = import.meta.env.VITE_API_BASE
    ? `${import.meta.env.VITE_API_BASE}/api/ai/summary`
    : '/api/ai/summary';

  const buildPrompt = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const parts: string[] = [];
    parts.push(`今天是 ${today}。`);

    goals.forEach((goal) => {
      parts.push(`\n## 目标：${goal.title}`);
      if (goal.description) parts.push(`描述：${goal.description}`);

      // 今日计划
      const todayPlans = goal.plans.filter((p) => p.date === today);
      if (todayPlans.length > 0) {
        parts.push('今日计划：');
        todayPlans.forEach((p) => parts.push(`- [${p.completed ? '已完成' : '未完成'}] ${p.content}`));
      }

      // 学习进度
      const totalTasks = goal.learningPaths.reduce(
        (sum, lp) => sum + lp.phases.reduce(
          (s, ph) => s + ph.sections.reduce((t, sec) => t + sec.tasks.length, 0), 0
        ), 0
      );
      const completedTasks = totalTasks > 0
        ? Object.keys(goal.taskProgress).filter((k) => goal.taskProgress[k]).length
        : 0;
      if (totalTasks > 0) {
        parts.push(`路径进度：${completedTasks}/${totalTasks} (${Math.round((completedTasks / totalTasks) * 100)}%)`);
      }

      // 最近打卡
      const recentCheckIns = goal.checkIns
        .filter((c) => !isNaN(new Date(c.timestamp).getTime()))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3);
      if (recentCheckIns.length > 0) {
        parts.push('最近打卡：');
        recentCheckIns.forEach((c) => {
          parts.push(`- ${format(new Date(c.timestamp), 'MM-dd')} ${c.duration}分钟: ${c.content.slice(0, 80)}`);
        });
      }

      // 笔记数
      parts.push(`笔记：${goal.notes.length} 篇，资源收藏：${goal.bookmarks.length} 个`);
    });

    parts.push('\n请根据以上信息，给出今日学习总结和建议。包括：完成了什么、还有什么待办、接下来的建议。');
    return parts.join('\n');
  }, [goals]);

  const fetchAiSummary = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    setAiSummary('');
    try {
      const res = await fetch(AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: buildPrompt() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setAiSummary(data.content);
    } catch (err) {
      setAiError((err as Error).message);
    } finally {
      setAiLoading(false);
    }
  }, [AI_URL, buildPrompt]);

  // 颜色映射
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    red: 'bg-red-500',
  };

  // ── 热力图数据计算 ──────────────────────────────────────────
  // 固定从 START_DATE 开始，向后 182 天
  const totalDays = WEEKS * 7;
  const startDate = parseISO(START_DATE);

  // 按日期聚合所有目标的打卡数据
  const dayDataMap = new Map<string, DayData>();
  
  // 初始化所有天数
  for (let i = 0; i < totalDays; i++) {
    const d = format(addDays(startDate, i), 'yyyy-MM-dd');
    dayDataMap.set(d, {
      date: d,
      score: 0,
      checkInCount: 0,
      studyMinutes: 0,
      goals: [],
    });
  }

  // 聚合每个目标的打卡数据
  goals.forEach(goal => {
    const validCheckIns = goal.checkIns.filter(c => !isNaN(new Date(c.timestamp).getTime()));
    validCheckIns.forEach(checkIn => {
      const date = format(new Date(checkIn.timestamp), 'yyyy-MM-dd');
      const dayData = dayDataMap.get(date);
      if (dayData) {
        const existingGoal = dayData.goals.find(g => g.id === goal.id);
        if (existingGoal) {
          existingGoal.count += 1;
        } else {
          dayData.goals.push({
            id: goal.id,
            title: goal.title,
            color: goal.color ? (colorMap[goal.color] || goal.color) : 'bg-brand-500',
            count: 1,
          });
        }
        dayData.checkInCount += 1;
        dayData.studyMinutes += checkIn.duration;
        // 重新计算分数
        dayData.score = Math.min(
          (dayData.checkInCount > 0 ? 1 : 0) +
          Math.min(Math.floor(dayData.studyMinutes / 30), 3),
          4
        );
      }
    });
  });

  // 构建网格：按周列排列，每列7格（周日到周六）
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

  const handleAddGoal = async (title: string, description: string, color: string) => {
    const id = await addGoal({ title, description, color });
    setShowModal(false);
    navigate(`/goals/${id}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero: 热力图背景 + 标题 */}
      <div className="relative overflow-hidden bg-white">
        {/* 热力图层 */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
          <div className="w-full overflow-x-auto opacity-40">
            <div className="relative min-w-[600px] sm:min-w-0">
              <div className="flex gap-0.5">
                {weeks.map((week, colIdx) => (
                  <div key={colIdx} className="flex-1 flex flex-col gap-0.5">
                    {week.map((day, rowIdx) => {
                      if (!day) {
                        return <div key={rowIdx} className="w-full aspect-square rounded-sm" />;
                      }
                      return (
                        <div
                          key={rowIdx}
                          className="w-full aspect-square rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
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
                        >
                          {day.goals.length > 1 ? (
                            <div className="w-full h-full rounded-sm overflow-hidden">
                              {day.goals.length === 2 && (
                                <div className="w-full h-full flex">
                                  {day.goals.map((goal) => (
                                    <div key={goal.id} className={`w-1/2 h-full ${goal.color}`} />
                                  ))}
                                </div>
                              )}
                              {day.goals.length === 3 && (
                                <div className="w-full h-full flex">
                                  {day.goals.map((goal) => (
                                    <div key={goal.id} className={`w-1/3 h-full ${goal.color}`} />
                                  ))}
                                </div>
                              )}
                              {day.goals.length >= 4 && (
                                <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                                  {day.goals.slice(0, 4).map((goal) => (
                                    <div key={goal.id} className={`h-full ${goal.color}`} />
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              className={`w-full h-full rounded-sm ${
                                day.score === 0
                                  ? 'bg-gray-100'
                                  : day.goals.length === 1
                                  ? `${day.goals[0].color} ${day.score <= 1 ? 'opacity-40' : day.score <= 2 ? 'opacity-60' : day.score <= 3 ? 'opacity-80' : ''}`
                                  : day.score <= 1 ? 'bg-brand-400/40' : day.score <= 2 ? 'bg-brand-400/60' : day.score <= 3 ? 'bg-brand-400/80' : 'bg-brand-400'
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 标题叠加 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-700 tracking-tight">
            An<span className="bg-gradient-to-r from-brand-500 to-purple-500 text-transparent bg-clip-text">Kor</span>
          </h1>
          <p className="text-gray-500 mt-3 text-sm sm:text-base tracking-widest uppercase">Plan like a rock, grow like a pro</p>
        </div>

        {/* 底部渐变过渡到 gray-50 */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg border border-gray-700"
            style={{ left: Math.min(tooltip.x, window.innerWidth - 200), top: tooltip.y - 80 }}
          >
            <p className="font-medium mb-1">{tooltip.day.date}</p>
            {tooltip.day.score === 0 ? (
              <p className="text-gray-400">无学习活动</p>
            ) : (
              <>
                <p>打卡 {tooltip.day.checkInCount} 次 · {tooltip.day.studyMinutes} 分钟</p>
                {tooltip.day.goals.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {tooltip.day.goals.map((goal) => (
                      <div key={goal.id} className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${goal.color}`} />
                        <span>{goal.title}: {goal.count} 次</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 目标列表 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-12">
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => navigate(`/goals/${goal.id}/dashboard`)}
            />
          ))}

          <button
            onClick={() => setShowModal(true)}
            className="w-full p-5 rounded-xl text-center border-2 border-dashed border-gray-300 hover:border-brand-400 hover:bg-white transition-all duration-200 group"
          >
            <div className="flex items-center justify-center gap-2 text-gray-400 group-hover:text-brand-600 transition-colors">
              <Plus size={18} />
              <span className="text-sm font-medium">新建目标</span>
            </div>
          </button>
        </div>
      </div>

      {/* 底部留白 */}
      <div className="pb-8" />

      {showModal && (
        <AddGoalModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddGoal}
        />
      )}

      {/* 悬浮鱼形按钮 */}
      <button
        onClick={() => {
          const opening = !showFishPanel;
          setShowFishPanel(opening);
          if (opening && !aiSummary && !aiLoading) fetchAiSummary();
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-300 z-40"
        title="智能助手"
      >
        <Fish size={24} />
      </button>

      {/* AI 总结面板 */}
      {showFishPanel && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Fish size={18} className="text-blue-500" />
              今日学习总结
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={fetchAiSummary}
                disabled={aiLoading}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
                title="重新生成"
              >
                <RefreshCw size={15} className={`text-gray-500 ${aiLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowFishPanel(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={15} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="px-5 py-4 max-h-80 overflow-y-auto">
            {aiLoading && (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 size={20} className="animate-spin mr-2" />
                <span className="text-sm">正在生成总结...</span>
              </div>
            )}

            {aiError && (
              <div className="text-sm">
                <p className="text-red-500 mb-3">生成失败：{aiError}</p>
                <button onClick={fetchAiSummary} className="text-brand-600 hover:text-brand-700 text-sm font-medium">
                  点击重试
                </button>
              </div>
            )}

            {!aiLoading && !aiError && aiSummary && (
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {aiSummary}
              </div>
            )}

            {!aiLoading && !aiError && !aiSummary && (
              <div className="text-center py-8 text-gray-400">
                <Fish size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">点击下方按钮生成今日总结</p>
                <button
                  onClick={fetchAiSummary}
                  className="mt-3 btn-primary text-sm px-4 py-1.5"
                >
                  生成总结
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
