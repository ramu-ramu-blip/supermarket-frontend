import { useState, useEffect } from 'react';
import {
    Truck,
    Plus,
    Search,
    Trash2,
    Edit3,
    Package,
    Calendar,
    DollarSign,
    Save,
    X,
    Filter,
    ChevronDown,
    ChevronRight,
    ShoppingBag,
    Download
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import useDebounce from '../hooks/useDebounce';
import ExcelJS from 'exceljs';

const Suppliers = () => {
    const [activeTab, setActiveTab] = useState('list'); // list, purchase, history
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [purchases, setPurchases] = useState([]);
    
    // Add purchase history export
    const handleExportPurchase = async () => {
        if (purchases.length === 0) {
            toast.error('No purchase history to export');
            return;
        }

        const toastId = toast.loading('Generating Purchase Report...');

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Purchase History');
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

            // Header
            worksheet.mergeCells('A1:G1');
            const storeTitle = worksheet.getCell('A1');
            storeTitle.value = (userInfo.supermarketName || 'SHREE SUPERMARKET').toUpperCase();
            storeTitle.font = { name: 'Arial Black', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
            storeTitle.alignment = { horizontal: 'center' };
            storeTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

            worksheet.mergeCells('A2:G2');
            const subTitle = worksheet.getCell('A2');
            subTitle.value = `PURCHASE HISTORY REPORT - ${new Date().toLocaleDateString()}`;
            subTitle.font = { bold: true };
            subTitle.alignment = { horizontal: 'center' };

            // Columns
            worksheet.columns = [
                { header: 'DATE', key: 'date', width: 15 },
                { header: 'INVOICE NO', key: 'invoice', width: 20 },
                { header: 'SUPPLIER', key: 'supplier', width: 30 },
                { header: 'TOTAL ITEMS', key: 'items', width: 15 },
                { header: 'SUB TOTAL', key: 'sub', width: 15 },
                { header: 'DISCOUNT', key: 'discount', width: 12 },
                { header: 'NET PAYABLE', key: 'net', width: 18 }
            ];

            // Style Headers
            const headerRow = worksheet.getRow(3);
            headerRow.values = worksheet.columns.map(col => col.header);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
                cell.alignment = { horizontal: 'center' };
                cell.border = { bottom: { style: 'medium' } };
            });

            // Add Data
            purchases.forEach((p, index) => {
                const row = worksheet.addRow({
                    date: new Date(p.createdAt).toLocaleDateString(),
                    invoice: p.invoiceNumber,
                    supplier: (p.supplier?.name || 'Unknown').toUpperCase(),
                    items: p.items.length,
                    sub: p.totalAmount,
                    discount: p.discountAmount,
                    net: p.netAmount
                });

                if (index % 2 === 0) {
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                }

                ['sub', 'discount', 'net'].forEach(key => {
                    row.getCell(key).numFmt = '₹#,##0.00';
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Purchase_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            
            toast.success(`Exported ${purchases.length} purchase records`, { id: toastId });
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export', { id: toastId });
        }
    };
    const [loading, setLoading] = useState(false);

    // Supplier State
    const [supplierSearch, setSupplierSearch] = useState('');
    const [historySearch, setHistorySearch] = useState('');
    const debouncedSupplierSearch = useDebounce(supplierSearch, 500);
    const debouncedHistorySearch = useDebounce(historySearch, 500);
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [supplierForm, setSupplierForm] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        gstin: ''
    });

    // Purchase State
    const [purchaseForm, setPurchaseForm] = useState({
        supplier: '',
        invoiceNumber: '',
        items: [],
        discount: '',
        notes: ''
    });
    const [productSearch, setProductSearch] = useState('');
    const debouncedProductSearch = useDebounce(productSearch, 500);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isNewProduct, setIsNewProduct] = useState(false);
    const [itemForm, setItemForm] = useState({
        name: '',
        brand: '',
        category: '',
        unit: 'Packet',
        barcode: '',
        expiryDate: '',
        quantity: '',
        costPrice: '',
        sellingPrice: ''
    });

    // Delete Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState({ type: '', id: '' });

    useEffect(() => {
        if (activeTab === 'list') fetchSuppliers(debouncedSupplierSearch);
        if (activeTab === 'history') fetchPurchases(debouncedHistorySearch);
        if (activeTab === 'purchase') fetchProducts(debouncedProductSearch);
    }, [activeTab]);

    useEffect(() => {
        fetchSuppliers(debouncedSupplierSearch);
    }, [debouncedSupplierSearch]);

    useEffect(() => {
        fetchPurchases(debouncedHistorySearch);
    }, [debouncedHistorySearch]);

    useEffect(() => {
        fetchProducts(debouncedProductSearch);
    }, [debouncedProductSearch]);

    const fetchSuppliers = async (query = '') => {
        try {
            const { data } = await api.get(`/suppliers${query ? `?search=${query}` : ''}`);
            setSuppliers(data);
        } catch (error) {
            toast.error('Failed to fetch suppliers');
        }
    };

    const fetchProducts = async (query = '') => {
        try {
            const { data } = await api.get(`/products${query ? `?search=${query}` : ''}`);
            setProducts(data);
        } catch (error) {
            // silent fail or toast
        }
    };

    const fetchPurchases = async (query = '') => {
        try {
            const { data } = await api.get(`/purchases${query ? `?search=${query}` : ''}`);
            setPurchases(data);
        } catch (error) {
            toast.error('Failed to fetch purchases');
        }
    };

    /* --- SUPPLIER HANDLERS --- */
    const handleSupplierSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await api.put(`/suppliers/${editingSupplier._id}`, supplierForm);
                toast.success('Supplier updated');
            } else {
                await api.post('/suppliers', supplierForm);
                toast.success('Supplier added');
            }
            setShowSupplierModal(false);
            setEditingSupplier(null);
            setSupplierForm({ name: '', contactPerson: '', phone: '', email: '', address: '', gstin: '' });
            fetchSuppliers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDeleteClick = (type, id) => {
        setDeleteTarget({ type, id });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            if (deleteTarget.type === 'supplier') {
                await api.delete(`/suppliers/${deleteTarget.id}`);
                fetchSuppliers();
            } else if (deleteTarget.type === 'purchase') {
                await api.delete(`/purchases/${deleteTarget.id}`);
                fetchPurchases();
            }
            toast.success(`${deleteTarget.type === 'supplier' ? 'Supplier' : 'Purchase'} deleted`);
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    /* --- PURCHASE HANDLERS --- */
    const addItemToPurchase = () => {
        if (!isNewProduct && !selectedProduct) {
            return toast.error('Please select a product or add a new one');
        }
        if (!itemForm.quantity || !itemForm.costPrice) {
            return toast.error('Please fill quantity and cost price');
        }
        if (isNewProduct && (!itemForm.name || !itemForm.category)) {
            return toast.error('Please fill new product name and category');
        }

        const total = Number(itemForm.quantity) * Number(itemForm.costPrice);
        const newItem = {
            product: isNewProduct ? null : selectedProduct._id,
            isNew: isNewProduct,
            name: isNewProduct ? itemForm.name : undefined,
            brand: isNewProduct ? itemForm.brand : undefined,
            category: isNewProduct ? itemForm.category : undefined,
            unit: isNewProduct ? itemForm.unit : undefined,
            barcode: isNewProduct ? itemForm.barcode : undefined,
            expiryDate: isNewProduct ? itemForm.expiryDate : undefined,
            productName: isNewProduct ? (itemForm.brand ? `${itemForm.brand} ${itemForm.name}` : itemForm.name) : selectedProduct.name,
            quantity: Number(itemForm.quantity),
            costPrice: Number(itemForm.costPrice),
            sellingPrice: Number(itemForm.sellingPrice) || (isNewProduct ? Number(itemForm.costPrice) * 1.2 : selectedProduct.sellingPrice),
            total
        };

        setPurchaseForm(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));

        // Reset item input
        setItemForm({ name: '', brand: '', category: '', unit: 'Packet', barcode: '', expiryDate: '', quantity: '', costPrice: '', sellingPrice: '' });
        setSelectedProduct(null);
        setProductSearch('');
        setIsNewProduct(false);
    };

    const removeItemFromPurchase = (index) => {
        setPurchaseForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const submitPurchase = async () => {
        if (!purchaseForm.supplier || !purchaseForm.invoiceNumber || purchaseForm.items.length === 0) {
            return toast.error('Please complete the purchase form');
        }

        const totalAmount = purchaseForm.items.reduce((sum, item) => sum + item.total, 0);

        try {
            await api.post('/purchases', {
                ...purchaseForm,
                totalAmount,
                status: 'Completed'
            });
            toast.success('Purchase recorded & Stock updated');
            setPurchaseForm({ supplier: '', invoiceNumber: '', items: [], discount: '', notes: '' });
            fetchProducts(); // Refresh products in case new ones were added
            setActiveTab('history');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Purchase failed');
        }
    };


    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 pb-10 overflow-hidden">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[15px] font-black text-(--foreground) tracking-tight uppercase">Supplier Management</h2>
                    <p className="text-(--muted) mt-1 font-medium text-xs md:text-sm">Manage suppliers and inventory purchases.</p>
                </div>
                <div className="flex bg-(--card) p-1 rounded-xl border border-(--border)">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'list' ? 'bg-primary text-(--primary-foreground) shadow-md' : 'text-(--muted) hover:text-(--foreground)'}`}
                    >
                        Suppliers
                    </button>
                    <button
                        onClick={() => setActiveTab('purchase')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'purchase' ? 'bg-primary text-(--primary-foreground) shadow-md' : 'text-(--muted) hover:text-(--foreground)'}`}
                    >
                        New Purchase
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'history' ? 'bg-primary text-(--primary-foreground) shadow-md' : 'text-(--muted) hover:text-(--foreground)'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            {/* TAB CONTENT: SUPPLIER LIST */}
            {activeTab === 'list' && (
                <div className="flex-1 flex flex-col min-h-0 space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative group w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted) group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search suppliers..."
                                className="w-full bg-(--card) border border-(--border)/30 rounded-xl pl-10 pr-10 py-2.5 text-xs md:text-sm font-bold text-(--foreground) placeholder:text-(--muted)/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                                value={supplierSearch}
                                onChange={(e) => setSupplierSearch(e.target.value)}
                            />
                            {supplierSearch && (
                                <button 
                                    onClick={() => setSupplierSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-(--input) rounded-full text-(--muted) transition-all"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => { setEditingSupplier(null); setSupplierForm({ name: '', contactPerson: '', phone: '', email: '', address: '', gstin: '' }); setShowSupplierModal(true); }}
                            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-(--primary-foreground) px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            <Plus size={16} /> Add Supplier
                        </button>
                    </div>

                    <div className="bg-(--card) rounded-2xl border border-(--border) shadow-sm overflow-hidden flex-1">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-(--input) border-b border-(--border) text-(--muted) text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Supplier Name</th>
                                        <th className="p-4">Contact</th>
                                        <th className="p-4">Phone</th>
                                        <th className="p-4">GSTIN</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-(--border)">
                                    {suppliers.map(s => (
                                        <tr key={s._id} className="hover:bg-(--input)/50 transition-colors">
                                            <td className="p-4 font-bold text-(--foreground)">{s.name}</td>
                                            <td className="p-4 text-sm text-(--foreground)">{s.contactPerson || '-'}</td>
                                            <td className="p-4 text-sm font-mono text-(--muted)">{s.phone}</td>
                                            <td className="p-4 text-sm font-mono text-(--muted)">{s.gstin || '-'}</td>
                                            <td className="p-4 flex justify-end gap-2">
                                                <button onClick={() => { setEditingSupplier(s); setSupplierForm(s); setShowSupplierModal(true); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"><Edit3 size={16} /></button>
                                                <button onClick={() => handleDeleteClick('supplier', s._id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {suppliers.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-(--muted) text-sm font-medium">No suppliers found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: NEW PURCHASE */}
            {activeTab === 'purchase' && (
                <div className="flex-1 overflow-y-auto pb-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Purchase Details Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-(--card) p-6 rounded-2xl border border-(--border) shadow-sm space-y-4">
                                <h3 className="text-sm font-black text-(--foreground) uppercase tracking-tight flex items-center gap-2">
                                    <Truck size={18} className="text-primary" /> Purchase Info
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-(--muted) uppercase tracking-widest">Supplier</label>
                                        <select
                                            value={purchaseForm.supplier}
                                            onChange={e => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })}
                                            className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-2.5 text-sm font-bold text-(--foreground) focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">Select Supplier</option>
                                            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-(--muted) uppercase tracking-widest">Invoice Number</label>
                                        <input
                                            type="text"
                                            value={purchaseForm.invoiceNumber}
                                            onChange={e => setPurchaseForm({ ...purchaseForm, invoiceNumber: e.target.value })}
                                            className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-2.5 text-sm font-bold text-(--foreground) focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="e.g. INV-2024-001"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Add Items Section */}
                            <div className="bg-(--card) p-6 rounded-2xl border border-(--border) shadow-sm space-y-4">
                                <h3 className="text-sm font-black text-(--foreground) uppercase tracking-tight flex items-center gap-2">
                                    <Package size={18} className="text-primary" /> Add Products
                                </h3>
                                
                                <div className="space-y-3 relative">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-(--muted) uppercase tracking-widest">Search Product</label>
                                        <button 
                                            onClick={() => { setIsNewProduct(!isNewProduct); setSelectedProduct(null); setProductSearch(''); }}
                                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all ${isNewProduct ? 'bg-primary text-white' : 'bg-(--input) text-(--muted) hover:text-primary'}`}
                                        >
                                            {isNewProduct ? 'Cancel New Product' : '+ Add New Product'}
                                        </button>
                                    </div>
                                    {!isNewProduct ? (
                                        <div className="relative group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted) group-focus-within:text-primary transition-colors" size={16} />
                                            <input
                                                type="text"
                                                value={productSearch}
                                                onChange={e => { setProductSearch(e.target.value); setSelectedProduct(null); }}
                                                className="w-full bg-(--input) border border-(--border) rounded-xl pl-10 pr-10 py-3 text-sm font-bold text-(--foreground) focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                                                placeholder="Search by name, brand or barcode..."
                                            />
                                            {productSearch && (
                                                <button 
                                                    onClick={() => { setProductSearch(''); setSelectedProduct(null); }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-(--card) rounded-full text-(--muted) hover:text-red-500 transition-all"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Product Name"
                                                value={itemForm.name}
                                                onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                                                className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-2.5 text-sm font-bold text-(--foreground)"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Brand (Optional)"
                                                value={itemForm.brand}
                                                onChange={e => setItemForm({ ...itemForm, brand: e.target.value })}
                                                className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-2.5 text-sm font-bold text-(--foreground)"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Category"
                                                value={itemForm.category}
                                                onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                                                className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-2.5 text-sm font-bold text-(--foreground)"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Barcode (Optional)"
                                                value={itemForm.barcode}
                                                onChange={e => setItemForm({ ...itemForm, barcode: e.target.value })}
                                                className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-2.5 text-sm font-bold text-(--foreground)"
                                            />
                                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                                <select
                                                    value={itemForm.unit}
                                                    onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                                                    className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-2.5 text-sm font-bold text-(--foreground)"
                                                >
                                                    <option value="Packet">Packet</option>
                                                    <option value="KG">KG</option>
                                                    <option value="Litre">Litre</option>
                                                    <option value="Unit">Unit</option>
                                                </select>
                                                <input
                                                    type="date"
                                                    value={itemForm.expiryDate}
                                                    onChange={e => setItemForm({ ...itemForm, expiryDate: e.target.value })}
                                                    className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-2.5 text-sm font-bold text-(--foreground)"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {/* Dropdown Results */}
                                    {productSearch && !selectedProduct && (
                                        <div className="absolute z-10 w-full bg-(--card) border border-(--border) rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                                            {products.map(p => (
                                                <div
                                                    key={p._id}
                                                    onClick={() => { setSelectedProduct(p); setProductSearch(p.name); }}
                                                    className="p-3 hover:bg-(--input) cursor-pointer flex justify-between items-center border-b border-(--border) last:border-0"
                                                >
                                                    <div>
                                                        <div className="text-sm font-bold text-(--foreground)">{p.name}</div>
                                                        <div className="text-[10px] text-(--muted)">Stock: {p.stockQuantity} {p.unit}</div>
                                                    </div>
                                                    <div className="text-xs font-mono text-(--foreground)">₹{p.costPrice}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {(selectedProduct || isNewProduct) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-(--muted) uppercase tracking-widest">Quantity</label>
                                            <input
                                                type="number"
                                                value={itemForm.quantity}
                                                onChange={e => setItemForm({ ...itemForm, quantity: e.target.value })}
                                                className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-2.5 text-sm font-bold text-(--foreground)"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-(--muted) uppercase tracking-widest">Cost Price</label>
                                            <input
                                                type="number"
                                                value={itemForm.costPrice}
                                                onChange={e => setItemForm({ ...itemForm, costPrice: e.target.value })}
                                                className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-2.5 text-sm font-bold text-(--foreground)"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-(--muted) uppercase tracking-widest">New Selling Price (Opt)</label>
                                            <input
                                                type="number"
                                                value={itemForm.sellingPrice}
                                                onChange={e => setItemForm({ ...itemForm, sellingPrice: e.target.value })}
                                                className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-2.5 text-sm font-bold text-(--foreground)"
                                                placeholder={selectedProduct?.sellingPrice || '0.00'}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={addItemToPurchase}
                                        className="bg-(--foreground) text-(--background) px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                                    >
                                        Add Item
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Summary */}
                        <div className="bg-(--card) p-6 rounded-2xl border border-(--border) shadow-sm h-fit flex flex-col">
                            <h3 className="text-sm font-black text-(--foreground) uppercase tracking-tight mb-4">Purchase Summary</h3>
                            
                            <div className="flex-1 overflow-y-auto min-h-[200px] space-y-3 mb-4 custom-scrollbar">
                                {purchaseForm.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-(--input)/50 rounded-xl border border-(--border)">
                                        <div>
                                            <div className="text-xs font-black text-(--foreground)">{item.productName}</div>
                                            <div className="text-[10px] text-(--muted)">{item.quantity} x ₹{item.costPrice}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-(--foreground)">₹{item.total.toFixed(2)}</div>
                                            <button onClick={() => removeItemFromPurchase(idx)} className="text-[10px] text-rose-500 hover:text-rose-600 uppercase font-bold">Remove</button>
                                        </div>
                                    </div>
                                ))}
                                {purchaseForm.items.length === 0 && (
                                    <div className="text-center text-(--muted) text-xs italic py-10">No items added yet.</div>
                                )}
                            </div>

                            <div className="border-t border-(--border) pt-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-(--muted) uppercase text-[10px] tracking-widest">Subtotal</span>
                                    <span className="font-black text-(--foreground) text-sm">
                                        ₹{purchaseForm.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-(--muted) uppercase tracking-widest ml-1">Discount (₹)</label>
                                    <input
                                        type="number"
                                        value={purchaseForm.discount}
                                        onChange={e => setPurchaseForm({ ...purchaseForm, discount: e.target.value })}
                                        className="w-full bg-(--input) border border-(--border) rounded-xl px-3 py-2 text-sm font-bold text-(--foreground)"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-dashed border-(--border)">
                                    <span className="font-bold text-(--foreground) uppercase text-xs">Total Amount</span>
                                    <span className="font-black text-xl text-primary">
                                        ₹{(purchaseForm.items.reduce((sum, item) => sum + item.total, 0) - (Number(purchaseForm.discount) || 0)).toFixed(2)}
                                    </span>
                                </div>
                                <button
                                    onClick={submitPurchase}
                                    disabled={purchaseForm.items.length === 0}
                                    className="w-full bg-primary text-(--primary-foreground) py-3 rounded-xl font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                                >
                                    Confirm Purchase
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: HISTORY */}
            {activeTab === 'history' && (
                <div className="flex-1 flex flex-col min-h-0 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative group max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted) group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search by supplier or invoice..."
                                className="w-full bg-(--card) border border-(--border)/30 rounded-xl pl-10 pr-10 py-2.5 text-xs md:text-sm font-bold text-(--foreground) placeholder:text-(--muted)/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                            />
                            {historySearch && (
                                <button
                                    onClick={() => setHistorySearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-(--input) rounded-full text-(--muted) transition-all"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleExportPurchase}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500/20 active:scale-95 transition-all shadow-sm"
                        >
                            <Download size={16} />
                            Export History
                        </button>
                    </div>

                    <div className="bg-(--card) rounded-2xl border border-(--border) shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-(--input) border-b border-(--border) text-(--muted) text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Supplier</th>
                                        <th className="p-4">Invoice #</th>
                                        <th className="p-4">Items</th>
                                        <th className="p-4 text-right">Total Amount</th>
                                        <th className="p-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-(--border)">
                                    {purchases.map(p => (
                                        <tr key={p._id} className="hover:bg-(--input)/50 transition-colors">
                                            <td className="p-4 text-xs font-bold text-(--muted)">
                                                {new Date(p.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 font-black text-(--foreground) text-sm">{p.supplier?.name || 'Unknown'}</td>
                                            <td className="p-4 text-xs font-mono text-(--foreground)">{p.invoiceNumber}</td>
                                            <td className="p-4 text-xs text-(--muted) font-bold">{p.items.length} Products</td>
                                            <td className="p-4 text-right font-black text-(--foreground) text-sm">₹{p.totalAmount.toFixed(2)}</td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => handleDeleteClick('purchase', p._id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD SUPPLIER MODAL */}
            {showSupplierModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-(--card) w-full max-w-md rounded-[24px] border border-(--border) shadow-2xl overflow-hidden p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-(--foreground) uppercase tracking-tight">{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
                            <button onClick={() => setShowSupplierModal(false)} className="p-2 hover:bg-(--input) rounded-full text-(--muted)"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSupplierSubmit} className="space-y-4">
                            <input required placeholder="Supplier Name" value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-3 text-sm font-bold text-(--foreground) focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            <input required placeholder="Contact Person" value={supplierForm.contactPerson} onChange={e => setSupplierForm({...supplierForm, contactPerson: e.target.value})} className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-3 text-sm font-bold text-(--foreground) focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            <input required placeholder="Phone Number" value={supplierForm.phone} onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-3 text-sm font-bold text-(--foreground) focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            <input placeholder="Email (Optional)" type="email" value={supplierForm.email} onChange={e => setSupplierForm({...supplierForm, email: e.target.value})} className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-3 text-sm font-bold text-(--foreground) focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            <input placeholder="Address" value={supplierForm.address} onChange={e => setSupplierForm({...supplierForm, address: e.target.value})} className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-3 text-sm font-bold text-(--foreground) focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            <input placeholder="GSTIN (Tax ID)" value={supplierForm.gstin} onChange={e => setSupplierForm({...supplierForm, gstin: e.target.value})} className="w-full bg-(--input) border border-(--border) rounded-xl px-4 py-3 text-sm font-bold text-(--foreground) focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            
                            <button type="submit" className="w-full bg-primary text-(--primary-foreground) py-4 rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-primary/90 mt-2">
                                Save Supplier
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure? This action cannot be undone."
                confirmText="Delete"
                isDangerous={true}
            />
        </div>
    );
};

export default Suppliers;
