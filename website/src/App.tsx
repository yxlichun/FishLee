import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useStore } from './store';

const Goals = lazy(() => import('./components/Goals'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const LearningPath = lazy(() => import('./components/LearningPath'));
const CheckIn = lazy(() => import('./components/CheckIn'));
const Notes = lazy(() => import('./components/Notes'));
const Resources = lazy(() => import('./components/Resources'));
const Inspirations = lazy(() => import('./components/Inspirations'));
const Plans = lazy(() => import('./components/Plans'));
const OperationLogs = lazy(() => import('./components/OperationLogs'));
const Login = lazy(() => import('./components/Login'));
const UserManagement = lazy(() => import('./pages/UserManagement'));

const PageLoading = () => (
  <div className="p-4 flex items-center justify-center h-[80vh]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-2"></div>
      <p className="text-gray-500 text-sm">加载中...</p>
    </div>
  </div>
);

// 受保护的路由组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useStore((s) => s.currentUser);
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// 旧路由兼容重定向：/dashboard → /goals/default-goal/dashboard
function LegacyRedirect() {
  const activeGoalId = useStore((s) => s.activeGoalId);
  const firstGoalId = useStore((s) => s.goals[0]?.id);
  const goalId = activeGoalId || firstGoalId || 'default-goal';
  const path = window.location.pathname;
  return <Navigate to={`/goals/${goalId}${path}`} replace />;
}

function App() {
  const loadData = useStore((state) => state.loadData);
  // const isLoading = useStore((state) => state.isLoading);
  // const error = useStore((state) => state.error);

  useEffect(() => {
    // 先显示本地数据，然后在后台加载远程数据
    loadData();
  }, [loadData]);

  // 不再显示加载界面，直接渲染应用
  // 如果数据还未加载，会使用默认数据

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/goals" replace />} />
        <Route path="/login" element={
          <Suspense fallback={<PageLoading />}>
            <Login />
          </Suspense>
        } />
        <Route path="/user-management" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoading />}>
              <UserManagement />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/goals" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoading />}>
              <Goals />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/goals/:goalId" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Suspense fallback={<PageLoading />}><Dashboard /></Suspense>} />
          <Route path="learning-path" element={<Suspense fallback={<PageLoading />}><LearningPath /></Suspense>} />
          <Route path="check-in" element={<Suspense fallback={<PageLoading />}><CheckIn /></Suspense>} />
          <Route path="notes" element={<Suspense fallback={<PageLoading />}><Notes /></Suspense>} />
          <Route path="resources" element={<Suspense fallback={<PageLoading />}><Resources /></Suspense>} />
          <Route path="inspirations" element={<Suspense fallback={<PageLoading />}><Inspirations /></Suspense>} />
          <Route path="plans" element={<Suspense fallback={<PageLoading />}><Plans /></Suspense>} />
          <Route path="operation-logs" element={<Suspense fallback={<PageLoading />}><OperationLogs /></Suspense>} />
        </Route>
        {/* 旧路由兼容 */}
        <Route path="/dashboard" element={<ProtectedRoute><LegacyRedirect /></ProtectedRoute>} />
        <Route path="/learning-path" element={<ProtectedRoute><LegacyRedirect /></ProtectedRoute>} />
        <Route path="/check-in" element={<ProtectedRoute><LegacyRedirect /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><LegacyRedirect /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><LegacyRedirect /></ProtectedRoute>} />
        <Route path="/inspirations" element={<ProtectedRoute><LegacyRedirect /></ProtectedRoute>} />
        <Route path="/plans" element={<ProtectedRoute><LegacyRedirect /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
