import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/CompletedReceipt.css'

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
        const token = localStorage.getItem("token");
        const userEmail = localStorage.getItem("email");
        await fetchReceiptData();
        
        // 결제 완료 후 장바구니 데이터 삭제
        sessionStorage.removeItem(`cart_${userEmail}_${storeid}`);
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

        navigate('/pages/Member/MyPage', { state: { email: customerEmail, page: 'MyOrder' }});
    };

    if (!receiptData) {
        return <div>영수증 데이터를 불러오는 데 실패했습니다.</div>;
    }

    // pay_method에 따른 결제 방식 표시
    const payMethod = receiptData.pay_method == '1' ? '카카오페이' : '현장에서 결제 필요';


    return (
        <div className="receipt-container">
            <h2 className="receipt-title">결제 영수증</h2>
            <div className="receipt-details">
                <p><strong>주문 번호:</strong> {receiptData.order_number}</p>
                <p><strong>주문 날짜:</strong> {receiptData.order_date}</p>
                <p><strong>매장 이름:</strong> {receiptData.store_name}</p>
                <p><strong>총 가격:</strong> {receiptData.total_price}원</p>
                <p><strong>결제 수단:</strong> {payMethod}</p>
            </div>
    
            <h3 className="menu-title">주문 메뉴</h3>
            <ul className="menu-list">
                {receiptData.menu_details.map((menu, index) => (
                    <li key={index} className="menu-item">
                        {menu.menu_name} - {menu.quantity}개 - {menu.menu_total_price}원
                    </li>
                ))}
            </ul>
    
            <div className="receipt-button-container">
                <button onClick={handleContinueShopping} className="button continue-btn">
                    쇼핑 계속하기
                </button>
                <button onClick={handleViewOrderHistory} className="button history-btn">
                    주문 내역 보기
                </button>
            </div>
        </div>
    );
    
};

export default CompletedReceipt;