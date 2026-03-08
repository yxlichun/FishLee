import { useState } from 'react';
import { useStore } from '../store';
import { format, addDays } from 'date-fns';
import { Plus, Trash2, Check, ChevronDown, ChevronUp, CalendarDays, Pencil, X } from 'lucide-react';
import { Plan } from '../types';

// 生成快捷日期选项：今天 ~ 今天+7
function getQuickDates() {
  const today = new Date();
  return Array.from({ length: 8 }, (_, i) => {
    const d = addDays(today, i);
    const val = format(d, 'yyyy-MM-dd');
    const label = i === 0 ? `今天 (${val})` : i === 1 ? `明天 (${val})` : `${i}天后 (${val})`;
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

  const [newContent, setNewContent] = useState('');
  const [newDate, setNewDate]       = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [adding, setAdding]         = useState(false);
  const [collapsed, setCollapsed]   = useState<Record<string, boolean>>({});
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');
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

  // 按日期排序（升序）
  const sorted = [...plans].sort((a, b) => a.date.localeCompare(b.date));
  const grouped = groupByDate(sorted);
  const dates = Object.keys(grouped).sort();

  // 统计
  const total     = plans.length;
  const completed = plans.filter((p) => p.completed).length;
  const todayPlans = plans.filter((p) => p.date === today);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* 页头 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">学习计划</h1>
          <p className="text-gray-500 mt-1">
            为任意日期制定计划，打卡时关联确认
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          新增计划
        </button>
      </div>

      {/* 统计条 */}
      {total > 0 && (
        <div className="flex gap-4 mb-6">
          <div className="card flex-1 text-center py-3">
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-gray-500 mt-0.5">全部计划</p>
          </div>
          <div className="card flex-1 text-center py-3">
            <p className="text-2xl font-bold text-green-600">{completed}</p>
            <p className="text-xs text-gray-500 mt-0.5">已完成</p>
          </div>
          <div className="card flex-1 text-center py-3">
            <p className="text-2xl font-bold text-brand-600">{todayPlans.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">今日计划</p>
          </div>
        </div>
      )}

      {/* 新增表单 */}
      {adding && (
        <div className="card mb-6 border-2 border-brand-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CalendarDays size={18} className="text-brand-600" />
              新增学习计划
            </h2>
            <button
              onClick={() => { setAdding(false); setNewContent(''); }}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* 快捷日期 */}
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">选择日期</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {quickDates.map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setNewDate(val)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    newDate === val
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-gray-300 text-gray-600 hover:border-brand-400'
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
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="计划学什么？写具体一点，打卡时更容易核对~"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd();
            }}
          />
          <p className="text-xs text-gray-400 mt-1 mb-3">Ctrl+Enter 快速保存</p>

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

      {/* 计划列表（按日期分组） */}
      {dates.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CalendarDays size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">还没有计划</p>
          <p className="text-sm mt-1">点击「新增计划」开始安排学习</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map((date) => {
            const group    = grouped[date];
            const isToday  = date === today;
            const isPast   = date < today;
            const doneAll  = group.every((p) => p.completed);
            const isCollapsed = collapsed[date];

            const dateLabel = isToday ? '今天' : isPast ? '已过期' : '';

            return (
              <div
                key={date}
                className={`border rounded-xl overflow-hidden ${
                  isToday ? 'border-brand-300 shadow-sm' : isPast ? 'border-gray-200 opacity-70' : 'border-gray-200'
                }`}
              >
                {/* 日期标题行 */}
                <button
                  className={`w-full flex items-center justify-between px-4 py-3 text-left ${
                    isToday ? 'bg-brand-50' : isPast ? 'bg-gray-50' : 'bg-white'
                  }`}
                  onClick={() => toggleCollapse(date)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{date}</span>
                    {dateLabel && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isToday ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {dateLabel}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {group.filter((p) => p.completed).length}/{group.length} 完成
                    </span>
                    {doneAll && <span className="text-green-600 text-sm">✅ 全部完成</span>}
                  </div>
                  {isCollapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
                </button>

                {/* 计划条目 */}
                {!isCollapsed && (
                  <div className="divide-y divide-gray-100">
                    {group.map((plan) => (
                      <div
                        key={plan.id}
                        className={`flex items-start gap-3 px-4 py-3 ${plan.completed ? 'bg-green-50' : 'bg-white'}`}
                      >
                        {/* 完成勾选 */}
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

                        {/* 内容（或编辑框） */}
                        <div className="flex-1 min-w-0">
                          {editingId === plan.id ? (
                            <div className="flex gap-2">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleSaveEdit(plan.id)}
                                  className="p-1 bg-brand-600 text-white rounded hover:bg-brand-700"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className={`text-sm ${plan.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {plan.content}
                            </p>
                          )}
                        </div>

                        {/* 操作按钮 */}
                        {editingId !== plan.id && (
                          <div className="flex-shrink-0 flex gap-1">
                            <button
                              onClick={() => handleStartEdit(plan)}
                              className="p-1 text-gray-400 hover:text-brand-600 rounded hover:bg-brand-50"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => deletePlan(plan.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                            >
                              <Trash2 size={14} />
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
