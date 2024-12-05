import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentFail = () => {

    const [errorMessage, setErrorMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const storeid = sessionStorage.getItem('storeid');

    useEffect(() => {
        // URL에서 쿼리 파라미터 가져오기
        const queryParams = new URLSearchParams(location.search);
        const error = queryParams.get('error');

        if (error) {
            setErrorMessage(error);
        } else {
            setErrorMessage('알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.');
        }
    }, [location]);

    const handleRetry = () => {
        // 결제 재시도 로직
        navigate(`/store/detail/${storeid}`);   // 예: 결제 페이지로 다시 리디렉션
    };

    return (
        <div>
            <h2>결제 실패</h2>
            <p>{errorMessage}</p>
            <button onClick={handleRetry}>다시 시도</button>
        </div>
    );
};

export default PaymentFail;