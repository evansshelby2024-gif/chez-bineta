import { Order, SundayReservation } from '../types';

export const BINETA_PHONE_DISPLAY = '+221 75 508 97 31';
export const BINETA_PHONE_CLEAN = '221755089731';
export const BINETA_ADDRESS = 'Saint-Louis, Ngallel, côté DSCOS';

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export function formatSimpleFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' F';
}

export function buildWhatsAppOrderLink(order: Order): string {
  const modeText = order.mode === 'livraison' ? '🚚 Livraison à domicile' : '🏪 Retrait sur place';
  
  let receptionDetails = '';
  if (order.mode === 'retrait') {
    receptionDetails = `*Heure de retrait souhaitée :* ${order.pickupTime || 'Dès que possible'}`;
  } else {
    receptionDetails = `*Adresse :* ${order.address || 'Non spécifiée'}\n*Quartier :* ${order.quartier || 'Saint-Louis'}\n*Repères / Indications :* ${order.indications || 'Aucun'}`;
  }

  const itemsList = order.items
    .map(
      (item) =>
        `• ${item.name}${item.selectedOption ? ` [${item.selectedOption}]` : ''} × ${item.quantity} ➔ ${formatFCFA(item.price * item.quantity)}`
    )
    .join('\n');

  const paymentText =
    order.mode === 'livraison'
      ? 'Espèces après réception de la commande'
      : 'Espèces lors du retrait de la commande';

  const notesText = order.notes ? `\n*Note client :* ${order.notes}` : '';

  const rawMessage = `*🍔 NOUVELLE COMMANDE CHEZ BINETA*
*Commande :* ${order.id}
*Client :* ${order.customerName}
*Téléphone :* ${order.phone}
*Mode :* ${modeText}
${receptionDetails}

*DÉTAIL DES PLATS :*
${itemsList}

*💰 TOTAL :* ${formatFCFA(order.total)}
*💵 Mode de Paiement :* ${paymentText}${notesText}

_Merci de confirmer ma commande Chez Bineta !_`;

  return `https://wa.me/${BINETA_PHONE_CLEAN}?text=${encodeURIComponent(rawMessage)}`;
}

export function buildWhatsAppCustomerReplyLink(order: Order, statusMessage: string): string {
  const cleanCustomerPhone = order.phone.replace(/[^0-9]/g, '');
  const targetPhone = cleanCustomerPhone.startsWith('221') 
    ? cleanCustomerPhone 
    : cleanCustomerPhone.length === 9 
      ? `221${cleanCustomerPhone}` 
      : cleanCustomerPhone;

  const rawMessage = `Bonjour ${order.customerName} ! 👋\nIci Chez Bineta pour votre commande *${order.id}*.\n\n${statusMessage}\n\n📍 Adresse : ${BINETA_ADDRESS}\n📞 Contact : ${BINETA_PHONE_DISPLAY}`;
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(rawMessage)}`;
}

export function buildWhatsAppSundayReservationLink(res: SundayReservation): string {
  const rawMessage = `*🟠 RÉSERVATION DIMANCHE CHEZ BINETA*
*Nom :* ${res.customerName}
*Téléphone :* ${res.phone}
*Date :* ${res.date}
*Heure :* ${res.time}
*Plats souhaités :* ${res.dishesDesired}
${res.guestCount ? `*Nombre de personnes :* ${res.guestCount}` : ''}
${res.notes ? `*Précisions :* ${res.notes}` : ''}

_Demande de réservation à l'avance Chez Bineta_`;

  return `https://wa.me/${BINETA_PHONE_CLEAN}?text=${encodeURIComponent(rawMessage)}`;
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "À l'instant";
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  const hours = Math.floor(diffInMinutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
