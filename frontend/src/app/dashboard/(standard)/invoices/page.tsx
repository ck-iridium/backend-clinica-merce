"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { useAuthRole } from '@/hooks/useAuthRole';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download, Eye, Trash2 } from "lucide-react";
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function InvoicesPage() {
  const { showFeedback } = useFeedback();
  const router = useRouter();
  const { role, loading: loadingRole } = useAuthRole();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loadingRole) {
      const currentRole = role?.toLowerCase();
      if (currentRole !== 'administrador' && currentRole !== 'admin') {
        router.replace('/dashboard');
        toast.error("Acceso denegado: Solo los administradores pueden ver la facturación.");
      } else {
        fetchData();
      }
    }
  }, [role, loadingRole, router]);


  const fetchData = async () => {
    try {
      const [iRes, cRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`)
      ]);
      if (iRes.ok) setInvoices((await iRes.json()).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      if (cRes.ok) setClients(await cRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Cliente Borrado';
  
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    showFeedback({
      type: 'confirm',
      title: 'Eliminar Registro',
      message: '¿Seguro que deseas eliminar este registro de facturación de forma permanente?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}`, { method: 'DELETE' });
          if (res.ok) fetchData();
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  // Funciones de descarga eliminadas para dar paso a la vista de detalle ERP.

  if (loadingRole || (role?.toLowerCase() !== 'administrador' && role?.toLowerCase() !== 'admin')) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-[60vh] animate-in fade-in duration-500">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <Skeleton className="w-48 h-6 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-serif text-stone-800 tracking-tight">Registro de Facturación</h1>
          <p className="text-muted-foreground mt-1 text-sm font-sans">Historial de tickets, ventas y bonos emitidos</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-card rounded-[2rem] border border-border/40 shadow-sm overflow-hidden p-6 w-full space-y-4">
          {Array(4).fill(0).map((_, i) => (
             <div key={i} className="flex justify-between items-center w-full px-4 py-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
             </div>
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="py-20 text-center bg-card rounded-[2rem] border border-border/40 shadow-sm">
          <span className="text-5xl opacity-50 mb-4 block">🧾</span>
          <p className="text-muted-foreground font-medium text-sm">No hay ninguna factura registrada todavía.</p>
        </div>
      ) : (
        <div className="bg-card rounded-[2.5rem] border border-border/40 shadow-sm overflow-hidden relative group/table">
          {/* Sombras indicadoras de scroll lateral en móvil */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 opacity-0 group-hover/table:opacity-100 transition-opacity md:hidden pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 opacity-0 group-hover/table:opacity-100 transition-opacity md:hidden pointer-events-none"></div>
          
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse font-sans min-w-[700px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border/50 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="p-5 font-semibold">Fecha</th>
                  <th className="p-5 font-semibold">Cliente</th>
                  <th className="p-5 font-semibold">Concepto</th>
                  <th className="p-5 font-semibold text-center">Estado</th>
                  <th className="p-5 font-semibold text-right">Importe</th>
                  <th className="p-5 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-sm">
                {invoices.map((inv, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    key={inv.id} 
                    className="hover:bg-muted/30 transition-colors group"
                   >
                    <td className="px-5 py-4 font-semibold text-stone-600">
                      {new Date(inv.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 font-bold text-foreground">
                      {getClientName(inv.client_id)}
                    </td>
                    <td className="px-5 py-4 font-medium text-stone-600">
                      {inv.concept}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div 
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          inv.status === 'paid' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' 
                            : 'bg-amber-50 text-amber-600 border border-amber-100 shadow-sm'
                        }`}
                      >
                        {inv.status === 'paid' ? 'Pagada ✓' : 'Pendiente ⏳'}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-foreground text-right">
                      {Number(inv.amount).toFixed(2)} €
                    </td>
                    <td className="px-5 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none ml-auto">
                          <MoreHorizontal size={18} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/invoices/${inv.id}`} className="cursor-pointer flex items-center gap-2">
                              <Eye size={14} className="text-stone-500" />
                              Ver Detalle
                            </Link>
                          </DropdownMenuItem>
                          {/* Descargar is a placeholder that user had commented out the old functions for, but we'll add the UI */}
                          <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                            <Download size={14} className="text-stone-500" />
                            Descargar PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(inv.id)}
                            className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 size={14} />
                            Eliminar Registro
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
