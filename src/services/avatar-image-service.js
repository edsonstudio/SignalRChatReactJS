const getUserAvatar = (fileName) =>{
     const url = `https://localhost:5001/images/${fileName}`;
     return url;
};

export default getUserAvatar;