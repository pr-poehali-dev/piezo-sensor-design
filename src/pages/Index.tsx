import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface SensorParams {
  length: number;
  frequency: number;
  sensitivity: number;
  nonlinearity: number;
  tempCoefficient: number;
  mechanicalLoad: number;
}

interface Material {
  name: string;
  type: string;
  piezoCoefficient: number;
  density: number;
  youngModulus: number;
  curie: number;
}

interface SavedProject {
  id: string;
  name: string;
  params: SensorParams;
  materialName: string;
  createdAt: string;
}

interface SensorConstruction {
  housingThickness: number;
  piezoLayers: number;
  contactPlateThickness: number;
  insulatorThickness: number;
}

interface TestSignal {
  amplitude: number;
  frequency: number;
  waveform: 'sine' | 'square' | 'triangle';
}

const materials: Material[] = [
  { name: 'PZT-5H', type: 'Пьезокерамика', piezoCoefficient: 593, density: 7500, youngModulus: 60.6, curie: 193 },
  { name: 'PZT-4', type: 'Пьезокерамика', piezoCoefficient: 289, density: 7600, youngModulus: 81.3, curie: 328 },
  { name: 'PMN-PT', type: 'Монокристалл', piezoCoefficient: 2820, density: 8100, youngModulus: 60, curie: 130 },
  { name: 'BaTiO3', type: 'Керамика', piezoCoefficient: 191, density: 5700, youngModulus: 67, curie: 120 },
  { name: 'PVDF', type: 'Полимер', piezoCoefficient: 33, density: 1780, youngModulus: 2.5, curie: 80 },
];

