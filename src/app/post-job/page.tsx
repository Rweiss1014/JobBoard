'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle,
  Star,
  ArrowRight,
} from 'lucide-react';
import { JobCategory, ExperienceLevel, EmploymentType } from '@/types';
import { PRICING } from '@/lib/stripe';

const categories: { value: JobCategory; label: string }[] = [
  { value: 'instructional-design', label: 'Instructional Design' },
  { value: 'elearning-development', label: 'E-Learning Development' },
  { value: 'training-facilitation', label: 'Training & Facilitation' },
  { value: 'learning-management', label: 'Learning Management' },
  { value: 'curriculum-development', label: 'Curriculum Development' },
  { value: 'corporate-training', label: 'Corporate Training' },
  { value: 'learning-technology', label: 'Learning Technology' },
  { value: 'talent-development', label: 'Talent Development' },
];

const experienceLevels: { value: ExperienceLevel; label: string }[] = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'director', label: 'Director' },
];

const employmentTypes: { value: EmploymentType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
];

type Step = 'details' | 'pricing' | 'review';

export default function PostJobPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('details');
  const [selectedTier, setSelectedTier] = useState<'basic' | 'featured'>('basic');
  const [loading, setLoading] = useState(false);

  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    location: '',
    locationType: 'remote' as 'remote' | 'hybrid' | 'onsite',
    description: '',
    requirements: '',
    category: 'instructional-design' as JobCategory,
    experienceLevel: 'mid' as ExperienceLevel,
    employmentType: 'full-time' as EmploymentType,
    salaryMin: '',
    salaryMax: '',
    salaryPeriod: 'annual' as 'annual' | 'hourly',
    applicationUrl: '',
  });

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Create Stripe checkout session with full job data
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'job_posting',
          tier: selectedTier,
          jobData: jobData, // Send all job data to be stored in pendingJobs
          successUrl: `${window.location.origin}/post-job/success`,
          cancelUrl: `${window.location.origin}/post-job?cancelled=true`,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title *
          </label>
          <input
            type="text"
            required
            value={jobData.title}
            onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Senior Instructional Designer"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            required
            value={jobData.company}
            onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Your company name"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            required
            value={jobData.location}
            onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., New York, NY or Remote"
          />
        </div>

        {/* Location Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Work Arrangement *
          </label>
          <select
            value={jobData.locationType}
            onChange={(e) =>
              setJobData({
                ...jobData,
                locationType: e.target.value as typeof jobData.locationType,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            value={jobData.category}
            onChange={(e) =>
              setJobData({ ...jobData, category: e.target.value as JobCategory })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level *
          </label>
          <select
            value={jobData.experienceLevel}
            onChange={(e) =>
              setJobData({
                ...jobData,
                experienceLevel: e.target.value as ExperienceLevel,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {experienceLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Employment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employment Type *
          </label>
          <select
            value={jobData.employmentType}
            onChange={(e) =>
              setJobData({
                ...jobData,
                employmentType: e.target.value as EmploymentType,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {employmentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Salary */}
        <div className="md:col-span-2 grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary Min (optional)
            </label>
            <input
              type="number"
              value={jobData.salaryMin}
              onChange={(e) => setJobData({ ...jobData, salaryMin: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="80000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary Max (optional)
            </label>
            <input
              type="number"
              value={jobData.salaryMax}
              onChange={(e) => setJobData({ ...jobData, salaryMax: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="100000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <select
              value={jobData.salaryPeriod}
              onChange={(e) =>
                setJobData({
                  ...jobData,
                  salaryPeriod: e.target.value as 'annual' | 'hourly',
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="annual">Per Year</option>
              <option value="hourly">Per Hour</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description *
          </label>
          <textarea
            required
            rows={6}
            value={jobData.description}
            onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
          />
        </div>

        {/* Requirements */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Requirements (one per line)
          </label>
          <textarea
            rows={4}
            value={jobData.requirements}
            onChange={(e) => setJobData({ ...jobData, requirements: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="5+ years instructional design experience&#10;Expertise in Articulate Storyline&#10;Strong understanding of adult learning principles"
          />
        </div>

        {/* Application URL */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Application URL *
          </label>
          <input
            type="url"
            required
            value={jobData.applicationUrl}
            onChange={(e) =>
              setJobData({ ...jobData, applicationUrl: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://yourcompany.com/careers/apply"
          />
          <p className="mt-1 text-xs text-gray-500">
            Where should candidates apply? This can be your careers page or ATS link.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setStep('pricing')}
          disabled={!jobData.title || !jobData.company || !jobData.description}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Pricing
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderPricingStep = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Tier */}
        <div
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
            selectedTier === 'basic'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedTier('basic')}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {PRICING.jobPosting.basic.name}
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${PRICING.jobPosting.basic.price}
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedTier === 'basic'
                  ? 'border-indigo-500 bg-indigo-500'
                  : 'border-gray-300'
              }`}
            >
              {selectedTier === 'basic' && (
                <CheckCircle className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
          <ul className="space-y-2">
            {PRICING.jobPosting.basic.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Featured Tier */}
        <div
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all relative ${
            selectedTier === 'featured'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedTier('featured')}
        >
          <div className="absolute -top-3 left-4 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            Recommended
          </div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {PRICING.jobPosting.featured.name}
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${PRICING.jobPosting.featured.price}
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedTier === 'featured'
                  ? 'border-indigo-500 bg-indigo-500'
                  : 'border-gray-300'
              }`}
            >
              {selectedTier === 'featured' && (
                <CheckCircle className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
          <ul className="space-y-2">
            {PRICING.jobPosting.featured.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep('details')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep('review')}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Review & Pay
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const selectedPricing =
      PRICING.jobPosting[selectedTier as keyof typeof PRICING.jobPosting];

    return (
      <div className="space-y-6">
        {/* Job Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Job Summary
          </h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Title</dt>
              <dd className="font-medium text-gray-900">{jobData.title}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Company</dt>
              <dd className="font-medium text-gray-900">{jobData.company}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Location</dt>
              <dd className="font-medium text-gray-900">
                {jobData.location} ({jobData.locationType})
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd className="font-medium text-gray-900 capitalize">
                {jobData.employmentType.replace('-', ' ')}
              </dd>
            </div>
          </dl>
        </div>

        {/* Pricing Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            Order Summary
          </h3>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">{selectedPricing.name}</span>
            <span className="font-medium">${selectedPricing.price}.00</span>
          </div>
          <div className="flex justify-between items-center py-3 text-lg font-bold">
            <span>Total</span>
            <span className="text-indigo-600">${selectedPricing.price}.00</span>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setStep('pricing')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay $${selectedPricing.price}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-indigo-600" />
          Post a Job
        </h1>
        <p className="mt-2 text-gray-600">
          Reach qualified L&D professionals with your job posting
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          {['details', 'pricing', 'review'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? 'bg-indigo-600 text-white'
                    : ['details', 'pricing', 'review'].indexOf(step) > i
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {['details', 'pricing', 'review'].indexOf(step) > i ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={`w-16 sm:w-24 h-1 ${
                    ['details', 'pricing', 'review'].indexOf(step) > i
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-gray-600">Job Details</span>
          <span className="text-gray-600">Pricing</span>
          <span className="text-gray-600">Review</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {step === 'details' && renderDetailsStep()}
        {step === 'pricing' && renderPricingStep()}
        {step === 'review' && renderReviewStep()}
      </div>
    </div>
  );
}
