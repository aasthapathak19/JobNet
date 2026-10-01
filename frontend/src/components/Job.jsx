import React from 'react'
import { Bookmark, BookmarkCheck, MapPin, Clock, Briefcase, Building2, Wifi, WifiOff, Users } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleSaveJob } from '@/redux/jobSlice'
import { formatSalary, timeAgo, getSkillMatch } from '@/utils/searchUtils'

const RemoteBadge = ({ remoteType }) => {
    const config = {
        "Remote": { label: "Remote", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        "Hybrid": { label: "Hybrid", className: "bg-blue-50 text-blue-700 border-blue-200" },
        "On-site": { label: "On-site", className: "bg-gray-100 text-gray-600 border-gray-200" },
    };
    const c = config[remoteType] || config["On-site"];
    return (
        <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${c.className}`}>
            {remoteType === "Remote" ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {c.label}
        </span>
    );
};

const Job = ({ job }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { savedJobs, allAppliedJobs } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    
    const isSaved = savedJobs?.includes(job?._id);
    const isApplied = allAppliedJobs?.some(app => app?.job?._id === job?._id || app?.job === job?._id);
    
    const userSkills = user?.profile?.skills || [];
    const skillMatch = job?.skills?.length > 0 ? getSkillMatch(userSkills, job.skills) : null;

    const handleSave = (e) => {
        e.stopPropagation();
        dispatch(toggleSaveJob(job?._id));
    };

    const handleClick = () => {
        navigate(`/description/${job?._id}`);
    };

    const salary = formatSalary(job?.salary, job?.salaryMin, job?.salaryMax);
    const posted = timeAgo(job?.createdAt);
    
    // Show max 4 skills
    const displaySkills = (job?.skills || []).slice(0, 4);

    return (
        <div
            onClick={handleClick}
            className="group relative p-5 rounded-xl border border-gray-100 bg-white hover:border-[#6A38C2] hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
            {/* Featured badge */}
            {job?.featured && (
                <div className="absolute top-3 right-3">
                    <span className="bg-amber-50 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                        ⭐ Featured
                    </span>
                </div>
            )}
            
            {/* Applied badge */}
            {isApplied && (
                <div className="absolute top-3 right-3">
                    <span className="bg-green-50 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-200">
                        ✓ Applied
                    </span>
                </div>
            )}

            {/* Company header */}
            <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-10 w-10 rounded-lg border border-gray-100 flex-shrink-0">
                    <AvatarImage src={job?.company?.logo} alt={job?.company?.name} className="object-contain p-0.5" />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 text-[#6A38C2] font-bold text-sm">
                        {job?.company?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{job?.company?.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500 truncate">{job?.location}</span>
                        {job?.remoteType && <RemoteBadge remoteType={job.remoteType} />}
                    </div>
                </div>
                {/* Save button */}
                <button
                    onClick={handleSave}
                    className={`p-1.5 rounded-lg transition-all duration-150 flex-shrink-0 ${isSaved
                        ? 'text-[#6A38C2] bg-purple-50'
                        : 'text-gray-400 hover:text-[#6A38C2] hover:bg-purple-50'
                        }`}
                    title={isSaved ? "Saved" : "Save job"}
                >
                    {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </button>
            </div>

            {/* Job title */}
            <div className="mb-3">
                <h2 className="font-bold text-gray-900 text-base leading-snug group-hover:text-[#6A38C2] transition-colors line-clamp-2">
                    {job?.title}
                </h2>
                {job?.category && (
                    <p className="text-xs text-gray-500 mt-0.5">{job?.category}</p>
                )}
            </div>

            {/* Key metadata */}
            <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 text-xs font-medium">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {job?.jobType}
                </Badge>
                {job?.experienceLevel !== undefined && (
                    <Badge variant="outline" className="text-gray-600 border-gray-200 text-xs font-medium">
                        {job.experienceLevel === 0 ? "Fresher" : `${job.experienceLevel}+ yrs`}
                    </Badge>
                )}
                {job?.position && (
                    <Badge variant="outline" className="text-gray-600 border-gray-200 text-xs font-medium">
                        <Users className="h-3 w-3 mr-1" />
                        {job.position} {job.position === 1 ? "opening" : "openings"}
                    </Badge>
                )}
            </div>

            {/* Salary */}
            <div className="mb-3">
                <span className="text-[#6A38C2] font-bold text-sm">{salary}</span>
            </div>

            {/* Skills */}
            {displaySkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {displaySkills.map((skill, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {skill}
                        </span>
                    ))}
                    {(job?.skills?.length || 0) > 4 && (
                        <span className="text-xs text-gray-400 px-1 py-0.5">
                            +{job.skills.length - 4} more
                        </span>
                    )}
                </div>
            )}

            {/* Skill match (shown only for logged-in students) */}
            {skillMatch && userSkills.length > 0 && user?.role === 'student' && (
                <div className="mb-3 bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 font-medium">Skill Match</span>
                        <span className={`text-xs font-bold ${skillMatch.score >= 70 ? 'text-green-600' : skillMatch.score >= 40 ? 'text-amber-600' : 'text-gray-500'}`}>
                            {skillMatch.score}%
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${skillMatch.score >= 70 ? 'bg-green-500' : skillMatch.score >= 40 ? 'bg-amber-400' : 'bg-gray-400'}`}
                            style={{ width: `${skillMatch.score}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{posted}</span>
                </div>
                <Button
                    onClick={(e) => { e.stopPropagation(); navigate(`/description/${job?._id}`); }}
                    size="sm"
                    className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white text-xs px-4 h-7"
                >
                    View Details
                </Button>
            </div>
        </div>
    )
}

export default Job