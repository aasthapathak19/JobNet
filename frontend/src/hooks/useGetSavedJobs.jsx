import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { setSavedJobs } from "@/redux/jobSlice";

const useGetSavedJobs = () => {
    const dispatch = useDispatch();
    const user = useSelector((store) => store.auth.user);

    useEffect(() => {
        if (user?.role !== "student") {
            dispatch(setSavedJobs([]));
            return;
        }

        const controller = new AbortController();
        api.get("/job/saved", { signal: controller.signal })
            .then((response) => dispatch(setSavedJobs(response.data.jobs || [])))
            .catch((error) => {
                if (error.code !== "ERR_CANCELED") console.error("Failed to load saved jobs", error);
            });
        return () => controller.abort();
    }, [dispatch, user?._id, user?.role]);
};

export default useGetSavedJobs;
