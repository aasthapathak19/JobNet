import React, { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setFilters } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import { INDUSTRY_CATEGORIES } from '@/utils/searchUtils';

// Flatten all roles for autocomplete
const ALL_ROLES = INDUSTRY_CATEGORIES.flatMap(g => g.roles);

const POPULAR_SEARCHES = [
    "Frontend Developer", "Machine Learning Engineer", "DevOps Engineer",
    "Cybersecurity Engineer", "Data Scientist", "Full Stack Developer",
    "AI Engineer", "Product Manager", "Cloud Architect", "QA Engineer"
];

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Generate suggestions as user types
    useEffect(() => {
        if (query.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        const q = query.toLowerCase();
        const matched = ALL_ROLES.filter(role =>
            role.toLowerCase().includes(q)
        ).slice(0, 6);
        setSuggestions(matched);
        setShowSuggestions(matched.length > 0);
    }, [query]);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (!inputRef.current?.contains(e.target) && !suggestionsRef.current?.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const doSearch = (searchQuery) => {
        const q = searchQuery || query;
        dispatch(setFilters({ query: q }));
        navigate("/jobs");
        setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') doSearch();
    };

    const handleCategoryClick = (category) => {
        dispatch(setFilters({ category }));
        navigate("/jobs");
    };

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#f8f4ff] via-white to-[#f0f8ff] py-16 px-4">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-100 rounded-full translate-y-1/2 -translate-x-1/2 opacity-40" />
            
            <div className='text-center relative z-10 max-w-3xl mx-auto'>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-200 text-[#6A38C2] font-semibold text-sm shadow-sm mb-6">
                    <span className="w-2 h-2 rounded-full bg-[#6A38C2] animate-pulse" />
                    500+ Active Job Openings
                </div>

                {/* Headline */}
                <h1 className='text-5xl font-extrabold text-gray-900 leading-tight mb-4'>
                    Find Your{' '}
                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#6A38C2] to-[#9b59b6]'>
                        Dream Job
                    </span>
                    <br />
                    Start Your Journey Today
                </h1>
                <p className='text-gray-500 text-lg mb-8 max-w-xl mx-auto'>
                    Search from thousands of real opportunities at top tech companies across India.
                </p>

                {/* Search bar */}
                <div className="relative max-w-2xl mx-auto mb-8">
                    <div className='flex items-center bg-white shadow-lg border border-gray-200 rounded-2xl overflow-visible hover:border-[#6A38C2] transition-colors'>
                        <Search className='ml-4 h-5 w-5 text-gray-400 flex-shrink-0' />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder='Search by role, skill, or company...'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            className='flex-1 py-4 px-3 outline-none border-none bg-transparent text-gray-800 placeholder:text-gray-400'
                        />
                        <Button
                            onClick={() => doSearch()}
                            className="m-1.5 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#9b59b6] hover:from-[#5b30a6] hover:to-[#8e44ad] text-white px-6 py-5"
                        >
                            Search
                        </Button>
                    </div>

                    {/* Autocomplete suggestions */}
                    {showSuggestions && (
                        <div
                            ref={suggestionsRef}
                            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden"
                        >
                            {suggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setQuery(suggestion); doSearch(suggestion); }}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] flex items-center gap-2 transition-colors border-b border-gray-50 last:border-0"
                                >
                                    <Search className="h-3.5 w-3.5 text-gray-400" />
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Popular searches */}
                <div className="flex flex-wrap gap-2 justify-center">
                    <span className="text-sm text-gray-400 flex items-center">Popular:</span>
                    {POPULAR_SEARCHES.slice(0, 6).map((search) => (
                        <button
                            key={search}
                            onClick={() => handleCategoryClick(search)}
                            className="text-sm px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-[#6A38C2] hover:text-[#6A38C2] hover:bg-purple-50 transition-all duration-150 shadow-sm"
                        >
                            {search}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default HeroSection