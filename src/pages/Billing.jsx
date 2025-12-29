import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Trash2, IndianRupee, Printer, Download, Plus, Minus, ChevronDown } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Billing = () => {
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState('');
    const [phone, setPhone] = useState('');
    const [discount, setDiscount] = useState(0);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data } = await api.get('/products');
        setProducts(data);
    };

    const filteredProducts = products.filter(p =>
        (p.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (p.barcode?.toString() || '').includes(search) ||
        (p.category?.toLowerCase() || '').includes(search.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

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
    const finalTotal = Math.round(subTotal + totalGst - Number(discount));

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
                discountAmount: Number(discount),
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
                        <div>Store Ph: ${storePhone}</div>
                        <div class="divider" style="margin: 5px 0;"></div>
                        <div style="text-align: left; font-size: 10px;">
                            <div>Customer: ${bill.customerName || 'Walk-in'}</div>
                            <div>Phone: ${bill.customerPhone}</div>
                        </div>
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

    return (
        <div className="grid grid-cols-12 gap-4 md:gap-8 flex-1 animate-in fade-in duration-500">
            {/* Search & Results */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 md:gap-6">
                <div className="glass-card ">

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search name or barcode..."
                            className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl md:rounded-2xl py-3 md:py-4 pl-5 md:pl-6 pr-4 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[var(--muted)] text-[var(--foreground)] font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-[var(--card)] rounded-[8px] border border-[var(--border)] shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto custom-scrollbar px-1">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead className="sticky top-0 z-10 bg-[var(--input)] shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                                <tr className="text-[var(--muted)] text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                                    <th className="px-2 md:px-6 py-2 md:py-4">Product Name</th>
                                    <th className="px-2 md:px-6 py-2 md:py-4 text-center">Category</th>
                                    <th className="px-2 md:px-6 py-2 md:py-4 text-center">Stock</th>
                                    <th className="px-2 md:px-6 py-2 md:py-4 text-right">Price</th>
                                    <th className="px-2 md:px-6 py-2 md:py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {currentItems.map(p => (
                                    <tr key={p._id} className="bg-[var(--card)] hover:bg-[var(--input)]/50 transition-all group">
                                        <td className="px-2 md:px-6 py-2.5 md:py-3">
                                            <div className="font-black text-[var(--foreground)] text-[11px] md:text-sm truncate max-w-[120px] md:max-w-none">{p.name}</div>
                                            <div className="text-[8px] md:text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5 truncate">{p.brand || '---'}</div>
                                        </td>
                                        <td className="px-2 md:px-6 py-2.5 md:py-3 text-center">
                                            <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-[var(--input)] text-[var(--secondary)] rounded-md md:rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-[var(--border)]">
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="px-2 md:px-6 py-2.5 md:py-3 text-center">
                                            <div className={`font-black text-[11px] md:text-sm ${p.stockQuantity < 10 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                {p.stockQuantity} <span className="text-[8px] md:text-[10px] uppercase opacity-50">{p.unit}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 md:px-6 py-2.5 md:py-3 text-right">
                                            <div className="font-black text-[var(--foreground)] text-[11px] md:text-sm">₹{p.sellingPrice}</div>
                                        </td>
                                        <td className="px-2 md:px-6 py-2.5 md:py-3 text-right">
                                            <button
                                                onClick={() => addToCart(p)}
                                                className="px-2 py-1.5 md:px-4 md:py-2 bg-gray-400 text-[var(--background)] font-black rounded-lg md:rounded-xl hover:bg-primary transition-all shadow-sm inline-flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] uppercase tracking-widest active:scale-95 whitespace-nowrap"
                                            >
                                                <Plus size={12} md:size={14} />
                                                Add
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-20 text-[var(--muted)] font-black uppercase tracking-widest text-xs opacity-50">
                                            No products found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {filteredProducts.length > itemsPerPage && (
                        <div className="flex items-center justify-between p-4 bg-[var(--input)] border-t border-[var(--border)]">
                            <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--secondary)] bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--input)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Prev
                                </button>
                                <span className="text-xs font-black text-[var(--foreground)]">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--secondary)] bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--input)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Cart & Checkout */}
            <div className="col-span-12 lg:col-span-4 bg-[var(--card)] border border-[var(--border)] rounded-[8px] p-4 md:p-6 flex flex-col transition-colors duration-300">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--foreground)]">
                    <ShoppingCart className="text-primary" size={24} />
                    Current Bill
                </h2>

                <div className="mb-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-[var(--muted)] uppercase tracking-widest ml-1">Customer Info</label>
                        <input
                            type="text"
                            placeholder="Name (Optional)"
                            className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-[var(--foreground)] font-medium transition-all placeholder:text-[var(--muted)]"
                            value={customer}
                            onChange={(e) => setCustomer(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-[var(--muted)] uppercase tracking-widest ml-1">Phone Number <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            maxLength="10"
                            placeholder="10-digit Phone Number"
                            className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-[var(--foreground)] font-bold transition-all placeholder:text-[var(--muted)]"
                            value={phone}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setPhone(val);
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[var(--muted)] uppercase tracking-widest ml-1">Payment Mode</label>
                            <div className="relative">
                                <select
                                    value={paymentMode}
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                    className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-[var(--foreground)] font-bold appearance-none transition-all cursor-pointer"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="UPI">UPI</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[var(--muted)] uppercase tracking-widest ml-1">Discount (₹)</label>
                            <input
                                type="number"
                                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-[var(--foreground)] font-bold transition-all placeholder:text-[var(--muted)]"
                                value={discount === 0 ? '' : discount}
                                placeholder="0"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setDiscount(val === '' ? 0 : Math.max(0, Number(val)));
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-4 min-h-[200px]">
                    {cart.map(item => (
                        <div key={item.productId} className="flex flex-col gap-3 p-4 bg-[var(--input)] rounded-2xl border border-[var(--border)] relative group transition-all hover:bg-[var(--input)]/80">
                            <button
                                onClick={() => removeFromCart(item.productId)}
                                className="absolute top-3 right-3 p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                            <span className="font-bold text-[var(--foreground)] text-sm pr-8 leading-tight">{item.name}</span>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2 bg-[var(--card)] rounded-xl border border-[var(--border)] p-1 shadow-sm">
                                    <button onClick={() => updateQty(item.productId, -1)} className="p-1.5 hover:bg-[var(--input)] rounded-lg text-[var(--secondary)] transition-all"><Minus size={14} /></button>
                                    <span className="w-8 text-center text-sm font-bold text-[var(--foreground)]">{item.quantity}</span>
                                    <button onClick={() => updateQty(item.productId, 1)} className="p-1.5 hover:bg-[var(--input)] rounded-lg text-[var(--secondary)] transition-all"><Plus size={14} /></button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-[var(--muted)]">@</span>
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => updatePrice(item.productId, e.target.value)}
                                        className="w-20 bg-[var(--card)] border border-[var(--border)] rounded-lg py-1 px-2 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20 text-right"
                                    />
                                    <span className="font-bold text-primary text-base min-w-[60px] text-right">₹{item.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-[var(--muted)]">
                            <ShoppingCart size={40} className="mb-2 opacity-20" />
                            <p className="text-xs uppercase tracking-widest font-bold">Cart is empty</p>
                        </div>
                    )}
                </div>

                <div className="space-y-3 pt-6 border-t border-[var(--border)] mt-auto">
                    <div className="flex justify-between text-[var(--secondary)] text-sm font-semibold">
                        <span>Subtotal</span>
                        <span className="text-[var(--foreground)] font-bold">₹{subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--secondary)] text-sm font-semibold">
                        <span>GST Total</span>
                        <span className="text-[var(--foreground)] font-bold">₹{totalGst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--secondary)] text-sm font-semibold">
                        <span>Discount</span>
                        <span className="text-rose-600 font-bold">-₹{Number(discount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-[var(--border)] mt-2">
                        <span className="text[14px] font-black text-[var(--foreground)] uppercase tracking-tighter">Grand Total</span>
                        <span className="text-2xl font-black text-emerald-600">₹{Math.max(0, finalTotal).toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <button
                            disabled={cart.length === 0}
                            onClick={() => handleCheckout(false)}
                            className="py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 text-xs uppercase tracking-widest"
                        >
                            <Download size={18} />
                            Save
                        </button>
                        <button
                            disabled={cart.length === 0}
                            onClick={() => handleCheckout(true)}
                            className="py-4 bg-primary text-white font-black rounded-xl hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 text-xs uppercase tracking-widest"
                        >
                            <Printer size={18} />
                            Save & Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Billing;
