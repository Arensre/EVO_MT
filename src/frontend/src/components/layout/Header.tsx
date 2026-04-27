import { Calendar, Building2 } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-primary-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold">EVO_MT</h1>
              <p className="text-sm text-primary-200">Event ERP System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-primary-200">
              <Building2 className="h-5 w-5" />
              <span className="text-sm">Kundenverwaltung</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
