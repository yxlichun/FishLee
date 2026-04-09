import { useState } from 'react';
import { useStore } from '../store';
import { Plus, ExternalLink, Trash2, X } from 'lucide-react';

export default function Resources() {
  const { bookmarks, addBookmark, deleteBookmark } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'article',
    note: '',
  });

  const categories = [
    { value: 'article', label: '文章' },
    { value: 'tool', label: '工具' },
    { value: 'course', label: '课程' },
    { value: 'book', label: '书籍' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'blog', label: '博客' },
    { value: 'other', label: '其他' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) return;

    addBookmark(formData);
    setFormData({ title: '', url: '', category: 'article', note: '' });
    setIsAdding(false);
  };

  const groupedBookmarks = bookmarks.reduce((acc, bookmark) => {
    if (!acc[bookmark.category]) {
      acc[bookmark.category] = [];
    }
    acc[bookmark.category].push(bookmark);
    return acc;
  }, {} as Record<string, typeof bookmarks>);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">资源收藏</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">整理学习资源和工具</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center justify-center gap-2 py-2.5 sm:py-2">
            <Plus size={20} />
            添加资源
          </button>
        )}
      </div>

      {isAdding && (
        <div className="card p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">添加资源</h2>
            <button onClick={() => setIsAdding(false)} className="btn-secondary p-2">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="资源标题"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />

            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="资源链接"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />

            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="备注（可选）"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              rows={3}
            />

            <button type="submit" className="btn-primary w-full py-2.5 sm:py-3">
              保存资源
            </button>
          </form>
        </div>
      )}

      {bookmarks.length === 0 ? (
        <p className="text-gray-500 text-center py-8">还没有收藏资源</p>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {Object.entries(groupedBookmarks).map(([category, items]) => {
            const categoryLabel = categories.find(c => c.value === category)?.label || category;
            return (
              <div key={category}>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">{categoryLabel}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {items.map((bookmark) => (
                    <div key={bookmark.id} className="card p-4 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-base sm:text-lg font-medium text-brand-600 hover:text-brand-700 flex items-center gap-2 break-all"
                        >
                          <span className="break-all">{bookmark.title}</span>
                          <ExternalLink size={16} className="flex-shrink-0" />
                        </a>
                        <button
                          onClick={() => deleteBookmark(bookmark.id)}
                          className="text-gray-400 hover:text-red-600 flex-shrink-0 p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      {bookmark.note && (
                        <p className="text-sm text-gray-600 mb-2 break-words">{bookmark.note}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        添加于 {new Date(bookmark.addedAt).toLocaleDateString()}
                      </p>
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
