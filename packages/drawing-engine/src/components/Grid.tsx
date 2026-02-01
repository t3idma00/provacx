import React, { useMemo } from "react";
import { Line, Group } from "react-konva";

interface GridProps {
  width: number;
  height: number;
  gridSize: number;
  showGrid: boolean;
  zoom: number;
  panX: number;
  panY: number;
}

export function Grid({
  width,
  height,
  gridSize,
  showGrid,
  zoom,
  panX,
  panY,
}: GridProps) {
  const lines = useMemo(() => {
    if (!showGrid) return [];

    const result: React.ReactElement[] = [];

    // Calculate visible area
    const startX = Math.floor(-panX / zoom / gridSize) * gridSize - gridSize;
    const startY = Math.floor(-panY / zoom / gridSize) * gridSize - gridSize;
    const endX = startX + width + gridSize * 2;
    const endY = startY + height + gridSize * 2;

    // Determine grid line weights based on zoom
    const majorGridInterval = 5; // Every 5th line is major
    const minorOpacity = zoom < 0.5 ? 0 : zoom < 1 ? 0.3 : 0.5;
    const majorOpacity = 0.3;

    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      const isMajor = Math.round(x / gridSize) % majorGridInterval === 0;

      result.push(
        <Line
          key={`v-${x}`}
          points={[x, startY, x, endY]}
          stroke={isMajor ? "#9ca3af" : "#d1d5db"}
          strokeWidth={isMajor ? 1 : 0.5}
          opacity={isMajor ? majorOpacity : minorOpacity}
          perfectDrawEnabled={false}
          listening={false}
        />
      );
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      const isMajor = Math.round(y / gridSize) % majorGridInterval === 0;

      result.push(
        <Line
          key={`h-${y}`}
          points={[startX, y, endX, y]}
          stroke={isMajor ? "#9ca3af" : "#d1d5db"}
          strokeWidth={isMajor ? 1 : 0.5}
          opacity={isMajor ? majorOpacity : minorOpacity}
          perfectDrawEnabled={false}
          listening={false}
        />
      );
    }

    // Origin crosshairs
    result.push(
      <Line
        key="origin-h"
        points={[startX, 0, endX, 0]}
        stroke="#ef4444"
        strokeWidth={1}
        opacity={0.5}
        perfectDrawEnabled={false}
        listening={false}
      />,
      <Line
        key="origin-v"
        points={[0, startY, 0, endY]}
        stroke="#ef4444"
        strokeWidth={1}
        opacity={0.5}
        perfectDrawEnabled={false}
        listening={false}
      />
    );

    return result;
  }, [width, height, gridSize, showGrid, zoom, panX, panY]);

  if (!showGrid) return null;

  return <Group>{lines}</Group>;
}

export default Grid;
