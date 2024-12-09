import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/MyOrder.css";
import { useNavigate } from "react-router-dom";

const MyOrder = () => {
    const navigate = useNavigate(); // useNavigate 훅 사용

    const [orders, setOrders] = useState({});
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
    const [orderStatus, setOrderStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1); // Current page state
    const [expandedOrders, setExpandedOrders] = useState(new Set()); // 토글 상태 관리

    const ordersPerPage = 6; // Number of orders per page

    // 리뷰 작성 가능 여부를 판단하는 함수
    const isReviewable = (orderTime) => {
        const orderDate = new Date(orderTime);
        const currentDate = new Date();
        const diffInTime = currentDate - orderDate; // 밀리초 차이
        const diffInDays = diffInTime / (1000 * 3600 * 24); // 날짜 차이로 변환
        return diffInDays <= 3; // 3일 이내면 true, 아니면 false
    };

    // 리뷰 작성 페이지로 이동하는 함수
    const handleWriteReview = (orderNumber, storeid) => {
        console.log("Navigating to WriteReview with:", orderNumber, storeid);
        navigate(`/pages/Mypage/WriteReview/${orderNumber}/${storeid}`); // 리뷰 작성 페이지로 이동
    };

    const toggleOrder = (orderNumber) => {
        setExpandedOrders((prev) => {
            const updated = new Set(prev);
            if (updated.has(orderNumber)) {
                updated.delete(orderNumber); // 토글 닫기
            } else {
                updated.add(orderNumber); // 토글 열기
            }
            return updated;
        });
    };

    const fetchOrders = async (endpoint, params = {}) => {
        try {
            const token = localStorage.getItem("token");
            setError(null);
            let url = `/ROOT/api/orderview/${endpoint}`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            const data = response.data;
            if (data.length && data[0].status === 404) {
                setOrders({});
                setError(data[0].message);
            } else {
                const groupedOrders = data.reduce((acc, order) => {
                    if (!acc[order.ordernumber]) {
                        acc[order.ordernumber] = {
                            ...order,
                            items: [],
                        };
                    }
                    acc[order.ordernumber].items.push(order);
                    return acc;
                }, {});
                setOrders(groupedOrders);
            }
        } catch (err) {
            setError("데이터를 불러오는 중 오류가 발생했습니다.");
            console.error(err);
        }
    };

    const fetchAllOrders = () => {
        fetchOrders("list");
    };

    const fetchOrdersByDate = () => {
        if (!dateRange.startDate || !dateRange.endDate) {
            setError("시작 날짜와 종료 날짜를 모두 입력해주세요.");
            return;
        }
        fetchOrders("date", dateRange);
    };

    const fetchOrdersByStatus = () => {
        if (!orderStatus) {
            setError("조회할 주문 상태를 선택해주세요.");
            return;
        }
        fetchOrders("status", { orderStatus });
    };

    useEffect(() => {
        if (filter === "all") {
            fetchAllOrders();
        } else if (filter === "date") {
            fetchOrdersByDate();
        } else if (filter === "status") {
            fetchOrdersByStatus();
        }
    }, [filter]);

    // Pagination logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = Object.keys(orders)
        .slice(indexOfFirstOrder, indexOfLastOrder)
        .reduce((acc, key) => {
            acc[key] = orders[key];
            return acc;
        }, {});

    const totalPages = Math.ceil(Object.keys(orders).length / ordersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const generatePageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    return (
        <div className="my-order-container">
            <h2>MY ORDERS</h2>

            <div className="filter-buttons">
                <button onClick={() => setFilter("all")}>전체 조회</button>
                <button onClick={() => setFilter("date")}>날짜별 조회</button>
                <button onClick={() => setFilter("status")}>상태별 조회</button>
            </div>

            {filter === "date" && (
                <div className="filter-form">
                    <label>
                        시작 날짜:
                        <input
                            type="date"
                            className="filter-date"
                            value={dateRange.startDate}
                            onChange={(e) =>
                                setDateRange((prev) => ({
                                    ...prev,
                                    startDate: e.target.value,
                                }))
                            }
                        />
                    </label>
                    <label>
                        종료 날짜:
                        <input
                            type="date"
                            className="filter-date"
                            value={dateRange.endDate}
                            onChange={(e) =>
                                setDateRange((prev) => ({
                                    ...prev,
                                    endDate: e.target.value,
                                }))
                            }
                        />
                    </label>
                    <button className="filter-date-button" onClick={fetchOrdersByDate}>
                        조회
                    </button>
                </div>
            )}

            {filter === "status" && (
                <div className="filter-form">
                    <label>
                        주문 상태:
                        <select
                            className="filter-option"
                            value={orderStatus}
                            onChange={(e) => setOrderStatus(e.target.value)}
                        >
                            <option value="">상태 선택</option>
                            <option value="주문 완료">주문 완료</option>
                            <option value="주문 취소">주문 취소</option>
                        </select>
                    </label>
                    <button className="filter-date-button" onClick={fetchOrdersByStatus}>
                        조회
                    </button>
                </div>
            )}

            {error && <p className="error-message">{error}</p>}

            <div className="order-grid">
                {Object.keys(currentOrders).length > 0 ? (
                    Object.keys(currentOrders).map((orderNumber) => {
                        const order = currentOrders[orderNumber];
                        const isExpanded = expandedOrders.has(orderNumber);

                        return (
                            <div key={orderNumber} className="order-card">
                                <div className="order-header">
                                    <h3>주문 번호: {orderNumber}</h3>
                                    <span>{new Date(order.ordertime).toLocaleString()}</span>
                                    <button onClick={() => toggleOrder(orderNumber)}>
                                        {isExpanded ? "간략히 보기" : "자세히 보기"}
                                    </button>
                                </div>
                                {isExpanded && (
                                    <div className="order-details">
                                        <p><strong>상점: {order.storename}</strong></p>
                                        <p><strong>총 가격: {order.totalprice} 원</strong></p>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item">
                                                <p>
                                                    {item.menuname} {item.quantity}개 -{" "}
                                                    {item.dailymenuprice}원
                                                </p>
                                            </div>
                                        ))}
                                        {order.orderstatus === "주문 완료" && isReviewable(order.ordertime) && (
                                            <button
                                                onClick={() =>
                                                    handleWriteReview(orderNumber, order.storeid)
                                                }
                                            >
                                                리뷰작성
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    !error && <p>주문 내역이 없습니다.</p>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    {generatePageNumbers().map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={currentPage === pageNum ? "active" : ""}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrder;