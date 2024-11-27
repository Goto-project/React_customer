import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../../css/MyProfile.css';

const MyProfile = () => {
    const { email } = useParams(); // URL에서 이메일 파라미터 읽기
    const navigate = useNavigate();
    const [nickname, setNickname] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const storedEmail = localStorage.getItem('email'); // localStorage에서 저장된 이메일 가져오기
            if (!token || storedEmail !== email) {
                navigate('/pages/Member/LoginHome'); // 토큰이 없거나 이메일이 일치하지 않으면 로그인 페이지로 이동
                return;
            }

            try {
                const response = await axios.get(`/ROOT/api/customer/mypage.do`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.status === 200) {
                    setNickname(response.data.nickname);
                    setPhone(response.data.phone);
                } else {
                    throw new Error(response.data.message || '인증 실패');
                }
            } catch (error) {
                console.error('회원 정보 불러오기 실패:', error);
                navigate('/pages/Member/LoginHome'); // 인증 실패 시 로그인 페이지로 이동
            }
        };

        fetchData();
    }, [email, navigate]);

    return (
        <div className="mypage">
            <h2>YOUR PROFILE</h2>
            <div>
                <p>EMAIL: {email}</p>
                <p>NICKNAME: {nickname}</p>
                <p>PHONE: {phone}</p>
            </div>
        </div>
    );
};

export default MyProfile;
