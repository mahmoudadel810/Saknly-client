export interface Agency {
  _id: string;
  name: string;
  description?: string;
  logo?: { publicId?: string; url: string };
  isFeatured: boolean;
  createdAt: string;
  updatedAt?: string;
} 