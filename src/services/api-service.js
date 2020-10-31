import Axios from "axios";
import { authHeader } from './';


// const _baseUrl = 'https://localhost:44397/api/';
export const _baseUrl = 'https://localhost:5101/api/v2/';

const register = async (registerObj) => {
    const result = await Axios.post(`${_baseUrl}identity/nova-conta`, registerObj);
    return await result;
};

const login = async (loginObj) => {
    const result = await Axios.post(`${_baseUrl}identity/autenticar`, loginObj);
    return await result;
};

const searchForUsers = async (value, accessToken) => {
        const result = await Axios.get(`${_baseUrl}users/search?name=${value}`, {
            headers: authHeader(accessToken)
        });
        return await result;
};

const uploadAvatar = async (fromData, accessToken) =>{
    const result = await Axios.post(`${_baseUrl}avatars/upload`, fromData, {
        headers: authHeader(accessToken)
    });
    return await result;
};
const getProfile = async (accessToken) =>{
    console.log("getProfile")
    const result = await Axios.get(`${_baseUrl}users/getprofile`, {
        headers: authHeader(accessToken)
    });
    return await result;
};

const getMessages = async (threadId, accessToken) => {
    const result = await Axios.get(`${_baseUrl}thread/getmessages/${threadId}`, {
        headers: authHeader(accessToken)
    });
    return await result;
};

const getThreads = async (accessToken) => {
    const result = await Axios.get(`${_baseUrl}hey/getthreads`, {
        headers: authHeader(accessToken)
    });
    return await result;
};

const createThread = async (oponentViewModel, accessToken) => {
    const result = await Axios.post(`${_baseUrl}hey/createthread`, {
        OponentVM: oponentViewModel
    }, {
        headers: authHeader(accessToken)
    });
    return await result;
};

const sendMessageToApi = async (messageViewModel, accessToken) => {
    const result = await Axios.post(`${_baseUrl}hey/send`, messageViewModel, {
        headers: authHeader(accessToken)
    });
    return await result;
};

const searchForMessageInThread = async (accessToken, params) => {
    const result = await Axios.get(`${_baseUrl}thread/search`, {
        headers: authHeader(accessToken),
        params: params
    });
    return await result;
}

const updateUsersProfile = async (accessToken, user) => {
    const result = await Axios.post(`${_baseUrl}users/update`, user, {
        headers: authHeader(accessToken)
    });
    return await result;
};

export { getProfile, getMessages, getThreads, createThread, sendMessageToApi, uploadAvatar, searchForUsers, login, register, searchForMessageInThread, updateUsersProfile } ;