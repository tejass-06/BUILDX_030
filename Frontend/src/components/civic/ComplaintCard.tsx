import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { Complaint } from '../../types';
import { Card } from '../ui/Card';
import { ComplaintStatus } from './ComplaintStatus';
import { SLAIndicator } from './SLAIndicator';
import { LocationRow } from './LocationRow';
import { DepartmentBadge } from './DepartmentBadge';

export interface ComplaintCardProps {
  complaint: Complaint;
  to?: string;
  className?: string;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  to,
  className = '',
}) => {
  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const cardContent = (
    <Card className={`ns-complaint-card ${to ? 'ns-card--interactive' : ''} ${className}`}>
      <div className="ns-complaint-card__header">
        <div className="ns-complaint-card__id-group">
          <span className="ns-complaint-card__id">{complaint.id}</span>
          <DepartmentBadge code={complaint.departmentCode} />
        </div>
        <ComplaintStatus status={complaint.status} />
      </div>

      <div className="ns-complaint-card__body">
        <h4 className="ns-complaint-card__title">{complaint.title}</h4>
        <LocationRow location={complaint.location} className="ns-complaint-card__location" />
      </div>

      <div className="ns-complaint-card__footer">
        <div className="ns-complaint-card__meta">
          <span className="ns-complaint-card__date text-muted text-xs">
            <Calendar size={13} aria-hidden="true" />
            {formattedDate}
          </span>
          <SLAIndicator sla={complaint.sla} isResolved={complaint.status === 'resolved' || complaint.status === 'citizen_confirmed'} />
        </div>
        {to && (
          <div className="ns-complaint-card__action">
            <span className="text-xs font-medium text-primary">View Details</span>
            <ChevronRight size={14} className="text-primary" />
          </div>
        )}
      </div>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className="ns-complaint-card-link" aria-label={`View complaint ${complaint.id}: ${complaint.title}`}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};
