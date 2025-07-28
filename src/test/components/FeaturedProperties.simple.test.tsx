import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import FeaturedProperties from '../../../components/Home/FeaturedProperties'

// Mock environment variables
vi.mock('process.env', () => ({
  NEXT_PUBLIC_API_URL: 'http://localhost:3001',
}))

// Mock PropertyCard component
vi.mock('../../../shared/components/homeCard', () => ({
  default: ({ property }: any) => (
    <div data-testid="property-card" data-property-id={property._id || property.id}>
      {property.title || property.name}
    </div>
  ),
}))

describe('FeaturedProperties - Simplified', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<FeaturedProperties />)
    expect(screen.getByText('وحداتنا المميزة')).toBeInTheDocument()
  })

  it('displays the main heading', () => {
    render(<FeaturedProperties />)
    const heading = screen.getByText('وحداتنا المميزة')
    expect(heading).toBeInTheDocument()
    expect(heading.tagName).toBe('H2')
  })

  it('renders all tabs', () => {
    render(<FeaturedProperties />)
    expect(screen.getByText('الكل')).toBeInTheDocument()
    expect(screen.getByText('ايجار')).toBeInTheDocument()
    expect(screen.getByText('بيع')).toBeInTheDocument()
  })

  it('shows error message when API URL is not defined', () => {
    render(<FeaturedProperties />)
    expect(screen.getByText('Error: API URL not defined.')).toBeInTheDocument()
  })

  it('changes tab when clicked', async () => {
    render(<FeaturedProperties />)

    // Click on rent tab
    const rentTab = screen.getByText('ايجار')
    fireEvent.click(rentTab)

    // Should still show error
    await waitFor(() => {
      expect(screen.getByText('Error: API URL not defined.')).toBeInTheDocument()
    })
  })

  it('maintains tab functionality', () => {
    render(<FeaturedProperties />)
    
    // Check initial state
    expect(screen.getByText('الكل')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('ايجار')).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByText('بيع')).toHaveAttribute('aria-selected', 'false')
    
    // Click on rent tab
    const rentTab = screen.getByText('ايجار')
    fireEvent.click(rentTab)
    
    // Check updated state
    expect(screen.getByText('الكل')).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByText('ايجار')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('بيع')).toHaveAttribute('aria-selected', 'false')
  })
}) 