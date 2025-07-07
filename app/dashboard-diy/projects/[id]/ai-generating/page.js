"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import Link from 'next/link';

export default function ProjectAIGeneratingPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;
  const [status, setStatus] = useState('AI maakt jouw stappenplan en materialenlijst...');
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    const generateAI = async () => {
      setStatus('AI analyseert je project...');
      // 1. Haal project op
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('id, name, description, image_urls')
        .eq('id', projectId)
        .single();
      if (fetchError || !project) {
        setError('Project niet gevonden.');
        return;
      }
      setStatus('AI genereert een stappenplan...');
      // 2. Roep de API route aan
      const res = await fetch('/api/ai-project-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: project.name,
          description: project.description,
          image_urls: project.image_urls || []
        })
      });
      if (!res.ok) {
        const err = await res.json();
        setError('AI fout: ' + (err.error || 'Onbekend'));
        return;
      }
      const ai = await res.json();
      setStatus('AI resultaat wordt opgeslagen...');
      // 3. Sla het AI-resultaat op in Supabase
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          ai_steps: ai.steps,
          ai_materials: ai.materials,
          ai_time_estimate: ai.time_estimate
        })
        .eq('id', projectId);
      if (updateError) {
        setError('Fout bij opslaan AI-resultaat. Probeer opnieuw.');
        return;
      }
      // 4. Redirect naar project detailpagina
      router.push(`/dashboard-diy/projects/${projectId}`);
    };
    generateAI();
  }, [projectId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center">
        <span className="loading loading-spinner loading-lg mb-6"></span>
        <h2 className="text-xl font-bold mb-2">AI Project Wizard</h2>
        <p className="text-gray-600 mb-4 text-center">{status}</p>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <Link href="/dashboard-diy/projects" className="link link-primary mt-2">Terug naar projecten</Link>
      </div>
    </div>
  );
} 