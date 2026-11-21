"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Package,
  Search,
  Download,
  Plus,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  X,
  Filter,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { exportToCsv } from "@/lib/csv";
import { toast } from "sonner";

interface InventoryRow {
  sku: string;
  name: string;
  category: string;
  brand: string;
  qty: number;
  reserved: number;
  price: number;
  warehouse: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryRow[]>([
    {
      sku: "SP-HEL-545",
      name: "Helios Pro 545 W Mono PERC",
      category: "Solar panels",
      brand: "SunPeak Energy",
      qty: 8,
      reserved: 7,
      price: 15800,
      warehouse: "Pune Main",
      status: "low_stock",
    },
    {
      sku: "SP-HEL-450",
      name: "Helios 450 W Mono PERC",
      category: "Solar panels",
      brand: "SunPeak Energy",
      qty: 64,
      reserved: 18,
      price: 13200,
      warehouse: "Pune Main",
      status: "in_stock",
    },
    {
      sku: "INV-VW-5S",
      name: "SolarWave 5 kW 1φ On-grid",
      category: "Inverters",
      brand: "VoltWave Tech",
      qty: 14,
      reserved: 3,
      price: 48500,
      warehouse: "Pune Main",
      status: "in_stock",
    },
    {
      sku: "INV-VW-10T",
      name: "SolarWave 10 kW 3φ On-grid",
      category: "Inverters",
      brand: "VoltWave Tech",
      qty: 6,
      reserved: 2,
      price: 92000,
      warehouse: "Mumbai Depot",
      status: "in_stock",
    },
    {
      sku: "INV-VW-5H",
      name: "SolarWave 5 kW Hybrid",
      category: "Inverters",
      brand: "VoltWave Tech",
      qty: 4,
      reserved: 2,
      price: 78000,
      warehouse: "Pune Main",
      status: "low_stock",
    },
    {
      sku: "INV-VW-36",
      name: "SolarWave 3.6 kW 1φ On-grid",
      category: "Inverters",
      brand: "VoltWave Tech",
      qty: 0,
      reserved: 0,
      price: 41000,
      warehouse: "Pune Main",
      status: "out_of_stock",
    },
    {
      sku: "BAT-TV-5K",
      name: "TerraVault 5.12 kWh LFP",
      category: "Batteries",
      brand: "TerraVault",
      qty: 9,
      reserved: 2,
      price: 96000,
      warehouse: "Mumbai Depot",
      status: "in_stock",
    },
    {
      sku: "MT-RT-3K",
      name: "GI Elevated Mount — 3 kW kit",
      category: "Mounting structures",
      brand: "RoofTech",
      qty: 22,
      reserved: 4,
      price: 15000,
      warehouse: "Pune Main",
      status: "in_stock",
    },
    {
      sku: "CB-SC-4DC",
      name: "DC Solar Cable 4 mm² (100 m)",
      category: "Cables",
      brand: "SolarCab",
      qty: 35,
      reserved: 10,
      price: 4500,
      warehouse: "Pune Main",
      status: "in_stock",
    },
    {
      sku: "PR-SG-KIT",
      name: "ACDB + DCDB protection kit",
      category: "Protection devices",
      brand: "SafeGrid",
      qty: 18,
      reserved: 5,
      price: 7800,
      warehouse: "Pune Main",
      status: "in_stock",
    },
    {
      sku: "AC-SG-EAR",
      name: "Earthing & LA kit (3 pits)",
      category: "Accessories",
      brand: "SafeGrid",
      qty: 11,
      reserved: 4,
      price: 6500,
      warehouse: "Mumbai Depot",
      status: "in_stock",
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStock, setNewStock] = useState({
    sku: "",
    name: "",
    category: "Solar panels",
    brand: "",
    qty: 10,
    price: 15000,
    warehouse: "Pune Main",
  });

  const totalStockVal = inventory.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );
  const lowStockCount = inventory.filter((i) => i.status === "low_stock").length;
  const outOfStockCount = inventory.filter((i) => i.status === "out_of_stock").length;

  const filtered = inventory.filter((item) => {
    const matchesSearch = (item.sku + " " + item.name + " " + item.brand)
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCat =
      selectedCat === "all" || item.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStock.sku || !newStock.name) return;

    const row: InventoryRow = {
      sku: newStock.sku,
      name: newStock.name,
      category: newStock.category,
      brand: newStock.brand || "SolarWave",
      qty: Number(newStock.qty),
      reserved: 0,
      price: Number(newStock.price),
      warehouse: newStock.warehouse,
      status: Number(newStock.qty) > 5 ? "in_stock" : "low_stock",
    };

    setInventory([row, ...inventory]);
    setShowAddModal(false);
    toast.success(`SKU ${newStock.sku} added to inventory!`);
  };

  const handleExportCsv = () => {
    exportToCsv("solaros-inventory", [
      { key: "sku", label: "SKU" },
      { key: "name", label: "Product Name" },
      { key: "category", label: "Category" },
      { key: "brand", label: "Brand" },
      { key: "qty", label: "Total Qty" },
      { key: "reserved", label: "Reserved" },
      { key: "price", label: "Unit Price (INR)" },
      { key: "warehouse", label: "Warehouse" },
      { key: "status", label: "Status" },
    ], inventory);
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Inventory & Warehouse
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Multi-warehouse tracking of modules, inverters, racking and BOS items with real-time reservation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5] transition-colors"
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors shadow-sm"
            >
              <Plus className="size-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Total SKUs
            </span>
            <div className="text-2xl font-bold text-ink mt-1">{inventory.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Across all categories</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Total Stock Value
            </span>
            <div className="text-2xl font-bold text-forest mt-1">
              ₹{(totalStockVal / 100000).toFixed(2)} L
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Inventory valuation</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Low Stock Alert
            </span>
            <div className="text-2xl font-bold text-[#D9A441] mt-1">{lowStockCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Below reorder trigger</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Out of Stock
            </span>
            <div className="text-2xl font-bold text-danger mt-1">{outOfStockCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Reorder required</div>
          </div>
        </div>

        {/* Inventory Table with Category Filters */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-lg">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search SKU, product, brand..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs focus:outline-none focus:border-forest"
                />
              </div>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="h-9 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-forest"
              >
                <option value="all">All categories</option>
                <option value="Solar panels">Solar panels</option>
                <option value="Inverters">Inverters</option>
                <option value="Batteries">Batteries</option>
                <option value="Mounting structures">Mounting structures</option>
                <option value="Cables">Cables</option>
                <option value="Protection devices">Protection devices</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div className="text-xs text-muted-foreground">
              {filtered.length} products listed
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Brand</th>
                  <th className="py-2.5 px-3 text-right">Total Qty</th>
                  <th className="py-2.5 px-3 text-right">Reserved</th>
                  <th className="py-2.5 px-3 text-right">Available</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3">Warehouse</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((item) => {
                  const available = Math.max(0, item.qty - item.reserved);
                  return (
                    <tr key={item.sku} className="hover:bg-[#F7F8F5] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-ink">{item.sku}</td>
                      <td className="py-2.5 px-3 font-semibold text-ink">{item.name}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{item.category}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{item.brand}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{item.qty}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#D9A441]">
                        {item.reserved}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-forest">
                        {available}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        ₹{item.price.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{item.warehouse}</td>
                      <td className="py-2.5 px-3 text-right">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="w-full max-w-md bg-white rounded-2xl border border-border p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-base font-semibold text-ink">Add Inventory Item</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-[#F7F8F5]"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleAddStock} className="space-y-3 text-xs">
                <div>
                  <label className="font-medium text-ink block mb-1">SKU *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. SP-HEL-600"
                    value={newStock.sku}
                    onChange={(e) => setNewStock({ ...newStock, sku: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-ink block mb-1">Product Description *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Helios Ultra 600 W Bifacial"
                    value={newStock.name}
                    onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-ink block mb-1">Category</label>
                    <select
                      value={newStock.category}
                      onChange={(e) => setNewStock({ ...newStock, category: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-forest"
                    >
                      <option>Solar panels</option>
                      <option>Inverters</option>
                      <option>Batteries</option>
                      <option>Mounting structures</option>
                      <option>Cables</option>
                      <option>Protection devices</option>
                      <option>Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-medium text-ink block mb-1">Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. SunPeak Energy"
                      value={newStock.brand}
                      onChange={(e) => setNewStock({ ...newStock, brand: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-ink block mb-1">Quantity</label>
                    <input
                      type="number"
                      value={newStock.qty}
                      onChange={(e) => setNewStock({ ...newStock, qty: Number(e.target.value) })}
                      className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-ink block mb-1">Unit Price (₹)</label>
                    <input
                      type="number"
                      value={newStock.price}
                      onChange={(e) => setNewStock({ ...newStock, price: Number(e.target.value) })}
                      className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 h-9 rounded-xl border border-border text-xs font-medium text-ink hover:bg-[#F7F8F5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 h-9 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 shadow-sm"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
