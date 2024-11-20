export interface ErrorResponse {
  message: string;
}

export interface SuccessResponse<T> {
  message: string;
  data?: T;
}

export interface InfiniteSuccessReponse<T> {
  data: {
    message: string;
    data: T;
    current_page: number;
    first_page_url: string | null;
    from: number;
    last_page: number;
    last_page_url: string | null;
    next_page_url: string | null;
    path: string | null;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface Product {
  id: number;
  number: string | null;
  name: string | null;
  description: string | null;
  purchase_price: number | null;
  average_purchase_price: number | null;
  sale_price: number | null;
  type: string | null;
}

export interface Customer {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  outlet_id: string | number | null;
  outlet: Outlet | null;
}

export interface Outlet {
  id: number;
  number: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  outlet_id: string | number | null;
  latitude: string | null;
  longitude: string | null;
}

export interface OutletSaleOrder {
  id: number;
  number: string | null;
  date: string | null;
  subtotal: number | null;
  total: number | null;
  payment_amount: number | null;
  payment_method: string | null;
  note: string | null;
  status: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  recipient_address: string | null;
  proof_of_payment_file_url: string | null;
  proof_of_payment_file_name: string | null;
  proof_of_payment_file_size: string | null;
  customer_id: number | null;
  outlet_id: number | null;
  ordered_at: string | null;
  delivered_at: string | null;
  received_at: string | null;
  paid_at: string | null;
  finished_at: string | null;
  customer: Customer | null;
  outlet: Outlet | null;
  items: OutletSaleOrderItem[];
}

export interface OutletSaleOrderItem {
  id: number;
  price: number | null;
  quantity: number | null;
  amount: number | null;
  note: string | null;
  product: Product | null;
}

export interface OutletSaleOrderItemDto {
  good_id: number | null;
  price: number | null;
  qty: number | null;
  amount: number | null;
  note: string | null;
}

export interface OutletSaleOrderDto {
  date: string | null;
  subtotal: number | null;
  total: number | null;
  payment_method: string | null;
  note: string | null;
  customer_id: number | null;
  outlet_id: number | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  recipient_address: string | null;
  goods: OutletSaleOrderItemDto[];
}

export interface OutletSaleOrderPayTransferDto {
  file: string | Blob | File | null;
  file_name: string | null;
  file_size: string | number | null;
  paid_by: string | number | null;
}
