import type {
  ComponentType,
  DuctShape,
  ConnectionType,
  Position,
  Dimensions,
} from "@provacx/shared";

// ============================================================================
// Core Canvas Types
// ============================================================================

export type ViewType = "plan" | "section" | "end" | "detail";

export interface ViewState {
  activeView: ViewType;
  zoom: number;
  panX: number;
  panY: number;
}

export interface CanvasSettings {
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  showDimensions: boolean;
  showLabels: boolean;
  unit: "mm" | "m" | "ft" | "in";
}

// ============================================================================
// Drawing Component Types
// ============================================================================

export interface BaseComponent {
  id: string;
  type: ComponentType;
  name: string;
  // Position in all dimensions (3D-aware for multi-view)
  x: number;
  y: number;
  z: number; // Height/elevation
  elevation: number; // Height from floor
  rotation: number;
  // Layer information
  layerId: string;
  locked: boolean;
  visible: boolean;
  selected: boolean;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface DuctComponent extends BaseComponent {
  type: "DUCT";
  ductType: "rectangular" | "round" | "oval" | "flexible";
  shape: DuctShape;
  // Dimensions
  width: number;
  height: number;
  diameter?: number;
  length: number;
  // Construction
  material: string;
  gauge: number;
  jointType: string;
  seamType?: string;
  // Insulation
  hasInsulation: boolean;
  insulationType?: string;
  insulationThickness?: number;
  // Connection points
  startConnection?: string;
  endConnection?: string;
}

export interface FittingComponent extends BaseComponent {
  type: "FITTING";
  fittingType:
    | "elbow"
    | "tee"
    | "wye"
    | "reducer"
    | "transition"
    | "offset"
    | "endcap";
  // Dimensions (varies by fitting type)
  width?: number;
  height?: number;
  diameter?: number;
  angle?: number;
  radiusRatio?: number;
  // For reducers/transitions
  inletWidth?: number;
  inletHeight?: number;
  inletDiameter?: number;
  outletWidth?: number;
  outletHeight?: number;
  outletDiameter?: number;
  // Construction
  material: string;
  gauge: number;
  // Elbow specific
  turningVanes?: boolean;
  vaneCount?: number;
  // Connection points
  connections: string[];
}

export interface TerminalComponent extends BaseComponent {
  type: "TERMINAL";
  terminalType: "diffuser" | "grille" | "register";
  // Dimensions
  faceWidth: number;
  faceHeight: number;
  neckSize: number;
  // Performance
  airflow?: number;
  throwDistance?: number;
  noiseLevel?: number;
  // Configuration
  pattern?: string;
  damperType?: string;
  hasFilter?: boolean;
  filterType?: string;
  // Connection
  connectionId?: string;
}

export interface EquipmentComponent extends BaseComponent {
  type: "EQUIPMENT";
  equipmentType: "ahu" | "fcu" | "vrf_outdoor" | "vrf_indoor" | "fan" | "pump";
  model?: string;
  manufacturer?: string;
  // Capacity
  coolingCapacity?: number;
  heatingCapacity?: number;
  airflow?: number;
  staticPressure?: number;
  // Physical
  physicalWidth: number;
  physicalHeight: number;
  physicalDepth: number;
  weight?: number;
  // Electrical
  powerConsumption?: number;
  voltage?: number;
  // Connections
  supplyConnection?: string;
  returnConnection?: string;
  refrigerantConnections?: string[];
}

export interface DamperComponent extends BaseComponent {
  type: "DAMPER";
  damperType: "volume" | "fire" | "smoke" | "backdraft";
  // Dimensions
  width: number;
  height: number;
  // Configuration
  bladeType?: string;
  actuatorType?: string;
  fireRating?: string;
  leakageClass?: string;
  // Connection
  connectionId?: string;
}

export interface AccessoryComponent extends BaseComponent {
  type: "ACCESSORY";
  accessoryType: "access_door" | "flex_connector" | "test_hole" | "silencer";
  // Dimensions
  width: number;
  height: number;
  length?: number;
  // Configuration
  insulated?: boolean;
  material?: string;
  // Connection
  connectionId?: string;
}

// Union type for all components
export type HVACComponent =
  | DuctComponent
  | FittingComponent
  | TerminalComponent
  | EquipmentComponent
  | DamperComponent
  | AccessoryComponent;

// ============================================================================
// Connection Types
// ============================================================================

export interface Connection {
  id: string;
  sourceId: string;
  sourcePort: string;
  targetId: string;
  targetPort: string;
  connectionType: ConnectionType;
  // Visual properties
  points: number[];
  strokeColor: string;
  strokeWidth: number;
}

// ============================================================================
// Layer Types
// ============================================================================

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  order: number;
}

