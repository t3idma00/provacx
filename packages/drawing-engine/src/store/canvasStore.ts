import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import type {
  CanvasStore,
  CanvasState,
  HVACComponent,
  Connection,
  Layer,
  CutLine,
  DetailArea,
  ViewType,
  ToolType,
  CanvasSettings,
  SelectionBox,
  SerializedCanvasState,
  HistoryEntry,
} from "../types";

// ============================================================================
// Initial State
// ============================================================================

const initialSettings: CanvasSettings = {
  gridSize: 50,
  snapToGrid: true,
  showGrid: true,
  showDimensions: true,
  showLabels: true,
  unit: "mm",
};

const initialViewState = {
  zoom: 1,
  panX: 0,
  panY: 0,
};

const initialState: CanvasState = {
  drawingId: null,
  projectId: null,

  components: new Map(),
  connections: new Map(),
  layers: new Map(),

  views: {
    plan: { ...initialViewState, activeView: "plan" as ViewType },
    section: { ...initialViewState, activeView: "section" as ViewType },
    end: { ...initialViewState, activeView: "end" as ViewType },
    detail: { ...initialViewState, activeView: "detail" as ViewType },
  },
  activeView: "plan",
  cutLines: [],
  detailAreas: [],
  activeCutLineId: null,
  activeDetailAreaId: null,

  selectedIds: new Set(),
  selectionBox: null,

  activeTool: "select",
  toolOptions: {},

  settings: initialSettings,

  history: [],
  historyIndex: -1,
  maxHistoryLength: 50,

  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
};

// ============================================================================
// Store Creation
// ============================================================================

