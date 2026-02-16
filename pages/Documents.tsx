import React, { useState } from 'react';
import { Card, Button, Input, Select, StatusBadge, TextArea, Modal } from '../components/UI';
import { Plus, FileText, Download, Trash2, Search, Sparkles, CreditCard, CheckCircle2, Pencil, ArrowLeft, Save, Palette, Type, LayoutTemplate } from 'lucide-react';
import { AppDocument, Client, DocumentType, DocItem, DocDesign } from '../types';
import { format, addDays } from 'date-fns';
import { generateDocumentNotes } from '../services/geminiService';
import { jsPDF } from "jspdf";

interface DocumentsProps {
  documents: AppDocument[];
  clients: Client[];
  onCreateDocument: (doc: AppDocument) => void;
  onUpdateDocument: (doc: AppDocument) => void;
  onDeleteDocument: (id: string) => void;
}

const BRAND_COLORS = [
  { name: 'Orange', value: '#f97316' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Slate', value: '#334155' },
];

export const Documents: React.FC<DocumentsProps> = ({ documents, clients, onCreateDocument, onUpdateDocument, onDeleteDocument }) => {
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [docType, setDocType] = useState<DocumentType>('invoice');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [items, setItems] = useState<DocItem[]>([{ id: '1', description: 'Consulting Services', quantity: 1, price: 100 }]);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [docDate, setDocDate] = useState('');
  const [docStatus, setDocStatus] = useState<string>('draft');
  const [docDesign, setDocDesign] = useState<DocDesign>({ color: '#f97316', font: 'helvetica', layout: 'modern' });
  const [generatingNotes, setGeneratingNotes] = useState(false);

  // Payment State
  const [activePaymentDoc, setActivePaymentDoc] = useState<AppDocument | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  const resetForm = () => {
    setDocType('invoice');
    setSelectedClientId('');
    setItems([{ id: '1', description: 'Consulting Services', quantity: 1, price: 100 }]);
    setNotes('');
    setDueDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
    setDocDate(format(new Date(), 'yyyy-MM-dd'));
    setDocStatus('draft');
    setDocDesign({ color: '#f97316', font: 'helvetica', layout: 'modern' });
    setEditingId(null);
    setActiveTab('content');
  };

  const handleStartCreate = () => {
    resetForm();
    setMode('create');
  };

  const handleStartEdit = (doc: AppDocument) => {
    setEditingId(doc.id);
    setDocType(doc.type);
    setSelectedClientId(doc.clientId);
    setItems(JSON.parse(JSON.stringify(doc.items))); // Deep copy
    setNotes(doc.notes || '');
    setDueDate(doc.dueDate);
    setDocDate(doc.date);
    setDocStatus(doc.status);
    setDocDesign(doc.design || { color: '#f97316', font: 'helvetica', layout: 'modern' });
    setMode('edit');
  };

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, price: 0 }]);
  };

  const handleUpdateItem = (id: string, field: keyof DocItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
    const tax = subtotal * 0.1; // 10% tax example
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleSave = () => {
    if (!selectedClientId) return alert("Please select a client");
    const { subtotal, tax, total } = calculateTotal();
    
    const docData: AppDocument = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      clientId: selectedClientId,
      type: docType,
      status: docStatus as any,
      items,
      subtotal,
      tax,
      total,
      date: docDate,
      dueDate: dueDate,
      notes,
      design: docDesign
    };

    if (mode === 'create') {
      onCreateDocument(docData);
    } else {
      onUpdateDocument(docData);
    }
    setMode('list');
    resetForm();
  };

  const handleGenerateNotes = async () => {
    if (!selectedClientId) return alert("Select a client first");
    setGeneratingNotes(true);
    const client = clients.find(c => c.id === selectedClientId);
    const itemsDesc = items.map(i => i.description).join(', ');
    const note = await generateDocumentNotes(docType, client?.name || 'Client', itemsDesc);
    setNotes(note);
    setGeneratingNotes(false);
  };

  const handleDownloadPDF = (doc: AppDocument) => {
    const docClient = clients.find(c => c.id === doc.clientId);
    const pdf = new jsPDF();
    const lineHeight = 7;
    
    // Design Variables
    const themeColor = doc.design?.color || '#f97316';
    const font = doc.design?.font || 'helvetica';
    const layout = doc.design?.layout || 'modern';
    const isClassic = layout === 'classic';

    let yPos = 20;

    // Apply Font
    pdf.setFont(font);

    // Header Section
    if (isClassic) {
      // Classic: Centered Layout
      pdf.setFontSize(26);
      pdf.setTextColor(themeColor);
      pdf.text("ORANGE BUSINESS", 105, yPos, { align: 'center' });
      
      yPos += 12;
      pdf.setFontSize(16);
      pdf.setTextColor(80, 80, 80);
      pdf.text(doc.type.toUpperCase(), 105, yPos, { align: 'center' });
      yPos += 20;
    } else {
      // Modern: Left Align with large type
      pdf.setFontSize(22);
      pdf.setTextColor(themeColor);
      pdf.text("ORANGE BUSINESS", 20, yPos);
      
      pdf.setFontSize(30);
      pdf.setTextColor(100, 116, 139); // Slate 500
      pdf.text(doc.type.toUpperCase(), 140, yPos);
      yPos += 15;
    }

    // Metadata
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const metaX = isClassic ? 105 : 140;
    const metaAlign = isClassic ? 'center' : 'left';
    
    pdf.text(`Document ID: #${doc.id.slice(0, 8)}`, metaX, yPos, { align: metaAlign });
    yPos += lineHeight;
    pdf.text(`Date: ${doc.date}`, metaX, yPos, { align: metaAlign });
    yPos += lineHeight;
    pdf.text(`Due Date: ${doc.dueDate}`, metaX, yPos, { align: metaAlign });
    yPos += lineHeight;
    pdf.text(`Status: ${doc.status.toUpperCase()}`, metaX, yPos, { align: metaAlign });

    // Client Info
    yPos = isClassic ? yPos + 15 : 35;
    const clientX = isClassic ? 105 : 20;
    const clientAlign = isClassic ? 'center' : 'left';

    pdf.setFontSize(12);
    pdf.setTextColor(51, 65, 85);
    pdf.text("Bill To:", clientX, yPos, { align: clientAlign });
    yPos += lineHeight;
    
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(docClient?.name || "Unknown Client", clientX, yPos, { align: clientAlign });
    yPos += lineHeight;
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(docClient?.company || "", clientX, yPos, { align: clientAlign });
    yPos += lineHeight;
    pdf.text(docClient?.email || "", clientX, yPos, { align: clientAlign });
    yPos += lineHeight;
    pdf.text(docClient?.address || "", clientX, yPos, { align: clientAlign });

    // Table Header
    yPos = 90;
    // Set fill color for header
    pdf.setFillColor(241, 245, 249); // Default Slate 100
    if (!isClassic) {
       // Modern uses a colored strip maybe? Let's stick to slate for readability, or use light theme color
       // pdf.setFillColor(themeColor); // This might be too dark for black text, skipping for now
    }
    
    pdf.rect(20, yPos - 5, 170, 10, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105);
    // Bold font for header
    pdf.setFont(font, "bold");
    
    pdf.text("Description", 25, yPos + 1.5);
    pdf.text("Qty", 120, yPos + 1.5);
    pdf.text("Price", 145, yPos + 1.5);
    pdf.text("Total", 170, yPos + 1.5);

    // Table Rows
    yPos += 12;
    pdf.setFont(font, "normal");
    pdf.setTextColor(0, 0, 0);

    doc.items.forEach(item => {
      const itemTotal = Number(item.quantity) * Number(item.price);
      pdf.text(item.description, 25, yPos);
      pdf.text(String(item.quantity), 120, yPos);
      pdf.text(`$${Number(item.price).toFixed(2)}`, 145, yPos);
      pdf.text(`$${itemTotal.toFixed(2)}`, 170, yPos);
      yPos += 10;
    });

    // Divider
    pdf.setDrawColor(themeColor); 
    pdf.setLineWidth(0.5);
    pdf.line(20, yPos, 190, yPos);
    yPos += 10;

    // Totals
    const rightAlignX = 170;
    pdf.text("Subtotal:", 140, yPos);
    pdf.text(`$${doc.subtotal.toFixed(2)}`, rightAlignX, yPos);
    yPos += 8;
    pdf.text("Tax (10%):", 140, yPos);
    pdf.text(`$${doc.tax.toFixed(2)}`, rightAlignX, yPos);
    yPos += 10;
    
    pdf.setFont(font, "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(themeColor); // Colored Total
    pdf.text("Total:", 140, yPos);
    pdf.text(`$${doc.total.toFixed(2)}`, rightAlignX, yPos);

    // Notes
    if (doc.notes) {
      yPos += 30;
      pdf.setFontSize(10);
      pdf.setFont(font, "bold");
      pdf.setTextColor(51, 65, 85);
      const noteX = isClassic ? 105 : 20;
      const noteAlign = isClassic ? 'center' : 'left';
      
      pdf.text("Notes:", noteX, yPos, { align: noteAlign });
      yPos += 7;
      pdf.setFont(font, "italic");
      pdf.setTextColor(100, 100, 100);
      
      const splitNotes = pdf.splitTextToSize(doc.notes, 170);
      pdf.text(splitNotes, noteX, yPos, { align: noteAlign });
    }

    // Save
    pdf.save(`${doc.type}_${doc.id}.pdf`);
  };

  const initiatePayment = (doc: AppDocument) => {
    setActivePaymentDoc(doc);
    setPaymentSuccess(false);
    setCardNumber('');
    setCardExpiry('');
    setCardCVC('');
  };

  const processPayment = () => {
    if (!activePaymentDoc) return;
    setIsProcessingPayment(true);
    
    setTimeout(() => {
      onUpdateDocument({ ...activePaymentDoc, status: 'paid' });
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      setTimeout(() => setActivePaymentDoc(null), 1500);
    }, 1500);
  };

  const filteredDocs = documents.filter(d => {
    const searchLower = searchTerm.toLowerCase();
    return (
      d.id.toLowerCase().includes(searchLower) || 
      d.status.toLowerCase().includes(searchLower) ||
      clients.find(c => c.id === d.clientId)?.name.toLowerCase().includes(searchLower)
    );
  });

  if (mode === 'create' || mode === 'edit') {
    const totals = calculateTotal();
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Button variant="ghost" onClick={() => { setMode('list'); resetForm(); }} className="p-2 rounded-full">
                <ArrowLeft size={20} />
             </Button>
             <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    {mode === 'create' ? `Create ${docType.charAt(0).toUpperCase() + docType.slice(1)}` : `Edit ${docType.charAt(0).toUpperCase() + docType.slice(1)} #${editingId?.slice(0,6)}`}
                </h2>
                <p className="text-slate-500 text-sm">{mode === 'create' ? 'Fill out the details below.' : 'Update document information.'}</p>
             </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setMode('list'); resetForm(); }}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>
                <Save size={18} className="mr-2" />
                {mode === 'create' ? 'Save Document' : 'Update Document'}
            </Button>
          </div>
        </div>

        <Card className="space-y-0 shadow-md border-orange-100/50 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 pt-2">
            <button 
                onClick={() => setActiveTab('content')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'content' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
            >
                Edit Content
            </button>
            <button 
                onClick={() => setActiveTab('design')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'design' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
            >
                <Palette size={14} /> Customize Design
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'content' ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Select label="Type" value={docType} onChange={(e) => setDocType(e.target.value as DocumentType)}>
                        <option value="invoice">Invoice</option>
                        <option value="quote">Quote</option>
                        <option value="receipt">Receipt</option>
                        </Select>
                        
                        <Select label="Client" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                        <option value="">Select a client...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>

                        <Input 
                        type="date" 
                        label="Issue Date" 
                        value={docDate} 
                        onChange={(e) => setDocDate(e.target.value)} 
                        />

                        <Input 
                        type="date" 
                        label="Due Date" 
                        value={dueDate} 
                        onChange={(e) => setDueDate(e.target.value)} 
                        />
                    </div>

                    {mode === 'edit' && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <label className="text-sm font-medium text-slate-700 block mb-2">Document Status</label>
                            <div className="flex gap-2 flex-wrap">
                                {['draft', 'sent', 'paid', 'overdue'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setDocStatus(s)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition-all ${docStatus === s ? 'bg-orange-100 border-orange-200 text-orange-800 ring-1 ring-orange-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t border-slate-100 pt-4">
                        <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-slate-700">Line Items</h3>
                        <Button variant="ghost" onClick={handleAddItem} className="text-orange-600 text-xs font-medium px-2 py-1 h-auto">
                            <Plus size={14} className="mr-1" /> Add Item
                        </Button>
                        </div>
                        
                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                        {items.map((item, index) => (
                            <div key={item.id} className="flex flex-col md:flex-row gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="flex-grow w-full">
                                <Input 
                                    placeholder="Description of service or product" 
                                    value={item.description} 
                                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Input 
                                type="number" 
                                placeholder="Qty" 
                                className="w-20 bg-white" 
                                value={item.quantity} 
                                onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                                />
                                <Input 
                                type="number" 
                                placeholder="Price" 
                                className="w-32 bg-white" 
                                value={item.price} 
                                onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value)}
                                />
                                <Button variant="ghost" className="text-slate-400 hover:text-red-500 px-2" onClick={() => handleRemoveItem(item.id)}>
                                <Trash2 size={16} />
                                </Button>
                            </div>
                            </div>
                        ))}
                        {items.length === 0 && <p className="text-center text-slate-400 text-sm py-2">No items added yet.</p>}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium text-slate-700">Notes & Terms</label>
                            <button 
                            onClick={handleGenerateNotes} 
                            disabled={generatingNotes}
                            className="text-xs flex items-center text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50 transition-colors"
                            >
                            <Sparkles size={12} className="mr-1" />
                            {generatingNotes ? 'Writing...' : 'AI Generate'}
                            </button>
                        </div>
                        <TextArea 
                            placeholder="Payment terms, thank you notes, etc." 
                            rows={4} 
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="bg-slate-50 focus:bg-white transition-colors"
                        />
                        </div>
                        <div className="flex justify-end items-end">
                        <div className="w-full md:w-72 space-y-3 bg-slate-50 p-4 rounded-xl">
                            <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-mono">${totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                            <span>Tax (10%)</span>
                            <span className="font-mono">${totals.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-slate-800 border-t border-slate-200 pt-3">
                            <span>Total</span>
                            <span className="font-mono" style={{ color: docDesign.color }}>${totals.total.toFixed(2)}</span>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Palette size={16} className="text-slate-500" />
                            Accent Color
                        </h3>
                        <div className="flex gap-4 flex-wrap">
                            {BRAND_COLORS.map(color => (
                                <button
                                    key={color.value}
                                    onClick={() => setDocDesign({...docDesign, color: color.value})}
                                    className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${docDesign.color === color.value ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                >
                                    {docDesign.color === color.value && <CheckCircle2 className="text-white" size={20} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Type size={16} className="text-slate-500" />
                            Typography
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'helvetica', name: 'Modern Sans', family: 'Helvetica, Arial, sans-serif' },
                                { id: 'times', name: 'Classic Serif', family: 'Times New Roman, serif' },
                                { id: 'courier', name: 'Monospace', family: 'Courier New, monospace' }
                            ].map(font => (
                                <button
                                    key={font.id}
                                    onClick={() => setDocDesign({...docDesign, font: font.id})}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${docDesign.font === font.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-200'}`}
                                >
                                    <div className="text-lg font-bold text-slate-800 mb-1" style={{ fontFamily: font.family }}>Aa</div>
                                    <div className="text-sm font-medium text-slate-900">{font.name}</div>
                                    <div className="text-xs text-slate-500">{font.id}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <LayoutTemplate size={16} className="text-slate-500" />
                            Layout Style
                        </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setDocDesign({...docDesign, layout: 'modern'})}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${docDesign.layout === 'modern' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-200'}`}
                            >
                                <div className="h-16 bg-white mb-3 rounded border border-slate-100 p-2 flex flex-col gap-1">
                                    <div className="w-1/3 h-2 rounded bg-slate-200" style={{ backgroundColor: docDesign.color }}></div>
                                    <div className="w-1/4 h-1.5 rounded bg-slate-100"></div>
                                    <div className="mt-2 w-full h-px bg-slate-100"></div>
                                    <div className="w-full h-4 bg-slate-50 rounded"></div>
                                </div>
                                <div className="text-sm font-medium text-slate-900">Modern Layout</div>
                                <div className="text-xs text-slate-500">Left-aligned, clean structure</div>
                            </button>
                             <button
                                onClick={() => setDocDesign({...docDesign, layout: 'classic'})}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${docDesign.layout === 'classic' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-200'}`}
                            >
                                <div className="h-16 bg-white mb-3 rounded border border-slate-100 p-2 flex flex-col gap-1 items-center">
                                    <div className="w-1/3 h-2 rounded bg-slate-200" style={{ backgroundColor: docDesign.color }}></div>
                                    <div className="w-1/4 h-1.5 rounded bg-slate-100"></div>
                                    <div className="mt-2 w-full h-px bg-slate-100"></div>
                                    <div className="w-full h-4 bg-slate-50 rounded"></div>
                                </div>
                                <div className="text-sm font-medium text-slate-900">Classic Layout</div>
                                <div className="text-xs text-slate-500">Center-aligned, traditional</div>
                            </button>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                         <span className="text-sm text-slate-600">Preview styles are applied when you download the PDF.</span>
                         <div className="h-8 w-8 rounded-full border border-slate-200" style={{ backgroundColor: docDesign.color }}></div>
                    </div>
                </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Smart Documents</h2>
          <p className="text-slate-500">Manage your invoices, quotes, and receipts.</p>
        </div>
        <Button onClick={handleStartCreate} className="w-full md:w-auto shadow-md shadow-orange-200">
          <Plus size={18} className="mr-2" /> Create New
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search by ID, Client, or Status..." 
            className="pl-10 border-slate-200 focus:border-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Client</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">#{doc.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm font-medium capitalize text-slate-800">{doc.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {clients.find(c => c.id === doc.clientId)?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{doc.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{doc.dueDate}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">${doc.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" className="p-1.5 h-8 w-8 text-slate-400 hover:text-orange-600 hover:bg-orange-50" onClick={() => handleStartEdit(doc)} title="Edit Document">
                            <Pencil size={16} />
                        </Button>
                        {doc.type === 'invoice' && doc.status !== 'paid' && (
                        <Button variant="ghost" className="p-1.5 h-8 w-8 text-slate-400 hover:text-green-600 hover:bg-green-50" onClick={() => initiatePayment(doc)} title="Process Payment">
                            <CreditCard size={16} />
                        </Button>
                        )}
                        <Button variant="ghost" className="p-1.5 h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleDownloadPDF(doc)} title="Download PDF">
                        <Download size={16} />
                        </Button>
                        <Button variant="ghost" className="p-1.5 h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => onDeleteDocument(doc.id)} title="Delete">
                        <Trash2 size={16} />
                        </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                        <FileText size={48} className="text-slate-200 mb-2" />
                        <p>No documents found.</p>
                        <Button variant="ghost" className="mt-2 text-orange-600" onClick={handleStartCreate}>Create your first document</Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} className="p-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                <StatusBadge status={doc.status} />
             </div>
            <div className="flex justify-between items-start mb-3 pr-20">
              <div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">#{doc.id.slice(0, 8)}</span>
                <h3 className="font-bold text-slate-800 capitalize mt-1 text-lg">{doc.type}</h3>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between">
                <span>Client:</span>
                <span className="font-medium text-slate-900">{clients.find(c => c.id === doc.clientId)?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{doc.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Due Date:</span>
                <span className={doc.status === 'overdue' ? 'text-red-600 font-medium' : ''}>{doc.dueDate}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200 mt-2">
                <span>Total:</span>
                <span>${doc.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
               <Button variant="outline" className="flex items-center justify-center" onClick={() => handleStartEdit(doc)}>
                  <Pencil size={16} />
               </Button>
               {doc.type === 'invoice' && doc.status !== 'paid' ? (
                <Button variant="outline" className="flex items-center justify-center text-green-600 border-green-200 bg-green-50" onClick={() => initiatePayment(doc)}>
                  <CreditCard size={16} />
                </Button>
              ) : <div />}
              <Button variant="outline" className="flex items-center justify-center" onClick={() => handleDownloadPDF(doc)}>
                <Download size={16} />
              </Button>
              <Button variant="outline" className="flex items-center justify-center text-red-500 border-red-200 hover:bg-red-50" onClick={() => onDeleteDocument(doc.id)}>
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
        {filteredDocs.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
            <FileText size={48} className="mx-auto text-slate-300 mb-2" />
            <p>No documents found.</p>
            <Button variant="ghost" className="mt-2 text-orange-600" onClick={handleStartCreate}>Create your first document</Button>
          </div>
        )}
      </div>

      <Modal 
        isOpen={!!activePaymentDoc} 
        onClose={() => setActivePaymentDoc(null)} 
        title={`Process Payment - #${activePaymentDoc?.id.slice(0, 8)}`}
      >
        {paymentSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Payment Successful!</h3>
            <p className="text-slate-500">The invoice has been marked as paid.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Amount</span>
              <span className="text-2xl font-bold text-slate-900">${activePaymentDoc?.total.toLocaleString()}</span>
            </div>
            
            <div className="space-y-3">
               <Input 
                 label="Card Number" 
                 placeholder="0000 0000 0000 0000" 
                 value={cardNumber}
                 onChange={(e) => setCardNumber(e.target.value)}
               />
               <div className="grid grid-cols-2 gap-4">
                 <Input 
                   label="Expiry Date" 
                   placeholder="MM/YY" 
                   value={cardExpiry}
                   onChange={(e) => setCardExpiry(e.target.value)}
                 />
                 <Input 
                   label="CVC" 
                   placeholder="123" 
                   value={cardCVC}
                   onChange={(e) => setCardCVC(e.target.value)}
                 />
               </div>
            </div>

            <Button 
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700" 
              onClick={processPayment}
              isLoading={isProcessingPayment}
              disabled={!cardNumber || !cardExpiry || !cardCVC}
            >
              Pay with Stripe
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-2">
              <CreditCard size={12} />
              <span>Payments secured by Stripe</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};