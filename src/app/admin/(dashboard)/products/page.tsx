'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(id: string, is_active: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !is_active }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product? If it has past orders it will be hidden instead.')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">Add Product</Link>
      </div>

      {loading ? (
        <p className="text-sm text-charcoal">Loading…</p>
      ) : (
        <div className="card-lp overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-rose-100 text-left text-xs text-charcoal">
                <th className="p-3">Name</th>
                <th className="p-3">Price</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-rose-50">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{formatINR(p.price)}</td>
                  <td className="p-3">{p.category || '—'}</td>
                  <td className="p-3">{p.is_active ? 'Active' : 'Hidden'}</td>
                  <td className="space-x-3 p-3 whitespace-nowrap">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-rose-700 underline">Edit</Link>
                    <button onClick={() => toggleActive(p.id, p.is_active)} className="text-charcoal underline">
                      {p.is_active ? 'Hide' : 'Unhide'}
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
