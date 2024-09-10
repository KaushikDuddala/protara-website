/** A selectable customization option for a product. */
export type Customization = {
  type: string
  label: string
  options: string[]
  priceDelta: { [key: string]: number }
}

/** Product as loaded from Supabase. */
export type Product = {
  id: number | string
  name: string
  price: number
  material: string
  category: string
  description: string
  detailedDescription?: string
  images: string[]
  specifications?: { [key: string]: string }
  customizations?: Customization[]
  community_designed?: boolean
  created_at?: string
  updated_at?: string
}
