import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import instance from "../utils";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await instance.get("/accounts");
            const accounts = res.data;

            const account = accounts.find(
                (acc) => acc.email.trim().toLowerCase() === email.trim().toLowerCase() && acc.password === password
            );

            if (!account) {
                setError("Email hoặc mật khẩu không chính xác");
                return;
            }

            if (account.status && account.status.toLowerCase() === "inactive") {
                setError("Tài khoản đã bị khóa");
                return;
            }

            // Lưu session vào localStorage
            localStorage.setItem("user", JSON.stringify(account));
            navigate("/subjects");
        } catch (err) {
            console.error("Login error:", err);
            setError("Không thể kết nối đến máy chủ API (port 9000). Vui lòng kiểm tra json-server!");
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <Card style={{ width: "400px" }} className="p-4 shadow-sm">
                <Card.Body>
                    <h2 className="text-center mb-4">Sign In</h2>
                    {error && (
                        <div className="text-danger mb-3 text-center fw-semibold">
                            {error}
                        </div>
                    )}
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Control
                                type="text"
                                placeholder="email of student or lecture"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formPassword">
                            <Form.Control
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100">
                            Login
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;
