import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface ClientMetricsProps {
  clientId: string;
  clientName: string;
}

interface ProgressMetric {
  id: string;
  client_id: string;
  metric_type: string;
  value: number;
  unit: string;
  date: string;
  notes?: string;
}

const ClientMetrics = ({ clientId, clientName }: ClientMetricsProps) => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<ProgressMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMetric, setNewMetric] = useState({
    metric_type: "weight",
    value: "",
    unit: "kg",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Fetch client metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("progress_metrics")
        .select("*")
        .eq("client_id", clientId)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching metrics:", error);
        toast({
          title: "Error",
          description: "Failed to load client metrics",
          variant: "destructive",
        });
      } else {
        setMetrics(data || []);
      }
      setLoading(false);
    };

    if (clientId) {
      fetchMetrics();
    }
  }, [clientId, toast]);

  // Add new metric
  const addMetric = async () => {
    if (!newMetric.value) {
      toast({
        title: "Missing information",
        description: "Please enter a value for the metric",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("progress_metrics")
      .insert([
        {
          client_id: clientId,
          metric_type: newMetric.metric_type,
          value: parseFloat(newMetric.value),
          unit: newMetric.unit,
          notes: newMetric.notes,
          date: newMetric.date,
        },
      ])
      .select();

    if (error) {
      console.error("Error adding metric:", error);
      toast({
        title: "Error",
        description: "Failed to add new metric",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Metric added",
      description: `New ${newMetric.metric_type} measurement recorded for ${clientName}`,
    });

    // Update local state
    if (data && data.length > 0) {
      setMetrics([...metrics, data[0]]);
    }

    // Reset form
    setNewMetric({
      metric_type: "weight",
      value: "",
      unit: "kg",
      notes: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get metrics by type
  const getMetricsByType = (type: string) => {
    return metrics.filter((metric) => metric.metric_type === type);
  };

  // Get weight metrics for chart
  const weightMetrics = getMetricsByType("weight");

  // Prepare data for recharts
  const prepareChartData = () => {
    return weightMetrics.map((metric) => ({
      date: formatDate(metric.date),
      weight: metric.value,
      fullDate: metric.date, // Keep the full date for sorting
    }));
  };

  // Calculate min and max for chart scaling
  const weightValues = weightMetrics.map((m) => m.value);
  const minWeight =
    Math.min(...(weightValues.length ? weightValues : [0])) * 0.95;
  const maxWeight =
    Math.max(...(weightValues.length ? weightValues : [100])) * 1.05;

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded-md shadow-sm">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-blue-600">
            {payload[0].value.toFixed(1)} {weightMetrics[0]?.unit || "kg"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Client Metrics</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Measurement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Measurement</DialogTitle>
              <DialogDescription>
                Record a new measurement for {clientName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metric_type">Measurement Type</Label>
                  <select
                    id="metric_type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newMetric.metric_type}
                    onChange={(e) =>
                      setNewMetric({
                        ...newMetric,
                        metric_type: e.target.value,
                        unit: e.target.value === "weight" ? "kg" : "cm",
                      })
                    }
                  >
                    <option value="weight">Weight</option>
                    <option value="body_fat">Body Fat</option>
                    <option value="chest">Chest</option>
                    <option value="waist">Waist</option>
                    <option value="hips">Hips</option>
                    <option value="arms">Arms</option>
                    <option value="thighs">Thighs</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newMetric.date}
                    onChange={(e) =>
                      setNewMetric({ ...newMetric, date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.1"
                    value={newMetric.value}
                    onChange={(e) =>
                      setNewMetric({ ...newMetric, value: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <select
                    id="unit"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newMetric.unit}
                    onChange={(e) =>
                      setNewMetric({ ...newMetric, unit: e.target.value })
                    }
                  >
                    {newMetric.metric_type === "weight" ? (
                      <>
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                      </>
                    ) : newMetric.metric_type === "body_fat" ? (
                      <option value="%">%</option>
                    ) : (
                      <>
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  value={newMetric.notes}
                  onChange={(e) =>
                    setNewMetric({ ...newMetric, notes: e.target.value })
                  }
                  placeholder="Any additional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addMetric}>Save Measurement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading metrics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Weight Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weight Progress</CardTitle>
              <CardDescription>Track weight changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              {weightMetrics.length < 2 ? (
                <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-md">
                  <p className="text-gray-500 text-sm">
                    {weightMetrics.length === 0
                      ? "No weight data recorded yet"
                      : "Need at least two measurements to show chart"}
                  </p>
                </div>
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={prepareChartData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorWeight"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[minWeight, maxWeight]}
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={false}
                        tickFormatter={(value) => `${value.toFixed(1)}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorWeight)"
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Recent measurements */}
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Recent Measurements</h4>
                <div className="space-y-2">
                  {weightMetrics
                    .slice(-5)
                    .reverse()
                    .map((metric, index, array) => (
                      <div
                        key={metric.id}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div>
                          <div className="text-sm">
                            {formatDate(metric.date)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="font-medium">
                            {metric.value} {metric.unit}
                          </div>
                          {index < array.length - 1 && (
                            <Badge
                              variant={
                                metric.value < array[index + 1].value
                                  ? "default"
                                  : "secondary"
                              }
                              className="ml-2"
                            >
                              {metric.value < array[index + 1].value ? (
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                              )}
                              {Math.abs(
                                metric.value - array[index + 1].value,
                              ).toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["body_fat", "chest", "waist", "hips", "arms", "thighs"].map(
              (metricType) => {
                const typeMetrics = getMetricsByType(metricType);
                if (typeMetrics.length === 0) return null;

                return (
                  <Card key={metricType}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {metricType
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {typeMetrics
                          .slice(-3)
                          .reverse()
                          .map((metric, index, array) => (
                            <div
                              key={metric.id}
                              className="flex items-center justify-between p-2 border rounded-md"
                            >
                              <div className="text-sm">
                                {formatDate(metric.date)}
                              </div>
                              <div className="flex items-center">
                                <div className="font-medium">
                                  {metric.value} {metric.unit}
                                </div>
                                {index < array.length - 1 && (
                                  <Badge
                                    variant={
                                      metric.value < array[index + 1].value
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="ml-2"
                                  >
                                    {metric.value < array[index + 1].value ? (
                                      <ArrowDownRight className="h-3 w-3 mr-1" />
                                    ) : (
                                      <ArrowUpRight className="h-3 w-3 mr-1" />
                                    )}
                                    {Math.abs(
                                      metric.value - array[index + 1].value,
                                    ).toFixed(1)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMetrics;
