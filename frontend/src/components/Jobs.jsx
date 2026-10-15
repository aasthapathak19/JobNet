import React, { useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job';
import { setFilters, clearFilters } from '@/redux/jobSlice';
import { filtersToURLParams, urlParamsToFilters, hasActiveFilters, SALARY_RANGES } from '@/utils/searchUtils';
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
            <option value="salary-high">Salary: High to Low</option>
            <option value="salary-low">Salary: Low to High</option>
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

const filtersAreEqual = (a = {}, b = {}) => (
    (a.query || "") === (b.query || "") &&
    (a.location || "") === (b.location || "") &&
    (a.category || "") === (b.category || "") &&
    (a.salaryRange || "") === (b.salaryRange || "") &&
    (a.experience || "") === (b.experience || "") &&
    (a.remoteType || "") === (b.remoteType || "") &&
    (a.sort || "recent") === (b.sort || "recent") &&
    Number(a.page || 1) === Number(b.page || 1)
);

const Jobs = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { allJobs, filters = {}, isLoading, pagination } = useSelector(store => store.job);

    // Fetch jobs reactively based on filters
    useGetAllJobs();

    // Keep a ref to latest searchParams so we can compare without depending on it
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    // ONE-TIME: Sync URL params → Redux filters on initial mount only
    useEffect(() => {
        const urlFilters = urlParamsToFilters(searchParamsRef.current);
        const hasAny = Object.values(urlFilters).some(v => v && v !== 'recent');
        if (hasAny) {
            dispatch(setFilters(urlFilters));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty array = run only once on mount

    // Sync Redux filters → URL params whenever filters change
    // Uses ref for searchParams to avoid this effect re-running when URL updates
    useEffect(() => {
        const params = filtersToURLParams(filters);
        const paramStr = params.toString();
        const currentStr = searchParamsRef.current.toString();
        if (paramStr !== currentStr) {
            setSearchParams(params, { replace: true });
        }
    }, [filters, setSearchParams]); // NO searchParams dependency here — uses ref instead

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
                        {isLoading && allJobs.length === 0 ? (
                            <div className="min-h-[360px]" aria-busy="true" aria-live="polite">
                                <span className="sr-only">Loading jobs...</span>
                            </div>
                        ) : allJobs.length === 0 ? (
                            <EmptyState filters={filters} onClear={handleClear} />
                        ) : (
                            <>
                                <SortBar
                                    count={pagination?.total ?? allJobs.length}
                                    filters={filters}
                                    onSortChange={handleSortChange}
                                />
                                <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                                    {allJobs.map((job) => (
                                        <Job key={job?._id} job={job} />
                                    ))}
                                </div>
                                {pagination?.totalPages > 1 && (
                                    <nav className="flex items-center justify-center gap-3 mt-8" aria-label="Job result pages">
                                        <Button variant="outline" disabled={!pagination.hasPreviousPage} onClick={() => dispatch(setFilters({ page: pagination.page - 1 }))}>Previous</Button>
                                        <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
                                        <Button variant="outline" disabled={!pagination.hasNextPage} onClick={() => dispatch(setFilters({ page: pagination.page + 1 }))}>Next</Button>
                                    </nav>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Jobs
