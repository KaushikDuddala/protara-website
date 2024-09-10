'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export type Product = {
  id: number
  name: string
  price: number
  material: string
  category: string
  images: string[]
  description: string
  detailedDescription?: string
  specifications?: { [key: string]: string }
  community_designed?: boolean
}

/**
 * Loads products with their images.
 * @returns Object with the product list plus loading and error state.
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)

        // Load products with their images in a single query.
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, product_images(url, position)')
          .order('id', { ascending: true })

        if (productsError) throw productsError

        // Flatten the joined image rows into a plain url list, sorted by position.
        const formattedProducts: Product[] = productsData?.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: parseFloat(p.price),
          material: p.material,
          category: p.category,
          description: p.description,
          detailedDescription: p.detailed_description,
          specifications: p.specifications || {},
          images: (p.product_images || [])
            .slice()
            .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
            .map((img: any) => img.url),
          community_designed: p.community_designed || false,
        })) || []

        setProducts(formattedProducts)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch products'))
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return { products, loading, error }
}