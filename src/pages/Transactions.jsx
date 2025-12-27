import { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Eye, Download, Trash2, ChevronLeft, ChevronRight, X, Layers, ChevronDown } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [sortMethod, setSortMethod] = useState(''); // 'Cash', 'Card', 'UPI'

    // Export State
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportStartDate, setExportStartDate] = useState('');
    const [exportEndDate, setExportEndDate] = useState('');

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const { data } = await api.get('/billing');
            // Default sort by date descending (newest first)
            const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setTransactions(sortedData);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to load transaction history');
        }
    };

    const confirmDelete = async () => {
        if (!invoiceToDelete) return;
        try {
            await api.delete(`/billing/${invoiceToDelete}`);
            toast.success('Invoice deleted successfully');
            fetchTransactions();
            setShowDeleteModal(false);
            setInvoiceToDelete(null);
        } catch (error) {
            console.error('Error deleting invoice:', error);
            toast.error('Failed to delete invoice');
        }
    };

    const handleDeleteClick = (id) => {
        setInvoiceToDelete(id);
        setShowDeleteModal(true);
    };

    const handleExport = () => {
        if (!exportStartDate || !exportEndDate) {
            toast.error('Please select both start and end dates');
            return;
        }

        const start = new Date(exportStartDate);
        const end = new Date(exportEndDate);
        end.setHours(23, 59, 59, 999); // Include the entire end day

        const exportData = transactions.filter(t => {
            const date = new Date(t.createdAt);
            return date >= start && date <= end;
        });

        if (exportData.length === 0) {
            toast.error('No transactions found for the selected range');
            return;
        }

        const csvContent = [
            ['Invoice No', 'Date', 'Time', 'Customer', 'Payment Mode', 'Total Amount', 'GST Amount', 'Discount', 'Net Amount'],
            ...exportData.map(t => [
                t.invoiceNumber,
                new Date(t.createdAt).toLocaleDateString(),
                new Date(t.createdAt).toLocaleTimeString(),
                t.customerName || 'Walk-in',
                t.paymentMode,
                t.totalAmount,
                t.gstAmount,
                t.discountAmount,
                t.netAmount
            ])
        ].map(e => e.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${exportStartDate}_to_${exportEndDate}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setShowExportModal(false);
        setExportStartDate('');
        setExportEndDate('');
        toast.success(`Exported ${exportData.length} transactions`);
    };

    const generatePrint = (bill) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const storeName = userInfo.supermarketName || 'SUPER_MARKET';
        const storeAddress = userInfo.address || 'South Indian & Chinese\nMain Road, Hyderabad - 500001';
        const storePhone = userInfo.phone || '9876543210';

        const printWindow = window.open('', '_blank');
        const content = `
            <html>
                <head>
                    <title>Receipt - ${bill.invoiceNumber}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
                        body { 
                            font-family: 'Courier Prime', 'Courier New', monospace; 
                            padding: 20px; 
                            color: #000; 
                            max-width: 380px; 
                            margin: 0 auto;
                            font-size: 12px;
                            text-align: center;
                        }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .text-left { text-align: left; }
                        .font-bold { font-weight: bold; }
                        .header { margin-bottom: 10px; }
                        .restaurant-name { font-size: 16px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
                        .divider { border-top: 1px dashed #000; margin: 10px 0; }
                        .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; text-align: left; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        th { text-align: left; border-bottom: 1px dashed #000; padding-bottom: 5px; }
                        td { padding: 5px 0; vertical-align: top; text-align: left; }
                        .col-qty, .col-rate, .col-amt { text-align: right; }
                        .totals { margin-top: 10px; width: 100%; }
                        .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; text-align: left; }
                        .grand-total { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin-top: 5px; font-size: 14px; font-weight: bold; }
                        .footer { margin-top: 20px; text-align: center; font-size: 10px; }
                        @media print {
                            body { margin: 0 auto; padding: 0; }
                            @page { margin: 0; size: auto; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header text-center">
                        <div class="restaurant-name">${storeName}</div>
                        <div style="white-space: pre-line;">${storeAddress}</div>
                        <div>Ph: ${storePhone}</div>
                    </div>
                    
                    <div class="divider"></div>
                    <div class="text-center font-bold">R E C E I P T</div>
                    <div class="divider"></div>

                    <div class="info-row">
                        <span>Bill No: ${bill.invoiceNumber.slice(-4)}</span>
                        <span>Time: ${new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div class="info-row">
                        <span>Date: ${new Date(bill.createdAt).toLocaleDateString()}</span>
                        <span>Type: Dine In</span>
                    </div>

                    <div class="divider"></div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40%">ITEM</th>
                                <th style="width: 15%" class="col-qty">QTY</th>
                                <th style="width: 20%" class="col-rate">RATE</th>
                                <th style="width: 25%" class="col-amt">AMT</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bill.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td class="col-qty">${item.quantity}</td>
                                    <td class="col-rate">${item.price.toFixed(0)}</td>
                                    <td class="col-amt">${item.total.toFixed(0)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="divider"></div>

                    <div class="totals">
                        <div class="total-row">
                            <span>SUBTOTAL</span>
                            <span>${bill.totalAmount.toFixed(2)}</span>
                        </div>
                        <div class="total-row">
                            <span>CGST @2.5%</span>
                            <span>${(bill.gstAmount / 2).toFixed(2)}</span>
                        </div>
                        <div class="total-row">
                            <span>SGST @2.5%</span>
                            <span>${(bill.gstAmount / 2).toFixed(2)}</span>
                        </div>
                        ${bill.discountAmount > 0 ? `
                        <div class="total-row">
                            <span>DISCOUNT</span>
                            <span>-${bill.discountAmount.toFixed(2)}</span>
                        </div>` : ''}
                        
                        <div class="total-row grand-total">
                            <span>TOTAL</span>
                            <span>₹${bill.netAmount.toFixed(2)}</span>
                        </div>
                        
                        <div class="divider"></div>
                        <div class="total-row font-bold">
                            <span>Payment Mode:</span>
                            <span>${bill.paymentMode}</span>
                        </div>
                        <div class="divider"></div>
                    </div>

                    <div class="footer">
                        <div>*** THANK YOU! VISIT AGAIN ***</div>
                        <div style="margin-top: 5px">For feedback: support@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</div>
                    </div>

                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
            (t.customerName && t.customerName.toLowerCase().includes(search.toLowerCase()));

        const matchesDate = selectedDate ? new Date(t.createdAt).toLocaleDateString() === new Date(selectedDate).toLocaleDateString() : true;
        const matchesSort = sortMethod ? t.paymentMode === sortMethod : true;

        return matchesSearch && matchesDate && matchesSort;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedDate, sortMethod]);

    return (
        <div className="h-full flex flex-col space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-10 md:pb-20 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[15px] md:text-[15px] font-black text-[var(--foreground)] tracking-tight uppercase">History</h2>
                    <p className="text-[var(--muted)] mt-1 font-medium text-xs md:text-sm">Review and monitor your store's sales records.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 font-bold">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="flex-1 sm:flex-none px-4 md:px-5 py-2.5 md:py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl md:rounded-2xl hover:bg-[var(--input)] transition-all flex items-center justify-center gap-2 text-[var(--secondary)] shadow-sm active:scale-95 text-xs md:text-sm"
                    >
                        <Download size={16} className='rotate-180' />
                        Export
                    </button>
                    <div className="relative group flex-1 min-w-[120px] md:min-w-0 md:w-48">
                        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 md:pl-12 pr-4 md:pr-6 py-2.5 md:py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-xs md:text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 overflow-x-auto pb-2 custom-scrollbar">
                <div className="flex-1 min-w-[150px]">
                    <input
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl md:rounded-2xl py-2.5 md:py-3 px-4 md:px-5 text-xs md:text-sm font-bold text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
                <div className="flex-1 min-w-[150px] relative">
                    <select
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl md:rounded-2xl py-2.5 md:py-3 px-4 md:px-5 text-xs md:text-sm font-bold text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                        value={sortMethod}
                        onChange={(e) => setSortMethod(e.target.value)}
                    >
                        <option value="">All Payments</option>
                        <option value="Cash">Cash Only</option>
                        <option value="Card">Card Only</option>
                        <option value="UPI">UPI Only</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" size={16} />
                </div>
                {(search || selectedDate || sortMethod) && (
                    <button
                        onClick={() => { setSearch(''); setSelectedDate(''); setSortMethod(''); }}
                        className="px-4 py-2.5 md:py-3 text-rose-500 font-bold text-xs md:text-sm hover:text-rose-600 transition-all whitespace-nowrap"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Transactions Table */}
            <div className="bg-[var(--card)] rounded-[20px] md:rounded-[32px] border border-[var(--border)] shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 transition-colors duration-300">
                <div className="overflow-x-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse min-w-[750px]">
                        <thead className="sticky top-0 z-10 bg-[var(--input)] border-b border-[var(--border)] shadow-[0_1px_0_0_rgba(0,0,0,0.05)] transition-colors duration-300">
                            <tr className="text-[var(--muted)] text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-colors duration-300">
                                <th className="px-2 md:px-6 py-2 md:py-5">INVOICE NO</th>
                                <th className="px-2 md:px-6 py-2 md:py-5">DATE & TIME</th>
                                <th className="px-2 md:px-6 py-2 md:py-5">CUSTOMER</th>
                                <th className="px-2 md:px-6 py-2 md:py-5">METHOD</th>
                                <th className="px-2 md:px-6 py-2 md:py-5 text-right">AMOUNT</th>
                                <th className="px-2 md:px-6 py-2 md:py-5 text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)] font-medium">
                            {currentItems.map((t) => (
                                <tr key={t._id} className="bg-[var(--card)] hover:bg-[var(--input)]/50 transition-all group">
                                    <td className="px-2 md:px-6 py-2.5 md:py-6 font-black text-primary text-[11px] md:text-sm hover:underline cursor-pointer" onClick={() => setSelectedBill(t)}>
                                        {t.invoiceNumber}
                                    </td>
                                    <td className="px-2 md:px-6 py-2.5 md:py-6">
                                        <div className="font-black text-[var(--foreground)] text-[11px] md:text-sm">{new Date(t.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                        <div className="text-[8px] md:text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mt-0.5">{new Date(t.createdAt).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="px-2 md:px-6 py-2.5 md:py-6">
                                        <div className="font-black text-[var(--secondary)] text-[11px] md:text-sm uppercase truncate max-w-[100px] md:max-w-none">{t.customerName || 'Walk-in Customer'}</div>
                                        <div className="text-[8px] md:text-[10px] font-bold text-[var(--muted)] mt-0.5 uppercase">Counter Sale</div>
                                    </td>
                                    <td className="px-2 md:px-6 py-2.5 md:py-6">
                                        <span className={`px-1.5 md:px-3 py-0.5 md:py-1.5 rounded-md md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-wider border shadow-sm ${t.paymentMode === 'Cash' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            t.paymentMode === 'UPI' ? 'bg-sky-500/10 text-sky-600 border-sky-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                            }`}>
                                            {t.paymentMode}
                                        </span>
                                    </td>
                                    <td className="px-2 md:px-6 py-2.5 md:py-6 text-right font-black text-[var(--foreground)] text-sm md:text-lg">₹{t.netAmount.toFixed(2)}</td>
                                    <td className="px-2 md:px-6 py-2.5 md:py-6">
                                        <div className="flex items-center justify-center gap-1.5 md:gap-3">
                                            <button
                                                onClick={() => setSelectedBill(t)}
                                                className="p-1.5 md:p-3 hover:bg-primary/10 text-primary rounded-lg md:rounded-2xl transition-all shadow-sm border border-transparent hover:border-primary/20"
                                                title="View Details"
                                            >
                                                <Eye size={14} md:size={18} />
                                            </button>
                                            <button
                                                onClick={() => generatePrint(t)}
                                                className="p-1.5 md:p-3 hover:bg-emerald-500/10 text-emerald-600 rounded-lg md:rounded-2xl transition-all shadow-sm border border-transparent hover:border-emerald-500/20"
                                                title="Download Receipt"
                                            >
                                                <Download size={14} md:size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(t._id)}
                                                className="p-1.5 md:p-3 hover:bg-rose-500/10 text-rose-500 rounded-lg md:rounded-2xl transition-all shadow-sm border border-transparent hover:border-rose-500/20"
                                                title="Delete Invoice"
                                            >
                                                <Trash2 size={14} md:size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTransactions.length === 0 && (
                        <div className="py-24 text-center text-slate-400 font-black uppercase tracking-widest text-xs opacity-50">
                            No transactions found in history.
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            {
                totalPages > 1 && (
                    <div className="flex items-center justify-between p-2">
                        <div className="text-[var(--secondary)] font-bold text-sm pl-2 uppercase tracking-widest text-[10px]">
                            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:bg-[var(--input)] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[var(--secondary)]"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center gap-2 px-2">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => paginate(i + 1)}
                                        className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${currentPage === i + 1
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                            : 'bg-[var(--card)] border border-[var(--border)] text-[var(--secondary)] hover:bg-[var(--input)]'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:bg-[var(--input)] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[var(--secondary)]"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Bill View Modal */}
            {
                selectedBill && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-[var(--card)] w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-[var(--border)] transition-colors duration-300">
                            {/* Modal Header */}
                            <div className="px-10 pt-10 pb-6 flex items-start justify-between relative">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                                        <Eye size={22} />
                                    </div>
                                    <div className="pt-1">
                                        <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight uppercase leading-none">
                                            Invoice Details
                                        </h3>
                                        <p className="text-[11px] font-black text-[var(--muted)] mt-2 uppercase tracking-widest leading-none">
                                            {selectedBill.invoiceNumber}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 bg-[var(--input)] text-[var(--muted)] rounded-full border border-[var(--border)] hover:bg-[var(--card)] transition-all">
                                        <Layers size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="px-10 pb-6 space-y-10 max-h-[70vh] overflow-y-auto no-scrollbar">
                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-y-8 gap-x-12 pt-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.15em] opacity-80">Customer</label>
                                        <div className="font-black text-[var(--foreground)] text-lg leading-tight">{selectedBill.customerName || 'Walk-in'}</div>
                                    </div>
                                    <div className="space-y-1.5 text-right">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.15em] opacity-80">Transaction Date</label>
                                        <div className="font-black text-[var(--foreground)] text-sm leading-tight">
                                            {new Date(selectedBill.createdAt).toLocaleString(undefined, {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit', second: '2-digit',
                                                hour12: false
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.15em] opacity-80">Payment Method</label>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                            <span className="font-black text-[var(--foreground)] uppercase text-[13px] tracking-widest">{selectedBill.paymentMode}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 text-right">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.15em] opacity-80">Status</label>
                                        <div>
                                            <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 leading-none">
                                                Completed
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="w-full border-t border-[var(--border)] relative">
                                        <span className="absolute left-0 -top-2 px-0 bg-[var(--card)] text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Purchased Items</span>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        {selectedBill.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-5 bg-[var(--input)]/40 rounded-[24px] border border-[var(--border)] hover:bg-[var(--input)] transition-all duration-300">
                                                <div className="space-y-1">
                                                    <div className="font-black text-[var(--foreground)] text-[15px] tracking-tight">{item.name}</div>
                                                    <div className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest opacity-80">
                                                        ₹{item.price.toFixed(2)} × {item.quantity} units
                                                    </div>
                                                </div>
                                                <div className="font-black text-[var(--foreground)] text-lg">₹{item.total.toFixed(2)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary Box */}
                                <div className="bg-[var(--input)] rounded-[32px] p-8 space-y-5 border-2 border-[var(--border)] shadow-sm">
                                    <div className="flex justify-between items-center text-[var(--muted)] text-[10px] font-black uppercase tracking-[0.2em]">
                                        <span>Base Summary</span>
                                        <span className="text-[var(--foreground)]">₹{selectedBill.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[var(--muted)] text-[10px] font-black uppercase tracking-[0.2em] pb-5 border-b border-[var(--border)]">
                                        <span>Taxes & Discounts</span>
                                        <span className="text-[var(--foreground)]">+ ₹{selectedBill.gstAmount.toFixed(2)} / - ₹{selectedBill.discountAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--secondary)]">Final Payable</span>
                                        <div className="text-4xl font-black text-primary tracking-tighter flex items-start">
                                            <span className="text-xl mt-1.5 mr-1 text-primary/40">₹</span>
                                            {selectedBill.netAmount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-10 pb-10 pt-2 flex gap-4">
                                <button
                                    onClick={() => setSelectedBill(null)}
                                    className="flex-1 py-5 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] font-black rounded-2xl hover:bg-[var(--input)] transition-all uppercase tracking-widest text-xs shadow-sm active:scale-95"
                                >
                                    Close Summary
                                </button>
                                <button
                                    onClick={() => {
                                        generatePrint(selectedBill);
                                    }}
                                    className="flex-1 py-5 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/30 active:scale-95"
                                >
                                    <Download size={18} />
                                    Print Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Export Modal */}
            {
                showExportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-[var(--card)] w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-[var(--border)] transition-colors duration-300">
                            <div className="px-8 py-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--input)]/50">
                                <div>
                                    <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight flex items-center gap-2 uppercase">
                                        <span className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl"><Download size={20} /></span>
                                        Export CSV
                                    </h3>
                                </div>
                                <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-[var(--input)] rounded-xl transition-all text-[var(--muted)]"><X size={24} /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[var(--muted)] uppercase tracking-widest ml-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={exportStartDate}
                                            onChange={(e) => setExportStartDate(e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-[var(--foreground)]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[var(--muted)] uppercase tracking-widest ml-1">End Date</label>
                                        <input
                                            type="date"
                                            value={exportEndDate}
                                            onChange={(e) => setExportEndDate(e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-[var(--foreground)]"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleExport}
                                    className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <Download size={20} />
                                    Download Report
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Invoice"
                message="Are you sure you want to delete this invoice? This action cannot be undone and will remove it from sales records."
                confirmText="Delete Invoice"
                isDangerous={true}
            />
        </div >
    );
};

export default Transactions;
