import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Receipt = ({ orderNumber }) => {
    const [receiptData, setReceiptData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 사용자 토큰을 가져옵니다. (예시: 로컬 스토리지에서 가져올 수 있습니다.)
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');

        console.log("token" , token)
        console.log("eamil" , email)

        if (token && orderNumber) {
            axios
                .get('/ROOT/api/orderview/payment', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { orderNumber: orderNumber },
                })
                .then((response) => {
                    if (response.data.status === 200) {
                        setReceiptData(response.data.data);
                    } else {
                        setError(response.data.message);
                    }
                })
                .catch((err) => {
                    setError('서버 오류가 발생했습니다.');
                    console.error(err);
                });
        } else {
            setError('로그인되지 않았거나 주문 번호가 없습니다.');
        }
    }, [orderNumber]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!receiptData) {
        return <div>영수증을 불러오는 중...</div>;
    }

    // 영수증 표시
    return (
        <div>
            <h2>주문 영수증</h2>
            <p><strong>주문 번호:</strong> {receiptData.order_number}</p>
            <p><strong>주문 날짜:</strong> {receiptData.order_date}</p>
            <p><strong>고객 이메일:</strong> {receiptData.customer_email}</p>
            <p><strong>가게 이름:</strong> {receiptData.store_name}</p>
            <p><strong>총 금액:</strong> {receiptData.total_price} 원</p>
            <p><strong>결제 방법:</strong> {receiptData.pay_method}</p>
            <p><strong>픽업 시작:</strong> {receiptData.start_pickup}</p>
            <p><strong>픽업 종료:</strong> {receiptData.end_pickup}</p>

            <h3>메뉴 내역</h3>
            <ul>
                {receiptData.menu_details.map((item, index) => (
                    <li key={index}>
                        <p><strong>메뉴 이름:</strong> {item.menu_name}</p>
                        <p><strong>단가:</strong> {item.unit_price} 원</p>
                        <p><strong>수량:</strong> {item.quantity}</p>
                        <p><strong>합계 금액:</strong> {item.menu_total_price} 원</p>
                        <p><strong>주문 상태:</strong> {item.order_status}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Receipt;
