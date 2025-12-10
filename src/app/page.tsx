import Link from "next/link";
import { Search, Briefcase, Users, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              The L&D Industry&apos;s Premier
              <span className="block mt-2">Job Board & Talent Network</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-indigo-100">
              Connect with top instructional designers, e-learning developers, and
              training professionals. Find your next opportunity or hire expert
              L&D talent.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Browse Jobs
              </Link>
              <Link
                href="/freelancers"
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-400 transition-colors border border-indigo-400"
              >
                <Users className="w-5 h-5 mr-2" />
                Find Talent
              </Link>
            </div>
          </div>

          {/* Quick Search */}
          <div className="mt-12 max-w-2xl mx-auto">
            <form action="/jobs" method="GET" className="relative">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Search jobs: Instructional Designer, E-Learning Developer..."
                    className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-900 text-white font-semibold rounded-lg hover:bg-indigo-950 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">500+</div>
              <div className="text-sm text-gray-600 mt-1">Active Jobs</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">200+</div>
              <div className="text-sm text-gray-600 mt-1">L&D Freelancers</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">50+</div>
              <div className="text-sm text-gray-600 mt-1">Companies Hiring</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">100%</div>
              <div className="text-sm text-gray-600 mt-1">L&D Focused</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Browse by L&D Specialty
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Find opportunities across all areas of Learning & Development
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: "Instructional Design", slug: "instructional-design", count: 120 },
              { name: "E-Learning Development", slug: "elearning-development", count: 85 },
              { name: "Training & Facilitation", slug: "training-facilitation", count: 65 },
              { name: "Learning Management", slug: "learning-management", count: 45 },
              { name: "Curriculum Development", slug: "curriculum-development", count: 40 },
              { name: "Corporate Training", slug: "corporate-training", count: 55 },
              { name: "Learning Technology", slug: "learning-technology", count: 35 },
              { name: "Talent Development", slug: "talent-development", count: 30 },
            ].map((category) => (
              <Link
                key={category.slug}
                href={`/jobs?category=${category.slug}`}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <h3 className="font-medium text-gray-900 group-hover:text-indigo-600">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{category.count} jobs</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Two Column Feature Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            {/* For Job Seekers */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                For L&D Professionals
              </h3>
              <ul className="space-y-3 mb-6">
                {[
                  "Access curated jobs from top L&D job boards",
                  "Create a profile to showcase your expertise",
                  "Get discovered by employers seeking L&D talent",
                  "Set up job alerts for new opportunities",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?type=freelancer"
                className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800"
              >
                Create your profile
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* For Employers */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                For Employers & Agencies
              </h3>
              <ul className="space-y-3 mb-6">
                {[
                  "Browse verified L&D freelancers and consultants",
                  "Post jobs directly to reach qualified candidates",
                  "Feature your listing for maximum visibility",
                  "Access a niche talent pool of L&D experts",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/post-job"
                className="inline-flex items-center text-green-600 font-medium hover:text-green-800"
              >
                Post a job
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Ready to find your next L&D opportunity?
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Join hundreds of instructional designers, e-learning developers, and
            training professionals who use L&D Exchange to advance their careers.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse All Jobs
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 bg-transparent text-white font-semibold rounded-lg border border-gray-600 hover:border-white transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
