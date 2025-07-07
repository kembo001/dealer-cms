// src/app/(frontend)/inventory/page.tsx
import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import './inventory.css' // one level up from /inventory
import Link from 'next/link'

/**
 * Optional: If you want to support URL search params
 * such as ?make=Toyota or ?minPrice=15000,
 * declare them here and use them in your query.
 */
 type SearchParams = { [key: string]: string | string[] | undefined }

 export default async function InventoryPage({
   searchParams,
 }: {
   // 🔑 tell TS this is a Promise, not an object
   searchParams: Promise<SearchParams>
 }) {
   // 🔑 unwrap it before use
   const sp = await searchParams
 
   const headers = await getHeaders()
   const payloadConfig = await config
   const payload = await getPayload({ config: payloadConfig })
 
   // now use `sp` instead of `searchParams`
   const where: any = {}
   if (sp.make && typeof sp.make === 'string') {
     where.make = { equals: sp.make }
   }

export default async function InventoryPage({ searchParams }: { searchParams?: SearchParams }) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  /** -----------------------------------------------------------------
   * BUILD THE QUERY
   * ------------------------------------------------------------------
   * Example: add make, minPrice, maxPrice filters from searchParams.
   * Omit these blocks if you don’t need filtering yet.
   * ---------------------------------------------------------------- */
  const where: any = {}
  if (searchParams?.make && typeof searchParams.make === 'string') {
    where.make = { equals: searchParams.make }
  }
  if (searchParams?.minPrice && !isNaN(+searchParams.minPrice)) {
    where.price = { ...(where.price || {}), greater_than_equal: +searchParams.minPrice }
  }
  if (searchParams?.maxPrice && !isNaN(+searchParams.maxPrice)) {
    where.price = { ...(where.price || {}), less_than_equal: +searchParams.maxPrice }
  }

  /** Fetch inventory ------------------------------------------------ */
  let inventory = { docs: [] as any[] }
  try {
    inventory = await payload.find({
      collection: 'cars',
      limit: 50, // server‑side limit; add pagination UI if inventory is large
      sort: '-createdAt',
      where,
      depth: 2,
    })
  } catch (error) {
    console.error('Error fetching inventory:', error)
  }

  return (
    <div className="inventory">
      {/* -------- Hero / Banner ----------------------------------- */}
      <section className="hero-banner inventory-banner">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Browse Our Full Inventory</h1>
            <p className="hero-subtitle">
              Every vehicle on the lot—inspected, detailed, and ready for you.
            </p>
          </div>
        </div>
      </section>

      {/* -------- Filter Bar (basic) ------------------------------ */}
      {/* Replace with a form library or dropdowns when you want more control */}
      <section className="filter-bar">
        <form className="filter-form" method="get">
          <input
            type="text"
            name="make"
            placeholder="Make (e.g., Toyota)"
            defaultValue={typeof searchParams?.make === 'string' ? searchParams.make : ''}
            className="filter-input"
          />
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            defaultValue={typeof searchParams?.minPrice === 'string' ? searchParams.minPrice : ''}
            className="filter-input"
            min={0}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            defaultValue={typeof searchParams?.maxPrice === 'string' ? searchParams.maxPrice : ''}
            className="filter-input"
            min={0}
          />
          <button type="submit" className="btn-primary">
            Apply Filters
          </button>
        </form>
      </section>

      {/* -------- Inventory Grid ---------------------------------- */}
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
            inventory.docs.map((car) => (
              <div key={car.id} className="car-card">
                {/* ------------ Image -------------- */}
                <div className="car-image-container">
                  {car.image?.url ? (
                    <Image
                      src={car.image.url}
                      alt={car.model || 'Car image'}
                      fill
                      className="car-image"
                    />
                  ) : (
                    <div className="car-image-container">
                      {(() => {
                        // pick the first image, if any
                        const cover = car.images?.[0]?.image // might be string ID or object
                        const coverObj = typeof cover === 'string' ? null : cover // if depth>0 it’s an object
                        return coverObj?.url ? (
                          <Image
                            src={coverObj.url}
                            alt={`${car.make} ${car.model}`}
                            fill
                            className="car-image"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="car-image-placeholder" />
                        )
                      })()}
                    </div>
                  )}
                </div>

                {/* ------------ Details ------------ */}
                <div className="car-details">
                  <div className="car-header">
                    <h3 className="car-title">
                      {car.year} {car.make} {car.model}
                    </h3>
                    <p className="car-price">${car.price?.toLocaleString() || 'Call for price'}</p>
                  </div>

                  <div className="car-meta">
                    {car.mileage && (
                      <div className="car-meta-item">
                        <span>Mileage:</span> {car.mileage.toLocaleString()} mi
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

                  {/* Link to dynamic detail page */}
                  <Link href={`/inventory/${car.slug || car.id}`} className="car-cta">
                    View Details
                  </Link>
                </div>
              </div>
            ))
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
