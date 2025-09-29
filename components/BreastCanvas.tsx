import React, { useState, useRef } from 'react';
import { Box, useTheme, Tooltip, Typography, Chip } from '@mui/material';
import { BreastFinding } from '../types';

interface BreastCanvasProps {
  images: { left?: string; right?: string };
  findings: BreastFinding[];
  brightness?: number;
  contrast?: number;
}

const BreastCanvas: React.FC<BreastCanvasProps> = ({
  images,
  findings,
  brightness = 100,
  contrast = 100,
}) => {
  const theme = useTheme();
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1000, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const getSVGPoint = (e: React.MouseEvent): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    let point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformedPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: transformedPoint.x, y: transformedPoint.y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setStartPan(getSVGPoint(e));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const currentPoint = getSVGPoint(e);
      setViewBox(prev => ({
        ...prev,
        x: prev.x - (currentPoint.x - startPan.x),
        y: prev.y - (currentPoint.y - startPan.y),
      }));
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 1.1;
    const zoomDirection = e.deltaY < 0 ? 1 / scaleFactor : scaleFactor;
    const mousePoint = getSVGPoint(e as any);

    const newWidth = viewBox.width * zoomDirection;
    const newHeight = viewBox.height * zoomDirection;
    const newX = viewBox.x + (mousePoint.x - mousePoint.x) * (1 - zoomDirection);
    const newY = viewBox.y + (mousePoint.y - mousePoint.y) * (1 - zoomDirection);

    setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight });
  };
  
  const hasTwoImages = images.left && images.right;

  return (
    <Box
      sx={{ width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : 'grab', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
      onWheel={handleWheel}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <filter id="image-filters">
            <feColorMatrix type="matrix" values={`${brightness / 100} 0 0 0 0 0 ${brightness / 100} 0 0 0 0 0 ${brightness / 100} 0 0 0 0 0 1 0`} />
            <feComponentTransfer>
              <feFuncR type="linear" slope={contrast / 100} intercept={-0.5 * (contrast - 100)} />
              <feFuncG type="linear" slope={contrast / 100} intercept={-0.5 * (contrast - 100)} />
              <feFuncB type="linear" slope={contrast / 100} intercept={-0.5 * (contrast - 100)} />
            </feComponentTransfer>
          </filter>
        </defs>

        <g filter="url(#image-filters)">
          {images.left && <image href={images.left} x="0" y="0" width={hasTwoImages ? "500" : "1000"} height="500" />}
          {images.right && <image href={images.right} x="500" y="0" width="500" height="500" />}
        </g>
        
        {findings.map(finding => {
          const { x_min, y_min, x_max, y_max } = finding.bounding_box;
          const imageWidth = hasTwoImages ? 500 : 1000;
          
          const boxX = x_min * imageWidth;
          const boxY = y_min * 500;
          const boxWidth = (x_max - x_min) * imageWidth;
          const boxHeight = (y_max - y_min) * 500;

          const color = finding.malignancy_probability > 0.75 ? theme.palette.error.main : theme.palette.warning.main;

          return (
             <Tooltip 
                key={finding.id}
                arrow
                title={
                    <Box>
                        <Typography variant="body2" sx={{fontWeight: 'bold'}}>{finding.label}</Typography>
                        <Typography variant="caption">{finding.description}</Typography>
                        <Chip label={`Malignancy Prob: ${(finding.malignancy_probability * 100).toFixed(0)}%`} size="small" sx={{mt: 1, bgcolor: color, color: '#fff'}}/>
                    </Box>
                }
            >
                <rect
                    x={boxX}
                    y={boxY}
                    width={boxWidth}
                    height={boxHeight}
                    fill="none"
                    stroke={color}
                    strokeWidth={viewBox.width / 250} // stroke scales with zoom
                />
            </Tooltip>
          );
        })}
      </svg>
    </Box>
  );
};

export default BreastCanvas;