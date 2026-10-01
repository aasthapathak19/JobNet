import React from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setFilters } from '@/redux/jobSlice';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const TRENDING_ROLES = [
    "AI Engineer", "DevOps Engineer", "Cybersecurity Engineer",
    "Machine Learning Engineer", "Data Scientist"
];

const LatestJobs = () => {
    const { allJobs } = useSelector(store => store.job);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleRoleClick = (role) => {
        dispatch(setFilters({ category: role }));
        navigate("/jobs");
    };

    const handleViewAll = () => {
        navigate("/jobs");
    };

    const featuredJobs = allJobs.filter(j => j.featured).slice(0, 3);
    const latestJobs = allJobs.slice(0, 6);
    const displayJobs = featuredJobs.length >= 3 ? featuredJobs : latestJobs;

    return (
        <div className='max-w-7xl mx-auto px-4 py-12'>
            {/* Trending roles section */}
            <div className="mb-10 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-[#6A38C2]" />
                    <h3 className="font-bold text-gray-800">Trending Roles</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {TRENDING_ROLES.map(role => (
                        <button
                            key={role}
                            onClick={() => handleRoleClick(role)}
                            className="text-sm px-4 py-2 rounded-full bg-white border border-purple-200 text-[#6A38C2] font-medium hover:bg-[#6A38C2] hover:text-white hover:border-[#6A38C2] transition-all duration-200 shadow-sm"
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Latest/Featured Jobs */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className='text-3xl font-bold text-gray-900'>
                        <span className='text-[#6A38C2]'>Latest & Featured </span>Jobs
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Handpicked opportunities from top companies</p>
                </div>
                <Button
                    onClick={handleViewAll}
                    variant="outline"
                    className="border-[#6A38C2] text-[#6A38C2] hover:bg-purple-50 flex items-center gap-1"
                >
                    View All <ArrowRight className="h-4 w-4" />
                </Button>
            </div>

            {allJobs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>No jobs available yet. Check back soon!</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {displayJobs.map((job) => (
                        <LatestJobCards key={job._id} job={job} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default LatestJobs