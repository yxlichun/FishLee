import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, FileText, Bookmark, Download, Upload, Lightbulb } from 'lucide-react';
import { useStore } from '../store';

export default function Layout() {
  const exportData = useStore((state) => state.exportData);
  const importData = useStore((state) => state.importData);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-pm-learning-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          importData(content);
          alert('数据导入成功！');
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">AI PM 学习路径</h1>
          <p className="text-sm text-gray-500 mt-1">6个月转型计划</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>仪表盘</span>
          </NavLink>
          <NavLink to="/learning-path" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <BookOpen size={20} />
            <span>学习路径</span>
          </NavLink>
          <NavLink to="/check-in" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Calendar size={20} />
            <span>每日打卡</span>
          </NavLink>
          <NavLink to="/notes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            <span>学习笔记</span>
          </NavLink>
          <NavLink to="/resources" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Bookmark size={20} />
            <span>资源收藏</span>
          </NavLink>
          <NavLink to="/inspirations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Lightbulb size={20} />
            <span>灵感</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button onClick={handleExport} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Download size={16} />
            <span>导出数据</span>
          </button>
          <button onClick={handleImport} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Upload size={16} />
            <span>导入数据</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
