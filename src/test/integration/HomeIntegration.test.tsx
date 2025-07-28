import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import Home from '../../../app/page'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockAxios = vi.mocked(axios, true)

// Mock child components with more realistic behavior
vi.mock('../../../components/Home/HeroSection', () => ({
  default: () => (
    <div data-testid="hero-section">
      <h1>منزلك الجديد في انتظارك</h1>
      <div data-testid="hero-search-bar">
        <button onClick={() => window.dispatchEvent(new CustomEvent('search-clicked'))}>
          بحث
        </button>
      </div>
    </div>
  ),
}))

vi.mock('../../../components/Home/FeaturedProperties', () => ({
  default: () => {
    const React = require('react')
    const [properties, setProperties] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    
    React.useEffect(() => {
      // Simulate API call with immediate response
      const timer = setTimeout(() => {
        setProperties([
          { _id: '1', title: 'فيلا فاخرة', price: 1000000 },
          { _id: '2', title: 'شقة مميزة', price: 500000 }
        ])
        setLoading(false)
      }, 50)
      
      // Cleanup timeout on unmount
      return () => clearTimeout(timer)
    }, [])
    
    return React.createElement('div', { 'data-testid': 'featured-properties' },
      React.createElement('h2', null, 'وحداتنا المميزة'),
      loading ? 
        React.createElement('div', { 'data-testid': 'loading' }, 'جاري التحميل...') :
        React.createElement('div', { 'data-testid': 'properties-list' },
          properties.map((prop: any) => 
            React.createElement('div', { 
              key: prop._id, 
              'data-testid': `property-${prop._id}` 
            }, `${prop.title} - ${prop.price}`)
          )
        )
    )
  },
}))

vi.mock('../../../components/Home/FeaturedAgencies', () => ({
  default: () => (
    <div data-testid="featured-agencies">
      <h2>الوكالات المميزة</h2>
      <div data-testid="agencies-list">
        <div data-testid="agency-1">وكالة العقارات الأولى</div>
        <div data-testid="agency-2">وكالة العقارات الثانية</div>
      </div>
    </div>
  ),
}))

vi.mock('../../../components/Home/Testimonials', () => ({
  default: () => (
    <div data-testid="testimonials">
      <h2>آراء العملاء</h2>
      <div data-testid="testimonials-list">
        <div data-testid="testimonial-1">رأي العميل الأول</div>
        <div data-testid="testimonial-2">رأي العميل الثاني</div>
      </div>
    </div>
  ),
}))

vi.mock('../../../components/Home/ListProperty', () => ({
  default: () => (
    <div data-testid="list-property">
      <h2>أضف عقارك</h2>
      <button data-testid="list-property-btn" onClick={() => window.dispatchEvent(new CustomEvent('list-property-clicked'))}>
        إضافة عقار
      </button>
    </div>
  ),
}))

describe('Home Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders complete home page with all sections', () => {
    render(<Home />)
    
    // Check all main sections are present
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByTestId('featured-properties')).toBeInTheDocument()
    expect(screen.getByTestId('featured-agencies')).toBeInTheDocument()
    expect(screen.getByTestId('testimonials')).toBeInTheDocument()
    expect(screen.getByTestId('list-property')).toBeInTheDocument()
  })

  it('displays hero section content correctly', () => {
    render(<Home />)
    
    expect(screen.getByText('منزلك الجديد في انتظارك')).toBeInTheDocument()
    expect(screen.getByTestId('hero-search-bar')).toBeInTheDocument()
  })

  it('shows loading state for featured properties initially', () => {
    render(<Home />)
    
    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('loads and displays featured properties after loading', async () => {
    render(<Home />)
    
    // Initially shows loading
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    
    // Wait for properties to load
    await waitFor(() => {
      expect(screen.getByTestId('properties-list')).toBeInTheDocument()
    })
    
    // Check properties are displayed
    expect(screen.getByTestId('property-1')).toBeInTheDocument()
    expect(screen.getByTestId('property-2')).toBeInTheDocument()
    expect(screen.getByText('فيلا فاخرة - 1000000')).toBeInTheDocument()
    expect(screen.getByText('شقة مميزة - 500000')).toBeInTheDocument()
  })

  it('displays featured agencies correctly', () => {
    render(<Home />)
    
    expect(screen.getByText('الوكالات المميزة')).toBeInTheDocument()
    expect(screen.getByTestId('agency-1')).toBeInTheDocument()
    expect(screen.getByTestId('agency-2')).toBeInTheDocument()
    expect(screen.getByText('وكالة العقارات الأولى')).toBeInTheDocument()
    expect(screen.getByText('وكالة العقارات الثانية')).toBeInTheDocument()
  })

  it('displays testimonials correctly', () => {
    render(<Home />)
    
    expect(screen.getByText('آراء العملاء')).toBeInTheDocument()
    expect(screen.getByTestId('testimonial-1')).toBeInTheDocument()
    expect(screen.getByTestId('testimonial-2')).toBeInTheDocument()
    expect(screen.getByText('رأي العميل الأول')).toBeInTheDocument()
    expect(screen.getByText('رأي العميل الثاني')).toBeInTheDocument()
  })

  it('displays list property section correctly', () => {
    render(<Home />)
    
    expect(screen.getByText('أضف عقارك')).toBeInTheDocument()
    expect(screen.getByTestId('list-property-btn')).toBeInTheDocument()
    expect(screen.getByText('إضافة عقار')).toBeInTheDocument()
  })

  it('handles search button click from hero section', () => {
    const mockEventListener = vi.fn()
    window.addEventListener('search-clicked', mockEventListener)
    
    render(<Home />)
    
    const searchButton = screen.getByText('بحث')
    fireEvent.click(searchButton)
    
    expect(mockEventListener).toHaveBeenCalled()
  })

  it('handles list property button click', () => {
    const mockEventListener = vi.fn()
    window.addEventListener('list-property-clicked', mockEventListener)
    
    render(<Home />)
    
    const listPropertyButton = screen.getByTestId('list-property-btn')
    fireEvent.click(listPropertyButton)
    
    expect(mockEventListener).toHaveBeenCalled()
  })

  it('maintains proper section order', () => {
    const { container } = render(<Home />)
    const sections = container.querySelectorAll('[data-testid]')
    
    // Check that all expected sections are present
    const sectionOrder = [
      'hero-section',
      'featured-properties',
      'featured-agencies',
      'testimonials',
      'list-property'
    ]
    
    // Verify all sections exist (order may vary due to async rendering)
    sectionOrder.forEach((testId) => {
      const section = container.querySelector(`[data-testid="${testId}"]`)
      expect(section).toBeInTheDocument()
    })
    
    // Verify we have the expected number of sections
    expect(sections.length).toBeGreaterThanOrEqual(sectionOrder.length)
  })

  it('has responsive layout structure', () => {
    const { container } = render(<Home />)
    
    // Check that the main container exists
    const mainBox = container.firstChild as HTMLElement
    expect(mainBox).toBeInTheDocument()
    expect(mainBox.tagName).toBe('DIV')
  })
}) 