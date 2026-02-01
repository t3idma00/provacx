import React, { useMemo } from "react";
import { Stage, Layer, Line, Rect, Text, Group } from "react-konva";
import type { HVACComponent, CutLine } from "../types";

interface SectionalElevationProps {
  components: HVACComponent[];
  cutLine: CutLine;
  width: number;
  height: number;
  zoom: number;
  panX: number;
  panY: number;
  floorLevel?: number;
  ceilingLevel?: number;
}

interface SectionComponent {
  id: string;
  originalComponent: HVACComponent;
  sectionX: number;
  sectionY: number; // Elevation becomes Y in section view
  sectionWidth: number;
  sectionHeight: number;
}

export function SectionalElevation({
  components,
  cutLine,
  width,
  height,
  zoom,
  panX,
  panY,
  floorLevel = 0,
  ceilingLevel = 3000, // Default 3m ceiling
}: SectionalElevationProps) {
  // Filter components that intersect with cut line
  const sectionComponents = useMemo(() => {
    const result: SectionComponent[] = [];

    // Determine cut line bounds
    const cutMinX = Math.min(cutLine.startX, cutLine.endX);
    const cutMaxX = Math.max(cutLine.startX, cutLine.endX);
    const cutMinY = Math.min(cutLine.startY, cutLine.endY);
    const cutMaxY = Math.max(cutLine.startY, cutLine.endY);

    components.forEach((component) => {
      // Check if component intersects with cut line
      // For horizontal cut line, check Y intersection
      // For vertical cut line, check X intersection

      let intersects = false;
      let sectionPosition = 0;

      if (cutLine.direction === "horizontal") {
        // Horizontal cut - check if component spans the cut line Y
        const compY = component.y;
        if (component.type === "DUCT") {
          const compHeight = (component as any).width * 0.1; // Plan view width
          if (compY <= cutLine.startY && compY + compHeight >= cutLine.startY) {
            intersects = true;
            sectionPosition = component.x;
          }
        }
      } else if (cutLine.direction === "vertical") {
        // Vertical cut - check if component spans the cut line X
        const compX = component.x;
        if (component.type === "DUCT") {
          const compLength = (component as any).length * 0.1;
          if (compX <= cutLine.startX && compX + compLength >= cutLine.startX) {
            intersects = true;
            sectionPosition = component.y;
          }
        }
      }

      if (intersects) {
        result.push({
          id: component.id,
          originalComponent: component,
          sectionX: sectionPosition,
          sectionY: component.elevation || floorLevel + 2400, // Default 2.4m above floor
          sectionWidth: component.type === "DUCT" ? (component as any).width * 0.1 : 40,
          sectionHeight: component.type === "DUCT" ? (component as any).height * 0.1 : 40,
        });
      }
    });

    return result;
  }, [components, cutLine, floorLevel]);

  // Scale for section view
  const scale = 0.1;
  const scaledFloor = floorLevel * scale;
  const scaledCeiling = ceilingLevel * scale;

  return (
    <Stage
      width={width}
      height={height}
      scaleX={zoom}
      scaleY={zoom}
      x={panX}
      y={panY}
    >
      {/* Background and reference lines */}
      <Layer listening={false}>
        {/* Floor line */}
        <Line
          points={[0, height - scaledFloor - 50, width, height - scaledFloor - 50]}
          stroke="#9ca3af"
          strokeWidth={2}
        />
        <Text
          x={10}
          y={height - scaledFloor - 45}
          text="FLOOR"
          fontSize={10}
          fill="#6b7280"
        />

        {/* Ceiling line */}
        <Line
          points={[0, height - scaledCeiling - 50, width, height - scaledCeiling - 50]}
          stroke="#9ca3af"
          strokeWidth={2}
          dash={[10, 5]}
        />
        <Text
          x={10}
          y={height - scaledCeiling - 65}
          text="CEILING"
          fontSize={10}
          fill="#6b7280"
        />

        {/* Elevation grid */}
        {[0, 500, 1000, 1500, 2000, 2500, 3000].map((elev) => (
          <React.Fragment key={elev}>
            <Line
              points={[
                0,
                height - elev * scale - 50,
                width,
                height - elev * scale - 50,
              ]}
              stroke="#e5e7eb"
              strokeWidth={0.5}
            />
            <Text
              x={width - 50}
              y={height - elev * scale - 55}
              text={`+${elev}`}
              fontSize={8}
              fill="#9ca3af"
            />
          </React.Fragment>
        ))}
      </Layer>

      {/* Section components */}
      <Layer>
        {sectionComponents.map((comp) => (
          <Group key={comp.id}>
            {/* Duct section (shown as rectangle in section) */}
            <Rect
              x={comp.sectionX}
              y={height - comp.sectionY * scale - 50 - comp.sectionHeight / 2}
              width={comp.sectionWidth}
              height={comp.sectionHeight}
              fill="#f3f4f6"
              stroke="#4b5563"
              strokeWidth={2}
            />

            {/* Cross-hatch for duct section */}
            <Line
              points={[
                comp.sectionX,
                height - comp.sectionY * scale - 50 - comp.sectionHeight / 2,
                comp.sectionX + comp.sectionWidth,
                height - comp.sectionY * scale - 50 + comp.sectionHeight / 2,
              ]}
              stroke="#9ca3af"
              strokeWidth={0.5}
            />
            <Line
              points={[
                comp.sectionX + comp.sectionWidth,
                height - comp.sectionY * scale - 50 - comp.sectionHeight / 2,
                comp.sectionX,
                height - comp.sectionY * scale - 50 + comp.sectionHeight / 2,
              ]}
              stroke="#9ca3af"
              strokeWidth={0.5}
            />

            {/* Elevation dimension */}
            <Line
              points={[
                comp.sectionX + comp.sectionWidth + 10,
                height - scaledFloor - 50,
                comp.sectionX + comp.sectionWidth + 10,
                height - comp.sectionY * scale - 50,
              ]}
              stroke="#3b82f6"
              strokeWidth={1}
            />
            <Text
              x={comp.sectionX + comp.sectionWidth + 15}
              y={height - (scaledFloor + comp.sectionY * scale) / 2 - 50}
              text={`+${Math.round(comp.sectionY)}`}
              fontSize={9}
              fill="#3b82f6"
            />
          </Group>
        ))}
      </Layer>

      {/* Section title */}
      <Layer listening={false}>
        <Rect
          x={10}
          y={10}
          width={150}
          height={30}
          fill="#ffffff"
          stroke="#d1d5db"
          strokeWidth={1}
        />
        <Text
          x={20}
          y={18}
          text={`Section ${cutLine.name}`}
          fontSize={14}
          fontStyle="bold"
          fill="#374151"
        />
      </Layer>
    </Stage>
  );
}

export default SectionalElevation;
