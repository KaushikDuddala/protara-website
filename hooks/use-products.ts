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
  customizations?: Customization[]
  community_designed?: boolean
}

export type Customization = {
  type: string
  label: string
  options: string[]
  priceDelta: { [key: string]: number }
}

/**
 * Loads products with their images and customization options.
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

        // Load products, their images, and customization options.
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true })

        if (productsError) throw productsError

        const { data: imagesData, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          .order('product_id, position')

        if (imagesError) throw imagesError

        const { data: customizationsData, error: customizationsError } = await supabase
          .from('product_customizations')
          .select(`
            *,
            customization_options (
              option_value,
              price_delta
            )
          `)

        if (customizationsError) throw customizationsError

        // Index images by product.
        const imagesByProduct: { [key: number]: string[] } = {}
        imagesData?.forEach((img: any) => {
          if (!imagesByProduct[img.product_id]) {
            imagesByProduct[img.product_id] = []
          }
          imagesByProduct[img.product_id][img.position || 0] = img.url
        })

        // Index customizations by product.
        const customizationsByProduct: { [key: number]: Customization[] } = {}
        customizationsData?.forEach((cust: any) => {
          if (!customizationsByProduct[cust.product_id]) {
            customizationsByProduct[cust.product_id] = []
          }
          
          const options = cust.customization_options || []
          const priceDelta: { [key: string]: number } = {}
          
          options.forEach((opt: any) => {
            priceDelta[opt.option_value] = opt.price_delta || 0
          })

          customizationsByProduct[cust.product_id].push({
            type: cust.type,
            label: cust.label || cust.type,
            options: options.map((opt: any) => opt.option_value),
            priceDelta,
          })
        })

        // Combine everything into product objects.
        const formattedProducts: Product[] = productsData?.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: parseFloat(p.price),
          material: p.material,
          category: p.category,
          description: p.description,
          detailedDescription: p.detailed_description,
          specifications: p.specifications || {},
          images: imagesByProduct[p.id] || [],
          customizations: customizationsByProduct[p.id] || [],
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
