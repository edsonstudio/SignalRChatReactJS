
const authHeader = (accessToken) => {
    if(accessToken.length !== 0){
        return {'Authorization': `Bearer ${accessToken}`}
    }else{
        return {};
    }
};

export default authHeader;