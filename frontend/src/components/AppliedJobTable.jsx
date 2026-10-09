import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'

const AppliedJobTable = () => {
    const {allAppliedJobs} = useSelector(store=>store.job);
    const statusClass = (status) => ({
        Rejected: 'bg-red-100 text-red-700',
        rejected: 'bg-red-100 text-red-700',
        Selected: 'bg-green-100 text-green-700',
        accepted: 'bg-green-100 text-green-700',
        Interview: 'bg-blue-100 text-blue-700',
        Shortlisted: 'bg-purple-100 text-purple-700',
    }[status] || 'bg-gray-100 text-gray-700');
    return (
        <div>
            <Table>
                <TableCaption>A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        allAppliedJobs.length <= 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">You have not applied to any jobs yet.</TableCell></TableRow> : allAppliedJobs.map((appliedJob) => (
                            <TableRow key={appliedJob._id}>
                                <TableCell>{appliedJob?.createdAt?.split("T")[0]}</TableCell>
                                <TableCell>{appliedJob.job?.title}</TableCell>
                                <TableCell>{appliedJob.job?.company?.name}</TableCell>
                                <TableCell className="text-right"><Badge className={statusClass(appliedJob.status)}>{appliedJob.status}</Badge></TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AppliedJobTable
