import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import '../../css/LoginHome.css';

const LoginHome = () => {
    const navigate = useNavigate();
    console.log(window)
    const {Kakao} = window;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리


    useEffect(() => {
        if (window.Kakao && !Kakao.isInitialized()) {
            Kakao.init('6793d8b5dccd9a62416a111cbb9f46b8'); // 초기화
        }
    }, []);

    // 로그인 클릭 핸들러
    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMessage("아이디와 비밀번호를 모두 입력해주세요.");
            return;
        }

        setIsLoading(true); // 로딩 시작

        try {
            const url = `/ROOT/api/customer/login.do`; // 로그인 API 경로
            const headers = { "Content-Type": "application/json" };
            const body = { customerEmail: email, password: password };

            // 로그인 API 호출
            const { data } = await axios.post(url, body, { headers });

            if (data.status === 200) {
                // 로그인 성공 시 로컬 스토리지에 토큰 저장
                localStorage.setItem('token', data.token); //sessionstroage
                localStorage.setItem('email', email);

                // 로그인 후 홈 페이지로 이동
                navigate('/pages/Home/Customerhome');
            } else {
                setErrorMessage(data.message || '로그인 실패');
            }
        } catch (error) {
            console.error("로그인 중 오류:", error);
            setErrorMessage('로그인 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false); // 로딩 끝
        }
    };

    // 회원가입 클릭 핸들러
    const handleSignUpClick = () => {
        navigate('/pages/Member/SignupPage');
    };

    // 비밀번호 찾기 클릭 핸들러
    const handleForgotPasswordClick = () => {
        navigate('/pages/Member/ForgotPassword');
    };

    const loginKakao = () => {
        Kakao.Auth.authorize({
            redirectUri : 'http://localhost:3000/kakaologin'
        })
    }

    return (
        <div className="login-home">
            <div className="logo-container">
                <h2 className="logo">ECOEATS</h2>
            </div>

            <div className="login-container">
                <h3 className="login-title">CUSTOMER LOGIN</h3>

                <input 
                    type='text' 
                    placeholder='ID' 
                    className="login-id" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <input 
                    type='password' 
                    placeholder='PASSWORD' 
                    className="login-pw" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />

                <button 
                    type='button' 
                    className="login-button" 
                    onClick={handleLogin}
                    disabled={isLoading || !email || !password} // 로딩 중이거나 입력 값이 없으면 비활성화
                >
                    {isLoading ? "로그인 중..." : "로그인"}
                </button>

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <div className="sns-login">
                    <button className="sns-button naver">N</button>
                    <button className="sns-button kakao"id="kakao-login-btn" onClick={loginKakao}>K</button>
                </div>

                <div className="links">
                    <button className="customersignup" onClick={handleSignUpClick}>SIGN UP</button>
                    <button className="customerforgotpassword" onClick={handleForgotPasswordClick}>FORGOT PASSWORD?</button>
                </div>
            </div>
        </div>
    );
};

export default LoginHome;
