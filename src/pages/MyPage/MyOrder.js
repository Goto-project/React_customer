import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../../css/MyOrder.css";

const MyOrder = () => {
    const [orderByDate, setOrderByDate] = useState([]); // 날짜별 주문 내역
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태
    const [viewMode, setViewMode] = useState('date'); // 'date' 또는 'store'

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setErrorMessage('로그인 정보가 유효하지 않습니다.');
                setIsLoading(false);
                return;
            }

            try {
                const dateResponse = await axios.get(`/ROOT/api/orderview/orderbydate`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (dateResponse.data.status === 200) {
                    setOrderByDate(dateResponse.data.data.data);
                } else {
                    setErrorMessage('날짜별 주문 내역을 불러오는 데 실패했습니다.');
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
                setErrorMessage('주문 내역을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const renderOrdersByDate = () => (
        <div className="order-container">
            {orderByDate.map((dateGroup, index) => (
                <div key={index} className="order-receipt">
                    <h3 className="order-date-title">{formatDate(dateGroup.order_date)}</h3>
                    <div className="order-items">
                        {dateGroup.orders.map((order, orderIndex) => (
                            <div key={orderIndex} className="order-item">
                                <p><strong>주문 번호:</strong> {order.order_number}</p>
                                <p><strong>주문 일시:</strong> {formatDate(order.order_date)}</p>
                                <p><strong>총 금액:</strong> {order.order_total_price}원</p>
                                <div className="order-menu-items">
                                    {order.orders.map((item, itemIndex) => (
                                        <div key={itemIndex} className="menu-item">
                                            <p><strong>메뉴:</strong> {item.menu_name}</p>
                                            <p><strong>수량:</strong> {item.quantity}</p>
                                            <p><strong>가격:</strong> {item.unit_price}원</p>
                                            <p><strong>상태:</strong> {item.orderstatus}</p>
                                        </div>
                                    ))}
                                </div>
                                <hr />
                            </div>
                        ))}
                        <p className="total-revenue">하루 총 매출: {dateGroup.total_price}원</p>
                    </div>
                </div>
            ))}
        </div>
    );

    if (isLoading) {
        return <p>로딩 중...</p>;
    }

    return (
        <div className="order-page">
            <h1 className='order-header'>내 주문 목록</h1>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {renderOrdersByDate()}
        </div>
    );
};

export default MyOrder;
