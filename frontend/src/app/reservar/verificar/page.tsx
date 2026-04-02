"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, CalendarPlus, Loader2, AlertCircle } from 'lucide-react';

export default function VerificarPage() {
    const router = useRouter();
    const [id, setId] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [appt, setAppt] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const urlId = queryParams.get('id');
        if (!urlId) {
            setError("No se ha proporcionado un enlace válido de confirmación.");
            setLoading(false);
            return;
        }
        setId(urlId);

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/automation/verify/${urlId}`)
        .then(res => {
            if (!res.ok) throw new Error("El enlace ha caducado o la cita no existe.");
            return res.json();
        })
        .then(data => {
            if (data.status !== 'pending_verification') {
                setStep(2); // Jump straight to success if already confirmed
            }
            setAppt(data);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, []);

    const handleVerify = async () => {
        if (!id) return;
        setVerifying(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/automation/verify/${id}`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error("No se pudo confirmar la cita. Por favor, contáctanos.");
            await res.json();
            setStep(2);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setVerifying(false);
        }
    };

    const getGoogleCalendarUrl = () => {
        if (!appt || !appt.start_iso || !appt.end_iso) return '#';
        
        const formatS = (isoString: string) => isoString.replace(/[-:]/g, '').split('.')[0] + 'Z';
        const start = formatS(new Date(appt.start_iso).toISOString());
        const end = formatS(new Date(appt.end_iso).toISOString());
        
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Cita+${encodeURIComponent(appt.service_name)}+en+Clínica+Merce&dates=${start}/${end}&details=Tratamiento+de+estética+en+Clínica+Merce`;
    };

    return (
        <div className="min-h-screen bg-[#fcf8f8] font-sans flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#d9777f]"></div>
                
                <div className="p-8 md:p-10">
                    {loading ? (
                        <div className="py-10 text-center">
                            <Loader2 className="w-10 h-10 text-[#d9777f] animate-spin mx-auto mb-4" />
                            <p className="text-stone-400 font-bold tracking-widest uppercase text-xs">Cargando detalles...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center animate-in fade-in">
                            <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-extrabold text-stone-800 mb-2">Aviso</h2>
                            <p className="text-stone-500 mb-6">{error}</p>
                            <Link href="/" className="inline-block bg-stone-100 text-stone-600 font-bold px-6 py-3 rounded-xl hover:bg-stone-200 transition-colors cursor-pointer">
                                Volver al inicio
                            </Link>
                        </div>
                    ) : (
                        <>
                            {step === 1 && appt && (
                                <div className="text-center animate-in slide-in-from-bottom-4 fade-in">
                                    <h1 className="text-2xl font-extrabold text-stone-800 mb-4 tracking-tight">Confirmar Cita</h1>
                                    <p className="text-stone-500 mb-6">Solo te falta un paso para bloquear tu hueco en la agenda.</p>
                                    
                                    <div className="bg-stone-50 border border-stone-100 rounded-2xl p-5 mb-8 text-left">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Tratamiento</p>
                                        <p className="font-extrabold text-stone-800 text-lg mb-4">{appt.service_name}</p>
                                        
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Fecha de la reserva</p>
                                        <p className="font-extrabold text-[#d9777f]">{appt.date} a las {appt.time}h</p>
                                    </div>
                                    
                                    <button 
                                        onClick={handleVerify}
                                        disabled={verifying}
                                        className="w-full bg-[#d9777f] text-white font-bold py-4 rounded-xl hover:bg-[#c2656d] transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-[#d9777f]/20 flex items-center justify-center gap-2"
                                    >
                                        {verifying ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "Confirmar mi Identidad y Cita"
                                        )}
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="text-center animate-in zoom-in-95 duration-500">
                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm ring-4 ring-emerald-50">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h1 className="text-3xl font-extrabold text-stone-800 mb-2 tracking-tight">¡Cita Confirmada!</h1>
                                    <p className="text-stone-500 font-medium mb-8">Hemos verificado tu identidad. Tu hueco en la agenda ya es oficial.</p>
                                    
                                    <div className="border-t border-stone-100 pt-8 pb-4 flex flex-col gap-3">
                                        <a 
                                            href={getGoogleCalendarUrl()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl hover:bg-stone-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <CalendarPlus className="w-5 h-5" />
                                            Añadir a mi calendario
                                        </a>
                                        <Link href="/" className="w-full bg-stone-100 text-stone-500 font-bold py-3.5 rounded-xl hover:bg-stone-200 transition-colors block text-center cursor-pointer">
                                            Volver a Inicio
                                        </Link>
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
