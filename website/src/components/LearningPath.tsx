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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">学习路径</h1>
        <p className="text-gray-500 mt-2">6个月AI产品经理转型计划</p>
      </div>

      <div className="space-y-4">
        {learningPath.map((phase) => {
          const isExpanded = expandedPhases.includes(phase.id);
          const phaseTasks = phase.sections.flatMap(s => s.tasks);
          const completedCount = phaseTasks.filter(t => taskProgress[t.id]).length;
          const progress = Math.round((completedCount / phaseTasks.length) * 100);

          return (
            <div key={phase.id} className="card">
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 ${phase.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                    {phase.month}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">{phase.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{phase.subtitle}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`${phase.color} h-2 rounded-full transition-all`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{progress}%</span>
                    </div>
                  </div>
                </div>
                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>

              {isExpanded && (
                <div className="mt-6 space-y-4">
                  {phase.sections.map((section) => {
                    const isSectionExpanded = expandedSections.includes(section.id);
                    const sectionCompleted = section.tasks.filter(t => taskProgress[t.id]).length;

                    return (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between text-left"
                        >
                          <div>
                            <h3 className="font-medium text-gray-900">{section.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {section.duration} · {sectionCompleted}/{section.tasks.length} 完成
                            </p>
                          </div>
                          {isSectionExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>

                        {isSectionExpanded && (
                          <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700">学习任务</h4>
                              {section.tasks.map((task) => (
                                <label
                                  key={task.id}
                                  className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={taskProgress[task.id] || false}
                                    onChange={() => toggleTask(task.id)}
                                    className="mt-1 w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                  />
                                  <span className={`flex-1 text-sm ${taskProgress[task.id] ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                    {task.text}
                                  </span>
                                  {taskProgress[task.id] && <CheckCircle2 size={16} className="text-green-500 mt-1" />}
                                </label>
                              ))}
                            </div>

                            {section.resources.length > 0 && (
                              <div className="space-y-2 pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-700">推荐资源</h4>
                                <div className="space-y-2">
                                  {section.resources.map((resource, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                        {resource.type}
                                      </span>
                                      {resource.url ? (
                                        <a
                                          href={resource.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-brand-600 hover:text-brand-700 flex items-center gap-1"
                                        >
                                          {resource.title}
                                          <ExternalLink size={12} />
                                        </a>
                                      ) : (
                                        <span className="text-gray-700">{resource.title}</span>
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
