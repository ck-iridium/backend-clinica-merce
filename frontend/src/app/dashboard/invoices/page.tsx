"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

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

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Paciente Borrado';
  
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
    if (!confirm('¿Seguro que deseas eliminar este registro de facturación de forma permanente?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Funciones de descarga eliminadas para dar paso a la vista de detalle ERP.

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Registro de Facturación</h1>
          <p className="text-stone-500 font-medium">Historial de tickets, ventas y bonos emitidos</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-32">
          <div className="inline-block w-8 h-8 border-4 border-[#d4af37] border-t-[#d9777f] rounded-full animate-spin mb-4"></div>
          <p className="text-stone-500 font-medium tracking-widest uppercase text-xs">Cargando base de datos...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-stone-100 shadow-sm">
          <span className="text-5xl opacity-50 mb-4 block">🧾</span>
          <p className="text-stone-500 font-medium text-lg">No hay ninguna factura registrada todavía.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-[10px] uppercase tracking-widest text-stone-400">
                  <th className="p-5 font-bold">Fecha</th>
                  <th className="p-5 font-bold">Paciente</th>
                  <th className="p-5 font-bold">Concepto</th>
                  <th className="p-5 font-bold text-center">Estado</th>
                  <th className="p-5 font-bold text-right">Importe</th>
                  <th className="p-5 font-bold text-center">Ticket</th>
                  <th className="p-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {invoices.map((inv) => (
                  <tr 
                    key={inv.id} 
                    onClick={() => router.push(`/dashboard/invoices/${inv.id}`)}
                    className="hover:bg-[#fdf2f3] cursor-pointer transition-colors group"
                   >
                    <td className="p-5 font-semibold text-stone-600">
                      {new Date(inv.date).toLocaleDateString()}
                    </td>
                    <td className="p-5 font-bold text-stone-800">
                      {getClientName(inv.client_id)}
                    </td>
                    <td className="p-5 font-semibold text-stone-600">
                      {inv.concept}
                    </td>
                    <td className="p-5 text-center">
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleStatus(inv.id, inv.status); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-transform hover:scale-105 ${
                          inv.status === 'paid' 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                            : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                        }`}
                      >
                        {inv.status === 'paid' ? 'Pagada ✓' : 'Pendiente ⏳'}
                      </button>
                    </td>
                    <td className="p-5 font-extrabold text-stone-800 text-right">
                      {Number(inv.amount).toFixed(2)} €
                    </td>
                    <td className="p-5 text-center font-bold text-[#d9777f] text-sm flex items-center gap-2 justify-center">
                       <span>Ver Folio</span>
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                       </svg>
                    </td>
                    <td className="p-5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(inv.id); }}
                          className="text-stone-300 hover:text-red-500 text-lg font-bold"
                          title="Eliminar Registro"
                        >
                          ✕
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
