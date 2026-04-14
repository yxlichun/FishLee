import { useState } from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { Clock, User, Activity, Target, ChevronDown, ChevronUp } from 'lucide-react';

export default function OperationLogs() {
  const { operationLogs, currentUser } = useStore();
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // 过滤出当前用户和其绑定的助理的操作日志
  const filteredLogs = operationLogs.filter(log => {
    // 显示当前用户的操作
    if (log.userId === currentUser?.id) {
      return true;
    }
    // 如果当前用户是普通用户或管理员，显示其绑定的助理的操作
    if (currentUser?.role !== 'assistant') {
      // 这里需要根据实际的绑定关系来过滤，暂时假设助理用户的 boundUserId 指向当前用户
      const assistantUsers = useStore.getState().users.filter(
        user => user.role === 'assistant' && user.boundUserId === currentUser?.id
      );
      return assistantUsers.some(assistant => assistant.id === log.userId);
    }
    return false;
  });

  // 按日期分组
  const groupedLogs = filteredLogs.reduce<Record<string, typeof filteredLogs>>((acc, log) => {
    const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  // 按日期排序
  const sortedDates = Object.keys(groupedLogs).sort().reverse();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">操作日志</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">查看您和您的助理的操作记录</p>
      </div>

      {sortedDates.length === 0 ? (
        <div className="card text-center py-12 sm:py-16 text-gray-400">
          <Clock size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-base sm:text-lg font-medium">还没有操作记录</p>
          <p className="text-sm mt-1">进行一些操作后，这里会显示操作记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => {
            const logs = groupedLogs[date];
            return (
              <div key={date} className="card">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock size={18} className="text-brand-600" />
                    {date}
                    <span className="text-sm text-gray-500 ml-2">({logs.length} 条记录)</span>
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {logs.map(log => (
                    <div key={log.id} className="px-4 sm:px-6 py-3 sm:py-4">
                      <div 
                        className="flex items-start gap-3 cursor-pointer"
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.userRole === 'assistant' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            <User size={16} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`font-medium text-sm ${log.userRole === 'assistant' ? 'text-red-700' : 'text-green-700'}`}>
                              {log.username} ({log.userRole === 'assistant' ? '助理' : log.userRole === 'admin' ? '管理员' : '用户'})
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(log.timestamp), 'HH:mm:ss')}
                            </span>
                            <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-xs">
                              {log.action}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Target size={14} className="flex-shrink-0" />
                            <span>{log.target} ({log.targetId})</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {expandedLog === log.id ? (
                            <ChevronUp size={16} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                      {expandedLog === log.id && log.details && (
                        <div className="mt-3 pl-11">
                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                              <Activity size={14} />
                              详细信息
                            </h3>
                            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
