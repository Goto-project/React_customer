import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyOrder = () => {
    const [orderByDate, setOrderByDate] = useState([]); // 날짜별 주문 내역
    const [orderByStore, setOrderByStore] = useState([]); // 상점별 주문 내역
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
                // 두 API를 병렬로 호출
                const [dateResponse, storeResponse] = await Promise.all([
                    axios.get(`/ROOT/api/orderview/orderbydate`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`/ROOT/api/orderview/ordersbystore`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (dateResponse.data.status === 200) {
                    setOrderByDate(dateResponse.data.data.data); // 날짜별 데이터 설정
                } else {
                    setErrorMessage('날짜별 주문 내역을 불러오는 데 실패했습니다.');
                }

                if (storeResponse.data.status === 200) {
                    setOrderByStore(storeResponse.data.data.data); // 상점별 데이터 설정
                } else {
                    setErrorMessage('상점별 주문 내역을 불러오는 데 실패했습니다.');
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
        <div>
            <h2>날짜별 주문 내역</h2>
            {orderByDate.map((dateGroup, index) => (
                <div key={index}>
                    <h3>{formatDate(dateGroup.order_date)}</h3>
                    {dateGroup.orders.map((order, orderIndex) => (
                        <div key={orderIndex}>
                            <p>주문 번호: {order.order_number}</p>
                            <p>총 금액: {order.order_total_price}원</p>
                            <ul>
                                {order.orders.map((item, itemIndex) => (
                                    <li key={itemIndex}>
                                        메뉴: {item.menu_name}, 수량: {item.quantity}, 가격: {item.unit_price}원, 상태: {item.orderstatus}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <p>하루 총 매출: {dateGroup.total_price}원</p>
                </div>
            ))}
        </div>
    );

    const renderOrdersByStore = () => (
        <div>
            <h2>상점별 주문 내역</h2>
            {orderByStore.map((dateGroup, index) => (
                <div key={index}>
                    <h3>{formatDate(dateGroup.order_date)}</h3>
                    {dateGroup.stores.map((store, storeIndex) => (
                        <div key={storeIndex}>
                            <h4>상점명: {store.storename}</h4>
                            {store.orders.map((order, orderIndex) => (
                                <div key={orderIndex}>
                                    <p>주문 번호: {order.order_number}</p>
                                    <p>총 금액: {order.order_total_price}원</p>
                                    <ul>
                                        {order.orders.map((item, itemIndex) => (
                                            <li key={itemIndex}>
                                                메뉴: {item.menu_name}, 수량: {item.quantity}, 가격: {item.unit_price}원, 상태: {item.orderstatus}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    if (isLoading) {
        return <p>로딩 중...</p>;
    }

    return (
        <div>
            <h1>내 주문 목록</h1>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button onClick={() => setViewMode('date')}>날짜별 보기</button>
            <button onClick={() => setViewMode('store')}>상점별 보기</button>
            {viewMode === 'date' ? renderOrdersByDate() : renderOrdersByStore()}
        </div>
    );
};

export default MyOrder;