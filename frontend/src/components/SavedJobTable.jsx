import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const SavedJobTable = () => {
    const { savedJobItems = [] } = useSelector(store => store.job);
    const navigate = useNavigate();

    return (
        <div>
            <Table>
                <TableCaption>A list of your saved jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        savedJobItems.length <= 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">You have not saved any jobs yet.</TableCell></TableRow> : savedJobItems.map((job) => (
                            <TableRow key={job._id}>
                                <TableCell>{job?.company?.name}</TableCell>
                                <TableCell>{job?.title}</TableCell>
                                <TableCell>{job?.location}</TableCell>
                                <TableCell className="text-right">
                                    <Badge 
                                        className="cursor-pointer bg-[#6A38C2] hover:bg-[#5b30a6]"
                                        onClick={() => navigate(`/description/${job._id}`)}
                                    >
                                        View Details
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default SavedJobTable
