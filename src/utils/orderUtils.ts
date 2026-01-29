import { Order, OrderItem, PavilionGroup, Product } from '../types';

export const groupOrderByPavilions = (order: Order, products: Product[]): PavilionGroup[] => {
  const pavilionMap = new Map<string, OrderItem[]>();
  
  order.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product && product.pavilionNumber) {
      const pavilion = product.pavilionNumber;
      if (!pavilionMap.has(pavilion)) {
        pavilionMap.set(pavilion, []);
      }
      pavilionMap.get(pavilion)!.push(item);
    }
  });

  return Array.from(pavilionMap.entries()).map(([pavilionNumber, items]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const product = products.find(p => p.id === items[0].productId);
    
    return {
      pavilionNumber,
      items,
      total,
      sellerId: product?.sellerId,
      paymentStatus: order.payments?.[pavilionNumber]?.status || 'pending',
      collectionStatus: 'pending'
    };
  });
};

export const isOrderFullyPaid = (order: Order): boolean => {
  if (!order.payments) return false;
  
  const pavilionGroups = order.pavilionGroups || [];
  const allPavilionsPaid = pavilionGroups.every(group => 
    order.payments![group.pavilionNumber]?.status === 'paid'
  );
  
  const deliveryPaid = !order.deliveryPrice || order.payments.delivery?.status === 'paid';
  
  return allPavilionsPaid && deliveryPaid;
};

export const getOrderPaymentSummary = (order: Order) => {
  const pavilionGroups = order.pavilionGroups || [];
  const totalItems = pavilionGroups.reduce((sum, group) => sum + group.total, 0);
  const deliveryPrice = order.deliveryPrice || 0;
  const totalOrder = totalItems + deliveryPrice;
  
  let paidAmount = 0;
  pavilionGroups.forEach(group => {
    if (order.payments?.[group.pavilionNumber]?.status === 'paid') {
      paidAmount += group.total;
    }
  });
  
  if (order.payments?.delivery?.status === 'paid') {
    paidAmount += deliveryPrice;
  }
  
  return {
    totalItems,
    deliveryPrice,
    totalOrder,
    paidAmount,
    remainingAmount: totalOrder - paidAmount,
    isFullyPaid: paidAmount === totalOrder
  };
};