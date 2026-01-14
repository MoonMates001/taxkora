import { useState, useRef } from "react";
import { Palette, Upload, Trash2, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const COLOR_PRESETS = [
  { name: "Teal", value: "#0d9488" },
  { name: "Blue", value: "#2563eb" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Rose", value: "#e11d48" },
  { name: "Orange", value: "#ea580c" },
  { name: "Green", value: "#16a34a" },
  { name: "Slate", value: "#475569" },
  { name: "Indigo", value: "#4f46e5" },
];

export const InvoiceCustomizationForm = () => {
  const { profile } = useAuth();
  const { updateProfile, uploadLogo } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [primaryColor, setPrimaryColor] = useState(profile?.invoice_primary_color || "#0d9488");
  const [logoUrl, setLogoUrl] = useState(profile?.invoice_logo_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadLogo(file);
      setLogoUrl(url);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        invoice_primary_color: primaryColor,
        invoice_logo_url: logoUrl || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Invoice Customization
        </CardTitle>
        <CardDescription>
          Customize how your invoices look with your brand colors and logo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-3">
          <Label>Business Logo</Label>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <div className="relative group">
                <img
                  src={logoUrl}
                  alt="Business Logo"
                  className="w-20 h-20 object-contain rounded-lg border bg-white p-2"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveLogo}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                <Upload className="w-6 h-6" />
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 2MB. Recommended: 200x200px
              </p>
            </div>
          </div>
        </div>

        {/* Color Picker */}
        <div className="space-y-3">
          <Label>Primary Color</Label>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg border-2 border-white shadow-md cursor-pointer"
              style={{ backgroundColor: primaryColor }}
              onClick={() => document.getElementById("color-picker")?.click()}
            />
            <Input
              id="color-picker"
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-20 h-10 p-1 cursor-pointer"
            />
            <span className="text-sm font-mono text-muted-foreground">
              {primaryColor.toUpperCase()}
            </span>
          </div>

          {/* Color Presets */}
          <div className="flex flex-wrap gap-2 pt-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  primaryColor === preset.value ? "ring-2 ring-offset-2 ring-primary" : "border-white"
                }`}
                style={{ backgroundColor: preset.value }}
                onClick={() => setPrimaryColor(preset.value)}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3 pt-4 border-t">
          <Label>Preview</Label>
          <div className="p-4 border rounded-lg bg-white">
            <div 
              className="flex items-center gap-3 pb-3 mb-3"
              style={{ borderBottom: `3px solid ${primaryColor}` }}
            >
              {logoUrl && (
                <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
              )}
              <div>
                <h3 className="font-bold" style={{ color: primaryColor }}>
                  {profile?.business_name || "Your Business Name"}
                </h3>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Invoice #INV-001</span>
              <span className="font-bold" style={{ color: primaryColor }}>₦50,000</span>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="gap-2" disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Customization
        </Button>
      </CardContent>
    </Card>
  );
};
