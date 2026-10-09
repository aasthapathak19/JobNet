import { setAllJobs, setJobsLoading } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import api from '@/lib/api'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const { filters = {} } = useSelector(store => store.job);

    useEffect(() => {
        const controller = new AbortController();
        const fetchAllJobs = async () => {
            dispatch(setJobsLoading(true));
            try {
                // Build query params from structured filters
                const params = new URLSearchParams();
                if (filters?.query) params.set('keyword', filters.query);
                if (filters?.location) params.set('location', filters.location);
                if (filters?.category) params.set('category', filters.category);
                if (filters?.sort) params.set('sort', filters.sort);
                if (filters?.page) params.set('page', filters.page);
                params.set('limit', '12');

                // Parse salary range for backend
                if (filters?.salaryRange) {
                    const range = filters.salaryRange;
                    if (range.endsWith('+')) {
                        params.set('salaryMin', range.replace('+', ''));
                    } else {
                        const parts = range.split('-');
                        if (parts.length === 2) {
                            params.set('salaryMin', parts[0]);
                            params.set('salaryMax', parts[1]);
                        }
                    }
                }
                if (filters?.experience) params.set('experience', filters.experience);
                if (filters?.remoteType) params.set('remoteType', filters.remoteType);

                const url = `${JOB_API_END_POINT}/get?${params.toString()}`;
                const res = await api.get(url, { signal: controller.signal });
                if (res.data.success) {
                    dispatch(setAllJobs({ jobs: res.data.jobs, pagination: res.data.pagination }));
                }
            } catch (error) {
                if (error.code !== 'ERR_CANCELED') console.error('Failed to fetch jobs:', error);
            } finally {
                if (!controller.signal.aborted) dispatch(setJobsLoading(false));
            }
        }
        const timer = window.setTimeout(fetchAllJobs, filters?.query ? 300 : 0);
        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    // Re-fetch when filters change
    }, [filters?.query, filters?.location, filters?.category, filters?.salaryRange,
        filters?.experience, filters?.remoteType, filters?.sort, filters?.page, dispatch]);
}

export default useGetAllJobs
