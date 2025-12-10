'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Briefcase, Loader2 } from 'lucide-react';
import JobCard from '@/components/JobCard';
import JobFilters from '@/components/JobFilters';
import { JobFilters as JobFiltersType, Job } from '@/types';
import { mockJobs } from '@/lib/mockData';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [firestoreJobs, setFirestoreJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs from Firestore
  useEffect(() => {
    async function fetchJobs() {
      try {
        const jobsRef = collection(db, 'jobs');
        const q = query(
          jobsRef,
          where('status', '==', 'active'),
          orderBy('postedAt', 'desc')
        );
        const snapshot = await getDocs(q);

        const jobs: Job[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            company: data.company,
            location: data.location,
            locationType: data.locationType,
            description: data.description,
            requirements: data.requirements || [],
            salary: data.salary,
            category: data.category,
            experienceLevel: data.experienceLevel,
            employmentType: data.employmentType,
            sourceUrl: data.sourceUrl || '',
            sourceSite: data.sourceSite || 'L&D Exchange',
            postedAt: data.postedAt?.toDate?.() || new Date(data.postedAt),
            expiresAt: data.expiresAt?.toDate?.() || new Date(data.expiresAt),
            isFeatured: data.isFeatured || false,
            isDirectPost: data.isDirectPost || false,
            status: data.status,
          } as Job;
        });

        setFirestoreJobs(jobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  // Combine Firestore jobs with mock jobs
  const allJobs = useMemo(() => {
    return [...firestoreJobs, ...mockJobs];
  }, [firestoreJobs]);

  const filteredJobs = useMemo(() => {
    let result = [...allJobs];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.description.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter((job) => filters.categories!.includes(job.category));
    }

    // Experience level filter
    if (filters.experienceLevels && filters.experienceLevels.length > 0) {
      result = result.filter((job) =>
        filters.experienceLevels!.includes(job.experienceLevel)
      );
    }

    // Employment type filter
    if (filters.employmentTypes && filters.employmentTypes.length > 0) {
      result = result.filter((job) =>
        filters.employmentTypes!.includes(job.employmentType)
      );
    }

    // Location type filter
    if (filters.locationTypes && filters.locationTypes.length > 0) {
      result = result.filter((job) =>
        filters.locationTypes!.includes(job.locationType)
      );
    }

    // Sort: featured first, then by date
    result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });

    return result;
  }, [searchQuery, filters, allJobs]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          L&D Job Listings
        </h1>
        <p className="mt-2 text-gray-600">
          Discover opportunities in instructional design, e-learning development, and
          corporate training
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title, company, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <JobFilters filters={filters} onFiltersChange={setFilters} />
        </aside>

        {/* Job Listings */}
        <div className="flex-1">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading jobs...
                </span>
              ) : (
                <>{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found</>
              )}
            </p>
          </div>

          {/* Jobs Grid */}
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Loader2 className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading job listings...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No jobs found
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
