import { useState } from 'react';
import { useStore } from '../store';
import { learningPath } from '../data/learningPath';
import { format } from 'date-fns';
import { Pencil, Trash2, Check, X, ClipboardList } from 'lucide-react';

export default function CheckIn() {
  const { checkIns, addCheckIn, updateCheckIn, deleteCheckIn, plans, togglePlan } = useStore();
  const [content, setContent]     = useState('');
  const [duration, setDuration]   = useState(60);
  const [phaseId, setPhaseId]     = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent]   = useState('');
  const [editDuration, setEditDuration] = useState(60);
  const [editPhaseId, setEditPhaseId]   = useState(1);

  const today = format(new Date(), 'yyyy-MM-dd');

  const todayCheckIns = checkIns.filter((c) => {
    const d = new Date(c.timestamp);
    return !isNaN(d.getTime()) && format(d, 'yyyy-MM-dd') === today;
  });

  const todayPlans = plans.filter((p) => p.date === today);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    // 打卡时对当日计划做快照，永久保存内容与完成状态
    const planSnapshot = todayPlans.map((p) => ({
      id: p.id,
      content: p.content,
      completed: p.completed,
    }));
    await addCheckIn({ content, duration, phaseId, planSnapshot });
    setContent('');
    setDuration(60);
  };

  const handleEdit = (checkIn: typeof checkIns[0]) => {
    setEditingId(checkIn.id);
    setEditContent(checkIn.content);
    setEditDuration(checkIn.duration);
    setEditPhaseId(checkIn.phaseId);
  };

  const handleSaveEdit = async (id: string) => {
    await updateCheckIn(id, { content: editContent, duration: editDuration, phaseId: editPhaseId });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这条打卡记录吗？')) {
      await deleteCheckIn(id);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">每日打卡</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">记录你的学习进展</p>
      </div>

      {/* 今日计划回顾 */}
      {todayPlans.length > 0 && (
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6 border border-brand-200 bg-brand-50">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={18} className="text-brand-600 flex-shrink-0" />
            <h2 className="text-base font-semibold text-brand-900">今日计划</h2>
            <span className="text-xs text-brand-600 ml-auto">
              {todayPlans.filter((p) => p.completed).length}/{todayPlans.length} 完成
            </span>
          </div>
          <div className="space-y-2">
            {todayPlans.map((plan) => (
              <div key={plan.id} className="flex items-center gap-3">
                <button
                  onClick={() => togglePlan(plan.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    plan.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-brand-400 hover:border-green-400 bg-white'
                  }`}
                >
                  {plan.completed && <Check size={12} className="text-white" />}
                </button>
                <span className={`text-sm ${plan.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {plan.content}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 打卡表单 */}
      <div className="card p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          {todayCheckIns.length > 0 ? `今日已打卡 ${todayCheckIns.length} 次 ✅` : '今日打卡'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">学习内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今天学了什么？有什么收获？"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">学习时长（分钟）</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="1"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">学习阶段</label>
              <select
                value={phaseId}
                onChange={(e) => setPhaseId(Number(e.target.value))}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {learningPath.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    第{phase.month}月 - {phase.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-2.5 sm:py-3">
            提交打卡
          </button>
        </form>
      </div>

      {/* 打卡历史 */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">打卡历史</h2>
        {checkIns.length === 0 ? (
          <p className="text-gray-500 text-center py-8">还没有打卡记录</p>
        ) : (
          <div className="space-y-4">
            {[...checkIns]
              .filter((c) => !isNaN(new Date(c.timestamp).getTime()))
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((checkIn) => (
                <div key={checkIn.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  {editingId === checkIn.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={editDuration}
                          onChange={(e) => setEditDuration(Number(e.target.value))}
                          min="1"
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                        <select
                          value={editPhaseId}
                          onChange={(e) => setEditPhaseId(Number(e.target.value))}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        >
                          {learningPath.map((phase) => (
                            <option key={phase.id} value={phase.id}>
                              第{phase.month}月 - {phase.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(checkIn.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm"
                        >
                          <Check size={16} />保存
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                        >
                          <X size={16} />取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="font-medium text-gray-900 text-sm">
                            {format(new Date(checkIn.timestamp), 'yyyy-MM-dd HH:mm')}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">{checkIn.duration}分钟</span>
                          <span className="px-2 py-0.5 sm:py-1 bg-brand-50 text-brand-700 rounded text-xs sm:text-sm">
                            第{checkIn.phaseId}阶段
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(checkIn)}
                            className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(checkIn.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base break-words">{checkIn.content}</p>
                      {checkIn.planSnapshot && checkIn.planSnapshot.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                            <ClipboardList size={12} />
                            打卡时计划快照
                          </p>
                          <div className="space-y-1">
                            {checkIn.planSnapshot.map((p) => (
                              <div key={p.id} className="flex items-center gap-2 text-sm">
                                <span className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
                                  p.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                }`}>
                                  {p.completed && <Check size={10} className="text-white" />}
                                </span>
                                <span className={p.completed ? 'line-through text-gray-400' : 'text-gray-600'}>
                                  {p.content}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
