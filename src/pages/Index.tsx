import { useState } from 'react';
import { Card } from '@/components/ui/card';
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
              <Icon name="Activity" size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Piezo Designer Pro</h1>
              <p className="text-sm text-muted-foreground">Система расчета пьезоэлектрических датчиков Lineas® 9195F</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Icon name="Calculator" size={16} />
              Калькулятор
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center gap-2">
              <Icon name="Ruler" size={16} />
              Визуализация
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
              <div className="flex items-center gap-2 border-b pb-3 mb-6">
                <Icon name="Ruler" size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">2D Схема датчика</h2>
              </div>

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

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center space-y-1">
                      <Icon name="Layers" size={20} className="mx-auto text-primary" />
                      <p className="text-xs font-semibold">Слои</p>
                      <p className="font-mono text-xs text-muted-foreground">Многослойная конструкция</p>
                    </div>
                    <div className="text-center space-y-1">
                      <Icon name="Zap" size={20} className="mx-auto text-primary" />
                      <p className="text-xs font-semibold">Электроды</p>
                      <p className="font-mono text-xs text-muted-foreground">Медь/Серебро</p>
                    </div>
                    <div className="text-center space-y-1">
                      <Icon name="Shield" size={20} className="mx-auto text-primary" />
                      <p className="text-xs font-semibold">Защита</p>
                      <p className="font-mono text-xs text-muted-foreground">Полимерная оболочка</p>
                    </div>
                  </div>
                </div>
              </div>

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
                      <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                        <Icon name="ExternalLink" size={16} />
                        Datasheet {selectedMaterial.name}
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                        <Icon name="BookOpen" size={16} />
                        Научные публикации
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2" size="sm">
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
