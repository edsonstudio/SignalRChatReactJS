const getUserAvatar = (fileName) =>{
     const url = `https://localhost:5910/images/${fileName}`;
     return url;
};

export default getUserAvatar;