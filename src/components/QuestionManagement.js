import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Table, Button, Modal, Form, Row, Col } from "react-bootstrap";
import Header from "./Header";
import instance from "../utils";

export const QuestionManagement = () => {
    const { id } = useParams(); // subjectId, e.g. "CSD201"
    const navigate = useNavigate();

    const [subject, setSubject] = useState(null);
    const [questions, setQuestions] = useState([]);

    // Modal state (Add / Edit)
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [content, setContent] = useState("");
    const [opt1, setOpt1] = useState("");
    const [opt2, setOpt2] = useState("");
    const [opt3, setOpt3] = useState("");
    const [opt4, setOpt4] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        // Kiểm tra đăng nhập
        const user = localStorage.getItem("user");
        if (!user) {
            navigate("/login");
            return;
        }

        fetchData();
    }, [id, navigate]);

    const fetchData = async () => {
        try {
            // Lấy thông tin môn học
            const subRes = await instance.get(`/subjects/${id}`);
            setSubject(subRes.data);
        } catch (err) {
            // Nếu endpoint /subjects/:id không tìm thấy, lấy toàn bộ subjects và tìm
            try {
                const allSubs = await instance.get("/subjects");
                const found = allSubs.data.find((s) => s.id === id);
                setSubject(found || { id, name: id });
            } catch (e) {
                setSubject({ id, name: id });
            }
        }

        try {
            // Lấy danh sách câu hỏi của môn học này
            const qRes = await instance.get(`/questions?subjectId=${id}`);
            setQuestions(qRes.data);
        } catch (err) {
            console.error("Lỗi tải câu hỏi:", err);
        }
    };

    // Mở modal thêm câu hỏi
    const handleOpenAddModal = () => {
        setEditingQuestion(null);
        setContent("");
        setOpt1("");
        setOpt2("");
        setOpt3("");
        setOpt4("");
        setCorrectAnswer("");
        setFormError("");
        setShowModal(true);
    };

    // Mở modal sửa câu hỏi
    const handleOpenEditModal = (q) => {
        setEditingQuestion(q);
        setContent(q.content || "");

        // Chuẩn hóa options
        let opts = [];
        if (Array.isArray(q.options)) {
            if (q.options.length === 1 && typeof q.options[0] === "string" && (q.options[0].includes(";") || q.options[0].includes(","))) {
                const separator = q.options[0].includes(";") ? ";" : ",";
                opts = q.options[0].split(separator).map((item) => item.trim());
            } else {
                opts = q.options;
            }
        }

        setOpt1(opts[0] || "");
        setOpt2(opts[1] || "");
        setOpt3(opts[2] || "");
        setOpt4(opts[3] || "");
        setCorrectAnswer(q.correctAnswer || "");
        setFormError("");
        setShowModal(true);
    };

    // Xử lý Xóa câu hỏi
    const handleDelete = async (questionId) => {
        const confirmed = window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?");
        if (!confirmed) return;

        try {
            await instance.delete(`/questions/${questionId}`);
            setQuestions((prev) => prev.filter((item) => item.id !== questionId));
        } catch (err) {
            console.error("Lỗi khi xóa câu hỏi:", err);
            alert("Không thể xóa câu hỏi. Vui lòng thử lại!");
        }
    };

    // Lưu câu hỏi (Thêm mới hoặc Cập nhật)
    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        setFormError("");

        const optionsArray = [opt1.trim(), opt2.trim(), opt3.trim(), opt4.trim()].filter(Boolean);

        if (!content.trim()) {
            setFormError("Vui lòng nhập nội dung câu hỏi!");
            return;
        }

        if (optionsArray.length < 2) {
            setFormError("Vui lòng nhập ít nhất 2 đáp án lựa chọn!");
            return;
        }

        if (!correctAnswer.trim()) {
            setFormError("Vui lòng nhập hoặc chọn đáp án đúng!");
            return;
        }

        const payload = {
            subjectId: id,
            content: content.trim(),
            options: optionsArray,
            correctAnswer: correctAnswer.trim(),
        };

        try {
            if (editingQuestion) {
                // Sửa câu hỏi
                const res = await instance.put(`/questions/${editingQuestion.id}`, {
                    ...editingQuestion,
                    ...payload,
                });
                setQuestions((prev) =>
                    prev.map((item) => (item.id === editingQuestion.id ? res.data : item))
                );
            } else {
                // Thêm câu hỏi mới
                const res = await instance.post("/questions", payload);
                setQuestions((prev) => [...prev, res.data]);
            }
            setShowModal(false);
        } catch (err) {
            console.error("Lỗi khi lưu câu hỏi:", err);
            setFormError("Không thể lưu câu hỏi. Vui lòng kiểm tra kết nối json-server!");
        }
    };

    // Format hiển thị các đáp án
    const renderOptions = (options) => {
        if (!options) return "";
        if (Array.isArray(options)) {
            return options.join(", ");
        }
        return String(options);
    };

    return (
        <Container className="py-4">
            <Header />

            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <p className="text-muted mb-0">
                        Tổng số câu hỏi: <strong>{questions.length}</strong>
                    </p>
                </div>
                <div>
                    <Button variant="success" className="me-2" onClick={handleOpenAddModal}>
                        + Thêm câu hỏi mới
                    </Button>
                    <Button variant="secondary" onClick={() => navigate("/subjects")}>
                        Quay lại danh sách môn
                    </Button>
                </div>
            </div>

            <Table striped bordered hover responsive>
                <thead className="table-dark">
                    <tr>
                        <th style={{ width: "50px" }}>#</th>
                        <th>Nội dung câu hỏi</th>
                        <th>Các đáp án</th>
                        <th>Đáp án đúng</th>
                        <th style={{ width: "160px" }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {questions.length > 0 ? (
                        questions.map((q, index) => (
                            <tr key={q.id}>
                                <td>{index + 1}</td>
                                <td>{q.content}</td>
                                <td>{renderOptions(q.options)}</td>
                                <td style={{ color: "green", fontWeight: "bold" }}>
                                    {q.correctAnswer}
                                </td>
                                <td>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        className="me-2 text-dark"
                                        onClick={() => handleOpenEditModal(q)}
                                    >
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(q.id)}
                                    >
                                        Xóa
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center text-muted">
                                Chưa có câu hỏi nào cho môn học này
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Modal Thêm / Sửa câu hỏi */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSaveQuestion}>
                    <Modal.Body>
                        {formError && <div className="alert alert-danger py-2">{formError}</div>}

                        <Form.Group className="mb-3">
                            <Form.Label><strong>Nội dung câu hỏi</strong></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Nhập nội dung câu hỏi..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <div className="mb-3">
                            <Form.Label><strong>Các đáp án lựa chọn</strong></Form.Label>
                            <Row className="g-2">
                                <Col md={6}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Đáp án 1"
                                        value={opt1}
                                        onChange={(e) => setOpt1(e.target.value)}
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Đáp án 2"
                                        value={opt2}
                                        onChange={(e) => setOpt2(e.target.value)}
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Đáp án 3"
                                        value={opt3}
                                        onChange={(e) => setOpt3(e.target.value)}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Đáp án 4"
                                        value={opt4}
                                        onChange={(e) => setOpt4(e.target.value)}
                                    />
                                </Col>
                            </Row>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label><strong>Đáp án đúng</strong></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập chính xác đáp án đúng..."
                                value={correctAnswer}
                                onChange={(e) => setCorrectAnswer(e.target.value)}
                                required
                            />
                            {/* Gợi ý chọn nhanh nếu đã điền các đáp án */}
                            <div className="mt-2 d-flex gap-2 flex-wrap">
                                {[opt1, opt2, opt3, opt4].filter(Boolean).map((opt, i) => (
                                    <Button
                                        key={i}
                                        variant={correctAnswer === opt ? "success" : "outline-secondary"}
                                        size="sm"
                                        type="button"
                                        onClick={() => setCorrectAnswer(opt)}
                                    >
                                        {opt}
                                    </Button>
                                ))}
                            </div>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingQuestion ? "Lưu thay đổi" : "Thêm mới"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default QuestionManagement;
