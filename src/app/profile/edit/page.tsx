'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Link as LinkIcon,
  Linkedin,
  Globe,
  Plus,
  X,
  Save,
} from 'lucide-react';
import { JobCategory } from '@/types';

const categoryOptions: { value: JobCategory; label: string }[] = [
  { value: 'instructional-design', label: 'Instructional Design' },
  { value: 'elearning-development', label: 'E-Learning Development' },
  { value: 'training-facilitation', label: 'Training & Facilitation' },
  { value: 'learning-management', label: 'Learning Management' },
  { value: 'curriculum-development', label: 'Curriculum Development' },
  { value: 'corporate-training', label: 'Corporate Training' },
  { value: 'learning-technology', label: 'Learning Technology' },
  { value: 'talent-development', label: 'Talent Development' },
];

const commonSkillSuggestions = [
  'Articulate Storyline',
  'Articulate Rise',
  'Adobe Captivate',
  'Camtasia',
  'Adobe Premiere',
  'After Effects',
  'Vyond',
  'HTML5',
  'CSS',
  'JavaScript',
  'SCORM',
  'xAPI',
  'LMS Administration',
  'Instructional Design',
  'Curriculum Development',
  'Needs Analysis',
  'Adult Learning Theory',
  'ADDIE',
  'SAM',
  'Agile',
];

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'GMT/BST (UK)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

export default function EditProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const [profile, setProfile] = useState({
    displayName: '',
    headline: '',
    bio: '',
    location: '',
    timezone: 'America/New_York',
    availableRemotely: true,
    specializations: [] as JobCategory[],
    skills: [] as string[],
    experienceYears: 3,
    hourlyRateMin: '',
    hourlyRateMax: '',
    portfolioUrl: '',
    linkedinUrl: '',
    websiteUrl: '',
    availability: 'available' as 'available' | 'limited' | 'unavailable',
    availabilityNote: '',
  });

  const handleSpecializationToggle = (spec: JobCategory) => {
    setProfile((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const handleAddSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !profile.skills.includes(trimmedSkill)) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill],
      }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // In production, this would save to Firestore
      console.log('Saving profile:', profile);

      // Simulate save delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push('/freelancers/1'); // Would redirect to actual profile ID
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {profile.displayName ? 'Edit Your Profile' : 'Create Your Profile'}
        </h1>
        <p className="mt-2 text-gray-600">
          Complete your profile to be discovered by employers looking for L&D talent
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                required
                value={profile.displayName}
                onChange={(e) =>
                  setProfile({ ...profile, displayName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Sarah Chen"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professional Headline *
              </label>
              <input
                type="text"
                required
                value={profile.headline}
                onChange={(e) =>
                  setProfile({ ...profile, headline: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Senior Instructional Designer | Articulate Expert | 10+ Years Experience"
              />
              <p className="mt-1 text-xs text-gray-500">
                A brief tagline that summarizes your expertise
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio *
              </label>
              <textarea
                required
                rows={4}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tell employers about your experience, approach, and what makes you unique..."
              />
            </div>
          </div>
        </section>

        {/* Location & Availability */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            Location & Availability
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Seattle, WA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  value={profile.timezone}
                  onChange={(e) =>
                    setProfile({ ...profile, timezone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.availableRemotely}
                onChange={(e) =>
                  setProfile({ ...profile, availableRemotely: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">
                Available for remote work
              </span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Availability
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'available', label: 'Available' },
                  { value: 'limited', label: 'Limited' },
                  { value: 'unavailable', label: 'Unavailable' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex-1 text-center py-2 px-4 rounded-lg border cursor-pointer transition-colors ${
                      profile.availability === opt.value
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="availability"
                      value={opt.value}
                      checked={profile.availability === opt.value}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          availability: e.target.value as typeof profile.availability,
                        })
                      }
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability Note (optional)
              </label>
              <input
                type="text"
                value={profile.availabilityNote}
                onChange={(e) =>
                  setProfile({ ...profile, availabilityNote: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Available starting January 2025"
              />
            </div>
          </div>
        </section>

        {/* Expertise */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            Expertise
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specializations * (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleSpecializationToggle(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      profile.specializations.includes(cat.value)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills *
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-indigo-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(newSkill);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add a skill..."
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(newSkill)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Suggestions:</p>
                <div className="flex flex-wrap gap-1">
                  {commonSkillSuggestions
                    .filter((s) => !profile.skills.includes(s))
                    .slice(0, 8)
                    .map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleAddSkill(skill)}
                        className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                      >
                        + {skill}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="50"
                  value={profile.experienceYears}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      experienceYears: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Rates */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            Hourly Rate (Optional)
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum (USD/hr)
              </label>
              <input
                type="number"
                min="0"
                value={profile.hourlyRateMin}
                onChange={(e) =>
                  setProfile({ ...profile, hourlyRateMin: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="75"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum (USD/hr)
              </label>
              <input
                type="number"
                min="0"
                value={profile.hourlyRateMax}
                onChange={(e) =>
                  setProfile({ ...profile, hourlyRateMax: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="125"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Displaying your rate helps employers filter for their budget
          </p>
        </section>

        {/* Links */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-indigo-600" />
            Links
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn URL
                </span>
              </label>
              <input
                type="url"
                value={profile.linkedinUrl}
                onChange={(e) =>
                  setProfile({ ...profile, linkedinUrl: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portfolio URL
              </label>
              <input
                type="url"
                value={profile.portfolioUrl}
                onChange={(e) =>
                  setProfile({ ...profile, portfolioUrl: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://yourportfolio.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Website URL
                </span>
              </label>
              <input
                type="url"
                value={profile.websiteUrl}
                onChange={(e) =>
                  setProfile({ ...profile, websiteUrl: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
