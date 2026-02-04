/**
 * Properties Panel Component
 * 
 * Displays and allows editing of selected element properties.
 */

'use client';

import React from 'react';
import { useSmartDrawingStore } from '../store';
import { X, Trash2, Copy, Lock, Unlock, Eye, EyeOff } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

export interface PropertiesPanelProps {
  className?: string;
  onClose?: () => void;
}

interface PropertyRowProps {
  label: string;
  children: React.ReactNode;
}

// =============================================================================
// PropertyRow Component
// =============================================================================

function PropertyRow({ label, children }: PropertyRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-amber-100/70 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

// =============================================================================
// Number Input
// =============================================================================

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  className = '',
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="w-20 px-2 py-1 text-sm border border-amber-200/80 rounded focus:outline-none focus:ring-1 focus:ring-amber-400"
      />
      {unit && <span className="text-xs text-slate-500">{unit}</span>}
    </div>
  );
}

// =============================================================================
// Color Input
// =============================================================================

function ColorInput({
  value,
  onChange,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 border border-amber-200/80 rounded cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 px-2 py-1 text-sm font-mono border border-amber-200/80 rounded focus:outline-none focus:ring-1 focus:ring-amber-400"
      />
    </div>
  );
}

// =============================================================================
// Panel Sections
// =============================================================================

function WallProperties({ wall }: { wall: { id: string; start: { x: number; y: number }; end: { x: number; y: number }; thickness: number } }) {
  const { updateWall } = useSmartDrawingStore();

  const length = Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);
  const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x) * (180 / Math.PI);

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Wall Properties</h3>
      
      <PropertyRow label="Length">
        <span className="text-sm font-mono">{length.toFixed(2)} m</span>
      </PropertyRow>
      
      <PropertyRow label="Angle">
        <span className="text-sm font-mono">{angle.toFixed(1)}°</span>
      </PropertyRow>
      
      <PropertyRow label="Thickness">
        <NumberInput
          value={wall.thickness}
          onChange={(v) => updateWall(wall.id, { thickness: v })}
          min={0.05}
          max={1}
          step={0.05}
          unit="m"
        />
      </PropertyRow>
      
      <PropertyRow label="Start X">
        <NumberInput
          value={wall.start.x}
          onChange={(v) => updateWall(wall.id, { start: { ...wall.start, x: v } })}
          step={0.1}
          unit="m"
        />
      </PropertyRow>
      
      <PropertyRow label="Start Y">
        <NumberInput
          value={wall.start.y}
          onChange={(v) => updateWall(wall.id, { start: { ...wall.start, y: v } })}
          step={0.1}
          unit="m"
        />
      </PropertyRow>
      
      <PropertyRow label="End X">
        <NumberInput
          value={wall.end.x}
          onChange={(v) => updateWall(wall.id, { end: { ...wall.end, x: v } })}
          step={0.1}
          unit="m"
        />
      </PropertyRow>
      
      <PropertyRow label="End Y">
        <NumberInput
          value={wall.end.y}
          onChange={(v) => updateWall(wall.id, { end: { ...wall.end, y: v } })}
          step={0.1}
          unit="m"
        />
      </PropertyRow>
    </div>
  );
}

function RoomProperties({ room }: { room: { id: string; vertices: { x: number; y: number }[]; name?: string } }) {
  const { updateRoom } = useSmartDrawingStore();

  // Calculate area using shoelace formula
  const calculateArea = (vertices: { x: number; y: number }[]): number => {
    if (vertices.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      const vi = vertices[i];
      const vj = vertices[j];
      if (vi && vj) {
        area += vi.x * vj.y;
        area -= vj.x * vi.y;
      }
    }
    return Math.abs(area / 2);
  };

  const area = calculateArea(room.vertices);

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Room Properties</h3>
      
      <PropertyRow label="Name">
        <input
          type="text"
          value={room.name || ''}
          onChange={(e) => updateRoom(room.id, { name: e.target.value })}
          placeholder="Room name"
          className="w-32 px-2 py-1 text-sm border border-amber-200/80 rounded focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
      </PropertyRow>
      
      <PropertyRow label="Area">
        <span className="text-sm font-mono">{area.toFixed(2)} m²</span>
      </PropertyRow>
      
      <PropertyRow label="Vertices">
        <span className="text-sm font-mono">{room.vertices.length}</span>
      </PropertyRow>
    </div>
  );
}

function MultiSelectionProperties({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">Multiple Selection</h3>
      <p className="text-sm text-slate-600">{count} objects selected</p>
      
      <div className="flex gap-2 mt-4">
        <button className="flex-1 px-3 py-2 text-sm bg-amber-50 hover:bg-amber-100 rounded transition-colors">
          Group
        </button>
        <button className="flex-1 px-3 py-2 text-sm bg-amber-50 hover:bg-amber-100 rounded transition-colors">
          Align
        </button>
      </div>
    </div>
  );
}

function NoSelectionProperties() {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-slate-500">
        Select an object to view its properties
      </p>
    </div>
  );
}

// =============================================================================
// PropertiesPanel Component
// =============================================================================

export function PropertiesPanel({ className = '', onClose }: PropertiesPanelProps) {
  const { selectedIds, walls, rooms, deleteSelected } = useSmartDrawingStore();

  const selectedWalls = walls.filter((w) => selectedIds.includes(w.id));
  const selectedRooms = rooms.filter((r) => selectedIds.includes(r.id));
  const totalSelected = selectedIds.length;

  return (
    <div
      className={`
        flex flex-col w-72
        bg-[#fffaf0] border-l border-amber-200/70
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200/70">
        <h2 className="text-sm font-semibold text-slate-800">Properties</h2>
        <div className="flex items-center gap-1">
          {totalSelected > 0 && (
            <button
              onClick={deleteSelected}
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete selected"
            >
              <Trash2 size={16} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-amber-50 rounded transition-colors"
              title="Close panel"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {totalSelected === 0 && <NoSelectionProperties />}
        
        {totalSelected === 1 && selectedWalls.length === 1 && selectedWalls[0] && (
          <WallProperties wall={selectedWalls[0]} />
        )}
        
        {totalSelected === 1 && selectedRooms.length === 1 && selectedRooms[0] && (
          <RoomProperties room={selectedRooms[0]} />
        )}
        
        {totalSelected > 1 && <MultiSelectionProperties count={totalSelected} />}
      </div>
    </div>
  );
}

export default PropertiesPanel;
