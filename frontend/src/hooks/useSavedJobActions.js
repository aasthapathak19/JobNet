import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api, { getErrorMessage } from "@/lib/api";
import { addSavedJob, removeSavedJob } from "@/redux/jobSlice";

const useSavedJobActions = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((store) => store.auth.user);
    const savedJobs = useSelector((store) => store.job.savedJobs || []);

    const isSaved = (jobId) => savedJobs.includes(jobId);

    const toggleSaved = async (job) => {
        if (!user) {
            toast.error("Please log in to save jobs");
            navigate("/login");
            return;
        }
        if (user.role !== "student") {
            toast.error("Saved jobs are available to candidates");
            return;
        }

        try {
            if (isSaved(job._id)) {
                await api.delete(`/job/${job._id}/save`);
                dispatch(removeSavedJob(job._id));
                toast.success("Removed from saved jobs");
            } else {
                await api.post(`/job/${job._id}/save`);
                dispatch(addSavedJob(job));
                toast.success("Job saved");
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Unable to update saved jobs"));
        }
    };

    return { isSaved, toggleSaved };
};

export default useSavedJobActions;
