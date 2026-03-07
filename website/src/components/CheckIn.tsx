import { useState } from 'react';
import { useStore } from '../store';
import { learningPath } from '../data/learningPath';
import { format } from 'date-fns';

export default function CheckIn() {
  const { checkIns, addCheckIn } = useStore();
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState(60);
  const [phaseId, setPhaseId] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await addCheckIn({ content, duration, phaseId });
    setContent('');
    setDuration(60);
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayCheckIn = checkIns.find(c => c.date === today);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">每日打卡</h1>
        <p className="text-gray-500 mt-2">记录你的学习进展</p>
      </div>

      {/* 打卡表单 */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {todayCheckIn ? '今日已打卡 ✅' : '今日打卡'}
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
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((checkIn, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{checkIn.date}</span>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{checkIn.duration}分钟</span>
                      <span className="px-2 py-1 bg-brand-50 text-brand-700 rounded">
                        第{checkIn.phaseId}阶段
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{checkIn.content}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
