export const ENTITLEMENT_ID = 'dueish_pro';
export const plans = [
  { id: 'monthly', title: 'Monthly', price: '$2.99', period: 'month', detail: 'A little room, month by month.' },
  { id: 'annual', title: 'Yearly', price: '$19.99', period: 'year', detail: 'A whole year of less to remember.' },
  { id: 'lifetime', title: 'Lifetime', price: '$39.99', period: 'once', detail: 'One payment. Yours for good.' },
] as const;
export type PlanId = typeof plans[number]['id'];
