import React, { useEffect, useMemo, useState } from 'react';
import { Bot, Play, FileText, Sparkles } from 'lucide-react';

export default function RFxAnalyzer({ rfx, analysis, onAnalyze, onGenerateDraft }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setText(rfx?.content || '');
  }, [rfx]);

  const hasAnalysis = !!analysis;

  const handleAnalyze = async () => {
    setBusy(true);
    try {
      const res = await onAnalyze(text);
      return res;
    } finally {
      setBusy(false);
    }
  };

  const handleDraft = async () => {
    const res = hasAnalysis ? analysis : await handleAnalyze();
    if (res) onGenerateDraft(res);
  };

  const info = useMemo(() => {
    if (!analysis) return null;
    return {
      keywords: analysis.keywords || [],
      goals: analysis.goals || [],
      dueDate: analysis.dueDate || null,
      budget: analysis.budget || null,
      eval: analysis.evaluation || [],
      musts: analysis.mandatoryRequirements || [],
    };
  }, [analysis]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h1 className="text-2xl font-semibold">RFx Analyzer</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleAnalyze} disabled={busy || !text} className="inline-flex items-center gap-2 border px-3 py-2 rounded-md disabled:opacity-50">
            <Play size={16}/> Analyze
          </button>
          <button onClick={handleDraft} disabled={!text} className="inline-flex items-center gap-2 bg-neutral-900 text-white px-3 py-2 rounded-md disabled:opacity-50">
            <Sparkles size={16}/> Generate Draft
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-neutral-600"><FileText size={16}/> RFx Document</div>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Paste RFx text here or select from Library" className="w-full h-[420px] border rounded-md p-3 bg-white whitespace-pre-wrap"/>
        </div>
        <div className="space-y-3">
          <div className="text-sm text-neutral-600">Analysis</div>
          {!info && (
            <div className="border rounded-md bg-white p-4 text-neutral-600">Run Analyze to extract goals, requirements, and criteria.</div>
          )}
          {info && (
            <div className="space-y-4">
              <Card title="Goals" items={info.goals} />
              <div className="grid grid-cols-2 gap-3">
                <Card title="Due Date" items={[info.dueDate || 'Not detected']} />
                <Card title="Budget" items={[info.budget || 'Not detected']} />
              </div>
              <Card title="Top Keywords" items={info.keywords} />
              <Card title="Mandatory Requirements" items={info.musts} />
              <Card title="Evaluation Criteria" items={info.eval} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, items }) {
  return (
    <div className="border rounded-md bg-white p-4">
      <div className="font-medium mb-2">{title}</div>
      <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-700">
        {(items || []).length ? items.map((i, idx) => (
          <li key={idx} className="whitespace-pre-wrap">{i}</li>
        )) : <div className="text-neutral-500">None</div>}
      </ul>
    </div>
  );
}
