// ───────────────────────────────────────────────────────────
// src/app/(frontend)/inventory/page.tsx
// ───────────────────────────────────────────────────────────
import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import type { PageProps } from 'next'
import config from '@/payload.config'
import Link from 'next/link'
import './inventory.css'

/* ------------------------------------------------------------------ */
/* 1️⃣  Types                                                          */
/* ------------------------------------------------------------------ */
type SearchParams = Record<string, string | string[] | undefined>

type CarDoc = {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage?: number
  transmission?: string
  fuelType?: string
  image?: { url: string } // if you kept a single‐image field
  images?: { image?: { url: string; alt?: string } }[]
}

type Props = PageProps<{}, SearchParams>

/* ------------------------------------------------------------------ */
/* 2️⃣  Page component                                                 */
/* ------------------------------------------------------------------ */
export default async function InventoryPage({ searchParams }: Props) {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const _headers = await getHeaders() // prefixed “_” silences ESLint

  const payload = await getPayload({ config })

  /*  Build dynamic ‘where’ filter from search params  */
  const where: Record<string, unknown> = {}

  if (typeof searchParams.make === 'string' && searchParams.make) {
    where.make = { equals: searchParams.make }
  }
  if (typeof searchParams.minPrice === 'string' && !isNaN(+searchParams.minPrice)) {
    where.price = { ...(where.price as object), greater_than_equal: +searchParams.minPrice }
  }
  if (typeof searchParams.maxPrice === 'string' && !isNaN(+searchParams.maxPrice)) {
    where.price = { ...(where.price as object), less_than_equal: +searchParams.maxPrice }
  }

  /*  Fetch inventory  */
  let inventory: { docs: CarDoc[] } = { docs: [] }

  try {
    inventory = await payload.find({
      collection: 'cars',
      limit: 50,
      sort: '-createdAt',
      where,
      depth: 2, // populate upload relations in images[]
    })
  } catch (err) {
    console.error('Error fetching inventory:', err)
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */
  return (
    <div className="inventory">
      {/* ── Hero / Banner ────────────────────────────────────────── */}
      <section className="hero-banner inventory-banner">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Browse Our Full Inventory</h1>
            <p className="hero-subtitle">
              Every vehicle on the lot—inspected, detailed, and ready for you.
            </p>
          </div>
        </div>
      </section>

      {/* ── Filter bar ──────────────────────────────────────────── */}
      <section className="filter-bar">
        <form className="filter-form" method="get">
          <input
            type="text"
            name="make"
            placeholder="Make (e.g., Toyota)"
            defaultValue={typeof searchParams.make === 'string' ? searchParams.make : ''}
            className="filter-input"
          />
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            defaultValue={typeof searchParams.minPrice === 'string' ? searchParams.minPrice : ''}
            className="filter-input"
            min={0}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            defaultValue={typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : ''}
            className="filter-input"
            min={0}
          />
          <button type="submit" className="btn-primary">
            Apply Filters
          </button>
        </form>
      </section>

      {/* ── Inventory grid ──────────────────────────────────────── */}
      <section className="inventory-grid-section">
        <div className="section-header">
          <h2 className="section-title">
            {inventory.docs.length
              ? `${inventory.docs.length} Vehicles Available`
              : 'No Vehicles Found'}
          </h2>
          <p className="section-subtitle">Updated daily</p>
        </div>

        <div className="car-grid">
          {inventory.docs.length > 0 ? (
            inventory.docs.map((car) => {
              /* Select cover image: prefer single `image`, fall back to first of `images` array */
              const cover =
                car.image?.url ??
                (typeof car.images?.[0]?.image === 'object' ? car.images?.[0]?.image?.url : null)

              return (
                <div key={car.id} className="car-card">
                  {/* ─ Image ─ */}
                  <div className="car-image-container">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={`${car.make} ${car.model}`}
                        fill
                        className="car-image"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="car-image-placeholder" />
                    )}
                  </div>

                  {/* ─ Details ─ */}
                  <div className="car-details">
                    <div className="car-header">
                      <h3 className="car-title">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <p className="car-price">
                        {car.price ? `$${car.price.toLocaleString()}` : 'Call for price'}
                      </p>
                    </div>

                    <div className="car-meta">
                      {car.mileage && (
                        <div className="car-meta-item">
                          <span>Mileage:</span> {car.mileage.toLocaleString()} mi
                        </div>
                      )}
                      {car.transmission && (
                        <div className="car-meta-item">
                          <span>Trans:</span> {car.transmission}
                        </div>
                      )}
                      {car.fuelType && (
                        <div className="car-meta-item">
                          <span>Fuel:</span> {car.fuelType}
                        </div>
                      )}
                    </div>

                    <Link href={`/inventory/${car.id}`} className="car-cta">
                      View Details
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="no-cars">
              <div className="no-results-content">
                <div className="no-results-icon">🚗</div>
                <h3>No Vehicles Match Your Search</h3>
                <p>Try adjusting your filters or check back later.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
