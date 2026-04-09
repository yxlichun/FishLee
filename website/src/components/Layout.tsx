import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, FileText, Bookmark, Download, Upload, Lightbulb, ClipboardList, Menu, X } from 'lucide-react';
import { useStore } from '../store';

export default function Layout() {
  const exportData = useStore((state) => state.exportData);
  const importData = useStore((state) => state.importData);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: '仪表盘' },
    { to: '/learning-path', icon: BookOpen, label: '学习路径' },
    { to: '/plans', icon: ClipboardList, label: '学习计划' },
    { to: '/check-in', icon: Calendar, label: '每日打卡' },
    { to: '/notes', icon: FileText, label: '学习笔记' },
    { to: '/resources', icon: Bookmark, label: '资源收藏' },
    { to: '/inspirations', icon: Lightbulb, label: '灵感' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">AI PM 学习路径</h1>
          <p className="text-sm text-gray-500 mt-1">6个月转型计划</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
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

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">AI PM 学习路径</h1>
            <p className="text-xs text-gray-500">6个月转型计划</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 max-h-[calc(100vh-80px)] overflow-y-auto">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
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
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-[73px] lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
