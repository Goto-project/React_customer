import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';

import CustomerHome from './pages/Home/CustomerHome';
import LoginHome from './pages/Member/LoginHome';
import SignupPage from './pages/Member/SignupPage';
import ForgotPassword from './pages/Member/ForgotPassword';
import MyPage from './pages/MyPage/MyPage';
import StoreDetail from './pages/Home/StoreDetail';
import KakaoLogin from './pages/Member/KakaoLogin';
import Receipt from './pages/MyPage/Receipt';
import MyOrder from './pages/MyPage/MyOrder';
import WriteReview from './pages/MyPage/WriteReview';

function FirstScreen() {
  return (
    <div className="first-screen">
      <div className="text-container">
        <h1 className="title">ECOEATS</h1>
        <p className="subtitle">SAVE YOUR FOOD, LOVE YOUR PLANET</p>
        <p className="subtitle-small">음식을 아끼고 지구를 아끼자</p>
      </div>
      <div className="image-container">
        <img src="img/ecoeatsmainhome.jpg" alt="eco-eats" className="main-image" />
      </div>
    </div>
  );
}

function SecondScreen() {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/pages/Home/Customerhome');
  };

  const handleSellerClick = () => {
    window.location.href = 'http://localhost:3001/';
  };

  function FeaturesAnimation() {
    useEffect(() => {
      const items = document.querySelectorAll('.feature-item');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        { threshold: 0.1 }
      );

      items.forEach((item) => observer.observe(item));

      return () => observer.disconnect();
    }, []);

    return null;
  }

  return (
    <div className="home-screen">
      <div className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">ECOEATS</h1>
            <p className="hero-subtitle">SAVE YOUR FOOD, LOVE YOUR PLANET</p>
            <p className="hero-subtitle-small">음식을 아끼고 지구를 아끼자</p>
            <div className="button-container">
              <button className="start-button" onClick={handleStartClick}>
                START
              </button>
              <button className="secondary-button" onClick={handleSellerClick}>
                SELLER SITE
              </button>
            </div>
          </div>
        </div>
      </div>

      <FeaturesAnimation />

      <section className="description-section">
        <h2>What is ECOEATS?</h2>
        <p>
          ECOEATS는 음식 낭비를 줄이고 저렴한 가격으로 <br />
          음식을 구매할 수 있도록 설계된 친환경 플랫폼입니다. <br />
        </p>

        <p>
          고객과 가게 모두에게 이득이 되고 지속 가능한<br />
          솔루션을 제공합니다.
        </p>
        {/* <img src="img/eco-friendly.jpg" alt="Eco Friendly" /> */}
      </section>

      <section className="features-section">
        <div className="features-container">
          <div className="feature-item">
            <h3>Affordable</h3>
            <p>절반 가격 혹은 그 이하로 음식을 구매하세요.</p>
          </div>
          <div className="feature-item">
            <h3>Eco-Friendly</h3>
            <p>음식 낭비를 줄이고 환경을 보호합니다.</p>
          </div>
          <div className="feature-item">
            <h3>Win-Win</h3>
            <p>소비자와 사업자 모두에게 이익을 제공합니다.</p>
          </div>
          <div className="feature-item">
            <h3>Convenient</h3>
            <p>언제 어디서든 간편하게 사용할 수 있습니다.</p>
          </div>
        </div>
        <div className="features-image">
          <img src="img/paperbag.png" alt="Eco-Friendly Background" />
        </div>
      </section>

    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/pages/Home/Customerhome" element={<CustomerHome />} />
          <Route path="/pages/Member/LoginHome" element={<LoginHome />} />
          <Route path="/pages/Member/SignupPage" element={<SignupPage />} />
          <Route path="/pages/Member/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/pages/Member/MyPage/:email" element={<MyPage />} />
          <Route path="/store/detail/:storeid" element={<StoreDetail />} />
          <Route path="/kakaologin" element={<KakaoLogin />} />
          <Route path="/pages/Mypage/Receipt" element={<Receipt />} />
          <Route path="/pages/Mypage/MyOrder" element={<MyOrder />} />
          <Route path="/pages/Mypage/WriteReview/:orderNumber/:storeid" element={<WriteReview />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
