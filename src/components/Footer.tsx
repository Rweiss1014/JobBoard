import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L&D</span>
              </div>
              <span className="font-semibold text-white text-lg">L&D Exchange</span>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              The premier job board and freelancer directory for Learning & Development
              professionals. Find instructional design, e-learning, and corporate training
              opportunities.
            </p>
          </div>

          {/* Job Seekers */}
          <div>
            <h3 className="font-semibold text-white mb-4">For Professionals</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="hover:text-indigo-400 transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/signup?type=freelancer" className="hover:text-indigo-400 transition-colors">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-indigo-400 transition-colors">
                  Career Resources
                </Link>
              </li>
              <li>
                <Link href="/alerts" className="hover:text-indigo-400 transition-colors">
                  Job Alerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h3 className="font-semibold text-white mb-4">For Employers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/freelancers" className="hover:text-indigo-400 transition-colors">
                  Find Talent
                </Link>
              </li>
              <li>
                <Link href="/post-job" className="hover:text-indigo-400 transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-indigo-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/signup?type=employer" className="hover:text-indigo-400 transition-colors">
                  Employer Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} L&D Exchange. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-indigo-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-indigo-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-indigo-400 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
