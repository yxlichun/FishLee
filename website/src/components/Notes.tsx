import { useState, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { learningPath } from '../data/learningPath';
import { Plus, Edit2, Trash2, Save, X, Image, Eye, Code, Maximize2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

const UPLOAD_URL = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api/upload`
  : '/api/upload';
const isDevelopment = import.meta.env.DEV;

async function uploadImage(file: File): Promise<string> {
  if (isDevelopment) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: {
      'x-filename': encodeURIComponent(`${Date.now()}-${file.name}`),
      'x-content-type': file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error('图片上传失败');
  }

  const data = await response.json();
  return data.url;
}

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    phaseId: 1,
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent =
      formData.content.substring(0, start) + text + formData.content.substring(end);
    setFormData((prev) => ({ ...prev, content: newContent }));
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    });
  }, [formData.content]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('请选择图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('图片大小不能超过 5MB');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadImage(file);
      const altText = file.name.replace(/\.[^/.]+$/, '');
      insertAtCursor(`\n![${altText}](${url})\n`);
    } catch (e) {
      setUploadError((e as Error).message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await handleImageUpload(file);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) await handleImageUpload(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    if (editingId) {
      updateNote(editingId, formData);
    } else {
      addNote(formData);
    }
    handleClose();
  };

  const handleEdit = (note: typeof notes[0]) => {
    setEditingId(note.id);
    setFormData({ title: note.title, content: note.content, phaseId: note.phaseId || 1, tags: note.tags });
    setIsEditing(true);
    setExpandedNoteId(null);
  };

  const handleClose = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ title: '', content: '', phaseId: 1, tags: [] });
    setTagInput('');
    setUploadError(null);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">学习笔记</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">支持 Markdown · 图片上传</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center justify-center gap-2 py-2.5 sm:py-2">
            <Plus size={20} />
            新建笔记
          </button>
        )}
      </div>

      {isEditing && (
        <div className="card p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {editingId ? '编辑笔记' : '新建笔记'}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-gray-100 rounded-lg p-1 text-sm">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-md transition-colors ${viewMode === 'edit' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Code size={14} />编辑
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-md transition-colors ${viewMode === 'split' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  分栏
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-md transition-colors ${viewMode === 'preview' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Eye size={14} />预览
                </button>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                title="上传图片（也可直接粘贴或拖拽）"
              >
                <Image size={16} />
                {uploading ? '上传中...' : '插入图片'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = '';
                }}
              />
              <button onClick={handleClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="笔记标题"
              className="flex-1 min-w-0 px-3 sm:px-4 py-2 text-base sm:text-lg font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <select
              value={formData.phaseId}
              onChange={(e) => setFormData({ ...formData, phaseId: Number(e.target.value) })}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              {learningPath.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  第{phase.month}月 - {phase.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="添加标签（按回车）"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <button onClick={addTag} className="btn-secondary text-sm px-3">添加</button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="px-2 sm:px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs sm:text-sm flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-brand-900 ml-1">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {uploadError && (
            <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {uploadError}
            </div>
          )}

          <div
            className={`border border-gray-300 rounded-lg overflow-hidden ${viewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2' : ''}`}
            onDrop={viewMode !== 'preview' ? handleDrop : undefined}
            onDragOver={viewMode !== 'preview' ? (e) => e.preventDefault() : undefined}
          >
            {viewMode !== 'preview' && (
              <textarea
                ref={textareaRef}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                onPaste={handlePaste}
                placeholder="支持 Markdown 格式，可直接粘贴或拖拽图片..."
                className="w-full px-3 sm:px-4 py-3 focus:outline-none resize-none font-mono text-sm leading-relaxed"
                style={{ minHeight: 300 }}
              />
            )}
            {viewMode === 'split' && (
              <div className="border-t lg:border-t-0 lg:border-l border-gray-300 px-3 sm:px-4 py-3 overflow-y-auto bg-gray-50" style={{ minHeight: 300 }}>
                {formData.content
                  ? <MarkdownRenderer content={formData.content} />
                  : <p className="text-gray-400 text-sm">预览区域</p>
                }
              </div>
            )}
            {viewMode === 'preview' && (
              <div className="px-3 sm:px-4 py-3 overflow-y-auto" style={{ minHeight: 300 }}>
                {formData.content
                  ? <MarkdownRenderer content={formData.content} />
                  : <p className="text-gray-400 text-sm">暂无内容</p>
                }
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-2">
            支持粘贴图片（Ctrl+V）或拖拽图片到编辑区自动上传
          </p>

          <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2 mt-4 py-2.5 sm:py-3">
            <Save size={18} />
            保存笔记
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center py-12 col-span-2">还没有笔记，点击「新建笔记」开始记录</p>
        ) : (
          [...notes]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((note) => (
              <div key={note.id} className="card p-4 sm:p-6 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 mr-2 break-words">{note.title}</h3>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)}
                      className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                      title="展开查看"
                    >
                      <Maximize2 size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                      title="编辑"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className={`flex-1 overflow-hidden mb-3 ${expandedNoteId === note.id ? '' : 'max-h-32'}`}>
                  <MarkdownRenderer content={note.content} />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-gray-500 pt-3 border-t border-gray-100 mt-auto">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs flex-shrink-0">{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>

                {expandedNoteId !== note.id && note.content.length > 200 && (
                  <button
                    onClick={() => setExpandedNoteId(note.id)}
                    className="text-xs text-brand-600 hover:text-brand-800 mt-2 text-left"
                  >
                    展开全文 ↓
                  </button>
                )}
                {expandedNoteId === note.id && (
                  <button
                    onClick={() => setExpandedNoteId(null)}
                    className="text-xs text-brand-600 hover:text-brand-800 mt-2 text-left"
                  >
                    收起 ↑
                  </button>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
}
