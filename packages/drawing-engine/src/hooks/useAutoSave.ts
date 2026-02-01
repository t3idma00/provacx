import { useEffect, useRef, useCallback } from "react";
import { useCanvasStore } from "../store/canvasStore";
import type { SerializedCanvasState } from "../types";

interface AutoSaveOptions {
  /** Save callback function */
  onSave: (data: SerializedCanvasState) => Promise<void>;
  /** Auto-save interval in milliseconds (default: 30000 = 30 seconds) */
  interval?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Debounce time for save after changes (default: 2000 = 2 seconds) */
  debounce?: number;
}

interface AutoSaveState {
  lastSavedAt: Date | null;
  isSaving: boolean;
  error: Error | null;
}

export function useAutoSave({
  onSave,
  interval = 30000,
  enabled = true,
  debounce = 2000,
}: AutoSaveOptions): AutoSaveState & { save: () => Promise<void> } {
  const isDirty = useCanvasStore((state) => state.isDirty);
  const getSerializedState = useCanvasStore((state) => state.getSerializedState);
  const markSaved = useCanvasStore((state) => state.markSaved);
  const isSaving = useCanvasStore((state) => state.isSaving);
  const lastSavedAt = useCanvasStore((state) => state.lastSavedAt);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const errorRef = useRef<Error | null>(null);

  // Manual save function
  const save = useCallback(async () => {
    if (!isDirty) return;

    try {
      const state = getSerializedState();
      await onSave(state);
      markSaved();
      errorRef.current = null;
    } catch (error) {
      errorRef.current = error as Error;
      console.error("Auto-save failed:", error);
      throw error;
    }
  }, [isDirty, getSerializedState, onSave, markSaved]);

  // Debounced save on changes
  useEffect(() => {
    if (!enabled || !isDirty) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new debounced save
    saveTimeoutRef.current = setTimeout(() => {
      save().catch(() => {
        // Error is already logged in save function
      });
    }, debounce);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [enabled, isDirty, debounce, save]);

  // Periodic save interval
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      if (isDirty) {
        save().catch(() => {
          // Error is already logged in save function
        });
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, isDirty, save]);

  // Save before unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled, isDirty]);

  return {
    save,
    lastSavedAt,
    isSaving,
    error: errorRef.current,
  };
}

export default useAutoSave;
