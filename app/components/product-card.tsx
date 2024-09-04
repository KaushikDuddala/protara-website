import Link from "next/link"

export interface Customization {
  type: string
  label: string
  options: string[]
  priceDelta: { [key: string]: number }
}

export interface Product {
  id: number
  name: string
  price: number
  material: string
  category: string
  description: string
  images: string[]
  community_designed?: boolean
  customizations?: Customization[]
}

export default function ProductCard({ product }: { product: Product }) {
  const cover = product.images[0]

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block bg-[#12121a] border border-white/10 hover:border-orange-500/60 transition-colors"
    >
      <div className="relative aspect-square overflow-hidden bg-[#0a0a0f]">
        {cover && (
          <img
            src={cover}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider text-white/50">{product.category}</span>
          {product.community_designed && (
            <span className="text-[10px] uppercase tracking-wide bg-white/10 text-white/70 px-2 py-0.5">
              Community
            </span>
          )}
        </div>
        <h3 className="text-white font-semibold truncate">{product.name}</h3>
        <p className="mt-1 font-bold text-orange-500">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  )
}