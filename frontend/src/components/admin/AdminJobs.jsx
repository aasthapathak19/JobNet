import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button' 
import { useNavigate } from 'react-router-dom' 
import { useDispatch } from 'react-redux' 
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '@/redux/jobSlice'
import { Globe } from 'lucide-react'
import SyncJobsModal from './SyncJobsModal'

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [dispatch, input]);
  return (
    <div>
      <Navbar />
      <div className='max-w-6xl mx-auto my-10'>
        <div className='flex items-center justify-between my-5'>
          <Input
            className="w-fit"
            placeholder="Filter by name, role"
            onChange={(e) => setInput(e.target.value)}
          />
          <div className='flex items-center gap-3'>
            <Button
              onClick={() => setSyncModalOpen(true)}
              variant="outline"
              className="border-[#6A38C2] text-[#6A38C2] hover:bg-purple-50 font-medium"
            >
              <Globe className="w-4 h-4 mr-2" /> Sync Live Jobs (JSearch)
            </Button>
            <Button onClick={() => navigate("/admin/jobs/create")} className="bg-[#6A38C2] hover:bg-[#5b30a6]">
              New Jobs
            </Button>
          </div>
        </div>
        <AdminJobsTable />
      </div>
      <SyncJobsModal
        open={syncModalOpen}
        setOpen={setSyncModalOpen}
        onSyncSuccess={() => {
          setTimeout(() => window.location.reload(), 1200);
        }}
      />
    </div>
  )
}

export default AdminJobs
