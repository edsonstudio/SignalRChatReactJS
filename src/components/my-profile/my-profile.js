import React, { Component } from 'react';
import './my-profile.css';
import {getDefaultImageUrl, getUserAvatar, defaultimage} from '../../services/';

class MyProfile extends Component {
    state = {
        loading: true,
        profile: null
    }

    componentDidMount = () => {
        this.setState({profile: this.props.profile, loading: false});
        
    };

    componentDidUpdate = (prevProps, prevState) =>{
        if(prevProps !== this.props){
            this.setState({
                profile: this.props.profile,
                loading: false
            });
        }
    }

    render(){
        if(this.state.profile === null){
            return(
            <div className="my-profile">
               Loading...
             </div>
            );
        }
        let content;
        if(this.state.profile !== null){
            
            const {  handleLogOut} = this.props;
            const { avatarFileName, userName} = this.state.profile;
            const imagePath = !avatarFileName ? getDefaultImageUrl(userName) : getUserAvatar(avatarFileName);
            content = (
                <React.Fragment>
                    <div className="avatar">
                        <span className="edit" onClick={() => this.props.handleEditorClose()}>
                            <i className="material-icons">create</i>
                        </span>
                        <img onError={defaultimage} src={imagePath} alt="avatar" name={userName}/>
                    </div>
                    <div className="my-username">
                        <p>{userName}</p>
                    </div>
                    <div className="navbar" onClick={() => handleLogOut()}>
                        <div className="log-out" >
                            <i className="material-icons">power_settings_new</i>
                            <p>Sair</p>
                        </div>
                    </div>
                </React.Fragment>
            )
        }
        

        const displayElement = content;
        return(
            <div className="my-profile">
               {displayElement}
             </div>
        );
    };
};

export default MyProfile;