const Index = () => {
  const [params, setParams] = useState<SensorParams>({
    length: 2.0,
    frequency: 1000,
    sensitivity: 50,
    nonlinearity: 0.5,
    tempCoefficient: 0.02,
    mechanicalLoad: 100,
  });

  const [selectedMaterial, setSelectedMaterial] = useState<Material>(materials[0]);
  const [rotation, setRotation] = useState({ x: 20, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [projectName, setProjectName] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [construction, setConstruction] = useState<SensorConstruction>({
    housingThickness: 2,
    piezoLayers: 3,
    contactPlateThickness: 0.5,
    insulatorThickness: 0.2
  });
  const [testSignal, setTestSignal] = useState<TestSignal>({
    amplitude: 50,
    frequency: 1000,
    waveform: 'sine'
  });
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<number>(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sensorProjects');
    if (saved) {
      setSavedProjects(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isTestRunning) {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        let signal = 0;
        
        switch (testSignal.waveform) {
          case 'sine':
            signal = Math.sin(2 * Math.PI * testSignal.frequency * elapsed / 1000);
            break;
          case 'square':
            signal = Math.sin(2 * Math.PI * testSignal.frequency * elapsed / 1000) > 0 ? 1 : -1;
            break;
          case 'triangle': {
            const t = (testSignal.frequency * elapsed / 1000) % 1;
            signal = t < 0.5 ? 4 * t - 1 : 3 - 4 * t;
            break;
          }
        }
        
        const output = signal * testSignal.amplitude * (params.sensitivity / 100) * (construction.piezoLayers / 3);
        setTestOutput(output);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setTestOutput(0);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isTestRunning, testSignal, params.sensitivity, construction.piezoLayers]);

  const openSearch = (type: 'datasheet' | 'publications' | 'suppliers') => {
    const materialName = encodeURIComponent(selectedMaterial.name);
    const queries = {
      datasheet: `https://www.google.com/search?q=${materialName}+piezoelectric+datasheet+pdf`,
      publications: `https://scholar.google.com/scholar?q=${materialName}+piezoelectric+sensor+properties`,
      suppliers: `https://www.google.com/search?q=${materialName}+piezoelectric+ceramic+buy+supplier`
    };
    window.open(queries[type], '_blank');
  };

  const exportToPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    pdf.setFontSize(20);
    pdf.text('Технический отчет', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    pdf.setFontSize(14);
    pdf.text('Пьезоэлектрический датчик Lineas® 9195F', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Основные параметры:', 20, yPosition);
    yPosition += 8;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);

    const params_data = [
      ['Длина датчика', `${params.length.toFixed(2)} м`],
      ['Частота', `${params.frequency} Гц`],
      ['Чувствительность', `${params.sensitivity} пКл/Н`],
      ['Нелинейность', `${params.nonlinearity}%`],
      ['Температурный коэффициент', `${params.tempCoefficient}%/°C`],
      ['Механическая нагрузка', `${params.mechanicalLoad} Н`],
    ];

    params_data.forEach(([label, value]) => {
      pdf.text(`${label}: ${value}`, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 5;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Расчетные характеристики:', 20, yPosition);
    yPosition += 8;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);

    const calc_data = [
      ['Емкость', `${calculateCapacitance()} пФ`],
      ['Резонансная частота', `${calculateResonance()} кГц`],
      ['Выходное напряжение', `${(params.sensitivity * params.mechanicalLoad / 1000).toFixed(2)} В`],
      ['Диапазон температур', `-40...+${selectedMaterial.curie}°C`],
    ];

    calc_data.forEach(([label, value]) => {
      pdf.text(`${label}: ${value}`, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 5;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Материал:', 20, yPosition);
    yPosition += 8;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);

    const material_data = [
      ['Название', selectedMaterial.name],
      ['Тип', selectedMaterial.type],
      ['Пьезокоэффициент d₃₃', `${selectedMaterial.piezoCoefficient} пКл/Н`],
      ['Плотность', `${selectedMaterial.density} кг/м³`],
      ['Модуль Юнга', `${selectedMaterial.youngModulus} ГПа`],
      ['Температура Кюри', `${selectedMaterial.curie}°C`],
    ];

    material_data.forEach(([label, value]) => {
      pdf.text(`${label}: ${value}`, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 5;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Технология изготовления:', 20, yPosition);
    yPosition += 8;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);

    const tech_steps = [
      `1. Подготовка пьезокерамического материала ${selectedMaterial.name}`,
      '2. Нанесение электродов методом напыления',
      '3. Поляризация в электрическом поле (2-4 кВ/мм)',
      '4. Сборка многослойной структуры',
      '5. Герметизация полимерной оболочкой',
    ];

    tech_steps.forEach((step) => {
      pdf.text(step, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 10;
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    const date = new Date().toLocaleDateString('ru-RU');
    pdf.text(`Документ создан: ${date}`, pageWidth / 2, yPosition, { align: 'center' });
    pdf.text('Piezo Designer Pro - Система расчета пьезоэлектрических датчиков', pageWidth / 2, yPosition + 5, { align: 'center' });

    pdf.save(`Sensor_${selectedMaterial.name}_${params.length}m_${date}.pdf`);
  };

  const saveProject = () => {
    if (!projectName.trim()) {
      toast.error('Введите название проекта');
      return;
    }

    const newProject: SavedProject = {
      id: Date.now().toString(),
      name: projectName,
      params: { ...params },
      materialName: selectedMaterial.name,
      createdAt: new Date().toISOString()
    };

    const updated = [...savedProjects, newProject];
    setSavedProjects(updated);
    localStorage.setItem('sensorProjects', JSON.stringify(updated));
    
    setProjectName('');
    setIsSaveDialogOpen(false);
    toast.success('Проект сохранен!');
  };

  const loadProject = (project: SavedProject) => {
    setParams(project.params);
    const material = materials.find(m => m.name === project.materialName);
    if (material) {
      setSelectedMaterial(material);
    }
    setIsLoadDialogOpen(false);
    toast.success(`Проект "${project.name}" загружен`);
  };

  const deleteProject = (id: string) => {
    const updated = savedProjects.filter(p => p.id !== id);
    setSavedProjects(updated);
    localStorage.setItem('sensorProjects', JSON.stringify(updated));
    toast.success('Проект удален');
  };

  const updateConstruction = (key: keyof SensorConstruction, value: number) => {
    setConstruction(prev => ({ ...prev, [key]: value }));
  };

  const getTotalThickness = () => {
    return construction.housingThickness * 2 + 
           construction.piezoLayers * 2 + 
           construction.contactPlateThickness * (construction.piezoLayers + 1) +
           construction.insulatorThickness * construction.piezoLayers * 2;
  };

  const updateParam = (key: keyof SensorParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const calculateCapacitance = () => {
    const area = 0.01;
    const thickness = 0.002;
    const epsilon = selectedMaterial.piezoCoefficient * 8.85e-12;
    return ((epsilon * area) / thickness * 1e12).toFixed(2);
  };

  const calculateResonance = () => {
    const speed = Math.sqrt(selectedMaterial.youngModulus * 1e9 / selectedMaterial.density);
    return ((speed / (2 * params.length)) / 1000).toFixed(2);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode === '3d') {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && viewMode === '3d') {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setRotation(prev => ({
        x: Math.max(-90, Math.min(90, prev.x + deltaY * 0.3)),
        y: prev.y + deltaX * 0.3
      }));
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <Icon name="Activity" size={24} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Piezo Designer Pro</h1>
                <p className="text-sm text-muted-foreground">Система расчета пьезоэлектрических датчиков Lineas® 9195F</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Icon name="FolderOpen" size={18} />
                    Загрузить
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Сохраненные проекты</DialogTitle>
                    <DialogDescription>
                      Выберите проект для загрузки параметров
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {savedProjects.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Нет сохраненных проектов</p>
                    ) : (
                      savedProjects.map(project => (
                        <div key={project.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                          <div className="flex-1">
                            <h4 className="font-semibold">{project.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {project.materialName} • {project.params.length}м • {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => loadProject(project)}>
                              <Icon name="Download" size={16} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteProject(project.id)}>
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Icon name="Save" size={18} />
                    Сохранить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Сохранить проект</DialogTitle>
                    <DialogDescription>
                      Введите название для сохранения текущих параметров
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Название проекта</Label>
                      <Input
                        placeholder="Например: Датчик для моста"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveProject()}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Материал: {selectedMaterial.name}</p>
                      <p>• Длина: {params.length}м</p>
                      <p>• Частота: {params.frequency}Гц</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={saveProject}>Сохранить проект</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button onClick={exportToPDF} className="gap-2">
                <Icon name="FileDown" size={18} />
                Экспорт в PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Icon name="Calculator" size={16} />
              Калькулятор
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center gap-2">
              <Icon name="Ruler" size={16} />
              Визуализация
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <Icon name="Waves" size={16} />
              Тестирование
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Icon name="Package" size={16} />
              Материалы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-2 border-b pb-3">
                  <Icon name="Settings" size={20} className="text-primary" />
                  <h2 className="text-lg font-semibold">Основные параметры</h2>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Длина датчика (м)</Label>
                      <span className="font-mono text-sm font-semibold text-primary">{params.length.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[params.length]}
                      onValueChange={(v) => updateParam('length', v[0])}
                      min={1.5}
                      max={2.5}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground font-mono">
                      <span>1.5 м</span>
                      <span>2.5 м</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Частота (Гц)</Label>
                      <span className="font-mono text-sm font-semibold text-primary">{params.frequency}</span>
                    </div>
                    <Slider
                      value={[params.frequency]}
                      onValueChange={(v) => updateParam('frequency', v[0])}
                      min={100}
                      max={10000}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground font-mono">
                      <span>100 Гц</span>
                      <span>10 кГц</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Чувствительность (пКл/Н)</Label>
                      <span className="font-mono text-sm font-semibold text-primary">{params.sensitivity}</span>
                    </div>
                    <Slider
                      value={[params.sensitivity]}
                      onValueChange={(v) => updateParam('sensitivity', v[0])}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Нелинейность (%)</Label>
                    <Input
                      type="number"
                      value={params.nonlinearity}
                      onChange={(e) => updateParam('nonlinearity', parseFloat(e.target.value))}
                      step={0.1}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Температурный коэффициент (%/°C)</Label>
                    <Input
                      type="number"
                      value={params.tempCoefficient}
                      onChange={(e) => updateParam('tempCoefficient', parseFloat(e.target.value))}
                      step={0.01}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Механическая нагрузка (Н)</Label>
                    <Input
                      type="number"
                      value={params.mechanicalLoad}
                      onChange={(e) => updateParam('mechanicalLoad', parseFloat(e.target.value))}
                      className="font-mono"
                    />
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 border-b pb-3 mb-4">
                    <Icon name="Zap" size={20} className="text-primary" />
                    <h2 className="text-lg font-semibold">Расчетные характеристики</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded">
                      <span className="text-sm text-muted-foreground">Емкость</span>
                      <span className="font-mono font-semibold">{calculateCapacitance()} пФ</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted rounded">
                      <span className="text-sm text-muted-foreground">Резонансная частота</span>
                      <span className="font-mono font-semibold">{calculateResonance()} кГц</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted rounded">
                      <span className="text-sm text-muted-foreground">Выходное напряжение</span>
                      <span className="font-mono font-semibold">{(params.sensitivity * params.mechanicalLoad / 1000).toFixed(2)} В</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted rounded">
                      <span className="text-sm text-muted-foreground">Диапазон температур</span>
                      <span className="font-mono font-semibold">-40...+{selectedMaterial.curie}°C</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-primary mt-0.5" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Текущий материал</h3>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{selectedMaterial.name}</span> — {selectedMaterial.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        d₃₃: {selectedMaterial.piezoCoefficient} пКл/Н
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualization" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between border-b pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <Icon name="Ruler" size={20} className="text-primary" />
                  <h2 className="text-lg font-semibold">Визуализация датчика</h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === '2d' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('2d')}
                    className="gap-2"
                  >
                    <Icon name="Minus" size={16} />
                    2D
                  </Button>
                  <Button
                    variant={viewMode === '3d' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('3d')}
                    className="gap-2"
                  >
                    <Icon name="Box" size={16} />
                    3D
                  </Button>
                </div>
              </div>

              {viewMode === '2d' ? (
                <div className="bg-muted/30 rounded-lg p-8 border-2 border-dashed border-border">
                  <div className="space-y-8">
                  <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
                    <span>0 м</span>
                    <span className="text-primary font-semibold">{params.length.toFixed(2)} м</span>
                  </div>

                  <div className="relative">
                    <div className="h-16 bg-gradient-to-r from-secondary via-primary/30 to-secondary rounded border-2 border-secondary relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-primary/20" style={{
                          background: 'repeating-linear-gradient(90deg, hsl(var(--primary)) 0px, hsl(var(--primary)) 2px, transparent 2px, transparent 20px)'
                        }}></div>
                      </div>
                      
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full border-4 border-card shadow-lg"></div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full border-4 border-card shadow-lg"></div>
                    </div>

                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {selectedMaterial.name}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 pt-4">
                    <div className="text-center space-y-1 p-3 bg-secondary/20 rounded border border-secondary/30">
                      <Icon name="Box" size={18} className="mx-auto text-secondary" />
                      <p className="text-xs font-semibold">Корпус</p>
                      <p className="font-mono text-xs text-muted-foreground">{construction.housingThickness}мм</p>
                    </div>
                    <div className="text-center space-y-1 p-3 bg-primary/20 rounded border border-primary/30">
                      <Icon name="Hexagon" size={18} className="mx-auto text-primary" />
                      <p className="text-xs font-semibold">Пьезоэлементы</p>
                      <p className="font-mono text-xs text-muted-foreground">{construction.piezoLayers} шт</p>
                    </div>
                    <div className="text-center space-y-1 p-3 bg-amber-500/20 rounded border border-amber-500/30">
                      <Icon name="Zap" size={18} className="mx-auto text-amber-600" />
                      <p className="text-xs font-semibold">Контакты</p>
                      <p className="font-mono text-xs text-muted-foreground">{construction.contactPlateThickness}мм</p>
                    </div>
                    <div className="text-center space-y-1 p-3 bg-green-500/20 rounded border border-green-500/30">
                      <Icon name="Shield" size={18} className="mx-auto text-green-600" />
                      <p className="text-xs font-semibold">Изоляция</p>
                      <p className="font-mono text-xs text-muted-foreground">{construction.insulatorThickness}мм</p>
                    </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg p-8 border-2 border-border relative overflow-hidden cursor-move select-none"
                  style={{ perspective: '1000px', minHeight: '500px' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                >
                  <div className="absolute top-4 right-4 text-xs text-muted-foreground font-mono bg-card/80 px-3 py-2 rounded">
                    Перетащите для вращения
                  </div>

                  <div
                    className="relative w-full h-[450px] flex items-center justify-center"
                    style={{
                      transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                      transformStyle: 'preserve-3d',
                      transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                    }}
                  >
                    <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
                      <div
                        className="absolute bg-gradient-to-r from-secondary via-primary/40 to-secondary rounded-lg shadow-2xl"
                        style={{
                          width: `${params.length * 200}px`,
                          height: '60px',
                          transform: 'translateZ(20px)',
                          border: '3px solid hsl(var(--secondary))',
                        }}
                      >
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-full border-4 border-card shadow-lg"></div>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-full border-4 border-card shadow-lg"></div>
                      </div>

                      <div
                        className="absolute bg-gradient-to-r from-secondary/80 via-primary/30 to-secondary/80 rounded-lg"
                        style={{
                          width: `${params.length * 200}px`,
                          height: '60px',
                          transform: 'translateZ(-20px)',
                          border: '3px solid hsl(var(--secondary))',
                        }}
                      />

                      <div
                        className="absolute bg-secondary/60"
                        style={{
                          width: `${params.length * 200}px`,
                          height: '40px',
                          top: '10px',
                          transform: 'rotateX(90deg) translateZ(20px)',
                        }}
                      />

                      <div
                        className="absolute bg-secondary/60"
                        style={{
                          width: `${params.length * 200}px`,
                          height: '40px',
                          top: '10px',
                          transform: 'rotateX(90deg) translateZ(-20px)',
                        }}
                      />

                      <div
                        className="absolute bg-secondary/70"
                        style={{
                          width: '40px',
                          height: '60px',
                          transform: 'rotateY(90deg) translateZ(20px)',
                        }}
                      />

                      <div
                        className="absolute bg-secondary/70"
                        style={{
                          width: '40px',
                          height: '60px',
                          right: 0,
                          transform: `rotateY(90deg) translateZ(${params.length * 200 - 20}px)`,
                        }}
                      />

                      <div
                        className="absolute left-1/2 -translate-x-1/2 -top-16"
                        style={{ transform: 'translateZ(40px) translateX(-50%)' }}
                      >
                        <Badge variant="secondary" className="font-mono text-xs shadow-lg">
                          {selectedMaterial.name}
                        </Badge>
                      </div>

                      <div
                        className="absolute left-0 -top-8 text-xs font-mono text-primary font-semibold"
                        style={{ transform: 'translateZ(40px)' }}
                      >
                        {params.length.toFixed(2)} м
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-8 relative z-10">
                    <div className="text-center space-y-1 bg-card/80 p-3 rounded">
                      <Icon name="Layers" size={20} className="mx-auto text-primary" />
                      <p className="text-xs font-semibold">Слои</p>
                      <p className="font-mono text-xs text-muted-foreground">Многослойная конструкция</p>
                    </div>
                    <div className="text-center space-y-1 bg-card/80 p-3 rounded">
                      <Icon name="Zap" size={20} className="mx-auto text-primary" />
                      <p className="text-xs font-semibold">Электроды</p>
                      <p className="font-mono text-xs text-muted-foreground">Медь/Серебро</p>
                    </div>
                    <div className="text-center space-y-1 bg-card/80 p-3 rounded">
                      <Icon name="Shield" size={20} className="mx-auto text-primary" />
                      <p className="text-xs font-semibold">Защита</p>
                      <p className="font-mono text-xs text-muted-foreground">Полимерная оболочка</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-muted/50 rounded space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Icon name="Wrench" size={16} />
                  Технология изготовления
                </h3>
                <ol className="text-sm text-muted-foreground space-y-1 pl-5 list-decimal">
                  <li>Подготовка пьезокерамического материала {selectedMaterial.name}</li>
                  <li>Нанесение электродов методом напыления</li>
                  <li>Поляризация в электрическом поле (2-4 кВ/мм)</li>
                  <li>Сборка многослойной структуры</li>
                  <li>Герметизация полимерной оболочкой</li>
                </ol>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 border-b pb-3 mb-4">
                    <Icon name="Wrench" size={20} className="text-primary" />
                    <h2 className="text-lg font-semibold">Конструкция датчика</h2>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Корпус датчика (мм)</Label>
                        <span className="font-mono text-sm font-semibold text-primary">{construction.housingThickness}</span>
                      </div>
                      <Slider
                        value={[construction.housingThickness]}
                        onValueChange={(v) => updateConstruction('housingThickness', v[0])}
                        min={1}
                        max={5}
                        step={0.5}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Количество пьезоэлементов</Label>
                        <span className="font-mono text-sm font-semibold text-primary">{construction.piezoLayers}</span>
                      </div>
                      <Slider
                        value={[construction.piezoLayers]}
                        onValueChange={(v) => updateConstruction('piezoLayers', v[0])}
                        min={1}
                        max={10}
                        step={1}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Контактные пластины (мм)</Label>
                        <span className="font-mono text-sm font-semibold text-primary">{construction.contactPlateThickness}</span>
                      </div>
                      <Slider
                        value={[construction.contactPlateThickness]}
                        onValueChange={(v) => updateConstruction('contactPlateThickness', v[0])}
                        min={0.1}
                        max={2}
                        step={0.1}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Изолирующие пластины (мм)</Label>
                        <span className="font-mono text-sm font-semibold text-primary">{construction.insulatorThickness}</span>
                      </div>
                      <Slider
                        value={[construction.insulatorThickness]}
                        onValueChange={(v) => updateConstruction('insulatorThickness', v[0])}
                        min={0.05}
                        max={1}
                        step={0.05}
                      />
                    </div>

                    <div className="p-3 bg-muted rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Общая толщина</span>
                        <span className="font-mono font-semibold">{getTotalThickness().toFixed(2)} мм</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 border-b pb-3 mb-4">
                    <Icon name="Waves" size={20} className="text-primary" />
                    <h2 className="text-lg font-semibold">Генератор тестового сигнала</h2>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label>Форма сигнала</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={testSignal.waveform === 'sine' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTestSignal(prev => ({ ...prev, waveform: 'sine' }))}
                        >
                          Синус
                        </Button>
                        <Button
                          variant={testSignal.waveform === 'square' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTestSignal(prev => ({ ...prev, waveform: 'square' }))}
                        >
                          Меандр
                        </Button>
                        <Button
                          variant={testSignal.waveform === 'triangle' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTestSignal(prev => ({ ...prev, waveform: 'triangle' }))}
                        >
                          Треугольник
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Амплитуда (Н)</Label>
                        <span className="font-mono text-sm font-semibold text-primary">{testSignal.amplitude}</span>
                      </div>
                      <Slider
                        value={[testSignal.amplitude]}
                        onValueChange={(v) => setTestSignal(prev => ({ ...prev, amplitude: v[0] }))}
                        min={10}
                        max={200}
                        step={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Частота (Гц)</Label>
                        <span className="font-mono text-sm font-semibold text-primary">{testSignal.frequency}</span>
                      </div>
                      <Slider
                        value={[testSignal.frequency]}
                        onValueChange={(v) => setTestSignal(prev => ({ ...prev, frequency: v[0] }))}
                        min={100}
                        max={5000}
                        step={100}
                      />
                    </div>

                    <Button
                      onClick={() => setIsTestRunning(!isTestRunning)}
                      className="w-full gap-2"
                      variant={isTestRunning ? 'destructive' : 'default'}
                    >
                      <Icon name={isTestRunning ? 'Square' : 'Play'} size={18} />
                      {isTestRunning ? 'Остановить тест' : 'Запустить тест'}
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 border-b pb-3 mb-6">
                    <Icon name="Layers" size={20} className="text-primary" />
                    <h2 className="text-lg font-semibold">Состав компонентов</h2>
                  </div>

                  <div className="space-y-4">
                    {Array.from({ length: construction.piezoLayers }).map((_, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded border-l-4 border-secondary">
                          <Icon name="Box" size={16} className="text-secondary" />
                          <span className="text-sm font-semibold">Корпус (верх/низ) - {construction.housingThickness}мм</span>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 bg-amber-500/20 rounded border-l-4 border-amber-500">
                          <Icon name="Zap" size={16} className="text-amber-600" />
                          <span className="text-sm font-semibold">Контактная пластина - {construction.contactPlateThickness}мм</span>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-primary/20 rounded border-l-4 border-primary">
                          <Icon name="Hexagon" size={16} className="text-primary" />
                          <span className="text-sm font-semibold">Пьезоэлемент {idx + 1} ({selectedMaterial.name}) - 2мм</span>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-green-500/20 rounded border-l-4 border-green-500">
                          <Icon name="Shield" size={16} className="text-green-600" />
                          <span className="text-sm font-semibold">Изолятор - {construction.insulatorThickness}мм</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
                  <div className="flex items-center gap-2 border-b border-primary/20 pb-3 mb-4">
                    <Icon name="Activity" size={20} className="text-primary" />
                    <h2 className="text-lg font-semibold">Выходной сигнал в реальном времени</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="relative h-32 bg-card rounded border-2 border-primary/20 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {!isTestRunning ? (
                          <p className="text-muted-foreground text-sm">Запустите тест для просмотра сигнала</p>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div 
                              className="w-2 h-full bg-primary transition-all duration-75"
                              style={{ 
                                height: `${Math.abs(testOutput) / 2}%`,
                                opacity: 0.8
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-card rounded">
                        <p className="text-xs text-muted-foreground mb-1">Текущее напряжение</p>
                        <p className="font-mono font-bold text-lg text-primary">{testOutput.toFixed(2)} В</p>
                      </div>

                      <div className="p-3 bg-card rounded">
                        <p className="text-xs text-muted-foreground mb-1">Пиковое значение</p>
                        <p className="font-mono font-bold text-lg text-accent">
                          {(testSignal.amplitude * (params.sensitivity / 100) * (construction.piezoLayers / 3)).toFixed(2)} В
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-card/50 rounded text-xs space-y-1">
                      <p className="text-muted-foreground">
                        <strong>Статус:</strong> {isTestRunning ? '🟢 Тестирование' : '⚪ Остановлен'}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Слоёв:</strong> {construction.piezoLayers} × коэффициент усиления
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Материал:</strong> {selectedMaterial.name} (d₃₃ = {selectedMaterial.piezoCoefficient} пКл/Н)
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 border-b pb-3 mb-4">
                  <Icon name="Package" size={20} className="text-primary" />
                  <h2 className="text-lg font-semibold">Библиотека материалов</h2>
                </div>

                <div className="space-y-3">
                  {materials.map((material, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedMaterial(material)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                        selectedMaterial.name === material.name
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{material.name}</h3>
                          <p className="text-sm text-muted-foreground">{material.type}</p>
                        </div>
                        {selectedMaterial.name === material.name && (
                          <Icon name="CheckCircle2" size={20} className="text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 border-b pb-3 mb-4">
                    <Icon name="FileText" size={20} className="text-primary" />
                    <h2 className="text-lg font-semibold">Свойства материала</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Пьезокоэффициент d₃₃</span>
                        <span className="font-mono font-semibold">{selectedMaterial.piezoCoefficient} пКл/Н</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${(selectedMaterial.piezoCoefficient / 2820) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted rounded">
                      <span className="text-sm text-muted-foreground">Плотность</span>
                      <span className="font-mono font-semibold">{selectedMaterial.density} кг/м³</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted rounded">
                      <span className="text-sm text-muted-foreground">Модуль Юнга</span>
                      <span className="font-mono font-semibold">{selectedMaterial.youngModulus} ГПа</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted rounded">
                      <span className="text-sm text-muted-foreground">Температура Кюри</span>
                      <span className="font-mono font-semibold">{selectedMaterial.curie}°C</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-accent/5 border-accent/20">
                  <div className="flex items-start gap-3">
                    <Icon name="Search" size={20} className="text-accent mt-0.5" />
                    <div className="space-y-3 flex-1">
                      <h3 className="font-semibold text-sm">Поиск в интернет-ресурсах</h3>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2" 
                        size="sm"
                        onClick={() => openSearch('datasheet')}
                      >
                        <Icon name="ExternalLink" size={16} />
                        Datasheet {selectedMaterial.name}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2" 
                        size="sm"
                        onClick={() => openSearch('publications')}
                      >
                        <Icon name="BookOpen" size={16} />
                        Научные публикации
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2" 
                        size="sm"
                        onClick={() => openSearch('suppliers')}
                      >
                        <Icon name="ShoppingCart" size={16} />
                        Поставщики материалов
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;