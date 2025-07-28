'use client'

import React from 'react';
import { Box } from '@mui/material';
import HeroSection from '../components/Home/HeroSection';
import FeaturedProperties from '@/components/Home/FeaturedProperties';
import FeaturedAgencies from '../components/Home/FeaturedAgencies';
import Testimonials from '@/components/Home/Testimonials';
import ListProperty from '@/components/Home/ListProperty';

export default function Home() {
  return (
    <Box>
      <HeroSection/>
      <FeaturedProperties/>
      <FeaturedAgencies/>
      <Testimonials/>
      <ListProperty/>
    </Box>
  );
}
