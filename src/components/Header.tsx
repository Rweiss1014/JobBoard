'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Briefcase, Users, LogIn, UserPlus } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L&D</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg hidden sm:block">
              L&D Exchange
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/jobs"
              className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              <span>Find Jobs</span>
            </Link>
            <Link
              href="/freelancers"
              className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Find Talent</span>
            </Link>
            <Link
              href="/post-job"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Post a Job
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </Link>
            <Link
              href="/signup"
              className="flex items-center space-x-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/jobs"
                className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Briefcase className="w-5 h-5" />
                <span>Find Jobs</span>
              </Link>
              <Link
                href="/freelancers"
                className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="w-5 h-5" />
                <span>Find Talent</span>
              </Link>
              <Link
                href="/post-job"
                className="text-gray-600 hover:text-indigo-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Post a Job
              </Link>
              <hr className="border-gray-200" />
              <Link
                href="/login"
                className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="w-5 h-5" />
                <span>Log In</span>
              </Link>
              <Link
                href="/signup"
                className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus className="w-5 h-5" />
                <span>Sign Up</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
