import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ActivityList } from './pages/ActivityList';
import { ActivityForm } from './pages/ActivityForm';
import { ActivityDetail } from './pages/ActivityDetail';
import { EntryLog } from './pages/EntryLog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ActivityList />} />
        <Route path="/activity/new" element={<ActivityForm />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
        <Route path="/activity/:id/edit" element={<ActivityForm />} />
        <Route path="/activity/:id/log" element={<EntryLog />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
