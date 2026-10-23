import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  eventService,
  budgetService,
  taskService,
  vendorService,
  guestService,
} from '../services/api';
import {
  EventItem,
  EventPlan,
  BudgetSummary,
  BudgetItem,
  TaskItem,
  VendorItem,
  GuestItem,
} from '../types';
import { EventNavTabs } from '../components/layout/EventNavTabs';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FileDown,
  Printer,
  Sparkles,
  Download,
  Calendar,
  Wallet,
  Users,
  Store,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

export const ExportPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  useEffect(() => {
    if (id) {
      loadAllData(id);
    }
  }, [id]);

  const loadAllData = async (eventId: string) => {
    try {
      setIsLoading(true);
      const [evRes, budRes, taskRes, venRes, guestRes] = await Promise.all([
        eventService.getById(eventId),
        budgetService.getSummary(eventId),
        taskService.getTasks(eventId),
        vendorService.getVendors(eventId),
        guestService.getGuests(eventId),
      ]);

      if (evRes.success) {
        setEvent(evRes.event);
        setPlan(evRes.plan || null);
      }
      if (budRes.success) {
        setBudgetSummary(budRes.summary);
        setBudgetItems(budRes.items);
      }
      if (taskRes.success) setTasks(taskRes.tasks);
      if (venRes.success) setVendors(venRes.vendors);
      if (guestRes.success) setGuests(guestRes.guests);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load event records for export.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    if (!event) return;

    try {
      setIsExportingPDF(true);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Brand Header Banner
      doc.setFillColor(79, 70, 229); // #4F46E5
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('FESTIVA AI — CELEBRATION DOSSIER', 14, 15);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Your Celebration, Powered by AI.', 14, 22);

      // Event Metadata
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(event.name, 14, 38);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Type: ${event.eventType}  |  City: ${event.city}  |  Location: ${event.indoorOutdoor}`, 14, 45);
      doc.text(
        `Date: ${new Date(event.eventDate).toLocaleDateString('en-IN', {
          dateStyle: 'full',
        })} (${event.startTime || '18:00'} - ${event.endTime || '23:00'})`,
        14,
        51
      );
      doc.text(
        `Target Budget: ${event.currency}${event.budget.toLocaleString('en-IN')}  |  Expected Guests: ${event.guestCount}`,
        14,
        57
      );

      let currentY = 66;

      // Overview Narrative
      if (plan?.overview) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('1. Celebration Overview & Concept Narrative', 14, currentY);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const splitOverview = doc.splitTextToSize(plan.overview, pageWidth - 28);
        doc.text(splitOverview, 14, currentY + 6);
        currentY += 8 + splitOverview.length * 4.5;
      }

      // Budget Breakdown Table
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Budget Allocations & Ledger', 14, currentY);

      const budgetTableBody = budgetItems.length
        ? budgetItems.map((b) => [
            b.category,
            b.description,
            `INR ${b.estimatedCost.toLocaleString('en-IN')}`,
            `INR ${b.actualCost.toLocaleString('en-IN')}`,
            b.paidStatus,
          ])
        : plan?.budgetBreakdown?.items?.map((item) => [
            item.category,
            item.item,
            `INR ${item.estimatedCost.toLocaleString('en-IN')}`,
            'INR 0',
            'Estimated',
          ]) || [];

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Category', 'Description', 'Est. Cost', 'Actual Cost', 'Status']],
        body: budgetTableBody,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;

      // Check if need new page
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      // Timeline Milestones Table
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Timeline & Preparation Milestones', 14, currentY);

      const taskTableBody = tasks.map((t) => [
        new Date(t.dueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }),
        t.title,
        t.category,
        t.priority,
        t.status,
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Due Date', 'Task Title', 'Category', 'Priority', 'Status']],
        body: taskTableBody,
        theme: 'striped',
        headStyles: { fillColor: [124, 58, 237] },
        styles: { fontSize: 8 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;

      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      // Vendors Table
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Hired & Quoted Vendors', 14, currentY);

      const vendorTableBody = vendors.map((v) => [
        v.name,
        v.category,
        v.phone || v.email || '-',
        `INR ${v.quotedPrice.toLocaleString('en-IN')}`,
        v.bookingStatus,
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Vendor Name', 'Category', 'Contact Info', 'Quoted Fee', 'Booking Status']],
        body: vendorTableBody,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        styles: { fontSize: 8 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;

      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      // Guest Attendee Summary
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('5. Guest List Summary', 14, currentY);

      const guestTableBody = guests.map((g) => [
        g.name,
        g.group,
        g.rsvpStatus,
        `+${g.plusOnes}`,
        (g.dietaryRequirements || []).join(', ') || '-',
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Guest Name', 'Group', 'RSVP', '+1s', 'Dietary']],
        body: guestTableBody,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 8 },
      });

      // Save document
      const fileName = `${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_Festiva_Plan.pdf`;
      doc.save(fileName);
      toast.success('Festiva AI PDF Dossier exported successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const exportCSV = (type: 'budget' | 'tasks' | 'vendors' | 'guests') => {
    if (!event) return;

    let headers: string[] = [];
    let rows: any[] = [];
    let filenameSuffix = '';

    if (type === 'budget') {
      filenameSuffix = 'Budget';
      headers = ['Category', 'Description', 'Estimated Cost (INR)', 'Actual Cost (INR)', 'Status', 'Notes'];
      rows = budgetItems.map((b) => [
        `"${b.category}"`,
        `"${b.description.replace(/"/g, '""')}"`,
        b.estimatedCost,
        b.actualCost,
        `"${b.paidStatus}"`,
        `"${(b.notes || '').replace(/"/g, '""')}"`,
      ]);
    } else if (type === 'tasks') {
      filenameSuffix = 'Tasks';
      headers = ['Title', 'Category', 'Due Date', 'Priority', 'Status', 'Assigned To'];
      rows = tasks.map((t) => [
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        `"${t.dueDate}"`,
        `"${t.priority}"`,
        `"${t.status}"`,
        `"${t.assignedTo || ''}"`,
      ]);
    } else if (type === 'vendors') {
      filenameSuffix = 'Vendors';
      headers = ['Name', 'Category', 'Phone', 'Email', 'Quoted Fee', 'Final Price', 'Booking Status'];
      rows = vendors.map((v) => [
        `"${v.name.replace(/"/g, '""')}"`,
        `"${v.category}"`,
        `"${v.phone || ''}"`,
        `"${v.email || ''}"`,
        v.quotedPrice,
        v.finalPrice || 0,
        `"${v.bookingStatus}"`,
      ]);
    } else if (type === 'guests') {
      filenameSuffix = 'Guests';
      headers = ['Name', 'Group', 'RSVP Status', 'Plus Ones', 'Table', 'Phone', 'Dietary'];
      rows = guests.map((g) => [
        `"${g.name.replace(/"/g, '""')}"`,
        `"${g.group}"`,
        `"${g.rsvpStatus}"`,
        g.plusOnes,
        `"${g.tableNumber || ''}"`,
        `"${g.phone || ''}"`,
        `"${(g.dietaryRequirements || []).join('; ')}"`,
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_${filenameSuffix}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filenameSuffix} CSV exported!`);
  };

  if (isLoading && !event) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Compiling printable records..." />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="pb-16 animate-fade-in">
      <div className="no-print">
        <EventNavTabs event={event} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Action Controls Header */}
        <div className="no-print bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900">
              Export Celebration Dossier
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate PDF documents for vendors or download CSV spreadsheets
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Page</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="px-5 py-2 rounded-xl gradient-brand text-xs font-bold text-white shadow-md hover:shadow-glow hover:scale-[1.02] transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExportingPDF ? 'Generating PDF...' : 'Download PDF Dossier'}</span>
            </button>
          </div>
        </div>

        {/* CSV Quick Export Pills */}
        <div className="no-print bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-700">Export Raw Spreadsheets (CSV):</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => exportCSV('budget')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-600 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Budget Ledger CSV</span>
            </button>
            <button
              onClick={() => exportCSV('tasks')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-600 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-brand-600" />
              <span>Timeline Tasks CSV</span>
            </button>
            <button
              onClick={() => exportCSV('vendors')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-600 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              <span>Vendors CSV</span>
            </button>
            <button
              onClick={() => exportCSV('guests')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-600 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
              <span>Guest RSVPs CSV</span>
            </button>
          </div>
        </div>

        {/* Print-Ready Master Document Preview */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-sm space-y-8 text-slate-800 print:shadow-none print:border-none print:p-0">
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-brand-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Festiva AI Master Event Dossier
                </span>
              </div>
              <h1 className="text-3xl font-extrabold font-display text-slate-900">{event.name}</h1>
              <p className="text-xs text-slate-500 mt-1">
                {event.eventType} • {event.city} • {event.indoorOutdoor} setting
              </p>
            </div>
            <div className="text-right text-xs text-slate-600 space-y-0.5">
              <strong className="block text-slate-900 font-bold">
                {new Date(event.eventDate).toLocaleDateString('en-IN', { dateStyle: 'full' })}
              </strong>
              <span>
                {event.startTime || '18:00'} - {event.endTime || '23:00'}
              </span>
              <span className="block font-semibold text-brand-600">
                Budget: {event.currency}
                {event.budget.toLocaleString('en-IN')} ({event.guestCount} Guests)
              </span>
            </div>
          </div>

          {/* Section 1: Concept & Theme */}
          {plan && (
            <div className="space-y-2 print-break-inside-avoid">
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                1. Concept Narrative & Aesthetic
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{plan.overview}</p>
              {plan.themeConcept && (
                <div className="pt-2 flex items-center gap-4 text-xs">
                  <span className="font-semibold text-slate-700">
                    Theme: {plan.themeConcept.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Colors:</span>
                    {plan.themeConcept.colorPalette?.map((c, i) => (
                      <span
                        key={i}
                        className="inline-block w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 2: Budget Breakdown */}
          <div className="space-y-3 print-break-inside-avoid">
            <h3 className="text-base font-bold font-display uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              2. Budget Summary & Itemized Ledger
            </h3>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="p-2 font-bold">Category</th>
                  <th className="p-2 font-bold">Line Item</th>
                  <th className="p-2 font-bold text-right">Est. Cost</th>
                  <th className="p-2 font-bold text-right">Actual Spend</th>
                  <th className="p-2 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgetItems.slice(0, 8).map((b) => (
                  <tr key={b._id}>
                    <td className="p-2 font-semibold text-slate-700">{b.category}</td>
                    <td className="p-2 text-slate-600">{b.description}</td>
                    <td className="p-2 text-right text-slate-600">
                      {event.currency}
                      {b.estimatedCost.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2 text-right font-bold text-slate-900">
                      {event.currency}
                      {b.actualCost.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2 text-center text-[10px] font-bold text-slate-500">
                      {b.paidStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Timeline Tasks */}
          <div className="space-y-3 print-break-inside-avoid">
            <h3 className="text-base font-bold font-display uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              3. Chronological Tasks & Timeline
            </h3>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="p-2 font-bold">Due Date</th>
                  <th className="p-2 font-bold">Milestone Title</th>
                  <th className="p-2 font-bold">Category</th>
                  <th className="p-2 font-bold">Priority</th>
                  <th className="p-2 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.slice(0, 8).map((t) => (
                  <tr key={t._id}>
                    <td className="p-2 text-slate-600 font-medium">
                      {new Date(t.dueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                    <td className="p-2 font-semibold text-slate-900">{t.title}</td>
                    <td className="p-2 text-slate-500">{t.category}</td>
                    <td className="p-2 text-slate-600">{t.priority}</td>
                    <td className="p-2 text-center text-[10px] font-bold">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Hired Vendors */}
          <div className="space-y-3 print-break-inside-avoid">
            <h3 className="text-base font-bold font-display uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              4. Vendor Directory & Quotes
            </h3>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="p-2 font-bold">Vendor Name</th>
                  <th className="p-2 font-bold">Category</th>
                  <th className="p-2 font-bold">Contact</th>
                  <th className="p-2 font-bold text-right">Quoted Fee</th>
                  <th className="p-2 font-bold text-center">Booking Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.slice(0, 6).map((v) => (
                  <tr key={v._id}>
                    <td className="p-2 font-bold text-slate-900">{v.name}</td>
                    <td className="p-2 text-slate-600">{v.category}</td>
                    <td className="p-2 text-slate-500">{v.phone || v.email || '-'}</td>
                    <td className="p-2 text-right font-bold text-slate-800">
                      {event.currency}
                      {v.quotedPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2 text-center text-[10px] font-semibold">
                      {v.bookingStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400">
            Exported from Festiva AI Celebration Planner • {new Date().toLocaleDateString('en-IN')} • "Your Celebration, Powered by AI."
          </div>
        </div>
      </div>
    </div>
  );
};
