"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { supabase } from '../../../../lib/supabase';

const NAV = [
  { icon: '🏠', label: 'Overzicht', href: '/dashboard-diy' },
  { icon: '📁', label: 'Mijn Projecten', href: '/dashboard-diy/projects' },
  { icon: '📦', label: 'Materialen', href: '/dashboard-diy/materials' },
  { icon: '🧱', label: 'Stappenplan', href: '/dashboard-diy/steps' },
  { icon: '🛠️', label: 'Tools & Checklists', href: '/dashboard-diy/tools' },
  { icon: '🤖', label: 'AI Assistent', href: '/dashboard-diy/ai' },
  { icon: '⚙️', label: 'Profiel Instellingen', href: '/dashboard-diy/profile' },
];

export default function NewProjectPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    estimatedDuration: ""
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError("");
    if (!user) {
      setError('Je bent niet ingelogd. Probeer opnieuw in te loggen.');
      return;
    }
    if (!newProject.name.trim()) {
      setError('Projectnaam is verplicht.');
      return;
    }
    try {
      setCreating(true);

      // 1. Upload alle afbeeldingen naar Supabase Storage
      let uploadedUrls = [];
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}_${i}.${fileExt}`;
        let { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, file);

        if (uploadError) {
          setError('Fout bij uploaden van afbeelding: ' + file.name);
          setCreating(false);
          return;
        }

        // Maak een publieke URL aan (of gebruik getPublicUrl als je bucket public is)
        const { data } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }

      // 2. Sla het project op met de image_urls array
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          user_id: user.id,
          name: newProject.name.trim(),
          description: newProject.description.trim(),
          estimated_duration: newProject.estimatedDuration.trim(),
          status: 'planning',
          progress: 0,
          next_task: 'Project starten',
          image_urls: uploadedUrls
        }])
        .select()
        .single();

      if (error) {
        setError('Er is een fout opgetreden bij het aanmaken van het project. Probeer het opnieuw.');
        setCreating(false);
        return;
      }

      router.push(`/dashboard-diy/projects/${data.id}/ai-generating`);
    } catch (err) {
      setError('Er is een fout opgetreden bij het aanmaken van het project. Probeer het opnieuw.');
    } finally {
      setCreating(false);
    }
  };

  // DaisyUI button voor file upload
  const handleFileButtonClick = (e) => {
    e.preventDefault();
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Afbeeldingen selecteren en previews tonen
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setImagePreviews(files.map(file => file.type.startsWith('image/') ? URL.createObjectURL(file) : null));
  };

  const handleRemoveImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

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
        <div className="px-4">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition w-full"
          >
            <span className="text-xl">🚪</span>
            <span>Uitloggen</span>
          </button>
        </div>
      </aside>

      {/* Drawer (mobile) */}
      <div className="md:hidden">
        <div className="navbar bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between">
          <Link href="/dashboard-diy" className="btn btn-ghost btn-circle text-2xl">🏠</Link>
          <span className="font-bold text-lg">🛠️ Fixio</span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-8 md:py-12 md:px-12">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold mb-2">
            Nieuw Project
          </h1>
          <p className="text-gray-500 mb-6">Vul hieronder de gegevens van je nieuwe project in.</p>
          {error && <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</div>}
          <form onSubmit={handleCreateProject} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Projectnaam *</label>
              <input
                type="text"
                required
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Bijv. Badkamer verbouwen"
                disabled={creating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="textarea textarea-bordered w-full"
                rows="3"
                placeholder="Beschrijf wat je gaat doen..."
                disabled={creating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto's of plattegronden toevoegen (optioneel)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Voeg hier foto's, schetsen of plattegronden toe voor extra AI-informatie. Je kunt meerdere bestanden selecteren.
              </p>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleFileButtonClick}
                disabled={creating}
                type="button"
              >
                📷 Foto's of plattegronden kiezen
              </button>
              <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
                disabled={creating}
              />
              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {images.map((file, idx) => (
                    imagePreviews[idx] ? (
                      <div key={idx} className="relative w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <img
                          src={imagePreviews[idx]}
                          alt={`upload-preview-${idx}`}
                          className="object-cover w-14 h-14 pointer-events-none"
                          style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '9999px', maxWidth: 56, maxHeight: 56 }}
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 m-1 bg-black bg-opacity-80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none"
                          onClick={() => handleRemoveImage(idx)}
                          aria-label="Verwijder afbeelding"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div key={idx} className="flex flex-col items-center justify-center w-14 h-14 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-500 relative">
                        <span className="truncate px-1 text-center">{file.name}</span>
                        <button
                          type="button"
                          className="absolute top-0 right-0 m-1 bg-black bg-opacity-80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none"
                          onClick={() => handleRemoveImage(idx)}
                          aria-label="Verwijder bestand"
                        >
                          ×
                        </button>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geschatte duur</label>
              <input
                type="text"
                value={newProject.estimatedDuration}
                onChange={(e) => setNewProject({ ...newProject, estimatedDuration: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Bijv. 2 weken"
                disabled={creating}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                className="btn btn-outline flex-1 text-center"
                tabIndex={creating ? -1 : 0}
                onClick={() => router.push('/dashboard-diy/projects')}
                disabled={creating}
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Aanmaken...
                  </>
                ) : (
                  'Project Aanmaken'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 