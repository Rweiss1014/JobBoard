import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function PostJobSuccessPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Job Posted Successfully!
        </h1>

        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your job posting is now live and will be
          visible to L&D professionals searching for opportunities.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
          <h2 className="font-medium text-gray-900 mb-2">What happens next?</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Your job will appear in search results immediately</li>
            <li>• Featured listings get priority placement for 30 days</li>
            <li>• You&apos;ll receive applications at the URL you provided</li>
            <li>• A confirmation email has been sent to you</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View All Jobs
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/post-job"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Post Another Job
          </Link>
        </div>
      </div>
    </div>
  );
}