// ============================================================================
// View-Specific Types
// ============================================================================

export interface CutLine {
  id: string;
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  direction: "horizontal" | "vertical" | "angled";
  lookDirection: "left" | "right" | "up" | "down";
}

export interface DetailArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number; // e.g., 5 for 1:5 zoom
}

// ============================================================================
// Selection & Interaction Types
// ============================================================================

export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

// ============================================================================
// Tool Types
// ============================================================================

export type ToolType =
  | "select"
  | "pan"
  | "zoom"
  | "duct"
  | "elbow"
  | "tee"
  | "reducer"
  | "diffuser"
  | "grille"
  | "damper"
  | "equipment"
  | "cut_line"
  | "detail_area"
  | "dimension"
  | "text"
  | "eraser";

export interface ToolState {
  activeTool: ToolType;
  toolOptions: Record<string, unknown>;
}

// ============================================================================
// History Types (Undo/Redo)
// ============================================================================

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  components: HVACComponent[];
  connections: Connection[];
}

// ============================================================================
// Canvas Store Types
// ============================================================================

export interface CanvasState {
  // Project info
  drawingId: string | null;
  projectId: string | null;

  // Components & Connections
  components: Map<string, HVACComponent>;
  connections: Map<string, Connection>;
  layers: Map<string, Layer>;

  // View state
  views: {
    plan: ViewState;
    section: ViewState;
    end: ViewState;
    detail: ViewState;
  };
  activeView: ViewType;
  cutLines: CutLine[];
  detailAreas: DetailArea[];
  activeCutLineId: string | null;
  activeDetailAreaId: string | null;

  // Selection
  selectedIds: Set<string>;
  selectionBox: SelectionBox | null;

  // Tools
  activeTool: ToolType;
  toolOptions: Record<string, unknown>;

  // Settings
  settings: CanvasSettings;

  // History
  history: HistoryEntry[];
  historyIndex: number;
  maxHistoryLength: number;

  // Status
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
}

export interface CanvasActions {
  // Initialization
  initialize: (drawingId: string, projectId: string) => void;
  loadDrawing: (data: {
    components: HVACComponent[];
    connections: Connection[];
    layers: Layer[];
    cutLines: CutLine[];
    detailAreas: DetailArea[];
  }) => void;
  reset: () => void;

  // Component operations
  addComponent: (component: HVACComponent) => void;
  updateComponent: (id: string, updates: Partial<HVACComponent>) => void;
  deleteComponent: (id: string) => void;
  duplicateComponent: (id: string) => string;

  // Connection operations
  addConnection: (connection: Connection) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;

  // Layer operations
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  reorderLayers: (layerIds: string[]) => void;

  // Selection
  select: (id: string, addToSelection?: boolean) => void;
  selectMultiple: (ids: string[]) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setSelectionBox: (box: SelectionBox | null) => void;

  // View operations
  setActiveView: (view: ViewType) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  zoomToFit: () => void;

  // Cut lines & detail areas
  addCutLine: (cutLine: CutLine) => void;
  updateCutLine: (id: string, updates: Partial<CutLine>) => void;
  deleteCutLine: (id: string) => void;
  setActiveCutLine: (id: string | null) => void;
  addDetailArea: (area: DetailArea) => void;
  updateDetailArea: (id: string, updates: Partial<DetailArea>) => void;
  deleteDetailArea: (id: string) => void;
  setActiveDetailArea: (id: string | null) => void;

  // Tools
  setActiveTool: (tool: ToolType) => void;
  setToolOptions: (options: Record<string, unknown>) => void;

  // Settings
  updateSettings: (settings: Partial<CanvasSettings>) => void;

  // History
  undo: () => void;
  redo: () => void;
  pushToHistory: () => void;

  // Persistence
  markDirty: () => void;
  markSaved: () => void;
  getSerializedState: () => SerializedCanvasState;
}

export type CanvasStore = CanvasState & CanvasActions;

// ============================================================================
// Serialization Types (for save/load)
// ============================================================================

export interface SerializedCanvasState {
  components: HVACComponent[];
  connections: Connection[];
  layers: Layer[];
  cutLines: CutLine[];
  detailAreas: DetailArea[];
  settings: CanvasSettings;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface HVACCanvasProps {
  drawingId: string;
  projectId: string;
  onSave?: (data: SerializedCanvasState) => Promise<void>;
  onAutoSave?: (data: SerializedCanvasState) => Promise<void>;
  autoSaveInterval?: number;
  readOnly?: boolean;
}

export interface ComponentRendererProps {
  component: HVACComponent;
  isSelected: boolean;
  onSelect: (id: string, addToSelection?: boolean) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onTransformEnd: (id: string, props: Partial<HVACComponent>) => void;
}

export interface ViewRibbonProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}
