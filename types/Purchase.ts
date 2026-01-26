interface Product {
  name: string;
  quantity: number;
  price: number;
}

interface Purchase {
  id: string;
  packageImageUrls: string[];
  paymentMethod: string;
  platform: string;
  products: Product[] | null;
  purchaseDate: string;
  receivedDate: string;
  totalAmount: number;
}

interface ApiResponse {
  ResponseCode: number;
  data: Purchase[];
}
