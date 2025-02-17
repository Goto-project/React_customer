import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import '../../css/LoginHome.css';

const LoginHome = () => {


    const naverInit = () => {
        var naver_id_login = new window.naver_id_login("ofyUDU2NTCyZHJ972RrY", "http://localhost:3000/naverlogin");
        var state = naver_id_login.getUniqState();
        // naver_id_login.setButton("green", 1,40);
        naver_id_login.setDomain("http://localhost:3000");
        naver_id_login.setState(state);
        //naver_id_login.setPopup();
        // naver_id_login.init_naver_id_login();
    }

    const navigate = useNavigate();
    const { Kakao } = window;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        // 쿠키에서 이메일 가져오기
        const savedEmail = Cookies.get('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);


    const handleNaverLogin = () => {
        const clientId = "ofyUDU2NTCyZHJ972RrY";
        const redirectUri = "http://localhost:3000/naverlogin";
        const state = Math.random().toString(36).substring(2);

        const loginUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

        window.location.href = loginUrl; // 네이버 로그인 페이지로 이동
    };


    //카카오 네이버 초기화
    useEffect(() => {
        if (window.Kakao && !Kakao.isInitialized()) {
            Kakao.init('6793d8b5dccd9a62416a111cbb9f46b8'); // 초기화
            naverInit();
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


                // 아이디 기억하기 기능 처리
                if (rememberMe) {
                    Cookies.set('rememberedEmail', email, { expires: 7 }); // 쿠키 저장 (7일)
                } else {
                    Cookies.remove('rememberedEmail'); // 쿠키 제거
                }

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
            redirectUri: 'http://localhost:3000/kakaologin'
        })
    }

    const handleHomeClick = () => {
        navigate('/pages/Home/CustomerHome');
    };

    return (
        <div className="login-home">
            <div className="logo-container">
                <h2 className="logo" onClick={handleHomeClick}>ECOEATS</h2>
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

                <div className="remember-me">
                    <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="rememberMe">아이디 기억하기</label>
                </div>

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
                    <button className="sns-button-naver" onClick={handleNaverLogin}>
                        <img src="/img/naver.png" />
                        Continue with NAVER</button>
                    <button className="sns-button-kakao" id="kakao-login-btn" onClick={loginKakao}>
                        <img src="/img/kakao.png" />
                        Continue with KAKAO</button>
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
