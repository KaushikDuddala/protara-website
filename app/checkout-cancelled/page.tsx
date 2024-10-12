import Link from "next/link"

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-white text-3xl font-bold mb-4">Checkout Cancelled</h1>
        <p className="text-white/60 mb-8">
          Your order was not placed and no payment was made. You can try again whenever you are ready.
        </p>
        <Link
          href="/cart"
          className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 transition-colors"
        >
          Back to Cart
        </Link>
      </div>
    </div>
  )
}