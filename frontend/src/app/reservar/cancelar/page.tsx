"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CancelarPage() {
    const router = useRouter();
    const [id, setId] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [appt, setAppt] = useState<any>(null);
    const [error, setError] = useState('');
    const [cancelResult, setCancelResult] = useState<any>(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const urlId = queryParams.get('id');
        if (!urlId) {
            setError("No se ha proporcionado un enlace válido.");
            setLoading(false);
            return;
        }
        setId(urlId);

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/automation/cancel/${urlId}`)
        .then(res => {
            if (!res.ok) throw new Error("La cita no existe o ya fue procesada.");
            return res.json();
        })
        .then(data => {
            if (data.status === 'cancelled' || data.status === 'completed') {
                setError("Esta cita ya fue anulada o completada anteriormente.");
            } else {
                setAppt(data);
            }
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, []);

    const handleCancel = async () => {
        if (!id) return;
        setCancelling(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/automation/cancel/${id}`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error("No se pudo procesar la cancelación. Por favor, contáctanos.");
            const data = await res.json();
            setCancelResult(data);
            setStep(2);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setCancelling(false);
        }
    };

    const handleRebook = () => {
        if (!cancelResult) return;
        const query = new URLSearchParams({
            srvId: cancelResult.service_id,
            name: cancelResult.client_name,
            email: cancelResult.client_email,
            phone: cancelResult.client_phone
        }).toString();
        router.push(`/reservar?${query}`);
    };

    return (
        <div className="min-h-screen bg-[#fcf8f8] font-sans flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#d9777f]"></div>
                
                <div className="p-8 md:p-10">
                    {loading ? (
                        <div className="py-10 text-center">
                            <div className="inline-block w-10 h-10 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin mb-4"></div>
                            <p className="text-stone-400 font-bold tracking-widest uppercase text-xs">Cargando detalles...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center animate-in fade-in">
                            <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">⚠️</div>
                            <h2 className="text-xl font-extrabold text-stone-800 mb-2">Aviso</h2>
                            <p className="text-stone-500 mb-6">{error}</p>
                            <Link href="/" className="inline-block bg-stone-100 text-stone-600 font-bold px-6 py-3 rounded-xl hover:bg-stone-200 transition-colors">
                                Volver al inicio
                            </Link>
                        </div>
                    ) : (
                        <>
                            {step === 1 && appt && (
                                <div className="text-center animate-in slide-in-from-bottom-4 fade-in">
                                    <div className="w-16 h-16 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                                        🗓️
                                    </div>
                                    <h1 className="text-2xl font-extrabold text-stone-800 mb-4 tracking-tight">¿Cancelar tu cita?</h1>
                                    
                                    <div className="bg-stone-50 border border-stone-100 rounded-2xl p-5 mb-8 text-left">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Tratamiento</p>
                                        <p className="font-extrabold text-stone-800 text-lg mb-4">{appt.service_name}</p>
                                        
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Fecha reservada</p>
                                        <p className="font-extrabold text-[#d9777f]">{appt.date} a las {appt.time}h</p>
                                    </div>
                                    
                                    <p className="text-stone-500 font-medium text-sm mb-8">Esta acción es irreversible y tu hueco quedará libre para otra persona.</p>
                                    
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={handleCancel}
                                            disabled={cancelling}
                                            className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl hover:bg-[#d9777f] transition-all disabled:opacity-50 active:scale-95 shadow-md flex items-center justify-center gap-2"
                                        >
                                            {cancelling ? (
                                                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                "Sí, Cancelar Cita"
                                            )}
                                        </button>
                                        <Link href="/" className="w-full bg-white border-2 border-stone-100 text-stone-500 font-bold py-3.5 rounded-xl hover:border-stone-200 hover:bg-stone-50 transition-colors">
                                            No, mantener mi cita
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {step === 2 && cancelResult && (
                                <div className="text-center animate-in zoom-in-95 duration-500">
                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm ring-4 ring-emerald-50">
                                        ✓
                                    </div>
                                    <h1 className="text-3xl font-extrabold text-stone-800 mb-2 tracking-tight">Cita Cancelada</h1>
                                    <p className="text-stone-500 font-medium mb-8">Tu solicitud se ha procesado correctamente. Merce ha sido notificada.</p>
                                    
                                    <div className="border-t border-stone-100 pt-8 pb-4">
                                        <h3 className="font-extrabold text-stone-800 mb-2">¿Quieres buscar otro hueco?</h3>
                                        <p className="text-sm text-stone-500 mb-6">Puedes reactivar tu reserva rápidamente eligiendo un nuevo día. Usaremos tus datos previos.</p>
                                        
                                        <div className="flex flex-col gap-3">
                                            <button 
                                                onClick={handleRebook}
                                                className="w-full bg-[#d9777f] text-white font-bold py-4 rounded-xl hover:bg-[#b35e65] transition-all active:scale-95 shadow-lg shadow-[#d9777f]/20"
                                            >
                                                Agendar de nuevo
                                            </button>
                                            <Link href="/" className="w-full bg-white text-stone-400 font-bold py-3.5 hover:text-stone-600 transition-colors">
                                                Volver al inicio
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
