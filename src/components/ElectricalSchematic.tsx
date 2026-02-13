import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface SchematicProps {
  sensitivity: number;
  frequency: number;
  piezoCoefficient: number;
  materialName: string;
  piezoElementsCount: number;
}

const ElectricalSchematic = ({ sensitivity, frequency, piezoCoefficient, materialName, piezoElementsCount }: SchematicProps) => {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  const Cf = (piezoCoefficient * 8.85e-12 * 0.01 / 0.002 * 1e12).toFixed(1);
  const Rf = (1 / (2 * Math.PI * frequency * parseFloat(Cf) * 1e-12) / 1e6).toFixed(2);
  const gain = (sensitivity * 0.1).toFixed(1);
  const Vout = (sensitivity * 100 / 1000).toFixed(2);

  const componentInfo: Record<string, { name: string; value: string; description: string }> = {
    'piezo': { name: 'Пьезоэлемент', value: `${piezoCoefficient} пКл/Н`, description: 'Кварцевый преобразователь силы в заряд' },
    'Cp': { name: 'Ёмкость пьезоэлемента Cp', value: `${Cf} пФ`, description: 'Собственная ёмкость кварцевого элемента' },
    'Rp': { name: 'Сопротивление утечки Rp', value: `${(parseFloat(Rf) * 100).toFixed(0)} ГОм`, description: 'Сопротивление изоляции пьезоэлемента' },
    'Cf_fb': { name: 'Обратная связь Cf', value: `${Cf} пФ`, description: 'Конденсатор обратной связи зарядового усилителя' },
    'Rf_fb': { name: 'Обратная связь Rf', value: `${Rf} МОм`, description: 'Резистор разряда для установки нижней частоты среза' },
    'opamp1': { name: 'ОУ зарядовый', value: 'INA116 / AD8615', description: 'Операционный усилитель с высоким входным импедансом' },
    'opamp2': { name: 'ОУ фильтр', value: 'OPA2277', description: 'Прецизионный ОУ для фильтра Баттерворта 2-го порядка' },
    'R1': { name: 'R1', value: '10 кОм', description: 'Входной резистор фильтра низких частот' },
    'R2': { name: 'R2', value: '10 кОм', description: 'Резистор обратной связи фильтра' },
    'C1': { name: 'C1 фильтра', value: '10 нФ', description: 'Конденсатор ФНЧ, частота среза ~1.6 кГц' },
    'C2': { name: 'C2 фильтра', value: '4.7 нФ', description: 'Конденсатор ФНЧ для формирования АЧХ' },
    'Rg1': { name: 'R усиления', value: `${(10 / parseFloat(gain)).toFixed(1)} кОм`, description: 'Резистор регулировки коэффициента усиления' },
    'Rg2': { name: 'R обратной связи', value: '10 кОм', description: 'Резистор обратной связи выходного каскада' },
    'opamp3': { name: 'ОУ выходной', value: 'OPA2277', description: 'Выходной усилитель с регулируемым усилением' },
    'gen_osc': { name: 'Генератор', value: `${frequency} Гц`, description: 'Кварцевый генератор опорной частоты' },
    'gen_amp': { name: 'Усилитель мощности', value: '±15 В', description: 'Мостовой усилитель для возбуждения пьезоэлемента' },
    'gen_match': { name: 'Согласующая цепь', value: 'LC-контур', description: 'Согласование импеданса генератора и пьезоэлемента' },
    'gen_piezo': { name: 'Пьезоизлучатель', value: `${piezoElementsCount} шт`, description: 'Кварцевые пьезоэлементы в режиме излучения' },
    'gen_feedback': { name: 'Цепь ОС', value: 'АРУ', description: 'Автоматическая регулировка уровня возбуждения' },
    'Vref': { name: 'Опорное напряжение', value: '2.5 В', description: 'Прецизионный источник опорного напряжения REF2025' },
    'adc': { name: 'АЦП', value: 'ADS1256 24-бит', description: 'Сигма-дельта АЦП для прецизионного измерения' },
  };

  const currentInfo = hoveredComponent ? componentInfo[hoveredComponent] : null;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Tabs defaultValue="converter" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="converter" className="flex items-center gap-2">
              <Icon name="ArrowRightLeft" size={16} />
              Преобразователь заряда
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Icon name="Radio" size={16} />
              Генератор возбуждения
            </TabsTrigger>
          </TabsList>

          <TabsContent value="converter">
            <Card className="p-6">
              <div className="flex items-center gap-2 border-b pb-3 mb-4">
                <Icon name="Cpu" size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Зарядовый усилитель + ФНЧ + выход</h2>
              </div>

              <div className="bg-muted/20 rounded-lg border-2 border-dashed border-border p-4 overflow-x-auto">
                <svg viewBox="0 0 900 480" className="w-full min-w-[700px]" style={{ height: 'auto', maxHeight: '500px' }}>
                  <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--primary))" />
                    </marker>
                    <marker id="arrowhead-muted" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--muted-foreground))" />
                    </marker>
                  </defs>

                  <rect x="20" y="120" width="80" height="120" rx="8" 
                    fill={hoveredComponent === 'piezo' ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--primary) / 0.1)'}
                    stroke="hsl(var(--primary))" strokeWidth="2" className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredComponent('piezo')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="60" y="170" textAnchor="middle" className="fill-primary text-xs font-semibold">Пьезо</text>
                  <text x="60" y="188" textAnchor="middle" className="fill-muted-foreground text-[10px]">{materialName}</text>
                  <text x="60" y="205" textAnchor="middle" className="fill-muted-foreground text-[10px]">×{piezoElementsCount}</text>
                  <line x1="35" y1="140" x2="35" y2="145" stroke="hsl(var(--primary))" strokeWidth="1.5" />
                  <line x1="85" y1="140" x2="85" y2="145" stroke="hsl(var(--primary))" strokeWidth="1.5" />
                  <line x1="35" y1="215" x2="35" y2="220" stroke="hsl(var(--primary))" strokeWidth="1.5" />
                  <line x1="85" y1="215" x2="85" y2="220" stroke="hsl(var(--primary))" strokeWidth="1.5" />

                  <line x1="100" y1="150" x2="140" y2="150" stroke="hsl(var(--foreground))" strokeWidth="1.5" />

                  <rect x="140" y="130" width="30" height="40" rx="2"
                    fill={hoveredComponent === 'Cp' ? 'hsl(var(--accent) / 0.3)' : 'hsl(var(--accent) / 0.1)'}
                    stroke="hsl(var(--accent))" strokeWidth="1.5" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('Cp')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="155" y="155" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">Cp</text>
                  <text x="155" y="120" textAnchor="middle" className="fill-muted-foreground text-[9px]">{Cf}пФ</text>

                  <rect x="140" y="200" width="30" height="40" rx="2"
                    fill={hoveredComponent === 'Rp' ? 'hsl(var(--accent) / 0.3)' : 'hsl(var(--accent) / 0.1)'}
                    stroke="hsl(var(--accent))" strokeWidth="1.5" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('Rp')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="155" y="225" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">Rp</text>
                  <text x="155" y="250" textAnchor="middle" className="fill-muted-foreground text-[9px]">{(parseFloat(Rf)*100).toFixed(0)}ГОм</text>

                  <line x1="155" y1="170" x2="155" y2="200" stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="3,2" />
                  <line x1="100" y1="210" x2="140" y2="210" stroke="hsl(var(--foreground))" strokeWidth="1.5" />

                  <line x1="170" y1="150" x2="220" y2="150" stroke="hsl(var(--foreground))" strokeWidth="1.5" />

                  <text x="250" y="100" textAnchor="middle" className="fill-muted-foreground text-[9px]">Cf = {Cf}пФ</text>
                  <rect x="225" y="108" width="50" height="20" rx="2"
                    fill={hoveredComponent === 'Cf_fb' ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--primary) / 0.1)'}
                    stroke="hsl(var(--primary))" strokeWidth="1.5" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('Cf_fb')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="250" y="122" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">Cf</text>

                  <text x="250" y="70" textAnchor="middle" className="fill-muted-foreground text-[9px]">Rf = {Rf}МОм</text>
                  <rect x="225" y="76" width="50" height="20" rx="2"
                    fill={hoveredComponent === 'Rf_fb' ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--primary) / 0.1)'}
                    stroke="hsl(var(--primary))" strokeWidth="1.5" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('Rf_fb')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="250" y="90" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">Rf</text>

                  <line x1="220" y1="86" x2="225" y2="86" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="275" y1="86" x2="310" y2="86" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="220" y1="118" x2="225" y2="118" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="275" y1="118" x2="310" y2="118" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="220" y1="86" x2="220" y2="150" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="310" y1="86" x2="310" y2="150" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <polygon points="220,140 280,170 220,200"
                    fill={hoveredComponent === 'opamp1' ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--card))'}
                    stroke="hsl(var(--primary))" strokeWidth="2" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('opamp1')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="240" y="174" className="fill-primary text-[10px] font-bold">OA1</text>
                  <text x="215" y="155" textAnchor="end" className="fill-foreground text-[10px]">−</text>
                  <text x="215" y="195" textAnchor="end" className="fill-foreground text-[10px]">+</text>

                  <line x1="155" y1="210" x2="155" y2="300" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="155" y1="300" x2="220" y2="300" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="220" y1="195" x2="220" y2="300" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <line x1="155" y1="300" x2="145" y2="310" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
                  <line x1="155" y1="300" x2="165" y2="310" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
                  <line x1="145" y1="310" x2="165" y2="310" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
                  <text x="155" y="325" textAnchor="middle" className="fill-muted-foreground text-[9px]">GND</text>

                  <rect x="295" y="180" width="50" height="20" rx="2"
                    fill={hoveredComponent === 'Vref' ? 'hsl(var(--accent) / 0.3)' : 'hsl(var(--accent) / 0.1)'}
                    stroke="hsl(var(--accent))" strokeWidth="1.5" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('Vref')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="320" y="194" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">2.5В</text>
                  <line x1="295" y1="190" x2="220" y2="190" stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="3,2" />

                  <line x1="280" y1="170" x2="350" y2="170" stroke="hsl(var(--foreground))" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                  <text x="315" y="162" textAnchor="middle" className="fill-muted-foreground text-[9px]">Vqa</text>

                  <rect x="365" y="130" width="50" height="20" rx="2"
                    fill={hoveredComponent === 'R1' ? 'hsl(var(--accent) / 0.3)' : 'hsl(var(--accent) / 0.1)'}
                    stroke="hsl(var(--accent))" strokeWidth="1.5" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('R1')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="390" y="145" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">R1</text>
                  <text x="390" y="125" textAnchor="middle" className="fill-muted-foreground text-[9px]">10k</text>

                  <rect x="430" y="130" width="50" height="20" rx="2"
                    fill={hoveredComponent === 'R2' ? 'hsl(var(--accent) / 0.3)' : 'hsl(var(--accent) / 0.1)'}
                    stroke="hsl(var(--accent))" strokeWidth="1.5" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('R2')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="455" y="145" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">R2</text>
                  <text x="455" y="125" textAnchor="middle" className="fill-muted-foreground text-[9px]">10k</text>

                  <line x1="350" y1="170" x2="365" y2="170" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
                  <line x1="365" y1="170" x2="365" y2="150" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="415" y1="140" x2="430" y2="140" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <rect x="415" y="168" width="30" height="20" rx="2"
                    fill={hoveredComponent === 'C1' ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--primary) / 0.1)'}
                    stroke="hsl(var(--primary))" strokeWidth="1.5" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('C1')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="430" y="182" textAnchor="middle" className="fill-foreground text-[9px] font-semibold">C1</text>
                  <text x="430" y="200" textAnchor="middle" className="fill-muted-foreground text-[8px]">10нФ</text>

                  <line x1="430" y1="150" x2="430" y2="168" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="430" y1="188" x2="430" y2="210" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="420" y1="210" x2="440" y2="210" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="425" y1="215" x2="435" y2="215" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <rect x="470" y="168" width="30" height="20" rx="2"
                    fill={hoveredComponent === 'C2' ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--primary) / 0.1)'}
                    stroke="hsl(var(--primary))" strokeWidth="1.5" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('C2')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="485" y="182" textAnchor="middle" className="fill-foreground text-[9px] font-semibold">C2</text>
                  <text x="485" y="200" textAnchor="middle" className="fill-muted-foreground text-[8px]">4.7нФ</text>

                  <line x1="480" y1="140" x2="500" y2="140" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="500" y1="140" x2="500" y2="155" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <polygon points="500,155 560,185 500,215"
                    fill={hoveredComponent === 'opamp2' ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--card))'}
                    stroke="hsl(var(--primary))" strokeWidth="2" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('opamp2')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="520" y="189" className="fill-primary text-[10px] font-bold">OA2</text>
                  <text x="496" y="170" textAnchor="end" className="fill-foreground text-[10px]">−</text>
                  <text x="496" y="210" textAnchor="end" className="fill-foreground text-[10px]">+</text>

                  <line x1="485" y1="188" x2="485" y2="240" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="485" y1="240" x2="570" y2="240" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="570" y1="240" x2="570" y2="185" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="560" y1="185" x2="570" y2="185" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <line x1="500" y1="210" x2="500" y2="260" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="490" y1="260" x2="510" y2="260" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="495" y1="265" x2="505" y2="265" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <line x1="570" y1="185" x2="620" y2="185" stroke="hsl(var(--foreground))" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                  <text x="595" y="178" textAnchor="middle" className="fill-muted-foreground text-[9px]">Vf</text>

                  <rect x="635" y="145" width="50" height="20" rx="2"
                    fill={hoveredComponent === 'Rg1' ? 'hsl(var(--accent) / 0.3)' : 'hsl(var(--accent) / 0.1)'}
                    stroke="hsl(var(--accent))" strokeWidth="1.5" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('Rg1')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="660" y="159" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">Rg</text>
                  <text x="660" y="140" textAnchor="middle" className="fill-muted-foreground text-[9px]">{(10/parseFloat(gain)).toFixed(1)}k</text>

                  <rect x="700" y="110" width="50" height="20" rx="2"
                    fill={hoveredComponent === 'Rg2' ? 'hsl(var(--accent) / 0.3)' : 'hsl(var(--accent) / 0.1)'}
                    stroke="hsl(var(--accent))" strokeWidth="1.5" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('Rg2')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="725" y="124" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">Rfb</text>
                  <text x="725" y="105" textAnchor="middle" className="fill-muted-foreground text-[9px]">10k</text>

                  <line x1="620" y1="185" x2="635" y2="185" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="635" y1="185" x2="635" y2="165" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="685" y1="155" x2="700" y2="155" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="700" y1="155" x2="700" y2="130" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="750" y1="120" x2="780" y2="120" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="780" y1="120" x2="780" y2="185" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <line x1="685" y1="155" x2="685" y2="170" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <polygon points="685,170 745,200 685,230"
                    fill={hoveredComponent === 'opamp3' ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--card))'}
                    stroke="hsl(var(--primary))" strokeWidth="2" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('opamp3')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="705" y="204" className="fill-primary text-[10px] font-bold">OA3</text>
                  <text x="681" y="185" textAnchor="end" className="fill-foreground text-[10px]">−</text>
                  <text x="681" y="225" textAnchor="end" className="fill-foreground text-[10px]">+</text>

                  <line x1="685" y1="225" x2="685" y2="270" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="675" y1="270" x2="695" y2="270" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="680" y1="275" x2="690" y2="275" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <line x1="745" y1="200" x2="780" y2="200" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
                  <line x1="780" y1="185" x2="780" y2="200" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <line x1="780" y1="200" x2="830" y2="200" stroke="hsl(var(--foreground))" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

                  <rect x="835" y="175" width="55" height="50" rx="4"
                    fill={hoveredComponent === 'adc' ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--primary) / 0.08)'}
                    stroke="hsl(var(--primary))" strokeWidth="2" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('adc')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="862" y="198" textAnchor="middle" className="fill-primary text-[10px] font-bold">АЦП</text>
                  <text x="862" y="212" textAnchor="middle" className="fill-muted-foreground text-[8px]">24-бит</text>

                  <text x="862" y="245" textAnchor="middle" className="fill-primary text-[10px] font-semibold">Vout ≈ {Vout}В</text>

                  <text x="60" y="55" className="fill-muted-foreground text-[10px] font-semibold">ДАТЧИК</text>
                  <line x1="20" y1="60" x2="175" y2="60" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />
                  <text x="250" y="55" className="fill-muted-foreground text-[10px] font-semibold">ЗАРЯДОВЫЙ УСИЛИТЕЛЬ</text>
                  <line x1="195" y1="60" x2="350" y2="60" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />
                  <text x="490" y="55" className="fill-muted-foreground text-[10px] font-semibold">ФИЛЬТР НЧ</text>
                  <line x1="370" y1="60" x2="580" y2="60" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />
                  <text x="730" y="55" className="fill-muted-foreground text-[10px] font-semibold">УСИЛЕНИЕ + АЦП</text>
                  <line x1="600" y1="60" x2="895" y2="60" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />

                  <line x1="20" y1="60" x2="20" y2="340" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />
                  <line x1="195" y1="60" x2="195" y2="340" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />
                  <line x1="370" y1="60" x2="370" y2="340" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />
                  <line x1="600" y1="60" x2="600" y2="340" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />
                  <line x1="895" y1="60" x2="895" y2="340" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />

                  <text x="60" y="370" className="fill-primary text-[10px] font-mono">Q = d₃₃ × F</text>
                  <text x="60" y="385" className="fill-muted-foreground text-[9px]">Заряд от силы</text>
                  <text x="250" y="370" className="fill-primary text-[10px] font-mono">V = Q / Cf</text>
                  <text x="250" y="385" className="fill-muted-foreground text-[9px]">Преобразование Q→V</text>
                  <text x="480" y="370" className="fill-primary text-[10px] font-mono">fc = 1/(2πRC)</text>
                  <text x="480" y="385" className="fill-muted-foreground text-[9px]">Подавление шума</text>
                  <text x="730" y="370" className="fill-primary text-[10px] font-mono">G = Rfb/Rg</text>
                  <text x="730" y="385" className="fill-muted-foreground text-[9px]">Усиление ×{gain}</text>

                  <line x1="60" y1="400" x2="730" y2="400" stroke="hsl(var(--primary))" strokeWidth="1" markerEnd="url(#arrowhead)" />
                  <text x="400" y="420" textAnchor="middle" className="fill-primary text-[10px] font-semibold">Сигнальный тракт</text>

                  <text x="200" y="450" textAnchor="middle" className="fill-muted-foreground text-[10px]">Питание: ±15В | GND | Vref = 2.5В</text>
                  <text x="600" y="450" textAnchor="middle" className="fill-muted-foreground text-[10px]">Полоса: 0.1 Гц ... {(frequency * 1.5 / 1000).toFixed(1)} кГц</text>
                </svg>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="generator">
            <Card className="p-6">
              <div className="flex items-center gap-2 border-b pb-3 mb-4">
                <Icon name="Radio" size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Генератор возбуждения пьезоэлементов</h2>
              </div>

              <div className="bg-muted/20 rounded-lg border-2 border-dashed border-border p-4 overflow-x-auto">
                <svg viewBox="0 0 900 460" className="w-full min-w-[700px]" style={{ height: 'auto', maxHeight: '480px' }}>
                  <defs>
                    <marker id="arr-gen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--primary))" />
                    </marker>
                  </defs>

                  <text x="100" y="50" textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold">ЗАДАЮЩИЙ ГЕНЕРАТОР</text>
                  <text x="350" y="50" textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold">УСИЛИТЕЛЬ МОЩНОСТИ</text>
                  <text x="600" y="50" textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold">СОГЛАСОВАНИЕ</text>
                  <text x="800" y="50" textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold">НАГРУЗКА</text>

                  <line x1="20" y1="55" x2="20" y2="350" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />
                  <line x1="200" y1="55" x2="200" y2="350" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />
                  <line x1="480" y1="55" x2="480" y2="350" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />
                  <line x1="700" y1="55" x2="700" y2="350" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />
                  <line x1="890" y1="55" x2="890" y2="350" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />
                  <line x1="20" y1="55" x2="890" y2="55" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeDasharray="4,4" />

                  <rect x="40" y="100" width="120" height="80" rx="8"
                    fill={hoveredComponent === 'gen_osc' ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--primary) / 0.08)'}
                    stroke="hsl(var(--primary))" strokeWidth="2" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('gen_osc')} onMouseLeave={() => setHoveredComponent(null)} />
                  
                  <svg x="70" y="115" width="60" height="30" viewBox="0 0 60 30">
                    <path d="M0,15 Q7.5,0 15,15 Q22.5,30 30,15 Q37.5,0 45,15 Q52.5,30 60,15" 
                      fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                  </svg>
                  
                  <text x="100" y="160" textAnchor="middle" className="fill-foreground text-[11px] font-semibold">Генератор</text>
                  <text x="100" y="175" textAnchor="middle" className="fill-primary text-[10px] font-mono">{frequency} Гц</text>

                  <rect x="60" y="210" width="80" height="40" rx="4"
                    fill="hsl(var(--accent) / 0.1)" stroke="hsl(var(--accent))" strokeWidth="1.5" />
                  <text x="100" y="228" textAnchor="middle" className="fill-foreground text-[9px] font-semibold">Кварц</text>
                  <text x="100" y="242" textAnchor="middle" className="fill-muted-foreground text-[8px]">{frequency} Гц</text>
                  <line x1="100" y1="180" x2="100" y2="210" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <line x1="160" y1="140" x2="220" y2="140" stroke="hsl(var(--foreground))" strokeWidth="1.5" markerEnd="url(#arr-gen)" />

                  <rect x="230" y="90" width="50" height="20" rx="2"
                    fill="hsl(var(--accent) / 0.1)" stroke="hsl(var(--accent))" strokeWidth="1.5" />
                  <text x="255" y="104" textAnchor="middle" className="fill-foreground text-[9px] font-semibold">R1 100</text>

                  <rect x="300" y="90" width="50" height="20" rx="2"
                    fill="hsl(var(--accent) / 0.1)" stroke="hsl(var(--accent))" strokeWidth="1.5" />
                  <text x="325" y="104" textAnchor="middle" className="fill-foreground text-[9px] font-semibold">R2 1k</text>

                  <line x1="280" y1="100" x2="300" y2="100" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="350" y1="100" x2="370" y2="100" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="370" y1="100" x2="370" y2="130" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <rect x="230" y="110" width="100" height="10" rx="0" fill="none" />
                  <line x1="230" y1="100" x2="230" y2="140" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <rect x="240" y="120" width="170" height="100" rx="6"
                    fill={hoveredComponent === 'gen_amp' ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--primary) / 0.08)'}
                    stroke="hsl(var(--primary))" strokeWidth="2" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('gen_amp')} onMouseLeave={() => setHoveredComponent(null)} />

                  <polygon points="270,140 330,170 270,200"
                    fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
                  <text x="288" y="174" className="fill-primary text-[9px] font-bold">A1</text>

                  <polygon points="340,140 400,170 340,200"
                    fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
                  <text x="358" y="174" className="fill-primary text-[9px] font-bold">A2</text>

                  <line x1="330" y1="170" x2="340" y2="170" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="400" y1="170" x2="420" y2="170" stroke="hsl(var(--foreground))" strokeWidth="1.5" />

                  <text x="325" y="215" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">Мостовой усилитель</text>
                  <text x="325" y="230" textAnchor="middle" className="fill-muted-foreground text-[9px]">±15В / макс. 2А</text>

                  <rect x="260" y="240" width="40" height="30" rx="3"
                    fill="hsl(var(--accent) / 0.1)" stroke="hsl(var(--accent))" strokeWidth="1" />
                  <text x="280" y="258" textAnchor="middle" className="fill-foreground text-[8px]">+15В</text>
                  <rect x="350" y="240" width="40" height="30" rx="3"
                    fill="hsl(var(--accent) / 0.1)" stroke="hsl(var(--accent))" strokeWidth="1" />
                  <text x="370" y="258" textAnchor="middle" className="fill-foreground text-[8px]">-15В</text>

                  <line x1="420" y1="170" x2="500" y2="170" stroke="hsl(var(--foreground))" strokeWidth="1.5" markerEnd="url(#arr-gen)" />

                  <rect x="510" y="100" width="80" height="50" rx="4"
                    fill={hoveredComponent === 'gen_match' ? 'hsl(var(--primary) / 0.15)' : 'hsl(var(--primary) / 0.05)'}
                    stroke="hsl(var(--primary))" strokeWidth="2" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('gen_match')} onMouseLeave={() => setHoveredComponent(null)} />
                  
                  <text x="550" y="122" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">LC</text>
                  <text x="550" y="140" textAnchor="middle" className="fill-muted-foreground text-[9px]">контур</text>

                  <line x1="550" y1="150" x2="550" y2="170" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <rect x="510" y="170" width="35" height="25" rx="2"
                    fill="hsl(var(--accent) / 0.1)" stroke="hsl(var(--accent))" strokeWidth="1" />
                  <text x="527" y="187" textAnchor="middle" className="fill-foreground text-[8px]">L</text>

                  <rect x="555" y="170" width="35" height="25" rx="2"
                    fill="hsl(var(--accent) / 0.1)" stroke="hsl(var(--accent))" strokeWidth="1" />
                  <text x="573" y="187" textAnchor="middle" className="fill-foreground text-[8px]">C</text>

                  <line x1="527" y1="195" x2="527" y2="220" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="573" y1="195" x2="573" y2="220" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="527" y1="220" x2="573" y2="220" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="550" y1="220" x2="550" y2="240" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="540" y1="240" x2="560" y2="240" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="545" y1="245" x2="555" y2="245" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <line x1="590" y1="170" x2="680" y2="170" stroke="hsl(var(--foreground))" strokeWidth="1.5" markerEnd="url(#arr-gen)" />

                  {Array.from({ length: Math.min(piezoElementsCount, 6) }).map((_, i) => {
                    const y = 90 + i * 42;
                    return (
                      <g key={i}>
                        <rect x="720" y={y} width="50" height="35" rx="6"
                          fill={hoveredComponent === 'gen_piezo' ? 'hsl(var(--primary) / 0.25)' : 'hsl(var(--primary) / 0.12)'}
                          stroke="hsl(var(--primary))" strokeWidth="1.5" className="cursor-pointer"
                          onMouseEnter={() => setHoveredComponent('gen_piezo')} onMouseLeave={() => setHoveredComponent(null)} />
                        <circle cx="745" cy={y + 17} r="10"
                          fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth="1" />
                        <circle cx="745" cy={y + 17} r="5"
                          fill="none" stroke="hsl(var(--primary) / 0.5)" strokeWidth="0.5" />
                        <text x="758" y={y + 20} className="fill-foreground text-[7px]">PZ{i + 1}</text>
                        <line x1="710" y1={y + 17} x2="720" y2={y + 17} stroke="hsl(var(--foreground))" strokeWidth="1" />
                        <line x1="770" y1={y + 17} x2="780" y2={y + 17} stroke="hsl(var(--foreground))" strokeWidth="1" />
                      </g>
                    );
                  })}

                  {piezoElementsCount > 6 && (
                    <text x="745" y={90 + 6 * 42 + 10} textAnchor="middle" className="fill-muted-foreground text-[10px]">...ещё {piezoElementsCount - 6}</text>
                  )}

                  <line x1="710" y1="90" x2="710" y2={90 + (Math.min(piezoElementsCount, 6) - 1) * 42 + 17} stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="780" y1="90" x2="780" y2={90 + (Math.min(piezoElementsCount, 6) - 1) * 42 + 17} stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="680" y1="170" x2="710" y2="170" stroke="hsl(var(--foreground))" strokeWidth="1" />

                  <line x1="780" y1={90 + (Math.min(piezoElementsCount, 6) - 1) * 42 / 2 + 17} x2="830" y2={90 + (Math.min(piezoElementsCount, 6) - 1) * 42 / 2 + 17} stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="830" y1={90 + (Math.min(piezoElementsCount, 6) - 1) * 42 / 2 + 17} x2="830" y2="300" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="830" y1="300" x2="100" y2="300" stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="6,3" />
                  <line x1="100" y1="250" x2="100" y2="300" stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="6,3" />

                  <rect x="400" y="285" width="120" height="30" rx="4"
                    fill={hoveredComponent === 'gen_feedback' ? 'hsl(var(--accent) / 0.2)' : 'hsl(var(--accent) / 0.08)'}
                    stroke="hsl(var(--accent))" strokeWidth="1.5" className="cursor-pointer"
                    onMouseEnter={() => setHoveredComponent('gen_feedback')} onMouseLeave={() => setHoveredComponent(null)} />
                  <text x="460" y="304" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">АРУ (обратная связь)</text>

                  <text x="100" y="370" className="fill-primary text-[10px] font-mono">f₀ = {frequency} Гц</text>
                  <text x="100" y="385" className="fill-muted-foreground text-[9px]">Стабильность кварца</text>
                  <text x="350" y="370" className="fill-primary text-[10px] font-mono">P = U² / Z</text>
                  <text x="350" y="385" className="fill-muted-foreground text-[9px]">Мощность возбуждения</text>
                  <text x="600" y="370" className="fill-primary text-[10px] font-mono">Z = √(R² + (ωL−1/ωC)²)</text>
                  <text x="600" y="385" className="fill-muted-foreground text-[9px]">Согласование импеданса</text>

                  <line x1="100" y1="400" x2="750" y2="400" stroke="hsl(var(--primary))" strokeWidth="1" markerEnd="url(#arr-gen)" />
                  <text x="420" y="420" textAnchor="middle" className="fill-primary text-[10px] font-semibold">Тракт возбуждения → {piezoElementsCount} пьезоэлементов</text>

                  <text x="300" y="450" textAnchor="middle" className="fill-muted-foreground text-[10px]">Питание: ±15В | Частота: {frequency} Гц | Элементов: {piezoElementsCount} шт. ({materialName})</text>
                </svg>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Icon name="Info" size={18} className="text-primary" />
            <h3 className="text-sm font-semibold">Информация о компоненте</h3>
          </div>

          {currentInfo ? (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-semibold">{currentInfo.name}</p>
                <p className="text-lg font-mono font-bold text-primary mt-1">{currentInfo.value}</p>
              </div>
              <p className="text-sm text-muted-foreground">{currentInfo.description}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              Наведите курсор на элемент схемы для просмотра параметров
            </p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Icon name="Calculator" size={18} className="text-primary" />
            <h3 className="text-sm font-semibold">Расчётные параметры</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Ёмкость датчика</span>
              <span className="font-mono font-semibold">{Cf} пФ</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Rf обратной связи</span>
              <span className="font-mono font-semibold">{Rf} МОм</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Усиление</span>
              <span className="font-mono font-semibold">×{gain}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Выход (при 100Н)</span>
              <span className="font-mono font-semibold">{Vout} В</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Полоса частот</span>
              <span className="font-mono font-semibold">0.1 — {(frequency * 1.5 / 1000).toFixed(1)} кГц</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-primary/10 rounded border border-primary/20">
              <span className="text-muted-foreground">Пьезоэлементов</span>
              <span className="font-mono font-semibold text-primary">{piezoElementsCount} шт</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Icon name="List" size={18} className="text-primary" />
            <h3 className="text-sm font-semibold">Спецификация (BOM)</h3>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { ref: 'U1', name: 'INA116 / AD8615', qty: '1', desc: 'Зарядовый ОУ' },
              { ref: 'U2', name: 'OPA2277', qty: '1', desc: 'ФНЧ + Усилитель' },
              { ref: 'U3', name: 'ADS1256', qty: '1', desc: 'АЦП 24-бит' },
              { ref: 'U4', name: 'REF2025', qty: '1', desc: 'Опорное 2.5В' },
              { ref: 'Cf', name: `${Cf}пФ / COG`, qty: '1', desc: 'ОС зарядового' },
              { ref: 'Rf', name: `${Rf}МОм`, qty: '1', desc: 'Разряд ОС' },
              { ref: 'R1-R2', name: '10кОм 0.1%', qty: '2', desc: 'ФНЧ' },
              { ref: 'C1', name: '10нФ / COG', qty: '1', desc: 'ФНЧ' },
              { ref: 'C2', name: '4.7нФ / COG', qty: '1', desc: 'ФНЧ' },
              { ref: 'PZ', name: materialName, qty: String(piezoElementsCount), desc: 'Пьезоэлементы' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-1.5 bg-muted/30 rounded">
                <Badge variant="outline" className="text-[10px] font-mono w-10 justify-center flex-shrink-0">{item.ref}</Badge>
                <span className="font-mono flex-1">{item.name}</span>
                <span className="text-muted-foreground w-6 text-center">{item.qty}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ElectricalSchematic;
