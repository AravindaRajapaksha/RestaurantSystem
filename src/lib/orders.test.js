import { describe, expect, it } from 'vitest';
import { normalizeOrder, ORDER_STATUSES } from './orders';

describe('orders helpers', () => {
  it('normalizes numeric order values', () => {
    const order = normalizeOrder({
      subtotal: '12.50',
      delivery_fee: '5.00',
      total: '17.50',
      order_items: [
        {
          quantity: '2',
          unit_price: '6.25',
          line_total: '12.50',
        },
      ],
    });

    expect(order.subtotal).toBe(12.5);
    expect(order.delivery_fee).toBe(5);
    expect(order.total).toBe(17.5);
    expect(order.order_items[0].quantity).toBe(2);
    expect(order.order_items[0].unit_price).toBe(6.25);
  });

  it('exposes the supported admin order statuses', () => {
    expect(ORDER_STATUSES).toEqual([
      'pending',
      'preparing',
      'out_for_delivery',
      'delivered',
      'cancelled',
    ]);
  });
});
