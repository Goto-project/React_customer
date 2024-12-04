import React from "react";
import { useNavigate } from "react-router-dom";
import "../../css/ThankYouPage.css"; // CSS 파일 경로

const ThankYouPage = () => {
    const navigate = useNavigate();

    const handleRedirect = () => {
        navigate("/"); // 로그인 화면으로 리디렉션
    };

    return (
        <div className="thank-you-container">
            <h1 className="logo-text">ECOEATS</h1>
            <p className="thank-you-message">ECOEATS 회원 탈퇴가 완료되었습니다.</p>
            <div className="underline"></div>
            <div className="thank-you-content">
                <div className="thank-you-box">
                    <img
                        src="/img/box.png" // 적절한 이미지 경로
                        alt="Thank You"
                        className="thank-you-image"
                    />
                    <p>그동안 ECOEATS를 이용해 주셔서 감사합니다!</p>
                    <p>더 좋은 서비스를 제공하기 위해 항상 노력하겠습니다.</p>
                </div>
            </div>
            <button className="redirect-button" onClick={handleRedirect}>
                확인
            </button>
        </div>
    );
};

export default ThankYouPage;
