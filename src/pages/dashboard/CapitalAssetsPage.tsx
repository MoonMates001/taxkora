import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCapitalAssets } from "@/hooks/useCapitalAssets";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Trash2,
  Edit,
  Car,
  Monitor,
  Building,
  Wrench,
  Sofa,
  Tractor,
  Package,
  Calculator,
  TrendingDown,
  Calendar,
  DollarSign,
} from "lucide-react";
import { 
  CapitalAsset, 
  CapitalAssetCategory, 
  CAPITAL_ALLOWANCE_RATES,
  computeCapitalAllowances,
} from "@/lib/tax";

const CATEGORY_ICONS: Record<CapitalAssetCategory, typeof Car> = {
  plant_machinery: Wrench,
  motor_vehicles: Car,
  furniture_fittings: Sofa,
  buildings: Building,
  computers_equipment: Monitor,
  agricultural_equipment: Tractor,
  other: Package,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const CapitalAssetsPage = () => {
  const { profile } = useAuth();
  const { assets, isLoading, createAsset, updateAsset, deleteAsset } = useCapitalAssets();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [editingAsset, setEditingAsset] = useState<CapitalAsset | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assessableProfit, setAssessableProfit] = useState(0);

  // Form state for new/edit asset
  const [formData, setFormData] = useState<Partial<CapitalAsset>>({
    description: "",
    category: "plant_machinery",
    cost: 0,
    acquisitionDate: new Date().toISOString().split("T")[0],
    yearAcquired: currentYear,
  });

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Compute capital allowances
  const allowanceResult = computeCapitalAllowances(assets, assessableProfit, selectedYear);

  const getCategoryRates = (category: CapitalAssetCategory) => {
    return CAPITAL_ALLOWANCE_RATES.find((r) => r.category === category);
  };

  const handleAddAsset = () => {
    setEditingAsset(null);
    setFormData({
      description: "",
      category: "plant_machinery",
      cost: 0,
      acquisitionDate: new Date().toISOString().split("T")[0],
      yearAcquired: currentYear,
    });
    setIsDialogOpen(true);
  };

  const handleEditAsset = (asset: CapitalAsset) => {
    setEditingAsset(asset);
    setFormData({
      description: asset.description,
      category: asset.category,
      cost: asset.cost,
      acquisitionDate: asset.acquisitionDate,
      yearAcquired: asset.yearAcquired,
    });
    setIsDialogOpen(true);
  };

  const handleSaveAsset = () => {
    if (editingAsset) {
      // Update existing
      updateAsset.mutate({
        id: editingAsset.id,
        description: formData.description || "",
        category: formData.category as CapitalAssetCategory,
        cost: formData.cost || 0,
        acquisitionDate: formData.acquisitionDate || "",
        yearAcquired: formData.yearAcquired || currentYear,
      });
    } else {
      // Add new
      createAsset.mutate({
        description: formData.description || "",
        category: formData.category as CapitalAssetCategory,
        cost: formData.cost || 0,
        acquisitionDate: formData.acquisitionDate || "",
        yearAcquired: formData.yearAcquired || currentYear,
      });
    }
    
    setIsDialogOpen(false);
  };

  const handleDeleteAsset = (id: string) => {
    deleteAsset.mutate(id);
  };

  const totalAssetValue = assets.reduce((sum, a) => sum + a.cost, 0);
  const totalAllowancesClaimed = allowanceResult.totalAllowance;
  const totalWrittenDownValue = allowanceResult.assetBreakdown.reduce(
    (sum, a) => sum + a.writtenDownValue,
    0
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Capital Assets</h1>
          <p className="text-muted-foreground mt-1">
            Track equipment, vehicles, and machinery for capital allowance claims
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddAsset}>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold">{assets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Asset Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAssetValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capital Allowances</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAllowancesClaimed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Written Down Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalWrittenDownValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessable Profit Input */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Capital Allowance Restriction
          </CardTitle>
          <CardDescription>
            Capital allowances are restricted to 2/3 of assessable profit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="assessableProfit">Assessable Profit for {selectedYear}</Label>
              <Input
                id="assessableProfit"
                type="number"
                placeholder="Enter assessable profit"
                value={assessableProfit || ""}
                onChange={(e) => setAssessableProfit(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              <p>Maximum Allowance: {formatCurrency(allowanceResult.maxAllowableAmount)}</p>
              <p>Restriction Applied: {allowanceResult.isRestricted ? "Yes" : "No"}</p>
              {allowanceResult.carriedForward > 0 && (
                <p className="text-amber-600">Carried Forward: {formatCurrency(allowanceResult.carriedForward)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capital Allowance Rates Reference */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Capital Allowance Rates</CardTitle>
          <CardDescription>
            Nigeria Tax Act 2025/2026 - Initial and Annual Rates by Asset Category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAPITAL_ALLOWANCE_RATES.map((rate) => {
              const Icon = CATEGORY_ICONS[rate.category];
              return (
                <div
                  key={rate.category}
                  className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-sm">{rate.label}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Initial:</span>
                      <Badge variant="secondary">{(rate.initialRate * 100).toFixed(0)}%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual:</span>
                      <Badge variant="outline">{(rate.annualRate * 100).toFixed(0)}%</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Asset Register</CardTitle>
          <CardDescription>
            All capital assets and their allowance calculations for {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No assets registered</h3>
              <p className="text-muted-foreground mb-4">
                Add your capital assets to calculate allowances
              </p>
              <Button onClick={handleAddAsset}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Asset
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Acquisition</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Initial Allow.</TableHead>
                    <TableHead className="text-right">Annual Allow.</TableHead>
                    <TableHead className="text-right">Total Allow.</TableHead>
                    <TableHead className="text-right">WDV</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => {
                    const breakdown = allowanceResult.assetBreakdown.find((a) => a.assetId === asset.id);
                    const Icon = CATEGORY_ICONS[asset.category];
                    const rates = getCategoryRates(asset.category);
                    
                    return (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{asset.description || "Unnamed Asset"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{rates?.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3" />
                            {asset.yearAcquired}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(asset.cost)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(breakdown?.initialAllowance || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(breakdown?.annualAllowance || 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(breakdown?.totalAllowance || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(breakdown?.writtenDownValue || asset.cost)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditAsset(asset)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteAsset(asset.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allowance Summary */}
      {assets.length > 0 && (
        <Card className="shadow-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Capital Allowance Summary - {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Total Initial Allowance</p>
                <p className="text-xl font-bold">{formatCurrency(allowanceResult.totalInitial)}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Total Annual Allowance</p>
                <p className="text-xl font-bold">{formatCurrency(allowanceResult.totalAnnual)}</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground">Claimable Allowance</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(allowanceResult.allowableAmount)}
                </p>
              </div>
            </div>

            {allowanceResult.isRestricted && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="font-medium text-amber-800">⚠️ 2/3 Restriction Applied</p>
                <p className="text-sm text-amber-700 mt-1">
                  Total allowance of {formatCurrency(allowanceResult.totalAllowance)} exceeds 
                  2/3 of assessable profit ({formatCurrency(allowanceResult.maxAllowableAmount)}). 
                  {formatCurrency(allowanceResult.carriedForward)} will be carried forward.
                </p>
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Deductible from Assessable Profit</p>
                <p className="text-sm text-muted-foreground">
                  Use this amount in your tax computation
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(allowanceResult.allowableAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Asset Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAsset ? "Edit Asset" : "Add New Capital Asset"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Asset Description</Label>
              <Input
                id="description"
                placeholder="e.g., Toyota Hilux Pickup"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Asset Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, category: v as CapitalAssetCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAPITAL_ALLOWANCE_RATES.map((rate) => {
                    const Icon = CATEGORY_ICONS[rate.category];
                    return (
                      <SelectItem key={rate.category} value={rate.category}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{rate.label}</span>
                          <span className="text-muted-foreground text-xs">
                            ({(rate.initialRate * 100).toFixed(0)}% / {(rate.annualRate * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Cost (₦)</Label>
                <Input
                  id="cost"
                  type="number"
                  placeholder="0"
                  value={formData.cost || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearAcquired">Year Acquired</Label>
                <Select
                  value={formData.yearAcquired?.toString()}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, yearAcquired: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="acquisitionDate">Acquisition Date</Label>
              <Input
                id="acquisitionDate"
                type="date"
                value={formData.acquisitionDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, acquisitionDate: e.target.value }))}
              />
            </div>

            {formData.category && (
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p className="font-medium mb-1">Allowance Rates:</p>
                <p>Initial: {((getCategoryRates(formData.category as CapitalAssetCategory)?.initialRate || 0) * 100).toFixed(0)}%</p>
                <p>Annual: {((getCategoryRates(formData.category as CapitalAssetCategory)?.annualRate || 0) * 100).toFixed(0)}%</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAsset}>
              {editingAsset ? "Update Asset" : "Add Asset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CapitalAssetsPage;
