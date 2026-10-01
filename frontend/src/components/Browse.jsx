import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job';
import JobSkeleton from './JobSkeleton';
import { useDispatch, useSelector } from 'react-redux';
import { clearFilters } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { filterAndRankJobs } from '@/utils/searchUtils';
import { useMemo } from 'react';

const Browse = () => {
    useGetAllJobs();
    const { allJobs, filters = {}, isLoading } = useSelector(store => store.job);
    const dispatch = useDispatch();
    
    // Apply client-side filtering on top of server results
    const filteredJobs = useMemo(() => filterAndRankJobs(allJobs, filters), [allJobs, filters]);

    // Clear filters when leaving browse page
    useEffect(() => {
        return () => {
            dispatch(clearFilters());
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 py-8'>
                <div className="mb-6">
                    <h1 className='font-bold text-2xl text-gray-900'>
                        {filters.query
                            ? <>Results for <span className="text-[#6A38C2]">"{filters.query}"</span></>
                            : "All Jobs"
                        }
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isLoading ? "Searching..." : `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} found`}
                    </p>
                </div>
                
                {isLoading ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {[...Array(6)].map((_, i) => <JobSkeleton key={i} />)}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No jobs found</h3>
                        <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {filteredJobs.map((job) => (
                            <Job key={job._id} job={job} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Browse