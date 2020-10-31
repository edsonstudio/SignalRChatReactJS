const getUserAvatar = (fileName) =>{
     const url = `https://localhost:5101/images/${fileName}`;
     return url;
};

export default getUserAvatar;