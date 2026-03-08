import { useState } from 'react';
import { useStore } from '../store';
import { learningPath } from '../data/learningPath';
import { format } from 'date-fns';
import { Pencil, Trash2, Check, X } from 'lucide-react';

export default function CheckIn() {
  const { checkIns, addCheckIn, updateCheckIn, deleteCheckIn } = useStore();
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState(60);
  const [phaseId, setPhaseId] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editDuration, setEditDuration] = useState(60);
  const [editPhaseId, setEditPhaseId] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await addCheckIn({ content, duration, phaseId });
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
    await updateCheckIn(id, {
      content: editContent,
      duration: editDuration,
      phaseId: editPhaseId,
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这条打卡记录吗？')) {
      await deleteCheckIn(id);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayCheckIns = checkIns.filter(c =>
    format(new Date(c.timestamp), 'yyyy-MM-dd') === today
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">每日打卡</h1>
        <p className="text-gray-500 mt-2">记录你的学习进展</p>
      </div>

      {/* 打卡表单 */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {todayCheckIns.length > 0 ? `今日已打卡 ${todayCheckIns.length} 次 ✅` : '今日打卡'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              学习内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今天学了什么？有什么收获？"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学习时长（分钟）
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学习阶段
              </label>
              <select
                value={phaseId}
                onChange={(e) => setPhaseId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {learningPath.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    第{phase.month}月 - {phase.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            提交打卡
          </button>
        </form>
      </div>

      {/* 打卡历史 */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">打卡历史</h2>
        {checkIns.length === 0 ? (
          <p className="text-gray-500 text-center py-8">还没有打卡记录</p>
        ) : (
          <div className="space-y-4">
            {[...checkIns]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((checkIn) => (
                <div key={checkIn.id} className="border border-gray-200 rounded-lg p-4">
                  {editingId === checkIn.id ? (
                    // 编辑模式
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={editDuration}
                          onChange={(e) => setEditDuration(Number(e.target.value))}
                          min="1"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                        <select
                          value={editPhaseId}
                          onChange={(e) => setEditPhaseId(Number(e.target.value))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
                          <Check size={16} />
                          保存
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                        >
                          <X size={16} />
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 查看模式
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">
                            {format(new Date(checkIn.timestamp), 'yyyy-MM-dd HH:mm')}
                          </span>
                          <span className="text-sm text-gray-500">{checkIn.duration}分钟</span>
                          <span className="px-2 py-1 bg-brand-50 text-brand-700 rounded text-sm">
                            第{checkIn.phaseId}阶段
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(checkIn)}
                            className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded"
                            title="编辑"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(checkIn.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="删除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{checkIn.content}</p>
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
