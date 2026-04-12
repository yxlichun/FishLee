import { useState } from 'react';
import { useStore, useGoalData } from '../store';
import { Resource } from '../types';
import { ChevronDown, ChevronRight, CheckCircle2, ExternalLink, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

// ── 路径新建/编辑弹窗 ────────────────────────────────────────
interface PathModalProps {
  initial?: { title: string; description: string };
  onSave: (title: string, description: string) => void;
  onClose: () => void;
}

function PathModal({ initial, onSave, onClose }: PathModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{initial ? '编辑路径' : '新建达成路径'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">路径名称</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="例如：学Rust、考PMP、转行数据分析"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述（可选）</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              rows={3}
              placeholder="这条路径的目标是什么？"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">取消</button>
          <button
            onClick={() => { if (title.trim()) onSave(title.trim(), description.trim()); }}
            disabled={!title.trim()}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 阶段新建/编辑弹窗 ────────────────────────────────────────
interface PhaseModalProps {
  pathId: string;
  initial?: { id: number; title: string; subtitle: string; month: number; color: string };
  onSave: (phase: { title: string; subtitle: string; month: number; color: string }) => void;
  onClose: () => void;
}

function PhaseModal({ initial, onSave, onClose }: PhaseModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '');
  const [month, setMonth] = useState(initial?.month.toString() ?? '1');
  const [color, setColor] = useState(initial?.color ?? 'bg-blue-500');

  const colors = [
    { value: 'bg-blue-500', label: '蓝色' },
    { value: 'bg-green-500', label: '绿色' },
    { value: 'bg-purple-500', label: '紫色' },
    { value: 'bg-orange-500', label: '橙色' },
    { value: 'bg-pink-500', label: '粉色' },
    { value: 'bg-red-500', label: '红色' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{initial ? '编辑阶段' : '新建阶段'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">阶段标题</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="例如：基础入门、进阶学习、项目实战"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">阶段副标题</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="例如：掌握核心概念和基础语法"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">月份</label>
            <input
              type="number"
              min="1"
              max="12"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">颜色</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full ${c.value} transition-all ${color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">取消</button>
          <button
            onClick={() => {
              if (title.trim() && month) {
                onSave({ title: title.trim(), subtitle: subtitle.trim(), month: parseInt(month), color });
              }
            }}
            disabled={!title.trim() || !month}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 章节新建/编辑弹窗 ────────────────────────────────────────
interface SectionModalProps {
  phaseId: number;
  initial?: { sectionId: string; title: string; duration: string };
  onSave: (section: { title: string; duration: string }) => void;
  onClose: () => void;
}

function SectionModal({ initial, onSave, onClose }: SectionModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [duration, setDuration] = useState(initial?.duration ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{initial ? '编辑章节' : '新建章节'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">章节标题</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="例如：第1周、核心概念、项目实战"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">时长</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="例如：1周、3天、5小时"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">取消</button>
          <button
            onClick={() => {
              if (title.trim() && duration.trim()) {
                onSave({ title: title.trim(), duration: duration.trim() });
              }
            }}
            disabled={!title.trim() || !duration.trim()}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 任务新建/编辑弹窗 ────────────────────────────────────────
interface TaskModalProps {
  phaseId: number;
  sectionId: string;
  initial?: { taskId: string; text: string };
  onSave: (task: { text: string }) => void;
  onClose: () => void;
}

function TaskModal({ initial, onSave, onClose }: TaskModalProps) {
  const [text, setText] = useState(initial?.text ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{initial ? '编辑任务' : '新建任务'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">任务内容</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="例如：学习产品经理基础知识、完成项目规划"
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">取消</button>
          <button
            onClick={() => {
              if (text.trim()) {
                onSave({ text: text.trim() });
              }
            }}
            disabled={!text.trim()}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 资源新建/编辑弹窗 ────────────────────────────────────────
interface ResourceModalProps {
  phaseId: number;
  sectionId: string;
  initial?: { resourceId: number; title: string; url?: string; type: string; description?: string };
  onSave: (resource: { title: string; url?: string; type: string; description?: string }) => void;
  onClose: () => void;
}

function ResourceModal({ initial, onSave, onClose }: ResourceModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [type, setType] = useState(initial?.type ?? 'article');
  const [description, setDescription] = useState(initial?.description ?? '');

  const resourceTypes = [
    { value: 'article', label: '文章' },
    { value: 'book', label: '书籍' },
    { value: 'course', label: '课程' },
    { value: 'tool', label: '工具' },
    { value: 'podcast', label: '播客' },
    { value: 'blog', label: '博客' },
    { value: 'newsletter', label: '通讯' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{initial ? '编辑资源' : '新建资源'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">资源标题</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="例如：产品经理入门指南"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">资源链接（可选）</label>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">资源类型</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {resourceTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述（可选）</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              rows={3}
              placeholder="资源的简要描述"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">取消</button>
          <button
            onClick={() => {
              if (title.trim()) {
                onSave({ title: title.trim(), url: url.trim() || undefined, type, description: description.trim() || undefined });
              }
            }}
            disabled={!title.trim()}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────
export default function LearningPath() {
  const taskProgress = useGoalData((g) => g.taskProgress) ?? {};
  const learningPaths = useGoalData((g) => g.learningPaths) ?? [];
  const activePathId = useGoalData((g) => g.activePathId) ?? null;
  const {
    toggleTask,
    setActivePath, addLearningPath, updateLearningPath, deleteLearningPath,
    addPhase, updatePhase, deletePhase,
    addSection, updateSection, deleteSection,
    addTask, updateTask, deleteTask,
    addResource, updateResource, deleteResource,
  } = useStore();

  const [expandedPhases, setExpandedPhases] = useState<number[]>([1]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showPathModal, setShowPathModal] = useState<'create' | 'edit' | null>(null);
  const [showPathSelector, setShowPathSelector] = useState(false);
  const [showPhaseModal, setShowPhaseModal] = useState<'create' | 'edit' | null>(null);
  const [editingPhase, setEditingPhase] = useState<{ id: number; title: string; subtitle: string; month: number; color: string } | null>(null);
  
  // 章节管理状态
  const [showSectionModal, setShowSectionModal] = useState<'create' | 'edit' | null>(null);
  const [editingSection, setEditingSection] = useState<{ phaseId: number; sectionId: string; title: string; duration: string } | null>(null);
  
  // 任务管理状态
  const [showTaskModal, setShowTaskModal] = useState<'create' | 'edit' | null>(null);
  const [editingTask, setEditingTask] = useState<{ phaseId: number; sectionId: string; taskId: string; text: string } | null>(null);
  
  // 资源管理状态
  const [showResourceModal, setShowResourceModal] = useState<'create' | 'edit' | null>(null);
  const [editingResource, setEditingResource] = useState<{ phaseId: number; sectionId: string; resourceId: number; title: string; url?: string; type: string; description?: string } | null>(null);

  const activePath = learningPaths.find((p) => p.id === activePathId) ?? learningPaths[0];

  const togglePhase = (phaseId: number) => {
    setExpandedPhases((prev) =>
      prev.includes(phaseId) ? prev.filter((id) => id !== phaseId) : [...prev, phaseId]
    );
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleCreatePath = async (title: string, description: string) => {
    await addLearningPath({ title, description, phases: [] });
    setShowPathModal(null);
  };

  const handleEditPath = async (title: string, description: string) => {
    if (activePath) await updateLearningPath(activePath.id, { title, description });
    setShowPathModal(null);
  };

  const handleDeletePath = async () => {
    if (!activePath) return;
    if (learningPaths.length <= 1) {
      alert('至少保留一条学习路径');
      return;
    }
    if (!confirm(`确定删除「${activePath.title}」？此操作不可撤销。`)) return;
    await deleteLearningPath(activePath.id);
  };

  const handleCreatePhase = async (phase: { title: string; subtitle: string; month: number; color: string }) => {
    if (activePath) {
      await addPhase(activePath.id, {
        ...phase,
        sections: []
      });
    }
    setShowPhaseModal(null);
  };

  const handleEditPhase = async (phase: { title: string; subtitle: string; month: number; color: string }) => {
    if (activePath && editingPhase) {
      await updatePhase(activePath.id, editingPhase.id, phase);
    }
    setShowPhaseModal(null);
    setEditingPhase(null);
  };

  const handleDeletePhase = async (phaseId: number) => {
    if (activePath) {
      if (!confirm('确定删除此阶段？此操作不可撤销。')) return;
      await deletePhase(activePath.id, phaseId);
    }
  };

  // 章节管理方法
  const handleCreateSection = async (phaseId: number, section: { title: string; duration: string }) => {
    if (activePath) {
      await addSection(activePath.id, phaseId, {
        ...section,
        tasks: [],
        resources: []
      });
    }
    setShowSectionModal(null);
    setEditingSection(null);
  };

  const handleEditSection = async (section: { title: string; duration: string }) => {
    if (activePath && editingSection) {
      await updateSection(activePath.id, editingSection.phaseId, editingSection.sectionId, section);
    }
    setShowSectionModal(null);
    setEditingSection(null);
  };

  const handleDeleteSection = async (phaseId: number, sectionId: string) => {
    if (activePath) {
      if (!confirm('确定删除此章节？此操作不可撤销。')) return;
      await deleteSection(activePath.id, phaseId, sectionId);
    }
  };

  // 任务管理方法
  const handleCreateTask = async (phaseId: number, sectionId: string, task: { text: string }) => {
    if (activePath) {
      await addTask(activePath.id, phaseId, sectionId, task);
    }
    setShowTaskModal(null);
    setEditingTask(null);
  };

  const handleEditTask = async (task: { text: string }) => {
    if (activePath && editingTask) {
      await updateTask(activePath.id, editingTask.phaseId, editingTask.sectionId, editingTask.taskId, task);
    }
    setShowTaskModal(null);
    setEditingTask(null);
  };

  const handleDeleteTask = async (phaseId: number, sectionId: string, taskId: string) => {
    if (activePath) {
      if (!confirm('确定删除此任务？此操作不可撤销。')) return;
      await deleteTask(activePath.id, phaseId, sectionId, taskId);
    }
  };

  // 资源管理方法
  const handleCreateResource = async (phaseId: number, sectionId: string, resource: { title: string; url?: string; type: string; description?: string }) => {
    if (activePath) {
      await addResource(activePath.id, phaseId, sectionId, resource as Resource);
    }
    setShowResourceModal(null);
    setEditingResource(null);
  };

  const handleEditResource = async (resource: { title: string; url?: string; type: string; description?: string }) => {
    if (activePath && editingResource) {
      await updateResource(activePath.id, editingResource.phaseId, editingResource.sectionId, editingResource.resourceId, resource as Partial<Resource>);
    }
    setShowResourceModal(null);
    setEditingResource(null);
  };

  const handleDeleteResource = async (phaseId: number, sectionId: string, resourceId: number) => {
    if (activePath) {
      if (!confirm('确定删除此资源？此操作不可撤销。')) return;
      await deleteResource(activePath.id, phaseId, sectionId, resourceId);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* 路径选择器 */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <button
                onClick={() => setShowPathSelector((v) => !v)}
                className="flex items-center gap-2 text-left group"
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  {activePath?.title ?? '达成路径'}
                </h1>
                <ChevronDown size={20} className={`text-gray-400 flex-shrink-0 transition-transform ${showPathSelector ? 'rotate-180' : ''}`} />
              </button>
              {activePath?.description && (
                <p className="text-sm sm:text-base text-gray-500 mt-1">{activePath.description}</p>
              )}

              {showPathSelector && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  <div className="p-2 space-y-0.5 max-h-60 overflow-y-auto">
                    {learningPaths.map((path) => (
                      <button
                        key={path.id}
                        onClick={() => { setActivePath(path.id); setShowPathSelector(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                          path.id === activePathId ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {path.id === activePathId && <Check size={14} className="flex-shrink-0" />}
                        <span className={`flex-1 truncate ${path.id !== activePathId ? 'ml-[18px]' : ''}`}>{path.title}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{path.phases.length}阶段</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 p-2">
                    <button
                      onClick={() => { setShowPathModal('create'); setShowPathSelector(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-brand-600 hover:bg-brand-50 transition-colors"
                    >
                      <Plus size={14} />
                      新建学习路径
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 mt-1">
            <button
              onClick={() => setShowPathModal('edit')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="编辑路径信息"
            >
              <Pencil size={16} />
            </button>
            {learningPaths.length > 1 && (
              <button
                onClick={handleDeletePath}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="删除此路径"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={() => setShowPathModal('create')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">新建路径</span>
            </button>
          </div>
        </div>
      </div>

      {/* 阶段列表 */}
      {!activePath || activePath.phases.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 mb-4">这条路径还没有阶段</p>
          <button
            onClick={() => setShowPhaseModal('create')}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors inline-flex"
          >
            <Plus size={14} />
            <span>新建阶段</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activePath.phases.map((phase) => {
            const isExpanded = expandedPhases.includes(phase.id);
            const phaseTasks = phase.sections.flatMap((s) => s.tasks);
            const completedCount = phaseTasks.filter((t) => taskProgress[t.id]).length;
            const progress = phaseTasks.length > 0 ? Math.round((completedCount / phaseTasks.length) * 100) : 0;

            return (
              <div key={phase.id} className="card p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => togglePhase(phase.id)}
                    className="flex items-center text-left flex-1"
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
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingPhase(phase);
                        setShowPhaseModal('edit');
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="编辑阶段"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletePhase(phase.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除阶段"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                    {/* 新建章节按钮 */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setEditingSection({ phaseId: phase.id, sectionId: '', title: '', duration: '' });
                          setShowSectionModal('create');
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors inline-flex"
                      >
                        <Plus size={14} />
                        <span>新建章节</span>
                      </button>
                    </div>
                    
                    {phase.sections.map((section) => {
                      const isSectionExpanded = expandedSections.includes(section.id);
                      const sectionCompleted = section.tasks.filter((t) => taskProgress[t.id]).length;

                      return (
                        <div key={section.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="flex items-center text-left flex-1"
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
                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setEditingSection({ phaseId: phase.id, sectionId: section.id, title: section.title, duration: section.duration });
                                  setShowSectionModal('edit');
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="编辑章节"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteSection(phase.id, section.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="删除章节"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {isSectionExpanded && (
                            <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs sm:text-sm font-medium text-gray-700">学习任务</h4>
                                  <button
                                    onClick={() => {
                                      setEditingTask({ phaseId: phase.id, sectionId: section.id, taskId: '', text: '' });
                                      setShowTaskModal('create');
                                    }}
                                    className="flex items-center gap-1 px-3 py-1 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                                  >
                                    <Plus size={12} />
                                    <span>新建任务</span>
                                  </button>
                                </div>
                                {section.tasks.length === 0 ? (
                                  <p className="text-xs sm:text-sm text-gray-500 italic">暂无任务</p>
                                ) : (
                                  section.tasks.map((task) => (
                                    <div key={task.id} className="flex items-start gap-2 sm:gap-3 p-2 hover:bg-gray-50 rounded">
                                      <input
                                        type="checkbox"
                                        checked={taskProgress[task.id] || false}
                                        onChange={() => toggleTask(task.id)}
                                        className="mt-0.5 sm:mt-1 w-4 h-4 text-brand-600 rounded-sm focus:ring-brand-500 flex-shrink-0"
                                      />
                                      <span className={`flex-1 text-xs sm:text-sm ${taskProgress[task.id] ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                        {task.text}
                                      </span>
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                          onClick={() => {
                                            setEditingTask({ phaseId: phase.id, sectionId: section.id, taskId: task.id, text: task.text });
                                            setShowTaskModal('edit');
                                          }}
                                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                          title="编辑任务"
                                        >
                                          <Pencil size={12} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteTask(phase.id, section.id, task.id)}
                                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                          title="删除任务"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                      {taskProgress[task.id] && <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />}
                                    </div>
                                  ))
                                )}
                              </div>

                              <div className="space-y-2 pt-3 sm:pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs sm:text-sm font-medium text-gray-700">推荐资源</h4>
                                  <button
                                    onClick={() => {
                                      setEditingResource({ phaseId: phase.id, sectionId: section.id, resourceId: 0, title: '', url: '', type: 'article', description: '' });
                                      setShowResourceModal('create');
                                    }}
                                    className="flex items-center gap-1 px-3 py-1 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                                  >
                                    <Plus size={12} />
                                    <span>新建资源</span>
                                  </button>
                                </div>
                                {section.resources.length === 0 ? (
                                  <p className="text-xs sm:text-sm text-gray-500 italic">暂无资源</p>
                                ) : (
                                  <div className="space-y-2">
                                    {section.resources.map((resource, idx) => (
                                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                                        <span className="px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs flex-shrink-0">
                                          {resource.type}
                                        </span>
                                        <div className="flex-1 min-w-0">
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
                                          {resource.description && (
                                            <p className="text-xs text-gray-500 mt-1">{resource.description}</p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <button
                                            onClick={() => {
                                              setEditingResource({ phaseId: phase.id, sectionId: section.id, resourceId: idx, title: resource.title, url: resource.url, type: resource.type, description: resource.description });
                                              setShowResourceModal('edit');
                                            }}
                                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="编辑资源"
                                          >
                                            <Pencil size={12} />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteResource(phase.id, section.id, idx)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            title="删除资源"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
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

          {/* 新建阶段按钮 */}
          <div className="card p-6 text-center">
            <button
              onClick={() => setShowPhaseModal('create')}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors inline-flex"
            >
              <Plus size={14} />
              <span>新建阶段</span>
            </button>
          </div>
        </div>
      )}

      {showPathModal === 'create' && (
        <PathModal onSave={handleCreatePath} onClose={() => setShowPathModal(null)} />
      )}
      {showPathModal === 'edit' && activePath && (
        <PathModal
          initial={{ title: activePath.title, description: activePath.description }}
          onSave={handleEditPath}
          onClose={() => setShowPathModal(null)}
        />
      )}

      {showPhaseModal === 'create' && activePath && (
        <PhaseModal
          pathId={activePath.id}
          onSave={handleCreatePhase}
          onClose={() => setShowPhaseModal(null)}
        />
      )}
      {showPhaseModal === 'edit' && activePath && editingPhase && (
        <PhaseModal
          pathId={activePath.id}
          initial={editingPhase}
          onSave={handleEditPhase}
          onClose={() => setShowPhaseModal(null)}
        />
      )}

      {/* 章节模态框 */}
      {showSectionModal === 'create' && activePath && (
        <SectionModal
          phaseId={editingSection?.phaseId || 0}
          onSave={(section) => handleCreateSection(editingSection?.phaseId || 0, section)}
          onClose={() => setShowSectionModal(null)}
        />
      )}
      {showSectionModal === 'edit' && activePath && editingSection && (
        <SectionModal
          phaseId={editingSection.phaseId}
          initial={editingSection}
          onSave={handleEditSection}
          onClose={() => setShowSectionModal(null)}
        />
      )}

      {/* 任务模态框 */}
      {showTaskModal === 'create' && activePath && editingTask && (
        <TaskModal
          phaseId={editingTask.phaseId}
          sectionId={editingTask.sectionId}
          onSave={(task) => handleCreateTask(editingTask.phaseId, editingTask.sectionId, task)}
          onClose={() => setShowTaskModal(null)}
        />
      )}
      {showTaskModal === 'edit' && activePath && editingTask && (
        <TaskModal
          phaseId={editingTask.phaseId}
          sectionId={editingTask.sectionId}
          initial={editingTask}
          onSave={handleEditTask}
          onClose={() => setShowTaskModal(null)}
        />
      )}

      {/* 资源模态框 */}
      {showResourceModal === 'create' && activePath && editingResource && (
        <ResourceModal
          phaseId={editingResource.phaseId}
          sectionId={editingResource.sectionId}
          onSave={(resource) => handleCreateResource(editingResource.phaseId, editingResource.sectionId, resource)}
          onClose={() => setShowResourceModal(null)}
        />
      )}
      {showResourceModal === 'edit' && activePath && editingResource && (
        <ResourceModal
          phaseId={editingResource.phaseId}
          sectionId={editingResource.sectionId}
          initial={editingResource}
          onSave={handleEditResource}
          onClose={() => setShowResourceModal(null)}
        />
      )}

      {showPathSelector && (
        <div className="fixed inset-0 z-10" onClick={() => setShowPathSelector(false)} />
      )}
    </div>
  );
}
