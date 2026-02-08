'use client';

import React, { useMemo } from 'react';
import type { Point2D } from '../../types';
import { formatRulerLabel, getAdaptiveSteps, PX_TO_MM } from './scale';

interface RulerTick {
  valueMm: number;
  pos: number;
}

interface RulerTickData {
  major: RulerTick[];
  minor: RulerTick[];
  majorStepMm: number;
}

export interface RulersProps {
  pageWidth: number;
  pageHeight: number;
  zoom: number;
  panOffset: Point2D;
  viewportWidth: number;
  viewportHeight: number;
  showRulers?: boolean;
  rulerSize?: number;
  originOffset?: Point2D;
  gridSize?: number;
  /** Mouse position in canvas coordinates for cursor indicator */
  mousePosition?: Point2D;
}

const DEFAULT_RULER_BG = '#fff2d6';
const DEFAULT_RULER_BORDER = 'rgba(217, 177, 117, 0.9)';
const DEFAULT_RULER_TEXT = '#6b7280';
const DEFAULT_TICK_MAJOR = '#7f7f7f';
const DEFAULT_TICK_MINOR = '#b5b5b5';

const CURSOR_INDICATOR_COLOR = '#4CAF50';

export const Rulers: React.FC<RulersProps> = ({
  pageWidth,
  pageHeight,
  zoom,
  panOffset,
  viewportWidth,
  viewportHeight,
  showRulers = true,
  rulerSize = 24,
  originOffset = { x: 0, y: 0 },
  gridSize = 20,
  mousePosition,
}) => {
  if (!showRulers || viewportWidth <= 0 || viewportHeight <= 0) return null;

  const leftRulerWidth = Math.round(rulerSize * 1.2);
  const scale = Math.max(zoom, 0.01);
  const steps = useMemo(() => getAdaptiveSteps(scale, gridSize), [scale, gridSize]);
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const snapPx = (value: number) => Math.round(value * dpr) / dpr;

  const getTicks = (axis: 'x' | 'y'): RulerTickData => {
    const viewport = axis === 'x' ? viewportWidth : viewportHeight;
    const pan = axis === 'x' ? panOffset.x : panOffset.y;
    const pageSizeScenePx = axis === 'x' ? pageWidth : pageHeight;
    if (pageSizeScenePx <= 0 || viewport <= 0) {
      return {
        major: [],
        minor: [],
        majorStepMm: steps.majorStepMm,
      };
    }

    const majorStepScenePx = steps.majorStepScenePx;
    const minorStepScenePx = steps.minorStepScenePx;
    const major: RulerTick[] = [];
    const minor: RulerTick[] = [];

    const viewStartScenePx = pan;
    const viewEndScenePx = pan + viewport / scale;
    const visibleStartScenePx = Math.max(0, viewStartScenePx);
    const visibleEndScenePx = Math.min(pageSizeScenePx, viewEndScenePx);

    if (visibleEndScenePx <= visibleStartScenePx) {
      return {
        major: [],
        minor: [],
        majorStepMm: steps.majorStepMm,
      };
    }

    const firstMajor =
      Math.floor(visibleStartScenePx / majorStepScenePx) * majorStepScenePx;
    const lastMajor =
      Math.ceil(visibleEndScenePx / majorStepScenePx) * majorStepScenePx;

    const maxMajorTicks = 500;
    let count = 0;
    for (
      let valueScenePx = firstMajor;
      valueScenePx <= lastMajor && count < maxMajorTicks;
      valueScenePx += majorStepScenePx, count++
    ) {
      if (valueScenePx < 0 || valueScenePx > pageSizeScenePx) continue;
      const majorPos = (valueScenePx - pan) * scale;
      if (majorPos < -1 || majorPos > viewport + 1) continue;

      major.push({
        valueMm: valueScenePx * PX_TO_MM,
        pos: majorPos,
      });

      if (steps.showMinor && minorStepScenePx < majorStepScenePx) {
        const stepsPerMajor = Math.round(majorStepScenePx / minorStepScenePx);
        for (let i = 1; i < stepsPerMajor; i++) {
          const minorValueScenePx = valueScenePx + i * minorStepScenePx;
          if (
            minorValueScenePx < visibleStartScenePx ||
            minorValueScenePx > visibleEndScenePx
          ) {
            continue;
          }
          if (minorValueScenePx < 0 || minorValueScenePx > pageSizeScenePx) continue;
          const minorPos = (minorValueScenePx - pan) * scale;
          if (minorPos < -1 || minorPos > viewport + 1) continue;

          minor.push({
            valueMm: minorValueScenePx * PX_TO_MM,
            pos: minorPos,
          });
        }
      }
    }

    return {
      major,
      minor,
      majorStepMm: steps.majorStepMm,
    };
  };

  const rulerData = useMemo(
    () => ({
      x: getTicks('x'),
      y: getTicks('y'),
    }),
    [pageWidth, pageHeight, panOffset.x, panOffset.y, scale, steps, viewportWidth, viewportHeight]
  );

  const topRulerTop = originOffset.y - rulerSize;
  const topRulerLeft = originOffset.x;
  const leftRulerTop = originOffset.y;
  const leftRulerLeft = originOffset.x - leftRulerWidth;
  const cursorX = mousePosition ? (mousePosition.x - panOffset.x) * scale : null;
  const cursorY = mousePosition ? (mousePosition.y - panOffset.y) * scale : null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
      {/* Corner */}
      <div
        style={{
          position: 'absolute',
          top: snapPx(topRulerTop),
          left: snapPx(leftRulerLeft),
          width: leftRulerWidth,
          height: rulerSize,
          backgroundColor: DEFAULT_RULER_BG,
          borderRight: `1px solid ${DEFAULT_RULER_BORDER}`,
          borderBottom: `1px solid ${DEFAULT_RULER_BORDER}`,
        }}
      >
        <span
          style={{
            position: 'absolute',
            right: 4,
            bottom: 3,
            fontSize: 9,
            color: DEFAULT_RULER_TEXT,
            letterSpacing: 0.3,
            textTransform: 'uppercase',
          }}
        >
          cm
        </span>
      </div>

      {/* Horizontal Ruler */}
      <div
        style={{
          position: 'absolute',
          top: snapPx(topRulerTop),
          left: snapPx(topRulerLeft),
          width: viewportWidth,
          height: rulerSize,
          backgroundColor: DEFAULT_RULER_BG,
          borderBottom: `1px solid ${DEFAULT_RULER_BORDER}`,
          borderRight: `1px solid ${DEFAULT_RULER_BORDER}`,
          overflow: 'hidden',
        }}
      >
        {rulerData.x.minor.map((tick) => {
          const midStep = rulerData.x.majorStepMm / 2;
          const isMid =
            midStep > 0 &&
            Math.abs((tick.valueMm % rulerData.x.majorStepMm) - midStep) < 0.001;
          return (
            <div
              key={`x-minor-${tick.valueMm}-${tick.pos}`}
              style={{
                position: 'absolute',
                left: snapPx(tick.pos),
                bottom: 0,
                width: 1,
                height: isMid ? 9 : 6,
                backgroundColor: DEFAULT_TICK_MINOR,
              }}
            />
          );
        })}

        {rulerData.x.major.map((tick) => (
          <React.Fragment key={`x-major-${tick.valueMm}-${tick.pos}`}>
            <div
              style={{
                position: 'absolute',
                left: snapPx(tick.pos),
                bottom: 0,
                width: 1,
                height: 12,
                backgroundColor: DEFAULT_TICK_MAJOR,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: snapPx(tick.pos + 3),
                top: 2,
                fontSize: 9,
                color: DEFAULT_RULER_TEXT,
                whiteSpace: 'nowrap',
              }}
            >
              {formatRulerLabel(tick.valueMm, rulerData.x.majorStepMm)}
            </div>
          </React.Fragment>
        ))}

        {/* Cursor Position Indicator */}
        {cursorX !== null && cursorX >= 0 && cursorX <= viewportWidth && (
          <div
            style={{
              position: 'absolute',
              left: snapPx(cursorX),
              top: 0,
              width: 1,
              height: '100%',
              backgroundColor: CURSOR_INDICATOR_COLOR,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        )}
      </div>

      {/* Vertical Ruler */}
      <div
        style={{
          position: 'absolute',
          top: snapPx(leftRulerTop),
          left: snapPx(leftRulerLeft),
          height: viewportHeight,
          width: leftRulerWidth,
          backgroundColor: DEFAULT_RULER_BG,
          borderRight: `1px solid ${DEFAULT_RULER_BORDER}`,
          borderBottom: `1px solid ${DEFAULT_RULER_BORDER}`,
          overflow: 'hidden',
        }}
      >
        {rulerData.y.minor.map((tick) => {
          const midStep = rulerData.y.majorStepMm / 2;
          const isMid =
            midStep > 0 &&
            Math.abs((tick.valueMm % rulerData.y.majorStepMm) - midStep) < 0.001;
          return (
            <div
              key={`y-minor-${tick.valueMm}-${tick.pos}`}
              style={{
                position: 'absolute',
                top: snapPx(tick.pos),
                right: 0,
                height: 1,
                width: isMid ? 9 : 6,
                backgroundColor: DEFAULT_TICK_MINOR,
              }}
            />
          );
        })}

        {rulerData.y.major.map((tick) => (
          <React.Fragment key={`y-major-${tick.valueMm}-${tick.pos}`}>
            <div
              style={{
                position: 'absolute',
                top: snapPx(tick.pos),
                right: 0,
                height: 1,
                width: 12,
                backgroundColor: DEFAULT_TICK_MAJOR,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: Math.max(2, snapPx(tick.pos) - 6),
                right: 14,
                fontSize: 9,
                color: DEFAULT_RULER_TEXT,
                lineHeight: 1,
                writingMode: 'horizontal-tb',
                textOrientation: 'upright',
                transform: 'translate(0, -50%)',
                whiteSpace: 'nowrap',
              }}
            >
              {formatRulerLabel(tick.valueMm, rulerData.y.majorStepMm)}
            </div>
          </React.Fragment>
        ))}

        {/* Cursor Position Indicator */}
        {cursorY !== null && cursorY >= 0 && cursorY <= viewportHeight && (
          <div
            style={{
              position: 'absolute',
              top: snapPx(cursorY),
              left: 0,
              height: 1,
              width: '100%',
              backgroundColor: CURSOR_INDICATOR_COLOR,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Rulers;
