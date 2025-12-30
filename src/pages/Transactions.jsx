import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Eye, Download, Trash2, ChevronLeft, ChevronRight, X, Layers, ChevronDown, Printer } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import useDebounce from '../hooks/useDebounce';
import ExcelJS from 'exceljs';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [selectedBill, setSelectedBill] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
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
        fetchTransactions(debouncedSearch);
    }, [debouncedSearch]);

    const fetchTransactions = async (query = '') => {
        try {
            const { data } = await api.get(`/billing${query ? `?search=${query}` : ''}`);
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

    const handleExport = async () => {
        if (!exportStartDate || !exportEndDate) {
            toast.error('Please select both start and end dates');
            return;
        }

        const start = new Date(exportStartDate + 'T00:00:00');
        const end = new Date(exportEndDate + 'T23:59:59');

        const exportData = transactions.filter(t => {
            const date = new Date(t.createdAt);
            return date >= start && date <= end;
        });

        if (exportData.length === 0) {
            toast.error('No transactions found for the selected range');
            return;
        }

        const toastId = toast.loading('Generating Excel report...');

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sales Report');
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

            // 1. Add Store Header
            worksheet.mergeCells('A1:I1');
            const storeTitle = worksheet.getCell('A1');
            storeTitle.value = (userInfo.supermarketName || 'SHREE SUPERMARKET').toUpperCase();
            storeTitle.font = { name: 'Arial Black', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
            storeTitle.alignment = { horizontal: 'center', vertical: 'middle' };
            storeTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

            worksheet.mergeCells('A2:I2');
            const subTitle = worksheet.getCell('A2');
            subTitle.value = `SALES REPORT: ${exportStartDate} TO ${exportEndDate}`;
            subTitle.font = { name: 'Arial', size: 12, bold: true };
            subTitle.alignment = { horizontal: 'center' };

            // 2. Define Columns
            worksheet.columns = [
                { header: 'INVOICE NO', key: 'invoice', width: 20 },
                { header: 'DATE', key: 'date', width: 15 },
                { header: 'TIME', key: 'time', width: 12 },
                { header: 'CUSTOMER', key: 'customer', width: 25 },
                { header: 'PAYMENT', key: 'payment', width: 15 },
                { header: 'GROSS TOTAL', key: 'gross', width: 15 },
                { header: 'GST (5%)', key: 'gst', width: 12 },
                { header: 'DISCOUNT', key: 'discount', width: 12 },
                { header: 'NET AMOUNT', key: 'net', width: 18 }
            ];

            // 3. Style Header Row (Row 3 is columns, but we have title on 1 & 2)
            const headerRow = worksheet.getRow(3);
            headerRow.values = worksheet.columns.map(col => col.header);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.alignment = { horizontal: 'center' };
            headerRow.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }; // Indigo-600
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'medium' },
                    right: { style: 'thin' }
                };
            });

            // 4. Add Data
            exportData.forEach((t, index) => {
                const row = worksheet.addRow({
                    invoice: t.invoiceNumber,
                    date: new Date(t.createdAt).toLocaleDateString(),
                    time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    customer: (t.customerName || 'Cash Sale').toUpperCase(),
                    payment: t.paymentMode.toUpperCase(),
                    gross: t.totalAmount,
                    gst: t.gstAmount,
                    discount: t.discountAmount,
                    net: t.netAmount
                });

                // Alternating row background
                if (index % 2 === 0) {
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                }

                // Center align specific columns
                ['date', 'time', 'payment'].forEach(key => {
                    row.getCell(key).alignment = { horizontal: 'center' };
                });

                // Currency columns
                ['gross', 'gst', 'discount', 'net'].forEach(key => {
                    row.getCell(key).numFmt = '₹#,##0.00';
                    row.getCell(key).alignment = { horizontal: 'right' };
                });
            });

            // 5. Grand Totals
            const totalNet = exportData.reduce((sum, t) => sum + t.netAmount, 0);
            const footerRow = worksheet.addRow(['', '', '', '', 'TOTAL', '', '', '', totalNet]);
            footerRow.font = { bold: true, size: 12 };
            worksheet.getCell(`I${footerRow.number}`).numFmt = '₹#,##0.00';
            worksheet.getCell(`E${footerRow.number}`).alignment = { horizontal: 'right' };
            footerRow.eachCell((cell, colNum) => {
                if (colNum >= 5) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
                }
            });

            // 6. Finalization & Download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Sales_Report_${exportStartDate}_to_${exportEndDate}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);

            setShowExportModal(false);
            setExportStartDate('');
            setExportEndDate('');
            toast.success(`Successfully exported ${exportData.length} records`, { id: toastId });
        } catch (error) {
            console.error('Excel Export failed:', error);
            toast.error('Failed to generate Excel report', { id: toastId });
        }
    };

    const generatePrint = (bill) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const storeName = userInfo.supermarketName || 'SHREE SUPERMARKET';
        const storeAddress = userInfo.address || 'H.No 1-2-3, Main Road, Opp. HDFC Bank, Hyderabad - 500001';
        const storePhone = userInfo.phone || '9123456789';
        const storeGST = userInfo.gstin || '36AAAAA0000A1Z5';

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Pop-up blocked! Please allow pop-ups to print the receipt.');
            return;
        }

        const content = `
            <html>
                <head>
                    <title>Invoice - ${bill.invoiceNumber}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
                        
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        
                        body { 
                            font-family: 'Space Mono', monospace; 
                            background: #f0f0f0;
                            padding: 40px 20px;
                            color: #000;
                            display: flex;
                            justify-content: center;
                        }
                        
                        .invoice-card {
                            background: #fff;
                            width: 100%;
                            max-width: 800px;
                            padding: 40px;
                            border: 2px solid #000;
                            position: relative;
                            display: flex;
                            flex-direction: column;
                        }
                        
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .text-left { text-align: left; }
                        .font-bold { font-weight: 700; }
                        .uppercase { text-transform: uppercase; }
                        
                        .header-section { margin-bottom: 20px; }
                        .store-name { font-size: 24px; font-weight: 700; margin-bottom: 6px; letter-spacing: 2px; }
                        .store-info { font-size: 11px; margin-bottom: 3px; opacity: 0.8; }
                        
                        .invoice-title { 
                            font-size: 18px; 
                            font-weight: 700; 
                            padding: 10px 0;
                            border-top: 2px solid #000;
                            border-bottom: 2px solid #000;
                            margin: 15px 0;
                            letter-spacing: 4px;
                        }
                        
                        .details-grid { 
                            display: grid; 
                            grid-template-cols: 1fr 1.5fr; 
                            gap: 30px; 
                            margin: 20px 0; 
                        }
                        
                        .detail-box {
                            padding: 15px;
                            border: 1px solid #eee;
                            border-radius: 4px;
                        }
                        
                        .label { font-size: 9px; color: #666; font-weight: 700; margin-bottom: 3px; letter-spacing: 1px; }
                        .value { font-size: 12px; font-weight: 700; }
                        
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-top: 30px;
                            flex-grow: 1;
                        }
                        
                        th { 
                            text-align: left; 
                            border-bottom: 2px solid #000; 
                            padding: 12px 10px; 
                            font-size: 14px; 
                            letter-spacing: 1px;
                        }
                        
                        td { 
                            padding: 10px 10px; 
                            border-bottom: 1px solid #f0f0f0;
                            vertical-align: middle;
                        }
                        
                        .item-name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
                        .item-price { font-size: 12px; color: #555; }
                        
                        .summary-section {
                            margin-top: 20px;
                            border-top: 2px solid #000;
                            padding-top: 10px;
                        }
                        
                        .summary-row {
                            display: flex;
                            justify-content: flex-end;
                            margin-bottom: 10px;
                        }
                        
                        .summary-label { width: 200px; font-size: 13px; }
                        .summary-value { width: 150px; text-align: right; font-weight: 700; font-size: 14px; }
                        
                        .grand-total-row {
                            display: flex;
                            justify-content: flex-end;
                            margin-top: 15px;
                            padding-top: 15px;
                            border-top: 1px dashed #000;
                        }
                        
                        .total-label { font-size: 20px; font-weight: 700; letter-spacing: 1px; }
                        .total-value { font-size: 24px; font-weight: 700; text-align: right; width: 200px; }
                        
                        .payment-info {
                            margin-top: 30px;
                            padding: 15px;
                            background: #f9f9f9;
                            border-left: 5px solid #000;
                        }
                        
                        .footer { 
                            margin-top: 50px; 
                            text-align: center;
                            padding-top: 20px;
                            border-top: 1px solid #eee;
                        }
                        
                        .thanks { font-size: 15px; font-weight: 700; margin-bottom: 5px; letter-spacing: 1px; }
                        .terms { font-size: 10px; color: #777; font-style: italic; }
                        .footer { 
                            margin-top: 20px; 
                            text-align: center;
                            padding-top: 10px;
                            border-top: 1px solid #eee;
                            break-inside: avoid;
                        }
                        
                        @media print {
                            body { background: #fff; padding: 0; margin: 0; font-size: 12px; }
                            .invoice-card { 
                                border: 1px solid #000 !important; 
                                max-width: none; 
                                height: auto !important;
                                min-height: auto !important;
                                padding: 15px 30px;
                                margin: 0;
                            }
                            .header-section { margin-bottom: 15px; }
                            .invoice-title { margin: 10px 0; padding: 8px 0; }
                            table { margin-top: 15px; }
                            .summary-section { margin-top: 15px; }
                            .payment-info { margin-top: 15px; }
                            .footer { margin-top: 15px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="invoice-card">
                        <div class="header-section text-center">
                            <div class="store-name uppercase">${storeName}</div>
                            <div class="store-info uppercase">${storeAddress}</div>
                            <div class="store-info">PH: ${storePhone} | GSTIN: ${storeGST}</div>
                        </div>
                        
                        <div class="invoice-title text-center uppercase">Tax Invoice</div>

                        <div class="details-grid">
                            <div class="detail-box">
                                <div class="label">INVOICE DETAILS</div>
                                <div class="value">NO: #${bill.invoiceNumber.split('-').pop()}</div>
                                <div class="value">DATE: ${new Date(bill.createdAt).toLocaleDateString()}</div>
                                <div class="value">TIME: ${new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            <div class="detail-box">
                                <div class="label">BILL TO</div>
                                <div class="value">NAME: ${(bill.customerName || 'CASH SALE').toUpperCase()}</div>
                                <div class="value">MOB: ${bill.customerPhone || 'N/A'}</div>
                                <div class="value">STAFF: ${(userInfo.name || 'ADMIN').toUpperCase()}</div>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 50%">DESCRIPTION</th>
                                    <th style="width: 15%" class="text-center">QTY</th>
                                    <th style="width: 15%" class="text-center">PRICE</th>
                                    <th style="width: 20%" class="text-right">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bill.items.map(item => `
                                    <tr>
                                        <td>
                                            <div class="item-name">${item.name.toUpperCase()}</div>
                                            <div class="item-price">UNIT PRICE: ₹${item.price.toFixed(2)}</div>
                                        </td>
                                        <td class="text-center font-bold">${item.quantity}</td>
                                        <td class="text-center">₹${item.price.toFixed(2)}</td>
                                        <td class="text-right font-bold">₹${item.total.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <div class="summary-section">
                            <div class="summary-row">
                                <div class="summary-label font-bold">SUB TOTAL</div>
                                <div class="summary-value">₹${bill.totalAmount.toFixed(2)}</div>
                            </div>
                            <div class="summary-row">
                                <div class="summary-label font-bold">GST (5.0%)</div>
                                <div class="summary-value">₹${bill.gstAmount.toFixed(2)}</div>
                            </div>
                            ${bill.discountAmount > 0 ? `
                            <div class="summary-row" style="color: #d32f2f;">
                                <div class="summary-label font-bold">DISCOUNT (-)</div>
                                <div class="summary-value">₹${bill.discountAmount.toFixed(2)}</div>
                            </div>` : ''}
                            
                            <div class="grand-total-row">
                                <span class="total-label">NET PAYABLE</span>
                                <span class="total-value">₹${bill.netAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div class="payment-info">
                            <div class="label">PAYMENT STATUS</div>
                            <div class="value uppercase">METHOD: ${bill.paymentMode}</div>
                            <div class="value uppercase">STATUS: PAID</div>
                        </div>

                        <div class="footer">
                            <div class="thanks uppercase">Thank You! Visit Again</div>
                            <div class="terms uppercase">Items once sold cannot be returned</div>
                            <div class="terms" style="margin-top: 10px; font-size: 8px; opacity: 0.5;">POWERED BY SUPERMARKET POS</div>
                        </div>
                    </div>

                    <script>
                        window.onload = function() { 
                            window.print(); 
                            window.onafterprint = function() { window.close(); };
                            setTimeout(() => { window.close(); }, 2000);
                        }
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

        const transactionDate = new Date(t.createdAt);
        transactionDate.setHours(0, 0, 0, 0);

        let matchesDate = true;
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            matchesDate = matchesDate && transactionDate >= start;
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(0, 0, 0, 0);
            matchesDate = matchesDate && transactionDate <= end;
        }

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
    }, [search, startDate, endDate, sortMethod]);

    return (
        <div className="h-full flex flex-col space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-10 md:pb-20 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[15px] md:text-[15px] font-black text-(--foreground) tracking-tight uppercase">History</h2>
                    <p className="text-(--muted) mt-1 font-medium text-xs md:text-sm">Review and monitor your store's sales records.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 font-bold">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="flex-1 sm:flex-none px-4 md:px-5 py-2.5 md:py-3 bg-(--card) border border-(--border) rounded-xl md:rounded-2xl hover:bg-(--input) transition-all flex items-center justify-center gap-2 text-(--foreground) shadow-sm active:scale-95 text-xs md:text-sm"
                    >
                        <Download size={16} className='rotate-180' />
                        Export
                    </button>
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted) group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by invoice or customer..."
                            className="w-full bg-(--card) border border-(--border)/30 rounded-2xl pl-12 pr-12 py-3 text-sm font-bold text-(--foreground) placeholder:text-(--muted)/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button 
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-(--input) rounded-full text-(--muted) transition-all"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 overflow-x-auto pb-2 custom-scrollbar">
                <div className="flex-1 min-w-[300px] flex items-center gap-2">
                    <div className="flex-1">
                        <label className="text-[9px] font-black text-(--muted) uppercase tracking-widest ml-1 mb-1 block">From</label>
                        <input
                            type="date"
                            max={endDate || new Date().toISOString().split('T')[0]}
                            className="w-full bg-(--card) border border-(--border) rounded-xl md:rounded-2xl py-2.5 md:py-3 px-4 md:px-5 text-xs md:text-sm font-bold text-(--foreground) focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[9px] font-black text-(--muted) uppercase tracking-widest ml-1 mb-1 block">To</label>
                        <input
                            type="date"
                            min={startDate}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full bg-(--card) border border-(--border) rounded-xl md:rounded-2xl py-2.5 md:py-3 px-4 md:px-5 text-xs md:text-sm font-bold text-(--foreground) focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="text-[9px] font-black text-(--muted) uppercase tracking-widest ml-1 mb-1 block">Method</label>
                    <div className="relative">
                        <select
                            className="w-full bg-(--card) border border-(--border) rounded-xl md:rounded-2xl py-2.5 md:py-3 px-4 md:px-5 text-xs md:text-sm font-bold text-(--foreground) focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                            value={sortMethod}
                            onChange={(e) => setSortMethod(e.target.value)}
                        >
                            <option value="">All Payments</option>
                            <option value="Cash">Cash Only</option>
                            <option value="Card">Card Only</option>
                            <option value="UPI">UPI Only</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-(--muted) pointer-events-none" size={16} />
                    </div>
                </div>
                {(search || startDate || endDate || sortMethod) && (
                    <div className="flex items-end mb-1">
                        <button
                            onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); setSortMethod(''); }}
                            className="px-4 py-2.5 md:py-3 text-rose-500 font-bold text-xs md:text-sm hover:text-rose-600 transition-all whitespace-nowrap"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>



            {/* Transactions Table */}
            <div className="bg-(--card) rounded-[8px] border border-(--border) shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 transition-colors duration-300">
                <div className="overflow-x-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse min-w-[750px]">
                        <thead className="sticky top-0 z-10 bg-(--input) border-b border-(--border) shadow-[0_1px_0_0_rgba(0,0,0,0.05) transition-colors duration-300">
                            <tr className="text-(--muted) text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-colors duration-300">
                                <th className="px-2 md:px-6 py-2 md:py-2">INVOICE NO</th>
                                <th className="px-2 md:px-6 py-2 md:py-2">DATE & TIME</th>
                                <th className="px-2 md:px-6 py-2 md:py-2">CUSTOMER</th>
                                <th className="px-2 md:px-6 py-2 md:py-2">METHOD</th>
                                <th className="px-2 md:px-6 py-2 md:py-2 text-right">AMOUNT</th>
                                <th className="px-2 md:px-6 py-2 md:py-2 text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--border) font-medium">
                            {currentItems.map((t) => (
                                <tr key={t._id} className="bg-(--card) hover:bg-(--input)/50 transition-all group">
                                    <td className="px-2 md:px-6 py-2 md:py-2 font-black  text-[10px] md:text-sm hover:underline cursor-pointer" onClick={() => setSelectedBill(t)}>
                                        {t.invoiceNumber}
                                    </td>
                                    <td className="px-2 md:px-6 py-2 md:py-2">
                                        <div className="font-black text-(--foreground) text-[10px] md:text-[12px]">{new Date(t.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                        <div className="text-[8px] md:text-[10px] font-black text-(--muted) uppercase tracking-widest mt-0.5">{new Date(t.createdAt).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="px-2 md:px-6 py-2 md:py-2">
                                        <div className="font-black text-(--foreground) text-[10px] md:text-[12px] uppercase truncate max-w-[100px] md:max-w-none">{t.customerName || 'Walk-in Customer'}</div>

                                    </td>
                                    <td className="px-2 md:px-6 py-2 md:py-2">
                                        <span className={`px-1.5 md:px-3 py-0.5 md:py-1.5 rounded-md md:rounded-xl text-[10px] md:text-[10px] font-black uppercase tracking-wider border shadow-sm ${t.paymentMode === 'Cash' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            t.paymentMode === 'UPI' ? 'bg-sky-500/10 text-sky-600 border-sky-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                            }`}>
                                            {t.paymentMode}
                                        </span>
                                    </td>
                                    <td className="px-2 md:px-6 py-2 md:py-2 text-right font-black text-(--foreground) text-sm md:text-[12px]">₹{t.netAmount.toFixed(2)}</td>
                                    <td className="px-2 md:px-6 py-2 md:py-2">
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
                                                title="Print Receipt"
                                            >
                                                <Printer size={14} md:size={18} />
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
                        <div className="text-(--secondary) font-bold text-sm pl-2 uppercase tracking-widest text-[10px]">
                            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                className="p-3 bg-(--card) border border-(--border) rounded-xl hover:bg-(--input) disabled:opacity-50 disabled:cursor-not-allowed transition-all text-(--foreground)"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center gap-2 px-2">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => paginate(i + 1)}
                                        className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${currentPage === i + 1
                                            ? 'bg-primary text-(--primary-foreground) shadow-lg shadow-primary/30'
                                            : 'bg-(--card) border border-(--border) text-(--foreground) hover:bg-(--input)'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                disabled={currentPage === totalPages}
                                className="p-3 bg-(--card) border border-(--border) rounded-xl hover:bg-(--input) disabled:opacity-50 disabled:cursor-not-allowed transition-all text-(--foreground)"
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
                        <div className="bg-(--card) w-full max-w-4xl rounded-[8px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-(--border) transition-colors duration-300">
                            {/* Modal Header */}
                            <div className="px-10 pt-10 pb-6 flex items-start justify-between relative">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                                        <Eye size={22} />
                                    </div>
                                    <div className="pt-1">
                                        <h3 className="text-xl font-black text-(--foreground) tracking-tight uppercase leading-none">
                                            Invoice Details
                                        </h3>
                                        <p className="text-[11px] font-black text-(--muted) mt-2 uppercase tracking-widest leading-none">
                                            {selectedBill.invoiceNumber}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 bg-(--input) text-(--muted) rounded-full border border-(--border) hover:bg-(--card) transition-all">
                                        <Layers size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="px-10 pb-6 space-y-10 max-h-[70vh] overflow-y-auto no-scrollbar">
                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-y-8 gap-x-12 pt-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-(--muted) uppercase tracking-[0.15em]">Customer</label>
                                        <div className="font-black text-(--foreground) text-lg leading-tight">{selectedBill.customerName || 'Walk-in'}</div>
                                        <div className="text-[11px] font-black text-(--muted) tracking-wider mt-1">{selectedBill.customerPhone}</div>
                                    </div>
                                    <div className="space-y-1.5 text-right">
                                        <label className="text-[10px] font-black text-(--muted) uppercase tracking-[0.15em]">Transaction Date</label>
                                        <div className="font-black text-(--foreground) text-sm leading-tight">
                                            {new Date(selectedBill.createdAt).toLocaleString(undefined, {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit', second: '2-digit',
                                                hour12: false
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-(--muted) uppercase tracking-[0.15em]">Payment Method</label>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)"></div>
                                            <span className="font-black text-(--foreground) uppercase text-[13px] tracking-widest">{selectedBill.paymentMode}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 text-right">
                                        <label className="text-[10px] font-black text-(--muted) uppercase tracking-[0.15em]">Status</label>
                                        <div>
                                            <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 leading-none">
                                                Completed
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="w-full border-t border-(--border) relative">
                                        <span className="absolute left-0 -top-2 px-0 bg-(--card) text-[10px] font-black text-(--muted) uppercase tracking-widest">Purchased Items</span>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        {selectedBill.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-5 bg-(--input)/40 rounded-[24px] border border-(--border) hover:bg-(--input) transition-all duration-300">
                                                <div className="space-y-1">
                                                    <div className="font-black text-(--foreground) text-[15px] tracking-tight">{item.name}</div>
                                                    <div className="text-[11px] font-black text-(--muted) uppercase tracking-widest opacity-80">
                                                        ₹{item.price.toFixed(2)} × {item.quantity} units
                                                    </div>
                                                </div>
                                                <div className="font-black text-(--foreground) text-lg">₹{item.total.toFixed(2)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary Box */}
                                <div className="bg-(--input) rounded-[8px] p-8 space-y-5 border-2 border-(--border) shadow-sm">
                                    <div className="flex justify-between items-center text-(--muted) text-[10px] font-black uppercase tracking-[0.2em]">
                                        <span>Base Summary</span>
                                        <span className="text-(--foreground)">₹{selectedBill.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-(--muted) text-[10px] font-black uppercase tracking-[0.2em] pb-5 border-b border-(--border)">
                                        <span>Taxes & Discounts</span>
                                        <span className="text-(--foreground)">+ ₹{selectedBill.gstAmount.toFixed(2)} / - ₹{selectedBill.discountAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-xs font-black uppercase tracking-[0.1em] text-(--foreground)">Final Payable</span>
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
                                    className="flex-1 py-5 bg-(--card) border border-(--border) text-(--foreground) font-black rounded-2xl hover:bg-(--input) transition-all uppercase tracking-widest text-xs shadow-sm active:scale-95"
                                >
                                    Close Summary
                                </button>
                                <button
                                    onClick={() => {
                                        generatePrint(selectedBill);
                                    }}
                                    className="flex-1 py-5 bg-primary text-(--primary-foreground) font-black rounded-2xl hover:bg-primary/90 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/30 active:scale-95"
                                >
                                    <Printer size={18} />
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
                        <div className="bg-(--card) w-full max-md rounded-[8px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-(--border) transition-colors duration-300">
                            <div className="px-8 py-6 border-b border-(--border) flex items-center justify-between bg-(--input)/50">
                                <div>
                                    <h3 className="text-xl font-black text-(--foreground) tracking-tight flex items-center gap-2 uppercase">
                                        <span className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl"><Download size={20} /></span>
                                        Export CSV
                                    </h3>
                                </div>
                                <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-(--input) rounded-xl transition-all text-(--muted)"><X size={24} /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-(--muted) uppercase tracking-widest ml-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={exportStartDate}
                                            onChange={(e) => setExportStartDate(e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 bg-(--input) border border-(--border) rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-(--foreground)"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-(--muted) uppercase tracking-widest ml-1">End Date</label>
                                        <input
                                            type="date"
                                            value={exportEndDate}
                                            onChange={(e) => setExportEndDate(e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 bg-(--input) border border-(--border) rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-(--foreground)"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleExport}
                                    className="w-full py-4 bg-primary text-(--primary-foreground) font-black rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95"
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
