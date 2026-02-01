import React, { useMemo } from "react";
import { Stage, Layer, Rect, Text, Group, Circle, Line } from "react-konva";
import type { HVACComponent, DetailArea, Connection } from "../types";
import { ComponentRenderer } from "../components/ComponentRenderer";

interface DetailViewProps {
  components: HVACComponent[];
  connections: Connection[];
  detailArea: DetailArea;
  width: number;
  height: number;
  showAnnotations?: boolean;
}

interface ScaledComponent extends HVACComponent {
  scaledX: number;
  scaledY: number;
}

export function DetailView({
  components,
  connections,
  detailArea,
  width,
  height,
  showAnnotations = true,
}: DetailViewProps) {
  // Filter and scale components within detail area
  const scaledComponents = useMemo(() => {
    const result: ScaledComponent[] = [];

    components.forEach((component) => {
      // Check if component is within detail area bounds
      const isWithin =
        component.x >= detailArea.x &&
        component.x <= detailArea.x + detailArea.width &&
        component.y >= detailArea.y &&
        component.y <= detailArea.y + detailArea.height;

      if (isWithin) {
        result.push({
          ...component,
          // Scale position relative to detail area
          scaledX: (component.x - detailArea.x) * detailArea.scale,
          scaledY: (component.y - detailArea.y) * detailArea.scale,
        });
      }
    });

    return result;
  }, [components, detailArea]);

  // Scale connections within detail area
  const scaledConnections = useMemo(() => {
    return connections
      .filter((conn) => {
        // Check if both connected components are in detail view
        const sourceInView = scaledComponents.some((c) => c.id === conn.sourceId);
        const targetInView = scaledComponents.some((c) => c.id === conn.targetId);
        return sourceInView && targetInView;
      })
      .map((conn) => ({
        ...conn,
        points: conn.points.map((point, index) => {
          // Scale X coordinates (even indices)
          if (index % 2 === 0) {
            return (point - detailArea.x) * detailArea.scale;
          }
          // Scale Y coordinates (odd indices)
          return (point - detailArea.y) * detailArea.scale;
        }),
      }));
  }, [connections, scaledComponents, detailArea]);

  // Dummy handlers for ComponentRenderer (detail view is typically read-only)
  const handleSelect = () => {};
  const handleDragStart = () => {};
  const handleDragEnd = () => {};
  const handleTransformEnd = () => {};

  return (
    <Stage width={width} height={height}>
      {/* Background */}
      <Layer listening={false}>
        <Rect x={0} y={0} width={width} height={height} fill="#ffffff" />

        {/* Detail border */}
        <Rect
          x={10}
          y={40}
          width={width - 20}
          height={height - 50}
          stroke="#1f2937"
          strokeWidth={2}
        />

        {/* Corner marks */}
        {[
          [10, 40],
          [width - 10, 40],
          [10, height - 10],
          [width - 10, height - 10],
        ].map(([x, y], i) => (
          <Group key={i}>
            <Line
              points={[
                x + (i % 2 === 0 ? 0 : -15),
                y,
                x + (i % 2 === 0 ? 15 : 0),
                y,
              ]}
              stroke="#1f2937"
              strokeWidth={2}
            />
            <Line
              points={[
                x,
                y + (i < 2 ? 0 : -15),
                x,
                y + (i < 2 ? 15 : 0),
              ]}
              stroke="#1f2937"
              strokeWidth={2}
            />
          </Group>
        ))}
      </Layer>

      {/* Title bar */}
      <Layer listening={false}>
        <Rect x={10} y={10} width={200} height={25} fill="#1f2937" />
        <Text
          x={20}
          y={15}
          text={`DETAIL ${detailArea.name}`}
          fontSize={14}
          fontStyle="bold"
          fill="#ffffff"
        />
        <Text
          x={width - 100}
          y={15}
          text={`Scale 1:${Math.round(1 / detailArea.scale)}`}
          fontSize={12}
          fill="#6b7280"
        />
      </Layer>

      {/* Connections */}
      <Layer>
        {scaledConnections.map((conn) => (
          <Line
            key={conn.id}
            points={conn.points.map((p) => p + 50)} // Offset for border
            stroke="#3b82f6"
            strokeWidth={2 * detailArea.scale}
            lineCap="round"
            lineJoin="round"
          />
        ))}
      </Layer>

      {/* Scaled components */}
      <Layer>
        <Group x={50} y={60}>
          {scaledComponents.map((component) => (
            <ComponentRenderer
              key={component.id}
              component={{
                ...component,
                x: component.scaledX,
                y: component.scaledY,
              }}
              isSelected={false}
              onSelect={handleSelect}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
            />
          ))}
        </Group>
      </Layer>

      {/* Annotations layer */}
      {showAnnotations && (
        <Layer>
          <Group x={50} y={60}>
            {scaledComponents.map((component, index) => (
              <Group key={`anno-${component.id}`}>
                {/* Leader line */}
                <Line
                  points={[
                    component.scaledX + 20,
                    component.scaledY - 10,
                    component.scaledX + 60,
                    component.scaledY - 40,
                  ]}
                  stroke="#6b7280"
                  strokeWidth={0.5}
                />

                {/* Annotation bubble */}
                <Circle
                  x={component.scaledX + 60}
                  y={component.scaledY - 40}
                  radius={12}
                  fill="#ffffff"
                  stroke="#6b7280"
                  strokeWidth={1}
                />
                <Text
                  x={component.scaledX + 55}
                  y={component.scaledY - 45}
                  text={String(index + 1)}
                  fontSize={10}
                  fill="#374151"
                />
              </Group>
            ))}
          </Group>

          {/* Legend */}
          <Group x={width - 180} y={height - 120}>
            <Rect
              x={0}
              y={0}
              width={160}
              height={100}
              fill="#f9fafb"
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <Text
              x={10}
              y={10}
              text="LEGEND"
              fontSize={10}
              fontStyle="bold"
              fill="#374151"
            />
            {scaledComponents.slice(0, 4).map((comp, i) => (
              <Group key={`legend-${comp.id}`} y={25 + i * 18}>
                <Circle x={20} y={5} radius={8} fill="#ffffff" stroke="#6b7280" strokeWidth={1} />
                <Text x={15} y={0} text={String(i + 1)} fontSize={9} fill="#374151" />
                <Text
                  x={35}
                  y={0}
                  text={comp.name || comp.type}
                  fontSize={9}
                  fill="#6b7280"
                  width={110}
                  ellipsis
                />
              </Group>
            ))}
          </Group>
        </Layer>
      )}
    </Stage>
  );
}

export default DetailView;
