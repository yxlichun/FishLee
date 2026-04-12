import { useState } from 'react';
import { useStore, useGoalData } from '../store';
import { InspirationColor } from '../types';
import { Plus, X, Trash2, Edit2, Check } from 'lucide-react';

const colorMap: Record<InspirationColor, { bg: string; border: string; text: string; tag: string }> = {
  yellow: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', tag: 'bg-amber-200 text-amber-800' },
  blue: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-900', tag: 'bg-sky-200 text-sky-800' },
  green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', tag: 'bg-emerald-200 text-emerald-800' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-900', tag: 'bg-pink-200 text-pink-800' },
  purple: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-900', tag: 'bg-violet-200 text-violet-800' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', tag: 'bg-orange-200 text-orange-800' },
};

const colorOptions: InspirationColor[] = ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'];

const colorDots: Record<InspirationColor, string> = {
  yellow: 'bg-amber-400',
  blue: 'bg-sky-400',
  green: 'bg-emerald-400',
  pink: 'bg-pink-400',
  purple: 'bg-violet-400',
  orange: 'bg-orange-400',
};

export default function Inspirations() {
  const inspirations = useGoalData((g) => g.inspirations) ?? [];
  const { addInspiration, updateInspiration, deleteInspiration } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [content, setContent] = useState('');
  const [color, setColor] = useState<InspirationColor>('yellow');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const allTags = [...new Set(inspirations.flatMap((i) => i.tags))];

  const handleSubmit = () => {
    if (!content.trim()) return;
    if (editingId) {
      updateInspiration(editingId, { content, color, tags });
      setEditingId(null);
    } else {
      addInspiration({ content, color, tags });
    }
    setContent('');
    setColor('yellow');
    setTags([]);
    setTagInput('');
    setIsCreating(false);
  };

  const handleEdit = (i: typeof inspirations[0]) => {
    setEditingId(i.id);
    setContent(i.content);
    setColor(i.color);
    setTags(i.tags);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setContent('');
    setColor('yellow');
    setTags([]);
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const filtered = filterTag
    ? inspirations.filter((i) => i.tags.includes(filterTag))
    : inspirations;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">灵感</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">捕捉脑中的灵光一现</p>
        </div>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="btn-primary flex items-center justify-center gap-2 py-2.5 sm:py-2">
            <Plus size={20} />
            记录灵感
          </button>
        )}
      </div>

      {isCreating && (
        <div className={`card mb-6 sm:mb-8 border-2 ${colorMap[color].border} ${colorMap[color].bg} p-4 sm:p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-base sm:text-lg font-semibold ${colorMap[color].text}`}>
              {editingId ? '编辑灵感' : '新灵感'}
            </h2>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 p-1">
              <X size={18} />
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的灵感..."
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none bg-white/70"
            rows={4}
            autoFocus
          />
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-sm text-gray-500">颜色：</span>
            {colorOptions.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${colorDots[c]} ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
              />
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="添加标签（按回车）"
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/70"
            />
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span key={tag} className={`px-2 py-1 rounded-full text-xs ${colorMap[color].tag} flex items-center gap-1`}>
                  {tag}
                  <button onClick={() => setTags(tags.filter((t) => t !== tag))}><X size={12} /></button>
                </span>
              ))}
            </div>
          )}
          <button onClick={handleSubmit} className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-2.5 sm:py-3">
            <Check size={18} />
            保存
          </button>
        </div>
      )}

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => setFilterTag(null)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${!filterTag ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            全部
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${filterTag === tag ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12 sm:py-16">还没有灵感记录，点击右上角开始捕捉吧</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
          {filtered.map((item) => {
            const c = colorMap[item.color];
            return (
              <div key={item.id} className={`break-inside-avoid rounded-xl border-2 ${c.border} ${c.bg} p-3 sm:p-4 group`}>
                <p className={`${c.text} whitespace-pre-wrap leading-relaxed text-sm sm:text-base`}>{item.content}</p>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.tags.map((tag) => (
                      <span key={tag} className={`px-2 py-0.5 rounded-full text-xs ${c.tag}`}>{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50">
                  <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(item)} className="text-gray-400 hover:text-brand-600 p-1"><Edit2 size={14} /></button>
                    <button onClick={() => deleteInspiration(item.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