export const useCanvasStore = create<CanvasStore>()(
  immer((set, get) => ({
    ...initialState,

    // ========================================================================
    // Initialization
    // ========================================================================

    initialize: (drawingId: string, projectId: string) => {
      set((state) => {
        state.drawingId = drawingId;
        state.projectId = projectId;

        // Create default layer
        const defaultLayer: Layer = {
          id: nanoid(),
          name: "Default",
          visible: true,
          locked: false,
          color: "#3b82f6",
          order: 0,
        };
        state.layers.set(defaultLayer.id, defaultLayer);
      });
    },

    loadDrawing: (data) => {
      set((state) => {
        // Load components
        state.components.clear();
        data.components.forEach((component) => {
          state.components.set(component.id, component);
        });

        // Load connections
        state.connections.clear();
        data.connections.forEach((connection) => {
          state.connections.set(connection.id, connection);
        });

        // Load layers
        state.layers.clear();
        data.layers.forEach((layer) => {
          state.layers.set(layer.id, layer);
        });

        // Load cut lines and detail areas
        state.cutLines = data.cutLines;
        state.detailAreas = data.detailAreas;

        // Reset selection and history
        state.selectedIds.clear();
        state.history = [];
        state.historyIndex = -1;
        state.isDirty = false;
      });
    },

    reset: () => {
      set(initialState);
    },

    // ========================================================================
    // Component Operations
    // ========================================================================

    addComponent: (component: HVACComponent) => {
      set((state) => {
        state.components.set(component.id, component);
        state.isDirty = true;
      });
      get().pushToHistory();
    },

    updateComponent: (id: string, updates: Partial<HVACComponent>) => {
      set((state) => {
        const component = state.components.get(id);
        if (component) {
          Object.assign(component, updates, { updatedAt: new Date() });
          state.isDirty = true;
        }
      });
    },

    deleteComponent: (id: string) => {
      set((state) => {
        state.components.delete(id);
        state.selectedIds.delete(id);

        // Delete related connections
        state.connections.forEach((connection, connId) => {
          if (connection.sourceId === id || connection.targetId === id) {
            state.connections.delete(connId);
          }
        });

        state.isDirty = true;
      });
      get().pushToHistory();
    },

    duplicateComponent: (id: string) => {
      const component = get().components.get(id);
      if (!component) return "";

      const newId = nanoid();
      const newComponent: HVACComponent = {
        ...component,
        id: newId,
        x: component.x + 50,
        y: component.y + 50,
        name: `${component.name} (copy)`,
        selected: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => {
        state.components.set(newId, newComponent);
        state.isDirty = true;
      });
      get().pushToHistory();

      return newId;
    },

    // ========================================================================
    // Connection Operations
    // ========================================================================

    addConnection: (connection: Connection) => {
      set((state) => {
        state.connections.set(connection.id, connection);
        state.isDirty = true;
      });
      get().pushToHistory();
    },

    updateConnection: (id: string, updates: Partial<Connection>) => {
      set((state) => {
        const connection = state.connections.get(id);
        if (connection) {
          Object.assign(connection, updates);
          state.isDirty = true;
        }
      });
    },

    deleteConnection: (id: string) => {
      set((state) => {
        state.connections.delete(id);
        state.isDirty = true;
      });
      get().pushToHistory();
    },

    // ========================================================================
    // Layer Operations
    // ========================================================================

    addLayer: (layer: Layer) => {
      set((state) => {
        state.layers.set(layer.id, layer);
        state.isDirty = true;
      });
    },

    updateLayer: (id: string, updates: Partial<Layer>) => {
      set((state) => {
        const layer = state.layers.get(id);
        if (layer) {
          Object.assign(layer, updates);
          state.isDirty = true;
        }
      });
    },

    deleteLayer: (id: string) => {
      set((state) => {
        // Don't delete if it's the only layer
        if (state.layers.size <= 1) return;

        state.layers.delete(id);

        // Move components on deleted layer to default layer
        const defaultLayer = Array.from(state.layers.values())[0];
        if (defaultLayer) {
          state.components.forEach((component) => {
            if (component.layerId === id) {
              component.layerId = defaultLayer.id;
            }
          });
        }

        state.isDirty = true;
      });
    },

    reorderLayers: (layerIds: string[]) => {
      set((state) => {
        layerIds.forEach((id, index) => {
          const layer = state.layers.get(id);
          if (layer) {
            layer.order = index;
          }
        });
        state.isDirty = true;
      });
    },

    // ========================================================================
    // Selection
    // ========================================================================

    select: (id: string, addToSelection = false) => {
      set((state) => {
        if (!addToSelection) {
          // Deselect all first
          state.components.forEach((component) => {
            component.selected = false;
          });
          state.selectedIds.clear();
        }

        const component = state.components.get(id);
        if (component) {
          component.selected = true;
          state.selectedIds.add(id);
        }
      });
    },

    selectMultiple: (ids: string[]) => {
      set((state) => {
        // Deselect all first
        state.components.forEach((component) => {
          component.selected = false;
        });
        state.selectedIds.clear();

        // Select specified components
        ids.forEach((id) => {
          const component = state.components.get(id);
          if (component) {
            component.selected = true;
            state.selectedIds.add(id);
          }
        });
      });
    },

    selectAll: () => {
      set((state) => {
        state.components.forEach((component) => {
          if (component.visible && !component.locked) {
            component.selected = true;
            state.selectedIds.add(component.id);
          }
        });
      });
    },

    deselectAll: () => {
      set((state) => {
        state.components.forEach((component) => {
          component.selected = false;
        });
        state.selectedIds.clear();
      });
    },

    setSelectionBox: (box: SelectionBox | null) => {
      set((state) => {
        state.selectionBox = box;
      });
    },

    // ========================================================================
    // View Operations
    // ========================================================================

    setActiveView: (view: ViewType) => {
      set((state) => {
        state.activeView = view;
      });
    },

    setZoom: (zoom: number) => {
      set((state) => {
        const clampedZoom = Math.max(0.1, Math.min(5, zoom));
        state.views[state.activeView].zoom = clampedZoom;
      });
    },

    setPan: (x: number, y: number) => {
      set((state) => {
        state.views[state.activeView].panX = x;
        state.views[state.activeView].panY = y;
      });
    },

    zoomToFit: () => {
      // This would calculate the bounding box of all components
      // and set zoom/pan to fit everything in view
      // Implementation depends on canvas dimensions
      set((state) => {
        state.views[state.activeView].zoom = 1;
        state.views[state.activeView].panX = 0;
        state.views[state.activeView].panY = 0;
      });
    },

    // ========================================================================
    // Cut Lines & Detail Areas
    // ========================================================================

    addCutLine: (cutLine: CutLine) => {
      set((state) => {
        state.cutLines.push(cutLine);
        state.isDirty = true;
      });
    },

    updateCutLine: (id: string, updates: Partial<CutLine>) => {
      set((state) => {
        const index = state.cutLines.findIndex((cl) => cl.id === id);
        if (index !== -1) {
          Object.assign(state.cutLines[index], updates);
          state.isDirty = true;
        }
      });
    },

    deleteCutLine: (id: string) => {
      set((state) => {
        state.cutLines = state.cutLines.filter((cl) => cl.id !== id);
        if (state.activeCutLineId === id) {
          state.activeCutLineId = null;
        }
        state.isDirty = true;
      });
    },

    setActiveCutLine: (id: string | null) => {
      set((state) => {
        state.activeCutLineId = id;
      });
    },

    addDetailArea: (area: DetailArea) => {
      set((state) => {
        state.detailAreas.push(area);
        state.isDirty = true;
      });
    },

    updateDetailArea: (id: string, updates: Partial<DetailArea>) => {
      set((state) => {
        const index = state.detailAreas.findIndex((da) => da.id === id);
        if (index !== -1) {
          Object.assign(state.detailAreas[index], updates);
          state.isDirty = true;
        }
      });
    },

    deleteDetailArea: (id: string) => {
      set((state) => {
        state.detailAreas = state.detailAreas.filter((da) => da.id !== id);
        if (state.activeDetailAreaId === id) {
          state.activeDetailAreaId = null;
        }
        state.isDirty = true;
      });
    },

    setActiveDetailArea: (id: string | null) => {
      set((state) => {
        state.activeDetailAreaId = id;
      });
    },

    // ========================================================================
    // Tools
    // ========================================================================

    setActiveTool: (tool: ToolType) => {
      set((state) => {
        state.activeTool = tool;
        state.toolOptions = {};
      });
    },

    setToolOptions: (options: Record<string, unknown>) => {
      set((state) => {
        state.toolOptions = { ...state.toolOptions, ...options };
      });
    },

    // ========================================================================
    // Settings
    // ========================================================================

    updateSettings: (settings: Partial<CanvasSettings>) => {
      set((state) => {
        Object.assign(state.settings, settings);
      });
    },

    // ========================================================================
    // History (Undo/Redo)
    // ========================================================================

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex <= 0) return;

      const previousEntry = history[historyIndex - 1];
      if (!previousEntry) return;

      set((state) => {
        state.historyIndex--;

        // Restore components
        state.components.clear();
        previousEntry.components.forEach((component) => {
          state.components.set(component.id, { ...component });
        });

        // Restore connections
        state.connections.clear();
        previousEntry.connections.forEach((connection) => {
          state.connections.set(connection.id, { ...connection });
        });

        state.isDirty = true;
      });
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex >= history.length - 1) return;

      const nextEntry = history[historyIndex + 1];
      if (!nextEntry) return;

      set((state) => {
        state.historyIndex++;

        // Restore components
        state.components.clear();
        nextEntry.components.forEach((component) => {
          state.components.set(component.id, { ...component });
        });

        // Restore connections
        state.connections.clear();
        nextEntry.connections.forEach((connection) => {
          state.connections.set(connection.id, { ...connection });
        });

        state.isDirty = true;
      });
    },

    pushToHistory: () => {
      const { components, connections, history, historyIndex, maxHistoryLength } =
        get();

      const entry: HistoryEntry = {
        id: nanoid(),
        timestamp: new Date(),
        action: "update",
        components: Array.from(components.values()).map((c) => ({ ...c })),
        connections: Array.from(connections.values()).map((c) => ({ ...c })),
      };

      set((state) => {
        // Remove any future history if we're not at the end
        state.history = state.history.slice(0, state.historyIndex + 1);

        // Add new entry
        state.history.push(entry);

        // Trim history if too long
        if (state.history.length > maxHistoryLength) {
          state.history = state.history.slice(
            state.history.length - maxHistoryLength
          );
        }

        state.historyIndex = state.history.length - 1;
      });
    },

    // ========================================================================
    // Persistence
    // ========================================================================

    markDirty: () => {
      set((state) => {
        state.isDirty = true;
      });
    },

    markSaved: () => {
      set((state) => {
        state.isDirty = false;
        state.isSaving = false;
        state.lastSavedAt = new Date();
      });
    },

    getSerializedState: (): SerializedCanvasState => {
      const state = get();
      return {
        components: Array.from(state.components.values()),
        connections: Array.from(state.connections.values()),
        layers: Array.from(state.layers.values()),
        cutLines: state.cutLines,
        detailAreas: state.detailAreas,
        settings: state.settings,
      };
    },
  }))
);

// ============================================================================
// Selector Hooks
// ============================================================================

export const useActiveView = () => useCanvasStore((state) => state.activeView);
export const useActiveTool = () => useCanvasStore((state) => state.activeTool);
export const useSettings = () => useCanvasStore((state) => state.settings);
export const useSelectedIds = () => useCanvasStore((state) => state.selectedIds);
export const useIsDirty = () => useCanvasStore((state) => state.isDirty);

export const useComponents = () =>
  useCanvasStore((state) => Array.from(state.components.values()));

export const useConnections = () =>
  useCanvasStore((state) => Array.from(state.connections.values()));

export const useLayers = () =>
  useCanvasStore((state) =>
    Array.from(state.layers.values()).sort((a, b) => a.order - b.order)
  );

export const useCurrentViewState = () =>
  useCanvasStore((state) => state.views[state.activeView]);

export const useCutLines = () => useCanvasStore((state) => state.cutLines);
export const useDetailAreas = () => useCanvasStore((state) => state.detailAreas);
