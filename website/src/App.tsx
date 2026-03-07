import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LearningPath from './components/LearningPath';
import CheckIn from './components/CheckIn';
import Notes from './components/Notes';
import Resources from './components/Resources';
import Inspirations from './components/Inspirations';

function App() {
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
