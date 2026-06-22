'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import CoachTooltip from './CoachTooltip';

function CoachTooltipContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [tooltipText, setTooltipText] = useState<string>('');

  useEffect(() => {
    const hint = searchParams.get('hint');
    if (!hint) {
      setActiveHint(null);
      return;
    }

    // Verificar si el tooltip para este ID ya fue cerrado por el usuario
    const isDismissed = localStorage.getItem(`coach_dismissed_${hint}`) === 'true';
    if (isDismissed) {
      setActiveHint(null);
      return;
    }

    // Buscar el elemento en el DOM
    const targetElement = document.getElementById(hint);
    if (targetElement) {
      // Hacer scroll hasta el elemento
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Obtener el texto del tooltip
      const text = getTooltipTextForId(hint);
      setTooltipText(text);
      setActiveHint(hint);
    } else {
      // Si el elemento aún no se ha renderizado (carga diferida/SPA), re-intentamos en unos ms
      const retryTimer = setTimeout(() => {
        const retriedElement = document.getElementById(hint);
        if (retriedElement) {
          retriedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const text = getTooltipTextForId(hint);
          setTooltipText(text);
          setActiveHint(hint);
        }
      }, 500);
      return () => clearTimeout(retryTimer);
    }
  }, [searchParams, pathname]);

  const handleClose = () => {
    if (activeHint) {
      localStorage.setItem(`coach_dismissed_${activeHint}`, 'true');
      setActiveHint(null);
    }
  };

  if (!activeHint) return null;

  return (
    <CoachTooltip
      targetId={activeHint}
      content={tooltipText}
      onClose={handleClose}
    />
  );
}

