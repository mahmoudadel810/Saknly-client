export interface Agency {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt?: string;
} 