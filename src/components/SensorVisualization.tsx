import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SensorVisualizationProps {
  length: number;
  piezoElementsCount: number;
  piezoElementSpacing: number;
  housingThickness: number;
  piezoLayers: number;
  contactPlateThickness: number;
  insulatorThickness: number;
  materialName: string;
  viewMode: '2d' | '3d';
  rotation: { x: number; y: number };
  isDragging: boolean;
}

export default function SensorVisualization({
  length,
  piezoElementsCount,
  piezoElementSpacing,
  housingThickness,
  piezoLayers,
  contactPlateThickness,
  insulatorThickness,
  materialName,
  viewMode,
  rotation,
  isDragging,
}: SensorVisualizationProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [cutaway, setCutaway] = useState(false);

  const sensorWidthPx = Math.min(length * 320, 800);
  const profileHeight = 75;
  const topWidth = sensorWidthPx * 0.96;

  const quartzSize = Math.max(6, Math.min(16, 200 / piezoElementsCount));

  const getQuartzPositions = () => {
    const positions: number[] = [];
    const margin = sensorWidthPx * 0.06;
    const usable = sensorWidthPx - margin * 2;
    for (let i = 0; i < piezoElementsCount; i++) {
      if (piezoElementsCount === 1) {
        positions.push(sensorWidthPx / 2);
      } else {
        positions.push(margin + (i / (piezoElementsCount - 1)) * usable);
      }
    }
    return positions;
  };

  const quartzPositions = getQuartzPositions();

  const partInfo: Record<string, { label: string; detail: string }> = {
    housing: { label: 'Алюминиевый профиль', detail: `Толщина стенки: ${housingThickness} мм` },
    quartz: { label: 'Кварцевые диски', detail: `${piezoElementsCount} шт × ${piezoLayers} слоя` },
    electrode: { label: 'Электроды', detail: `${contactPlateThickness} мм, Cu/Ag напыление` },
    insulator: { label: 'Изоляция', detail: `${insulatorThickness} мм, полимерная` },
    cable: { label: 'Кабельный вывод', detail: 'Герметичный разъём' },
    seal: { label: 'Торцевая заглушка', detail: 'Сварной шов, IP68' },
    groove: { label: 'Канал преднатяга', detail: 'Фиксация кварцев под давлением' },
    preload: { label: 'Болт преднатяга', detail: 'Осевое сжатие кварцевого стека' },
    wireBus: { label: 'Сигнальная шина', detail: 'Сбор заряда со всех элементов' },
  };

  if (viewMode === '2d') {
    return (
      <div className="space-y-6">
        <div className="relative flex flex-col items-center select-none">
          {hoveredPart && partInfo[hoveredPart] && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 bg-card border shadow-lg rounded px-3 py-2 text-xs whitespace-nowrap">
              <span className="font-semibold">{partInfo[hoveredPart].label}</span>
              <span className="text-muted-foreground ml-2">{partInfo[hoveredPart].detail}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs font-mono text-muted-foreground mb-2" style={{ width: sensorWidthPx }}>
            <span>0</span>
            <span className="text-primary font-semibold">{length.toFixed(2)} м</span>
          </div>

          <svg
            width={sensorWidthPx + 40}
            height={profileHeight + 80}
            viewBox={`-20 -10 ${sensorWidthPx + 40} ${profileHeight + 80}`}
            className="overflow-visible"
          >
            <defs>
              <linearGradient id="aluminumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C0C0C0" />
                <stop offset="20%" stopColor="#D8D8D8" />
                <stop offset="50%" stopColor="#A8A8A8" />
                <stop offset="80%" stopColor="#B0B0B0" />
                <stop offset="100%" stopColor="#909090" />
              </linearGradient>
              <linearGradient id="aluminumTop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E0E0E0" />
                <stop offset="100%" stopColor="#C0C0C0" />
              </linearGradient>
              <linearGradient id="quartzGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#DAA520" />
                <stop offset="100%" stopColor="#B8860B" />
              </linearGradient>
              <linearGradient id="electrodeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#CD7F32" />
                <stop offset="100%" stopColor="#8B4513" />
              </linearGradient>
              <linearGradient id="insulatorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2E8B57" />
                <stop offset="100%" stopColor="#1B5E20" />
              </linearGradient>
              <linearGradient id="sealGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#808080" />
                <stop offset="100%" stopColor="#505050" />
              </linearGradient>
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
              </filter>
            </defs>

            <polygon
              points={`
                ${(sensorWidthPx - topWidth) / 2},5
                ${(sensorWidthPx + topWidth) / 2},5
                ${sensorWidthPx},${profileHeight}
                0,${profileHeight}
              `}
              fill="url(#aluminumGrad)"
              stroke="#707070"
              strokeWidth="1.5"
              filter="url(#shadow)"
              onMouseEnter={() => setHoveredPart('housing')}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-opacity"
              opacity={hoveredPart === 'housing' ? 0.85 : 1}
            />

            <rect
              x={(sensorWidthPx - topWidth) / 2 + 2}
              y={6}
              width={topWidth - 4}
              height={4}
              fill="url(#aluminumTop)"
              rx="1"
              opacity="0.6"
            />

            <rect
              x={sensorWidthPx * 0.04}
              y={profileHeight * 0.3}
              width={sensorWidthPx * 0.92}
              height={profileHeight * 0.4}
              fill="#3a3a3a"
              rx="2"
              onMouseEnter={() => setHoveredPart('groove')}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer"
              opacity={hoveredPart === 'groove' ? 0.7 : 0.9}
            />

            {quartzPositions.map((x, idx) => {
              const cy = profileHeight * 0.5;
              return (
                <g key={idx}
                  onMouseEnter={() => setHoveredPart('quartz')}
                  onMouseLeave={() => setHoveredPart(null)}
                  className="cursor-pointer"
                >
                  <rect
                    x={x - quartzSize / 2 - 1}
                    y={cy + quartzSize / 2}
                    width={quartzSize + 2}
                    height={2}
                    fill="url(#electrodeGrad)"
                    rx="0.5"
                  />
                  <rect
                    x={x - quartzSize / 2 + 1}
                    y={cy - quartzSize / 2 - 3}
                    width={quartzSize - 2}
                    height={1.5}
                    fill="url(#insulatorGrad)"
                    rx="0.5"
                    opacity="0.8"
                  />
                  <circle
                    cx={x}
                    cy={cy}
                    r={quartzSize / 2}
                    fill="url(#quartzGrad)"
                    stroke="#B8860B"
                    strokeWidth="0.8"
                    opacity={hoveredPart === 'quartz' ? 0.85 : 1}
                  />
                  <circle
                    cx={x - quartzSize * 0.15}
                    cy={cy - quartzSize * 0.15}
                    r={quartzSize * 0.2}
                    fill="white"
                    opacity="0.3"
                  />
                  <rect
                    x={x - quartzSize / 2 - 1}
                    y={cy - quartzSize / 2 - 1.5}
                    width={quartzSize + 2}
                    height={2}
                    fill="url(#electrodeGrad)"
                    rx="0.5"
                  />
                  {piezoLayers > 1 && quartzSize > 10 && (
                    <text
                      x={x}
                      y={cy + 1}
                      textAnchor="middle"
                      fontSize="6"
                      fill="#fff"
                      fontWeight="bold"
                      opacity="0.7"
                    >
                      {piezoLayers}
                    </text>
                  )}
                </g>
              );
            })}

            <line
              x1={sensorWidthPx * 0.05}
              y1={profileHeight * 0.35}
              x2={sensorWidthPx * 0.95}
              y2={profileHeight * 0.35}
              stroke="#CD7F32"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity="0.6"
              onMouseEnter={() => setHoveredPart('electrode')}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer"
            />
            <line
              x1={sensorWidthPx * 0.05}
              y1={profileHeight * 0.65}
              x2={sensorWidthPx * 0.95}
              y2={profileHeight * 0.65}
              stroke="#CD7F32"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity="0.6"
            />

            <rect
              x={-3}
              y={3}
              width={8}
              height={profileHeight - 1}
              fill="url(#sealGrad)"
              rx="2"
              stroke="#505050"
              strokeWidth="1"
              onMouseEnter={() => setHoveredPart('seal')}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer"
              opacity={hoveredPart === 'seal' ? 0.8 : 1}
            />

            <rect
              x={sensorWidthPx - 5}
              y={3}
              width={8}
              height={profileHeight - 1}
              fill="url(#sealGrad)"
              rx="2"
              stroke="#505050"
              strokeWidth="1"
              onMouseEnter={() => setHoveredPart('seal')}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer"
              opacity={hoveredPart === 'seal' ? 0.8 : 1}
            />

            <path
              d={`M ${sensorWidthPx + 3} ${profileHeight * 0.5}
                  Q ${sensorWidthPx + 15} ${profileHeight * 0.5} ${sensorWidthPx + 15} ${profileHeight * 0.5 + 15}
                  L ${sensorWidthPx + 15} ${profileHeight + 25}`}
              fill="none"
              stroke="#333"
              strokeWidth="4"
              strokeLinecap="round"
              onMouseEnter={() => setHoveredPart('cable')}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer"
            />
            <circle
              cx={sensorWidthPx + 3}
              cy={profileHeight * 0.5}
              r="4"
              fill="#555"
              stroke="#333"
              strokeWidth="1"
            />
            <path
              d={`M ${sensorWidthPx + 15} ${profileHeight * 0.5 + 15}
                  L ${sensorWidthPx + 15} ${profileHeight + 25}`}
              fill="none"
              stroke="#CD7F32"
              strokeWidth="1"
              strokeDasharray="2 3"
              opacity="0.5"
            />

            <line x1="0" y1={profileHeight + 20} x2={sensorWidthPx} y2={profileHeight + 20} stroke="hsl(var(--primary))" strokeWidth="1" markerEnd="url(#arrowEnd)" markerStart="url(#arrowStart)" />
            <line x1="0" y1={profileHeight + 15} x2="0" y2={profileHeight + 25} stroke="hsl(var(--primary))" strokeWidth="1" />
            <line x1={sensorWidthPx} y1={profileHeight + 15} x2={sensorWidthPx} y2={profileHeight + 25} stroke="hsl(var(--primary))" strokeWidth="1" />

            <defs>
              <marker id="arrowEnd" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="hsl(var(--primary))" />
              </marker>
              <marker id="arrowStart" markerWidth="6" markerHeight="4" refX="0" refY="2" orient="auto">
                <polygon points="6 0, 0 2, 6 4" fill="hsl(var(--primary))" />
              </marker>
            </defs>

            {[0.15, 0.85].map((ratio, i) => (
              <line
                key={i}
                x1={sensorWidthPx * 0.02}
                y1={profileHeight * ratio}
                x2={sensorWidthPx * 0.98}
                y2={profileHeight * ratio}
                stroke="#999"
                strokeWidth="0.5"
                opacity="0.4"
              />
            ))}
          </svg>

          <Badge variant="secondary" className="font-mono text-xs mt-2">
            {materialName} × {piezoElementsCount} — {length.toFixed(2)} м
          </Badge>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Поперечное сечение (вид с торца)</p>
          <svg width="160" height="130" viewBox="-10 -5 180 140">
            <defs>
              <linearGradient id="csAlum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D0D0D0" />
                <stop offset="100%" stopColor="#909090" />
              </linearGradient>
            </defs>
            <polygon
              points="25,5 135,5 160,120 0,120"
              fill="url(#csAlum)"
              stroke="#707070"
              strokeWidth="2"
            />
            <rect x="45" y="35" width="70" height="55" fill="#2a2a2a" rx="3" />
            {Array.from({ length: Math.min(piezoLayers, 5) }).map((_, i) => {
              const layerH = 40 / Math.min(piezoLayers, 5);
              const y = 42 + i * layerH;
              return (
                <g key={i}>
                  <rect x="60" y={y} width="40" height={layerH * 0.6} fill="#DAA520" rx="1" />
                  <rect x="58" y={y + layerH * 0.6} width="44" height={layerH * 0.2} fill="#CD7F32" rx="0.5" />
                </g>
              );
            })}
            <line x1="80" y1="15" x2="80" y2="32" stroke="hsl(var(--primary))" strokeWidth="1.5" markerEnd="url(#arrowEnd)" />
            <text x="90" y="25" fontSize="8" fill="hsl(var(--primary))">F</text>
          </svg>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center space-y-1 p-3 rounded border" style={{ background: 'rgba(192,192,192,0.15)', borderColor: 'rgba(192,192,192,0.4)' }}>
            <Icon name="Box" size={18} className="mx-auto" style={{ color: '#A0A0A0' }} />
            <p className="text-xs font-semibold">Алюм. профиль</p>
            <p className="font-mono text-xs text-muted-foreground">{housingThickness} мм</p>
          </div>
          <div className="text-center space-y-1 p-3 rounded border" style={{ background: 'rgba(218,165,32,0.12)', borderColor: 'rgba(218,165,32,0.4)' }}>
            <Icon name="Hexagon" size={18} className="mx-auto" style={{ color: '#DAA520' }} />
            <p className="text-xs font-semibold">Кварцевые диски</p>
            <p className="font-mono text-xs text-muted-foreground">{piezoElementsCount} шт × {piezoLayers}сл</p>
          </div>
          <div className="text-center space-y-1 p-3 rounded border" style={{ background: 'rgba(205,127,50,0.12)', borderColor: 'rgba(205,127,50,0.4)' }}>
            <Icon name="Zap" size={18} className="mx-auto" style={{ color: '#CD7F32' }} />
            <p className="text-xs font-semibold">Электроды Cu/Ag</p>
            <p className="font-mono text-xs text-muted-foreground">{contactPlateThickness} мм</p>
          </div>
          <div className="text-center space-y-1 p-3 rounded border" style={{ background: 'rgba(46,139,87,0.12)', borderColor: 'rgba(46,139,87,0.4)' }}>
            <Icon name="Shield" size={18} className="mx-auto" style={{ color: '#2E8B57' }} />
            <p className="text-xs font-semibold">Изоляция</p>
            <p className="font-mono text-xs text-muted-foreground">{insulatorThickness} мм</p>
          </div>
        </div>
      </div>
    );
  }

  // 3D view
  const w3d = Math.min(length * 280, 600);
  const h3d = 50;
  const d3d = 30;
  const wallThick = Math.max(3, housingThickness * 1.5);
  const cutRatio = 0.45;

  const get3dQuartzPositions = () => {
    const positions: number[] = [];
    const margin = w3d * 0.06;
    const usable = w3d - margin * 2;
    for (let i = 0; i < piezoElementsCount; i++) {
      if (piezoElementsCount === 1) {
        positions.push(w3d / 2);
      } else {
        positions.push(margin + (i / (piezoElementsCount - 1)) * usable);
      }
    }
    return positions;
  };

  const q3dPositions = get3dQuartzPositions();
  const q3dSize = Math.max(4, Math.min(12, 160 / piezoElementsCount));

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Button
          variant={cutaway ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCutaway(!cutaway)}
          className="gap-2"
        >
          <Icon name="Scissors" size={16} />
          {cutaway ? 'Разрез включён' : 'Показать разрез'}
        </Button>
      </div>

      <div
        className="relative w-full flex items-center justify-center"
        style={{ minHeight: '420px', perspective: '1200px' }}
      >
        <div
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          <div style={{ position: 'relative', transformStyle: 'preserve-3d', width: `${w3d}px`, height: `${h3d}px` }}>

            {/* === FRONT FACE === */}
            {cutaway ? (
              <>
                {/* Front upper part (above cut) */}
                <div
                  style={{
                    position: 'absolute',
                    width: `${w3d}px`,
                    height: `${h3d * cutRatio}px`,
                    top: 0,
                    transform: `translateZ(${d3d / 2}px)`,
                    background: 'linear-gradient(180deg, #D0D0D0 0%, #B8B8B8 100%)',
                    borderRadius: '2px 2px 0 0',
                    border: '1px solid #808080',
                    borderBottom: 'none',
                    clipPath: `polygon(2% 0%, 98% 0%, ${98 + 2 * cutRatio}% 100%, ${2 - 2 * cutRatio}% 100%)`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                  onMouseEnter={() => setHoveredPart('housing')}
                  onMouseLeave={() => setHoveredPart(null)}
                >
                  <div style={{ position: 'absolute', top: '30%', left: '2%', right: '2%', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
                </div>

                {/* Front cut face — internal cross section visible */}
                <div
                  style={{
                    position: 'absolute',
                    width: `${w3d}px`,
                    height: `${h3d * (1 - cutRatio)}px`,
                    top: `${h3d * cutRatio}px`,
                    transform: `translateZ(${d3d / 2}px)`,
                    background: '#2a2a2a',
                    borderRadius: '0 0 2px 2px',
                    borderLeft: '1px solid #808080',
                    borderRight: '1px solid #808080',
                    borderBottom: '1px solid #808080',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={() => setHoveredPart('groove')}
                  onMouseLeave={() => setHoveredPart(null)}
                >
                  {/* Walls visible in cut */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, width: `${wallThick}px`, height: '100%',
                    background: 'linear-gradient(90deg, #A0A0A0, #C0C0C0)',
                    borderRight: '1px solid #707070',
                  }} />
                  <div style={{
                    position: 'absolute', right: 0, top: 0, width: `${wallThick}px`, height: '100%',
                    background: 'linear-gradient(90deg, #C0C0C0, #A0A0A0)',
                    borderLeft: '1px solid #707070',
                  }} />
                  <div style={{
                    position: 'absolute', left: 0, bottom: 0, width: '100%', height: `${wallThick}px`,
                    background: 'linear-gradient(180deg, #B0B0B0, #909090)',
                    borderTop: '1px solid #707070',
                  }} />

                  {/* Signal wire bus */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '15%',
                      left: `${wallThick + 2}px`,
                      right: `${wallThick + 2}px`,
                      height: '2px',
                      background: 'repeating-linear-gradient(90deg, #CD7F32 0px, #CD7F32 6px, transparent 6px, transparent 10px)',
                      opacity: 0.7,
                    }}
                    onMouseEnter={() => setHoveredPart('wireBus')}
                    onMouseLeave={() => setHoveredPart(null)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: `${wallThick + 4}px`,
                      left: `${wallThick + 2}px`,
                      right: `${wallThick + 2}px`,
                      height: '2px',
                      background: 'repeating-linear-gradient(90deg, #CD7F32 0px, #CD7F32 6px, transparent 6px, transparent 10px)',
                      opacity: 0.7,
                    }}
                  />

                  {/* Quartz elements visible inside */}
                  {q3dPositions.map((x, idx) => {
                    const leftPx = (x / w3d) * 100;
                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredPart('quartz')}
                        onMouseLeave={() => setHoveredPart(null)}
                        style={{ position: 'absolute', left: `${leftPx}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                      >
                        {/* Electrode top */}
                        <div style={{
                          position: 'absolute',
                          top: `-${q3dSize / 2 + 3}px`,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: `${q3dSize + 4}px`,
                          height: '2px',
                          background: '#CD7F32',
                          borderRadius: '1px',
                        }} />
                        {/* Quartz disk */}
                        <div style={{
                          width: `${q3dSize}px`,
                          height: `${q3dSize}px`,
                          borderRadius: '50%',
                          background: 'radial-gradient(circle at 35% 35%, #FFD700, #DAA520 50%, #B8860B)',
                          border: '1px solid #B8860B',
                          boxShadow: '0 0 4px rgba(218,165,32,0.4)',
                        }} />
                        {/* Electrode bottom */}
                        <div style={{
                          position: 'absolute',
                          bottom: `-3px`,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: `${q3dSize + 4}px`,
                          height: '2px',
                          background: '#CD7F32',
                          borderRadius: '1px',
                        }} />
                        {/* Insulator hint */}
                        <div style={{
                          position: 'absolute',
                          top: `-${q3dSize / 2 + 6}px`,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: `${q3dSize - 2}px`,
                          height: '1.5px',
                          background: '#2E8B57',
                          borderRadius: '1px',
                          opacity: 0.7,
                        }} />
                      </div>
                    );
                  })}
                </div>

                {/* Cut edge highlight line */}
                <div
                  style={{
                    position: 'absolute',
                    width: `${w3d}px`,
                    height: '2px',
                    top: `${h3d * cutRatio - 1}px`,
                    transform: `translateZ(${d3d / 2}px)`,
                    background: 'linear-gradient(90deg, #ff6b6b, #ee5a24, #ff6b6b)',
                    boxShadow: '0 0 6px rgba(255,107,107,0.5)',
                    zIndex: 10,
                  }}
                />
              </>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  width: `${w3d}px`,
                  height: `${h3d}px`,
                  transform: `translateZ(${d3d / 2}px)`,
                  background: 'linear-gradient(180deg, #D0D0D0 0%, #A0A0A0 100%)',
                  borderRadius: '2px',
                  border: '1px solid #808080',
                  clipPath: `polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
                onMouseEnter={() => setHoveredPart('housing')}
                onMouseLeave={() => setHoveredPart(null)}
              >
                {[0.2, 0.8].map((r, i) => (
                  <div key={i} style={{ position: 'absolute', top: `${r * 100}%`, left: '2%', right: '2%', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
                ))}
                {q3dPositions.map((x, idx) => {
                  const ratio = x / w3d;
                  return (
                    <div key={idx} style={{
                      position: 'absolute', left: `${ratio * 100}%`, top: '50%', transform: 'translate(-50%, -50%)',
                      width: `${Math.max(4, q3dSize * 0.6)}px`, height: `${Math.max(4, q3dSize * 0.6)}px`,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(218,165,32,0.5) 0%, rgba(218,165,32,0.1) 100%)',
                      border: '1px solid rgba(218,165,32,0.3)',
                    }} />
                  );
                })}
              </div>
            )}

            {/* === BACK FACE === */}
            <div
              style={{
                position: 'absolute',
                width: `${w3d}px`,
                height: `${h3d}px`,
                transform: `translateZ(-${d3d / 2}px) rotateY(180deg)`,
                background: 'linear-gradient(180deg, #B0B0B0 0%, #808080 100%)',
                borderRadius: '2px',
                border: '1px solid #707070',
                clipPath: `polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)`,
              }}
            />

            {/* === TOP FACE === */}
            {cutaway ? (
              <>
                {/* Top face — partially cut away, show internal */}
                <div
                  style={{
                    position: 'absolute',
                    width: `${w3d * 0.96}px`,
                    height: `${d3d * cutRatio}px`,
                    left: `${w3d * 0.02}px`,
                    top: 0,
                    transform: `rotateX(90deg)`,
                    transformOrigin: 'top center',
                    background: 'linear-gradient(180deg, #E0E0E0 0%, #C8C8C8 100%)',
                    border: '1px solid #A0A0A0',
                    borderRadius: '1px',
                  }}
                />
                {/* Internal top surface visible in cutaway */}
                <div
                  style={{
                    position: 'absolute',
                    width: `${w3d * 0.96 - wallThick * 2}px`,
                    height: `${d3d * (1 - cutRatio)}px`,
                    left: `${w3d * 0.02 + wallThick}px`,
                    top: 0,
                    transform: `rotateX(90deg) translateZ(-${d3d * cutRatio}px)`,
                    transformOrigin: 'top center',
                    background: '#3a3a3a',
                    border: '1px solid #505050',
                  }}
                >
                  {/* Quartz from top view in cutaway */}
                  {q3dPositions.map((x, idx) => {
                    const leftPx = ((x - w3d * 0.02 - wallThick) / (w3d * 0.96 - wallThick * 2)) * 100;
                    return (
                      <div key={idx} style={{
                        position: 'absolute', left: `${leftPx}%`, top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: `${Math.max(3, q3dSize * 0.5)}px`,
                        height: `${Math.max(3, q3dSize * 0.5)}px`,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #FFD700, #B8860B)',
                        border: '1px solid #8B6914',
                      }} />
                    );
                  })}
                </div>
                {/* Left wall top */}
                <div style={{
                  position: 'absolute',
                  width: `${wallThick}px`,
                  height: `${d3d * (1 - cutRatio)}px`,
                  left: `${w3d * 0.02}px`,
                  top: 0,
                  transform: `rotateX(90deg) translateZ(-${d3d * cutRatio}px)`,
                  transformOrigin: 'top center',
                  background: 'linear-gradient(90deg, #C0C0C0, #D0D0D0)',
                  border: '1px solid #A0A0A0',
                }} />
                {/* Right wall top */}
                <div style={{
                  position: 'absolute',
                  width: `${wallThick}px`,
                  height: `${d3d * (1 - cutRatio)}px`,
                  left: `${w3d * 0.98 - wallThick}px`,
                  top: 0,
                  transform: `rotateX(90deg) translateZ(-${d3d * cutRatio}px)`,
                  transformOrigin: 'top center',
                  background: 'linear-gradient(90deg, #D0D0D0, #C0C0C0)',
                  border: '1px solid #A0A0A0',
                }} />
              </>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  width: `${w3d * 0.96}px`,
                  height: `${d3d}px`,
                  left: `${w3d * 0.02}px`,
                  transform: `rotateX(90deg) translateZ(-${0}px)`,
                  transformOrigin: 'top center',
                  background: 'linear-gradient(180deg, #E0E0E0 0%, #C8C8C8 100%)',
                  border: '1px solid #A0A0A0',
                  borderRadius: '1px',
                }}
              />
            )}

            {/* === BOTTOM FACE === */}
            <div
              style={{
                position: 'absolute',
                width: `${w3d}px`,
                height: `${d3d}px`,
                transform: `rotateX(-90deg) translateZ(${h3d}px)`,
                transformOrigin: 'bottom center',
                background: 'linear-gradient(180deg, #909090 0%, #707070 100%)',
                border: '1px solid #606060',
                borderRadius: '1px',
              }}
            />

            {/* === LEFT END CAP === */}
            <div
              style={{
                position: 'absolute',
                width: `${d3d}px`,
                height: `${h3d}px`,
                transform: `rotateY(-90deg) translateZ(0px)`,
                transformOrigin: 'left center',
                background: 'linear-gradient(90deg, #707070 0%, #909090 100%)',
                border: '1px solid #606060',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
              onMouseEnter={() => setHoveredPart('seal')}
              onMouseLeave={() => setHoveredPart(null)}
            >
              {cutaway && (
                <>
                  <div style={{
                    position: 'absolute', top: `${cutRatio * 100}%`, left: wallThick, right: wallThick, bottom: wallThick,
                    background: '#2a2a2a', border: '1px solid #404040',
                  }}>
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: 'radial-gradient(circle, #FFD700, #B8860B)', border: '1px solid #8B6914',
                    }} />
                  </div>
                  <div style={{
                    position: 'absolute', top: `${cutRatio * 100}%`, left: 0, right: 0, height: '2px',
                    background: 'linear-gradient(90deg, #ff6b6b, #ee5a24, #ff6b6b)',
                    boxShadow: '0 0 4px rgba(255,107,107,0.4)',
                  }} />
                </>
              )}
            </div>

            {/* === RIGHT END CAP === */}
            <div
              style={{
                position: 'absolute',
                width: `${d3d}px`,
                height: `${h3d}px`,
                left: `${w3d}px`,
                transform: `rotateY(90deg)`,
                transformOrigin: 'left center',
                background: 'linear-gradient(90deg, #909090 0%, #707070 100%)',
                border: '1px solid #606060',
                borderRadius: '2px',
              }}
              onMouseEnter={() => setHoveredPart('cable')}
              onMouseLeave={() => setHoveredPart(null)}
            >
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '10px', height: '10px', borderRadius: '50%',
                background: '#333', border: '2px solid #555',
              }} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '4px', height: '4px', borderRadius: '50%',
                background: '#CD7F32',
              }} />
            </div>

            {/* === CUTAWAY: internal back wall visible === */}
            {cutaway && (
              <div
                style={{
                  position: 'absolute',
                  width: `${w3d}px`,
                  height: `${h3d * (1 - cutRatio)}px`,
                  top: `${h3d * cutRatio}px`,
                  transform: `translateZ(-${d3d / 2}px)`,
                  background: '#2a2a2a',
                  borderRadius: '0 0 2px 2px',
                  border: '1px solid #505050',
                  borderTop: 'none',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', left: 0, top: 0, width: `${wallThick}px`, height: '100%',
                  background: 'linear-gradient(90deg, #909090, #A8A8A8)',
                }} />
                <div style={{
                  position: 'absolute', right: 0, top: 0, width: `${wallThick}px`, height: '100%',
                  background: 'linear-gradient(90deg, #A8A8A8, #909090)',
                }} />
                <div style={{
                  position: 'absolute', left: 0, bottom: 0, width: '100%', height: `${wallThick}px`,
                  background: 'linear-gradient(180deg, #A0A0A0, #808080)',
                }} />
              </div>
            )}

            {/* Dimension label */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '-28px',
                transform: `translateZ(${d3d / 2 + 10}px) translateX(-50%)`,
                zIndex: 20,
              }}
            >
              <Badge variant="secondary" className="font-mono text-xs shadow-lg">
                {materialName} × {piezoElementsCount} — {length.toFixed(2)} м
              </Badge>
            </div>
          </div>
        </div>

        {hoveredPart && partInfo[hoveredPart] && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-card border shadow-lg rounded px-4 py-2 text-sm">
            <span className="font-semibold">{partInfo[hoveredPart].label}</span>
            <span className="text-muted-foreground ml-2">— {partInfo[hoveredPart].detail}</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-4 relative z-10">
        <div className="text-center space-y-1 bg-card/80 p-3 rounded border">
          <Icon name="Layers" size={20} className="mx-auto" style={{ color: '#A0A0A0' }} />
          <p className="text-xs font-semibold">Алюм. профиль</p>
          <p className="font-mono text-xs text-muted-foreground">Трапецеидальное сечение</p>
        </div>
        <div className="text-center space-y-1 bg-card/80 p-3 rounded border">
          <Icon name="Hexagon" size={20} className="mx-auto" style={{ color: '#DAA520' }} />
          <p className="text-xs font-semibold">Кварцевые элементы</p>
          <p className="font-mono text-xs text-muted-foreground">{piezoElementsCount} шт под преднатягом</p>
        </div>
        <div className="text-center space-y-1 bg-card/80 p-3 rounded border">
          <Icon name="Shield" size={20} className="mx-auto" style={{ color: '#2E8B57' }} />
          <p className="text-xs font-semibold">Герметизация</p>
          <p className="font-mono text-xs text-muted-foreground">IP68, сварные швы</p>
        </div>
      </div>

      {cutaway && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center space-y-1 p-2 rounded border border-dashed" style={{ borderColor: 'rgba(255,107,107,0.4)', background: 'rgba(255,107,107,0.05)' }}>
            <div className="w-6 h-0.5 mx-auto rounded" style={{ background: 'linear-gradient(90deg, #ff6b6b, #ee5a24)' }} />
            <p className="text-xs text-muted-foreground">Линия разреза</p>
          </div>
          <div className="text-center space-y-1 p-2 rounded border border-dashed" style={{ borderColor: 'rgba(42,42,42,0.4)', background: 'rgba(42,42,42,0.05)' }}>
            <div className="w-6 h-3 mx-auto rounded" style={{ background: '#3a3a3a' }} />
            <p className="text-xs text-muted-foreground">Внутренняя полость</p>
          </div>
          <div className="text-center space-y-1 p-2 rounded border border-dashed" style={{ borderColor: 'rgba(205,127,50,0.4)', background: 'rgba(205,127,50,0.05)' }}>
            <div className="w-6 h-0.5 mx-auto rounded" style={{ background: 'repeating-linear-gradient(90deg, #CD7F32 0px, #CD7F32 3px, transparent 3px, transparent 5px)' }} />
            <p className="text-xs text-muted-foreground">Сигнальная шина</p>
          </div>
          <div className="text-center space-y-1 p-2 rounded border border-dashed" style={{ borderColor: 'rgba(218,165,32,0.4)', background: 'rgba(218,165,32,0.05)' }}>
            <div className="w-3 h-3 mx-auto rounded-full" style={{ background: 'radial-gradient(circle, #FFD700, #B8860B)' }} />
            <p className="text-xs text-muted-foreground">Кварцевый диск</p>
          </div>
        </div>
      )}
    </div>
  );
}
