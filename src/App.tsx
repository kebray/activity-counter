import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ActivityList } from './pages/ActivityList';
import { ActivityForm } from './pages/ActivityForm';
import { ActivityDetail } from './pages/ActivityDetail';
import { EntryLog } from './pages/EntryLog';
import { About } from './pages/About';
import { PullToRefresh } from './components/PullToRefresh';

function App() {
  return (
    <BrowserRouter>
      <PullToRefresh>
        <Routes>
          <Route path="/" element={<ActivityList />} />
          <Route path="/about" element={<About />} />
          <Route path="/activity/new" element={<ActivityForm />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />
          <Route path="/activity/:id/edit" element={<ActivityForm />} />
          <Route path="/activity/:id/log" element={<EntryLog />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PullToRefresh>
    </BrowserRouter>
  );
}

export default App;
