/**
 * Smart Drawing Page
 * 
 * HVAC CAD drawing editor for a project.
 */

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc';

// Dynamically import to avoid SSR issues with Fabric.js
const DrawingEditorWrapper = dynamic(
  () => import('@/components/editors/DrawingEditorWrapper'),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-[#f6f1e7]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">Loading drawing editor...</p>
        </div>
      </div>
    )
  }
);

export default function SmartDrawingPage() {
  const params = useParams();
  const projectId = params.id as string;

  // Fetch project data
  const { data: project, isLoading: projectLoading } = trpc.project.getById.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );

  // Fetch existing drawing data if any
  const { data: drawingData, isLoading: drawingLoading } = trpc.drawing.getById.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );

  if (projectLoading || drawingLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f6f1e7]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">Loading drawing editor...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f6f1e7]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">Project not found</h2>
          <Link href="/dashboard" className="mt-4 block text-amber-700 hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Safely parse drawing data
  const initialData = drawingData && 'data' in drawingData && typeof drawingData.data === 'string' 
    ? JSON.parse(drawingData.data) 
    : undefined;

  return (
    <DrawingEditorWrapper
      projectId={projectId}
      projectName={project.name}
      initialData={initialData}
    />
  );
}
