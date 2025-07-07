"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

const NAV = [
  { icon: '🏠', label: 'Overzicht', href: '/dashboard-diy' },
  { icon: '📁', label: 'Mijn Projecten', href: '/dashboard-diy/projects' },
  { icon: '📦', label: 'Materialen', href: '/dashboard-diy/materials' },
  { icon: '🧱', label: 'Stappenplan', href: '/dashboard-diy/steps' },
  { icon: '🛠️', label: 'Tools & Checklists', href: '/dashboard-diy/tools' },
  { icon: '🤖', label: 'AI Assistent', href: '/dashboard-diy/ai' },
  { icon: '⚙️', label: 'Profiel Instellingen', href: '/dashboard-diy/profile' },
];

export default function ProjectsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    estimatedDuration: ""
  });

  // Haal projecten op bij component mount
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        alert('Er is een fout opgetreden bij het laden van je projecten. Ververs de pagina en probeer het opnieuw.');
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Er is een fout opgetreden bij het laden van je projecten. Ververs de pagina en probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Je bent niet ingelogd. Probeer opnieuw in te loggen.');
      return;
    }

    if (!newProject.name.trim()) {
      alert('Projectnaam is verplicht.');
      return;
    }

    try {
      setCreating(true);
      
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            name: newProject.name.trim(),
            description: newProject.description.trim(),
            estimated_duration: newProject.estimatedDuration.trim(),
            status: 'planning',
            progress: 0,
            next_task: 'Project starten'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        alert('Er is een fout opgetreden bij het aanmaken van het project. Probeer het opnieuw.');
        return;
      }

      // Voeg het nieuwe project toe aan de lijst
      setProjects([data, ...projects]);
      
      // Reset form
      setNewProject({ name: "", description: "", estimatedDuration: "" });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Er is een fout opgetreden bij het aanmaken van het project. Probeer het opnieuw.');
    } finally {
      setCreating(false);
    }
  };

  const updateProjectStatus = async (projectId, newStatus) => {
    if (!user) {
      alert('Je bent niet ingelogd. Probeer opnieuw in te loggen.');
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating project status:', error);
        alert('Er is een fout opgetreden bij het bijwerken van het project. Probeer het opnieuw.');
        return;
      }

      // Update local state
      setProjects(projects.map(project => 
        project.id === projectId 
          ? { ...project, status: newStatus }
          : project
      ));
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Er is een fout opgetreden bij het bijwerken van het project. Probeer het opnieuw.');
    }
  };

  const deleteProject = async (projectId) => {
    if (!user) {
      alert('Je bent niet ingelogd. Probeer opnieuw in te loggen.');
      return;
    }

    if (!confirm('Weet je zeker dat je dit project wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting project:', error);
        alert('Er is een fout opgetreden bij het verwijderen van het project. Probeer het opnieuw.');
        return;
      }

      // Remove from local state
      setProjects(projects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Er is een fout opgetreden bij het verwijderen van het project. Probeer het opnieuw.');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: "badge-success",
      planning: "badge-warning", 
      completed: "badge-info",
      paused: "badge-error"
    };
    return badges[status] || "badge-neutral";
  };

  const getStatusText = (status) => {
    const texts = {
      active: "Actief",
      planning: "Planning",
      completed: "Voltooid",
      paused: "Gepauzeerd"
    };
    return texts[status] || "Onbekend";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('nl-NL');
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
            <button
              onClick={() => {
                handleSignOut();
                setDrawerOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition w-full"
            >
              <span className="text-xl">🚪</span>
              <span>Uitloggen</span>
            </button>
          </aside>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">📁 Mijn Projecten</h1>
                <p className="text-gray-500 mt-1">Beheer al je DIY projecten op één plek</p>
              </div>
              <Link
                href="/dashboard-diy/projects/new"
                className="btn btn-primary gap-2"
              >
                <span>➕</span>
                Nieuw Project
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-8 md:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
                <p className="text-gray-500 mt-4">Projecten laden...</p>
              </div>
            )}

            {/* Content when not loading */}
            {!loading && (
              <>
                {/* Projects Grid */}
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏗️</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Nog geen projecten</h3>
                    <p className="text-gray-500 mb-6">Start je eerste DIY project en begin met klussen!</p>
                    <Link
                      href="/dashboard-diy/projects/new"
                      className="btn btn-primary gap-2"
                    >
                      <span>➕</span>
                      Eerste Project Aanmaken
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <div key={project.id} className="card bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 mb-1">{project.name}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                            </div>
                            <div className="dropdown dropdown-end">
                              <button className="btn btn-ghost btn-sm">⚙️</button>
                              <ul className="dropdown-content menu p-2 shadow bg-white rounded-box w-52 z-50">
                                <li>
                                  <button 
                                    onClick={() => updateProjectStatus(project.id, 'active')}
                                    className={project.status === 'active' ? 'text-green-600' : ''}
                                  >
                                    🚀 Actief maken
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    onClick={() => updateProjectStatus(project.id, 'paused')}
                                    className={project.status === 'paused' ? 'text-orange-600' : ''}
                                  >
                                    ⏸️ Pauzeren
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    onClick={() => updateProjectStatus(project.id, 'completed')}
                                    className={project.status === 'completed' ? 'text-blue-600' : ''}
                                  >
                                    ✅ Voltooien
                                  </button>
                                </li>
                                <li><hr className="my-1" /></li>
                                <li>
                                  <button 
                                    onClick={() => deleteProject(project.id)}
                                    className="text-red-600"
                                  >
                                    🗑️ Verwijderen
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="mb-4">
                            <span className={`badge ${getStatusBadge(project.status)}`}>
                              {getStatusText(project.status)}
                            </span>
                          </div>

                          {/* Progress */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-600">Voortgang</span>
                              <span className="font-medium">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Project Info */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2">📅</span>
                              <span>Gestart: {formatDate(project.created_at)}</span>
                            </div>
                            {project.estimated_duration && (
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="mr-2">⏱️</span>
                                <span>Duur: {project.estimated_duration}</span>
                              </div>
                            )}
                            {project.next_task && (
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="mr-2">📋</span>
                                <span>Volgende: {project.next_task}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link 
                              href={`/dashboard-diy/projects/${project.id}`}
                              className="btn btn-primary btn-sm flex-1"
                            >
                              Bekijk Project
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Stats */}
                {projects.length > 0 && (
                  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card bg-white shadow-sm rounded-xl p-6">
                      <div className="flex items-center">
                        <div className="text-3xl mr-4">📊</div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
                          <div className="text-sm text-gray-600">Totaal projecten</div>
                        </div>
                      </div>
                    </div>
                    <div className="card bg-white shadow-sm rounded-xl p-6">
                      <div className="flex items-center">
                        <div className="text-3xl mr-4">🚀</div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {projects.filter(p => p.status === 'active').length}
                          </div>
                          <div className="text-sm text-gray-600">Actieve projecten</div>
                        </div>
                      </div>
                    </div>
                    <div className="card bg-white shadow-sm rounded-xl p-6">
                      <div className="flex items-center">
                        <div className="text-3xl mr-4">✅</div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {projects.filter(p => p.status === 'completed').length}
                          </div>
                          <div className="text-sm text-gray-600">Voltooide projecten</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 