import { format } from "date-fns";
import { MoreHorizontal, Eye, Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Invoice, InvoiceStatus, useInvoices } from "@/hooks/useInvoices";

const statusColors: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-500",
};

interface InvoiceListProps {
  invoices: Invoice[];
  onViewInvoice?: (invoice: Invoice) => void;
}

export const InvoiceList = ({ invoices, onViewInvoice }: InvoiceListProps) => {
  const { deleteInvoice } = useInvoices();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      await deleteInvoice.mutateAsync(id);
    }
  };

  const generatePDF = (invoice: Invoice) => {
    // Create a simple printable invoice
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .invoice-number { font-size: 24px; font-weight: bold; color: #0d9488; }
            .client-info { margin-bottom: 30px; }
            .dates { display: flex; gap: 40px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; }
            .totals { text-align: right; }
            .totals div { margin: 8px 0; }
            .total-line { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
            @media print { body { print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="invoice-number">${invoice.invoice_number}</div>
              <div>TAXKORA</div>
            </div>
            <div style="text-align: right">
              <div><strong>Status:</strong> ${invoice.status.toUpperCase()}</div>
            </div>
          </div>
          
          <div class="client-info">
            <strong>Bill To:</strong><br>
            ${invoice.clients?.name || "N/A"}<br>
            ${invoice.clients?.email || ""}<br>
            ${invoice.clients?.address || ""}<br>
            ${invoice.clients?.city ? `${invoice.clients.city}, ${invoice.clients.state || ""}` : ""}
          </div>
          
          <div class="dates">
            <div><strong>Issue Date:</strong> ${format(new Date(invoice.issue_date), "PPP")}</div>
            <div><strong>Due Date:</strong> ${format(new Date(invoice.due_date), "PPP")}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="4" style="text-align: center; color: #666;">
                  Invoice items details available in full view
                </td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals">
            <div><strong>Subtotal:</strong> ₦${Number(invoice.subtotal).toLocaleString()}</div>
            <div><strong>VAT (${invoice.tax_rate}%):</strong> ₦${Number(invoice.tax_amount).toLocaleString()}</div>
            <div class="total-line"><strong>Total:</strong> ₦${Number(invoice.total).toLocaleString()}</div>
          </div>
          
          ${invoice.notes ? `<div style="margin-top: 40px; padding: 20px; background: #f8f9fa;"><strong>Notes:</strong><br>${invoice.notes}</div>` : ""}
          
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (invoices.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Issue Date</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-10"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
            <TableCell>{invoice.clients?.name || "—"}</TableCell>
            <TableCell>{format(new Date(invoice.issue_date), "MMM d, yyyy")}</TableCell>
            <TableCell>{format(new Date(invoice.due_date), "MMM d, yyyy")}</TableCell>
            <TableCell className="font-semibold">
              ₦{Number(invoice.total).toLocaleString()}
            </TableCell>
            <TableCell>
              <Badge className={statusColors[invoice.status]} variant="secondary">
                {invoice.status}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewInvoice?.(invoice)}>
                    <Eye className="w-4 h-4 mr-2" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generatePDF(invoice)}>
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(invoice.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
