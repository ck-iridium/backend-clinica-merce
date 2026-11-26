"use client";

import React from 'react';
import { CounterModeManagerProps } from './counter/types';
import { useCounterMode } from './counter/hooks/useCounterMode';
import { CounterQRModal } from './counter/components/CounterQRModal';
import { CounterLockScreen } from './counter/components/CounterLockScreen';

/**
 * CounterModeManager
 * Orquestador principal del Modo Mostrador Protegido y Control de Fichaje.
 * Conecta el hook de ciclo de vida useCounterMode con los componentes visuales modulares.
 */
export default function CounterModeManager(props: CounterModeManagerProps) {
  const {
    mounted,
    enableCounterMode,
    enableTimeClock,
    isDarkMode,
    isLocked,
    autolockMinutes,
    clinicName,
    showQRModal,
    setShowQRModal,
    qrToken,
    qrUrl,
    qrSecondsLeft,
    isFetchingToken,
    availableOperators,
    isLoadingOperators,
    selectedOperator,
    setSelectedOperator,
    pinValue,
    pinError,
    isVerifyingPin,
    handlePinInput,
    handlePinBackspace,
    handleResetOperator,
    unlockCounter,
    handleLogout,
    showcaseServices,
  } = useCounterMode(props);

  // Evitar desajustes de hidratación (React #418) en SSR
  if (!mounted) return null;

  // Si está desactivado en ajustes y no está bloqueado ni abierto el modal de QR, no renderizar nada
  if (!enableCounterMode && !isLocked && !showQRModal) return null;

  return (
    <>
      <CounterQRModal
        isOpen={showQRModal}
        onClose={setShowQRModal}
        qrToken={qrToken}
        qrUrl={qrUrl}
        qrSecondsLeft={qrSecondsLeft}
        isFetchingToken={isFetchingToken}
      />

      {isLocked && (
        <CounterLockScreen
          clinicName={clinicName}
          isDarkMode={isDarkMode}
          enableTimeClock={enableTimeClock}
          autolockMinutes={autolockMinutes}
          availableOperators={availableOperators}
          isLoadingOperators={isLoadingOperators}
          selectedOperator={selectedOperator}
          pinValue={pinValue}
          pinError={pinError}
          isVerifyingPin={isVerifyingPin}
          showcaseServices={showcaseServices}
          onOpenQR={() => setShowQRModal(true)}
          onLogout={handleLogout}
          onSelectOperator={setSelectedOperator}
          onUnlockCounter={unlockCounter}
          onPinInput={handlePinInput}
          onPinBackspace={handlePinBackspace}
          onResetOperator={handleResetOperator}
        />
      )}
    </>
  );
}
