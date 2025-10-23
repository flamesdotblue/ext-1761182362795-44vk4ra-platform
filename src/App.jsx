import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import DocumentLibrary from './components/DocumentLibrary';
import RFxAnalyzer from './components/RFxAnalyzer';
import ResponseEditor from './components/ResponseEditor';

function App() {
  const [rfxDocs, setRfxDocs] = useState(() => {
    const saved = localStorage.getItem('rfxDocs');
    return saved ? JSON.parse(saved) : [];
  });
  const [companyDocs, setCompanyDocs] = useState(() => {
    const saved = localStorage.getItem('companyDocs');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedRFxId, setSelectedRFxId] = useState(null);
  const [analysis, setAnalysis] = useState(() => {
    const saved = localStorage.getItem('analysis');
    return saved ? JSON.parse(saved) : {};
  });
  const [responseContent, setResponseContent] = useState('');
  const [versions, setVersions] = useState(() => {
    const saved = localStorage.getItem('versions');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeView, setActiveView] = useState('analyze'); // analyze | editor | library

  const selectedRFx = useMemo(() => rfxDocs.find(d => d.id === selectedRFxId) || null, [rfxDocs, selectedRFxId]);

  useEffect(() => {
    localStorage.setItem('rfxDocs', JSON.stringify(rfxDocs));
  }, [rfxDocs]);
  useEffect(() => {
    localStorage.setItem('companyDocs', JSON.stringify(companyDocs));
  }, [companyDocs]);
  useEffect(() => {
    localStorage.setItem('analysis', JSON.stringify(analysis));
  }, [analysis]);
  useEffect(() => {
    localStorage.setItem('versions', JSON.stringify(versions));
  }, [versions]);

  const addDocument = (type, name, content) => {
    const doc = { id: `${type}-${Date.now()}`, name, content, createdAt: new Date().toISOString(), type };
    if (type === 'rfx') setRfxDocs(prev => [doc, ...prev]);
    if (type === 'company') setCompanyDocs(prev => [doc, ...prev]);
  };

  const updateRFx = (id, updates) => {
    setRfxDocs(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
  };

  const analyzeRFx = (rfxText) => {
    const summary = basicRFxAnalysis(rfxText, companyDocs);
    setAnalysis(prev => ({ ...prev, [selectedRFxId]: summary }));
    return summary;
  };

  const generateDraft = (rfxSummary) => {
    const draft = craftDraftResponse(rfxSummary, companyDocs);
    setResponseContent(draft);
    return draft;
  };

  const saveVersion = (label) => {
    const id = `${selectedRFxId || 'draft'}-${Date.now()}`;
    const version = { id, label: label || `Version ${versions.length + 1}`, content: responseContent, createdAt: new Date().toISOString() };
    setVersions(prev => [version, ...prev]);
  };

  const restoreVersion = (id) => {
    const v = versions.find(x => x.id === id);
    if (v) setResponseContent(v.content);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="flex">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          selectedRFx={selectedRFx}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          {activeView === 'library' && (
            <DocumentLibrary
              rfxDocs={rfxDocs}
              companyDocs={companyDocs}
              onAdd={(type, name, content) => addDocument(type, name, content)}
              onSelectRFx={(id) => { setSelectedRFxId(id); setActiveView('analyze'); }}
              onUpdateRFx={updateRFx}
            />
          )}

          {activeView === 'analyze' && (
            <RFxAnalyzer
              rfx={selectedRFx}
              analysis={selectedRFx ? analysis[selectedRFx.id] : null}
              onAnalyze={(text) => analyzeRFx(text)}
              onGenerateDraft={(sum) => {
                const res = generateDraft(sum);
                setActiveView('editor');
                return res;
              }}
            />
          )}

          {activeView === 'editor' && (
            <ResponseEditor
              rfx={selectedRFx}
              analysis={selectedRFx ? analysis[selectedRFx.id] : null}
              content={responseContent}
              onChange={setResponseContent}
              versions={versions}
              onSaveVersion={saveVersion}
              onRestoreVersion={restoreVersion}
              companyDocs={companyDocs}
              onSmartInsert={(kind) => {
                const snippet = smartInsert(kind, analysis[selectedRFxId], companyDocs);
                setResponseContent(prev => (prev ? prev + '\n\n' : '') + snippet);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// Simple in-browser RFx analysis
function basicRFxAnalysis(rfxText, companyDocs) {
  const text = (rfxText || '').replace(/\r/g, '');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const sections = splitSections(text);
  const keywords = extractKeywords(text);
  const dueDate = (text.match(/due\s*date[:\-\s]*([\w\s,\/\-]+)/i) || [])[1] || null;
  const budget = (text.match(/budget[:\-\s]*([\$\w\s,\.]+)/i) || [])[1] || null;
  const evaluation = findEvaluationCriteria(text);
  const references = suggestCompanyRefs(keywords, companyDocs);

  return {
    wordCount,
    sections,
    keywords,
    dueDate,
    budget,
    evaluation,
    suggestedCompanyReferences: references,
    goals: inferGoals(text, sections),
    mandatoryRequirements: findMandatoryReqs(text),
  };
}

function splitSections(text) {
  const headings = ['introduction', 'background', 'scope', 'requirements', 'deliverables', 'timeline', 'evaluation', 'submission', 'terms'];
  const sections = {};
  headings.forEach(h => {
    const regex = new RegExp(`(^|\n)\s*(?:\d+\.|\#*)?\s*${h}[\s:]*\n`, 'i');
    const match = text.match(regex);
    if (match) {
      const start = match.index + match[0].length;
      let end = text.length;
      for (const other of headings) {
        if (other === h) continue;
        const r = new RegExp(`\n\s*(?:\n|.)*?\n\s*(?:\n|.)*?`, 'i');
      }
    }
  });
  // Fallback: naive chunk by blank lines
  const chunks = text.split(/\n\s*\n/).filter(Boolean);
  chunks.forEach((c, i) => { sections[`Section ${i + 1}`] = c.trim(); });
  return sections;
}

function extractKeywords(text) {
  const tokens = text.toLowerCase().match(/[a-zA-Z][a-zA-Z\-]+/g) || [];
  const stop = new Set(['the','and','for','with','that','this','from','are','into','your','will','shall','must','should','our','their','a','an','of','to','in','on','by','or','be','as','is','it']);
  const freq = {};
  tokens.forEach(t => { if (!stop.has(t)) freq[t] = (freq[t] || 0) + 1; });
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0, 20).map(([k])=>k);
}

function findEvaluationCriteria(text) {
  const m = text.match(/evaluation\s*criteria[\s:]*([\s\S]{0,1200})/i);
  if (!m) return [];
  const body = m[1];
  const items = body.split(/\n|\d+\.|\-|\•/).map(s=>s.trim()).filter(s=>s.length>2).slice(0,8);
  return items;
}

function findMandatoryReqs(text) {
  const reqs = [];
  const musts = text.match(/(^|\n).*?(must|shall)\s+([\s\S]{0,120})/gi) || [];
  musts.forEach(line => {
    const clean = line.replace(/(^|\n)/,'').trim();
    if (clean.length > 0) reqs.push(clean);
  });
  return reqs.slice(0, 12);
}

function inferGoals(text, sections) {
  const patterns = [/objective[s]?/i, /goal[s]?/i, /purpose/i, /outcome[s]?/i];
  for (const p of patterns) {
    const m = text.match(new RegExp(`${p.source}[\s:]*([\s\S]{0,800})`, 'i'));
    if (m) {
      return m[1].split(/\n|\.|\;|\-/).map(s=>s.trim()).filter(Boolean).slice(0,6);
    }
  }
  // fallback from sections
  const first = Object.values(sections)[0] || '';
  return first.split(/\.|\n/).map(s=>s.trim()).filter(Boolean).slice(0,4);
}

function suggestCompanyRefs(keywords, companyDocs) {
  const refs = [];
  companyDocs.forEach(doc => {
    const score = (doc.content.toLowerCase().match(new RegExp(keywords.join('|'), 'g')) || []).length;
    if (score > 0) refs.push({ id: doc.id, name: doc.name, score });
  });
  return refs.sort((a,b)=>b.score-a.score).slice(0,5);
}

function craftDraftResponse(summary, companyDocs) {
  if (!summary) return '';
  const bestRefs = summary.suggestedCompanyReferences || [];
  const refText = bestRefs.map((r, i) => `${i+1}. ${companyDocs.find(d=>d.id===r.id)?.name || r.id}`).join('\n');
  return (
`Executive Summary\n\n${(summary.goals||[]).length?`We understand your goals include: \n- ${summary.goals.map(g=>g).join('\n- ')}`:'We understand your goals and desired outcomes and will align our solution accordingly.'}\n\nOur Solution\n- Tailored to your requirements and constraints\n- Built on proven methods and accelerators\n- Compliant with all mandatory requirements\n\nScope and Approach\n- We will address the following key areas: ${summary.keywords.slice(0,6).join(', ')}\n- Timeline aligned to your due date${summary.dueDate?` (${summary.dueDate.trim()})`:''}\n\nDifferentiators\n- Relevant qualifications and past performance\n- Experienced staff with similar engagements\n\nCompliance Matrix\n${(summary.mandatoryRequirements||[]).slice(0,8).map((r,i)=>`${i+1}. ${r}`).join('\n')}\n\nRelevant References\n${refText || '- Company qualifications and past performance available upon request'}\n\nValue and Pricing\n${summary.budget?`We will align to the stated budget of ${summary.budget}.`: 'We will provide a competitive, transparent pricing structure aligned to value delivered.'}\n\n`);
}

function smartInsert(kind, analysis, companyDocs) {
  switch (kind) {
    case 'compliance':
      return (analysis?.mandatoryRequirements || []).map((r,i)=>`Req ${i+1}: ${r}\nResponse: ✅ Compliant. Evidence: [Insert reference].`).join('\n\n') || 'No mandatory requirements detected.';
    case 'qualifications':
      return (analysis?.suggestedCompanyReferences || []).map((r,i)=>`Reference ${i+1}: ${companyDocs.find(d=>d.id===r.id)?.name}\nRelevance: ${r.score} keyword matches.`).join('\n\n') || 'Insert qualifications and past performance here.';
    case 'executive':
      return `We understand your objectives and will deliver outcomes aligned to your success metrics. Our approach mitigates risk, accelerates value, and ensures full compliance.`;
    default:
      return '';
  }
}

export default App;
