import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { ArrowLeftIcon, ArrowRightIcon } from '../components/Icons'
import './LandingPage.css'

const books = [
  { id: 1, image: '/assets/card-image-3.png', alt: 'Շտեմարան 1' },
  { id: 2, image: '/assets/card-image-1.png', alt: 'Շտեմարան 2' },
  { id: 3, image: '/assets/card-image-2.png', alt: 'Շտեմարան 3' },
]

export default function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(1)

  const prev = () => setActiveSlide((s) => (s === 0 ? 2 : s - 1))
  const next = () => setActiveSlide((s) => (s === 2 ? 0 : s + 1))

  return (
    <div className="page landing">
      <Navbar />

      <section className="hero">
        <div className="hero__inner container">
          <div className="hero__content">
            <h1 className="hero__title armenian">
              <span className="hero__title-line">Սովորիր ավելի </span>
              <span className="hero__title-line">
                <span className="hero__gradient-fast">ԱՐԱԳ</span>
                <span className="hero__title-and"> և</span>
              </span>
              <span className="hero__title-line">
                Ավելի <span className="hero__gradient-effective">ԱՐԴՅՈՒՆԱՎԵՏ</span>
              </span>
            </h1>
            <p className="hero__subtitle armenian">
              eSHTEMARANY-ը համակարգ է որը կօգնի պատրաստվել միասնական քննություններին ավելի արագ և արդյունավետ
            </p>
            <Link to="/signup" className="hero__cta">
              ՍԿՍԵԼ
            </Link>
          </div>

          <div className="hero__illustration">
            <img src="/assets/hero-illustration.png" alt="Learning illustration" />
          </div>
        </div>
      </section>

      <section className="carousel-section">
        <div className="carousel-section__bg" />
        <div className="carousel-section__inner container">
          <h2 className="carousel-section__title armenian">Շտեմարաններ</h2>

          <div className="carousel">
            <button type="button" className="carousel__arrow carousel__arrow--left" onClick={prev} aria-label="Previous">
              <ArrowLeftIcon />
            </button>

            <div className="carousel__track">
              {books.map((book, index) => (
                <div
                  key={book.id}
                  className={`carousel__slide ${index === activeSlide ? 'carousel__slide--active' : ''} ${
                    index < activeSlide ? 'carousel__slide--left' : index > activeSlide ? 'carousel__slide--right' : ''
                  }`}
                >
                  <img src={book.image} alt={book.alt} />
                </div>
              ))}
            </div>

            <button type="button" className="carousel__arrow carousel__arrow--right" onClick={next} aria-label="Next">
              <ArrowRightIcon />
            </button>
          </div>

          <div className="carousel__footer">
            <div className="carousel__dots">
              {books.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`carousel__dot ${i === activeSlide ? 'carousel__dot--active' : ''}`}
                  onClick={() => setActiveSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="carousel__counter">
              <span className="carousel__counter-current">0{activeSlide + 1}</span>
              <span className="carousel__counter-line" />
              <span className="carousel__counter-total">03</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
