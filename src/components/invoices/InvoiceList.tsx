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
import { useAuth } from "@/hooks/useAuth";

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
  onPreviewInvoice?: (invoice: Invoice) => void;
}

export const InvoiceList = ({ invoices, onViewInvoice, onPreviewInvoice }: InvoiceListProps) => {
  const { deleteInvoice, getInvoiceWithItems } = useInvoices();
  const { profile } = useAuth();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      await deleteInvoice.mutateAsync(id);
    }
  };

  const handlePreview = async (invoice: Invoice) => {
    if (onPreviewInvoice) {
      // Fetch full invoice with items before previewing
      const fullInvoice = await getInvoiceWithItems(invoice.id);
      if (fullInvoice) {
        onPreviewInvoice(fullInvoice);
      }
    }
  };

  const generatePDF = async (invoice: Invoice) => {
    // Fetch invoice with items for complete details
    const fullInvoice = await getInvoiceWithItems(invoice.id);
    const invoiceData = fullInvoice || invoice;
    
    // Create a professional printable invoice with business information
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const businessName = profile?.business_name || profile?.full_name || "Your Business";
    const businessEmail = profile?.email || "";
    const businessPhone = profile?.phone || "";

    // Generate items rows HTML
    const itemsHtml = invoiceData.items && invoiceData.items.length > 0 
      ? invoiceData.items.map(item => `
          <tr>
            <td>${item.description}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">₦${Number(item.unit_price).toLocaleString()}</td>
            <td style="text-align: right;">₦${Number(item.amount).toLocaleString()}</td>
          </tr>
        `).join('')
      : `<tr><td colspan="4" style="text-align: center; color: #666; padding: 20px;">No items</td></tr>`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceData.invoice_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px; 
              max-width: 800px; 
              margin: 0 auto; 
              color: #333;
              line-height: 1.6;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start;
              margin-bottom: 40px; 
              padding-bottom: 20px;
              border-bottom: 3px solid #0d9488;
            }
            .business-info { max-width: 60%; }
            .business-name { 
              font-size: 28px; 
              font-weight: bold; 
              color: #0d9488; 
              margin-bottom: 8px;
            }
            .business-contact { 
              font-size: 13px; 
              color: #666; 
              line-height: 1.8;
            }
            .invoice-details { 
              text-align: right; 
              min-width: 200px;
            }
            .invoice-label { 
              font-size: 12px; 
              color: #999; 
              text-transform: uppercase; 
              letter-spacing: 1px;
            }
            .invoice-number { 
              font-size: 22px; 
              font-weight: bold; 
              color: #333;
              margin-bottom: 12px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-draft { background: #e5e7eb; color: #374151; }
            .status-sent { background: #dbeafe; color: #1d4ed8; }
            .status-paid { background: #d1fae5; color: #047857; }
            .status-overdue { background: #fee2e2; color: #dc2626; }
            .status-cancelled { background: #e5e7eb; color: #6b7280; }
            .parties { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 30px;
              gap: 40px;
            }
            .party-section { flex: 1; }
            .party-label { 
              font-size: 11px; 
              color: #999; 
              text-transform: uppercase; 
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            .party-name { 
              font-size: 16px; 
              font-weight: 600; 
              margin-bottom: 4px;
            }
            .party-details { font-size: 14px; color: #666; }
            .dates-row { 
              display: flex; 
              gap: 30px; 
              margin-bottom: 30px;
              padding: 15px;
              background: #f8fafa;
              border-radius: 8px;
            }
            .date-item { }
            .date-label { 
              font-size: 11px; 
              color: #999; 
              text-transform: uppercase;
            }
            .date-value { font-weight: 600; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px;
            }
            th { 
              padding: 14px 12px; 
              text-align: left; 
              background-color: #0d9488; 
              color: white;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }
            td { 
              padding: 14px 12px; 
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
            }
            tbody tr:hover { background-color: #f9fafb; }
            .totals { 
              display: flex;
              justify-content: flex-end;
              margin-bottom: 30px;
            }
            .totals-box { 
              width: 280px;
              background: #f8fafa;
              padding: 20px;
              border-radius: 8px;
            }
            .totals-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 10px;
              font-size: 14px;
            }
            .totals-row.total { 
              font-size: 18px; 
              font-weight: bold; 
              border-top: 2px solid #0d9488; 
              padding-top: 12px;
              margin-top: 12px;
              color: #0d9488;
            }
            .notes { 
              padding: 20px; 
              background: #fffbeb; 
              border-left: 4px solid #f59e0b;
              border-radius: 0 8px 8px 0;
              margin-top: 30px;
            }
            .notes-label { 
              font-weight: 600; 
              margin-bottom: 8px;
              color: #92400e;
            }
            .notes-content { 
              font-size: 14px; 
              color: #666;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
            @media print { 
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="business-info">
              <div class="business-name">${businessName}</div>
              <div class="business-contact">
                ${businessEmail ? `<div>✉ ${businessEmail}</div>` : ''}
                ${businessPhone ? `<div>☎ ${businessPhone}</div>` : ''}
              </div>
            </div>
            <div class="invoice-details">
              <div class="invoice-label">Invoice</div>
              <div class="invoice-number">${invoiceData.invoice_number}</div>
              <span class="status-badge status-${invoiceData.status}">${invoiceData.status}</span>
            </div>
          </div>
          
          <div class="parties">
            <div class="party-section">
              <div class="party-label">Bill To</div>
              <div class="party-name">${invoiceData.clients?.name || "N/A"}</div>
              <div class="party-details">
                ${invoiceData.clients?.email ? `<div>${invoiceData.clients.email}</div>` : ''}
                ${invoiceData.clients?.address ? `<div>${invoiceData.clients.address}</div>` : ''}
                ${invoiceData.clients?.city ? `<div>${invoiceData.clients.city}${invoiceData.clients.state ? `, ${invoiceData.clients.state}` : ''}</div>` : ''}
              </div>
            </div>
          </div>
          
          <div class="dates-row">
            <div class="date-item">
              <div class="date-label">Issue Date</div>
              <div class="date-value">${format(new Date(invoiceData.issue_date), "PPP")}</div>
            </div>
            <div class="date-item">
              <div class="date-label">Due Date</div>
              <div class="date-value">${format(new Date(invoiceData.due_date), "PPP")}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Description</th>
                <th style="width: 15%;">Qty</th>
                <th style="width: 17%;">Unit Price</th>
                <th style="width: 18%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-box">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>₦${Number(invoiceData.subtotal).toLocaleString()}</span>
              </div>
              <div class="totals-row">
                <span>VAT (${invoiceData.tax_rate}%)</span>
                <span>₦${Number(invoiceData.tax_amount).toLocaleString()}</span>
              </div>
              <div class="totals-row total">
                <span>Total Due</span>
                <span>₦${Number(invoiceData.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          ${invoiceData.notes ? `
            <div class="notes">
              <div class="notes-label">Notes / Payment Instructions</div>
              <div class="notes-content">${invoiceData.notes}</div>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p style="margin-top: 5px;">Generated by ${businessName}</p>
          </div>
          
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
                  <DropdownMenuItem onClick={() => handlePreview(invoice)}>
                    <Eye className="w-4 h-4 mr-2" /> Preview
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
