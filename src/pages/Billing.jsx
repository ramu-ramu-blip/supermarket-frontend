import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Trash2, IndianRupee, Printer, Download, Plus, Minus, ChevronDown } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import useDebounce from '../hooks/useDebounce';

const Billing = () => {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState('');
    const [phone, setPhone] = useState('');
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('Amount'); // 'Amount' or 'Percent'
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchProducts(debouncedSearch);
    }, [debouncedSearch]);

    const fetchProducts = async (query = '') => {
        try {
            const { data } = await api.get(`/products${query ? `?search=${query}` : ''}`);
            setProducts(data);
        } catch (error) {
            toast.error('Failed to load products');
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    const addToCart = (product) => {
        const exists = cart.find(item => item.productId === product._id);
        if (exists) {
            updateQty(product._id, 1);
        } else {
            setCart([...cart, {
                productId: product._id,
                name: product.name,
                price: product.sellingPrice,
                gst: product.gstPercent,
                quantity: 1,
                total: product.sellingPrice
            }]);
        }
        setSearch('');
    };

    const updateQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.productId === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty, total: newQty * item.price };
            }
            return item;
        }));
    };

    const updatePrice = (id, newPrice) => {
        setCart(cart.map(item => {
            if (item.productId === id) {
                const price = Math.max(0, Number(newPrice));
                return { ...item, price: price, total: item.quantity * price };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => setCart(cart.filter(item => item.productId !== id));

    const subTotal = cart.reduce((acc, item) => acc + item.total, 0);
    const totalGst = cart.reduce((acc, item) => acc + (item.total * (item.gst / 100)), 0);
    
    const calculatedDiscount = discountType === 'Percent' 
        ? (subTotal + totalGst) * (Number(discount) / 100) 
        : Number(discount);

    const finalTotal = Math.round(subTotal + totalGst - calculatedDiscount);

    const handleCheckout = async (shouldPrint = false) => {
        if (cart.length === 0) return;

        // Validation for Phone Number
        if (!phone) {
            toast.error('Customer phone number is required');
            return;
        }
        if (!/^\d{10}$/.test(phone)) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        try {
            const billData = {
                customerName: customer,
                customerPhone: phone,
                items: cart,
                totalAmount: subTotal,
                gstAmount: totalGst,
                discountAmount: calculatedDiscount,
                netAmount: finalTotal,
                paymentMode: paymentMode
            };
            const { data } = await api.post('/billing', billData);
            toast.success('Invoice Generated Successfully!');

            if (shouldPrint) {
                generatePrint(data);
            }

            setCart([]);
            setCustomer('');
            setPhone('');
            setDiscount(0);
            setPaymentMode('Cash');
        } catch (error) {
            console.error('Checkout failed:', error);
            toast.error(error.response?.data?.message || 'Checkout failed');
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
                            margin-top: 20px; 
                            text-align: center;
                            padding-top: 10px;
                            border-top: 1px solid #eee;
                            break-inside: avoid;
                        }
                        
                        .thanks { font-size: 15px; font-weight: 700; margin-bottom: 5px; letter-spacing: 1px; }
                        .terms { font-size: 10px; color: #777; font-style: italic; }
                        
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

    return (
        <div className="grid grid-cols-12 gap-4 md:gap-8 flex-1 animate-in fade-in duration-500">
            {/* Search & Results */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 md:gap-6">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted) group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search product by name or barcode..."
                        className="w-full bg-(--card) border border-(--border)/30 rounded-2xl py-4 pl-12 pr-12 text-sm md:text-base font-bold text-(--foreground) placeholder:text-(--muted)/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button 
                            onClick={() => setSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-(--input) rounded-full text-(--muted) hover:text-red-500 transition-all"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                <div className="bg-(--card) rounded-[8px] border border-(--border) shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto custom-scrollbar px-1">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead className="sticky top-0 z-10 bg-(--input) shadow-[0_1px_0_0_rgba(0,0,0,0.05)">
                                <tr className="text-(--muted) text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                                    <th className="px-2 md:px-6 py-2 md:py-4">Product Name</th>
                                    <th className="px-2 md:px-6 py-2 md:py-4 text-center">Category</th>
                                    <th className="px-2 md:px-6 py-2 md:py-4 text-center">Stock</th>
                                    <th className="px-2 md:px-6 py-2 md:py-4 text-right">Price</th>
                                    <th className="px-2 md:px-6 py-2 md:py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--border)">
                                {currentItems.map(p => (
                                    <tr key={p._id} className="bg-(--card) hover:bg-(--input)/50 transition-all group">
                                        <td className="px-2 md:px-6 py-2.5 md:py-3">
                                            <div className="font-black text-(--foreground) text-[11px] md:text-sm truncate max-w-[120px] md:max-w-none">{p.name}</div>
                                            <div className="text-[8px] md:text-[10px] font-bold text-(--muted) uppercase tracking-widest mt-0.5 truncate">{p.brand || '---'}</div>
                                        </td>
                                        <td className="px-2 md:px-6 py-2.5 md:py-3 text-center">
                                            <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-(--input) text-(--foreground) rounded-md md:rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-(--border)">
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="px-2 md:px-6 py-2.5 md:py-3 text-center">
                                            <div className={`font-black text-[11px] md:text-sm ${p.stockQuantity < 10 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                {p.stockQuantity} <span className="text-[8px] md:text-[10px] uppercase opacity-50">{p.unit}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 md:px-6 py-2.5 md:py-3 text-right">
                                            <div className="font-black text-(--foreground) text-[11px] md:text-sm">₹{p.sellingPrice}</div>
                                        </td>
                                        <td className="px-2 md:px-6 py-2.5 md:py-3 text-right">
                                            <button
                                                onClick={() => addToCart(p)}
                                                className="px-2 py-1.5 md:px-4 md:py-2 bg-primary text-(--primary-foreground) font-black rounded-lg md:rounded-xl hover:bg-primary/90 transition-all shadow-sm inline-flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] uppercase tracking-widest active:scale-95 whitespace-nowrap"
                                            >
                                                <Plus size={12} md:size={14} />
                                                Add
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-20 text-(--muted) font-black uppercase tracking-widest text-xs opacity-50">
                                            No products found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {products.length > itemsPerPage && (
                        <div className="flex items-center justify-between p-4 bg-(--input) border-t border-(--border)">
                            <div className="text-xs font-bold text-(--muted) uppercase tracking-wider">
                                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, products.length)} of {products.length}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-(--foreground) bg-(--card) border border-(--border) rounded-lg hover:bg-(--input) disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Prev
                                </button>
                                <span className="text-xs font-black text-(--foreground)">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-(--foreground) bg-(--card) border border-(--border) rounded-lg hover:bg-(--input) disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Cart & Checkout */}
            <div className="col-span-12 lg:col-span-4 bg-(--card) border border-(--border) rounded-[8px] p-4 md:p-6 flex flex-col transition-colors duration-300">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-(--foreground)">
                    <ShoppingCart className="text-primary" size={24} />
                    Current Bill
                </h2>

                <div className="mb-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-(--muted) uppercase tracking-widest ml-1">Customer Info</label>
                        <input
                            type="text"
                            placeholder="Name (Optional)"
                            className="w-full bg-(--input) border border-(--border) rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-(--foreground) font-medium transition-all placeholder:text-(--muted)"
                            value={customer}
                            onChange={(e) => setCustomer(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-(--muted) uppercase tracking-widest ml-1">Phone Number <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            maxLength="10"
                            placeholder="10-digit Phone Number"
                            className="w-full bg-(--input) border border-(--border) rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-(--foreground) font-bold transition-all placeholder:text-(--muted)"
                            value={phone}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setPhone(val);
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-(--muted) uppercase tracking-widest ml-1">Payment Mode</label>
                            <div className="relative">
                                <select
                                    value={paymentMode}
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                    className="w-full bg-(--input) border border-(--border) rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-(--foreground) font-bold appearance-none transition-all cursor-pointer"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="UPI">UPI</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-(--muted) pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-black text-(--muted) uppercase tracking-widest">Discount</label>
                                <div className="flex bg-(--input) p-0.5 rounded-lg border border-(--border)">
                                    <button 
                                        onClick={() => setDiscountType('Amount')}
                                        className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${discountType === 'Amount' ? 'bg-primary text-(--primary-foreground) shadow-sm' : 'text-(--muted)'}`}
                                    >
                                        ₹
                                    </button>
                                    <button 
                                        onClick={() => setDiscountType('Percent')}
                                        className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${discountType === 'Percent' ? 'bg-primary text-(--primary-foreground) shadow-sm' : 'text-(--muted)'}`}
                                    >
                                        %
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full bg-(--input) border border-(--border) rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-(--foreground) font-bold transition-all placeholder:text-(--muted) pr-8"
                                    value={discount === 0 ? '' : discount}
                                    placeholder="0"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setDiscount(val === '' ? 0 : Math.max(0, Number(val)));
                                    }}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-(--muted) text-xs font-black uppercase">
                                    {discountType === 'Percent' ? '%' : '₹'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-4 min-h-[200px]">
                    {cart.map(item => (
                        <div key={item.productId} className="flex flex-col gap-3 p-4 bg-(--input) rounded-2xl border border-(--border) relative group transition-all hover:bg-(--input)/80">
                            <button
                                onClick={() => removeFromCart(item.productId)}
                                className="absolute top-3 right-3 p-1.5 text-(--muted) hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                            <span className="font-bold text-(--foreground) text-sm pr-8 leading-tight">{item.name}</span>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2 bg-(--card) rounded-xl border border-(--border) p-1 shadow-sm">
                                    <button onClick={() => updateQty(item.productId, -1)} className="p-1.5 hover:bg-(--input) rounded-lg text-(--muted) transition-all"><Minus size={14} /></button>
                                    <span className="w-8 text-center text-sm font-bold text-(--foreground)">{item.quantity}</span>
                                    <button onClick={() => updateQty(item.productId, 1)} className="p-1.5 hover:bg-(--input) rounded-lg text-(--muted) transition-all"><Plus size={14} /></button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-(--muted)">@</span>
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => updatePrice(item.productId, e.target.value)}
                                        className="w-20 bg-(--card) border border-(--border) rounded-lg py-1 px-2 text-sm font-bold text-(--foreground) focus:outline-none focus:ring-2 focus:ring-primary/20 text-right"
                                    />
                                    <span className="font-bold text-primary text-base min-w-[60px] text-right">₹{item.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-(--muted)">
                            <ShoppingCart size={40} className="mb-2 opacity-20" />
                            <p className="text-xs uppercase tracking-widest font-bold">Cart is empty</p>
                        </div>
                    )}
                </div>

                <div className="space-y-3 pt-6 border-t border-(--border) mt-auto">
                    <div className="flex justify-between text-(--muted) text-sm font-semibold">
                        <span>Subtotal</span>
                        <span className="text-(--foreground) font-bold">₹{subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-(--muted) text-sm font-semibold">
                        <span>GST Total</span>
                        <span className="text-(--foreground) font-bold">₹{totalGst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-(--muted) text-sm font-semibold">
                        <span>Discount {discountType === 'Percent' ? `(${discount}%)` : ''}</span>
                        <span className="text-rose-600 font-bold">-₹{calculatedDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-(--border) mt-2">
                        <span className="text-[14px] font-black text-(--foreground) uppercase tracking-tighter">Grand Total</span>
                        <span className="text-2xl font-black text-primary">₹{Math.max(0, finalTotal).toFixed(2)}</span>
                    </div>

                    <div className="mt-6">
                        <button
                            disabled={cart.length === 0}
                            onClick={() => handleCheckout(true)}
                            className="w-full py-4 bg-primary text-(--primary-foreground) font-black rounded-xl hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 text-xs uppercase tracking-widest"
                        >
                            <Printer size={18} />
                            Save & Print Invoice
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Billing;
