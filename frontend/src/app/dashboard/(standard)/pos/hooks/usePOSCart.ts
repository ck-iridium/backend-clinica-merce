import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Service, CartItem } from '../components/types';

export function usePOSCart() {
  const { t } = useLanguage();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempItemPrice, setTempItemPrice] = useState<string>('');

  const [customTotal, setCustomTotal] = useState<number | null>(null);
  const [isEditingTotal, setIsEditingTotal] = useState<boolean>(false);
  const [customTotalInput, setCustomTotalInput] = useState<string>('');
  const [bounceCart, setBounceCart] = useState(false);

  // Añadir ítem al carrito
  const addToCart = (service: Service) => {
    const newItem: CartItem = {
      ...service,
      price: Number(service.price),
      original_price: Number(service.price),
    };
    setCart((prev) => [...prev, newItem]);

    // Disparar animación de rebote en la barra móvil
    setBounceCart(true);
    setTimeout(() => setBounceCart(false), 500);

    toast.success(`${service.name} añadido al ticket`);
  };

  // Quitar ítem del carrito
  const removeFromCart = (index: number) => {
    setCart((prev) => {
      const nextCart = prev.filter((_, i) => i !== index);
      if (nextCart.length === 0) {
        setCustomTotal(null);
        setCustomTotalInput('');
        setIsEditingTotal(false);
      }
      return nextCart;
    });
  };

  // Modificar precio individual del ítem
  const updateItemPrice = (index: number, newPriceStr: string) => {
    const parsed = parseFloat(newPriceStr);
    if (isNaN(parsed) || parsed < 0) {
      toast.error(t('dashboard.pos.invalid_price') || 'Precio no válido');
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], price: Number(parsed.toFixed(2)) };
      return updated;
    });
    setEditingIndex(null);
    setCustomTotal(null); // Restablecer total manual si se modifica un ítem individual
  };

  // Aplicar importe total manual personalizado
  const handleApplyCustomTotal = () => {
    const parsed = parseFloat(customTotalInput);
    if (isNaN(parsed) || parsed < 0) {
      toast.error(t('dashboard.pos.invalid_price') || 'Precio total no válido');
      return;
    }
    setCustomTotal(Number(parsed.toFixed(2)));
    setIsEditingTotal(false);
  };

  // Restablecer precios originales de catálogo
  const handleResetPrices = () => {
    setCart((prev) => prev.map((item) => ({ ...item, price: item.original_price })));
    setCustomTotal(null);
    setCustomTotalInput('');
    setIsEditingTotal(false);
    setEditingIndex(null);
    toast.info(t('dashboard.pos.prices_reset') || 'Precios restablecidos al catálogo');
  };

  // Limpiar carrito completo
  const resetCart = () => {
    setCart([]);
    setCustomTotal(null);
    setCustomTotalInput('');
    setIsEditingTotal(false);
    setEditingIndex(null);
  };

  // Cálculos de totales e impuestos
  const catalogSubtotal = cart.reduce((sum, item) => sum + Number(item.price), 0);
  const totalAmount = customTotal !== null ? customTotal : catalogSubtotal;
  const subtotal = totalAmount;
  const taxRate = 21; // IVA general 21%
  const taxAmount = (subtotal * taxRate) / 121;
  const isPriceModified = customTotal !== null || cart.some((item) => Number(item.price) !== Number(item.original_price));

  return {
    cart,
    setCart,
    bounceCart,
    editingIndex,
    setEditingIndex,
    tempItemPrice,
    setTempItemPrice,
    customTotal,
    isEditingTotal,
    setIsEditingTotal,
    customTotalInput,
    setCustomTotalInput,
    catalogSubtotal,
    totalAmount,
    subtotal,
    taxRate,
    taxAmount,
    isPriceModified,
    addToCart,
    removeFromCart,
    updateItemPrice,
    handleApplyCustomTotal,
    handleResetPrices,
    resetCart,
  };
}
