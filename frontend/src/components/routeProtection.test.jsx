import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import RequireAuth from "./RequireAuth";
import ProtectedRoute from "./admin/ProtectedRoute";

const renderRoute = (user, element, initialPath, redirectPath) => {
    const store = configureStore({ reducer: { auth: () => ({ user }) } });
    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[initialPath]}>
                <Routes>
                    <Route path={initialPath} element={element} />
                    <Route path={redirectPath} element={<div>Redirect target</div>} />
                </Routes>
            </MemoryRouter>
        </Provider>,
    );
};

describe("route protection", () => {
    it("redirects anonymous users away from authenticated pages", () => {
        renderRoute(null, <RequireAuth><div>Private page</div></RequireAuth>, "/profile", "/login");
        expect(screen.getByText("Redirect target")).toBeInTheDocument();
        expect(screen.queryByText("Private page")).not.toBeInTheDocument();
    });

    it("redirects students away from recruiter pages", () => {
        renderRoute({ role: "student" }, <ProtectedRoute><div>Recruiter page</div></ProtectedRoute>, "/admin/jobs", "/");
        expect(screen.getByText("Redirect target")).toBeInTheDocument();
    });

    it("renders recruiter pages for recruiters", () => {
        renderRoute({ role: "recruiter" }, <ProtectedRoute><div>Recruiter page</div></ProtectedRoute>, "/admin/jobs", "/");
        expect(screen.getByText("Recruiter page")).toBeInTheDocument();
    });
});
