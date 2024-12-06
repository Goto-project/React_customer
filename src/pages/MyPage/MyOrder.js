import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/MyOrder.css";

const MyOrder = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
    const [orderStatus, setOrderStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1); // Current page state
    const ordersPerPage = 6; // Number of orders per page

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
                setOrders([]);
                setError(data[0].message);
            } else {
                const sortedData = data.sort(
                    (a, b) => new Date(b.ordertime) - new Date(a.ordertime)
                );
                setOrders(sortedData);
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
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

    const totalPages = Math.ceil(orders.length / ordersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Pagination group logic (show 5 pages at once)
    const handleNextGroup = () => {
        if (currentPage + 5 <= totalPages) {
            setCurrentPage(currentPage + 5);
        } else {
            setCurrentPage(totalPages);
        }
    };

    const handlePrevGroup = () => {
        if (currentPage - 5 > 0) {
            setCurrentPage(currentPage - 5);
        } else {
            setCurrentPage(1);
        }
    };

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
        const pageNumbers = [];
        const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1; // Always start at 1, 6, 11, ...
        const endPage = Math.min(startPage + 4, totalPages); // Show up to 5 pages

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    // const isToday = (orderTime) => {
    //     const today = new Date();
    //     const todayStr = today.toISOString().split('T')[0]; // 오늘 날짜를 'yyyy-MM-dd' 형식으로 변환
    //     const orderDate = orderTime.split('T')[0]; // orderTime에서 'T' 기준으로 날짜만 추출
    //     return orderDate === todayStr; // orderTime과 오늘 날짜를 비교
    // };

    // const isCancelable = (endpickup, pickupstatus) => {
    //     const currentTime = new Date();
    //     const [endHours, endMinutes] = endpickup.split(":").map(Number); // endpickup을 시간과 분으로 분리
    //     const endPickupTime = new Date();
    //     endPickupTime.setHours(endHours, endMinutes, 0, 0); // 현재 날짜에 시간을 설정
    //     return pickupstatus === 0 && endPickupTime > currentTime; // pickupstatus가 0이고, endpickup 시간이 현재 시간보다 이후일 때
    // };

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
                                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
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
                                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                            }
                        />
                    </label>
                    <button className="filter-date-button" onClick={fetchOrdersByDate}>조회</button>
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
                    <button className="filter-date-button" onClick={fetchOrdersByStatus}>조회</button>
                </div>
            )}

            {error && <p className="error-message">{error}</p>}

            <div className="order-grid">
                {currentOrders.length > 0 ? (
                    currentOrders.map((order, index) => (
                        <div key={index} className="order-card">
                            <div className="order-header">
                                <h3>주문 번호: {order.ordernumber}</h3>
                                <span>{new Date(order.ordertime).toLocaleString()}</span>
                            </div>
                            <div className="order-details">
                                <p><strong>{order.storename}</strong></p>
                                <p><strong>{order.menuname} {order.quantity} 개 </strong> </p>
                                <p><strong>{order.totalprice} 원 </strong> </p>
                            </div>
                            <div className="order-status">
                                {order.orderstatus === '주문 완료' && '주문 완료'}
                                {order.orderstatus === '주문 취소' && '주문 취소'}
                            </div>
                            {/* <div> */}
                            {/* "주문 취소" 버튼 표시 */}
                            {/* {order.orderstatus === '주문 완료' && isToday(order.ordertime) && isCancelable(order.endpickup, order.pickupstatus) && (
                                    <button className="cancel-order-btn">주문 취소</button>
                                )} */}
                            {/* </div> */}
                        </div>
                    ))
                ) : (
                    !error && <p>주문 내역이 없습니다.</p>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={handlePrevGroup}>&lt;&lt;</button>
                    {generatePageNumbers().map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={currentPage === pageNum ? "active" : ""}
                        >
                            {pageNum}
                        </button>
                    ))}
                    <button onClick={handleNextGroup}>&gt;&gt;</button>
                </div>
            )}
        </div>
    );
};

export default MyOrder;
