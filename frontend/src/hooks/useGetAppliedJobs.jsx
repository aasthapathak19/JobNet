import { setAllAppliedJobs } from "@/redux/jobSlice";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import api from "@/lib/api"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

const useGetAppliedJobs = () => {
    const dispatch = useDispatch();
    const user = useSelector((store) => store.auth.user);

    useEffect(()=>{
        if (user?.role !== "student") {
            dispatch(setAllAppliedJobs([]));
            return;
        }
        const fetchAppliedJobs = async () => {
            try {
                const res = await api.get(`${APPLICATION_API_END_POINT}/get`);
                if(res.data.success){
                    dispatch(setAllAppliedJobs(res.data.application));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAppliedJobs();
    },[dispatch, user?._id, user?.role])
};
export default useGetAppliedJobs;
