import Link from 'next/link';
import { MapPin, Clock, Star, Globe, Linkedin, ExternalLink } from 'lucide-react';
import { FreelancerProfile } from '@/types';

interface ProfileCardProps {
  profile: FreelancerProfile;
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

const availabilityConfig = {
  available: { label: 'Available', color: 'bg-green-100 text-green-700' },
  limited: { label: 'Limited', color: 'bg-yellow-100 text-yellow-700' },
  unavailable: { label: 'Unavailable', color: 'bg-gray-100 text-gray-500' },
};

export default function ProfileCard({ profile, compact = false }: ProfileCardProps) {
  const formatHourlyRate = () => {
    if (!profile.hourlyRate) return null;
    const { min, max, currency } = profile.hourlyRate;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    });

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}/hr`;
    } else if (min) {
      return `From ${formatter.format(min)}/hr`;
    }
    return null;
  };

  return (
    <div
      className={`bg-white rounded-lg border ${
        profile.isFeatured ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-gray-200'
      } p-4 sm:p-6 hover:shadow-md transition-shadow`}
    >
      {/* Featured Badge */}
      {profile.isFeatured && (
        <div className="flex items-center space-x-1 text-indigo-600 text-xs font-medium mb-2">
          <Star className="w-3 h-3 fill-current" />
          <span>Featured Professional</span>
        </div>
      )}

      {/* Header with Avatar */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-semibold text-lg">
                {profile.displayName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </span>
            </div>
          )}
        </div>

        {/* Name and Headline */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/freelancers/${profile.id}`}>
                <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                  {profile.displayName}
                </h3>
              </Link>
              <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{profile.headline}</p>
            </div>
            <span
              className={`shrink-0 text-xs px-2 py-1 rounded-full ${
                availabilityConfig[profile.availability].color
              }`}
            >
              {availabilityConfig[profile.availability].label}
            </span>
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4" />
          <span>{profile.location}</span>
          {profile.availableRemotely && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-indigo-600">Remote OK</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>{profile.experienceYears}+ years</span>
        </div>
        {formatHourlyRate() && (
          <div className="flex items-center space-x-1">
            <span className="font-medium text-gray-700">{formatHourlyRate()}</span>
          </div>
        )}
      </div>

      {/* Specializations */}
      <div className="mt-3 flex flex-wrap gap-1">
        {profile.specializations.slice(0, 3).map((spec) => (
          <span
            key={spec}
            className="inline-block text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded"
          >
            {categoryLabels[spec] || spec}
          </span>
        ))}
        {profile.specializations.length > 3 && (
          <span className="inline-block text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
            +{profile.specializations.length - 3} more
          </span>
        )}
      </div>

      {/* Skills (non-compact only) */}
      {!compact && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">Skills</p>
          <div className="flex flex-wrap gap-1">
            {profile.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
            {profile.skills.length > 5 && (
              <span className="inline-block text-xs text-gray-400">
                +{profile.skills.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bio (non-compact only) */}
      {!compact && profile.bio && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        {/* External Links */}
        <div className="flex items-center space-x-3">
          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-indigo-600 transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {profile.portfolioUrl && (
            <a
              href={profile.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-indigo-600 transition-colors"
              title="Portfolio"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {profile.websiteUrl && (
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-indigo-600 transition-colors"
              title="Website"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>

        <Link
          href={`/freelancers/${profile.id}`}
          className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
