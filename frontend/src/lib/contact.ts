import { business, formatNaira, type Order, type TradeRequest } from '@kovra/shared';
import { Linking } from 'react-native';

export const callStore = () => Linking.openURL(`tel:${business.phone}`);

export const chatOnWhatsApp = (message = 'Hi Kovra, I have a question.') =>
  Linking.openURL(`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`);

export function orderMessage(order: Order): string {
  const items = order.lines.map((line) => `• ${line.quantity} × ${line.name}${line.storage ? ` (${line.storage})` : ''}`);
  return [
    `Hi Kovra, I just placed order ${order.reference}.`,
    ...items,
    `Total: ${formatNaira(order.total)}`,
    order.payment === 'transfer' ? 'Please send your account details for the transfer.' : 'I’ll pay on delivery.',
  ].join('\n');
}

export function tradeMessage(request: TradeRequest, deviceName: string): string {
  const verb = request.kind === 'swap' ? 'swap' : 'sell';
  return `Hi Kovra, I’d like to ${verb} my ${deviceName}. My request reference is ${request.reference}.`;
}
