import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInvoices, Invoice } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { useAuth } from "@/hooks/useAuth";
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog";
import { ClientDialog } from "@/components/invoices/ClientDialog";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { InvoicePreviewDialog } from "@/components/invoices/InvoicePreviewDialog";
import SubscriptionGate from "@/components/subscription/SubscriptionGate";

const InvoicesPage = () => {
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const { profile } = useAuth();
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const { clients, isLoading: clientsLoading, deleteClient } = useClients();

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SubscriptionGate requiredPlan={["pit_business", "cit"]} feature="Invoice Management">
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Invoices & Clients
          </h1>
          <p className="text-muted-foreground mt-1">
            Create invoices and manage your clients
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setClientDialogOpen(true)}>
            <Users className="w-4 h-4 mr-2" />
            Add Client
          </Button>
          <Button onClick={() => setCreateInvoiceOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices or clients..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invoices">
            Invoices ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="clients">Clients ({clients.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">All Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading invoices...
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                    {searchQuery ? "No invoices found" : "No invoices yet"}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    {searchQuery
                      ? "Try a different search term"
                      : "Create your first invoice to start tracking payments."}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setCreateInvoiceOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Invoice
                    </Button>
                  )}
                </div>
              ) : (
                <InvoiceList 
                  invoices={filteredInvoices} 
                  onPreviewInvoice={(invoice) => setPreviewInvoice(invoice)}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">All Clients</CardTitle>
            </CardHeader>
            <CardContent>
              {clientsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading clients...
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                    {searchQuery ? "No clients found" : "No clients yet"}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    {searchQuery
                      ? "Try a different search term"
                      : "Add your first client to create invoices."}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setClientDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Client
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredClients.map((client) => (
                    <Card key={client.id} className="relative">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-1">{client.name}</h4>
                        {client.email && (
                          <p className="text-sm text-muted-foreground">
                            {client.email}
                          </p>
                        )}
                        {client.phone && (
                          <p className="text-sm text-muted-foreground">
                            {client.phone}
                          </p>
                        )}
                        {(client.city || client.state) && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {[client.city, client.state]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this client?"
                                )
                              ) {
                                deleteClient.mutate(client.id);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateInvoiceDialog
        open={createInvoiceOpen}
        onOpenChange={setCreateInvoiceOpen}
      />
      <ClientDialog open={clientDialogOpen} onOpenChange={setClientDialogOpen} />
      <InvoicePreviewDialog
        open={!!previewInvoice}
        onOpenChange={(open) => !open && setPreviewInvoice(null)}
        invoice={previewInvoice}
        items={previewInvoice?.items}
        profile={profile}
      />
    </div>
    </SubscriptionGate>
  );
};

export default InvoicesPage;
