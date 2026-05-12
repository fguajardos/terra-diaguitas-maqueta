// Mock de integraciones externas (§2.2 del documento): solo logs en consola + toasts.
// La UI usa `sonner` para los toasts; aquí solo dejamos los disparadores tipo-domain.
import { toast } from 'sonner';

export interface NotificacionEmail {
  destinatario: string;
  asunto: string;
  cuerpo: string;
}

export interface NotificacionWhatsApp {
  telefono: string;
  cuerpo: string;
}

export function enviarEmail(notif: NotificacionEmail): void {
  console.info('[mock email]', notif);
  toast.success('Email enviado (simulado)', {
    description: `${notif.destinatario} · ${notif.asunto}`,
  });
}

export function enviarWhatsApp(notif: NotificacionWhatsApp): void {
  console.info('[mock whatsapp]', notif);
  toast.success('WhatsApp enviado (simulado)', { description: notif.telefono });
}

export function notificarBookingEngine(evento: string, payload: Record<string, unknown>): void {
  console.info('[mock booking-engine]', evento, payload);
}

export function notificarERP(evento: string, payload: Record<string, unknown>): void {
  console.info('[mock erp]', evento, payload);
}
