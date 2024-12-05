import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CompletedReceipt = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderNo = new URLSearchParams(location.search).get("orderNo");
    const [receiptData, setReceiptData] = useState(null);
    const storeid = sessionStorage.getItem('storeid');

    useEffect(() => {
        fetchData();

        return () => {
            sessionStorage.removeItem(`orderRequest_${storeid}`);
            sessionStorage.removeItem('storeid');
        };
    }, [orderNo]);

    const fetchData = async () => {
        await fetchReceiptData();
        
        // 결제 완료 후 장바구니 데이터 삭제
        sessionStorage.removeItem(`cart_${storeid}`);
    };

    const fetchReceiptData = async () => {
        try {
            const response = await axios.get('/ROOT/api/orderview/payment', {
                params: {
                    orderNumber: orderNo, // `orderNo`를 서버로 전달
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // 예시: Authorization 토큰
                }
            });

            if (response.data.status === 200) {
                setReceiptData(response.data.data);
            } else {
                alert("영수증 데이터를 불러오는 데 실패했습니다.");
            }
        } catch (error) {
            console.error(error);
            alert("서버 오류가 발생했습니다.");
        }
    };

    const handleContinueShopping = () => {
        navigate('/pages/Home/Customerhome');
    };

    const handleViewOrderHistory = () => {
        // 토큰에서 사용자 ID 추출
        const token = localStorage.getItem('token');
        const base64Url = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(base64Url));
        const customerEmail = decodedPayload.customerEmail; // 토큰 payload에서 userId 추출

        navigate(`/pages/Member/MyPage/${customerEmail}`);
    };

    if (!receiptData) {
        return <div>영수증 데이터를 불러오는 데 실패했습니다.</div>;
    }

    // pay_method에 따른 결제 방식 표시
    const payMethod = receiptData.pay_method == '1' ? '카카오페이' : '현장에서 결제 필요';


    return (
        <div>
            <h2>결제 영수증</h2>
            <p>주문 번호: {receiptData.order_number}</p>
            <p>주문 날짜: {receiptData.order_date}</p>
            <p>매장 이름: {receiptData.store_name}</p>
            <p>총 가격: {receiptData.total_price}</p>
            <p>결제 수단: {payMethod}</p>
            <h3>주문 메뉴</h3>
            <ul>
                {receiptData.menu_details.map((menu, index) => (
                    <li key={index}>
                        {menu.menu_name} - {menu.quantity}개 - {menu.menu_total_price}원
                    </li>
                ))}
            </ul>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={handleContinueShopping} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    쇼핑 계속하기
                </button>
                <button onClick={handleViewOrderHistory} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    주문 내역 보기
                </button>
            </div>
        </div>
    );
};

export default CompletedReceipt;