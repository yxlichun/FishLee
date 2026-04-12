import { useState } from 'react';
import { useStore, useGoalData } from '../store';
import { format, addDays } from 'date-fns';
import { Plus, Trash2, Check, ChevronDown, ChevronUp, CalendarDays, Pencil, X, CalendarClock } from 'lucide-react';
import { Plan } from '../types';

function getQuickDates() {
  const today = new Date();
  return Array.from({ length: 8 }, (_, i) => {
    const d = addDays(today, i);
    const val = format(d, 'yyyy-MM-dd');
    const label = i === 0 ? '今天' : i === 1 ? '明天' : `+${i}天`;
    return { val, label };
  });
}

function groupByDate(plans: Plan[]): Record<string, Plan[]> {
  return plans.reduce<Record<string, Plan[]>>((acc, p) => {
    if (!acc[p.date]) acc[p.date] = [];
    acc[p.date].push(p);
    return acc;
  }, {});
}

export default function Plans() {
  const plans = useGoalData((g) => g.plans) ?? [];
  const { addPlan, updatePlan, deletePlan, togglePlan } = useStore();

  const [newContent, setNewContent]   = useState('');
  const [newDate, setNewDate]         = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [adding, setAdding]           = useState(false);
  const [collapsed, setCollapsed]     = useState<Record<string, boolean>>({});
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [reschedulingDate, setReschedulingDate] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(format(new Date(), 'yyyy-MM-dd'));

  const today      = format(new Date(), 'yyyy-MM-dd');
  const quickDates = getQuickDates();

  const sorted  = [...plans].sort((a, b) => b.date.localeCompare(a.date));
  const grouped = groupByDate(sorted);
  const dates   = Object.keys(grouped).sort().reverse();

  const total      = plans.length;
  const completed  = plans.filter((p) => p.completed).length;
  const todayCount = plans.filter((p) => p.date === today).length;

  const handleAdd = async () => {
    if (!newContent.trim()) return;
    await addPlan({ date: newDate, content: newContent.trim() });
    setNewContent('');
    setAdding(false);
  };

  const handleStartEdit = (p: Plan) => {
    setEditingId(p.id);
    setEditContent(p.content);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim()) return;
    await updatePlan(id, { content: editContent.trim() });
    setEditingId(null);
  };

  const toggleCollapse = (date: string) =>
    setCollapsed((prev) => ({ ...prev, [date]: !prev[date] }));

  const handleReschedule = async (fromDate: string) => {
    if (!rescheduleTarget || rescheduleTarget <= fromDate) return;
    const unfinished = grouped[fromDate]?.filter((p) => !p.completed) ?? [];
    await Promise.all(unfinished.map((p) => updatePlan(p.id, { date: rescheduleTarget })));
    setReschedulingDate(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Todo List</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">为任意日期添加任务，打卡时关联确认</p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="btn-primary flex items-center justify-center gap-2 py-2.5 sm:py-2"
          >
            <Plus size={20} />
            新增任务
          </button>
        )}
      </div>

      {total > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="card p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-500">全部任务</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{total}</p>
          </div>
          <div className="card p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-500">已完成</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{completed}</p>
          </div>
          <div className="card p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-500">今日任务</p>
            <p className="text-2xl sm:text-3xl font-bold text-brand-600 mt-1">{todayCount}</p>
          </div>
        </div>
      )}

      {adding && (
        <div className="card p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <CalendarDays size={20} className="text-brand-600" />
              新增任务
            </h2>
            <button
              onClick={() => { setAdding(false); setNewContent(''); }}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">选择日期</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {quickDates.map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setNewDate(val)}
                  className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors ${
                    newDate === val
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-gray-300 text-gray-600 hover:border-brand-400 hover:text-brand-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="date"
              value={newDate}
              min={today}
              onChange={(e) => setNewDate(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">计划内容</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="计划学什么？写具体一点，打卡时更容易核对~"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd();
              }}
            />
            <p className="text-xs text-gray-400 mt-1">Ctrl/⌘ + Enter 快速保存</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleAdd} className="btn-primary flex-1 py-2.5 sm:py-3">
              保存任务
            </button>
            <button
              onClick={() => { setAdding(false); setNewContent(''); }}
              className="btn-secondary py-2.5 sm:py-3"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {dates.length === 0 ? (
        <div className="card text-center py-12 sm:py-16 text-gray-400">
          <CalendarDays size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-base sm:text-lg font-medium">还没有任务</p>
          <p className="text-sm mt-1">点击「新增任务」开始安排学习</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {dates.map((date) => {
            const group       = grouped[date];
            const isToday     = date === today;
            const isPast      = date < today;
            const doneAll     = group.every((p) => p.completed);
            const doneCount   = group.filter((p) => p.completed).length;
            const isCollapsed = collapsed[date];
            const hasUnfinished = group.some((p) => !p.completed);

            return (
              <div key={date} className="card !p-0 overflow-hidden">

                <div
                  className={`w-full flex flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 transition-colors gap-2 ${
                    isToday ? 'bg-brand-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <button
                    className="flex items-center gap-2 sm:gap-3 flex-1 text-left whitespace-nowrap overflow-hidden"
                    onClick={() => toggleCollapse(date)}
                  >
                    <CalendarDays
                      size={18}
                      className={isToday ? 'text-brand-600' : isPast ? 'text-gray-400' : 'text-gray-500'}
                    />
                    <span className={`font-semibold text-sm sm:text-base ${isToday ? 'text-brand-700' : 'text-gray-900'}`}>
                      {date}
                    </span>
                    {isToday && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-medium">
                        今天
                      </span>
                    )}
                    {isPast && !isToday && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        已过期
                      </span>
                    )}
                    <span className="text-xs sm:text-sm text-gray-500 truncate">
                      {doneCount}/{group.length} 完成
                    </span>
                    {doneAll && (
                      <span className="text-xs sm:text-sm text-green-600 font-medium">✅ 完成</span>
                    )}
                  </button>

                  <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                    {isPast && !isToday && hasUnfinished && (
                      <button
                        onClick={() => {
                          setReschedulingDate(reschedulingDate === date ? null : date);
                          setRescheduleTarget(format(new Date(), 'yyyy-MM-dd'));
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors whitespace-nowrap"
                        title="将未完成计划延期到新日期"
                      >
                        <CalendarClock size={14} />
                        延期
                      </button>
                    )}
                    <button onClick={() => toggleCollapse(date)} className="p-1 flex-shrink-0">
                      {isCollapsed
                        ? <ChevronDown size={16} className="text-gray-400" />
                        : <ChevronUp   size={16} className="text-gray-400" />
                      }
                    </button>
                  </div>
                </div>

                {reschedulingDate === date && (
                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-orange-50 border-t border-orange-100">
                    <p className="text-sm font-medium text-orange-800 mb-3">
                      将 {group.filter(p => !p.completed).length} 项未完成计划移至：
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Array.from({ length: 7 }, (_, i) => {
                        const d = addDays(new Date(), i);
                        const val = format(d, 'yyyy-MM-dd');
                        const label = i === 0 ? '今天' : i === 1 ? '明天' : `+${i}天`;
                        return (
                          <button
                            key={val}
                            onClick={() => setRescheduleTarget(val)}
                            className={`px-2 sm:px-3 py-1 text-xs rounded-lg border transition-colors ${
                              rescheduleTarget === val
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'border-orange-300 text-orange-700 hover:bg-orange-100'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <input
                        type="date"
                        value={rescheduleTarget}
                        min={today}
                        onChange={(e) => setRescheduleTarget(e.target.value)}
                        className="px-3 py-1.5 border border-orange-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleReschedule(date)}
                        className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
                      >
                        确认延期
                      </button>
                      <button
                        onClick={() => setReschedulingDate(null)}
                        className="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-sm"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                {!isCollapsed && (
                  <div className="divide-y divide-gray-100 border-t border-gray-100">
                    {group.map((plan) => (
                      <div
                        key={plan.id}
                        className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 ${
                          plan.completed ? 'bg-green-50' : 'bg-white'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <button
                            onClick={() => togglePlan(plan.id)}
                            className={`w-4 h-4 !min-h-0 rounded-sm border-2 flex items-center justify-center transition-colors ${
                              plan.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                          >
                            {plan.completed && <Check size={12} className="text-white" />}
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          {editingId === plan.id ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex sm:flex-col gap-1.5">
                                <button
                                  onClick={() => handleSaveEdit(plan.id)}
                                  className="p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className={`text-sm leading-relaxed break-words ${
                              plan.completed ? 'line-through text-gray-400' : 'text-gray-800'
                            }`}>
                              {plan.content}
                            </p>
                          )}
                        </div>

                        {editingId !== plan.id && (
                          <div className="flex-shrink-0 flex gap-1">
                            <button
                              onClick={() => handleStartEdit(plan)}
                              className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                              title="编辑"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => deletePlan(plan.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
