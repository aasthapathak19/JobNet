import { createSlice } from "@reduxjs/toolkit";

const initialFilters = {
    query: "",
    location: "",
    category: "",
    salaryRange: "", // e.g. "8-12", "12-20", "20+"
    experience: "",
    remoteType: "",
    sort: "recent",
};

const jobSlice = createSlice({
    name: "job",
    initialState: {
        allJobs: [],
        allAdminJobs: [],
        singleJob: null,
        searchJobByText: "",
        allAppliedJobs: [],
        // Legacy single string for backwards compat
        searchedQuery: "",
        // Structured multi-filter state
        filters: { ...initialFilters },
        savedJobs: [], // array of job IDs
        isLoading: false,
    },
    reducers: {
        // actions
        setAllJobs: (state, action) => {
            state.allJobs = action.payload;
        },
        setSingleJob: (state, action) => {
            state.singleJob = action.payload;
        },
        setAllAdminJobs: (state, action) => {
            state.allAdminJobs = action.payload;
        },
        setSearchJobByText: (state, action) => {
            state.searchJobByText = action.payload;
        },
        setAllAppliedJobs: (state, action) => {
            state.allAppliedJobs = action.payload;
        },
        // Legacy - keep for Browse.jsx compatibility
        setSearchedQuery: (state, action) => {
            state.searchedQuery = action.payload;
            // Sync to structured filters
            state.filters.query = action.payload;
        },
        // Structured filter actions
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            // Keep legacy searchedQuery in sync
            if (action.payload.query !== undefined) {
                state.searchedQuery = action.payload.query;
            }
        },
        setFilter: (state, action) => {
            const { key, value } = action.payload;
            state.filters[key] = value;
            if (key === "query") {
                state.searchedQuery = value;
            }
        },
        clearFilters: (state) => {
            state.filters = { ...initialFilters };
            state.searchedQuery = "";
        },
        clearFilter: (state, action) => {
            const key = action.payload;
            state.filters[key] = initialFilters[key];
            if (key === "query") {
                state.searchedQuery = "";
            }
        },
        toggleSaveJob: (state, action) => {
            const jobId = action.payload;
            const idx = state.savedJobs.indexOf(jobId);
            if (idx > -1) {
                state.savedJobs.splice(idx, 1);
            } else {
                state.savedJobs.push(jobId);
            }
        },
        setJobsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
    }
});

export const {
    setAllJobs,
    setSingleJob,
    setAllAdminJobs,
    setSearchJobByText,
    setAllAppliedJobs,
    setSearchedQuery,
    setFilters,
    setFilter,
    clearFilters,
    clearFilter,
    toggleSaveJob,
    setJobsLoading,
} = jobSlice.actions;

export default jobSlice.reducer;