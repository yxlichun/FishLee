import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LearningPath from './components/LearningPath';
import CheckIn from './components/CheckIn';
import Notes from './components/Notes';
import Resources from './components/Resources';
import Inspirations from './components/Inspirations';
import Plans from './components/Plans';
import { useStore } from './store';

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
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="learning-path" element={<LearningPath />} />
          <Route path="check-in" element={<CheckIn />} />
          <Route path="notes" element={<Notes />} />
          <Route path="resources" element={<Resources />} />
          <Route path="inspirations" element={<Inspirations />} />
          <Route path="plans" element={<Plans />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
