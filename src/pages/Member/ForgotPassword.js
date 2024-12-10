import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put('http://localhost:3000/ROOT/api/customer/forgotpassword.do', null, {
                params: {
                    customerEmail: email,
                    newPwd: newPassword
                }
            });

            if (response.data.status === 200) {
                setStatus('success');
                setMessage(response.data.message);

                const userConfirmed = window.confirm('비밀번호가 재설정되었습니다. 로그인 페이지로 이동하시겠습니까?');

                if (userConfirmed) {
                    // 사용자가 "확인"을 누르면 로그인 페이지로 이동
                    navigate('/pages/Member/LoginHome');
                }
            } else {
                setStatus('error');
                setMessage(response.data.message);
            }
        } catch (error) {
            setStatus('error');
            setMessage('서버 오류가 발생했습니다.');
        }
    };

    return (
        <div>
            <h3>비밀번호 재설정</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">이메일:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="newPassword">새 비밀번호:</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">비밀번호 재설정</button>
            </form>
            {message && (
                <div style={{ color: status === 'success' ? 'green' : 'red' }}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;
