"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import Link from 'next/link';

const NAV = [
  { icon: '🏠', label: 'Overzicht', href: '/dashboard-diy' },
  { icon: '📁', label: 'Mijn Projecten', href: '/dashboard-diy/projects' },
  { icon: '📦', label: 'Materialen', href: '/dashboard-diy/materials' },
  { icon: '🧱', label: 'Stappenplan', href: '/dashboard-diy/steps' },
  { icon: '🛠️', label: 'Tools & Checklists', href: '/dashboard-diy/tools' },
  { icon: '🤖', label: 'AI Assistent', href: '/dashboard-diy/ai' },
  { icon: '⚙️', label: 'Profiel Instellingen', href: '/dashboard-diy/profile' },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [edit, setEdit] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!projectId) return;
    const fetchProject = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      if (error) {
        setError('Project niet gevonden.');
        setLoading(false);
        return;
      }
      setProject(data);
      setEditData({
        name: data.name,
        description: data.description,
        ai_steps: Array.isArray(data.ai_steps) ? [...data.ai_steps] : [],
        ai_materials: Array.isArray(data.ai_materials) ? [...data.ai_materials] : [],
        ai_time_estimate: data.ai_time_estimate || '',
        notes: data.notes || ''
      });
      setCheckedSteps(Array.isArray(data.ai_steps) ? new Array(data.ai_steps.length).fill(false) : []);
      setLoading(false);
    };
    fetchProject();
  }, [projectId]);

  const handleCheckStep = (idx) => {
    setCheckedSteps(prev => prev.map((v, i) => i === idx ? !v : v));
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (idx, value) => {
    setEditData(prev => {
      const steps = [...prev.ai_steps];
      steps[idx] = value;
      return { ...prev, ai_steps: steps };
    });
  };

  const handleMaterialChange = (idx, value) => {
    setEditData(prev => {
      const mats = [...prev.ai_materials];
      mats[idx] = value;
      return { ...prev, ai_materials: mats };
    });
  };

  const handleAddStep = () => {
    setEditData(prev => ({ ...prev, ai_steps: [...(prev.ai_steps || []), ''] }));
  };
  const handleRemoveStep = (idx) => {
    setEditData(prev => {
      const steps = [...prev.ai_steps];
      steps.splice(idx, 1);
      return { ...prev, ai_steps: steps };
    });
  };
  const handleAddMaterial = () => {
    setEditData(prev => ({ ...prev, ai_materials: [...(prev.ai_materials || []), ''] }));
  };
  const handleRemoveMaterial = (idx) => {
    setEditData(prev => {
      const mats = [...prev.ai_materials];
      mats.splice(idx, 1);
      return { ...prev, ai_materials: mats };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    const { name, description, ai_steps, ai_materials, ai_time_estimate, notes } = editData;
    const { error } = await supabase
      .from('projects')
      .update({ name, description, ai_steps, ai_materials, ai_time_estimate, notes })
      .eq('id', projectId);
    setSaving(false);
    if (error) {
      setSaveMsg('Fout bij opslaan. Probeer opnieuw.');
    } else {
      setSaveMsg('Project opgeslagen!');
      setEdit(false);
      setProject(prev => ({ ...prev, ...editData }));
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatLoading(true);
    const newHistory = [...chatHistory, { role: 'user', content: chatInput }];
    setChatHistory(newHistory);
    setChatInput("");
    try {
      const res = await fetch('/api/ai-project-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: {
            name: project.name,
            description: project.description,
            ai_steps: project.ai_steps,
            ai_materials: project.ai_materials,
            ai_time_estimate: project.ai_time_estimate,
            notes: project.notes
          },
          history: newHistory,
          prompt: chatInput
        })
      });
      const data = await res.json();
      if (data.answer) {
        setChatHistory(h => [...h, { role: 'assistant', content: data.answer }]);
      } else {
        setChatHistory(h => [...h, { role: 'assistant', content: 'Sorry, er ging iets mis met de AI.' }]);
      }
    } catch (err) {
      setChatHistory(h => [...h, { role: 'assistant', content: 'Sorry, er ging iets mis met de AI.' }]);
    }
    setChatLoading(false);
    setTimeout(() => {
      if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center">
          <div className="text-red-600 mb-2">{error || 'Project niet gevonden.'}</div>
          <Link href="/dashboard-diy/projects" className="link link-primary mt-2">Terug naar projecten</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:flex-col w-56 bg-white border-r border-gray-100 py-6 px-2 min-h-screen">
        <div className="mb-8 text-2xl font-bold text-black px-4">🛠️ Fixio</div>
        <nav className="flex-1 space-y-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition">
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Drawer (mobile) */}
      <div className="md:hidden">
        <input id="drawer-toggle" type="checkbox" className="drawer-toggle" checked={drawerOpen} onChange={() => setDrawerOpen(!drawerOpen)} />
        <div className="drawer-content flex flex-col">
          <div className="navbar bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between">
            <button onClick={() => setDrawerOpen(true)} className="btn btn-ghost btn-circle text-2xl">☰</button>
            <span className="font-bold text-lg">🛠️ Fixio</span>
          </div>
        </div>
        <div className={`drawer-side z-40 ${drawerOpen ? 'block' : 'hidden'}`}>
          <label htmlFor="drawer-toggle" className="drawer-overlay" onClick={() => setDrawerOpen(false)}></label>
          <aside className="menu p-4 w-64 min-h-full bg-white border-r border-gray-100">
            <div className="mb-8 text-2xl font-bold text-black">🛠️ Fixio</div>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition" onClick={() => setDrawerOpen(false)}>
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </aside>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center py-8 px-2">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center gap-4 mb-6">
            {Array.isArray(project.image_urls) && project.image_urls.length > 0 && (
              <div className="flex -space-x-3">
                {project.image_urls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`project-img-${idx}`}
                    className="w-14 h-14 rounded-full border-2 border-white shadow object-cover"
                    style={{ zIndex: 10 - idx }}
                  />
                ))}
              </div>
            )}
            <div className="flex-1">
              {edit ? (
                <input
                  className="input input-bordered text-2xl font-bold mb-1 w-full"
                  value={editData.name}
                  onChange={e => handleEditChange('name', e.target.value)}
                  disabled={saving}
                />
              ) : (
                <h1 className="text-2xl font-bold mb-1">{project.name}</h1>
              )}
              {edit ? (
                <textarea
                  className="textarea textarea-bordered text-gray-700 text-sm w-full"
                  value={editData.description}
                  onChange={e => handleEditChange('description', e.target.value)}
                  rows={2}
                  disabled={saving}
                />
              ) : (
                <p className="text-gray-500 text-sm">{project.description}</p>
              )}
            </div>
            <div>
              {edit ? (
                <button className="btn btn-success btn-sm mr-2" onClick={handleSave} disabled={saving}>
                  {saving ? 'Opslaan...' : 'Opslaan'}
                </button>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => setEdit(true)}>
                  Bewerk project
                </button>
              )}
            </div>
          </div>
          {saveMsg && <div className="mb-4 text-green-600">{saveMsg}</div>}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-lg">Stappenplan</span>
              {(!project.ai_steps || project.ai_steps.length === 0) && <span className="badge badge-warning">AI niet voltooid</span>}
              {edit && <button className="btn btn-xs btn-outline ml-2" onClick={handleAddStep}>+ Stap</button>}
            </div>
            {Array.isArray(edit ? editData.ai_steps : project.ai_steps) && (edit ? editData.ai_steps : project.ai_steps).length > 0 ? (
              <ul className="space-y-2">
                {(edit ? editData.ai_steps : project.ai_steps).map((step, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    {edit ? (
                      <>
                        <input
                          className="input input-bordered input-xs flex-1"
                          value={step}
                          onChange={e => handleStepChange(idx, e.target.value)}
                          disabled={saving}
                        />
                        <button className="btn btn-xs btn-error" onClick={() => handleRemoveStep(idx)} disabled={saving}>✕</button>
                      </>
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={checkedSteps[idx] || false}
                          onChange={() => handleCheckStep(idx)}
                        />
                        <span className={checkedSteps[idx] ? 'line-through text-gray-400' : ''}>{step}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 italic">Nog geen stappenplan beschikbaar.</div>
            )}
          </div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-lg">Benodigdheden</span>
              {edit && <button className="btn btn-xs btn-outline ml-2" onClick={handleAddMaterial}>+ Materiaal</button>}
            </div>
            {Array.isArray(edit ? editData.ai_materials : project.ai_materials) && (edit ? editData.ai_materials : project.ai_materials).length > 0 ? (
              <ul className="list-disc list-inside text-gray-700">
                {(edit ? editData.ai_materials : project.ai_materials).map((mat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    {edit ? (
                      <>
                        <input
                          className="input input-bordered input-xs flex-1"
                          value={mat}
                          onChange={e => handleMaterialChange(idx, e.target.value)}
                          disabled={saving}
                        />
                        <button className="btn btn-xs btn-error" onClick={() => handleRemoveMaterial(idx)} disabled={saving}>✕</button>
                      </>
                    ) : (
                      <span>{mat}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 italic">Nog geen materialenlijst beschikbaar.</div>
            )}
          </div>
          <div className="mb-6">
            <div className="font-semibold text-lg mb-2">Tijdsindicatie</div>
            {edit ? (
              <input
                className="input input-bordered w-full"
                value={editData.ai_time_estimate}
                onChange={e => handleEditChange('ai_time_estimate', e.target.value)}
                disabled={saving}
              />
            ) : project.ai_time_estimate ? (
              <div className="text-gray-700">{project.ai_time_estimate}</div>
            ) : (
              <div className="text-gray-400 italic">Nog geen tijdsindicatie beschikbaar.</div>
            )}
          </div>
          <div className="mb-6">
            <div className="font-semibold text-lg mb-2">Extra notities</div>
            {edit ? (
              <textarea
                className="textarea textarea-bordered w-full"
                value={editData.notes}
                onChange={e => handleEditChange('notes', e.target.value)}
                rows={2}
                disabled={saving}
              />
            ) : (
              <div className="text-gray-700 min-h-[32px]">{project.notes || <span className="text-gray-400 italic">Nog geen notities toegevoegd.</span>}</div>
            )}
          </div>
          {/* AI-chatbot */}
          <div className="mb-8">
            <div className="font-semibold text-lg mb-2">AI Assistent voor dit project</div>
            <div className="bg-gray-100 rounded-lg p-4 max-h-72 overflow-y-auto flex flex-col gap-2 mb-2" style={{ minHeight: 120 }}>
              {chatHistory.length === 0 && (
                <div className="text-gray-500 italic">Stel een vraag over dit project aan de AI...</div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                  <span className={msg.role === 'user' ? 'inline-block bg-blue-100 text-blue-800 rounded-lg px-3 py-1 my-1' : 'inline-block bg-white text-gray-800 rounded-lg px-3 py-1 my-1 border'}>
                    {msg.content}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form className="flex gap-2" onSubmit={handleSendChat}>
              <input
                className="input input-bordered flex-1"
                placeholder="Stel een vraag over dit project..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={chatLoading}
              />
              <button className="btn btn-primary" type="submit" disabled={chatLoading || !chatInput.trim()}>
                {chatLoading ? <span className="loading loading-spinner loading-xs"></span> : 'Verstuur'}
              </button>
            </form>
          </div>
          <div className="flex justify-end">
            <Link href="/dashboard-diy/projects" className="btn btn-outline">Terug naar projecten</Link>
          </div>
        </div>
      </main>
    </div>
  );
} 