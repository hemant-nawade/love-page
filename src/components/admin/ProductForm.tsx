'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface FieldRow {
  id?: string;
  field_type: 'photo' | 'text' | 'name' | 'date' | 'note';
  label: string;
  is_required: boolean;
  max_photos: number;
}

interface ImageRow {
  storage_path: string;
  url?: string;
}

export interface ProductFormValue {
  id?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  is_personalized: boolean;
  is_active: boolean;
  customization_fields: FieldRow[];
  images: ImageRow[];
}

export default function ProductForm({ initial }: { initial?: ProductFormValue }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name || '');
  const [price, setPrice] = useState(initial?.price?.toString() || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [isPersonalized, setIsPersonalized] = useState(initial?.is_personalized ?? true);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [fields, setFields] = useState<FieldRow[]>(initial?.customization_fields || []);
  const [images, setImages] = useState<ImageRow[]>(initial?.images || []);

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((data) => {
        const cats = (data.products || [])
          .map((p: any) => p.category)
          .filter((c: string | null): c is string => !!c);
        setExistingCategories(Array.from(new Set<string>(cats)).sort());
      })
      .catch(() => {});
  }, []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addField() {
    setFields((f) => [...f, { field_type: 'text', label: '', is_required: false, max_photos: 1 }]);
  }
  function updateField(i: number, patch: Partial<FieldRow>) {
    setFields((f) => f.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function removeField(i: number) {
    setFields((f) => f.filter((_, idx) => idx !== i));
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setImages((prev) => [...prev, { storage_path: data.storage_path, url: data.url }]);
      }
    } catch (e: any) {
      setError(e.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(i: number) {
    setImages((imgs) => imgs.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setError(null);
    if (!name.trim() || !price) {
      setError('Name and price are required.');
      return;
    }
    setSaving(true);
    const payload = {
      name,
      price: parseFloat(price),
      description,
      category: category || undefined,
      is_personalized: isPersonalized,
      is_active: isActive,
      customization_fields: fields.map((f, i) => ({ ...f, sort_order: i })),
      image_storage_paths: images.map((img) => img.storage_path),
    };

    try {
      const res = await fetch(initial?.id ? `/api/admin/products/${initial.id}` : '/api/admin/products', {
        method: initial?.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save product.');
      router.push('/admin/products');
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card-lp space-y-3 p-5">
        <p className="text-sm font-semibold text-ink">Product Details</p>
        <input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-rose-200 px-3 py-2.5 text-sm" />
        <input placeholder="Price (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-rose-200 px-3 py-2.5 text-sm" />
        <textarea placeholder="Description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-rose-200 px-3 py-2.5 text-sm" />
        <div>
          <input
            list="category-options"
            placeholder="Category — pick existing or type a new one"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-rose-200 px-3 py-2.5 text-sm"
          />
          <datalist id="category-options">
            {existingCategories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
          {existingCategories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {existingCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`icon-btn rounded-full px-3 py-1 text-xs font-medium ${
                    category === cat ? 'bg-ink text-cream' : 'bg-rose-50 text-charcoal hover:bg-rose-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm text-charcoal">
            <input type="checkbox" checked={isPersonalized} onChange={(e) => setIsPersonalized(e.target.checked)} /> Personalized product
          </label>
          <label className="flex items-center gap-2 text-sm text-charcoal">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active (visible on site)
          </label>
        </div>
      </div>

      <div className="card-lp space-y-3 p-5">
        <p className="text-sm font-semibold text-ink">Product Images</p>
        <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e.target.files)} className="text-sm" />
        {uploading && <p className="text-xs text-charcoal">Uploading…</p>}
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-rose-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button onClick={() => removeImage(i)} className="absolute right-0 top-0 rounded-bl bg-black/60 px-1 text-xs text-white">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card-lp space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Personalization Fields</p>
          <button onClick={addField} className="text-sm font-medium text-rose-700 underline">+ Add Field</button>
        </div>
        {fields.map((field, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 rounded-lg border border-rose-100 p-3 sm:grid-cols-5 sm:items-center">
            <select value={field.field_type} onChange={(e) => updateField(i, { field_type: e.target.value as FieldRow['field_type'] })} className="rounded-lg border border-rose-200 px-2 py-2 text-sm">
              <option value="photo">Photo Upload</option>
              <option value="text">Custom Text</option>
              <option value="name">Name</option>
              <option value="date">Date</option>
              <option value="note">Special Instructions</option>
            </select>
            <input placeholder="Label" value={field.label} onChange={(e) => updateField(i, { label: e.target.value })} className="rounded-lg border border-rose-200 px-2 py-2 text-sm sm:col-span-2" />
            {field.field_type === 'photo' && (
              <input type="number" min={1} max={10} placeholder="Max photos" value={field.max_photos} onChange={(e) => updateField(i, { max_photos: parseInt(e.target.value) || 1 })} className="rounded-lg border border-rose-200 px-2 py-2 text-sm" />
            )}
            <label className="flex items-center gap-1.5 text-xs text-charcoal">
              <input type="checkbox" checked={field.is_required} onChange={(e) => updateField(i, { is_required: e.target.checked })} /> Required
            </label>
            <button onClick={() => removeField(i)} className="text-xs font-medium text-red-600 underline">Remove</button>
          </div>
        ))}
        {fields.length === 0 && <p className="text-xs text-charcoal">No personalization fields yet — add one if this product needs photos, text, etc.</p>}
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
        {saving ? 'Saving…' : 'Save Product'}
      </button>
    </div>
  );
}