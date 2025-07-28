import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import Home from '../../app/page'

// Mock the child components
vi.mock('../../components/Home/HeroSection', () => ({
  default: () => <div data-testid="hero-section">Hero Section</div>,
}))

vi.mock('../../components/Home/FeaturedProperties', () => ({
  default: () => <div data-testid="featured-properties">Featured Properties</div>,
}))

vi.mock('../../components/Home/FeaturedAgencies', () => ({
  default: () => <div data-testid="featured-agencies">Featured Agencies</div>,
}))

vi.mock('../../components/Home/Testimonials', () => ({
  default: () => <div data-testid="testimonials">Testimonials</div>,
}))

vi.mock('../../components/Home/ListProperty', () => ({
  default: () => <div data-testid="list-property">List Property</div>,
}))

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />)
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
  })

  it('renders all main sections', () => {
    render(<Home />)
    
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByTestId('featured-properties')).toBeInTheDocument()
    expect(screen.getByTestId('featured-agencies')).toBeInTheDocument()
    expect(screen.getByTestId('testimonials')).toBeInTheDocument()
    expect(screen.getByTestId('list-property')).toBeInTheDocument()
  })

  it('renders in correct order', () => {
    const { container } = render(<Home />)
    const sections = container.querySelectorAll('[data-testid]')
    
    expect(sections[0]).toHaveAttribute('data-testid', 'hero-section')
    expect(sections[1]).toHaveAttribute('data-testid', 'featured-properties')
    expect(sections[2]).toHaveAttribute('data-testid', 'featured-agencies')
    expect(sections[3]).toHaveAttribute('data-testid', 'testimonials')
    expect(sections[4]).toHaveAttribute('data-testid', 'list-property')
  })
}) 