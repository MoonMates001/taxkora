import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const InvoicesPage = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your business invoices
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              No invoices yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Create your first invoice to start tracking payments and managing your business finances.
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicesPage;
