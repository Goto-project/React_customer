import axios from 'axios';
import React, { useEffect,useState } from 'react';
import { useNavigate,useSearchParams } from 'react-router-dom';

const KakaoLogin = () => {
    const navigate = useNavigate();
    const [searchParams,_] = useSearchParams();
    const code = searchParams.get("code");
    console.log("Authorization Code:", code);

    useEffect(() => {
        if (code) getToken(); // code가 존재할 때만 호출
    }, [code]);

    // 카카오 액세스 토큰을 요청하는 함수
    const getToken = async () => {
        const url = `https://kauth.kakao.com/oauth/token`;
        const headers = { 
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" 
        };
        // URLSearchParams를 사용하여 요청 데이터 구성
        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("client_id", "5dcc181ba43c2d5e19b1632c7b363b3a"); // REST API 키
        params.append("redirect_uri", "http://localhost:3000/kakaologin");
        params.append("code", code);

        try {
            const { data } = await axios.post(url, params, { headers });
            console.log("Access Token Response:", data);
            const access_token = data.access_token;

            // 카카오 사용자 정보 가져오기
            getInfo(access_token);
        } catch (error) {
            console.error("Error fetching token:", error.response?.data || error);
            alert("카카오 로그인 중 오류가 발생했습니다.");
        }
    };


    // 백엔드에서 수행 => 받아온 정보를 DB에 추가
    // 카카오 API로 사용자 정보를 가져오는 함수
    const getInfo = async (access_token) => {
        const url = `https://kapi.kakao.com/v2/user/me`;
        const headers = {
            "Authorization": `Bearer ${access_token}`
        };
        
        try {
            const { data } = await axios.get(url, { headers });
            console.log("User Info Response:", data);

            // 필요한 사용자 정보 추출
            const userInfo = {
                customerEmail: data.kakao_account.email,
                nickname: data.properties.nickname,
                phone: "", // 필요한 경우 추가 정보
            };

            // 로그인 후 백엔드에 사용자 정보 전송
            loginUser(userInfo);
        } catch (error) {
            console.error("Error fetching user info:", error.response?.data || error);
            alert("사용자 정보를 가져오는 데 실패했습니다.");
        }
    };

    // 사용자 정보를 백엔드로 전송하는 함수
    const loginUser = async (userInfo) => {
        try {
            const url = `127.0.0.1:8080/api/kakaologin/login.do`; // 백엔드 API
            const response = await axios.post(url, userInfo, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            console.log("Login Response:", response.data);
            if (response.data.status === 200) {
                // 로그인 성공 시, 메인 페이지로 이동
                navigate(`/`);
            } else {
                alert("로그인 실패");
            }
        } catch (error) {
            console.error("Login error:", error.response?.data || error);
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