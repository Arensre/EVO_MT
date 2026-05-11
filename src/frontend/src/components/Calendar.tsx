import { Calendar as CalendarIcon } from "lucide-react";

export function Calendar() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <CalendarIcon className="text-emerald-600" size={32} />
        Vereinsaktivitäten
      </h1>
      <p className="text-gray-600 mt-2">Kalender funktioniert! 🎉</p>
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <CalendarIcon size={64} className="mx-auto text-emerald-600 mb-4" />
        <p className="text-xl text-gray-700">Kalender ist jetzt aktiv!</p>
        <p className="text-gray-500 mt-2">Version 1.19.3</p>
      </div>
    </div>
  );
}
