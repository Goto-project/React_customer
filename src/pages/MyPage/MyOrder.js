import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyOrder = () => {
    const navigate = useNavigate(); // useNavigate 훅 사용
    const [orders, setOrders] = useState([]); // 주문 목록
    const [error, setError] = useState(null); // 에러 메시지
    const [filter, setFilter] = useState("all"); // 필터 상태 ('all', 'date', 'status')
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" }); // 날짜 범위
    const [orderStatus, setOrderStatus] = useState(""); // 주문 상태


    // API 호출 함수
    const fetchOrders = async (endpoint, params = {}) => {
        try {
            const token = localStorage.getItem("token");
            setError(null); // 에러 초기화
            let url = `/ROOT/api/orderview/${endpoint}`;
            console.log("API 요청 URL:", url);
            console.log("요청 파라미터:", params);
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            console.log("응답 데이터:", response.data);
            const data = response.data;
            if (data.length && data[0].status === 404) {
                setOrders([]);
                setError(data[0].message);
            } else {
                // 최신순으로 정렬
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

    // 주문 내역 전체 조회
    const fetchAllOrders = () => {
        fetchOrders("list");
    };

    // 날짜로 주문 내역 조회
    const fetchOrdersByDate = () => {
        if (!dateRange.startDate || !dateRange.endDate) {
            setError("시작 날짜와 종료 날짜를 모두 입력해주세요.");
            return;
        }
        fetchOrders("date", dateRange);
    };

    // 상태로 주문 내역 조회
    const fetchOrdersByStatus = () => {
        if (!orderStatus) {
            setError("조회할 주문 상태를 선택해주세요.");
            return;
        }
        fetchOrders("status", { orderStatus });
    };

    // 주문 필터 변경 처리
    useEffect(() => {
        if (filter === "all") {
            fetchAllOrders();
        } else if (filter === "date") {
            fetchOrdersByDate();
        } else if (filter === "status") {
            fetchOrdersByStatus();
        }
    }, [filter]);

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

    // UI 렌더링
    return (
        <div>
            <h1>내 주문 내역</h1>

            {/* 필터 선택 */}
            <div>
                <button onClick={() => setFilter("all")}>전체 조회</button>
                <button onClick={() => setFilter("date")}>날짜별 조회</button>
                <button onClick={() => setFilter("status")}>상태별 조회</button>
            </div>

            {/* 날짜별 필터 */}
            {filter === "date" && (
                <div>
                    <label>
                        시작 날짜:
                        <input
                            type="date"
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
                            value={dateRange.endDate}
                            onChange={(e) =>
                                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                            }
                        />
                    </label>
                    <button onClick={fetchOrdersByDate}>조회</button>
                </div>
            )}

            {/* 상태별 필터 */}
            {filter === "status" && (
                <div>
                    <label>
                        주문 상태:
                        <select
                            value={orderStatus}
                            onChange={(e) => setOrderStatus(e.target.value)}
                        >
                            <option value="">상태 선택</option>
                            <option value="주문 완료">주문완료</option>
                            <option value="주문 취소">주문취소</option>
                        </select>
                    </label>
                    <button onClick={fetchOrdersByStatus}>조회</button>
                </div>
            )}

            {/* 에러 메시지 */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* 주문 목록 */}
            <div>
                {orders.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>주문 번호</th>
                                <th>상태</th>
                                <th>가격</th>
                                <th>가게명</th>
                                <th>메뉴명</th>
                                <th>주문 시간</th>
                            </tr>
                        </thead>
                        <tbody>
    {orders.map((order, index) => {
        console.log(order); // order 객체 출력
        return (
            <tr key={index}>
                <td>{order.ordernumber}</td>
                <td>{order.orderstatus}</td>
                <td>{order.totalprice}</td>
                <td>{order.storename}</td>
                <td>{order.menuname}</td>
                <td>{new Date(order.ordertime).toLocaleString()}</td>
                <td>
                    {order.orderstatus === "주문 완료" &&
                        isReviewable(order.ordertime) && (
                            <button
                                onClick={() => handleWriteReview(order.ordernumber, order.storeid)}
                            >
                                리뷰작성
                            </button>
                        )}
                </td>
            </tr>
        );
    })}
</tbody>
                    </table>
                ) : (
                    !error && <p>주문 내역이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default MyOrder;
