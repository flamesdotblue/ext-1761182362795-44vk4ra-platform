import React, { useMemo, useState } from 'react';
import { Save, History, Users, Wand2, Clipboard } from 'lucide-react';

export default function ResponseEditor({ rfx, analysis, content, onChange, versions, onSaveVersion, onRestoreVersion, companyDocs, onSmartInsert }) {
  const [label, setLabel] = useState('');

  const collaborators = useMemo(() => [
    { id:'1', name:'Alex', color:'#f97316' },
    { id:'2', name:'Jordan', color:'#10b981' },
  ], []);

  const insert = (text) => {
    onChange((content ? content + '\n\n' : '') + text);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Response Editor</h1>
          <p className="text-neutral-600">Rich text editor with versions and collaboration hints.</p>
        </div>
        <div className="flex -space-x-2 items-center">
          {collaborators.map(c => (
            <div key={c.id} title={c.name} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: c.color }}>
              {c.name[0]}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <Toolbar onSmartInsert={onSmartInsert} onPaste={() => navigator.clipboard.readText().then(t=>insert(t))} />
          <textarea value={content} onChange={e=>onChange(e.target.value)} placeholder="Start crafting your tailored response..." className="w-full h-[480px] border rounded-md p-4 bg-white whitespace-pre-wrap"/>
          <div className="flex items-center gap-2">
            <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Version label (optional)" className="border rounded-md px-3 py-2 bg-white"/>
            <button onClick={()=>onSaveVersion(label)} className="inline-flex items-center gap-2 bg-neutral-900 text-white px-3 py-2 rounded-md">
              <Save size={16}/> Save Version
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="border rounded-md bg-white p-4">
            <div className="font-medium mb-2 flex items-center gap-2"><History size={16}/> Version History</div>
            <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
              {versions.length === 0 && <div className="text-sm text-neutral-600">No versions yet. Save your progress.</div>}
              {versions.map(v => (
                <div key={v.id} className="border rounded-md p-3">
                  <div className="text-sm font-medium">{v.label}</div>
                  <div className="text-xs text-neutral-500">{new Date(v.createdAt).toLocaleString()}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={()=>onRestoreVersion(v.id)} className="text-xs border px-2 py-1 rounded">Restore</button>
                    <button onClick={()=>navigator.clipboard.writeText(v.content)} className="text-xs border px-2 py-1 rounded">Copy</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ContextCard rfx={rfx} analysis={analysis} companyDocs={companyDocs} />
        </div>
      </div>
    </div>
  );
}

function Toolbar({ onSmartInsert, onPaste }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border rounded-md p-2 bg-white">
      <button onClick={() => onSmartInsert('executive')} className="inline-flex items-center gap-2 border px-3 py-1.5 rounded">
        <Wand2 size={16}/> Executive Summary
      </button>
      <button onClick={() => onSmartInsert('compliance')} className="inline-flex items-center gap-2 border px-3 py-1.5 rounded">
        <Wand2 size={16}/> Compliance Matrix
      </button>
      <button onClick={() => onSmartInsert('qualifications')} className="inline-flex items-center gap-2 border px-3 py-1.5 rounded">
        <Wand2 size={16}/> Qualifications
      </button>
      <button onClick={onPaste} className="inline-flex items-center gap-2 border px-3 py-1.5 rounded">
        <Clipboard size={16}/> Paste
      </button>
    </div>
  );
}

function ContextCard({ rfx, analysis, companyDocs }) {
  return (
    <div className="border rounded-md bg-white p-4 space-y-3">
      <div className="font-medium">Context</div>
      {!rfx && <div className="text-sm text-neutral-600">Select an RFx from the Library to enable deeper context.</div>}
      {rfx && (
        <div className="space-y-2 text-sm">
          <div>
            <div className="text-neutral-500">RFx</div>
            <div className="font-medium">{rfx.name}</div>
          </div>
          <div>
            <div className="text-neutral-500">Top Keywords</div>
            <div>{(analysis?.keywords||[]).slice(0,8).join(', ') || '—'}</div>
          </div>
          <div>
            <div className="text-neutral-500">Suggested References</div>
            <ul className="list-disc pl-5">
              {(analysis?.suggestedCompanyReferences||[]).map(r=> (
                <li key={r.id}>{companyDocs.find(d=>d.id===r.id)?.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="text-xs text-neutral-500">Edits auto-save when you save a version. Collaboration avatars indicate active teammates.</div>
    </div>
  );
}
