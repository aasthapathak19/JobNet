import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFilter, clearFilters, clearFilter } from '@/redux/jobSlice'
import {
    INDUSTRY_CATEGORIES, LOCATIONS, SALARY_RANGES, EXPERIENCE_LEVELS, REMOTE_TYPES,
    hasActiveFilters
} from '@/utils/searchUtils'
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

const FilterSection = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full text-left mb-2"
            >
                <span className="font-semibold text-sm text-gray-800">{title}</span>
                {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>
            {open && <div className="space-y-1">{children}</div>}
        </div>
    );
};

const FilterOption = ({ label, value, activeValue, onClick, color }) => {
    const isActive = activeValue === value;
    return (
        <button
            onClick={() => onClick(isActive ? "" : value)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center justify-between group ${isActive
                ? 'bg-[#6A38C2] text-white font-medium'
                : 'text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2]'
                }`}
        >
            <span>{label}</span>
            {isActive && <X className="h-3 w-3 opacity-70" />}
        </button>
    );
};

const FilterCard = () => {
    const dispatch = useDispatch();
    const { filters = {} } = useSelector(store => store.job);
    const [industrySearch, setIndustrySearch] = useState('');

    const isActive = hasActiveFilters(filters);

    const handleFilter = (key, value) => {
        dispatch(setFilter({ key, value }));
    };

    const handleClearAll = () => {
        dispatch(clearFilters());
        setIndustrySearch('');
    };

    // Filter industries by search
    const filteredCategories = INDUSTRY_CATEGORIES.map(group => ({
        ...group,
        roles: group.roles.filter(role =>
            role.toLowerCase().includes(industrySearch.toLowerCase())
        )
    })).filter(group => group.roles.length > 0);

    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-[#6A38C2]" />
                    <h2 className="font-bold text-gray-800 text-sm">Filters</h2>
                    {isActive && (
                        <Badge className="bg-[#6A38C2] text-white text-xs px-2 py-0.5 h-auto">
                            Active
                        </Badge>
                    )}
                </div>
                {isActive && (
                    <button
                        onClick={handleClearAll}
                        className="text-xs text-[#6A38C2] hover:text-[#5b30a6] font-medium transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Active filter pills */}
            {isActive && (
                <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap gap-2">
                    {filters.location && (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-[#6A38C2] text-xs px-2 py-1 rounded-full border border-purple-200">
                            📍 {filters.location}
                            <button onClick={() => dispatch(clearFilter('location'))} className="hover:opacity-70">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.category && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200">
                            💼 {filters.category}
                            <button onClick={() => dispatch(clearFilter('category'))} className="hover:opacity-70">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.salaryRange && (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full border border-green-200">
                            💰 {SALARY_RANGES.find(s => s.value === filters.salaryRange)?.label || filters.salaryRange}
                            <button onClick={() => dispatch(clearFilter('salaryRange'))} className="hover:opacity-70">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.experience && (
                        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full border border-orange-200">
                            🎓 {EXPERIENCE_LEVELS.find(e => e.value === filters.experience)?.label || `${filters.experience}+ yrs`}
                            <button onClick={() => dispatch(clearFilter('experience'))} className="hover:opacity-70">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.remoteType && (
                        <span className="inline-flex items-center gap-1 bg-cyan-50 text-cyan-700 text-xs px-2 py-1 rounded-full border border-cyan-200">
                            🏠 {filters.remoteType}
                            <button onClick={() => dispatch(clearFilter('remoteType'))} className="hover:opacity-70">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}

            {/* Filter sections */}
            <div className="px-4 py-4 max-h-[calc(100vh-220px)] overflow-y-auto">
                {/* Location */}
                <FilterSection title="📍 Location" defaultOpen={true}>
                    <div className="space-y-0.5">
                        {LOCATIONS.map(loc => (
                            <FilterOption
                                key={loc}
                                label={loc}
                                value={loc}
                                activeValue={filters.location}
                                onClick={(val) => handleFilter('location', val)}
                            />
                        ))}
                    </div>
                </FilterSection>

                {/* Industry / Role */}
                <FilterSection title="💼 Industry / Role" defaultOpen={true}>
                    {/* Search inside roles */}
                    <input
                        type="text"
                        value={industrySearch}
                        onChange={e => setIndustrySearch(e.target.value)}
                        placeholder="Search roles..."
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 mb-2 outline-none focus:border-[#6A38C2] focus:ring-1 focus:ring-[#6A38C2] transition"
                    />
                    <div className="space-y-3">
                        {filteredCategories.map(group => (
                            <div key={group.group}>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 px-1">
                                    {group.group}
                                </p>
                                <div className="space-y-0.5">
                                    {group.roles.map(role => (
                                        <FilterOption
                                            key={role}
                                            label={role}
                                            value={role}
                                            activeValue={filters.category}
                                            onClick={(val) => handleFilter('category', val)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </FilterSection>

                {/* Salary Range */}
                <FilterSection title="💰 Salary Range" defaultOpen={true}>
                    <div className="space-y-0.5">
                        {SALARY_RANGES.map(range => (
                            <FilterOption
                                key={range.value}
                                label={range.label}
                                value={range.value}
                                activeValue={filters.salaryRange}
                                onClick={(val) => handleFilter('salaryRange', val)}
                            />
                        ))}
                    </div>
                </FilterSection>

                {/* Experience */}
                <FilterSection title="🎓 Experience Level" defaultOpen={false}>
                    <div className="space-y-0.5">
                        {EXPERIENCE_LEVELS.map(exp => (
                            <FilterOption
                                key={exp.value}
                                label={exp.label}
                                value={exp.value}
                                activeValue={filters.experience}
                                onClick={(val) => handleFilter('experience', val)}
                            />
                        ))}
                    </div>
                </FilterSection>

                {/* Remote Type */}
                <FilterSection title="🏠 Work Mode" defaultOpen={false}>
                    <div className="space-y-0.5">
                        {REMOTE_TYPES.map(rt => (
                            <FilterOption
                                key={rt.value}
                                label={rt.label}
                                value={rt.value}
                                activeValue={filters.remoteType}
                                onClick={(val) => handleFilter('remoteType', val)}
                            />
                        ))}
                    </div>
                </FilterSection>
            </div>
        </div>
    );
}

export default FilterCard