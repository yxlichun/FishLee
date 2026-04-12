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

const PageLoading = () => (
  <div className="p-4 flex items-center justify-center h-[80vh]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-2"></div>
      <p className="text-gray-500 text-sm">加载中...</p>
    </div>
  </div>
);

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
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">加载失败: {error}</p>
          <button onClick={loadData} className="btn-primary">重试</button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/goals" replace />} />
        <Route path="/goals" element={
          <Suspense fallback={<PageLoading />}>
            <Goals />
          </Suspense>
        } />
        <Route path="/goals/:goalId" element={<Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Suspense fallback={<PageLoading />}><Dashboard /></Suspense>} />
          <Route path="learning-path" element={<Suspense fallback={<PageLoading />}><LearningPath /></Suspense>} />
          <Route path="check-in" element={<Suspense fallback={<PageLoading />}><CheckIn /></Suspense>} />
          <Route path="notes" element={<Suspense fallback={<PageLoading />}><Notes /></Suspense>} />
          <Route path="resources" element={<Suspense fallback={<PageLoading />}><Resources /></Suspense>} />
          <Route path="inspirations" element={<Suspense fallback={<PageLoading />}><Inspirations /></Suspense>} />
          <Route path="plans" element={<Suspense fallback={<PageLoading />}><Plans /></Suspense>} />
        </Route>
        {/* 旧路由兼容 */}
        <Route path="/dashboard" element={<LegacyRedirect />} />
        <Route path="/learning-path" element={<LegacyRedirect />} />
        <Route path="/check-in" element={<LegacyRedirect />} />
        <Route path="/notes" element={<LegacyRedirect />} />
        <Route path="/resources" element={<LegacyRedirect />} />
        <Route path="/inspirations" element={<LegacyRedirect />} />
        <Route path="/plans" element={<LegacyRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
