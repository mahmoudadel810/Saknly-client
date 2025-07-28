import React, { useEffect, useState } from "react";
import PropertyCard from "./PropertyCard";
import { Property } from "../types";

interface SimilarPropertiesProps {
  propertyId: string;
}

const SimilarProperties: React.FC<SimilarPropertiesProps> = ({ propertyId }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1'}/properties/similar/${propertyId}`)
      .then(res => res.json())
      .then(data => {
        setProperties(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [propertyId]);

  if (loading) return <div>جاري تحميل العقارات المشابهة...</div>;
  if (!properties.length) return null;

  return (
    <div style={{ marginTop: 40 }}>
      <h2 className="text-xl font-bold mb-4">عقارات مشابهة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {properties.map((prop) => (
          <PropertyCard
            key={prop._id}
            images={Array.isArray(prop.images) ? prop.images.map(img => img.url) : []}
            price={typeof prop.price === 'number' ? prop.price.toLocaleString() : prop.price || ''}
            propertyType={prop.type || ''}
            beds={prop.bedrooms || 0}
            baths={prop.bathrooms || 0}
            sqft={typeof prop.area === 'object' && prop.area !== null && 'total' in prop.area ? String(prop.area.total ?? '') : (typeof prop.area === 'number' ? String(prop.area) : '')}
            description={prop.title || prop.description || ''}
            location={{
              address: prop.location?.address || '',
              city: prop.location?.city || '',
            }}
            downPayment={prop.category === 'rent' ? (typeof (prop as any).deposit === 'number' ? Number((prop as any).deposit) : undefined) : undefined}
            initialPaymentAmount={''}
            category={prop.category || ''}
            statusTag={prop.category === 'rent' ? 'إيجار' : 'بيع'}
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarProperties; 