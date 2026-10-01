import React, { useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowUpDown, Briefcase, MapPin, SlidersHorizontal } from 'lucide-react';
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job';
import JobSkeleton from './JobSkeleton';
import { setFilters, clearFilters } from '@/redux/jobSlice';
import { filterAndRankJobs, filtersToURLParams, urlParamsToFilters, hasActiveFilters, SALARY_RANGES } from '@/utils/searchUtils';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { Button } from './ui/button';

const SortBar = ({ count, filters, onSortChange }) => (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{count}</span> job{count !== 1 ? 's' : ''} found
            {filters.query && <span className="text-[#6A38C2]"> for "{filters.query}"</span>}
        </p>
        <select
            value={filters.sort || 'recent'}
            onChange={e => onSortChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#6A38C2] bg-white cursor-pointer"
        >
            <option value="recent">Sort: Newest</option>
            <option value="salary_high">Salary: High to Low</option>
            <option value="salary_low">Salary: Low to High</option>
        </select>
    </div>
);

const EmptyState = ({ filters, onClear }) => {
    const activeFilters = [];
    if (filters.query) activeFilters.push(`"${filters.query}"`);
    if (filters.location) activeFilters.push(filters.location);
    if (filters.category) activeFilters.push(filters.category);
    if (filters.salaryRange) activeFilters.push(SALARY_RANGES.find(s => s.value === filters.salaryRange)?.label || filters.salaryRange);

    return (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No jobs found</h3>
            {activeFilters.length > 0 && (
                <p className="text-gray-500 text-sm mb-6 max-w-md">
                    No results for {activeFilters.join(", ")}. Try adjusting your filters.
                </p>
            )}
            <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={onClear} variant="outline" size="sm" className="border-[#6A38C2] text-[#6A38C2]">
                    <X className="h-3 w-3 mr-1" /> Clear all filters
                </Button>
                {filters.location && (
                    <Button
                        onClick={() => onClear('location')}
                        variant="ghost"
                        size="sm"
                        className="text-gray-600"
                    >
                        Try without location filter
                    </Button>
                )}
                {filters.salaryRange && (
                    <Button
                        onClick={() => onClear('salaryRange')}
                        variant="ghost"
                        size="sm"
                        className="text-gray-600"
                    >
                        Try any salary
                    </Button>
                )}
            </div>
            <div className="mt-8 text-sm text-gray-400">
                <p>Suggestions: Try "cybersecurity", "AI engineer", "devops", "data scientist"</p>
            </div>
        </div>
    );
};

const Jobs = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { allJobs, filters = {}, isLoading } = useSelector(store => store.job);

    // Fetch jobs reactively based on filters
    useGetAllJobs();

    // Sync URL params → Redux filters on mount
    useEffect(() => {
        const urlFilters = urlParamsToFilters(searchParams);
        const hasAny = Object.values(urlFilters).some(v => v && v !== 'recent');
        if (hasAny) {
            dispatch(setFilters(urlFilters));
        }
    }, []); // only on mount

    // Sync Redux filters → URL params (debounced-style: whenever filters change)
    useEffect(() => {
        const params = filtersToURLParams(filters);
        const paramStr = params.toString();
        const currentStr = searchParams.toString();
        if (paramStr !== currentStr) {
            setSearchParams(params, { replace: true });
        }
    }, [filters]);

    // Client-side filter + rank pipeline (applied on top of backend results)
    const filteredJobs = useMemo(() => {
        return filterAndRankJobs(allJobs, filters);
    }, [allJobs, filters]);

    const handleSortChange = useCallback((sort) => {
        dispatch(setFilters({ sort }));
    }, [dispatch]);

    const handleClear = useCallback((key) => {
        if (key) {
            dispatch(setFilters({ [key]: '' }));
        } else {
            dispatch(clearFilters());
        }
    }, [dispatch]);

    const activeFilters = hasActiveFilters(filters);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 py-6'>
                {/* Page title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {filters.query ? (
                            <>
                                Results for <span className="text-[#6A38C2]">"{filters.query}"</span>
                            </>
                        ) : "Browse Jobs"}
                    </h1>
                    {activeFilters && (
                        <p className="text-sm text-gray-500 mt-1">Use filters to refine your results</p>
                    )}
                </div>

                <div className='flex gap-6'>
                    {/* Sidebar Filters */}
                    <div className='w-72 flex-shrink-0 hidden md:block sticky top-6 self-start'>
                        <FilterCard />
                    </div>

                    {/* Job Results */}
                    <div className='flex-1 min-w-0'>
                        {isLoading ? (
                            <>
                                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
                                <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                                    {[...Array(6)].map((_, i) => <JobSkeleton key={i} />)}
                                </div>
                            </>
                        ) : filteredJobs.length === 0 ? (
                            <EmptyState filters={filters} onClear={handleClear} />
                        ) : (
                            <>
                                <SortBar
                                    count={filteredJobs.length}
                                    filters={filters}
                                    onSortChange={handleSortChange}
                                />
                                <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                                    <AnimatePresence>
                                        {filteredJobs.map((job, idx) => (
                                            <motion.div
                                                key={job?._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2, delay: idx * 0.03 }}
                                            >
                                                <Job job={job} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Jobs