import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import api, { getErrorMessage } from '@/lib/api'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Info } from 'lucide-react'
import { INDUSTRY_CATEGORIES } from '@/utils/searchUtils'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'

const PostJob = () => {
    useGetAllCompanies();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        salaryMin: "",
        salaryMax: "",
        location: "",
        jobType: "",
        remoteType: "On-site",
        experience: "",
        position: 0,
        companyId: "",
        category: "",
        skills: "",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { companies } = useSelector(store => store.company);

    useEffect(() => {
        if (!isEditing) return;
        api.get(`${JOB_API_END_POINT}/get/${id}`).then((response) => {
            const job = response.data.job;
            setInput({
                title: job.title || "",
                description: job.description || "",
                requirements: (job.requirements || []).join(", "),
                salary: job.salary ?? "",
                salaryMin: job.salaryMin ?? "",
                salaryMax: job.salaryMax ?? "",
                location: job.location || "",
                jobType: job.jobType || "",
                remoteType: job.remoteType || "On-site",
                experience: job.experienceLevel ?? "",
                position: job.position ?? 1,
                companyId: job.company?._id || "",
                category: job.category || "",
                skills: (job.skills || []).join(", "),
            });
        }).catch((error) => toast.error(getErrorMessage(error, "Unable to load job")));
    }, [id, isEditing]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (name, value) => {
        if (name === 'company') {
            const selectedCompany = companies.find(c => c.name.toLowerCase() === value);
            setInput({ ...input, companyId: selectedCompany._id });
        } else {
            setInput({ ...input, [name]: value });
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = isEditing
                ? await api.put(`${JOB_API_END_POINT}/${id}`, input)
                : await api.post(`${JOB_API_END_POINT}/post`, input);
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to post job"));
        } finally {
            setLoading(false);
        }
    }

    const FormField = ({ label, name, type = "text", placeholder = "", value }) => (
        <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">{label}</Label>
            <Input
                type={type}
                name={name}
                value={value}
                placeholder={placeholder}
                onChange={changeEventHandler}
                className="focus-visible:ring-[#6A38C2] focus-visible:ring-offset-0"
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className='max-w-3xl mx-auto px-4 py-8'>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{isEditing ? "Edit Job" : "Post a New Job"}</h1>
                    <p className="text-gray-500 text-sm mt-1">{isEditing ? "Keep the role details accurate and current" : "Fill in details to attract the right candidates"}</p>
                </div>

                <form onSubmit={submitHandler} className='bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6'>
                    {/* Basic info section */}
                    <div>
                        <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Basic Information</h2>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <FormField label="Job Title *" name="title" value={input.title} placeholder="e.g. Senior React Developer" />
                            
                            {/* Category dropdown */}
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-1 block">Industry / Category *</Label>
                                <Select value={input.category || undefined} onValueChange={(val) => selectChangeHandler('category', val)}>
                                    <SelectTrigger className="focus:ring-[#6A38C2]">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDUSTRY_CATEGORIES.map(group => (
                                            <SelectGroup key={group.group}>
                                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                    {group.group}
                                                </div>
                                                {group.roles.map(role => (
                                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <FormField label="Location *" name="location" value={input.location} placeholder="e.g. Bengaluru, Remote" />
                            
                            {/* Remote Type */}
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-1 block">Work Mode *</Label>
                                <Select value={input.remoteType} onValueChange={(val) => selectChangeHandler('remoteType', val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="On-site">🏢 On-site</SelectItem>
                                        <SelectItem value="Hybrid">🏠 Hybrid</SelectItem>
                                        <SelectItem value="Remote">🌐 Remote</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Job Type */}
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-1 block">Job Type *</Label>
                                <Select value={input.jobType || undefined} onValueChange={(val) => selectChangeHandler('jobType', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                        <SelectItem value="Contract">Contract</SelectItem>
                                        <SelectItem value="Internship">Internship</SelectItem>
                                        <SelectItem value="Freelance">Freelance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <FormField label="Experience Level (years) *" name="experience" type="number" value={input.experience} placeholder="0 for fresher" />
                            <FormField label="No. of Positions *" name="position" type="number" value={input.position} />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-1 block">Job Description *</Label>
                        <textarea
                            name="description"
                            value={input.description}
                            onChange={changeEventHandler}
                            rows={4}
                            placeholder="Describe the role, responsibilities, and what you're looking for..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6A38C2] focus:ring-1 focus:ring-[#6A38C2] resize-none"
                        />
                    </div>

                    {/* Requirements & Skills */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-1 block">Requirements *</Label>
                            <p className="text-xs text-gray-400 mb-1">Comma-separated (e.g. React, TypeScript, 3+ yrs)</p>
                            <Input
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                placeholder="Python, Machine Learning, PyTorch"
                                className="focus-visible:ring-[#6A38C2]"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-1 block">Skills (for matching)</Label>
                            <p className="text-xs text-gray-400 mb-1">Comma-separated skill tags</p>
                            <Input
                                name="skills"
                                value={input.skills}
                                onChange={changeEventHandler}
                                placeholder="React, Node.js, AWS, Docker"
                                className="focus-visible:ring-[#6A38C2]"
                            />
                        </div>
                    </div>

                    {/* Salary */}
                    <div>
                        <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Salary Information (in LPA)</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FormField label="Salary (LPA) *" name="salary" type="number" value={input.salary} placeholder="18" />
                            <FormField label="Min Salary (LPA)" name="salaryMin" type="number" value={input.salaryMin} placeholder="15" />
                            <FormField label="Max Salary (LPA)" name="salaryMax" type="number" value={input.salaryMax} placeholder="22" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Info className="h-3 w-3" /> Enter salary as a number (e.g. 18 for ₹18 LPA)
                        </p>
                    </div>

                    {/* Company */}
                    <div>
                        <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Company</h2>
                        {companies.length > 0 ? (
                            <Select value={companies.find((company) => company._id === input.companyId)?.name?.toLowerCase()} onValueChange={(val) => selectChangeHandler('company', val)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select your company" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {companies.map((company) => (
                                            <SelectItem key={company._id} value={company.name.toLowerCase()}>
                                                {company.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                                ⚠️ You need to register a company first before posting jobs.{' '}
                                <a href="/admin/companies/create" className="underline font-medium">Create a company →</a>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={loading || companies.length === 0}
                        className="w-full bg-[#6A38C2] hover:bg-[#5b30a6] h-11 text-base font-semibold"
                    >
                        {loading ? (
                            <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> {isEditing ? "Saving Changes..." : "Posting Job..."}</>
                        ) : (
                            isEditing ? "Save Changes" : "Post Job"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default PostJob
