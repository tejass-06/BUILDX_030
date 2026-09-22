import React from 'react';
import { MapPin } from 'lucide-react';
import { LocationData } from '../../types';

export interface LocationRowProps {
  location: LocationData;
  className?: string;
  showDetails?: boolean;
}

export const LocationRow: React.FC<LocationRowProps> = ({
  location,
  className = '',
  showDetails = true,
}) => {
  return (
    <div className={`ns-location-row ${className}`}>
      <MapPin size={15} className="ns-location-row__pin text-muted" aria-hidden="true" />
      <div className="ns-location-row__text">
        <span className="ns-location-row__address font-medium">{location.address}</span>
        {showDetails && (
          <span className="ns-location-row__meta text-muted text-xs">
            {location.ward}, {location.zone} · {location.city} {location.pincode ? `- ${location.pincode}` : ''}
          </span>
        )}
      </div>
    </div>
  );
};
