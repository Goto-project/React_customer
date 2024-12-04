import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";

const ShowReceipt = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const orderNo = queryParams.get("orderNo");
    const pgToken = queryParams.get("pg_token");
    const [isPaymentProcessed, setIsPaymentProcessed] = useState(false); // 결제 완료 여부 상태

    // sessionStorage에서 orderRequest 데이터 가져오기
    const orderRequest = JSON.parse(sessionStorage.getItem('orderRequest'));

    useEffect(() => {
        console.log("aaaa");
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
                        pg_token: pgToken, // 결제 승인 토큰
                        }
                }
            );

            if (response.data.status === 200) {
                alert("결제가 성공적으로 완료되었습니다.");
                // setIsPaymentProcessed(true); // 결제 처리 완료 상태로 업데이트
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
            <h1>결제 완료</h1>
            <p>주문 번호: {orderNo}</p>
            <p>결제 토큰: {pgToken}</p>

        </div>
    );
};

export default ShowReceipt;