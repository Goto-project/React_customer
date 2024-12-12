import axios from 'axios';
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const KakaoLogin = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const code = searchParams.get("code");

    console.log("Authorization code:", code);

    useEffect(() => {
        
            getToken(code);
        
    }, []); // `code` 의존성 추가

    // 카카오 액세스 토큰을 요청하는 함수
    const getToken = async (authCode) => {
        const url = `https://kauth.kakao.com/oauth/token`;
        const headers = { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" };
        const body = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: "5dcc181ba43c2d5e19b1632c7b363b3a",
            redirect_uri: "http://localhost:3000/kakaologin",
            code: authCode,
        });

        try {
            const { data } = await axios.post(url, body, { headers });
            console.log("Access token response:", data);

            const access_token = data.access_token;
            getInfo(access_token); // 카카오 사용자 정보 요청
        } catch (error) {
            console.error("Error fetching token:", error.response ? error.response.data : error.message);
            alert("토큰 요청 중 오류가 발생했습니다. 에러: " + (error.response ? error.response.data.error_description : error.message));
        }
    };

    // 카카오 API로 사용자 정보를 가져오는 함수
    const getInfo = async (access_token) => {
        const url = `https://kapi.kakao.com/v2/user/me`;
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            "Authorization": `Bearer ${access_token}`,
        };

        try {
            const { data } = await axios.get(url, { headers });
            console.log("User info response:", data);

            const userInfo = {
                customerEmail: data.id.toString(),  // 카카오 ID를 customer_email로 사용
                nickname: data.properties.nickname,
                phone: "", // 추가 정보 필요 시 처리
            };

            loginUser(userInfo); // 사용자 정보 백엔드로 전송
        } catch (error) {
            console.error("Error fetching user info:", error.response?.data || error.message);
        }
    };

    // 사용자 정보를 백엔드로 전송하는 함수
    const loginUser = async (userInfo) => {
        try {
            const url = `http://127.0.0.1:8080/ROOT/api/kakaologin/auth.do`; // 백엔드 API
            const response = await axios.post(url, userInfo, {
                headers: { "Content-Type": "application/json" },
            });

            console.log("Backend login response:", response.data);

            

            if (response.data.status === 200) {
                // 로그인 성공 시 로컬 스토리지에 토큰과 email 저장
                localStorage.setItem('token', response.data.token); // 토큰 저장
                localStorage.setItem('email', userInfo.customerEmail); // 카카오 ID를 email로 저장
                
                navigate(`/pages/Home/Customerhome`); // 로그인 성공 시 메인 페이지로 이동
            } else {
                alert("로그인 실패");
            }
        } catch (error) {
            console.error("Login error:", error.response?.data || error.message);
            alert("로그인 중 오류가 발생했습니다.");
        }
    };

    return (
        <div>
            카카오 로그인 처리 중...
        </div>
    );
};

export default KakaoLogin;