// Mapear descripciones amigables e inteligentes basadas en los manuales de ayuda (Fase 2)
function getTooltipTextForId(id: string): string {
  const dictionary: Record<string, string> = {
    // Agenda
    'calendar-search-input': 'Busca citas por el nombre del cliente o tratamiento.',
    'calendar-prev-month-btn': 'Vuelve al mes anterior del minicalendario.',
    'calendar-next-month-btn': 'Avanza al mes siguiente del minicalendario.',
    'calendar-daily-prev-btn': 'Navega al día anterior en la agenda.',
    'calendar-daily-today-btn': 'Regresa al día actual.',
    'calendar-daily-next-btn': 'Navega al día siguiente en la agenda.',
    'calendar-filter-confirmed-btn': 'Filtra para ver solo las citas confirmadas.',
    'calendar-filter-pending-btn': 'Filtra para ver citas pendientes de aprobación web.',
    'calendar-filter-paid-btn': 'Filtra para ver solo citas marcadas como pagadas.',
    'calendar-close-panel-btn': 'Colapsa la barra lateral para maximizar el espacio.',
    'create-appt-appointment-tab': 'Registra una cita de servicio o tratamiento.',
    'create-appt-block-tab': 'Registra un bloqueo de agenda para periodos no laborables.',
    'create-appt-client-select-trigger': 'Selecciona el cliente que recibirá la sesión.',
    'create-appt-service-select-trigger': 'Elige el tratamiento o técnica a realizar.',
    'create-appt-notes-textarea': 'Introduce anotaciones especiales para la cita.',
    'create-appt-submit-btn': 'Confirma y agenda la cita o bloqueo.',
    'create-appt-cancel-btn': 'Cancela la operación sin guardar.',
    'edit-appt-notes-textarea': 'Añade o modifica observaciones de la cita.',
    'edit-appt-save-notes-btn': 'Guarda los comentarios clínicos de la cita.',
    'edit-appt-confirm-web-booking-btn': 'Acepta y confirma la cita solicitada desde la web.',
    'edit-appt-whatsapp-btn': 'Envía una plantilla de recordatorio de cita vía WhatsApp.',
    'edit-appt-status-select-trigger': 'Modifica el estado de asistencia de la cita.',
    'edit-appt-delete-btn': 'Elimina o anula definitivamente esta cita de la agenda.',
    'delete-block-confirm-btn': 'Confirma la eliminación del bloqueo de tiempo.',
    'delete-block-cancel-btn': 'Cancela la eliminación del bloqueo.',

    // POS
    'pos-ticket-toggle': 'Alterna entre emitir Ticket Simplificado o Factura Nominal.',
    'pos-client-search': 'Busca un cliente para vincular la venta a su historial.',
    'pos-service-select': 'Selecciona el tratamiento realizado.',
    'pos-amount-input': 'Define o modifica el precio cobrado en la sesión.',
    'pos-pay-card': 'Registra la venta como cobrada con tarjeta/datáfono.',
    'pos-pay-cash': 'Registra la venta como cobrada en efectivo.',
    'pos-submit-btn': 'Procesa la transacción y genera el comprobante fiscal.',
    'pos-view-invoices-link': 'Navega al registro general de facturas.',
    'pos-new-sale-btn': 'Inicia un nuevo formulario de venta en blanco.',

    // Clientes
    'add-client-btn': 'Abre el formulario para registrar un nuevo paciente.',
    'client-form': 'Completa la ficha para dar de alta al paciente.',
    'client-first-name-input': 'Introduce el nombre de pila del cliente.',
    'client-last-name-input': 'Introduce los apellidos del cliente.',
    'client-email-input': 'Dirección de correo electrónico del cliente.',
    'client-phone-input': 'Número de teléfono de contacto.',
    'client-dni-input': 'NIF / DNI o documento fiscal del paciente.',
    'client-service-address-input': 'Introduce la dirección de servicio para visitas a domicilio.',
    'client-service-postal-code-input': 'Código postal del domicilio.',
    'client-service-city-input': 'Ciudad de servicio a domicilio.',
    'billing-diff-check': 'Marca esta opción si los datos fiscales difieren del domicilio.',
    'client-billing-name-input': 'Razón social o nombre para la facturación.',
    'client-billing-nif-input': 'NIF/CIF para la facturación.',
    'client-billing-address-input': 'Dirección fiscal registrada.',
    'clinical-allergies-input': 'Registra alergias conocidas del paciente.',
    'clinical-medications-input': 'Medicamentos consumidos habitualmente.',
    'clinical-injury-history-input': 'Historial de operaciones, patologías o lesiones.',
    'clinical-notes-textarea': 'Anotaciones del estado de salud del paciente.',
    'beauty-skin-hair-type-input': 'Tipo de piel, fototipo o textura del cabello.',
    'beauty-product-sensitivities-input': 'Reacciones a cosméticos o tintes químicos.',
    'beauty-color-formulas-textarea': 'Fórmulas para coloraciones o tratamientos capilares.',
    'general-internal-notes-textarea': 'Notas internas libres para el personal.',
    'cancel-add-client-btn': 'Cierra el formulario sin registrar.',
    'submit-client-form-btn': 'Guarda y crea la ficha del cliente.',
    'back-to-directory-link': 'Vuelve al listado general de clientes.',
    'book-appointment-link': 'Agenda cita vinculada directamente a este cliente.',
    'edit-client-profile-btn': 'Modifica la información de contacto o perfil.',
    'tab-overview-btn': 'Consulta los datos básicos del expediente.',
    'tab-appointments-btn': 'Revisa el historial de visitas.',
    'tab-vouchers-btn': 'Revisa los bonos contratados por el cliente.',
    'tab-consents-btn': 'Gestiona las firmas y consentimientos informados.',
    'sell-voucher-link': 'Vende y asigna un nuevo bono a este paciente.',
    'sign-consent-btn': 'Abre el panel interactivo para firmar un nuevo consentimiento.',
    'consent-type-select-trigger': 'Elige el tipo de tratamiento para el documento legal.',
    'signature-canvas': 'Lienzo para que el cliente realice su firma física digitalizada.',
    'clear-signature-canvas-btn': 'Borra el lienzo para repetir la firma.',
    'submit-signature-btn': 'Guarda la firma y asocia el consentimiento.',
    'cancel-signature-btn': 'Cancela la firma del documento.',
    'back-to-consents-btn': 'Vuelve a la lista de consentimientos.',
    'print-consent-btn': 'Imprime el documento de consentimiento firmado.',

    // Facturas
    'invoice-status-tab-all': 'Muestra todos los comprobantes de facturación.',
    'invoice-status-tab-paid': 'Muestra solo los comprobantes ya cobrados.',
    'invoice-status-tab-pending': 'Muestra comprobantes pendientes de pago.',
    'invoice-date-preset-trigger': 'Filtra las facturas por rango de fecha rápido.',
    'invoice-search-input': 'Busca facturas por concepto o paciente.',
    'invoice-export-pdf-btn': 'Descarga en PDF la hoja de facturación actual.',
    'invoice-export-csv-btn': 'Exporta el listado en formato CSV para tu contabilidad.',
    'invoice-page-prev-btn': 'Página anterior de facturas.',
    'invoice-page-next-btn': 'Página siguiente de facturas.',
    'invoice-back-btn': 'Vuelve al registro general de facturación.',
    'invoice-client-record-link': 'Abre el expediente de este cliente.',
    'invoice-status-change-trigger': 'Cambia el estado de cobro de esta factura.',
    'invoice-cancel-change-btn': 'Cancela el cambio de estado.',
    'invoice-confirm-change-btn': 'Confirma el cambio de estado.',
    'invoice-print-btn': 'Imprime el folio A4 de la factura.',
    'invoice-rotate-left-btn': 'Rota el sello y firma digital hacia la izquierda.',
    'invoice-rotate-right-btn': 'Rota el sello y firma digital hacia la derecha.',

    // Bonos
    'vouchers-tab-issued': 'Consulta los bonos vendidos y activos.',
    'vouchers-tab-catalog': 'Consulta los modelos base del catálogo.',
    'vouchers-action-btn': 'Crea una nueva plantilla o emite un bono a un cliente.',
    'assign-voucher-client-trigger': 'Elige el cliente que recibirá el bono.',
    'assign-voucher-template-search': 'Busca la plantilla del catálogo por nombre.',
    'assign-voucher-change-template-btn': 'Modifica la plantilla elegida.',
    'assign-voucher-price-input': 'Ajusta el precio final acordado del bono.',
    'assign-voucher-initial-pay-input': 'Monto cobrado hoy.',
    'assign-voucher-expiration-trigger': 'Determina el tiempo de vigencia del bono.',
    'assign-voucher-submit-btn': 'Completa la emisión del bono.',
    'template-name-input': 'Nombre comercial del modelo de bono.',
    'template-service-trigger': 'Tratamiento base asociado al bono.',
    'template-sessions-input': 'Define el número de sesiones incluidas.',
    'template-price-input': 'Precio base propuesto.',
    'template-submit-btn': 'Registra la plantilla en el catálogo.',
    'pay-debt-amount-input': 'Importe entregado por el cliente hoy.',
    'pay-debt-cancel-btn': 'Cancela el cobro de deuda.',
    'pay-debt-submit-btn': 'Registra el abono a la deuda.',

    // Ajustes
    'general-clinic-name': 'Edita el nombre oficial del establecimiento.',
    'general-legal-name': 'Edita la razón social del negocio.',
    'general-clinic-nif': 'Edita el NIF/CIF fiscal del centro.',
    'general-clinic-address': 'Modifica la dirección física de la clínica.',
    'general-clinic-description': 'Modifica la descripción corta de la landing.',
    'branding-logo-change-btn': 'Cambia el logotipo principal de la aplicación.',
    'branding-favicon-load-btn': 'Sube el favicon del sitio web.',
    'consents-new-template-btn': 'Redacta una nueva plantilla de consentimiento legal.',
    'billing-invoice-prefix': 'Configura el prefijo de tus facturas.',
    'billing-invoice-next-number': 'Establece el número de la siguiente factura.',
    'billing-logo-pdf-btn': 'Modifica el logo que aparece en tus facturas PDF.',
    'billing-signature-btn': 'Sube tu cuño y firma digital para facturas.',
    'payments-connect-stripe-btn': 'Vincula tu cuenta para cobrar fianzas online.',
    
    // Ajustes - Diseño de Reservas (Booking UI)
    'booking-layout-grid-btn': 'Elige el formato de cuadrícula (Grid) para mostrar tus servicios en el portal público de forma visual.',
    'booking-layout-list-btn': 'Elige el formato de lista compacta si prefieres una distribución tradicional de tratamientos.',

    // Ajustes Agenda Tab (horarios y ausencias)
    'agenda-open-time': 'Define la hora de apertura diaria de tu centro.',
    'agenda-close-time': 'Define la hora de cierre diaria de tu centro.',
    'agenda-lunch-start': 'Define el inicio del descanso de mediodía de la agenda.',
    'agenda-lunch-end': 'Define el fin del descanso de mediodía.',
    'agenda-add-absence-btn': 'Registra un período vacacional o días festivos en bloque.',
    'agenda-booking-margin-hours': 'Horas de antelación mínimas requeridas para que un cliente reserve online.',

    // CMS / Editor Web
    'cms-bento-home-builder': 'Abre el constructor visual para editar el Hero, Sobre Mí, tratamientos y SEO de la página principal.',
    'cms-bento-nav-editor': 'Accede al gestor de enlaces del menú superior y distribución del megamenú público.',
    'cms-bento-branding': 'Redirecciona a la pestaña de ajustes para cambiar la paleta de colores y fuentes de la clínica.',
    'cms-bento-pages': 'Navega al gestor para crear y publicar páginas independientes de políticas o promociones.',
    'cms-new-page-btn': 'Haz clic para crear una nueva página personalizada e introducir su URL/título.',

    // Mi Perfil Digital
    'profile-fullname-input': 'Actualiza tu nombre completo para firmas y comunicaciones.',
    'profile-avatar-upload-btn': 'Sube o cambia tu fotografía de perfil profesional.',
    'profile-save-all-btn': 'Guardar todos los cambios en tu perfil y notificaciones.',
    'profile-new-password-input': 'Escribe una nueva contraseña segura para tu acceso.',
    'profile-update-password-btn': 'Aplica el cambio de tu contraseña.',
    'profile-logout-btn': 'Cierra tu sesión actual de forma segura.',
    'profile-email-appointments-check': 'Activa o desactiva los avisos de reservas/cancelaciones por email.',
    'profile-agenda-reminders-check': 'Activa o desactiva el resumen matutino diario de tu agenda.',
    
    // Gestión
    'team-add-member-btn': 'Envía una invitación a un nuevo miembro del equipo.',
    'locations-add-btn': 'Agrega una nueva sucursal física de tu negocio.',
    'services-new-btn': 'Agrega un nuevo tratamiento al catálogo.',
    'services-categories-btn': 'Organiza y edita las categorías de tus tratamientos.'
  };

  return dictionary[id] || 'Aquí puedes realizar acciones rápidas guiadas por tu Co-Piloto de IA.';
}

export default function CoachTooltipManager() {
  return (
    <Suspense fallback={null}>
      <CoachTooltipContent />
    </Suspense>
  );
}
