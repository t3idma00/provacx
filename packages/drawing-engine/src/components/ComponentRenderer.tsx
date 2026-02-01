import React, { useRef, useEffect } from "react";
import { Group, Transformer } from "react-konva";
import type Konva from "konva";
import type { ComponentRendererProps, HVACComponent } from "../types";
import { DuctSection } from "./shapes/DuctSection";
import { Elbow } from "./shapes/Elbow";
import { Tee } from "./shapes/Tee";
import { Reducer } from "./shapes/Reducer";
import { Diffuser } from "./shapes/Diffuser";
import { Grille } from "./shapes/Grille";
import { AHU } from "./shapes/AHU";
import { Damper } from "./shapes/Damper";

export function ComponentRenderer({
  component,
  isSelected,
  onSelect,
  onDragStart,
  onDragEnd,
  onTransformEnd,
}: ComponentRendererProps) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Attach transformer when selected
  useEffect(() => {
    if (isSelected && groupRef.current && transformerRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Handle click
  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    onSelect(component.id, e.evt.shiftKey);
  };

  // Handle drag start
  const handleDragStart = () => {
    onDragStart(component.id);
  };

  // Handle drag end
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragEnd(component.id, e.target.x(), e.target.y());
  };

  // Handle transform end
  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and apply to component dimensions
    node.scaleX(1);
    node.scaleY(1);

    onTransformEnd(component.id, {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      // Scale would be applied to dimensions in specific component handlers
    });
  };

  // Render component based on type
  const renderComponent = () => {
    switch (component.type) {
      case "DUCT":
        return <DuctSection component={component} />;
      case "FITTING":
        switch (component.fittingType) {
          case "elbow":
            return <Elbow component={component} />;
          case "tee":
          case "wye":
            return <Tee component={component} />;
          case "reducer":
          case "transition":
            return <Reducer component={component} />;
          default:
            return <DuctSection component={component as any} />;
        }
      case "TERMINAL":
        switch (component.terminalType) {
          case "diffuser":
            return <Diffuser component={component} />;
          case "grille":
          case "register":
            return <Grille component={component} />;
          default:
            return <Diffuser component={component} />;
        }
      case "EQUIPMENT":
        return <AHU component={component} />;
      case "DAMPER":
        return <Damper component={component} />;
      default:
        return null;
    }
  };

  if (!component.visible) return null;

  return (
    <>
      <Group
        ref={groupRef}
        id={component.id}
        x={component.x}
        y={component.y}
        rotation={component.rotation}
        draggable={!component.locked}
        onClick={handleClick}
        onTap={handleClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {renderComponent()}
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

export default ComponentRenderer;
