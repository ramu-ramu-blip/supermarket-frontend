import { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Eye, Download, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;
        try {
            await api.delete(`/billing/${id}`);
            toast.success('Invoice deleted successfully');
            fetchTransactions();
        } catch (error) {
            console.error('Error deleting invoice:', error);
            toast.error('Failed to delete invoice');
        }
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
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">History</h2>
                    <p className="text-slate-500 mt-1 font-medium">Review and monitor your store's sales records.</p>
                </div>
                <div className="flex items-center gap-3 font-bold">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="px-5 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2 text-slate-600 shadow-sm active:scale-95"
                    >
                        <Download size={18} />
                        Export
                    </button>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-48 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
                        <input
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className={`pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm cursor-pointer ${!selectedDate ? 'text-transparent' : 'text-slate-600'}`}
                        />
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        {!selectedDate && (
                            <span className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm pointer-events-none">
                                Filter Date
                            </span>
                        )}
                    </div>

                    <div className="relative group">
                        <select
                            value={sortMethod}
                            onChange={(e) => setSortMethod(e.target.value)}
                            className="pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm text-slate-600 appearance-none cursor-pointer"
                        >
                            <option value="">All Methods</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                        </select>
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>

                    {(search || selectedDate || sortMethod) && (
                        <button
                            onClick={() => { setSearch(''); setSelectedDate(''); setSortMethod(''); }}
                            className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all"
                            title="Clear Filters"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div className="glass-card overflow-hidden bg-white shadow-xl border-slate-200">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-5">Invoice Details</th>
                            <th className="px-6 py-5">Timestamp</th>
                            <th className="px-6 py-5">Customer Profile</th>
                            <th className="px-6 py-5">Method</th>
                            <th className="px-6 py-5 text-right">Net Amount</th>
                            <th className="px-6 py-5 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                        {currentItems.map((t) => (
                            <tr key={t._id} className="hover:bg-slate-50/50 transition-all group">
                                <td className="px-6 py-6 font-black text-primary text-sm hover:underline cursor-pointer" onClick={() => setSelectedBill(t)}>
                                    {t.invoiceNumber}
                                </td>
                                <td className="px-6 py-6">
                                    <div className="font-black text-slate-900 text-sm">{new Date(t.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{new Date(t.createdAt).toLocaleTimeString()}</div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="font-black text-slate-800 text-sm uppercase">{t.customerName || 'Walk-in Customer'}</div>
                                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Counter Sale</div>
                                </td>
                                <td className="px-6 py-6">
                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${t.paymentMode === 'Cash' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        t.paymentMode === 'UPI' ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                        }`}>
                                        {t.paymentMode}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-right font-black text-slate-900 text-lg">₹{t.netAmount.toFixed(2)}</td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => setSelectedBill(t)}
                                            className="p-3 hover:bg-primary/10 text-primary rounded-2xl transition-all shadow-sm hover:shadow-primary/10 border border-transparent hover:border-primary/20"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => generatePrint(t)}
                                            className="p-3 hover:bg-emerald-50 text-emerald-600 rounded-2xl transition-all shadow-sm hover:shadow-emerald-100 border border-transparent hover:border-emerald-200"
                                            title="Download Receipt"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(t._id)}
                                            className="p-3 hover:bg-rose-50 text-rose-500 rounded-2xl transition-all shadow-sm hover:shadow-rose-100 border border-transparent hover:border-rose-200"
                                            title="Delete Invoice"
                                        >
                                            <Trash2 size={18} />
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between p-2">
                    <div className="text-slate-500 font-bold text-sm pl-2">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Bill View Modal */}
            {selectedBill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                                    <span className="p-2 bg-primary/10 text-primary rounded-xl"><Eye size={20} /></span>
                                    Invoice Details
                                </h3>
                                <p className="text-xs font-black text-slate-400 mt-1 uppercase tracking-widest leading-none">{selectedBill.invoiceNumber}</p>
                            </div>
                            <button onClick={() => setSelectedBill(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400"><Eye className="rotate-45" size={24} /></button>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8 pb-8 border-b border-dashed border-slate-200">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</label>
                                        <div className="font-black text-slate-900 text-lg">{selectedBill.customerName || 'Walk-in'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</label>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            <span className="font-black text-slate-700 uppercase text-sm tracking-widest">{selectedBill.paymentMode}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 text-right">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</label>
                                        <div className="font-black text-slate-900 text-sm">{new Date(selectedBill.createdAt).toLocaleString()}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                                        <div className="text-emerald-600 font-black text-[10px] uppercase tracking-widest px-2 py-1 bg-emerald-50 rounded-lg inline-block border border-emerald-100 leading-none">Completed</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchased Items</label>
                                <div className="space-y-3">
                                    {selectedBill.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div>
                                                <div className="font-black text-slate-900 text-sm tracking-tight">{item.name}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">₹{item.price.toFixed(2)} × {item.quantity} units</div>
                                            </div>
                                            <div className="font-black text-slate-900">₹{item.total.toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-4 shadow-xl shadow-slate-900/20">
                                <div className="flex justify-between text-white/50 text-[10px] font-black uppercase tracking-widest">
                                    <span>Base Summary</span>
                                    <span>₹{selectedBill.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white/50 text-[10px] font-black uppercase tracking-widest pb-4 border-b border-white/10">
                                    <span>Taxes & Discounts</span>
                                    <span>+ ₹{selectedBill.gstAmount.toFixed(2)} / - ₹{selectedBill.discountAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-end pt-2">
                                    <span className="text-sm font-black uppercase tracking-tighter opacity-80">Final Payable</span>
                                    <span className="text-3xl font-black text-primary-foreground tracking-tighter">₹{selectedBill.netAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 flex gap-4">
                            <button onClick={() => setSelectedBill(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-xs active:scale-95">Close Summary</button>
                            <button onClick={() => generatePrint(selectedBill)} className="flex-1 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-95">
                                <Download size={16} />
                                Print Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                                    <span className="p-2 bg-emerald-100/50 text-emerald-600 rounded-xl"><Download size={20} /></span>
                                    Export CSV
                                </h3>
                            </div>
                            <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400"><X size={24} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={exportStartDate}
                                        onChange={(e) => setExportStartDate(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                                    <input
                                        type="date"
                                        value={exportEndDate}
                                        onChange={(e) => setExportEndDate(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700"
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
            )}
        </div>
    );
};

export default Transactions;
