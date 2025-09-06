import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Droplets, Scale } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Progress } from "@/types";

interface ProgressChartProps {
  progressData: Progress[];
}

export function ProgressChart({ progressData }: ProgressChartProps) {
  // Process weight data - sort by date ascending for correct chart display
  const weightData = progressData
    .filter(entry => entry.weightKg)
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString(),
      weight: entry.weightKg,
      fullDate: entry.date
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  // Process water data - sort by date ascending for correct chart display
  const waterData = progressData
    .filter(entry => entry.waterLitres)
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString(),
      water: entry.waterLitres,
      fullDate: entry.date
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  // Calculate weight trend
  const weightTrend = weightData.length >= 2 
    ? weightData[weightData.length - 1].weight! - weightData[0].weight!
    : 0;

  // Calculate average water intake
  const avgWater = waterData.length > 0 
    ? waterData.reduce((sum, entry) => sum + entry.water!, 0) / waterData.length
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-primary-600">
            {payload[0].dataKey === 'weight' ? 'Weight: ' : 'Water: '}
            {payload[0].value}
            {payload[0].dataKey === 'weight' ? 'kg' : 'L'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Progress Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weight" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weight" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Weight
            </TabsTrigger>
            <TabsTrigger value="water" className="flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Hydration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weight" className="space-y-6">
            {/* Weight Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Current</span>
                  <Scale className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">
                  {weightData.length > 0 ? `${weightData[weightData.length - 1].weight}kg` : 'No data'}
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Change</span>
                  {weightTrend < 0 ? (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  ) : weightTrend > 0 ? (
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                  ) : (
                    <span className="w-4 h-4" />
                  )}
                </div>
                <p className={`text-2xl font-bold ${
                  weightTrend < 0 ? 'text-green-600' : 
                  weightTrend > 0 ? 'text-orange-600' : 
                  'text-muted-foreground'
                }`}>
                  {weightTrend !== 0 ? `${weightTrend > 0 ? '+' : ''}${weightTrend.toFixed(1)}kg` : '0kg'}
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Entries</span>
                  <Badge variant="outline">{weightData.length}</Badge>
                </div>
                <p className="text-2xl font-bold">{weightData.length}</p>
              </div>
            </div>

            {/* Weight Chart */}
            {weightData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={['dataMin - 2', 'dataMax + 2']}
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No weight data available</p>
                  <p className="text-sm text-muted-foreground">Start logging your weight to see progress</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="water" className="space-y-6">
            {/* Water Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Today</span>
                  <Droplets className="w-4 h-4 text-info" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {waterData.length > 0 ? `${waterData[waterData.length - 1].water}L` : '0L'}
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Average</span>
                  <Badge variant="outline" className="border-border">
                    Daily
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {avgWater > 0 ? `${avgWater.toFixed(1)}L` : '0L'}
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Goal</span>
                  <Badge variant="outline" className="border-border">
                    2.5L
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {avgWater >= 2.5 ? '✓' : `${(2.5 - avgWater).toFixed(1)}L to go`}
                </p>
              </div>
            </div>

            {/* Water Chart */}
            {waterData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={waterData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 'dataMax + 0.5']}
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="water" 
                      stroke="hsl(var(--info))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--info))", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: "hsl(var(--info))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <Droplets className="w-12 h-12 text-info mx-auto mb-4" />
                  <p className="text-muted-foreground">No hydration data available</p>
                  <p className="text-sm text-muted-foreground">Start tracking your water intake</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
