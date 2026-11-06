import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Table, Form, Button, Modal } from "react-bootstrap";
import Header from "./Header";
import instance from "../utils";

export const ListSubjects = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);

    useEffect(() => {
        // Kiểm tra đăng nhập
        const user = localStorage.getItem("user");
        if (!user) {
            navigate("/login");
            return;
        }

        // Tải danh sách môn học và câu hỏi để tính số lượng câu hỏi thực tế
        Promise.all([instance.get("/subjects"), instance.get("/questions")])
            .then(([subRes, qRes]) => {
                setSubjects(subRes.data);
                setQuestions(qRes.data);
            })
            .catch((err) => {
                console.error("Lỗi tải dữ liệu:", err);
            });
    }, [navigate]);

    // Tính số lượng câu hỏi theo subjectId từ mảng questions
    const getQuestionCount = (subjectId) => {
        return questions.filter((q) => q.subjectId === subjectId).length;
    };

    // Lọc theo Mã môn (id) hoặc Tên môn học (name)
    const filteredSubjects = subjects.filter((s) => {
        const term = searchTerm.toLowerCase();
        const codeMatch = s.id ? s.id.toLowerCase().includes(term) : false;
        const nameMatch = s.name ? s.name.toLowerCase().includes(term) : false;
        return codeMatch || nameMatch;
    });

    const handleOpenInfo = (subject) => {
        setSelectedSubject(subject);
        setShowInfoModal(true);
    };

    return (
        <Container className="py-4">
            <Header />

            <h3 className="mb-3">Danh sách môn học</h3>

            <div className="mb-3" style={{ maxWidth: "400px" }}>
                <Form.Control
                    type="text"
                    placeholder="Tìm kiếm môn học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Table striped bordered hover responsive>
                <thead className="table-light">
                    <tr>
                        <th>Mã môn</th>
                        <th>Tên môn học</th>
                        <th>Số lượng câu hỏi</th>
                        <th>Tools</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSubjects.length > 0 ? (
                        filteredSubjects.map((sub) => (
                            <tr key={sub.id}>
                                <td className="fw-semibold">{sub.id}</td>
                                <td>{sub.name}</td>
                                <td>{getQuestionCount(sub.id)}</td>
                                <td>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => navigate(`/questions/${sub.id}`)}
                                    >
                                        Truy cập bộ câu hỏi
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleOpenInfo(sub)}
                                    >
                                        Thông tin
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center text-muted">
                                Không tìm thấy môn học nào
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Modal Thông tin môn học */}
            <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Thông tin môn học</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedSubject && (
                        <div>
                            <p><strong>Mã môn:</strong> {selectedSubject.id}</p>
                            <p><strong>Tên môn học:</strong> {selectedSubject.name}</p>
                            <p><strong>Tổng số câu hỏi:</strong> {getQuestionCount(selectedSubject.id)}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowInfoModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ListSubjects;
