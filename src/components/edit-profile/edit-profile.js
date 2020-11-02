import React, { Component } from 'react';
import './edit-profile.css';
import { getDefaultImageUrl, getUserAvatar, defaultimage, uploadAvatar, getProfile, authHeader, updateUsersProfile } from '../../services';
import { withAuth } from '../hoc';
import Axios from 'axios';
//TODO: Add validations
class EditProfile extends Component{
    state = {
        id: '',
        selsectedFile: null,
        username: '',
        email: '',
        avatarFileName: '',
        isProfileCnanged: false
    };

    componentDidMount(){
        const { userName, email, avatarFileName, id } = this.props.profile;
        this.setState({
            avatarFileName, email, userName, id});
    };
    componentDidUpdate(prevProps, prevState){
        if(prevProps.profile !== this.props.profile){
            const { email, userName, avatarFileName, id } = this.props.profile;
            this.setState({
                email,
                userName,
                avatarFileName,
                id
            });
        }
        if(prevState.avatarFileName !== this.state.avatarFileName){
            this.setState({avatarFileName: this.state.avatarFileName});
        }
       
    }

    handleChange = (e) => {
        const {name, value } = e.target;    
        this.setState({[name]: value });
        this.setState({isProfileCnanged: true});
    };

    fileSelectedHandler = (e) => {
        var img = new FileReader();
        img.readAsDataURL(e.target.files[0]);
        console.log(img);
        this.setState({
            selsectedFile: e.target.files[0],
        });
    };

    onSaveChanges = async () => {
        const { accessToken }  = this.props.user;
        const {id, userName, email, avatarFileName } = this.state;
        const dbProfile = await getProfile(accessToken);
        const userObj = {
            id, userName, email, avatarFileName
        };
        if(JSON.stringify(userObj) !== JSON.stringify(dbProfile.data)){
            await updateUsersProfile(accessToken, userObj).then(res => {
                if(res.status === 200){
                    console.log('Your profile succesfuly updated')
                };
            });
        }else{
            console.log("You have not made any changes!");
        }
    };

    fileUploadHandler = () => {
        const { accessToken } = this.props.user;
        var fromData = new FormData();
        if(this.state.selsectedFile){
            fromData.append('image', this.state.selsectedFile, this.state.selsectedFile.name);
            uploadAvatar(fromData, accessToken).then(res => {
                this.setState({avatarFileName: res.data});
            });
        }else{
            console.error("You should select a file to upload")
        };
       
    };

    render(){
        // if(!this.state.username){
        //     return (<h5>Loading</h5>);
        // }
        
        const { avatarFileName, userName, email, selsectedFile, isProfileCnanged } = this.state;

        const imagePath = !avatarFileName ? getDefaultImageUrl(userName) : getUserAvatar(avatarFileName);
        return(
            <div className="edit-profile">
                <h5>EDIT PROFILE</h5>
                <div className="edit-image">
                    <img onError={defaultimage} src={imagePath} alt="avatar" name={userName}/>
                    <h6>Upload new avatar...</h6>
                </div>
                <div className="file-upload">
                    <input type="file" className="upload" onChange={this.fileSelectedHandler}/>
                    <button disabled={!selsectedFile ? true : false} onClick={() => this.fileUploadHandler()}>Upload</button>
                </div>
                
                <form className="edit-profile form">
                    <div className="user-name">
                        <label htmlFor="">User Name</label>
                        <input type="text" value={userName} onChange={this.handleChange} formNoValidate name="userName"/>
                    </div>
                    <div className="user-email">
                        <label htmlFor="">Email</label>
                        <input type="email" value={email} onChange={this.handleChange} name="email"/>
                    </div>
                </form>
                
                <button disabled={isProfileCnanged ? false : true} onClick={() => {
                    this.props.handleEditorClose();
                    this.onSaveChanges();
                }}>Save</button>
            </div>

            

        );
    };
};

export default withAuth(EditProfile);