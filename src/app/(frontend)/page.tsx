import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch featured cars
  let featuredCars = { docs: [] }
  try {
    featuredCars = await payload.find({
      collection: 'cars',
      limit: 4,
      sort: '-createdAt',
    })
  } catch (error) {
    console.error('Error fetching featured cars:', error)
  }

  // Fetch latest blog posts
  let latestPosts = { docs: [] }
  try {
    latestPosts = await payload.find({
      collection: 'posts',
      limit: 3,
      sort: '-createdAt',
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
  }

  return (
    <div className="home">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Premium Cars. Exceptional Service.</h1>
            <p className="hero-subtitle">
              Discover your dream car at unbeatable prices here, at Shoreline Motors
            </p>
            <div className="hero-buttons">
              <a href="/inventory" className="btn-primary">
                Browse Inventory
              </a>
              <a className="btn-outline">Schedule Test Drive</a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="featured-cars">
        <div className="section-header">
          <h2 className="section-title">Featured Vehicles</h2>
          <p className="section-subtitle">Top picks from our inventory</p>
        </div>

        <div className="car-grid">
          {featuredCars.docs.length > 0 ? (
            featuredCars.docs.map((car) => (
              <div key={car.id} className="car-card">
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
                  <div className="car-badge">Featured</div>
                </div>
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

                  <a href={`/inventory/${car.slug || car.id}`} className="car-cta">
                    View Details
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="no-cars">
              <div className="no-results-content">
                <div className="no-results-icon">🚗</div>
                <h3>No Featured Vehicles Available</h3>
                <p>Please check back later for our latest inventory</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-content">
          <div className="about-text">
            <div className="section-tag">About Us</div>
            <h2 className="section-title">Our Legacy of Excellence</h2>
            <p className="about-description">
              Founded in 2005, Shoreline Motors has been serving the community with quality vehicles
              and exceptional customer service for nearly two decades. Our award-winning team is
              committed to making your car buying experience smooth and enjoyable.
            </p>
            <div className="about-stats">
              <div className="stat-item">
                <div className="stat-number">18+</div>
                <div className="stat-label">Years in Business</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">12K+</div>
                <div className="stat-label">Vehicles Sold</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Customer Satisfaction</div>
              </div>
            </div>
            <div className="about-features">
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Certified pre-owned vehicles</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">120-point inspection guarantee</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Flexible financing options</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">5-year service warranty</div>
              </div>
            </div>
          </div>
          <div className="about-image">
            <div className="image-container">
              <div className="image-placeholder"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="location-section">
        <div className="location-map">
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d23137468.66119199!2d-93.6347785!3d44.9355759!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x881bd6224f6d1761%3A0x724572f6c9e24075!2sShoreline%20Motors%20%26%20Service%20Center!5e0!3m2!1sen!2sus!4v1750728833314!5m2!1sen!2sus"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Shoreline Motorsports map"
              class="map__frame"
              width="100%"
              height="752px"
            ></iframe>
          </div>
        </div>
        <div className="location-info">
          <div className="section-tag">Visit Us</div>
          <h2 className="section-title">Find Our Dealership</h2>

          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div>
                <div className="contact-label">Address</div>
                <div>123 Auto Boulevard</div>
                <div>Car City, CC 90210</div>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div>
                <div className="contact-label">Phone</div>
                <div>(555) 123-4567</div>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">✉️</div>
              <div>
                <div className="contact-label">Email</div>
                <div>info@premiummotors.com</div>
              </div>
            </div>
          </div>

          <div className="hours-container">
            <h3 className="hours-title">Business Hours</h3>
            <div className="hours-grid">
              <div className="hours-day">Monday - Friday</div>
              <div className="hours-time">9:00 AM - 8:00 PM</div>
              <div className="hours-day">Saturday</div>
              <div className="hours-time">10:00 AM - 6:00 PM</div>
              <div className="hours-day">Sunday</div>
              <div className="hours-time">Closed</div>
            </div>
          </div>

          <button className="btn-primary">Get Directions</button>
        </div>
      </section>

      {/* Blog Section */}
      <section className="blog-section">
        <div className="section-header">
          <div className="section-tag">News & Tips</div>
          <h2 className="section-title">Latest From Our Blog</h2>
          <p className="section-subtitle">Stay updated with car news and maintenance tips</p>
        </div>

        <div className="blog-grid">
          {latestPosts.docs.length > 0 ? (
            latestPosts.docs.map((post) => (
              <div key={post.id} className="blog-card">
                <div className="blog-image-container">
                  {post.featuredImage?.url ? (
                    <Image
                      src={post.featuredImage.url}
                      alt={post.title || 'Blog post image'}
                      fill
                      className="blog-image"
                    />
                  ) : (
                    <div className="blog-image-placeholder"></div>
                  )}
                  <div className="blog-date">May 15, 2023</div>
                </div>
                <div className="blog-content">
                  <h3 className="blog-title">{post.title || 'Untitled Post'}</h3>
                  <p className="blog-excerpt">
                    {post.excerpt ||
                      (post.content && post.content.substring(0, 100)) ||
                      'No content available'}
                    ...
                  </p>
                  <div className="blog-meta">
                    <div className="blog-author">By Admin</div>
                    <a href={`/blog/${post.slug || '#'}`} className="read-more">
                      Read More →
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-posts">
              <div className="no-results-content">
                <div className="no-results-icon">📝</div>
                <h3>No Blog Posts Available</h3>
                <p>Check back soon for our latest articles and updates</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Find Your Dream Car?</h2>
          <p className="cta-text">Schedule a test drive today and experience premium service</p>
          <div className="cta-buttons">
            <button className="btn-primary">Browse Inventory</button>
            <button className="btn-outline">Contact Us</button>
          </div>
        </div>
      </section>
    </div>
  )
}
