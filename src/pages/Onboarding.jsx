import { useState, useEffect, useRef } from "react"
import "../styles/pages/Onboarding.css"
import QuickPriceImage from "../assets/Quick Price Search.png"
import AdminControlImage from "../assets/Admin Control PNG.png"
import StaffAccessImage from "../assets/Staff Access.png"

const slides = [
  {
    image: QuickPriceImage,
    title: "Quick Price Lookup",
    description: "Search for any product instantly"
  },
  {
    image: AdminControlImage,
    title: "Admin Control",
    description: "Manage products and staff effortlessly"
  },
  {
    image: StaffAccessImage,
    title: "Staff Access",
    description: "Secure read-only access for staff"
  }
]

export default function Onboarding({ onGetStarted }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 2000)
    
    return () => clearTimeout(timerRef.current)
  }, [currentSlide])

  const handleSwipe = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    setTouchEnd(e.changedTouches[0].clientX)
    handleSwipe()
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const slide = slides[currentSlide]

  return (
    <div 
      className="onboarding-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="onboarding-content">
        <div className="onboarding-header">
          <h1>Price Flow</h1>
          <p>Smart price management for your store</p>
        </div>

        <div className="carousel-slide">
          <img src={slide.image} alt={slide.title} className="slide-image" />
          <h2 className="slide-title">{slide.title}</h2>
          <p className="slide-description">{slide.description}</p>
        </div>

        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button onClick={onGetStarted} className="btn-primary btn-large">
          Get Started
        </button>
      </div>
    </div>
  )
}
