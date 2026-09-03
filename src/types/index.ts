export type FieldType = 'photo' | 'text' | 'name' | 'date' | 'note';

export interface ProductImage {
  id: string;
  storage_path: string;
  sort_order: number;
  url?: string; // resolved public URL, added at fetch time
}

export interface CustomizationField {
  id: string;
  field_type: FieldType;
  label: string;
  is_required: boolean;
  max_photos: number | null;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  category: string | null;
  is_personalized: boolean;
  is_active: boolean;
  images: ProductImage[];
  customization_fields: CustomizationField[];
}

export type OrderStatus =
  | 'Payment Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface CartCustomizationAnswer {
  field_id: string;
  field_type: FieldType;
  label: string;
  value?: string; // for text/name/date/note
}

export interface CartItem {
  product_id: string;
  product_name: string;
  product_price: number;
  product_image?: string;
  quantity: number;
  customization: CartCustomizationAnswer[];
  // Files aren't serializable to localStorage; uploaded separately at checkout
  // and referenced here by a temporary client-side id once uploaded.
  uploadedFileRefs?: { field_id: string; temp_paths: string[] }[];
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  email: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface StoreSettings {
  store_name: string;
  support_email: string;
  delivery_charge: number;
  store_active: boolean;
  instagram_url: string | null;
  whatsapp_number: string | null;
  homepage_headline: string;
  homepage_subtext: string;
}
