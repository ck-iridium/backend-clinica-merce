"use client"
import { useState, useEffect } from 'react';
import { SignaturePadModal } from '@/components/SignaturePadModal';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { toast } from 'sonner';
import { useAuthRole } from '@/hooks/useAuthRole';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ClientProfilePage({ params }: { params: { id: string } }) {
  const { role } = useAuthRole();
  const isEspecialista = role?.toLowerCase() === 'especialista';
  const { showFeedback } = useFeedback();
  const [client, setClient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [consents, setConsents] = useState<any[]>([]);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Pay Debt Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payVoucherId, setPayVoucherId] = useState('');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [paying, setPaying] = useState(false);
  const [currentDebt, setCurrentDebt] = useState(0);

  useEffect(() => {
    fetchClient();
  }, [params.id]);

  const fetchClient = async () => {
    try {
      const [cRes, aRes, vRes, sRes, conRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${params.id}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${params.id}/consents`)
      ]);
      
      if (cRes.ok) {
        const data = await cRes.json();
        setClient(data);
        setFormData(data);
      }
      if (aRes.ok) setAppointments((await aRes.json()).filter((a:any) => a.client_id === params.id && a.status === 'completed').sort((a:any, b:any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()));
      if (vRes.ok) setVouchers((await vRes.json()).filter((v:any) => v.client_id === params.id));
      if (sRes.ok) setServices(await sRes.json());
      if (conRes.ok) setConsents(await conRes.json());
    } catch (err) {
      console.error("Error fetching client", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone === '' ? null : formData.phone,
          allergies: formData.allergies === '' ? null : formData.allergies,
          medical_history: formData.medical_history === '' ? null : formData.medical_history,
          dni: formData.dni === '' ? null : formData.dni,
          address: formData.address === '' ? null : formData.address
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setClient(updated);
        setIsEditing(false);
        toast.success('Ficha de cliente actualizada');
      } else {
        toast.error('Error al guardar los cambios');
      }
    } catch (err) {
      toast.error('Error de conexión fallida');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSignature = async (signatureB64: string, docType: string) => {
    try {
      const docTitles: any = {
        'rgpd_general': 'Tratamiento de Datos Personales (Ley General RGPD)',
        'laser_hair_removal': 'Consentimiento: Depilación Láser',
        'botulinum_toxin': 'Consentimiento: Toxina Botulínica',
        'facial_fillers': 'Consentimiento: Rellenos Faciales'
      };
      const title = docTitles[docType] || 'Consentimiento Médico';

      const fakeBody = `DECLARACIÓN DEL PACIENTE: Don/Doña ${client.name} manifiesto que he sido debidamente informado/a y he comprendido la naturaleza y propósito del tratamiento seleccionado, así como las posibles complicaciones, riesgos generales e infrecuentes asociados al mismo. Adicionalmente, presto mi consentimiento EXPRESO, de acuerdo a la Ley Orgánica 3/2018 (LOPDGDD) y el Reglamento (UE) 2016/679 (RGPD), para el uso, tratamiento y archivo de mis datos personales, historial clínico y fotografías con fines de diagnóstico y evolución médica, a favor de Clínica Mercè. Con la firma del presente documento, asumo que he tenido la oportunidad de aclarar dudas y realizo la aceptación del tratamiento propuesto de forma libre y voluntaria.`;

      const payload = {
        client_id: params.id,
        document_type: docType,
        document_title: title,
        document_body: fakeBody,
        signature_b64: signatureB64
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${params.id}/consents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newConsent = await res.json();
        setConsents([newConsent, ...consents]);
        setIsSignatureModalOpen(false);
        toast.success('Consentimiento guardado y firmado');
      } else {
        toast.error('Error al guardar el documento legal');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error de conexión al servidor');
    }
  };

  const handleOpenPayModal = (v: any) => {
    setPayVoucherId(v.id);
    const debt = v.total_price - v.amount_paid;
    setCurrentDebt(debt);
    setPayAmount(debt); // Autocomplete with exact remaining amount
    setShowPayModal(true);
  };

  const handlePayDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    try {
      const v = vouchers.find(x => x.id === payVoucherId);
      if (!v) return;
      const newAmountPaid = Number(v.amount_paid) + Number(payAmount);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/${payVoucherId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_paid: newAmountPaid })
      });
      if (res.ok) {
        setShowPayModal(false);
        fetchClient(); // refresh specific client data
        toast.success('Cobro registrado correctamente');
      } else {
        toast.error('Error al registrar el pago');
      }
    } catch (e) {
      toast.error('Error de conexión');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center">
      <div className="inline-block w-8 h-8 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin mb-4"></div>
      <p className="text-stone-500 font-medium">Leyendo historial médico...</p>
    </div>
  );
  
  if (!client) return <div className="p-10 text-stone-500 text-center font-bold text-xl">Cliente no encontrado</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <a href="/dashboard/clients" className="text-sm font-semibold text-stone-400 hover:text-[#d9777f] mb-6 inline-flex items-center transition-colors">
        ← Volver al directorio
      </a>

      {/* Header Profile */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col md:flex-row gap-8 items-start mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#fdf2f3] to-white rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="w-24 h-24 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-300 font-serif text-5xl shadow-inner z-10 font-bold shrink-0">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="z-10 flex-1 w-full">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Nombre</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none disabled:bg-stone-50 disabled:text-stone-400" required disabled={isEspecialista} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none disabled:bg-stone-50 disabled:text-stone-400" required disabled={isEspecialista} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Teléfono</label>
                  <input type="tel" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none disabled:bg-stone-50 disabled:text-stone-400" disabled={isEspecialista} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Alergias</label>
                  <input type="text" value={formData.allergies || ''} onChange={e => setFormData({...formData, allergies: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none" placeholder="Sin alergias" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">DNI / NIF</label>
                  <input type="text" value={formData.dni || ''} onChange={e => setFormData({...formData, dni: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none disabled:bg-stone-50 disabled:text-stone-400" placeholder="Opcional" disabled={isEspecialista} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Dirección Fiscal</label>
                  <input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none disabled:bg-stone-50 disabled:text-stone-400" placeholder="Opcional" disabled={isEspecialista} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Historial y Observaciones</label>
                  <textarea value={formData.medical_history || ''} onChange={e => setFormData({...formData, medical_history: e.target.value})} rows={3} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none" placeholder="Añadir notas médicas..."></textarea>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-[#d9777f] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#c6646b] transition-all disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button type="button" onClick={() => {setIsEditing(false); setFormData(client);}} className="bg-stone-100 text-stone-600 px-6 py-2.5 rounded-xl font-bold hover:bg-stone-200 transition-all">
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-4xl font-extrabold text-stone-900 mb-2">{client.name}</h1>
              <p className="text-stone-500 text-lg">{client.email} {client.phone && `• ${client.phone}`}</p>
              
              <div className="mt-2 text-sm text-stone-400 font-medium">
                {client.dni && <span className="mr-4">DNI: <span className="text-stone-600">{client.dni}</span></span>}
                {client.address && <span>Dir: <span className="text-stone-600">{client.address}</span></span>}
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <a href={`/dashboard/calendar?client_id=${params.id}`} className="bg-[#d9777f] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#c6646b] shadow-md transition-all active:scale-95 border border-transparent inline-block text-center cursor-pointer">
                  Reservar Cita
                </a>
                <button onClick={() => setIsEditing(true)} className="bg-stone-50 text-stone-600 px-6 py-2.5 rounded-xl font-bold hover:bg-stone-100 border border-stone-200 transition-all active:scale-95 shadow-sm">
                  {isEspecialista ? 'Añadir Notas Médicas' : 'Editar Ficha'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Alerts & Medical Info */}
        <div className="md:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
          {(() => {
            const activeVouchersWithDebt = vouchers.filter(v => v.payment_status === 'partial' || v.payment_status === 'pending');
            const totalDebt = activeVouchersWithDebt.reduce((sum, v) => sum + (v.total_price - v.amount_paid), 0);
            if (totalDebt > 0) return (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">💰</span>
                  Deuda Pendiente
                </h3>
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col items-center justify-center shadow-inner">
                  <span className="text-xs uppercase font-extrabold text-rose-500 tracking-widest mb-1">Monto a abonar</span>
                  <span className="text-4xl font-extrabold text-rose-600">{totalDebt}€</span>
                  <p className="text-xs text-rose-400 font-medium text-center mt-2 leading-tight">El cliente mantiene bonos asignados sin haber completado el pago.</p>
                </div>
              </div>
            );
            return null;
          })()}

          <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-sm border border-red-100">⚠️</span>
            Alertas Médicas
          </h3>
          {client.allergies ? (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-800 font-medium">
              {client.allergies}
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-medium text-center">
              Sin alergias o precauciones registradas.
            </div>
          )}
          
          <h3 className="text-lg font-bold text-stone-800 mb-4 mt-8 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">📝</span>
            Observaciones Libres
          </h3>
          <p className="text-stone-500 text-sm leading-relaxed bg-stone-50 p-5 rounded-2xl border border-stone-100 shadow-inner min-h-[100px] whitespace-pre-wrap">
            {client.medical_history || 'No hay historial médico redactado aún.'}
          </p>
        </div>

        {/* Treatment History */}
        {/* Right Column: Vouchers & History */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Vouchers */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
            <h3 className="text-xl font-bold text-stone-800 mb-6 border-b border-stone-50 pb-4 flex justify-between items-center">
              <span>🎟️ Bonos Adquiridos</span>
              {!isEspecialista && (
                <a href="/dashboard/vouchers" className="text-sm font-semibold text-[#d9777f] bg-[#fdf2f3] px-3 py-1 rounded-lg hover:bg-[#f3c7cb] transition-colors">Vender Bono</a>
              )}
            </h3>
            {vouchers.length === 0 ? (
              <p className="text-stone-400 text-sm italic">Este cliente no tiene bonos en su cuenta.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vouchers.map(v => {
                  const service = services.find(s => s.id === v.service_id);
                  const isExpired = new Date(v.expiration_date) < new Date();
                  const isEmpty = v.used_sessions >= v.total_sessions;
                  const isActive = !isExpired && !isEmpty;
                  
                  return (
                    <div key={v.id} className={`p-4 rounded-xl border flex flex-col justify-between ${isActive ? 'bg-[#fdf2f3] border-[#f3c7cb]' : 'bg-stone-50 border-stone-100 opacity-60'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <p className="font-extrabold text-stone-700 text-sm leading-tight">{service?.name || 'Servicio...'}</p>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-500'}`}>
                            {isActive ? 'Activo' : 'Cerrado'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-stone-500 mb-4">⏳ Vence: {new Date(v.expiration_date).toLocaleDateString()}</p>
                      </div>

                      <div>
                        {/* Financial Area */}
                        {(v.payment_status === 'partial' || v.payment_status === 'pending') ? (
                          <div className="mb-4 bg-white/60 p-2.5 rounded-lg border border-rose-100 flex items-center justify-between">
                            <div>
                               <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">Deuda</span>
                               <span className="text-sm font-extrabold text-rose-600">{v.total_price - v.amount_paid}€</span>
                            </div>
                            <button onClick={() => handleOpenPayModal(v)} className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-3 py-1.5 rounded-md text-xs transition-colors shadow-sm focus:outline-none">
                              Cobrar
                            </button>
                          </div>
                        ) : (
                          <div className="mb-4 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">✓ Pagado Totalmente</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white h-2 rounded-full overflow-hidden border border-stone-200">
                             <div className="bg-[#d9777f] h-full" style={{ width: `${(v.used_sessions / v.total_sessions) * 100}%`}}></div>
                          </div>
                          <span className="text-xs font-bold text-stone-700">{v.used_sessions}/{v.total_sessions}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Documentos Legales y RGPD */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
            <h3 className="text-xl font-bold text-stone-800 mb-6 border-b border-stone-50 pb-4 flex items-center justify-between">
              <span>📄 Documentos Legales y Firmas</span>
              <button 
                onClick={() => setIsSignatureModalOpen(true)}
                className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors shadow-sm"
              >
                + Nuevo Consentimiento
              </button>
            </h3>
            
            {consents.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-stone-300 text-4xl mb-4 block">⚖️</span>
                <p className="text-stone-500 font-medium">No hay documentos firmados.</p>
                <p className="text-stone-400 text-sm mt-1">El cliente no ha firmado todavía el consentimiento RGPD básico.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consents.map(c => (
                  <div key={c.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 rounded-xl border border-stone-100 bg-stone-50 hover:bg-stone-100 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center text-stone-500 font-bold shrink-0">
                      📝
                    </div>
                    <div className="flex-1">
                       <p className="font-bold text-stone-800 text-sm">{c.document_title}</p>
                       <p className="text-xs text-stone-500 font-medium mt-0.5">
                         Firmado el: {new Date(c.signed_at).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                       </p>
                    </div>
                    <a
                      href={`/dashboard/clients/${params.id}/consents/${c.id}`}
                      className="w-full sm:w-auto text-center px-4 py-2 bg-white border border-stone-200 text-stone-600 font-bold text-xs rounded-lg shadow-sm hover:border-[#d9777f] hover:text-[#d9777f] transition-colors"
                    >
                      Ver / Imprimir
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Treatment History */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
            <h3 className="text-xl font-bold text-stone-800 mb-6 border-b border-stone-50 pb-4">Historial de Tratamientos Finalizados</h3>
            
            {appointments.length === 0 ? (
              <div className="text-center py-10 bg-stone-50/50 rounded-2xl border border-stone-100 border-dashed">
                <span className="text-stone-300 text-5xl mb-4 block inline-block transform -rotate-6">📅</span>
                <p className="text-stone-500 font-medium text-lg">Cero tratamientos finalizados.</p>
                <p className="text-stone-400 text-sm mt-1">Acude a la agenda para marcar citas como completadas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map(a => {
                  const s = services.find(x => x.id === a.service_id);
                  const dateInfo = new Date(a.start_time);
                  return (
                    <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:shadow-sm transition-all hover:bg-white group cursor-default">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold border border-emerald-100 shrink-0 group-hover:scale-105 transition-transform">
                        ✓
                      </div>
                      <div>
                        <p className="font-bold text-stone-800">{s?.name || 'Tratamiento Desconocido'}</p>
                        <p className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
                          <span className="text-[#d9777f]">📅</span> {dateInfo.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="ml-auto text-xs font-bold text-stone-400 bg-white px-3 py-1.5 rounded-lg border border-stone-200 uppercase tracking-widest hidden sm:block">
                        Finalizado
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            <div className="mt-6 text-center">
              <a href={`/dashboard/calendar?client_id=${params.id}`} className="inline-block text-[#d9777f] font-bold text-sm bg-white px-5 py-2.5 rounded-xl border border-stone-200 shadow-sm hover:border-[#f3c7cb] transition-colors cursor-pointer">
                + Ir a la Agenda
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modal de Firma --- */}
      <SignaturePadModal 
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSaveSignature}
        clientName={client.name}
      />

      {/* --- Modal de Saldar Deuda --- */}
      <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
        <DialogContent className="p-0 border-none max-w-sm">
          <DialogHeader className="p-6 border-b border-stone-50 bg-white rounded-t-xl">
            <DialogTitle className="text-xl font-extrabold text-stone-800">Añadir Pago</DialogTitle>
            <DialogDescription className="text-stone-400 text-xs mt-1">
              Registra un cobro parcial o total sobre la deuda del bono del paciente.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 pb-32">
            <form id="pay-debt-form-profile" onSubmit={handlePayDebt}>
              <p className="text-sm text-stone-500 mb-4 bg-stone-50 p-3 rounded-lg border border-stone-100">
                La deuda actual de este bono es de <strong className="text-rose-500">{currentDebt}€</strong>.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Monto abonado HOY (€)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  max={currentDebt}
                  value={payAmount} 
                  onChange={e => setPayAmount(Number(e.target.value))} 
                  className="w-full p-4 bg-white border border-stone-200 border-l-4 border-l-[#d9777f] rounded-xl font-extrabold text-stone-800 outline-none text-xl" 
                />
                <p className="text-[10px] text-stone-400 mt-1">Este importe cerrará parcialmente o totalmente la deuda, actualizando la factura pendiente.</p>
              </div>
            </form>
          </div>

          <DialogFooter className="sticky bottom-0 left-0 w-full p-6 border-t border-stone-100 bg-gradient-to-t from-white via-white to-white/0 flex gap-3 rounded-b-2xl z-20">
             <button type="button" onClick={() => setShowPayModal(false)} className="flex-1 py-3 text-stone-600 font-bold border border-stone-200 rounded-xl hover:bg-stone-50">Cancelar</button>
             <button form="pay-debt-form-profile" type="submit" disabled={paying} className="flex-1 py-3 text-white bg-[#d9777f] font-bold rounded-xl hover:bg-[#c6646b] shadow-md flex justify-center items-center">
               {paying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirmar Cobro'}
             </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
