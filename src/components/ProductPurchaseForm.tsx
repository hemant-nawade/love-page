'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Truck, CreditCard, Heart } from 'lucide-react';
import { useCart } from './CartProvider';
import { formatINR } from '@/lib/utils';
import type { CustomizationField, ProductImage } from '@/types';

interface ProductForForm {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  is_personalized: boolean;
  images: ProductImage[];
  customization_fields: CustomizationField[];
}

export default function ProductPurchaseForm({ product }: { product: ProductForForm }) {
  const router = useRouter();
  const { addItem } = useCart();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({});
  const [photoUploads, setPhotoUploads] = useState<Record<string, string[]>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const sortedFields = [...product.customization_fields].sort((a, b) => a.sort_order - b.sort_order);

  async function handlePhotoChange(field: CustomizationField, files: FileList | null) {
    if (!files || !files.length) return;
    setError(null);
    setUploading(field.id);

    const maxPhotos = field.max_photos || 1;
    const existing = photoUploads[field.id] || [];
    const remainingSlots = maxPhotos - existing.length;
    const toUpload = Array.from(files).slice(0, Math.max(0, remainingSlots));

    try {
      const uploadedPaths: string[] = [];
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed.');
        uploadedPaths.push(data.storage_path);
      }
      setPhotoUploads((prev) => ({ ...prev, [field.id]: [...existing, ...uploadedPaths] }));
    } catch (e: any) {
      setError(e.message || 'Photo upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  }

  function validate(): boolean {
    for (const field of sortedFields) {
      if (!field.is_required) continue;
      if (field.field_type === 'photo') {
        if (!photoUploads[field.id]?.length) {
          setError(`Please upload a photo for "${field.label}".`);
          return false;
        }
      } else if (!values[field.id]?.trim()) {
        setError(`Please fill in "${field.label}".`);
        return false;
      }
    }
    return true;
  }

  function buildCartItem() {
    return {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_image: product.images[0]?.url,
      quantity,
      customization: sortedFields.map((f) => ({
        field_id: f.id,
        field_type: f.field_type,
        label: f.label,
        value: values[f.id],
      })),
      uploadedFileRefs: sortedFields
        .filter((f) => f.field_type === 'photo')
        .map((f) => ({ field_id: f.id, temp_paths: photoUploads[f.id] || [] })),
    };
  }

  function handleAddToCart() {
    setError(null);
    if (!validate()) return;
    addItem(buildCartItem());
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    setError(null);
    if (!validate()) return;
    addItem(buildCartItem());
    router.push('/checkout');
  }

  function handleSwipe(direction: number) {
    const lastIndex = product.images.length - 1;
    setActiveImage((prev) => {
      const next = prev + direction;
      if (next < 0) return lastIndex;
      if (next > lastIndex) return 0;
      return next;
    });
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Image carousel */}
      <div>
        <div className="relative aspect-square w-full touch-pan-y select-none overflow-hidden rounded-xl2 bg-rose-50">
          {product.images[activeImage]?.url ? (
            <motion.div
              key={activeImage}
              className="relative h-full w-full"
              drag={product.images.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_e, info) => {
                if (info.offset.x < -60) handleSwipe(1);
                else if (info.offset.x > 60) handleSwipe(-1);
              }}
            >
              <Image
                src={product.images[activeImage].url!}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="pointer-events-none object-cover"
                priority
                draggable={false}
              />
            </motion.div>
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-rose-300">❤️</div>
          )}

          {product.images.length > 1 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {product.images.map((img, i) => (
                <span
                  key={img.id}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeImage ? 'w-5 bg-white' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {product.images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {product.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(i)}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                  i === activeImage ? 'border-rose-500' : 'border-transparent'
                }`}
              >
                <Image src={img.url!} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details + form */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{product.name}</h1>
        <p className="mt-2 text-2xl font-bold text-rose-700">{formatINR(product.price)}</p>
        <p className="mt-1 text-sm font-medium text-charcoal">Made to Order</p>
        <p className="mt-4 whitespace-pre-line text-sm text-charcoal">{product.description}</p>

        {sortedFields.length > 0 && (
          <div className="mt-6 space-y-5 border-t border-rose-100 pt-6">
            <p className="text-sm font-semibold text-ink">Personalize This Gift</p>
            {sortedFields.map((field) => (
              <div key={field.id}>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  {field.label} {field.is_required && <span className="text-rose-600">*</span>}
                </label>

                {field.field_type === 'photo' ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple={(field.max_photos || 1) > 1}
                      onChange={(e) => handlePhotoChange(field, e.target.files)}
                      className="block w-full text-sm text-charcoal file:mr-3 file:rounded-full file:border-0 file:bg-rose-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-rose-700"
                    />
                    {uploading === field.id && <p className="mt-1 text-xs text-charcoal">Uploading…</p>}
                    {photoUploads[field.id]?.length > 0 && (
                      <p className="mt-1 text-xs text-green-700">
                        {photoUploads[field.id].length} photo(s) uploaded
                      </p>
                    )}
                    {field.max_photos && field.max_photos > 1 && (
                      <p className="mt-1 text-xs text-charcoal">Up to {field.max_photos} photos</p>
                    )}
                  </div>
                ) : field.field_type === 'note' ? (
                  <textarea
                    rows={3}
                    value={values[field.id] || ''}
                    onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
                    className="w-full rounded-lg border border-rose-200 px-3 py-2 text-base"
                  />
                ) : field.field_type === 'date' ? (
                  <input
                    type="date"
                    value={values[field.id] || ''}
                    onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
                    className="w-full rounded-lg border border-rose-200 px-3 py-2 text-base"
                  />
                ) : (
                  <input
                    type="text"
                    value={values[field.id] || ''}
                    onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
                    className="w-full rounded-lg border border-rose-200 px-3 py-2 text-base"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm font-medium text-ink">Quantity</span>
          <div className="flex items-center rounded-full border border-rose-200">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-11 w-11 text-lg">−</button>
            <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} className="h-11 w-11 text-lg">+</button>
          </div>
        </div>

        {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
        {added && <p className="mt-4 text-sm font-medium text-green-700">Added to cart!</p>}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button onClick={handleAddToCart} className="btn-secondary w-full sm:w-auto">Add to Cart</button>
          <button onClick={handleBuyNow} className="btn-primary w-full sm:w-auto">Buy Now</button>
        </div>

        <div className="mt-8 space-y-2 border-t border-maroon-100 pt-6 text-sm text-charcoal">
          <p className="flex items-center gap-2"><Truck size={16} strokeWidth={1.75} className="text-maroon-400" /> ₹50 delivery</p>
          <p className="flex items-center gap-2"><CreditCard size={16} strokeWidth={1.75} className="text-maroon-400" /> Secure online payment</p>
          <p className="flex items-center gap-2"><Heart size={16} strokeWidth={1.75} className="text-maroon-400" /> Made to order</p>
        </div>
      </div>
    </div>
  );
}