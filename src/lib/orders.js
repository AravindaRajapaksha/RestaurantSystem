import { supabase } from './supabase';

export const ORDER_STATUSES = [
  'pending',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const ORDER_SELECT = `
  id,
  user_id,
  order_number,
  customer_name,
  customer_email,
  customer_phone,
  delivery_address,
  payment_method,
  status,
  subtotal,
  delivery_fee,
  total,
  created_at,
  updated_at,
  order_items (
    id,
    food_id,
    item_name,
    item_image,
    unit_price,
    quantity,
    line_total
  )
`;

const normalizeMoney = (value) => Number(value || 0);

const normalizeOrderItem = (item) => ({
  ...item,
  quantity: Number(item.quantity || 0),
  unit_price: normalizeMoney(item.unit_price),
  line_total: normalizeMoney(item.line_total),
});

export const normalizeOrder = (order) => ({
  ...order,
  subtotal: normalizeMoney(order.subtotal),
  delivery_fee: normalizeMoney(order.delivery_fee),
  total: normalizeMoney(order.total),
  order_items: (order.order_items || []).map(normalizeOrderItem),
});

export const fetchOrders = async ({ userId } = {}) => {
  let query = supabase
    .from('orders')
    .select(ORDER_SELECT)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data.map(normalizeOrder);
};

const syncCustomerProfile = async ({ user, customerName, customerPhone }) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: customerName.trim(),
      phone: customerPhone.trim(),
    })
    .eq('id', user.id);

  if (error) {
    throw error;
  }
};

const buildOrderNumber = () => {
  const timestamp = new Date().toISOString().replace(/\D/g, '').slice(2, 14);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
};

export const createOrder = async ({
  user,
  customerName,
  deliveryAddress,
  customerPhone,
  paymentMethod = 'cod',
  items,
}) => {
  if (!user?.id) {
    throw new Error('You must be logged in to place an order.');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Your cart is empty.');
  }

  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = normalizeMoney(item.price);

    return {
      food_id: item.id ?? null,
      item_name: item.name,
      item_image: item.image || null,
      quantity,
      unit_price: unitPrice,
      line_total: Number((unitPrice * quantity).toFixed(2)),
    };
  });

  const subtotal = Number(
    normalizedItems.reduce((sum, item) => sum + item.line_total, 0).toFixed(2)
  );
  const deliveryFee = subtotal > 50 ? 0 : 5;
  const total = Number((subtotal + deliveryFee).toFixed(2));

  await syncCustomerProfile({
    user,
    customerName,
    customerPhone,
  });

  const { data: createdOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      order_number: buildOrderNumber(),
      customer_name: customerName.trim(),
      customer_email: user.email || '',
      customer_phone: customerPhone.trim(),
      delivery_address: deliveryAddress.trim(),
      payment_method: paymentMethod,
      status: 'pending',
      subtotal,
      delivery_fee: deliveryFee,
      total,
    })
    .select(`
      id,
      user_id,
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      payment_method,
      status,
      subtotal,
      delivery_fee,
      total,
      created_at,
      updated_at
    `)
    .single();

  if (orderError) {
    throw orderError;
  }

  const { data: createdItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(
      normalizedItems.map((item) => ({
        ...item,
        order_id: createdOrder.id,
      }))
    )
    .select('*');

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', createdOrder.id);
    throw itemsError;
  }

  return normalizeOrder({
    ...createdOrder,
    order_items: createdItems,
  });
};

export const updateOrderStatus = async (orderId, status) => {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error('Invalid order status.');
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select(ORDER_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return normalizeOrder(data);
};
