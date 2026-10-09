import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 bg-gradient-to-br from-[#6A38C2] to-[#9b59b6] rounded-lg flex items-center justify-center">
                <Briefcase className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-lg font-extrabold text-white">Job<span className="text-[#9b59b6]">Net</span></span>
            </div>
            <p className="text-sm text-gray-400 mb-4 max-w-xs">
              A focused place for candidates to find relevant work and recruiters to build strong teams.
            </p>
            <div className="flex gap-3">
              <a href="https://github.com/aasthapathak19/JobNet" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="View JobNet on GitHub">
                <Github className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">For Job Seekers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="text-gray-400 hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link to="/profile" className="text-gray-400 hover:text-white transition-colors">My Profile</Link></li>
              <li><Link to="/signup" className="text-gray-400 hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">For Recruiters</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/admin/jobs/create" className="text-gray-400 hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link to="/admin/companies" className="text-gray-400 hover:text-white transition-colors">Manage Companies</Link></li>
              <li><Link to="/signup" className="text-gray-400 hover:text-white transition-colors">Sign Up as Recruiter</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} JobNet. Built by Aastha Pathak.</p>
          <p className="text-xs text-gray-500">Clear opportunities. Better hiring.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
