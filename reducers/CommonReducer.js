const initialState = {
    logged : false,
    token : '',
    menu : 1,
    counter : 1000,
}

const CommonReducer = (state = initialState , action) => {
    //바꾸는 동작1
    //dispatch({type:'login' , token:'실제토큰'})
    if(action.type === 'login'){
        //저장소에 보관
        sessionStorage.setItem("TOKEN" , action.token);
        //initialState에서 2개의 logged,token변경
        return{
            ...state,
            logged : true,
            token : action.token
        }
    }

    //바꾸는 동작2
    //dispatch({type:'logout'})
    else if(action.type === 'logout'){
        sessionStorage.removeItem("TOKEN");
        return{
            ...state,
            logged : false,
            token : '',
        }
    }

    //dispatch({type : 'counter'})
    else if(action.type === 'counter'){
        return{
            ...state,
            counter : counter + 1
        }
    }

    //현재의 4개의 값을 가지고 감
    else{
        const token = sessionStorage.getItem("TOKEN");
        if(token !== null){
            return {
                ...state,
                logged : true,
                token : token,
            }
        }
    }
}

export default CommonReducer;