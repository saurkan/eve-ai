import React, { useState, useRef, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import { CephalometricLandmark, CephalometricPoint } from '../types';

interface CephalometricCanvasProps {
  imageUrl: string;
  landmarks: CephalometricLandmark[];
  imageSize: { width: number; height: number };
}

const CephalometricCanvas: React.FC<CephalometricCanvasProps> = ({
  imageUrl,
  landmarks,
  imageSize,
}) => {
  const theme = useTheme();
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setViewBox({ x: 0, y: 0, width: imageSize.width, height: imageSize.height });
  }, [imageSize]);

  const getSVGPoint = (e: React.MouseEvent): CephalometricPoint => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const transformedPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: transformedPt.x, y: transformedPt.y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left-click to pan
      setIsPanning(true);
      setStartPan(getSVGPoint(e));
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const currentPoint = getSVGPoint(e);
      setViewBox(prev => ({
        ...prev,
        x: prev.x - (currentPoint.x - startPan.x),
        y: prev.y - (currentPoint.y - startPan.y),
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    
    const scaleFactor = 1.1;
    const zoomDirection = e.deltaY < 0 ? 1 / scaleFactor : scaleFactor;
    
    const mousePoint = getSVGPoint(e as unknown as React.MouseEvent);

    const newWidth = viewBox.width * zoomDirection;
    const newHeight = viewBox.height * zoomDirection;
    const newX = viewBox.x + (mousePoint.x - viewBox.x) * (1 - zoomDirection);
    const newY = viewBox.y + (mousePoint.y - viewBox.y) * (1 - zoomDirection);

    setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight });
  };
  
  const landmarkColor = theme.palette.secondary.main;
  const planeColor = theme.palette.success.main;

  // Define points for planes
  const sella = landmarks.find(l => l.name === 'Sella (S)')?.point;
  const nasion = landmarks.find(l => l.name === 'Nasion (N)')?.point;

  const getCursor = () => {
      if (isPanning) return 'grabbing';
      return 'grab';
  }

  return (
    <Box
      sx={{ width: '100%', height: '100%', cursor: getCursor() }}
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
        <image href={imageUrl} x="0" y="0" width={imageSize.width} height={imageSize.height} />
        
        {/* Render analysis planes */}
        {sella && nasion && <line x1={sella.x} y1={sella.y} x2={nasion.x} y2={nasion.y} stroke={planeColor} strokeWidth="2" strokeDasharray="5,5" />}

        {/* Render current landmarks */}
        {landmarks.map(({ name, point }) => {
            return (
              <g key={name}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={Math.min(viewBox.width, viewBox.height) * 0.008}
                  fill={landmarkColor}
                  stroke="white"
                  strokeWidth={Math.min(viewBox.width, viewBox.height) * 0.001}
                  style={{ pointerEvents: 'none' }}
                />
                 <text 
                    x={point.x + 10} 
                    y={point.y + 5} 
                    fill={theme.palette.text.primary} 
                    fontSize={Math.min(viewBox.width, viewBox.height) * 0.015}
                    style={{ pointerEvents: 'none', textShadow: '0 0 3px white, 0 0 3px white' }}
                >
                    {name.split(' ')[0]}
                </text>
              </g>
            )
        })}
      </svg>
    </Box>
  );
};

export default CephalometricCanvas;