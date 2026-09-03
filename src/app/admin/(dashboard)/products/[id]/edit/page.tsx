'use client';

import { useEffect, useState } from 'react';
import ProductForm, { ProductFormValue } from '@/components/admin/ProductForm';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [initial, setInitial] = useState<ProductFormValue | null>(null);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data.product;
        setInitial({
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description,
          category: p.category || '',
          is_personalized: p.is_personalized,
          is_active: p.is_active,
          customization_fields: (p.customization_fields || []).map((f: any) => ({
            id: f.id,
            field_type: f.field_type,
            label: f.label,
            is_required: f.is_required,
            max_photos: f.max_photos || 1,
          })),
          images: (p.images || []).map((img: any) => ({
            storage_path: img.storage_path,
            url: img.url,
          })),
        });
      });
  }, [params.id]);

  return (
    <div>
      <h1 className="mb-5 font-display text-xl font-semibold text-ink">Edit Product</h1>
      {initial ? <ProductForm initial={initial} /> : <p className="text-sm text-charcoal">Loading…</p>}
    </div>
  );
}
