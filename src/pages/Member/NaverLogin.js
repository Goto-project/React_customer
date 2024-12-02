import React from 'react';
const naverInit = async() => {
    var naver_id_login = new window.naver_id_login("ofyUDU2NTCyZHJ972RrY", "http://localhost:3000/naverlogin1");

    // 접근 토큰 값 출력
    console.log(naver_id_login.oauthParams.access_token);
    const url = `/ROOT/api/naver/getInfo.json`;
    const headers = {"Content-Type":"application", "token":naver_id_login.oauthParams.access_token};
    const {data} = await axios.get(url,{headers})
    console.log(data);
}





useEffect(() => {
    naverInit();
}, []);
const NaverLogin = () => {
    return (
        <div>
            
        </div>
    );
};

export default NaverLogin;