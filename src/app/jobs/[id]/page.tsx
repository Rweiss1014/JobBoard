'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Star,
  ExternalLink,
  ArrowLeft,
  Building2,
  Loader2
} from 'lucide-react';
import { Job } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

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

const experienceLevelLabels: Record<string, string> = {
  'entry': 'Entry Level',
  'mid': 'Mid Level',
  'senior': 'Senior Level',
  'lead': 'Lead / Principal',
  'director': 'Director / VP',
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      if (!jobId) return;

      try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));

        if (jobDoc.exists()) {
          const data = jobDoc.data();
          setJob({
            id: jobDoc.id,
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
          } as Job);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to load job');
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  const formatSalary = () => {
    if (!job?.salary) return null;
    const { min, max, currency, period } = job.salary;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 mx-auto animate-spin" />
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This job listing may have been removed or expired.'}</p>
          <Link
            href="/jobs"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to all jobs
          </Link>
        </div>
      </div>
    );
  }

  const postedDate = job.postedAt instanceof Date ? job.postedAt : new Date(job.postedAt);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        href="/jobs"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to all jobs
      </Link>

      {/* Job Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {/* Featured Badge */}
        {job.isFeatured && (
          <div className="flex items-center space-x-1 text-indigo-600 text-sm font-medium mb-3">
            <Star className="w-4 h-4 fill-current" />
            <span>Featured Position</span>
          </div>
        )}

        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex items-center mt-2 text-lg text-gray-700">
              <Building2 className="w-5 h-5 mr-2" />
              {job.company}
            </div>
          </div>
          {job.isDirectPost && (
            <span className="shrink-0 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Direct Post
            </span>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>{job.location}</span>
            <span className="text-indigo-600 font-medium">({locationTypeLabels[job.locationType]})</span>
          </div>
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>{employmentTypeLabels[job.employmentType]}</span>
          </div>
          {formatSalary() && (
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>{formatSalary()}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
            {categoryLabels[job.category] || job.category}
          </span>
          <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
            {experienceLevelLabels[job.experienceLevel] || job.experienceLevel}
          </span>
        </div>

        {/* Apply Button */}
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={job.sourceUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply Now
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
          <div className="text-sm text-gray-500">
            <Clock className="w-4 h-4 inline mr-1" />
            Posted {formatDistanceToNow(postedDate, { addSuffix: true })}
            <span className="mx-2">•</span>
            via {job.sourceSite}
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
          {job.description}
        </div>
      </div>

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
