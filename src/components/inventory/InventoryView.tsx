import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  ArrowUpDown,
  Building2,
  Truck,
  History,
  CheckCircle2,
  X
} from 'lucide-react';
import { ProductInventory, Warehouse, InventoryTransaction } from '../../types';

export const InventoryView: React.FC = () => {
  const { showToast } = useApp();
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'warehouses' | 'logs'>('products');

  // Adjust stock modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState(5);
  const [adjustNotes, setAdjustNotes] = useState('Stock delivery from Nairobi Industrial Area supplier');

  // Add Product Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<{
    sku: string;
    name: string;
    description: string;
    category: string;
    costPrice: number;
    sellingPrice: number;
    stockQuantity: number;
    minStockLevel: number;
  }>({
    sku: '',
    name: '',
    description: '',
    category: 'HVAC Parts',
    costPrice: 2500,
    sellingPrice: 4200,
    stockQuantity: 10,
    minStockLevel: 3,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, wList, tList] = await Promise.all([
        api.getProducts(),
        api.getWarehouses(),
        api.getInventoryTransactions(),
      ]);
      setProducts(pList);
      setWarehouses(wList);
      setTransactions(tList);
      if (pList.length > 0 && !adjustProductId) setAdjustProductId(pList[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId) return;
    try {
      await api.adjustInventory({
        productId: adjustProductId,
        quantity: Number(adjustQty),
        notes: adjustNotes,
      });
      showToast('Stock quantity updated and transaction logged', 'success');
      setAdjustModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to adjust stock', 'error');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.sku || !newProduct.name) {
      showToast('Please provide SKU and item name', 'error');
      return;
    }

    try {
      await api.createProduct({
        ...newProduct,
        costPrice: Number(newProduct.costPrice),
        sellingPrice: Number(newProduct.sellingPrice),
        stockQuantity: Number(newProduct.stockQuantity),
        minStockLevel: Number(newProduct.minStockLevel),
      });
      showToast('New product added to catalog', 'success');
      setProductModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to add product', 'error');
    }
  };

  const lowStockItems = products.filter(p => p.stockQuantity <= p.minStockLevel);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-[#0F172A]">Inventory & Van Stock</h1>
            {lowStockItems.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {lowStockItems.length} Low Stock Alert
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Central stores, mobile van inventories, automated job deductions, and reorder levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdjustModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <ArrowUpDown className="w-4 h-4 text-slate-600" />
            Adjust Stock (+/-)
          </button>
          <button
            onClick={() => setProductModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#14B8A6] hover:bg-[#0D9488] rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Part / Material
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveSubTab('products')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeSubTab === 'products' ? 'bg-[#0F172A] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Parts Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveSubTab('warehouses')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeSubTab === 'warehouses' ? 'bg-[#0F172A] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Warehouses & Vans ({warehouses.length})
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeSubTab === 'logs' ? 'bg-[#0F172A] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Stock Audit Logs ({transactions.length})
        </button>
      </div>

      {/* View 1: Products */}
      {activeSubTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Part / Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Cost Price (KES)</th>
                  <th className="py-3 px-4">Selling Price (KES)</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => {
                  const isLow = p.stockQuantity <= p.minStockLevel;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.sku}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{p.description}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        KES {p.costPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        KES {p.sellingPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 w-max'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3 text-amber-700" />}
                          {p.stockQuantity} in stock (min: {p.minStockLevel})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setAdjustProductId(p.id);
                            setAdjustModalOpen(true);
                          }}
                          className="text-teal-600 hover:text-teal-700 font-semibold"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Warehouses */}
      {activeSubTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map(w => (
            <div key={w.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-800">
                  {w.isMobile ? <Truck className="w-5 h-5 text-teal-600" /> : <Building2 className="w-5 h-5 text-slate-700" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{w.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {w.isMobile ? 'Technician Mobile Van' : 'Central Depot'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500">{w.address}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Inventory Status:</span>
                <span className="text-emerald-600 font-bold">Synchronized</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 3: Logs */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(t.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{t.productId}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          t.type === 'in'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {t.type === 'in' ? `+${t.quantity}` : `-${t.quantity}`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{t.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-[#0F172A]">Stock Adjustment</h3>
              <button onClick={() => setAdjustModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Product</label>
                <select
                  value={adjustProductId}
                  onChange={e => setAdjustProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) - Current Stock: {p.stockQuantity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Adjustment Quantity (positive to add, negative to deduct)
                </label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={e => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Reason / Notes</label>
                <input
                  type="text"
                  required
                  value={adjustNotes}
                  onChange={e => setAdjustNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#14B8A6] text-white font-bold rounded-lg"
                >
                  Apply Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-[#0F172A]">Add Catalog Product / Material</h3>
              <button onClick={() => setProductModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ELEC-CB-32A"
                    value={newProduct.sku}
                    onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Part / Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 32A Double Pole Circuit Breaker (Schneider)"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost Price (KES)</label>
                  <input
                    type="number"
                    value={newProduct.costPrice}
                    onChange={e => setNewProduct({ ...newProduct, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (KES)</label>
                  <input
                    type="number"
                    value={newProduct.sellingPrice}
                    onChange={e => setNewProduct({ ...newProduct, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Opening Stock</label>
                  <input
                    type="number"
                    value={newProduct.stockQuantity}
                    onChange={e => setNewProduct({ ...newProduct, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Reorder Level</label>
                  <input
                    type="number"
                    value={newProduct.minStockLevel}
                    onChange={e => setNewProduct({ ...newProduct, minStockLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#14B8A6] text-white font-bold rounded-lg shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
