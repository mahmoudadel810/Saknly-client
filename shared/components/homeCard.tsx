'use client';

import { FC } from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Button,
} from '@mui/material';
import { Bed, Bathtub } from '@mui/icons-material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StraightenIcon from '@mui/icons-material/Straighten';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useWishlist } from '@/app/context/WishlistContext';
import { useRouter } from 'next/navigation';

interface PropertyCardProps {
    property: {
        _id: string;
        title: string;
        price: number;
        location: {
            address: string;
            city: string;
            district?: string;
        };
        images: Array<{
            publicId: string;
            url: string;
            isMain?: boolean;
        }>;
        bedrooms: number;
        bathrooms: number;
        area: number;
        type: string;
        category: string;
        status?: string; // Added for status badge
    };
}

const PropertyCard: FC<PropertyCardProps> = ({ property }) => {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const router = useRouter();

    const imageUrl = property.images && property.images.length > 0
        ? property.images.find(img => img.isMain)?.url || property.images[0].url
        : 'https://placehold.co/600x400/E0E0E0/FFFFFF?text=No+Image';

    const toggleWishlist = async () => {
        if (isInWishlist(property._id)) {
            await removeFromWishlist(property._id);
        } else {
            await addToWishlist({
                id: property._id,
                title: property.title,
                price: property.price,
                location: property.location,
                images: property.images,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                area: property.area,
                type: property.type,
                category: property.category
            });
        }
    };

    return (
        <Card
            onClick={() => {
        router.push(`/properties/${property._id}`);
}}
            sx={{
                minHeight: { xs: '320px', sm: '350px' },
                maxHeight: 'auto',
                width: '100%',
                maxWidth: { xs: 320, sm: 350, md: 370 },
                mx: 'auto',
                mb: { xs: 2, sm: 3, md: 4 },
                borderRadius: 6, // زوايا أكثر نعومة
                boxShadow: '0 2px 8px 0 rgba(59,130,246,0.04)', // ظل خفيف جدًا
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.18s cubic-bezier(.4,1.3,.6,1)',
                border: '1px solid #f0f4fa', // حدود أفتح
                background: 'rgba(255, 255, 255, 0.82)',

                '&:hover': {
                    transform: 'translateY(-3px) scale(1.01)',
                    boxShadow: '0 6px 18px 0 rgba(59,130,246,0.08)',
                    borderColor: '#e3eaf6',
                },
            }}
        >
            {/* Image Section */}
            <Box sx={{ position: 'relative', width: '100%' }}>
                <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={property.title}
                    loading="lazy"
                    sx={{
                        width: '100%',
                        height: { xs: 180, sm: 200, md: 210 },
                        objectFit: 'cover',
                        borderTopLeftRadius: 6,
                        borderTopRightRadius: 6,
                        transition: 'transform 0.3s cubic-bezier(.4,1.3,.6,1)',
                        '&:hover': { transform: 'scale(1.02)' },
                    }}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/600x400/E0E0E0/FFFFFF?text=No+Image';
                    }}
                />

                {/* Status Badge */}
                {property.category && (
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: 10, sm: 14 },
                        right: { xs: 10, sm: 14 },
                        bgcolor: property.category === 'rent' ? 'primary.main' : property.category === 'sale' ? 'error.main' : 'info.main',
                        color: '#fff',
                        borderRadius: 2,
                        px: { xs: 1, sm: 1.5 },
                        py: { xs: 0.3, sm: 0.5 },
                        fontSize: { xs: '0.75rem', sm: '0.82rem' },
                        fontWeight: 500,
                        zIndex: 2,
                        boxShadow: 1,
                        letterSpacing: '0.5px',
                    }}>
                        {property.category === 'rent' ? 'إيجار' : property.category === 'sale' ? 'بيع' : ''}
                    </Box>
                )}
            </Box>

            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, pt: { xs: 1.5, sm: 2, md: 2.2 } }}>
                {/* Price + Heart Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ 
                        fontWeight: 500, 
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.13rem' }, 
                        color: 'error.main', 
                        letterSpacing: '0.05px', 
                        flex: 1 
                    }}>
                        {property.price?.toLocaleString()} <Typography component="span" fontSize={{ xs: '0.9rem', sm: '0.95rem', md: '0.98rem' }} color="text.secondary">ج.م</Typography>
                    </Typography>
                    <button
                        aria-label="أضف إلى قائمة الأمنيات"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist();
                        }}
                        className="focus:outline-none"
                        style={{
                            background: 'none',
                            borderRadius: '50%',
                            padding: '0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: 'none',
                            transition: 'none',
                            marginLeft: '8px',
                        }}
                    >
                        {isInWishlist(property._id) ? (
                            <FavoriteIcon sx={{ color: '#c1121f', fontSize: { xs: '1.5rem', sm: '1.6rem', md: '1.7rem' } }} />
                        ) : (
                            <FavoriteBorderIcon sx={{ color: '#555', fontSize: { xs: '1.5rem', sm: '1.6rem', md: '1.7rem' } }} />
                        )}
                    </button>
                </Box>
                {/* Title */}
                <Typography variant="h6" fontWeight={400} sx={{ 
                    color: 'primary.main', 
                    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.08rem' }, 
                    letterSpacing: '0.05px', 
                    textOverflow: 'ellipsis', 
                    overflow: 'hidden', 
                    whiteSpace: 'nowrap', 
                    mb: 1 
                }}>
                    {property.type} {property.title && `- ${property.title}`}
                </Typography>

                {/* Main Details Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: { xs: 1, sm: 1.5 }, mb: { xs: 1, sm: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: { xs: 15, sm: 16, md: 17 }, color: 'primary.main' }} />
                        <Typography fontSize={{ xs: '0.85rem', sm: '0.9rem', md: '0.93rem' }} color="text.secondary" fontWeight={400}>{property.location?.city || property.location?.address}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StraightenIcon sx={{ fontSize: { xs: 15, sm: 16, md: 17 }, color: 'primary.main' }} />
                        <Typography fontSize={{ xs: '0.85rem', sm: '0.9rem', md: '0.93rem' }} color="text.secondary" fontWeight={400}>{property.area} م²</Typography>
                    </Box>
                </Box>

                {/* Features Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, mb: { xs: 1, sm: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Bed sx={{ fontSize: { xs: 15, sm: 16, md: 17 }, color: 'primary.main' }} />
                        <Typography fontSize={{ xs: '0.85rem', sm: '0.88rem', md: '0.91rem' }} color="text.secondary" fontWeight={400}>{property.bedrooms}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Bathtub sx={{ fontSize: { xs: 15, sm: 16, md: 17 }, color: 'primary.main' }} />
                        <Typography fontSize={{ xs: '0.85rem', sm: '0.88rem', md: '0.91rem' }} color="text.secondary" fontWeight={400}>{property.bathrooms}</Typography>
                    </Box>
                </Box>

                {/* Call to Action Button */}
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{
                        mt: { xs: 1, sm: 1.5 },
                        fontWeight: 500,
                        fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1.01rem' },
                        borderRadius: 2.5,
                        py: { xs: 0.8, sm: 0.9, md: 1.05 },
                        boxShadow: '0 1px 4px rgba(59,130,246,0.06)',
                        textTransform: 'none',
                        letterSpacing: '0.05px',
                        transition: 'all 0.13s',
                        '&:hover': {
                            bgcolor: 'primary.dark',
                            color: 'white',
                            boxShadow: '0 4px 12px 0 rgba(59,130,246,0.10)',
                            transform: 'translateY(-1px) scale(1.01)',
                        },
                    }}
                       onClick={(e) => {
        e.stopPropagation(); // يمنع تنفيذ onClick للبطاقة
        router.push(`/properties/${property._id}`);
    }}
                >
                    عرض التفاصيل
                </Button>
            </CardContent>
        </Card>
    );
};

export default PropertyCard;