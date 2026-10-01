import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import Navbar from './shared/Navbar';
import { toggleSaveJob } from '@/redux/jobSlice';
import {
    MapPin, Building2, Briefcase, Clock, DollarSign,
    BookmarkCheck, Bookmark, Share2, ArrowLeft, Users,
    CheckCircle2, XCircle, Wifi, WifiOff, Calendar, Star
} from 'lucide-react';
import { formatSalary, timeAgo, getSkillMatch } from '@/utils/searchUtils';

const RemoteTag = ({ remoteType }) => {
    const config = {
        "Remote": { label: "🌐 Remote", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        "Hybrid": { label: "🏠 Hybrid", className: "bg-blue-50 text-blue-700 border-blue-200" },
        "On-site": { label: "🏢 On-site", className: "bg-gray-100 text-gray-600 border-gray-200" },
    };
    const c = config[remoteType] || config["On-site"];
    return (
        <span className={`inline-flex items-center text-sm px-3 py-1 rounded-full border font-medium ${c.className}`}>
            {c.label}
        </span>
    );
};

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const { savedJobs } = useSelector(store => store.job);
    const isInitiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isInitiallyApplied);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isSaved = savedJobs?.includes(jobId);
    const userSkills = user?.profile?.skills || [];
    const skillMatch = singleJob?.skills?.length > 0 ? getSkillMatch(userSkills, singleJob.skills) : null;

    const applyJobHandler = async () => {
        if (!user) {
            toast.error("Please login to apply");
            navigate("/login");
            return;
        }
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to apply");
        }
    }

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    if (!singleJob) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-5xl mx-auto px-4 py-10">
                    {/* Loading skeleton */}
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-2/3" />
                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                        <div className="h-32 bg-gray-100 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    const salary = formatSalary(singleJob?.salary, singleJob?.salaryMin, singleJob?.salaryMax);
    const posted = timeAgo(singleJob?.createdAt);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className='max-w-5xl mx-auto px-4 py-6'>
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to jobs
                </button>

                {/* Job header card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                    <div className="flex items-start gap-5">
                        {/* Company logo */}
                        <div className="h-16 w-16 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {singleJob?.company?.logo ? (
                                <img src={singleJob.company.logo} alt={singleJob.company.name} className="h-full w-full object-contain p-1" />
                            ) : (
                                <span className="text-2xl font-bold text-[#6A38C2]">
                                    {singleJob?.company?.name?.charAt(0) || "?"}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{singleJob?.title}</h1>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <a
                                            href={singleJob?.company?.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#6A38C2] font-semibold hover:underline text-sm"
                                        >
                                            {singleJob?.company?.name}
                                        </a>
                                        <span className="text-gray-300">•</span>
                                        <span className="flex items-center gap-1 text-sm text-gray-500">
                                            <MapPin className="h-3.5 w-3.5" /> {singleJob?.location}
                                        </span>
                                        {singleJob?.remoteType && <RemoteTag remoteType={singleJob.remoteType} />}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => dispatch(toggleSaveJob(jobId))}
                                        className={`p-2 rounded-lg border transition-all ${isSaved ? 'border-[#6A38C2] text-[#6A38C2] bg-purple-50' : 'border-gray-200 text-gray-500 hover:border-[#6A38C2] hover:text-[#6A38C2]'}`}
                                        title={isSaved ? "Saved" : "Save job"}
                                    >
                                        {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                                    </button>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 transition-all"
                                        title="Share"
                                    >
                                        <Share2 className="h-4 w-4" />
                                    </button>
                                    <Button
                                        onClick={isApplied ? null : applyJobHandler}
                                        disabled={isApplied}
                                        className={`px-6 ${isApplied ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#6A38C2] hover:bg-[#5b30a6]'}`}
                                    >
                                        {isApplied ? '✓ Applied' : 'Apply Now'}
                                    </Button>
                                </div>
                            </div>

                            {/* Key stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-400 mb-0.5">Salary</p>
                                    <p className="font-bold text-[#6A38C2] text-sm">{salary}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-400 mb-0.5">Experience</p>
                                    <p className="font-bold text-gray-800 text-sm">
                                        {singleJob?.experienceLevel === 0 ? "Fresher" : `${singleJob?.experienceLevel}+ yrs`}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-400 mb-0.5">Job Type</p>
                                    <p className="font-bold text-gray-800 text-sm">{singleJob?.jobType}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-400 mb-0.5">Openings</p>
                                    <p className="font-bold text-gray-800 text-sm">{singleJob?.position} position{singleJob?.position !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posted date & applicants */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Posted {posted}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {singleJob?.applications?.length || 0} applicant{singleJob?.applications?.length !== 1 ? 's' : ''}
                        </span>
                        {singleJob?.featured && (
                            <span className="flex items-center gap-1 text-amber-600 font-medium">
                                <Star className="h-3.5 w-3.5" />
                                Featured
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-3">Job Description</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{singleJob?.description}</p>
                        </div>

                        {/* Requirements */}
                        {singleJob?.requirements?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-3">Requirements</h2>
                                <ul className="space-y-2">
                                    {singleJob.requirements.map((req, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Skills required */}
                        {singleJob?.skills?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-3">Skills Required</h2>
                                <div className="flex flex-wrap gap-2">
                                    {singleJob.skills.map((skill, idx) => (
                                        <span key={idx} className="bg-purple-50 text-[#6A38C2] border border-purple-200 text-sm px-3 py-1 rounded-full font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Skill match (for logged-in students) */}
                        {skillMatch && user?.role === 'student' && userSkills.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                                <h3 className="font-bold text-gray-900 mb-3 text-sm">Your Skill Match</h3>

                                {/* Score ring */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`text-2xl font-extrabold ${skillMatch.score >= 70 ? 'text-green-600' : skillMatch.score >= 40 ? 'text-amber-500' : 'text-gray-500'}`}>
                                        {skillMatch.score}%
                                    </div>
                                    <div className="flex-1">
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${skillMatch.score >= 70 ? 'bg-green-500' : skillMatch.score >= 40 ? 'bg-amber-400' : 'bg-gray-400'}`}
                                                style={{ width: `${skillMatch.score}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {skillMatch.score >= 70 ? 'Strong match' : skillMatch.score >= 40 ? 'Partial match' : 'Low match'}
                                        </p>
                                    </div>
                                </div>

                                {skillMatch.matched.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-green-600 mb-1.5">✓ You have</p>
                                        <div className="flex flex-wrap gap-1">
                                            {skillMatch.matched.map((s, i) => (
                                                <span key={i} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {skillMatch.missing.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 mb-1.5">• You may need</p>
                                        <div className="flex flex-wrap gap-1">
                                            {skillMatch.missing.map((s, i) => (
                                                <span key={i} className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Company info */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <h3 className="font-bold text-gray-900 mb-3 text-sm">About the Company</h3>
                            {singleJob?.company?.logo && (
                                <img src={singleJob.company.logo} alt={singleJob.company.name} className="h-10 object-contain mb-3" />
                            )}
                            <p className="font-semibold text-gray-800 text-sm mb-1">{singleJob?.company?.name}</p>
                            {singleJob?.company?.description && (
                                <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-4">{singleJob.company.description}</p>
                            )}
                            {singleJob?.company?.website && (
                                <a
                                    href={singleJob.company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#6A38C2] hover:underline"
                                >
                                    Visit website →
                                </a>
                            )}
                        </div>

                        {/* Apply CTA */}
                        <div className="bg-gradient-to-br from-[#6A38C2] to-[#9b59b6] rounded-2xl p-5 text-white text-center">
                            <h3 className="font-bold mb-1">Interested in this role?</h3>
                            <p className="text-purple-200 text-xs mb-3">
                                {singleJob?.applications?.length || 0} people have already applied
                            </p>
                            <Button
                                onClick={isApplied ? null : applyJobHandler}
                                disabled={isApplied}
                                className={`w-full ${isApplied ? 'bg-white/30 text-white cursor-not-allowed' : 'bg-white text-[#6A38C2] hover:bg-purple-50 font-bold'}`}
                            >
                                {isApplied ? '✓ Already Applied' : 'Apply Now'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobDescription