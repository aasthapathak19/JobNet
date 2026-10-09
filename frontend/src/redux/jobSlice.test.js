import { describe, expect, it } from "vitest";
import reducer, { addSavedJob, removeSavedJob, setAllJobs, setSavedJobs } from "./jobSlice";

const firstJob = { _id: "job-1", title: "Frontend Engineer" };
const secondJob = { _id: "job-2", title: "Backend Engineer" };

describe("job state", () => {
    it("stores server pagination together with the current result page", () => {
        const state = reducer(undefined, setAllJobs({
            jobs: [firstJob],
            pagination: { page: 2, total: 30, totalPages: 3 },
        }));
        expect(state.allJobs).toEqual([firstJob]);
        expect(state.pagination).toMatchObject({ page: 2, total: 30 });
    });

    it("hydrates persistent saved jobs from server objects", () => {
        const state = reducer(undefined, setSavedJobs([firstJob, secondJob]));
        expect(state.savedJobs).toEqual(["job-1", "job-2"]);
        expect(state.savedJobItems).toEqual([firstJob, secondJob]);
    });

    it("adds saved jobs idempotently and removes both representations", () => {
        let state = reducer(undefined, addSavedJob(firstJob));
        state = reducer(state, addSavedJob(firstJob));
        expect(state.savedJobs).toEqual(["job-1"]);
        state = reducer(state, removeSavedJob("job-1"));
        expect(state.savedJobs).toEqual([]);
        expect(state.savedJobItems).toEqual([]);
    });
});
