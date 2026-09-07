import { isSupabaseConfigured, supabase } from './supabaseClient'

export type Product = {
  id: number
  title: string
  description: string
  price: number
  size: string
  condition: string
  image_url: string
  category: string
  status: string
}

export type ProductsResult = {
  products: Product[]
  error: string | null
  code: string | null
}

export async function fetchProducts(search = ''): Promise<ProductsResult> {
  if (!isSupabaseConfigured) {
    // #region agent log
    fetch('http://127.0.0.1:7837/ingest/e0146e8b-2ff2-4efa-88bf-781a634cacc9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'64ab83'},body:JSON.stringify({sessionId:'64ab83',runId:'pre-fix',hypothesisId:'A',location:'products.ts:fetchProducts',message:'Supabase env not configured',data:{hasUrl:Boolean(import.meta.env.VITE_SUPABASE_URL),hasKey:Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return {
      products: [],
      error: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em client/.env',
      code: 'NOT_CONFIGURED',
    }
  }

  let query = supabase
    .from('products')
    .select('id, title, description, price, size, condition, image_url, category, status')
    .order('created_at', { ascending: false })

  const term = search.trim()
  if (term) {
    query = query.ilike('title', `%${term}%`)
  }

  const { data, error } = await query

  // #region agent log
  fetch('http://127.0.0.1:7837/ingest/e0146e8b-2ff2-4efa-88bf-781a634cacc9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'64ab83'},body:JSON.stringify({sessionId:'64ab83',runId:'pre-fix',hypothesisId:error?.code === 'PGRST205' || error?.message?.includes('schema cache') || error?.message?.includes('does not exist') ? 'C' : error?.code === '42501' || error?.message?.toLowerCase().includes('row-level security') ? 'D' : error ? 'B' : data && data.length === 0 ? 'D' : 'E',location:'products.ts:fetchProducts',message:'Supabase products query result',data:{search:term,rowCount:data?.length ?? 0,errorCode:error?.code ?? null,errorMessage:error?.message ?? null,sampleKeys:data?.[0] ? Object.keys(data[0]) : []},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (error) {
    return { products: [], error: error.message, code: error.code ?? 'QUERY_ERROR' }
  }

  const products = (data ?? []).map((row) => ({
    ...row,
    price: Number(row.price),
  })) as Product[]

  return { products, error: null, code: null }
}
