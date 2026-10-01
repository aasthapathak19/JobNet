import React from 'react'
import { Badge } from './ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Wifi } from 'lucide-react'
import { formatSalary, timeAgo } from '@/utils/searchUtils'

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();
    const salary = formatSalary(job?.salary, job?.salaryMin, job?.salaryMax);
    const posted = timeAgo(job?.createdAt);
    const displaySkills = (job?.skills || []).slice(0, 3);

    return (
        <div
            onClick={() => navigate(`/description/${job._id}`)}
            className='p-5 rounded-xl shadow-sm border border-gray-100 bg-white cursor-pointer hover:border-[#6A38C2] hover:shadow-md transition-all duration-200 group'
        >
            {/* Company header */}
            <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-9 w-9 rounded-lg border border-gray-100 flex-shrink-0">
                    <AvatarImage src={job?.company?.logo} alt={job?.company?.name} className="object-contain p-0.5" />
                    <AvatarFallback className="rounded-lg bg-purple-100 text-[#6A38C2] font-bold text-xs">
                        {job?.company?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{job?.company?.name}</p>
                    <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500 truncate">{job?.location}</span>
                        {job?.remoteType === "Remote" && (
                            <span className="text-xs bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full border border-emerald-200">Remote</span>
                        )}
                    </div>
                </div>
                {job?.featured && (
                    <span className="ml-auto text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200 flex-shrink-0">⭐</span>
                )}
            </div>

            {/* Title */}
            <h2 className="font-bold text-gray-900 text-sm mb-2 group-hover:text-[#6A38C2] transition-colors line-clamp-2">
                {job?.title}
            </h2>

            {/* Meta badges */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge variant="ghost" className="text-blue-700 bg-blue-50 border-blue-100 text-xs px-2 py-0.5 h-auto">
                    {job?.jobType}
                </Badge>
                <Badge variant="ghost" className="text-[#6A38C2] bg-purple-50 border-purple-100 text-xs px-2 py-0.5 h-auto font-bold">
                    {salary}
                </Badge>
                {job?.experienceLevel === 0 && (
                    <Badge variant="ghost" className="text-green-700 bg-green-50 border-green-100 text-xs px-2 py-0.5 h-auto">
                        Fresher
                    </Badge>
                )}
            </div>

            {/* Skills */}
            {displaySkills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {displaySkills.map((skill, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {skill}
                        </span>
                    ))}
                </div>
            )}

            {/* Time */}
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto">
                <Clock className="h-3 w-3" />
                {posted}
            </div>
        </div>
    )
}

export default LatestJobCards