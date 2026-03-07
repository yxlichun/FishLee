import { useState } from 'react';
import { useStore } from '../store';
import { learningPath } from '../data/learningPath';
import ReactMarkdown from 'react-markdown';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    phaseId: 1,
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingId) {
      updateNote(editingId, formData);
      setEditingId(null);
    } else {
      addNote(formData);
      setIsCreating(false);
    }

    setFormData({ title: '', content: '', phaseId: 1, tags: [] });
    setTagInput('');
  };

  const handleEdit = (note: typeof notes[0]) => {
    setEditingId(note.id);
    setFormData({
      title: note.title,
      content: note.content,
      phaseId: note.phaseId || 1,
      tags: note.tags,
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ title: '', content: '', phaseId: 1, tags: [] });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">学习笔记</h1>
          <p className="text-gray-500 mt-2">记录学习心得与思考</p>
        </div>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            新建笔记
          </button>
        )}
      </div>

      {isCreating && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? '编辑笔记' : '新建笔记'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="btn-secondary text-sm"
              >
                {previewMode ? '编辑' : '预览'}
              </button>
              <button onClick={handleCancel} className="btn-secondary">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="笔记标题"
              className="w-full px-4 py-2 text-lg font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />

            <select
              value={formData.phaseId}
              onChange={(e) => setFormData({ ...formData, phaseId: Number(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              {learningPath.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  第{phase.month}月 - {phase.title}
                </option>
              ))}
            </select>

            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="添加标签（按回车）"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button onClick={addTag} className="btn-secondary">添加</button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-brand-900">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {previewMode ? (
              <div className="prose max-w-none p-4 border border-gray-300 rounded-lg min-h-[400px]">
                <ReactMarkdown>{formData.content}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="支持Markdown格式..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none font-mono text-sm"
                rows={15}
              />
            )}

            <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2">
              <Save size={18} />
              保存笔记
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center py-8 col-span-2">还没有笔记</p>
        ) : (
          [...notes]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((note) => (
              <div key={note.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="text-gray-400 hover:text-brand-600"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none mb-3 line-clamp-3">
                  <ReactMarkdown>{note.content}</ReactMarkdown>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
