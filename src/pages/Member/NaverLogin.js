import axios from 'axios';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NaverLogin = () => {
    const navigate = useNavigate();

    const naverInit = async () => {
        try {
            console.log('네이버 로그인 초기화');
            var naver_id_login = new window.naver_id_login("ofyUDU2NTCyZHJ972RrY", "http://localhost:3000/naverlogin");
            
            // 접근 토큰 값 출력
            console.log(naver_id_login.oauthParams.access_token);

            const url = `/ROOT/api/naver/getInfo.json`;
            const headers = { 
                "Content-Type": "application/json", 
                "token": naver_id_login.oauthParams.access_token 
            };

            const { data } = await axios.get(url, { headers });
            console.log(data);

            // 세션 스토리지에 사용자 정보 및 토큰 저장
            if (data.status === 200) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('email', data.email);
                localStorage.setItem('token', data.token);

                navigate('/');
            } else {
                // 로그인 실패 처리
                alert('로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('로그인 중 오류 발생:', error);
            alert('로그인 중 문제가 발생했습니다.');
        }
    };

    useEffect(() => {
        naverInit();
    }, []);

    return (
        <div>
            {/* 로딩 중 또는 로그인 처리 중 컴포넌트 */}
        </div>
    );
};
export default NaverLogin;