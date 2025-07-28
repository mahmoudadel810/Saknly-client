import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import HeroSearchBar from '../../../components/Home/HeroSearchBar'

// Mock Next.js router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('HeroSearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<HeroSearchBar />)
    expect(screen.getByLabelText('عرض العقار')).toBeInTheDocument()
  })

  it('displays all form controls', () => {
    render(<HeroSearchBar />)
    
    expect(screen.getByLabelText('عرض العقار')).toBeInTheDocument()
    expect(screen.getByLabelText('الموقع')).toBeInTheDocument()
    expect(screen.getByLabelText('نوع العقار')).toBeInTheDocument()
    expect(screen.getByText('غرف نوم / حمامات')).toBeInTheDocument()
    expect(screen.getByText('المساحة (م²)')).toBeInTheDocument()
    expect(screen.getByText('السعر (جنيه)')).toBeInTheDocument()
    expect(screen.getByText('بحث')).toBeInTheDocument()
  })

  it('shows placeholder text for offer type', () => {
    render(<HeroSearchBar />)
    expect(screen.getByText('اختر نوع العرض')).toBeInTheDocument()
  })

  it('shows placeholder text for location', () => {
    render(<HeroSearchBar />)
    expect(screen.getByText('اختر المدينة')).toBeInTheDocument()
  })

  it('shows placeholder text for property type', () => {
    render(<HeroSearchBar />)
    expect(screen.getByText('اختر نوع العقار')).toBeInTheDocument()
  })

  it('shows rooms/baths button with default text', () => {
    render(<HeroSearchBar />)
    expect(screen.getByText('كل الغرف والحمامات')).toBeInTheDocument()
  })

  it('shows area button with default text', () => {
    render(<HeroSearchBar />)
    expect(screen.getByText('كل المساحات')).toBeInTheDocument()
  })

  it('shows price button with default text', () => {
    render(<HeroSearchBar />)
    expect(screen.getByText('كل الأسعار')).toBeInTheDocument()
  })

  it('handles search button click', () => {
    render(<HeroSearchBar />)
    const searchButton = screen.getByText('بحث')
    
    fireEvent.click(searchButton)
    
    expect(mockPush).toHaveBeenCalledWith('/properties?')
  })

  it('navigates with correct query parameters when form is filled', async () => {
    render(<HeroSearchBar />)
    
    // Select offer type
    const offerTypeSelect = screen.getByLabelText('عرض العقار')
    fireEvent.mouseDown(offerTypeSelect)
    const rentOption = screen.getByText('إيجار')
    fireEvent.click(rentOption)
    
    // Select location
    const locationSelect = screen.getByLabelText('الموقع')
    fireEvent.mouseDown(locationSelect)
    const locationOption = screen.getByText('المنوفية')
    fireEvent.click(locationOption)
    
    // Select property type
    const propertyTypeSelect = screen.getByLabelText('نوع العقار')
    fireEvent.mouseDown(propertyTypeSelect)
    const propertyOption = screen.getByText('شقة')
    fireEvent.click(propertyOption)
    
    // Click search
    const searchButton = screen.getByText('بحث')
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/properties?category=%D8%A5%D9%8A%D8%AC%D8%A7%D8%B1'))
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('location.city=%D8%A7%D9%84%D9%85%D9%86%D9%88%D9%81%D9%8A%D8%A9'))
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('type=%D8%B4%D9%82%D8%A9'))
    })
  })

  it('hides rooms/baths section when property type is محلات', () => {
    render(<HeroSearchBar />)
    
    // Select محلات as property type
    const propertyTypeSelect = screen.getByLabelText('نوع العقار')
    fireEvent.mouseDown(propertyTypeSelect)
    const shopsOption = screen.getByText('محلات')
    fireEvent.click(shopsOption)
    
    // Rooms/baths section should not be visible
    expect(screen.queryByText('غرف نوم / حمامات')).not.toBeInTheDocument()
  })

  it('shows rooms/baths section for other property types', () => {
    render(<HeroSearchBar />)
    
    // Select شقة as property type
    const propertyTypeSelect = screen.getByLabelText('نوع العقار')
    fireEvent.mouseDown(propertyTypeSelect)
    const apartmentOption = screen.getByText('شقة')
    fireEvent.click(apartmentOption)
    
    // Rooms/baths section should be visible
    expect(screen.getByText('غرف نوم / حمامات')).toBeInTheDocument()
  })

  it('opens rooms/baths popover when clicked', () => {
    render(<HeroSearchBar />)
    
    const roomsButton = screen.getByText('كل الغرف والحمامات')
    fireEvent.click(roomsButton)
    
    // Should show popover content
    expect(screen.getByText('غرف نوم')).toBeInTheDocument()
    expect(screen.getByText('حمامات')).toBeInTheDocument()
  })

  it('opens area popover when clicked', () => {
    render(<HeroSearchBar />)
    
    const areaButton = screen.getByText('كل المساحات')
    fireEvent.click(areaButton)
    
    // Should show popover content
    expect(screen.getByText('الحد الأدنى')).toBeInTheDocument()
    expect(screen.getByText('الحد الأقصى')).toBeInTheDocument()
  })

  it('opens price popover when clicked', () => {
    render(<HeroSearchBar />)
    
    const priceButton = screen.getByText('كل الأسعار')
    fireEvent.click(priceButton)
    
    // Should show popover content
    expect(screen.getByText('الحد الأدنى')).toBeInTheDocument()
    expect(screen.getByText('الحد الأقصى')).toBeInTheDocument()
  })
}) 