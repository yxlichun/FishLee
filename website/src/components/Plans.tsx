import { useState } from 'react';
import { useStore } from '../store';
import { format, addDays } from 'date-fns';
import { Plus, Trash2, Check, ChevronDown, ChevronUp, CalendarDays, Pencil, X } from 'lucide-react';
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
  const { plans, addPlan, updatePlan, deletePlan, togglePlan } = useStore();

  const [newContent, setNewContent]   = useState('');
  const [newDate, setNewDate]         = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [adding, setAdding]           = useState(false);
  const [collapsed, setCollapsed]     = useState<Record<string, boolean>>({});
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const today      = format(new Date(), 'yyyy-MM-dd');
  const quickDates = getQuickDates();

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

  const sorted  = [...plans].sort((a, b) => b.date.localeCompare(a.date));
  const grouped = groupByDate(sorted);
  const dates   = Object.keys(grouped).sort().reverse();

  const total      = plans.length;
  const completed  = plans.filter((p) => p.completed).length;
  const todayCount = plans.filter((p) => p.date === today).length;

  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* ── 页头 ── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">学习计划</h1>
          <p className="text-gray-500 mt-2">为任意日期制定计划，打卡时关联确认</p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            新增计划
          </button>
        )}
      </div>

      {/* ── 统计卡片 ── */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="card">
            <p className="text-sm text-gray-500">全部计划</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">已完成</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{completed}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">今日计划</p>
            <p className="text-3xl font-bold text-brand-600 mt-1">{todayCount}</p>
          </div>
        </div>
      )}

      {/* ── 新增表单 ── */}
      {adding && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <CalendarDays size={20} className="text-brand-600" />
              新增学习计划
            </h2>
            <button
              onClick={() => { setAdding(false); setNewContent(''); }}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* 日期选择 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">选择日期</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {quickDates.map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setNewDate(val)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
            />
          </div>

          {/* 计划内容 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">计划内容</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="计划学什么？写具体一点，打卡时更容易核对~"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd();
              }}
            />
            <p className="text-xs text-gray-400 mt-1">Ctrl/⌘ + Enter 快速保存</p>
          </div>

          <div className="flex gap-3">
            <button onClick={handleAdd} className="btn-primary flex-1">
              保存计划
            </button>
            <button
              onClick={() => { setAdding(false); setNewContent(''); }}
              className="btn-secondary"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* ── 计划列表 ── */}
      {dates.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <CalendarDays size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">还没有计划</p>
          <p className="text-sm mt-1">点击「新增计划」开始安排学习</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map((date) => {
            const group       = grouped[date];
            const isToday     = date === today;
            const isPast      = date < today;
            const doneAll     = group.every((p) => p.completed);
            const doneCount   = group.filter((p) => p.completed).length;
            const isCollapsed = collapsed[date];

            return (
              <div key={date} className="card !p-0 overflow-hidden">

                {/* 日期标题行 */}
                <button
                  className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
                    isToday ? 'bg-brand-50 hover:bg-brand-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleCollapse(date)}
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays
                      size={18}
                      className={isToday ? 'text-brand-600' : isPast ? 'text-gray-400' : 'text-gray-500'}
                    />
                    <span className={`font-semibold ${isToday ? 'text-brand-700' : 'text-gray-900'}`}>
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
                    <span className="text-sm text-gray-500">
                      {doneCount}/{group.length} 完成
                    </span>
                    {doneAll && (
                      <span className="text-sm text-green-600 font-medium">✅ 全部完成</span>
                    )}
                  </div>
                  {isCollapsed
                    ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                    : <ChevronUp   size={16} className="text-gray-400 flex-shrink-0" />
                  }
                </button>

                {/* 计划条目 */}
                {!isCollapsed && (
                  <div className="divide-y divide-gray-100 border-t border-gray-100">
                    {group.map((plan) => (
                      <div
                        key={plan.id}
                        className={`flex items-start gap-4 px-6 py-4 ${
                          plan.completed ? 'bg-green-50' : 'bg-white'
                        }`}
                      >
                        {/* 勾选框 */}
                        <button
                          onClick={() => togglePlan(plan.id)}
                          className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors ${
                            plan.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {plan.completed && <Check size={12} className="text-white" />}
                        </button>

                        {/* 内容 */}
                        <div className="flex-1 min-w-0">
                          {editingId === plan.id ? (
                            <div className="flex gap-2">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex flex-col gap-1.5">
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
                            <p className={`text-sm leading-relaxed ${
                              plan.completed ? 'line-through text-gray-400' : 'text-gray-800'
                            }`}>
                              {plan.content}
                            </p>
                          )}
                        </div>

                        {/* 操作按钮 */}
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
