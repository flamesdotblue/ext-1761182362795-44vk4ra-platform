import React from 'react';
import { FileText, BookOpen, Bot, Edit3 } from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, selectedRFx }) {
  const Item = ({ icon: Icon, label, view }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-md transition ${activeView===view? 'bg-neutral-900 text-white shadow':'hover:bg-neutral-200/60'}`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <aside className="w-64 hidden md:block border-r bg-white min-h-screen p-4">
      <div className="space-y-6">
        <div>
          <div className="text-xl font-semibold">RFx Studio</div>
          <div className="text-sm text-neutral-500">Craft tailored responses</div>
        </div>
        <div className="space-y-2">
          <Item icon={BookOpen} label="Library" view="library" />
          <Item icon={Bot} label="Analyze RFx" view="analyze" />
          <Item icon={Edit3} label="Response Editor" view="editor" />
        </div>
        <div className="pt-4 border-t">
          <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Context</div>
          <div className="text-sm {selectedRFx?'' : 'text-neutral-500'}">
            <div className="font-medium">Selected RFx</div>
            <div className="truncate text-neutral-600">{selectedRFx ? selectedRFx.name : 'None selected'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
