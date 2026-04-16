import React from 'react';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { interpolateViridis } from 'd3-scale-chromatic';

type SpectrogramProps = {
  data: number[][];
  size?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

export const Spectrogram: React.FC<SpectrogramProps> = ({
  data,
  size = 600,
  margin = { top: 30, right: 30, bottom: 30, left: 40 },
}) => {
  if (!data.length || !data[0].length) return null;

  const timeCount = data.length;
  const freqCount = data[0].length;

  const innerW = size - margin.left - margin.right;
  const innerH = size - margin.top - margin.bottom;

  const cellSize = Math.min(innerW / timeCount, innerH / freqCount);
  const plotW = cellSize * timeCount;
  const plotH = cellSize * freqCount;
  const offsetX = (innerW - plotW) / 2;
  const offsetY = (innerH - plotH) / 2;

  const flat = data.flat();
  const minVal = Math.min(...flat);
  const maxVal = Math.max(...flat);
  const norm = scaleLinear<number>({ domain: [minVal, maxVal], range: [0, 1] });

  const timeScale = scaleLinear<number>({ domain: [0, timeCount], range: [0, plotW] });
  const freqScale = scaleLinear<number>({ domain: [0, freqCount], range: [plotH, 0] });

  return (
    <svg width={size} height={size} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <Group left={margin.left + offsetX} top={margin.top + offsetY}>
        {data.map((row, t) =>
          row.map((val, f) => (
            <rect
              key={`${t}-${f}`}
              x={t * cellSize}
              y={plotH - (f + 1) * cellSize}
              width={cellSize}
              height={cellSize}
              fill={interpolateViridis(norm(val))}
              shapeRendering="crispEdges"
            />
          ))
        )}
        <AxisBottom
          top={plotH}
          scale={timeScale}
          numTicks={Math.min(10, Math.floor(timeCount / 8))}
          tickLabelProps={() => ({ fill: '#444', fontSize: 10, dy: '0.25em' })}
        />
        <AxisLeft
          scale={freqScale}
          numTicks={Math.min(10, Math.floor(freqCount / 6))}
          tickLabelProps={() => ({ fill: '#444', fontSize: 10, dx: '-0.25em' })}
        />
      </Group>
    </svg>
  );
};

