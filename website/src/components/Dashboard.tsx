import { useStore } from '../store';
import { learningPath } from '../data/learningPath';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Calendar, FileText, Flame } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { taskProgress, checkIns, notes } = useStore();

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

  // 计算连续打卡天数
  const sortedCheckIns = [...checkIns].sort((a, b) =>
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
  const totalHours = checkIns.reduce((sum, c) => sum + c.duration, 0);

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
