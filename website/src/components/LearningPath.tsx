import { useState } from 'react';
import { learningPath } from '../data/learningPath';
import { useStore } from '../store';
import { ChevronDown, ChevronRight, CheckCircle2, ExternalLink } from 'lucide-react';

export default function LearningPath() {
  const { taskProgress, toggleTask } = useStore();
  const [expandedPhases, setExpandedPhases] = useState<number[]>([1]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const togglePhase = (phaseId: number) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId) ? prev.filter(id => id !== phaseId) : [...prev, phaseId]
    );
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">学习路径</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">6个月AI产品经理转型计划</p>
      </div>

      <div className="space-y-4">
        {learningPath.map((phase) => {
          const isExpanded = expandedPhases.includes(phase.id);
          const phaseTasks = phase.sections.flatMap(s => s.tasks);
          const completedCount = phaseTasks.filter(t => taskProgress[t.id]).length;
          const progress = Math.round((completedCount / phaseTasks.length) * 100);

          return (
            <div key={phase.id} className="card p-4 sm:p-6">
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${phase.color} rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0`}>
                    {phase.month}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{phase.title}</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">{phase.subtitle}</p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                        <div
                          className={`${phase.color} h-2 rounded-full transition-all`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">{progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  {phase.sections.map((section) => {
                    const isSectionExpanded = expandedSections.includes(section.id);
                    const sectionCompleted = section.tasks.filter(t => taskProgress[t.id]).length;

                    return (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between text-left"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{section.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                              {section.duration} · {sectionCompleted}/{section.tasks.length} 完成
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {isSectionExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </div>
                        </button>

                        {isSectionExpanded && (
                          <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                            <div className="space-y-2">
                              <h4 className="text-xs sm:text-sm font-medium text-gray-700">学习任务</h4>
                              {section.tasks.map((task) => (
                                <label
                                  key={task.id}
                                  className="flex items-start gap-2 sm:gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={taskProgress[task.id] || false}
                                    onChange={() => toggleTask(task.id)}
                                    className="mt-0.5 sm:mt-1 w-4 h-4 text-brand-600 rounded focus:ring-brand-500 flex-shrink-0"
                                  />
                                  <span className={`flex-1 text-xs sm:text-sm ${taskProgress[task.id] ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                    {task.text}
                                  </span>
                                  {taskProgress[task.id] && <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />}
                                </label>
                              ))}
                            </div>

                            {section.resources.length > 0 && (
                              <div className="space-y-2 pt-3 sm:pt-4 border-t border-gray-200">
                                <h4 className="text-xs sm:text-sm font-medium text-gray-700">推荐资源</h4>
                                <div className="space-y-2">
                                  {section.resources.map((resource, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                                      <span className="px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs flex-shrink-0">
                                        {resource.type}
                                      </span>
                                      {resource.url ? (
                                        <a
                                          href={resource.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-brand-600 hover:text-brand-700 flex items-center gap-1 break-all"
                                        >
                                          <span className="break-all">{resource.title}</span>
                                          <ExternalLink size={12} className="flex-shrink-0" />
                                        </a>
                                      ) : (
                                        <span className="text-gray-700 break-all">{resource.title}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
