"use client"
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, ArrowRight, RefreshCw, AlertCircle, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface OtpVerificationModalProps {
  isOpen: boolean;
  appointmentId: string;
  maskedEmail: string;
  tenantId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function OtpVerificationModal({
  isOpen,
  appointmentId,
  maskedEmail,
  tenantId,
  onSuccess,
  onClose
}: OtpVerificationModalProps) {
  const { t } = useLanguage();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResend, setSuccessResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Contador regresivo para reenvío de código
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  // Enfocar el primer input al abrir
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setSuccessResend(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 200);
    }
  }, [isOpen]);

  const handleDigitChange = (index: number, val: string) => {
    // Aceptar solo números
    const clean = val.replace(/[^0-9]/g, '');
    if (!clean && val !== '') return;

    const char = clean.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMsg('');

    // Auto-avance al siguiente cajetín
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Si ya completó los 6 dígitos, auto-enviar
    if (char && index === 5 && newDigits.every(d => d !== '')) {
      verifyCode(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    setErrorMsg('');

    if (pasted.length === 6) {
      inputRefs.current[5]?.focus();
      verifyCode(pasted);
    } else {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const verifyCode = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || digits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg(t('otp.incomplete') || 'Introduce los 6 dígitos del código.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          code: fullCode
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || t('otp.invalid_code') || 'Código de verificación incorrecto.');
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al validar el código.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setErrorMsg('');
    setSuccessResend(false);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({
          appointment_id: appointmentId
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'No se pudo reenviar el código.');
      }

      setSuccessResend(true);
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-card border border-border rounded-luxury-card p-6 md:p-8 shadow-2xl relative text-foreground overflow-hidden"
        >
          {/* Botón cerrar opcional */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>

          {/* Icono central de escudo */}
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-sm">
            <ShieldCheck size={28} />
          </div>

          {/* Textos de cabecera */}
          <div className="text-center mb-6">
            <h3 className="text-xl md:text-2xl font-serif font-bold tracking-tight mb-1.5 text-foreground">
              {t('otp.modal_title') || 'Verifica tu Reserva'}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed px-2">
              {t('otp.modal_desc') || 'Solo por ser tu primera visita, te hemos enviado un código de 6 dígitos a'}{' '}
              <span className="font-bold text-foreground inline-flex items-center gap-1">
                <Mail size={12} className="text-primary inline" />
                {maskedEmail}
              </span>.
            </p>
          </div>

          {/* 6 Cajetines de Dígitos */}
          <div className="flex justify-center gap-2 md:gap-3 mb-4" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                disabled={loading}
                className={`w-11 h-13 md:w-13 md:h-15 text-center text-xl md:text-2xl font-mono font-black rounded-luxury-btn border outline-none transition-all
                  ${digit ? 'border-primary bg-primary/5 text-foreground shadow-sm ring-2 ring-primary/20' : 'border-border bg-card text-foreground hover:border-stone-400 focus:border-primary focus:ring-2 focus:ring-primary/20'}
                  ${errorMsg ? 'border-red-500/80 bg-red-500/5' : ''}
                  disabled:opacity-50`}
              />
            ))}
          </div>

          {/* Feedback de error o reenvío */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-1.5 text-xs text-red-500 font-semibold mb-4 text-center"
            >
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successResend && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-emerald-500 font-semibold mb-4 text-center"
            >
              {t('otp.resend_success') || '¡Nuevo código enviado a tu correo!'}
            </motion.p>
          )}

          {/* Botón Principal de Confirmación */}
          <button
            type="button"
            onClick={() => verifyCode()}
            disabled={loading || digits.some(d => d === '')}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-luxury-btn font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none hover:opacity-95 mb-4"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>{t('otp.verify_btn') || 'Confirmar Cita'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>

          {/* Reenvío de Código */}
          <div className="text-center pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-1">
              {t('otp.didnt_receive') || '¿No has recibido el código?'}
            </p>
            {countdown > 0 ? (
              <p className="text-[11px] font-bold text-muted-foreground/80">
                {t('otp.resend_in') || 'Podrás solicitar otro en'}{' '}
                <span className="text-primary font-mono font-bold">{countdown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline transition-all cursor-pointer"
              >
                {resending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RefreshCw size={12} />
                )}
                <span>{t('otp.resend_action') || 'Reenviar código ahora'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
