import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

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
              Your gateway to top tech opportunities in India. Built for serious engineers.
            </p>
            <div className="flex gap-3">
              <a href="https://linkedin.com" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452H16.85v-5.569c0-1.327-.027-3.037-1.852-3.037-1.854 0-2.137 1.446-2.137 2.94v5.666H9.147V9.756h3.448v1.464h.05c.48-.91 1.653-1.871 3.401-1.871 3.634 0 4.307 2.39 4.307 5.498v5.605zM5.337 8.29c-1.105 0-2-.896-2-2 0-1.106.895-2 2-2 1.104 0 2 .895 2 2 0 1.104-.896 2-2 2zM7.119 20.452H3.553V9.756h3.566v10.696zM22.225 0H1.771C.791 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451c.979 0 1.771-.774 1.771-1.729V1.729C24 .774 23.205 0 22.225 0z" /></svg>
              </a>
              <a href="https://github.com" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
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
          <p className="text-xs text-gray-500">© 2024 JobNet · Built by Aastha Pathak</p>
          <p className="text-xs text-gray-500">A serious engineering project for your portfolio 🚀</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;