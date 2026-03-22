import { BottomNav } from '../components/BottomNav';
import packageJson from '../../package.json';

const APP_URL = 'https://activity-counter.netlify.app';

export function About() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">About</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📊</div>
            <h2 className="text-2xl font-bold text-gray-900">Activity Counter</h2>
            <p className="text-gray-500 mt-1">Version {packageJson.version}</p>
          </div>

          <p className="text-gray-600 text-center mb-6">
            Track your activities, set goals, and monitor your progress — all offline and right from your device.
          </p>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-gray-700">Version</span>
              <span className="text-sm text-gray-500">{packageJson.version}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-gray-700">Access the app</span>
              <a
                href={APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
              >
                {APP_URL.replace('https://', '')}
              </a>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
