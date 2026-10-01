import React from 'react'

const JobSkeleton = () => (
    <div className="p-5 rounded-xl border border-gray-100 bg-white animate-pulse">
        {/* Company header */}
        <div className="flex items-start gap-3 mb-3">
            <div className="h-10 w-10 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
        </div>
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-1" />
        <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
        {/* Badges */}
        <div className="flex gap-2 mb-3">
            <div className="h-5 bg-gray-100 rounded-full w-16" />
            <div className="h-5 bg-gray-100 rounded-full w-12" />
            <div className="h-5 bg-gray-100 rounded-full w-20" />
        </div>
        {/* Salary */}
        <div className="h-4 bg-gray-200 rounded w-28 mb-3" />
        {/* Skills */}
        <div className="flex gap-1.5 mb-3">
            <div className="h-5 bg-gray-100 rounded-full w-14" />
            <div className="h-5 bg-gray-100 rounded-full w-20" />
            <div className="h-5 bg-gray-100 rounded-full w-12" />
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="h-3 bg-gray-100 rounded w-16" />
            <div className="h-7 bg-gray-200 rounded w-20" />
        </div>
    </div>
);

export default JobSkeleton
