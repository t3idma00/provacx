import React, { useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";
import type Konva from "konva";
import {
  useCanvasStore,
  useComponents,
  useConnections,
  useCurrentViewState,
  useSettings,
  useActiveTool,
  useSelectedIds,
} from "../store/canvasStore";
import type { HVACCanvasProps, HVACComponent } from "../types";
import { Grid } from "./Grid";
import { ComponentRenderer } from "./ComponentRenderer";
import { ConnectionLine } from "./ConnectionLine";
import { SelectionBox } from "./SelectionBox";

export function HVACCanvas({
  drawingId,
  projectId,
  onSave,
  onAutoSave,
  autoSaveInterval = 30000,
  readOnly = false,
}: HVACCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Store state
  const initialize = useCanvasStore((state) => state.initialize);
  const setZoom = useCanvasStore((state) => state.setZoom);
  const setPan = useCanvasStore((state) => state.setPan);
  const select = useCanvasStore((state) => state.select);
  const selectMultiple = useCanvasStore((state) => state.selectMultiple);
  const deselectAll = useCanvasStore((state) => state.deselectAll);
  const setSelectionBox = useCanvasStore((state) => state.setSelectionBox);
  const updateComponent = useCanvasStore((state) => state.updateComponent);
  const getSerializedState = useCanvasStore((state) => state.getSerializedState);
  const markSaved = useCanvasStore((state) => state.markSaved);
  const isDirty = useCanvasStore((state) => state.isDirty);
  const selectionBox = useCanvasStore((state) => state.selectionBox);

  const components = useComponents();
  const connections = useConnections();
  const viewState = useCurrentViewState();
  const settings = useSettings();
  const activeTool = useActiveTool();
  const selectedIds = useSelectedIds();

  // Container dimensions
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 });

  // Initialize store on mount
  useEffect(() => {
    initialize(drawingId, projectId);
  }, [drawingId, projectId, initialize]);

  // Resize handler
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Auto-save
  useEffect(() => {
    if (!onAutoSave || readOnly) return;

    const interval = setInterval(() => {
      if (isDirty) {
        const state = getSerializedState();
        onAutoSave(state).then(() => markSaved());
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [onAutoSave, autoSaveInterval, isDirty, getSerializedState, markSaved, readOnly]);

  // Wheel zoom handler
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      if (readOnly) return;

      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const scaleBy = 1.1;
      const oldScale = viewState.zoom;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - viewState.panX) / oldScale,
        y: (pointer.y - viewState.panY) / oldScale,
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      setZoom(newScale);

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      setPan(newPos.x, newPos.y);
    },
    [viewState, setZoom, setPan, readOnly]
  );

  // Mouse down handler for selection box
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (readOnly) return;

      // If clicking on empty space with select tool, start selection box
      if (activeTool === "select" && e.target === e.target.getStage()) {
        const stage = stageRef.current;
        if (!stage) return;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        // Adjust for pan and zoom
        const x = (pointer.x - viewState.panX) / viewState.zoom;
        const y = (pointer.y - viewState.panY) / viewState.zoom;

        if (!e.evt.shiftKey) {
          deselectAll();
        }

        setSelectionBox({
          startX: x,
          startY: y,
          endX: x,
          endY: y,
        });
      }

      // Pan tool
      if (activeTool === "pan") {
        const stage = stageRef.current;
        if (stage) {
          stage.container().style.cursor = "grabbing";
        }
      }
    },
    [activeTool, viewState, deselectAll, setSelectionBox, readOnly]
  );

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (readOnly) return;

      const stage = stageRef.current;
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Update selection box
      if (selectionBox) {
        const x = (pointer.x - viewState.panX) / viewState.zoom;
        const y = (pointer.y - viewState.panY) / viewState.zoom;

        setSelectionBox({
          ...selectionBox,
          endX: x,
          endY: y,
        });
      }

      // Pan
      if (activeTool === "pan" && e.evt.buttons === 1) {
        const dx = e.evt.movementX;
        const dy = e.evt.movementY;
        setPan(viewState.panX + dx, viewState.panY + dy);
      }
    },
    [activeTool, selectionBox, viewState, setSelectionBox, setPan, readOnly]
  );

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    if (readOnly) return;

    // Finish selection box
    if (selectionBox) {
      // Find components within selection box
      const minX = Math.min(selectionBox.startX, selectionBox.endX);
      const maxX = Math.max(selectionBox.startX, selectionBox.endX);
      const minY = Math.min(selectionBox.startY, selectionBox.endY);
      const maxY = Math.max(selectionBox.startY, selectionBox.endY);

      const selectedComponents = components.filter((component) => {
        return (
          component.x >= minX &&
          component.x <= maxX &&
          component.y >= minY &&
          component.y <= maxY
        );
      });

      if (selectedComponents.length > 0) {
        selectMultiple(selectedComponents.map((c) => c.id));
      }

      setSelectionBox(null);
    }

    // Reset cursor for pan tool
    if (activeTool === "pan") {
      const stage = stageRef.current;
      if (stage) {
        stage.container().style.cursor = "grab";
      }
    }
  }, [activeTool, selectionBox, components, selectMultiple, setSelectionBox, readOnly]);

  // Component select handler
  const handleComponentSelect = useCallback(
    (id: string, addToSelection = false) => {
      if (readOnly) return;
      select(id, addToSelection);
    },
    [select, readOnly]
  );

  // Component drag handlers
  const handleDragStart = useCallback((id: string) => {
    // Can be used for drag preview
  }, []);

  const handleDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      if (readOnly) return;

      // Snap to grid if enabled
      let finalX = x;
      let finalY = y;

      if (settings.snapToGrid) {
        finalX = Math.round(x / settings.gridSize) * settings.gridSize;
        finalY = Math.round(y / settings.gridSize) * settings.gridSize;
      }

      updateComponent(id, { x: finalX, y: finalY });
    },
    [settings, updateComponent, readOnly]
  );

  // Transform end handler
  const handleTransformEnd = useCallback(
    (id: string, props: Partial<HVACComponent>) => {
      if (readOnly) return;
      updateComponent(id, props);
    },
    [updateComponent, readOnly]
  );

  // Get cursor based on active tool
  const getCursor = useCallback(() => {
    switch (activeTool) {
      case "select":
        return "default";
      case "pan":
        return "grab";
      case "zoom":
        return "zoom-in";
      default:
        return "crosshair";
    }
  }, [activeTool]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gray-100"
      style={{ cursor: getCursor() }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={viewState.zoom}
        scaleY={viewState.zoom}
        x={viewState.panX}
        y={viewState.panY}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Layer */}
        <Layer listening={false}>
          <Grid
            width={dimensions.width / viewState.zoom + Math.abs(viewState.panX)}
            height={dimensions.height / viewState.zoom + Math.abs(viewState.panY)}
            gridSize={settings.gridSize}
            showGrid={settings.showGrid}
            zoom={viewState.zoom}
            panX={viewState.panX}
            panY={viewState.panY}
          />
        </Layer>

        {/* Connections Layer */}
        <Layer>
          {connections.map((connection) => (
            <ConnectionLine key={connection.id} connection={connection} />
          ))}
        </Layer>

        {/* Components Layer */}
        <Layer>
          {components.map((component) => (
            <ComponentRenderer
              key={component.id}
              component={component}
              isSelected={selectedIds.has(component.id)}
              onSelect={handleComponentSelect}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
            />
          ))}
        </Layer>

        {/* Selection Box Layer */}
        <Layer>
          {selectionBox && <SelectionBox box={selectionBox} />}
        </Layer>
      </Stage>
    </div>
  );
}

export default HVACCanvas;
