import Link from 'next/link';
import { MapPin, Clock, Briefcase, DollarSign, Star, ExternalLink } from 'lucide-react';
import { Job } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  compact?: boolean;
}

const categoryLabels: Record<string, string> = {
  'instructional-design': 'Instructional Design',
  'elearning-development': 'E-Learning Development',
  'training-facilitation': 'Training & Facilitation',
  'learning-management': 'Learning Management',
  'curriculum-development': 'Curriculum Development',
  'corporate-training': 'Corporate Training',
  'learning-technology': 'Learning Technology',
  'talent-development': 'Talent Development',
  'other': 'Other L&D',
};

const locationTypeLabels: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
};

const employmentTypeLabels: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'contract': 'Contract',
  'freelance': 'Freelance',
};

export default function JobCard({ job, compact = false }: JobCardProps) {
  const postedDate = job.postedAt instanceof Date ? job.postedAt : new Date(job.postedAt);

  const formatSalary = () => {
    if (!job.salary) return null;
    const { min, max, currency, period } = job.salary;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    });

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}${period === 'hourly' ? '/hr' : '/yr'}`;
    } else if (min) {
      return `From ${formatter.format(min)}${period === 'hourly' ? '/hr' : '/yr'}`;
    } else if (max) {
      return `Up to ${formatter.format(max)}${period === 'hourly' ? '/hr' : '/yr'}`;
    }
    return null;
  };

  return (
    <div
      className={`bg-white rounded-lg border ${
        job.isFeatured ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-gray-200'
      } p-4 sm:p-6 hover:shadow-md transition-shadow`}
    >
      {/* Featured Badge */}
      {job.isFeatured && (
        <div className="flex items-center space-x-1 text-indigo-600 text-xs font-medium mb-2">
          <Star className="w-3 h-3 fill-current" />
          <span>Featured</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <Link href={`/jobs/${job.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate">
              {job.title}
            </h3>
          </Link>
          <p className="text-gray-600 mt-1">{job.company}</p>
        </div>
        {job.isDirectPost && (
          <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Direct
          </span>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4" />
          <span>{job.location}</span>
          <span className="text-gray-300">|</span>
          <span className="text-indigo-600">{locationTypeLabels[job.locationType]}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Briefcase className="w-4 h-4" />
          <span>{employmentTypeLabels[job.employmentType]}</span>
        </div>
        {formatSalary() && (
          <div className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4" />
            <span>{formatSalary()}</span>
          </div>
        )}
      </div>

      {/* Category Tag */}
      <div className="mt-3">
        <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
          {categoryLabels[job.category] || job.category}
        </span>
      </div>

      {/* Description Preview (non-compact only) */}
      {!compact && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{job.description}</p>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{formatDistanceToNow(postedDate, { addSuffix: true })}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-400">via {job.sourceSite}</span>
          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>Apply</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
