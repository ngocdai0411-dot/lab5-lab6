import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ContextProvider } from "./context/ContextProvider";
import Login from "./components/Login";
import ListSubjects from "./components/ListSubjects";
import QuestionManagement from "./components/QuestionManagement";

const App = () => {
    return (
        <ContextProvider>
            <BrowserRouter>
                <Routes>
                    {/* The root path (/) and any invalid paths (*) must automatically redirect to /login */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/subjects" element={<ListSubjects />} />
                    <Route path="/syllabus" element={<Navigate to="/subjects" replace />} />
                    <Route path="/questions/:id" element={<QuestionManagement />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </ContextProvider>
    );
};

export default App;
