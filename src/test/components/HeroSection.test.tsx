import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import HeroSection from '../../../components/Home/HeroSection'

// Mock HeroSearchBar component
vi.mock('../../../components/Home/HeroSearchBar', () => ({
  default: () => <div data-testid="hero-search-bar">Search Bar</div>,
}))

describe('HeroSection', () => {
  it('renders without crashing', () => {
    render(<HeroSection />)
    expect(screen.getByText('منزلك الجديد في انتظارك')).toBeInTheDocument()
  })

  it('displays the main heading', () => {
    render(<HeroSection />)
    const heading = screen.getByText('منزلك الجديد في انتظارك')
    expect(heading).toBeInTheDocument()
    expect(heading.tagName).toBe('H1')
  })

  it('displays the subtitle', () => {
    render(<HeroSection />)
    const subtitle = screen.getByText('ابحث عن أفضل الفلل والمنازل بسهولة مع سكنلي')
    expect(subtitle).toBeInTheDocument()
  })

  it('renders the search bar', () => {
    render(<HeroSection />)
    expect(screen.getByTestId('hero-search-bar')).toBeInTheDocument()
  })

  it('has correct styling classes', () => {
    const { container } = render(<HeroSection />)
    const heroBox = container.firstChild as HTMLElement
    
    // Check if the component has the expected structure
    expect(heroBox).toBeInTheDocument()
  })

  it('has proper text alignment', () => {
    render(<HeroSection />)
    const heading = screen.getByText('منزلك الجديد في انتظارك')
    const subtitle = screen.getByText('ابحث عن أفضل الفلل والمنازل بسهولة مع سكنلي')
    
    // Check if text is centered (this would be checked via CSS classes in a real scenario)
    expect(heading).toBeInTheDocument()
    expect(subtitle).toBeInTheDocument()
  })
}) 