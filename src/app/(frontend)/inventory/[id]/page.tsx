// ───────────────────────────────────────────────────────────
// src/app/(frontend)/inventory/[id]/page.tsx
// ───────────────────────────────────────────────────────────
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata, PageProps } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import './details.css'

/* ------------------------------------------------------------------ */
/* 1️⃣  Types                                                          */
/* ------------------------------------------------------------------ */
type CarDoc = {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage?: number
  transmission?: 'Automatic' | 'Manual'
  fuelType?: 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid'
  description?: string
  features?: { feature: string }[]
  images?: { image?: { url: string; alt?: string } }[]
}

/**
 * Props must extend Next.js PageProps.
 * PageProps<Params, SearchParams>
 */
type Props = PageProps<{ id: string }>

/* ------------------------------------------------------------------ */
/* 2️⃣  SEO metadata                                                   */
/* ------------------------------------------------------------------ */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const payload = await getPayload({ config })

  const car = await payload
    .findByID<CarDoc>({
      collection: 'cars',
      id: params.id,
      depth: 0, // no images needed for meta
    })
    .catch(() => null)

  if (!car) return {}

  const title = `${car.year} ${car.make} ${car.model} | Shoreline Motors`
  const description =
    car.description?.substring(0, 150) ||
    `Learn more about this ${car.year} ${car.make} ${car.model}. Contact us for a test drive!`
  const image = car.images?.[0]?.image?.url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: image ? [{ url: image, width: 800, height: 600 }] : [],
    },
  }
}

/* ------------------------------------------------------------------ */
/* 3️⃣  Page component                                                 */
/* ------------------------------------------------------------------ */
export default async function VehicleDetails({ params }: { params: Promise<{ id: string }> }) {
  // unwrap the params promise
  const { id } = await params

  const payload = await getPayload({ config })
  const car = await payload.findByID<CarDoc>({ collection: 'cars', id, depth: 2 }).catch(() => null)
  if (!car) notFound()

  const heroImage = car.images?.[0]?.image?.url
  const thumbnails = car.images?.slice(1).filter((img) => img.image?.url)

  return (
    <article className="vehicle-page">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="vehicle-hero">
        <div className="hero-text">
          <h1 className="vehicle-title">
            {car.year} {car.make} {car.model}
          </h1>
          {car.price !== undefined && (
            <p className="vehicle-price">${car.price.toLocaleString()}</p>
          )}
        </div>

        {heroImage ? (
          <Image
            src={heroImage}
            alt={`${car.make} ${car.model}`}
            width={1200}
            height={700}
            priority
            className="hero-img"
          />
        ) : (
          <div className="hero-img placeholder" />
        )}
      </header>

      {/* ── Thumbnails ──────────────────────────────────────── */}
      {thumbnails && thumbnails.length > 0 && (
        <section className="thumb-gallery">
          {thumbnails.map((img, i) => (
            <Image
              key={i}
              src={img.image!.url}
              alt={img.image!.alt || `${car.make} ${car.model} thumbnail ${i + 1}`}
              width={180}
              height={120}
              className="thumb-img"
            />
          ))}
        </section>
      )}

      {/* ── Specs ───────────────────────────────────────────── */}
      <section className="vehicle-specs">
        <h2>Specifications</h2>
        <ul>
          {car.mileage !== undefined && (
            <li>
              <span>Mileage:</span> {car.mileage.toLocaleString()} mi
            </li>
          )}
          {car.transmission && (
            <li>
              <span>Transmission:</span> {car.transmission}
            </li>
          )}
          {car.fuelType && (
            <li>
              <span>Fuel Type:</span> {car.fuelType}
            </li>
          )}
        </ul>
      </section>

      {/* ── Description ─────────────────────────────────────── */}
      {car.description && (
        <section className="vehicle-description">
          <h2>About this vehicle</h2>
          <p>{car.description}</p>
        </section>
      )}

      {/* ── Features ───────────────────────────────────────── */}
      {car.features && car.features.length > 0 && (
        <section className="vehicle-features">
          <h2>Key Features</h2>
          <ul>
            {car.features.map((f, i) => (
              <li key={i}>• {f.feature}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="vehicle-cta">
        <Link href="/contact" className="btn-primary">
          Schedule Test Drive
        </Link>
        <Link href="/finance" className="btn-outline">
          Get Pre‑approved
        </Link>
        <Link href="/inventory" className="back-link">
          ← Back to inventory
        </Link>
      </section>
    </article>
  )
}
