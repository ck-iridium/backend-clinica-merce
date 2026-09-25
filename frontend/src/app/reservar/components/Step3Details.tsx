"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/contexts/LanguageContext';

import { getTenantId } from './step3/utils';
import AppointmentSummaryCard from './step3/AppointmentSummaryCard';
import SavedAddressBanner from './step3/SavedAddressBanner';
import HomeAddressSelector from './step3/HomeAddressSelector';
import ClientContactFields from './step3/ClientContactFields';
import DepositInfoModal from './step3/DepositInfoModal';
import PinDropMapModal from './step3/PinDropMapModal';

export default function Step3Details({
  formData,
  setFormData,
  selectedDate,
  selectedTime,
  selectedService,
  privacyAccepted,
  setPrivacyAccepted,
  settings,
  selectedLocation
}: {
  formData: any;
  setFormData: (d: any) => void;
  selectedDate: Date;
  selectedTime: string;
  selectedService: any;
  privacyAccepted: boolean;
  setPrivacyAccepted: (v: boolean) => void;
  settings?: any;
  selectedLocation?: any;
}) {
  const { t, translate } = useLanguage();

  const [showFianzaInfo, setShowFianzaInfo] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [addressQuery, setAddressQuery] = useState(formData.client_address || '');
  const [savedAddressData, setSavedAddressData] = useState<any | null>(null);

  // 1-Click Checkout: Comprobar si el cliente recurrente ya tiene dirección guardada en el CRM
  useEffect(() => {
    const email = (formData.email || '').trim();
    const phone = (formData.phone || '').trim();

    if (email.length > 5 && phone.length > 7) {
      const tenantId = getTenantId();
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/appointments/client-saved-address?email=${encodeURIComponent(
          email
        )}&phone=${encodeURIComponent(phone)}`,
        {
          headers: { 'X-Tenant-ID': tenantId }
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.has_saved_address) {
            setSavedAddressData(data);
          } else {
            setSavedAddressData(null);
          }
        })
        .catch(() => setSavedAddressData(null));
    } else {
      setSavedAddressData(null);
    }
  }, [formData.email, formData.phone]);

  const handleApplySavedAddress = () => {
    if (!savedAddressData) return;
    setFormData({
      ...formData,
      client_address: savedAddressData.client_address,
      client_latitude: savedAddressData.client_latitude,
      client_longitude: savedAddressData.client_longitude,
      client_postal_code: savedAddressData.client_postal_code,
      client_city: savedAddressData.client_city
    });
    setAddressQuery(savedAddressData.client_address);
    setSavedAddressData(null);
  };

  const handleConfirmPinCoordinates = (result: {
    address: string;
    lat: number;
    lon: number;
    postal_code: string;
    city: string;
  }) => {
    setFormData({
      ...formData,
      client_address: result.address,
      client_latitude: result.lat,
      client_longitude: result.lon,
      client_postal_code: result.postal_code,
      client_city: result.city
    });
    setAddressQuery(result.address);
  };

  const showModalitySelector =
    (selectedService?.allowed_modality === 'both' || !selectedService?.allowed_modality) &&
    (settings?.work_modality === 'both' || settings?.work_modality === 'mix');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full flex flex-col flex-grow min-h-0 bg-background text-foreground animate-in duration-300"
    >
      {/* ── HEADER DEL PASO ── */}
      <div className="shrink-0 px-6 pt-4 pb-2 z-30 bg-background">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-foreground tracking-tight">
          {t('wizard.fill_details')}
        </h1>
        <p className="text-[11px] md:text-xs lg:text-sm text-muted-foreground mt-1 uppercase tracking-[0.15em] font-medium truncate">
          {t('wizard.finish_booking_for')}{' '}
          <span className="text-primary font-bold">
            {translate(selectedService?.name, selectedService?.translations, 'name')}
          </span>
        </p>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar px-6 pt-3 pb-6 space-y-5">
        
        {/* ── 1. TARJETA RESUMEN DE CITA Y FIANZA ── */}
        <AppointmentSummaryCard
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedService={selectedService}
          selectedLocation={selectedLocation}
          settings={settings}
          onOpenDepositInfo={() => setShowFianzaInfo(true)}
        />

        {/* ── 2. BANNER 1-CLICK CHECKOUT: DIRECCIÓN HABITUAL DETECTADA ── */}
        <SavedAddressBanner
          savedAddressData={savedAddressData}
          serviceModality={formData.service_modality}
          onApplySavedAddress={handleApplySavedAddress}
        />

        {/* ── 3. FORMULARIO PRINCIPAL: MODALIDAD, DIRECCIÓN & CONTACTO ── */}
        <div className="space-y-4">
          
          {/* Selector de Modalidad y Dirección a Domicilio */}
          <HomeAddressSelector
            formData={formData}
            setFormData={setFormData}
            addressQuery={addressQuery}
            setAddressQuery={setAddressQuery}
            showModalitySelector={showModalitySelector}
            onOpenMapModal={() => setShowMapModal(true)}
          />

          {/* Datos Personales, Honeypot Anti-Spam y Aceptación de Privacidad */}
          <ClientContactFields
            formData={formData}
            setFormData={setFormData}
            privacyAccepted={privacyAccepted}
            setPrivacyAccepted={setPrivacyAccepted}
          />

        </div>
      </div>

      {/* ── MODAL 1: EXPLICACIÓN DE POLÍTICA DE FIANZA ── */}
      <DepositInfoModal
        isOpen={showFianzaInfo}
        onClose={() => setShowFianzaInfo(false)}
        selectedService={selectedService}
        settings={settings}
      />

      {/* ── MODAL 2: MAPA INTERACTIVO DE PIN DROP ── */}
      <PinDropMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        initialLat={formData.client_latitude}
        initialLon={formData.client_longitude}
        fallbackLat={settings?.operations_center_latitude || 40.416775}
        fallbackLon={settings?.operations_center_longitude || -3.703790}
        onConfirmCoordinates={handleConfirmPinCoordinates}
      />

    </motion.div>
  );
}
