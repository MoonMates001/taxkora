import { format } from "date-fns";
import { X, Download, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Invoice, InvoiceItem } from "@/hooks/useInvoices";
import { Profile } from "@/hooks/useAuth";

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  items?: InvoiceItem[];
  profile: Profile | null;
  onDownload?: () => void;
  onSend?: () => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export const InvoicePreviewDialog = ({
  open,
  onOpenChange,
  invoice,
  items = [],
  profile,
  onDownload,
  onSend,
}: InvoicePreviewDialogProps) => {
  if (!invoice) return null;

  const primaryColor = profile?.invoice_primary_color || "#0d9488";
  const businessName = profile?.business_name || profile?.full_name || "Your Business";
  const businessEmail = profile?.email || "";
  const businessPhone = profile?.phone || "";
  const businessAddress = profile?.business_address || "";
  const businessCity = profile?.business_city || "";
  const businessState = profile?.business_state || "";

  const displayItems = items.length > 0 ? items : invoice.items || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-xl">
              Invoice Preview
            </DialogTitle>
            <div className="flex items-center gap-2">
              {onSend && invoice.status === "draft" && (
                <Button variant="outline" size="sm" onClick={onSend}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invoice
                </Button>
              )}
              {onDownload && (
                <Button size="sm" onClick={onDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[70vh]">
          <div className="p-8 bg-white">
            {/* Invoice Header */}
            <div 
              className="flex justify-between items-start mb-8 pb-6"
              style={{ borderBottom: `3px solid ${primaryColor}` }}
            >
              <div className="flex items-start gap-4">
                {profile?.invoice_logo_url && (
                  <img 
                    src={profile.invoice_logo_url} 
                    alt="Business Logo" 
                    className="w-16 h-16 object-contain rounded"
                  />
                )}
                <div>
                  <h1 
                    className="text-2xl font-bold mb-2"
                    style={{ color: primaryColor }}
                  >
                    {businessName}
                  </h1>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {businessEmail && <p>{businessEmail}</p>}
                    {businessPhone && <p>{businessPhone}</p>}
                    {businessAddress && <p>{businessAddress}</p>}
                    {(businessCity || businessState) && (
                      <p>{[businessCity, businessState].filter(Boolean).join(", ")}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Invoice
                </p>
                <p className="text-xl font-bold mb-2">{invoice.invoice_number}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[invoice.status]}`}>
                  {invoice.status}
                </span>
              </div>
            </div>

            {/* Client & Dates */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Bill To
                </p>
                <p className="font-semibold text-lg">{invoice.clients?.name || "N/A"}</p>
                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                  {invoice.clients?.email && <p>{invoice.clients.email}</p>}
                  {invoice.clients?.address && <p>{invoice.clients.address}</p>}
                  {(invoice.clients?.city || invoice.clients?.state) && (
                    <p>{[invoice.clients.city, invoice.clients.state].filter(Boolean).join(", ")}</p>
                  )}
                </div>
              </div>

              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${primaryColor}10` }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Issue Date
                    </p>
                    <p className="font-semibold">{format(new Date(invoice.issue_date), "PPP")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Due Date
                    </p>
                    <p className="font-semibold">{format(new Date(invoice.due_date), "PPP")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: primaryColor }}>
                    <th className="text-left text-white text-sm font-medium py-3 px-4 rounded-tl-lg">
                      Description
                    </th>
                    <th className="text-center text-white text-sm font-medium py-3 px-4">
                      Qty
                    </th>
                    <th className="text-right text-white text-sm font-medium py-3 px-4">
                      Unit Price
                    </th>
                    <th className="text-right text-white text-sm font-medium py-3 px-4 rounded-tr-lg">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.length > 0 ? (
                    displayItems.map((item, index) => (
                      <tr key={index} className="border-b border-muted">
                        <td className="py-4 px-4">{item.description}</td>
                        <td className="py-4 px-4 text-center">{item.quantity}</td>
                        <td className="py-4 px-4 text-right">
                          ₦{Number(item.unit_price).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right font-medium">
                          ₦{Number(item.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No items
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div 
                className="w-72 p-4 rounded-lg"
                style={{ backgroundColor: `${primaryColor}10` }}
              >
                <div className="flex justify-between py-2 text-sm">
                  <span>Subtotal</span>
                  <span>₦{Number(invoice.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span>VAT ({invoice.tax_rate}%)</span>
                  <span>₦{Number(invoice.tax_amount).toLocaleString()}</span>
                </div>
                <div 
                  className="flex justify-between py-3 mt-2 text-lg font-bold border-t-2"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  <span>Total Due</span>
                  <span>₦{Number(invoice.total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                <p className="font-semibold text-amber-800 mb-1">Notes / Payment Instructions</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>Thank you for your business!</p>
              <p className="mt-1">Generated by {businessName}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
