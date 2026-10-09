import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Archive, CirclePause, Edit2, Eye, MoreHorizontal, Play } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api, { getErrorMessage } from '@/lib/api'
import { setAllAdminJobs } from '@/redux/jobSlice'
import { Button } from '../ui/button'

const AdminJobsTable = () => {
    const { allAdminJobs, searchJobByText } = useSelector((store) => store.job);
    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const [archiveTarget, setArchiveTarget] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const query = searchJobByText.toLowerCase();
        setFilterJobs(allAdminJobs.filter((job) => !query || job?.title?.toLowerCase().includes(query) || job?.company?.name?.toLowerCase().includes(query)));
    }, [allAdminJobs, searchJobByText]);

    const changeStatus = async (job, status) => {
        try {
            const response = await api.put(`/job/${job._id}`, { status });
            dispatch(setAllAdminJobs(allAdminJobs.map((item) => item._id === job._id ? { ...item, status: response.data.job.status } : item)));
            toast.success(status === 'active' ? 'Job published' : 'Job closed');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Unable to update job'));
        }
    };

    const archiveJob = async () => {
        try {
            await api.delete(`/job/${archiveTarget._id}`);
            dispatch(setAllAdminJobs(allAdminJobs.filter((job) => job._id !== archiveTarget._id)));
            toast.success('Job archived');
            setArchiveTarget(null);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Unable to archive job'));
        }
    };

    return (
        <>
            <Table>
                <TableCaption>Your posted jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filterJobs.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No jobs found.</TableCell></TableRow>
                    ) : filterJobs.map((job) => (
                        <TableRow key={job._id}>
                            <TableCell>{job?.company?.name}</TableCell>
                            <TableCell>{job?.title}</TableCell>
                            <TableCell><span className="capitalize text-sm">{job?.status || 'active'}</span></TableCell>
                            <TableCell>{job?.createdAt?.split('T')[0]}</TableCell>
                            <TableCell className="text-right">
                                <Popover>
                                    <PopoverTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${job.title}`}><MoreHorizontal className="h-4 w-4" /></Button></PopoverTrigger>
                                    <PopoverContent className="w-44 p-2" align="end">
                                        <button onClick={() => navigate(`/admin/jobs/${job._id}/edit`)} className="flex w-full items-center gap-2 p-2 text-sm hover:bg-gray-50 rounded-sm"><Edit2 className="h-4 w-4" />Edit</button>
                                        <button onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)} className="flex w-full items-center gap-2 p-2 text-sm hover:bg-gray-50 rounded-sm"><Eye className="h-4 w-4" />Applicants</button>
                                        {(job.status || 'active') === 'active' ? (
                                            <button onClick={() => changeStatus(job, 'closed')} className="flex w-full items-center gap-2 p-2 text-sm hover:bg-gray-50 rounded-sm"><CirclePause className="h-4 w-4" />Close job</button>
                                        ) : (
                                            <button onClick={() => changeStatus(job, 'active')} className="flex w-full items-center gap-2 p-2 text-sm hover:bg-gray-50 rounded-sm"><Play className="h-4 w-4" />Publish job</button>
                                        )}
                                        <button onClick={() => setArchiveTarget(job)} className="flex w-full items-center gap-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded-sm"><Archive className="h-4 w-4" />Archive</button>
                                    </PopoverContent>
                                </Popover>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={Boolean(archiveTarget)} onOpenChange={(open) => !open && setArchiveTarget(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Archive this job?</DialogTitle></DialogHeader>
                    <p className="text-sm text-gray-600">{archiveTarget?.title} will disappear from candidate search and your active jobs list.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setArchiveTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={archiveJob}>Archive</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AdminJobsTable;
