export interface Service {
  id: string;
  name: string;
  price: number;
  category_id?: string;
  is_active: boolean;
}

export interface CartItem extends Service {
  original_price: number;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
}

export type PaymentMethod = 'Tarjeta' | 'Efectivo';
