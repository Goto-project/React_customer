import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';

import CustomerHome from './pages/Home/CustomerHome';
import LoginHome from './pages/Member/LoginHome';
import SignupPage from './pages/Member/SignupPage';
import ForgotPassword from './pages/Member/ForgotPassword';
import MyPage from './pages/MyPage/MyPage';
import StoreDetail from './pages/Home/StoreDetail';

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

  const handleClick1 = () => {
    navigate('/pages/Home/Customerhome');
  };

  const handleClick2 = () => {
    window.location.href = 'http://localhost:3001/';
  };

  return (
    <div className="second-screen">
      <div className="info-container">
        <div className="info-item">
          <img src="img/food.jpg" alt="Half Price" />
          <p>Enjoy delicious food at half price or less!<br /><span>맛있는 음식을 절반 가격이나 그 이하로 즐기세요!</span></p>
        </div>
        <div className="info-item">
          <img src="img/sale.jpg" alt="Closing Time" />
          <p>Get affordable food near closing time.<br /><span>마감 시간에 저렴하게 구매할 수 있는 음식을 제공합니다.</span></p>
        </div>
        <div className="info-item">
          <img src="img/environment.jpg" alt="Reduce Waste" />
          <p>Reduce food waste and protect the environment.<br /><span>음식 낭비를 줄여 환경을 보호하세요.</span></p>
        </div>
        <div className="info-item">
          <img src="img/winwin.jpg" alt="Win-Win" />
          <p>A win-win for consumers and businesses!<br /><span>소비자와 가게 모두에게 이득이 되는 소비!</span></p>
        </div>
      </div>

      <div className="button-container">
        <p className="startp">START TO ECOEATS!</p>
        <button className="start-button" onClick={handleClick1}>START</button>
        <button className="secondary-button" onClick={handleClick2}>GO TO SELLER SITE</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<><FirstScreen /><SecondScreen /></>} />
          <Route path="/pages/Home/Customerhome" element={<CustomerHome />} />
          <Route path="/pages/Member/LoginHome" element={<LoginHome />} />
          <Route path="/pages/Member/SignupPage" element={<SignupPage />} />
          <Route path="/pages/Member/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/pages/Member/MyPage/:email" element={<MyPage />} />
          <Route path="/store/detail/:storeid" element={<StoreDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
