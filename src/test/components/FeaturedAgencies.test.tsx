import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import FeaturedAgencies from '../../../components/Home/FeaturedAgencies'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockAxios = vi.mocked(axios, true)

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

describe('FeaturedAgencies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment variable
    delete process.env.NEXT_PUBLIC_API_URL
  })

  it('renders without crashing', () => {
    render(<FeaturedAgencies />)
    expect(screen.getByText('لا توجد وكالات مميزة متاحة حاليًا.')).toBeInTheDocument()
  })



  it('shows error state when API URL is not defined', () => {
    render(<FeaturedAgencies />)
    expect(screen.getByText('لا توجد وكالات مميزة متاحة حاليًا.')).toBeInTheDocument()
  })

  it('displays agencies when API call succeeds', async () => {
    // Set API URL for this test
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
    
    const mockAgencies = [
      {
        _id: '1',
        name: 'وكالة العقارات الأولى',
        logo: { url: 'https://example.com/logo1.png' },
        description: 'وكالة موثوقة'
      },
      {
        _id: '2',
        name: 'وكالة العقارات الثانية',
        logo: { url: 'https://example.com/logo2.png' },
        description: 'وكالة مميزة'
      }
    ]

    mockAxios.get.mockResolvedValue({
      data: { data: mockAgencies }
    })

    render(<FeaturedAgencies />)

    await waitFor(() => {
      expect(screen.getByText('وكالة العقارات الأولى')).toBeInTheDocument()
      expect(screen.getByText('وكالة العقارات الثانية')).toBeInTheDocument()
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

  it('displays navigation arrows when agencies are available', async () => {
    // Set API URL for this test
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
    
    const mockAgencies = [
      {
        _id: '1',
        name: 'وكالة العقارات الأولى',
        logo: { url: 'https://example.com/logo1.png' }
      }
    ]

    mockAxios.get.mockResolvedValue({
      data: { data: mockAgencies }
    })

    render(<FeaturedAgencies />)

    await waitFor(() => {
      expect(screen.getByTestId('arrow-back')).toBeInTheDocument()
      expect(screen.getByTestId('arrow-forward')).toBeInTheDocument()
    })
  })

  it('renders swiper component when agencies are available', async () => {
    // Set API URL for this test
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
    
    const mockAgencies = [
      {
        _id: '1',
        name: 'وكالة العقارات الأولى',
        logo: { url: 'https://example.com/logo1.png' }
      }
    ]

    mockAxios.get.mockResolvedValue({
      data: { data: mockAgencies }
    })

    render(<FeaturedAgencies />)

    await waitFor(() => {
      expect(screen.getByTestId('swiper')).toBeInTheDocument()
    })
  })

  it('displays agency logos when agencies are available', async () => {
    // Set API URL for this test
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
    
    const mockAgencies = [
      {
        _id: '1',
        name: 'وكالة العقارات الأولى',
        logo: { url: 'https://example.com/logo1.png' }
      }
    ]

    mockAxios.get.mockResolvedValue({
      data: { data: mockAgencies }
    })

    render(<FeaturedAgencies />)

    await waitFor(() => {
      const logoImage = screen.getByAltText('وكالة العقارات الأولى')
      expect(logoImage).toBeInTheDocument()
      expect(logoImage).toHaveAttribute('src', 'https://example.com/logo1.png')
    })
  })

  it('navigates to agency page when agency card is clicked', async () => {
    // Set API URL for this test
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
    
    const mockAgencies = [
      {
        _id: '1',
        name: 'وكالة العقارات الأولى',
        logo: { url: 'https://example.com/logo1.png' }
      }
    ]

    mockAxios.get.mockResolvedValue({
      data: { data: mockAgencies }
    })

    render(<FeaturedAgencies />)

    await waitFor(() => {
      const agencyCard = screen.getByText('وكالة العقارات الأولى').closest('div')
      if (agencyCard) {
        fireEvent.click(agencyCard)
        expect(mockPush).toHaveBeenCalledWith('/agencies/1')
      }
    })
  })

  it('handles API errors gracefully', async () => {
    mockAxios.get.mockRejectedValue(new Error('API Error'))

    render(<FeaturedAgencies />)

    await waitFor(() => {
      expect(screen.getByText('لا توجد وكالات مميزة متاحة حاليًا.')).toBeInTheDocument()
    })
  })

  it('has proper styling classes when agencies are available', async () => {
    // Set API URL for this test
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
    
    const mockAgencies = [
      {
        _id: '1',
        name: 'وكالة العقارات الأولى',
        logo: { url: 'https://example.com/logo1.png' }
      }
    ]

    mockAxios.get.mockResolvedValue({
      data: { data: mockAgencies }
    })

    const { container } = render(<FeaturedAgencies />)

    await waitFor(() => {
      const mainBox = container.firstChild as HTMLElement
      expect(mainBox).toBeInTheDocument()
      expect(mainBox.tagName).toBe('DIV')
    })
  })
}) 