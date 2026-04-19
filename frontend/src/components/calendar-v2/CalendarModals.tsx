import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Unlock, Sparkles, Trash2, AlertTriangle, Phone, Save, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditAppointmentModal } from './modals/EditAppointmentModal';
import { CreateAppointmentModal } from './modals/CreateAppointmentModal';
import { DeleteBlockConfirm } from './modals/DeleteBlockConfirm';

interface CalendarModalsProps {
  // Control de visibilidad
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  showEditModal: boolean;
  setShowEditModal: (v: boolean) => void;
  showBlockDeleteModal: boolean;
  setShowBlockDeleteModal: (v: boolean) => void;

  // Datos de selección
  selectedSlot: { date: Date, hour: number } | null;
  selectedMinutes: number;
  setSelectedMinutes: (m: number) => void;
  selectedAppt: any;
  setSelectedAppt: (appt: any) => void;
  selectedBlock: any;
  setSelectedBlock: (block: any) => void;

  // Datos globales y filtros
  clients: any[];
  services: any[];
  settings: any;
  startHour: number;
  endHour: number;
  getAppointmentsForDay: (d: Date) => any[];
  getBlocksForDay: (d: Date) => any[];
  clientMap: Map<string, any>;
  serviceMap: Map<string, any>;
  fetchData: () => Promise<void>;
  openWhatsApp: (name: string, phone: string, service: string, start: string) => void;
}

/**
 * CalendarModals (v2)
 * Orquestador de todos los diálogos de la agenda:
 * - Creación de Citas / Bloqueos
 * - Edición de Citas (Notas, Estados, WhatsApp)
 * - Liberación de Horarios bloqueados
 */
export function CalendarModals({
  showModal, setShowModal,
  showEditModal, setShowEditModal,
  showBlockDeleteModal, setShowBlockDeleteModal,
  selectedSlot,
  selectedMinutes, setSelectedMinutes,
  selectedAppt, setSelectedAppt,
  selectedBlock, setSelectedBlock,
  clients, services, settings,
  startHour, endHour,
  getAppointmentsForDay, getBlocksForDay,
  clientMap, serviceMap,
  fetchData,
  openWhatsApp
}: CalendarModalsProps) {
  const { showFeedback } = useFeedback();

  // Estados para Edición (necesarios para los handlers del Orquestador)
  const [editNotes, setEditNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Sincronización de notas al editar
  useEffect(() => {
    if (selectedAppt) {
      setEditNotes(selectedAppt.notes || '');
    }
  }, [selectedAppt]);

  /**
   * HANDLERS DE EDICIÓN
   */
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedAppt) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${selectedAppt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchData();
        setShowEditModal(false);
        toast.success('Estado actualizado');
      } else {
        toast.error('Error al actualizar');
      }
    } catch (e) {
      toast.error('Error de conexión');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedAppt) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${selectedAppt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editNotes })
      });
      if (res.ok) {
        await fetchData();
        setSelectedAppt({ ...selectedAppt, notes: editNotes });
        toast.success('Nota guardada');
      } else {
        toast.error('Error al guardar nota');
      }
    } catch (e) {
      toast.error('Error de conexión');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppt) return;
    showFeedback({
      type: 'confirm',
      title: 'Eliminar Cita',
      message: '¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        setUpdatingStatus(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${selectedAppt.id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            await fetchData();
            setShowEditModal(false);
            toast.success('Cita eliminada');
          } else {
            toast.error('Error al eliminar');
          }
        } catch (e) {
          toast.error('Error de conexión');
        } finally {
          setUpdatingStatus(false);
        }
      }
    });
  };

  const handleDeleteBlock = () => {
    // La lógica se ha movido al componente modular DeleteBlockConfirm
  };

  return (
    <>
      {/* 1. Modal de Creación (Modularizado V2) */}
      <CreateAppointmentModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedSlot={selectedSlot}
        selectedMinutes={selectedMinutes}
        setSelectedMinutes={setSelectedMinutes}
        clients={clients}
        services={services}
        settings={settings}
        startHour={startHour}
        endHour={endHour}
        getAppointmentsForDay={getAppointmentsForDay}
        getBlocksForDay={getBlocksForDay}
        fetchData={fetchData}
      />

      {/* 2. Modal de Liberación de Bloqueo (Modularizado V2) */}
      <DeleteBlockConfirm
        showBlockDeleteModal={showBlockDeleteModal}
        setShowBlockDeleteModal={setShowBlockDeleteModal}
        selectedBlock={selectedBlock}
        fetchData={fetchData}
      />

      {/* 3. Modal de Edición de Cita (Modularizado V2) */}
      <EditAppointmentModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        selectedAppt={selectedAppt}
        setSelectedAppt={setSelectedAppt}
        clientMap={clientMap}
        serviceMap={serviceMap}
        editNotes={editNotes}
        setEditNotes={setEditNotes}
        updatingStatus={updatingStatus}
        handleStatusChange={handleStatusChange}
        handleUpdateNotes={handleUpdateNotes}
        handleDeleteAppointment={handleDeleteAppointment}
        openWhatsApp={openWhatsApp}
      />
    </>
  );
}
