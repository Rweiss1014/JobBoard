'use client';

import { useState, useMemo } from 'react';
import { Search, Users } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import FreelancerFilters from '@/components/FreelancerFilters';
import { FreelancerFilters as FreelancerFiltersType } from '@/types';
import { mockFreelancers } from '@/lib/mockData';

export default function FreelancersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FreelancerFiltersType>({});

  const filteredFreelancers = useMemo(() => {
    let result = [...mockFreelancers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (profile) =>
          profile.displayName.toLowerCase().includes(query) ||
          profile.headline.toLowerCase().includes(query) ||
          profile.bio.toLowerCase().includes(query) ||
          profile.skills.some((skill) => skill.toLowerCase().includes(query)) ||
          profile.location.toLowerCase().includes(query)
      );
    }

    // Remote only filter
    if (filters.remoteOnly) {
      result = result.filter((profile) => profile.availableRemotely);
    }

    // Specialization filter
    if (filters.specializations && filters.specializations.length > 0) {
      result = result.filter((profile) =>
        profile.specializations.some((spec) =>
          filters.specializations!.includes(spec)
        )
      );
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      result = result.filter((profile) =>
        filters.skills!.some((skill) =>
          profile.skills.some(
            (profileSkill) =>
              profileSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Availability filter
    if (filters.availability && filters.availability.length > 0) {
      result = result.filter((profile) =>
        filters.availability!.includes(profile.availability as 'available' | 'limited')
      );
    }

    // Experience filter
    if (filters.minExperience) {
      result = result.filter(
        (profile) => profile.experienceYears >= filters.minExperience!
      );
    }

    // Sort: featured first, then by experience
    result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.experienceYears - a.experienceYears;
    });

    return result;
  }, [searchQuery, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          L&D Freelancer Directory
        </h1>
        <p className="mt-2 text-gray-600">
          Connect with expert instructional designers, e-learning developers, and
          training consultants
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, skill, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <FreelancerFilters filters={filters} onFiltersChange={setFilters} />
        </aside>

        {/* Freelancer Listings */}
        <div className="flex-1">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {filteredFreelancers.length} professional
              {filteredFreelancers.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Profiles Grid */}
          {filteredFreelancers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredFreelancers.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No freelancers found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters to find more results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
