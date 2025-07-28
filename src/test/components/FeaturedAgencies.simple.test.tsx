import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import FeaturedAgencies from '../../../components/Home/FeaturedAgencies'

// Mock axios
vi.mock('axios')

// Mock Next.js router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock Swiper components
vi.mock('swiper/react', () => ({
  Swiper: ({ children, ...props }: any) => (
    <div data-testid="swiper" {...props}>
      {children}
    </div>
  ),
  SwiperSlide: ({ children, ...props }: any) => (
    <div data-testid="swiper-slide" {...props}>
      {children}
    </div>
  ),
}))

vi.mock('swiper/modules', () => ({
  Navigation: {},
  Pagination: {},
  Autoplay: {},
}))

// Mock Material-UI icons
vi.mock('@mui/icons-material/ArrowBackIosNew', () => ({
  default: () => <div data-testid="arrow-back">السابق</div>,
}))

vi.mock('@mui/icons-material/ArrowForwardIos', () => ({
  default: () => <div data-testid="arrow-forward">التالي</div>,
}))

describe('FeaturedAgencies - Simplified', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment variable
    delete process.env.NEXT_PUBLIC_API_URL
  })

  it('renders without crashing', () => {
    render(<FeaturedAgencies />)
    expect(screen.getByText('لا توجد وكالات مميزة متاحة حاليًا.')).toBeInTheDocument()
  })

  it('displays error message when API URL is not defined', async () => {
    render(<FeaturedAgencies />)
    
    await waitFor(() => {
      expect(screen.getByText('لا توجد وكالات مميزة متاحة حاليًا.')).toBeInTheDocument()
    })
  })

  it('displays contact button when no agencies available', async () => {
    render(<FeaturedAgencies />)
    
    await waitFor(() => {
      expect(screen.getByText('تواصل معنا')).toBeInTheDocument()
    })
  })

  it('displays error message when API URL is not defined', async () => {
    render(<FeaturedAgencies />)

    await waitFor(() => {
      expect(screen.getByText('لا توجد وكالات مميزة متاحة حاليًا.')).toBeInTheDocument()
    })
  })

  it('displays contact button when no agencies available', async () => {
    render(<FeaturedAgencies />)

    await waitFor(() => {
      expect(screen.getByText('تواصل معنا')).toBeInTheDocument()
    })
  })

  it('navigates to contact page when contact button is clicked', async () => {
    render(<FeaturedAgencies />)

    await waitFor(() => {
      const contactButton = screen.getByText('تواصل معنا')
      fireEvent.click(contactButton)
      expect(mockPush).toHaveBeenCalledWith('/contact')
    })
  })
}) 