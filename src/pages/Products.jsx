import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Edit3, AlertTriangle, X, Package, Tag, Hash, IndianRupee, Percent, Layers, Calendar, Truck, AlertCircle, Bookmark, Upload, FileText } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                toast.error('Failed to delete product');
            }
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
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Inventory</h2>
                    <p className="text-slate-500 mt-1 font-medium">Manage and monitor your store products.</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                    >
                        <Upload size={18} />
                        Import CSV
                    </button>
                    <button
                        onClick={() => { setShowModal(true); setEditingProduct(null); resetForm(); }}
                        className="px-6 py-3 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-xl shadow-primary/30 active:scale-95"
                    >
                        <Plus size={20} />
                        Add Product
                    </button>
                </div>
            </div>

            <div className="glass-card p-5 flex items-center gap-4 bg-white shadow-sm border-slate-200">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name, category or barcode..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 font-bold text-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-20">
                <div className="overflow-x-auto max-h-[calc(100vh-320px)] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100 shadow-sm">
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="px-8 py-5">PRODUCT DETAILS</th>
                                <th className="px-8 py-5">CATEGORY</th>
                                <th className="px-8 py-5 text-center">PRICE</th>
                                <th className="px-8 py-5 text-center">STOCK INFO</th>
                                <th className="px-8 py-5 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {currentItems.map(product => (
                                <tr key={product._id} className="border-b border-slate-50 bg-white">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 text-base">{product.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{product.brand || '---'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200/50">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="font-black text-slate-900 text-lg">₹{product.sellingPrice}</div>
                                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">MRP</div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className={`font-black text-lg ${product.stockQuantity <= (product.minStockLevel || 10) ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {product.stockQuantity} <span className="text-[10px] uppercase opacity-50">{product.unit}</span>
                                        </div>
                                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Current Level</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => { setEditingProduct(product); setFormData(product); setShowModal(true); }}
                                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 active:scale-95 transition-all shadow-sm border border-blue-100"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 active:scale-95 transition-all shadow-sm border border-rose-100"
                                            >
                                                <Trash2 size={18} />
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
                    <div className="inline-flex p-10 bg-slate-50 rounded-[40px] border border-slate-100 mb-6 text-slate-300">
                        <Package size={80} strokeWidth={1} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Vault is Empty</h3>
                    <p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-widest">Add your first product to see it here</p>
                </div>
            )}

            {/* Pagination Controls */}
            {filteredProducts.length > itemsPerPage && (
                <div className="flex items-center justify-between p-4 bg-white rounded-[20px] border border-slate-100 shadow-sm">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-50 rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Prev
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => paginate(i + 1)}
                                className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all ${currentPage === i + 1
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-110'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-50 rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Product Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300 border border-slate-100">
                        {/* Modal Header */}
                        <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                    {editingProduct ? 'Update Product' : 'Add New Product'}
                                </h3>
                                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                                    {editingProduct ? 'Edit existing product details' : 'Enter details for the new product'}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2.5 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-rose-500 active:scale-95">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-slate-50/50">
                            <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-8">
                                    {/* Basic Information Section */}
                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Package size={20} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Basic Information</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Product Identification</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name <span className="text-rose-500">*</span></label>
                                                <div className="relative group">
                                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                    <input
                                                        required
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 text-sm"
                                                        placeholder="e.g. Amul Milk"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand</label>
                                                    <div className="relative group">
                                                        <Bookmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                        <input
                                                            name="brand"
                                                            value={formData.brand}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 text-sm"
                                                            placeholder="e.g. Amul"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Barcode</label>
                                                    <div className="relative group">
                                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                        <input
                                                            name="barcode"
                                                            value={formData.barcode}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 text-sm"
                                                            placeholder="Scan Barcode"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Classification Section */}
                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Layers size={20} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Classification</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Category & Organization</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Category <span className="text-rose-500">*</span></label>
                                                    <button type="button" onClick={() => setShowCategoryModal(true)} className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-600 transition-colors bg-indigo-50 px-2 py-1 rounded-lg">
                                                        + NEW
                                                    </button>
                                                </div>
                                                <div className="relative group">
                                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                                    <select
                                                        required
                                                        name="category"
                                                        value={formData.category}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer text-sm"
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                                                    <div className="relative group">
                                                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                                        <input
                                                            name="unit"
                                                            value={formData.unit}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 text-sm"
                                                            placeholder="Packet"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier</label>
                                                    <div className="relative group">
                                                        <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                                        <input
                                                            name="supplier"
                                                            value={formData.supplier}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 text-sm"
                                                            placeholder="e.g. Amul Distributor"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-8">
                                    {/* Pricing & Taxation Section */}
                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <IndianRupee size={20} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Pricing & Taxation</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Financial Details</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Cost Price <span className="text-rose-500">*</span></label>
                                                <div className="relative group">
                                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                                    <input
                                                        required
                                                        type="number"
                                                        name="costPrice"
                                                        value={formData.costPrice}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300 text-sm"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Selling Price <span className="text-rose-500">*</span></label>
                                                <div className="relative group">
                                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                                    <input
                                                        required
                                                        type="number"
                                                        name="sellingPrice"
                                                        value={formData.sellingPrice}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300 text-sm"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">GST %</label>
                                                <div className="relative group">
                                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                                    <input
                                                        type="number"
                                                        name="gstPercent"
                                                        value={formData.gstPercent}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300 text-sm"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Type</label>
                                                <div
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 flex items-center justify-between cursor-pointer group hover:border-emerald-500/50 transition-all"
                                                    onClick={() => setFormData(prev => ({ ...prev, gstType: prev.gstType === 'Inclusive' ? 'Exclusive' : 'Inclusive' }))}
                                                >
                                                    <span className={`text-sm font-bold transition-colors ${formData.gstType === 'Inclusive' ? 'text-emerald-600' : 'text-slate-400'}`}>Inclusive</span>
                                                    <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${formData.gstType === 'Inclusive' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData.gstType === 'Inclusive' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                                    </div>
                                                    <span className={`text-sm font-bold transition-colors ${formData.gstType === 'Exclusive' ? 'text-emerald-600' : 'text-slate-400'}`}>Exclusive</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inventory & Batch Section */}
                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                                <Calendar size={20} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Inventory & Batch</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Stock Management</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Stock <span className="text-rose-500">*</span></label>
                                                <div className="relative group">
                                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={18} />
                                                    <input
                                                        required
                                                        type="number"
                                                        name="stockQuantity"
                                                        value={formData.stockQuantity}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-300 text-sm"
                                                        placeholder="100"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Stock Level</label>
                                                <div className="relative group">
                                                    <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={18} />
                                                    <input
                                                        type="number"
                                                        name="minStockLevel"
                                                        value={formData.minStockLevel}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-300 text-sm"
                                                        placeholder="10"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date <span className="text-rose-500">*</span></label>
                                                <div className="relative group">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={18} />
                                                    <input
                                                        required
                                                        type="date"
                                                        name="expiryDate"
                                                        value={formData.expiryDate ? formData.expiryDate.split('T')[0] : ''}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all text-sm uppercase"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch Number</label>
                                                <div className="relative group">
                                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={18} />
                                                    <input
                                                        name="batchNo"
                                                        value={formData.batchNo}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-300 text-sm uppercase"
                                                        placeholder="e.g. BATCH-001"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="p-8 border-t border-slate-100 bg-white flex gap-6 sticky bottom-0 z-10">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 bg-slate-50 text-slate-500 font-black rounded-3xl hover:bg-slate-100 transition-all uppercase tracking-[0.2em] text-xs active:scale-95 shadow-sm border border-slate-100">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-[2] py-5 bg-primary text-white font-bold rounded-3xl hover:bg-primary/90 transition-all uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 active:scale-[0.98] animate-in slide-in-from-bottom-4 duration-500">
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Add Category</h3>
                            <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category Name</label>
                                <input
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
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
                    @apply w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold placeholder:text-slate-300 text-sm;
                }
                .input-field-modal {
                    @apply w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold placeholder:text-slate-300 text-sm;
                }
            ` }} />
        </div>
    );
};

export default Products;
