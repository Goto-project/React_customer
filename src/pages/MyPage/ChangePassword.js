import React, { useState } from 'react';
import '../../css/ChangePassword.css';

const ChangePassword = () => {
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmNewPwd, setConfirmNewPwd] = useState("");
    const [message, setMessage] = useState("");

    const handleChangePassword = async () => {
        if (newPwd !== confirmNewPwd) {
            setMessage("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            return;
        }

        const token = localStorage.getItem("token"); // 예: 토큰을 로컬스토리지에서 가져옴
        if (!token) {
            setMessage("로그인이 필요합니다.");
            return;
        }

        try {
            const response = await fetch(
                `/ROOT/api/customer/updatepassword.do?currentPwd=${currentPwd}&newPwd=${newPwd}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();
            if (data.status === 200) {
                alert("비밀번호가 성공적으로 변경되었습니다.");
                window.location.reload(); //변경 후 새로고침
            } else {
                setMessage(data.message || "비밀번호 변경에 실패했습니다.");
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("서버 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <div className="password-edit-container">
            <div className="password-edit-back">
                <h2 className="password-edit-title">비밀번호 변경</h2>
                <div className="passwordeditinput">
                    <div className="password-input-group">
                        <label htmlFor="currentPwd">현재 비밀번호</label>
                        <input
                            type="password"
                            id="currentPwd"
                            value={currentPwd}
                            onChange={(e) => setCurrentPwd(e.target.value)}
                            placeholder="현재 비밀번호 입력"
                        />
                    </div>
                    <div className="password-input-group">
                        <label htmlFor="newPwd">새 비밀번호</label>
                        <input
                            type="password"
                            id="newPwd"
                            value={newPwd}
                            onChange={(e) => setNewPwd(e.target.value)}
                            placeholder="새 비밀번호 입력"
                        />
                    </div>
                    <div className="password-input-group">
                        <label htmlFor="confirmNewPwd">새 비밀번호 확인</label>
                        <input
                            type="password"
                            id="confirmNewPwd"
                            value={confirmNewPwd}
                            onChange={(e) => setConfirmNewPwd(e.target.value)}
                            placeholder="새 비밀번호 확인"
                        />
                    </div>
                </div>
                <button className="editpasswordbtn" onClick={handleChangePassword}>
                    비밀번호 변경
                </button>
                {message && <div className="message-container">{message}</div>}
            </div>
        </div>
    );
};

export default ChangePassword;