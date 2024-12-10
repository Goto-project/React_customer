import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 리다이렉트를 위한 useNavigate
import axios from 'axios';
import '../../css/SignupPage.css';

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [emailMessage, setEmailMessage] = useState(''); // 이메일 확인 메시지
    const [isEmailValid, setIsEmailValid] = useState(false); // 이메일 유효성 상태
    const navigate = useNavigate(); // useNavigate 훅 사용

    // 이메일 중복 확인
    const handleCheckEmail = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식 정규식

        if (!email) {
            setEmailMessage('이메일을 입력해주세요.');
            return;
        }

        if (!emailRegex.test(email)) {
            setEmailMessage('올바른 이메일 형식을 입력해주세요.');
            setIsEmailValid(false);
            return;
        }

        try {
            const response = await axios.get(`/ROOT/api/customer/checkemail`, {
                params: { customerEmail: email },
            });

            if (response.data.status === 200) {
                setEmailMessage('사용 가능한 이메일입니다.');
                setIsEmailValid(true);
            } else {
                setEmailMessage('이미 사용 중인 이메일입니다.');
                setIsEmailValid(false);
            }
        } catch (error) {
            console.error('이메일 중복 확인 오류:', error);
            setEmailMessage('서버 오류가 발생했습니다.');
            setIsEmailValid(false);
        }
    };

    // 회원가입 버튼 클릭 핸들러
    const handleSignup = async () => {
        if (!email || !password || !nickname || !phone) {
            setMessage('모든 필드를 입력해주세요.');
            return;
        }

        if (!isEmailValid) {
            setMessage('사용 가능한 이메일을 입력해주세요.');
            return;
        }

        try {
            const url = `/ROOT/api/customer/join.do`;
            const body = {
                customerEmail: email,
                password: password,
                nickname: nickname,
                phone: phone,
            };

            const response = await axios.post(url, body, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.data.status === 200) {
                setMessage('회원가입이 성공적으로 완료되었습니다!');
                setTimeout(() => {
                    navigate('/pages/Member/LoginHome'); // '/' 경로로 이동
                }, 1000); // 2초 후 이동
            } else {
                setMessage(response.data.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('회원가입 중 오류 발생:', error);
            setMessage('서버 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleHomeClick = () => {
        navigate('/pages/Home/CustomerHome');
    };

    return (
        <div className="signup-page">
            <div className="signup-left">
                <div className="signup-left-text">
                    <p>ECOEATS에 오신 것을 환영합니다!</p>
                    <p>ECOEATS와 함께 음식 낭비를 줄이고</p>
                    <p>저렴한 가격으로 음식을 구매해보세요</p>
                </div>
            </div>

            <div className="signup-right">
                <h2 onClick={handleHomeClick}>ECOEATS</h2>
                <div className="signup-container">
                    <h3 className="signup-title">CUSTOMER SIGN UP</h3>
                    <div className="signup-input">
                        <div className="email-check-container">
                            <input
                                type="text"
                                placeholder="EMAIL"
                                className="customerEmail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button className="check-email-button" onClick={handleCheckEmail}>
                                중복확인
                            </button>
                        </div>
                        {emailMessage && <div className="email-message">{emailMessage}</div>}

                        <input
                            type="password"
                            placeholder="PASSWORD"
                            className="customerPassword"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="NICKNAME"
                            className="customerNickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="PHONE"
                            className="customerPhone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <button className="signup-button" onClick={handleSignup}>
                        COMPLETE
                    </button>

                    {message && <div className="signup-message">{message}</div>}

                    {/* <div className="sns-login">
                        <button className="sns-button naver">N</button>
                        <button className="sns-button kakao">K</button>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
