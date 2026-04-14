import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { User, UserRole } from '../types';

export default function UserManagement() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const users = useStore((s) => s.users);
  const addUser = useStore((s) => s.addUser);
  const updateUser = useStore((s) => s.updateUser);
  const deleteUser = useStore((s) => s.deleteUser);
  const bindAssistant = useStore((s) => s.bindAssistant);
  const logout = useStore((s) => s.logout);

  // 状态管理
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBindModal, setShowBindModal] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState<User | null>(null);
  const [currentBindUser, setCurrentBindUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user' as UserRole,
  });
  const [bindFormData, setBindFormData] = useState({
    boundUserId: '',
    boundUserPassword: '',
  });
  const [error, setError] = useState<string | null>(null);

  // 检查是否为管理员
  if (!currentUser || currentUser.role !== 'admin') {
    navigate('/goals');
    return null;
  }

  // 处理添加用户
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUser(formData);
      setShowAddModal(false);
      setFormData({ username: '', password: '', role: 'user' });
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // 处理编辑用户
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditUser) return;
    try {
      await updateUser(currentEditUser.id, formData);
      setShowEditModal(false);
      setCurrentEditUser(null);
      setFormData({ username: '', password: '', role: 'user' });
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // 处理删除用户
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      try {
        await deleteUser(userId);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  // 处理绑定助理用户
  const handleBindAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBindUser) return;
    try {
      await bindAssistant(currentBindUser.id, bindFormData.boundUserId, bindFormData.boundUserPassword);
      setShowBindModal(false);
      setCurrentBindUser(null);
      setBindFormData({ boundUserId: '', boundUserPassword: '' });
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // 打开编辑模态框
  const openEditModal = (user: User) => {
    setCurrentEditUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      role: user.role,
    });
    setShowEditModal(true);
  };

  // 打开绑定模态框
  const openBindModal = (user: User) => {
    setCurrentBindUser(user);
    setBindFormData({ boundUserId: '', boundUserPassword: '' });
    setShowBindModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/goals')}
                className="text-gray-500 hover:text-gray-900 mr-4"
              >
                ← 返回
              </button>
              <h1 className="text-xl font-bold text-gray-900">用户管理</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setFormData({ username: '', password: '', role: 'user' });
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                新增用户
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{currentUser.username}</span>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  退出
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* 用户列表 */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  绑定用户
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const boundUser = users.find(u => u.id === user.boundUserId);
                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.role === 'admin' && '管理员'}
                      {user.role === 'user' && '普通用户'}
                      {user.role === 'assistant' && '助理用户'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.boundUserId ? boundUser?.username || '未知用户' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        编辑
                      </button>
                      {user.role === 'assistant' && !user.boundUserId && (
                        <button
                          onClick={() => openBindModal(user)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          绑定
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新增用户模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">新增用户</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                ×
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="请输入用户名"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="请输入密码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                  <option value="assistant">助理用户</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  取消
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑用户模态框 */}
      {showEditModal && currentEditUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">编辑用户</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                ×
              </button>
            </div>
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="请输入用户名"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="请输入密码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                  <option value="assistant">助理用户</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  取消
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 绑定助理用户模态框 */}
      {showBindModal && currentBindUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">绑定助理用户</h2>
              <button onClick={() => setShowBindModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                ×
              </button>
            </div>
            <form onSubmit={handleBindAssistant} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">绑定用户</label>
                <select
                  value={bindFormData.boundUserId}
                  onChange={(e) => setBindFormData({ ...bindFormData, boundUserId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                >
                  <option value="">请选择用户</option>
                  {users
                    .filter(u => u.id !== currentBindUser.id)
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.role === 'admin' ? '管理员' : '普通用户'})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">绑定用户密码</label>
                <input
                  type="password"
                  value={bindFormData.boundUserPassword}
                  onChange={(e) => setBindFormData({ ...bindFormData, boundUserPassword: e.target.value })}
                  placeholder="请输入绑定用户密码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowBindModal(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  取消
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
                  绑定
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
