import db from '../config/database';

export interface Product {
  id?: number;
  user_id: string; // UUID do Supabase Auth
  category_id?: number;
  title: string;
  description: string;
  price: number;
  size: string;
  condition: 'Novo' | 'Seminovo' | 'Usado';
  image_url: string;
  status?: 'disponivel' | 'reservado' | 'vendido';
  created_at?: Date;
  updated_at?: Date;
}

export const ProductService = {
  async create(data: Product) {
    const [id] = await db('products').insert(data);
    return id;
  },

  async getAll(filters: any = {}) {
    let query = db('products').select('*').orderBy('created_at', 'desc');

    if (filters.category) {
      query = query.where('category_id', filters.category);
    }
    if (filters.condition) {
      query = query.where('condition', filters.condition);
    }
    if (filters.search) {
      query = query.where('title', 'like', `%${filters.search}%`);
    }

    return query;
  },

  async getById(id: number) {
    return db('products').where({ id }).first();
  },

  async update(id: number, data: Partial<Product>) {
    return db('products').where({ id }).update(data);
  },

  async delete(id: number) {
    return db('products').where({ id }).del();
  }
};
