import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

export const Header = () => {
    const navigate = useNavigate();
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (!user) return null;

    return (
        <div className="d-flex justify-content-between align-items-center py-3 border-bottom mb-4">
            <div>
                Hello <span className="fw-semibold">{user.email}</span> ({user.role})
            </div>
            <Button variant="danger" size="sm" onClick={handleLogout}>
                Logout
            </Button>
        </div>
    );
};

export default Header;
