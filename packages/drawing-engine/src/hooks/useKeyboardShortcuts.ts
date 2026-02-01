import { useEffect, useCallback } from "react";
import { useCanvasStore } from "../store/canvasStore";
import type { ToolType, ViewType } from "../types";

interface KeyboardShortcutOptions {
  onSave?: () => void;
  disabled?: boolean;
}

export function useKeyboardShortcuts(options: KeyboardShortcutOptions = {}) {
  const { onSave, disabled = false } = options;

  const setActiveTool = useCanvasStore((state) => state.setActiveTool);
  const setActiveView = useCanvasStore((state) => state.setActiveView);
  const undo = useCanvasStore((state) => state.undo);
  const redo = useCanvasStore((state) => state.redo);
  const deleteComponent = useCanvasStore((state) => state.deleteComponent);
  const duplicateComponent = useCanvasStore((state) => state.duplicateComponent);
  const selectAll = useCanvasStore((state) => state.selectAll);
  const deselectAll = useCanvasStore((state) => state.deselectAll);
  const selectedIds = useCanvasStore((state) => state.selectedIds);
  const setZoom = useCanvasStore((state) => state.setZoom);
  const zoomToFit = useCanvasStore((state) => state.zoomToFit);
  const currentZoom = useCanvasStore((state) => state.views[state.activeView].zoom);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;

      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // ==============================
      // File operations
      // ==============================

      // Ctrl+S: Save
      if (ctrl && key === "s") {
        e.preventDefault();
        onSave?.();
        return;
      }

      // ==============================
      // Edit operations
      // ==============================

      // Ctrl+Z: Undo
      if (ctrl && !shift && key === "z") {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Shift+Z or Ctrl+Y: Redo
      if ((ctrl && shift && key === "z") || (ctrl && key === "y")) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl+A: Select all
      if (ctrl && key === "a") {
        e.preventDefault();
        selectAll();
        return;
      }

      // Escape: Deselect all / cancel tool
      if (key === "escape") {
        e.preventDefault();
        deselectAll();
        setActiveTool("select");
        return;
      }

      // Delete/Backspace: Delete selected
      if (key === "delete" || key === "backspace") {
        e.preventDefault();
        selectedIds.forEach((id) => deleteComponent(id));
        return;
      }

      // Ctrl+D: Duplicate selected
      if (ctrl && key === "d") {
        e.preventDefault();
        selectedIds.forEach((id) => duplicateComponent(id));
        return;
      }

      // ==============================
      // Tool shortcuts
      // ==============================

      // V: Select tool
      if (key === "v") {
        e.preventDefault();
        setActiveTool("select");
        return;
      }

      // H: Pan/Hand tool
      if (key === "h") {
        e.preventDefault();
        setActiveTool("pan");
        return;
      }

      // Z: Zoom tool
      if (key === "z" && !ctrl) {
        e.preventDefault();
        setActiveTool("zoom");
        return;
      }

      // D: Duct tool
      if (key === "d" && !ctrl) {
        e.preventDefault();
        setActiveTool("duct");
        return;
      }

      // E: Elbow tool
      if (key === "e") {
        e.preventDefault();
        setActiveTool("elbow");
        return;
      }

      // T: Tee tool
      if (key === "t") {
        e.preventDefault();
        setActiveTool("tee");
        return;
      }

      // R: Reducer tool
      if (key === "r" && !ctrl) {
        e.preventDefault();
        setActiveTool("reducer");
        return;
      }

      // X: Eraser tool
      if (key === "x") {
        e.preventDefault();
        setActiveTool("eraser");
        return;
      }

      // ==============================
      // View shortcuts
      // ==============================

      // 1: Plan view
      if (key === "1") {
        e.preventDefault();
        setActiveView("plan");
        return;
      }

      // 2: Section view
      if (key === "2") {
        e.preventDefault();
        setActiveView("section");
        return;
      }

      // 3: End elevation view
      if (key === "3") {
        e.preventDefault();
        setActiveView("end");
        return;
      }

      // 4: Detail view
      if (key === "4") {
        e.preventDefault();
        setActiveView("detail");
        return;
      }

      // ==============================
      // Zoom shortcuts
      // ==============================

      // Ctrl+0: Zoom to fit
      if (ctrl && key === "0") {
        e.preventDefault();
        zoomToFit();
        return;
      }

      // Ctrl++ / Ctrl+=: Zoom in
      if (ctrl && (key === "+" || key === "=")) {
        e.preventDefault();
        setZoom(currentZoom * 1.25);
        return;
      }

      // Ctrl+-: Zoom out
      if (ctrl && key === "-") {
        e.preventDefault();
        setZoom(currentZoom / 1.25);
        return;
      }

      // Ctrl+1: Zoom to 100%
      if (ctrl && key === "1") {
        e.preventDefault();
        setZoom(1);
        return;
      }
    },
    [
      disabled,
      onSave,
      undo,
      redo,
      selectAll,
      deselectAll,
      selectedIds,
      deleteComponent,
      duplicateComponent,
      setActiveTool,
      setActiveView,
      setZoom,
      zoomToFit,
      currentZoom,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Shortcut reference for help display
export const KEYBOARD_SHORTCUTS = [
  { category: "File", shortcuts: [{ key: "Ctrl+S", action: "Save" }] },
  {
    category: "Edit",
    shortcuts: [
      { key: "Ctrl+Z", action: "Undo" },
      { key: "Ctrl+Shift+Z", action: "Redo" },
      { key: "Ctrl+A", action: "Select All" },
      { key: "Delete", action: "Delete" },
      { key: "Ctrl+D", action: "Duplicate" },
      { key: "Escape", action: "Cancel/Deselect" },
    ],
  },
  {
    category: "Tools",
    shortcuts: [
      { key: "V", action: "Select" },
      { key: "H", action: "Pan" },
      { key: "Z", action: "Zoom" },
      { key: "D", action: "Duct" },
      { key: "E", action: "Elbow" },
      { key: "T", action: "Tee" },
      { key: "R", action: "Reducer" },
      { key: "X", action: "Eraser" },
    ],
  },
  {
    category: "Views",
    shortcuts: [
      { key: "1", action: "Plan View" },
      { key: "2", action: "Section View" },
      { key: "3", action: "End Elevation" },
      { key: "4", action: "Detail View" },
    ],
  },
  {
    category: "Zoom",
    shortcuts: [
      { key: "Ctrl+0", action: "Fit to Screen" },
      { key: "Ctrl++", action: "Zoom In" },
      { key: "Ctrl+-", action: "Zoom Out" },
      { key: "Ctrl+1", action: "Zoom 100%" },
    ],
  },
];

export default useKeyboardShortcuts;
