import { useCallback, useMemo } from "react";
import { useCanvasStore, useComponents, useSettings } from "../store/canvasStore";
import type { HVACComponent } from "../types";

interface SnapPoint {
  x: number;
  y: number;
  type: "grid" | "component" | "connection" | "guide";
  componentId?: string;
}

interface SnapResult {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
  snapPointX?: SnapPoint;
  snapPointY?: SnapPoint;
}

interface SnapOptions {
  /** Snap tolerance in pixels */
  tolerance?: number;
  /** Enable grid snapping */
  snapToGrid?: boolean;
  /** Enable component snapping */
  snapToComponents?: boolean;
  /** Enable connection point snapping */
  snapToConnections?: boolean;
  /** Enable guide line snapping */
  snapToGuides?: boolean;
}

const DEFAULT_OPTIONS: SnapOptions = {
  tolerance: 10,
  snapToGrid: true,
  snapToComponents: true,
  snapToConnections: true,
  snapToGuides: true,
};

export function useSnapping(options: SnapOptions = {}) {
  const settings = useSettings();
  const components = useComponents();
  const selectedIds = useCanvasStore((state) => state.selectedIds);

  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Get all snap points from components (excluding selected)
  const componentSnapPoints = useMemo(() => {
    const points: SnapPoint[] = [];

    components.forEach((component) => {
      // Skip selected components
      if (selectedIds.has(component.id)) return;

      // Component center
      points.push({
        x: component.x,
        y: component.y,
        type: "component",
        componentId: component.id,
      });

      // Component bounds (simplified - would need actual dimensions)
      // This would need to be expanded based on component type and dimensions
      if (component.type === "DUCT") {
        const duct = component as any;
        const length = (duct.length || 1000) * 0.1;
        const width = (duct.width || 400) * 0.1;

        // End points
        points.push({
          x: component.x + length,
          y: component.y,
          type: "connection",
          componentId: component.id,
        });

        // Center of duct
        points.push({
          x: component.x + length / 2,
          y: component.y + width / 2,
          type: "component",
          componentId: component.id,
        });
      }
    });

    return points;
  }, [components, selectedIds]);

  // Snap a point to the nearest valid snap point
  const snap = useCallback(
    (x: number, y: number, excludeComponentIds: string[] = []): SnapResult => {
      let resultX = x;
      let resultY = y;
      let snappedX = false;
      let snappedY = false;
      let snapPointX: SnapPoint | undefined;
      let snapPointY: SnapPoint | undefined;

      const { tolerance, snapToGrid, snapToComponents, snapToConnections } = opts;
      const { gridSize, snapToGrid: settingsSnapToGrid } = settings;

      // Grid snapping
      if (snapToGrid && settingsSnapToGrid) {
        const gridX = Math.round(x / gridSize) * gridSize;
        const gridY = Math.round(y / gridSize) * gridSize;

        if (Math.abs(x - gridX) < tolerance!) {
          resultX = gridX;
          snappedX = true;
          snapPointX = { x: gridX, y, type: "grid" };
        }

        if (Math.abs(y - gridY) < tolerance!) {
          resultY = gridY;
          snappedY = true;
          snapPointY = { x, y: gridY, type: "grid" };
        }
      }

      // Component and connection snapping
      if (snapToComponents || snapToConnections) {
        componentSnapPoints.forEach((point) => {
          if (excludeComponentIds.includes(point.componentId || "")) return;

          // Skip connection points if not enabled
          if (point.type === "connection" && !snapToConnections) return;
          if (point.type === "component" && !snapToComponents) return;

          // Check X alignment
          if (!snappedX && Math.abs(x - point.x) < tolerance!) {
            resultX = point.x;
            snappedX = true;
            snapPointX = point;
          }

          // Check Y alignment
          if (!snappedY && Math.abs(y - point.y) < tolerance!) {
            resultY = point.y;
            snappedY = true;
            snapPointY = point;
          }
        });
      }

      return {
        x: resultX,
        y: resultY,
        snappedX,
        snappedY,
        snapPointX,
        snapPointY,
      };
    },
    [opts, settings, componentSnapPoints]
  );

  // Get snap guides for visual feedback
  const getSnapGuides = useCallback(
    (x: number, y: number): { horizontal: number[]; vertical: number[] } => {
      const guides = { horizontal: [] as number[], vertical: [] as number[] };
      const { tolerance } = opts;

      componentSnapPoints.forEach((point) => {
        if (Math.abs(x - point.x) < tolerance!) {
          guides.vertical.push(point.x);
        }
        if (Math.abs(y - point.y) < tolerance!) {
          guides.horizontal.push(point.y);
        }
      });

      return guides;
    },
    [opts, componentSnapPoints]
  );

  // Find nearest connection point
  const findNearestConnectionPoint = useCallback(
    (
      x: number,
      y: number,
      maxDistance: number = 50
    ): { point: SnapPoint; distance: number } | null => {
      let nearest: { point: SnapPoint; distance: number } | null = null;

      componentSnapPoints
        .filter((p) => p.type === "connection")
        .forEach((point) => {
          const dx = x - point.x;
          const dy = y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance && (!nearest || distance < nearest.distance)) {
            nearest = { point, distance };
          }
        });

      return nearest;
    },
    [componentSnapPoints]
  );

  return {
    snap,
    getSnapGuides,
    findNearestConnectionPoint,
    snapPoints: componentSnapPoints,
  };
}

export default useSnapping;
