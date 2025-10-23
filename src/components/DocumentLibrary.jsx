import React, { useRef, useState } from 'react';
import { Upload, Plus, Search, FileText } from 'lucide-react';

export default function DocumentLibrary({ rfxDocs, companyDocs, onAdd, onSelectRFx, onUpdateRFx }) {
  const [tab, setTab] = useState('rfx');
  const [query, setQuery] = useState('');
  const fileInput = useRef(null);

  const filtered = (tab==='rfx'? rfxDocs : companyDocs).filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase()) || d.content.toLowerCase().includes(query.toLowerCase())
  );

  const handleUpload = (type, file) => {
    const reader = new FileReader();
    reader.onload = () => {
      onAdd(type, file.name.replace(/\.[^/.]+$/, ''), String(reader.result));
    };
    reader.readAsText(file);
  };

  const handlePaste = async (type) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onAdd(type, `Pasted ${new Date().toLocaleString()}`, text);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Document Library</h1>
          <p className="text-neutral-600">Manage RFx documents and company assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fileInput.current?.click()} className="inline-flex items-center gap-2 bg-neutral-900 text-white px-3 py-2 rounded-md">
            <Upload size={16}/> Upload
          </button>
          <input ref={fileInput} type="file" accept=".txt,.md,.rtf,.json" className="hidden" onChange={(e)=>{
            const f = e.target.files?.[0]; if (!f) return; handleUpload(tab, f);
          }} />
          <button onClick={() => handlePaste(tab)} className="inline-flex items-center gap-2 border px-3 py-2 rounded-md">
            <Plus size={16}/> Paste Text
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-white">
        <Search size={16} className="text-neutral-500"/>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search documents..." className="w-full outline-none"/>
      </div>

      <div className="flex gap-2">
        <button onClick={()=>setTab('rfx')} className={`px-3 py-1.5 rounded-md text-sm ${tab==='rfx'?'bg-neutral-900 text-white':'bg-neutral-200'}`}>RFx</button>
        <button onClick={()=>setTab('company')} className={`px-3 py-1.5 rounded-md text-sm ${tab==='company'?'bg-neutral-900 text-white':'bg-neutral-200'}`}>Company</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="text-neutral-600">No documents. Upload or paste to get started.</div>
        )}
        {filtered.map(doc => (
          <div key={doc.id} className="border rounded-lg bg-white overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center gap-2">
              <FileText size={16}/>
              <div className="font-medium truncate">{doc.name}</div>
            </div>
            <div className="p-4 text-sm text-neutral-700 line-clamp-4 whitespace-pre-wrap min-h-[96px]">{doc.content.slice(0, 400)}</div>
            <div className="p-4 border-t flex items-center gap-2 justify-between">
              {doc.type === 'rfx' ? (
                <button onClick={()=>onSelectRFx(doc.id)} className="text-sm bg-neutral-900 text-white px-3 py-1.5 rounded-md">Select RFx</button>
              ) : (
                <button onClick={()=>navigator.clipboard.writeText(doc.content)} className="text-sm border px-3 py-1.5 rounded-md">Copy</button>
              )}
              {doc.type === 'rfx' && (
                <button onClick={()=>{
                  const name = prompt('Rename document', doc.name);
                  if (name) onUpdateRFx(doc.id, { name });
                }} className="text-sm text-neutral-600 hover:text-neutral-900">Rename</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
