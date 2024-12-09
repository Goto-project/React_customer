import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";

const PaymentSuccess = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const orderNo = queryParams.get("orderNo");
    const pgToken = queryParams.get("pg_token");
    const navigate = useNavigate();
    const storeid = sessionStorage.getItem('storeid');

    // sessionStorage에서 orderRequest 데이터 가져오기
    const orderRequest = JSON.parse(sessionStorage.getItem(`orderRequest_${storeid}`));

    useEffect(() => {
        handlePaymentSuccess(orderNo, pgToken, orderRequest);
    }, []);

    const handlePaymentSuccess = async (orderNo, pgToken, orderRequest) => {
        try {
            const response = await axios.post(
                `/ROOT/api/order/kakaoPaySuccess`,
                orderRequest,
                {
                    params: {
                        orderno: orderNo, // 서버에 전달할 주문 번호
                        pg_token: pgToken, // 결제 승인 토큰s
                    }
                }
            );

            if (response.data.status === 200) {
                // 2초 후 영수증 페이지로 이동
                setTimeout(() => {
                    navigate(`/payment/completed-receipt?orderNo=${orderNo}`);
                }, 2000);
            } else {
                alert(`결제 승인에 실패했습니다. 오류 메시지: ${response.data.error_message}`);
            }
        } catch (error) {
            console.error(error);
            alert("서버 오류가 발생했습니다.");
        }
    };

    return (
        <div>
            <h1>결제 진행 중...</h1>
            <p>주문 번호: {orderNo}</p>
        </div>
    );
};

export default PaymentSuccess;