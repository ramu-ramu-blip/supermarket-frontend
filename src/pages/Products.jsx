import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Edit3, AlertTriangle, X, Package, Tag, Hash, IndianRupee, Percent, Layers, Calendar, Truck, AlertCircle, Bookmark, Upload, FileText } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({

        name: '',
        brand: '',
        category: '',
        barcode: '',
        costPrice: '',
        sellingPrice: '',
        gstPercent: '0',
        gstType: 'Inclusive',
        stockQuantity: '',
        unit: 'Packet',
        expiryDate: '',
        batchNo: '',
        minStockLevel: '10',
        supplier: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            toast.error('Failed to fetch products');
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            toast.error('Failed to fetch categories');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, formData);
                toast.success('Product updated successfully');
            } else {
                await api.post('/products', formData);
                toast.success('Product added successfully');
            }
            setShowModal(false);
            setEditingProduct(null);
            resetForm();
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save product');
        }
    };

    const handleDeleteClick = (id) => {
        setProductToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        try {
            await api.delete(`/products/${productToDelete}`);
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        } finally {
            setShowDeleteModal(false);
            setProductToDelete(null);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory) return;
        try {
            await api.post('/categories', { name: newCategory });
            toast.success('Category added successfully');
            setNewCategory('');
            setShowCategoryModal(false);
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add category');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/products/bulk-import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Products imported successfully!');
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to import products');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            brand: '',
            category: '',
            barcode: '',
            costPrice: '',
            sellingPrice: '',
            gstPercent: '0',
            gstType: 'Inclusive',
            stockQuantity: '',
            unit: 'Packet',
            expiryDate: '',
            batchNo: '',
            minStockLevel: '10',
            supplier: ''
        });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);


    return (
        <div className="h-full flex flex-col space-y-4 md:space-y-6 animate-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)] tracking-tight uppercase">Inventory</h2>
                    <p className="text-[var(--secondary)] mt-1 font-medium text-xs md:text-sm">Manage and monitor your store products.</p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 sm:flex-none px-4 md:px-5 py-2.5 md:py-3 bg-[var(--card)] border border-[var(--border)] text-[var(--secondary)] font-bold rounded-xl md:rounded-2xl hover:bg-[var(--input)] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 text-xs md:text-sm"
                    >
                        <Upload size={16} md:size={18} className='rotate-180' />
                        Import CSV
                    </button>
                    <button
                        onClick={() => { setShowModal(true); setEditingProduct(null); resetForm(); }}
                        className="flex-1 sm:flex-none px-5 md:px-6 py-2.5 md:py-3 bg-primary text-white font-black rounded-xl md:rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/30 active:scale-95 text-xs md:text-sm"
                    >
                        <Plus size={18} md:size={20} />
                        Add Product
                    </button>
                </div>
            </div>

            <div className="glass-card p-3 md:p-5 flex items-center gap-3 md:gap-4">
                <Search className="text-[var(--muted)]" size={18} md:size={20} />
                <input
                    type="text"
                    placeholder="Search inventory..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--foreground)] placeholder:text-[var(--muted)] font-bold text-base md:text-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Products Table */}
            <div className="bg-[var(--card)] rounded-[24px] md:rounded-[32px] border border-[var(--border)] shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 mb-6 transition-colors duration-300">
                <div className="overflow-x-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse min-w-[650px]">
                        <thead className="sticky top-0 z-10 bg-[var(--input)] border-b border-[var(--border)] shadow-sm">
                            <tr className="text-[var(--muted)] text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="px-2 md:px-8 py-1.5 md:py-3 text-[9px] md:text-[10px]">PRODUCT DETAILS</th>
                                <th className="px-2 md:px-8 py-1.5 md:py-3 text-[9px] md:text-[10px]">CATEGORY</th>
                                <th className="px-2 md:px-8 py-1.5 md:py-3 text-[9px] md:text-[10px] text-center">PRICE</th>
                                <th className="px-2 md:px-8 py-1.5 md:py-3 text-[9px] md:text-[10px] text-center">STOCK INFO</th>
                                <th className="px-2 md:px-8 py-1.5 md:py-3 text-[9px] md:text-[10px] text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {currentItems.map(product => (
                                <tr key={product._id} className="bg-[var(--card)] hover:bg-[var(--input)]/50 transition-all">
                                    <td className="px-2 md:px-8 py-2 md:py-4">
                                        <div className="flex items-center gap-1.5 md:gap-4">
                                            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[var(--input)] flex items-center justify-center text-[var(--muted)] shadow-sm border border-[var(--border)] shrink-0">
                                                <Package size={14} md:size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black text-[var(--foreground)] text-[11px] md:text-[15px] truncate leading-tight">{product.name}</div>
                                                <div className="text-[8px] md:text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5 truncate">{product.brand || '---'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 md:px-8 py-2 md:py-4">
                                        <span className="px-1.5 py-0.5 md:px-3 md:py-1.5 bg-[var(--input)] text-[var(--secondary)] rounded-md text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-[var(--border)]">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-2 md:px-8 py-2 md:py-4 text-center">
                                        <div className="font-black text-[var(--foreground)] text-[13px] md:text-base">₹{product.sellingPrice}</div>
                                        <div className="text-[7px] md:text-[8px] font-black text-[var(--muted)] uppercase tracking-tighter">MRP</div>
                                    </td>
                                    <td className="px-2 md:px-8 py-2 md:py-4 text-center">
                                        <div className={`font-black text-[13px] md:text-base ${product.stockQuantity <= (product.minStockLevel || 10) ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {product.stockQuantity} <span className="text-[8px] md:text-[10px] uppercase opacity-50">{product.unit}</span>
                                        </div>
                                        <div className="text-[7px] md:text-[8px] font-black text-[var(--muted)] uppercase tracking-tighter">Current Level</div>
                                    </td>
                                    <td className="px-2 md:px-8 py-2 md:py-4">
                                        <div className="flex items-center justify-end gap-1.5 md:gap-3">
                                            <button
                                                onClick={() => { setEditingProduct(product); setFormData(product); setShowModal(true); }}
                                                className="p-1.5 md:p-2.5 bg-blue-500/10 text-blue-500 rounded-lg md:rounded-xl hover:bg-blue-500/20 active:scale-95 transition-all border border-blue-500/20"
                                            >
                                                <Edit3 size={14} md:size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(product._id)}
                                                className="p-1.5 md:p-2.5 bg-rose-500/10 text-rose-500 rounded-lg md:rounded-xl hover:bg-rose-500/20 active:scale-95 transition-all border border-rose-500/20"
                                            >
                                                <Trash2 size={14} md:size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-40">
                    <div className="inline-flex p-10 bg-[var(--input)] rounded-[40px] border border-[var(--border)] mb-6 text-[var(--muted)]">
                        <Package size={80} strokeWidth={1} />
                    </div>
                    <h3 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tight">Vault is Empty</h3>
                    <p className="text-[var(--muted)] font-bold mt-2 uppercase text-[10px] tracking-widest">Add your first product to see it here</p>
                </div>
            )}

            {/* Pagination Controls */}
            {filteredProducts.length > itemsPerPage && (
                <div className="flex items-center justify-between p-4 bg-[var(--card)] rounded-[20px] border border-[var(--border)] shadow-sm">
                    <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-[var(--secondary)] bg-[var(--input)] rounded-xl hover:bg-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Prev
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => paginate(i + 1)}
                                className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all ${currentPage === i + 1
                                    ? 'bg-[var(--foreground)] text-[var(--background)] shadow-lg scale-110'
                                    : 'bg-[var(--input)] text-[var(--secondary)] hover:bg-[var(--background)]'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-[var(--secondary)] bg-[var(--input)] rounded-xl hover:bg-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Product Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[var(--card)] w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300 border border-[var(--border)] transition-colors duration-300">
                        {/* Modal Header */}
                        <div className="px-10 py-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)] z-10">
                            <div>
                                <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight uppercase">
                                    {editingProduct ? 'Update Product' : 'Add New Product'}
                                </h3>
                                <p className="text-[var(--muted)] text-[11px] font-bold uppercase tracking-widest mt-1">
                                    {editingProduct ? 'Edit existing product details' : 'Enter details for the new product'}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2.5 hover:bg-[var(--input)] rounded-full transition-all text-[var(--muted)] hover:text-rose-500 active:scale-95">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-[var(--background)]/50 custom-scrollbar">
                            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {/* Left Column: Basic & Classification */}
                                <div className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2.5">
                                            <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Product Name <span className="text-rose-500">*</span></label>
                                            <input
                                                required
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-[var(--foreground)] font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-[var(--muted)] text-sm"
                                                placeholder="e.g. Amul Milk"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Brand</label>
                                                <input
                                                    name="brand"
                                                    value={formData.brand}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-[var(--foreground)] font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-[var(--muted)] text-sm"
                                                    placeholder="e.g. Amul"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Barcode</label>
                                                <input
                                                    name="barcode"
                                                    value={formData.barcode}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-[var(--foreground)] font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-[var(--muted)] text-sm"
                                                    placeholder="Scan Barcode"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Category <span className="text-rose-500">*</span></label>
                                                <button type="button" onClick={() => setShowCategoryModal(true)} className="text-[9px] font-black text-primary uppercase tracking-widest hover:text-primary transition-colors bg-primary/10 px-2.5 py-1 rounded-lg">
                                                    + NEW
                                                </button>
                                            </div>
                                            <div className="relative group">
                                                <select
                                                    required
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-[var(--foreground)] font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer text-sm"
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]">
                                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Unit</label>
                                                <input
                                                    name="unit"
                                                    value={formData.unit}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-[var(--foreground)] font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-[var(--muted)] text-sm"
                                                    placeholder="Packet"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Supplier</label>
                                                <input
                                                    name="supplier"
                                                    value={formData.supplier}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-[var(--foreground)] font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-[var(--muted)] text-sm"
                                                    placeholder="e.g. Amul Distributor"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Pricing & Inventory */}
                                <div className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Cost Price <span className="text-rose-500">*</span></label>
                                                <input
                                                    required
                                                    type="number"
                                                    name="costPrice"
                                                    value={formData.costPrice}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-[var(--foreground)] font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-[var(--muted)] text-sm"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Selling Price <span className="text-rose-500">*</span></label>
                                                <input
                                                    required
                                                    type="number"
                                                    name="sellingPrice"
                                                    value={formData.sellingPrice}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-[var(--foreground)] font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-[var(--muted)] text-sm"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">GST %</label>
                                                <input
                                                    type="number"
                                                    name="gstPercent"
                                                    value={formData.gstPercent}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-[var(--foreground)] font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-[var(--muted)] text-sm"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">GST Type</label>
                                                <div
                                                    className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 px-6 flex items-center justify-between cursor-pointer group hover:border-primary/50 transition-all"
                                                    onClick={() => setFormData(prev => ({ ...prev, gstType: prev.gstType === 'Inclusive' ? 'Exclusive' : 'Inclusive' }))}
                                                >
                                                    <span className={`text-[11px] font-black transition-colors uppercase ${formData.gstType === 'Inclusive' ? 'text-primary' : 'text-[var(--muted)]'}`}>Inc</span>
                                                    <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${formData.gstType === 'Inclusive' ? 'bg-primary' : 'bg-[var(--border)]'}`}>
                                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData.gstType === 'Inclusive' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                                    </div>
                                                    <span className={`text-[11px] font-black transition-colors uppercase ${formData.gstType === 'Exclusive' ? 'text-primary' : 'text-[var(--muted)]'}`}>Exc</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Current Stock <span className="text-rose-500">*</span></label>
                                                <input
                                                    required
                                                    type="number"
                                                    name="stockQuantity"
                                                    value={formData.stockQuantity}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-[var(--foreground)] font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-[var(--muted)] text-sm"
                                                    placeholder="100"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Min Level</label>
                                                <input
                                                    type="number"
                                                    name="minStockLevel"
                                                    value={formData.minStockLevel}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-[var(--foreground)] font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-[var(--muted)] text-sm"
                                                    placeholder="10"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Expiry Date <span className="text-rose-500">*</span></label>
                                                <input
                                                    required
                                                    type="date"
                                                    name="expiryDate"
                                                    value={formData.expiryDate ? formData.expiryDate.split('T')[0] : ''}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-[var(--foreground)] font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm uppercase"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Batch No.</label>
                                                <input
                                                    name="batchNo"
                                                    value={formData.batchNo}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-[var(--foreground)] font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-[var(--muted)] text-sm uppercase"
                                                    placeholder="BATCH-001"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="px-10 py-8 border-t border-[var(--border)] bg-[var(--card)] flex gap-6 sticky bottom-0 z-10 transition-colors duration-300">
                                <button type="button" onClick={() => setShowModal(false)} className="px-10 py-4 bg-[var(--input)] text-[var(--muted)] font-black rounded-2xl hover:bg-[var(--background)] transition-all uppercase tracking-widest text-xs active:scale-95 border border-[var(--border)]">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all uppercase tracking-widest text-sm shadow-xl shadow-primary/20 active:scale-[0.98]">
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[var(--card)] w-full max-w-sm rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-300 border border-[var(--border)]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tight">Add Category</h3>
                            <button onClick={() => setShowCategoryModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[var(--muted)] uppercase tracking-widest ml-1">Category Name</label>
                                <input
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full bg-[var(--input)] border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold placeholder:text-[var(--muted)]"
                                    placeholder="e.g. Beverages"
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={handleAddCategory}
                                className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95"
                            >
                                Save Category
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .input-field-new {
                    @apply w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl py-4 px-6 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold placeholder:text-[var(--muted)] text-sm;
                }
                .input-field-modal {
                    @apply w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl py-3 px-4 text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold placeholder:text-[var(--muted)] text-sm;
                }
            ` }} />
            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone and will remove it from inventory records."
                confirmText="Delete Product"
                isDangerous={true}
            />
        </div>
    );
};

export default Products;
