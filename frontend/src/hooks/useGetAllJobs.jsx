import { setAllJobs, setJobsLoading } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const { filters = {} } = useSelector(store => store.job);

    useEffect(() => {
        const fetchAllJobs = async () => {
            dispatch(setJobsLoading(true));
            try {
                // Build query params from structured filters
                const params = new URLSearchParams();
                if (filters?.query) params.set('keyword', filters.query);
                if (filters?.location) params.set('location', filters.location);
                if (filters?.category) params.set('category', filters.category);
                if (filters?.sort) params.set('sort', filters.sort);

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
                const res = await axios.get(url, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                }
            } catch (error) {
                console.error('Failed to fetch jobs:', error);
            } finally {
                dispatch(setJobsLoading(false));
            }
        }
        fetchAllJobs();
    // Re-fetch when filters change
    }, [filters?.query, filters?.location, filters?.category, filters?.salaryRange,
        filters?.experience, filters?.remoteType, filters?.sort]);
}

export default useGetAllJobs