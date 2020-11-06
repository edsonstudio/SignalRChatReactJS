import React, {Component } from 'react';
import { withAuth } from './hoc';
import * as signalR from '@aspnet/signalr';
import MessageList from './message-list';
import SendMessageForm from './send-message-form';
import ThreadList from '../components/thread-list';
import MyProfile from './my-profile';
import {getProfile, getThreads, createThread, sendMessageToApi } from '../services';


class Dashboard extends Component  {
//TODO: use only user profile with props needed
    constructor(props){
        super(props);
        this.state = {
            userId: null,
            userProfile: null,
            userName: null,
            threadId: null,
            oponentId: null,
            oponentProfile:{},
            threads: [],
            users: [],
            error: true,
            hubConnection: null,
            isEdit: false
        };

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:5101/chat", {
                accessTokenFactory: () => this.props.user.accessToken
            })
            .build();

        this.accessToken = this.props.user.accessToken;
    }
    
    // connect = async (signalRConnection) => {
    //     signalRConnection.start().catch(e => {
    //         this.sleep(5000);
    //         console.log("Reconnecting Socket");
    //         this.connect(signalRConnection);

    //     })
    // }
    // sleep = async (msec) => {
    //     return new Promise(resolve => setTimeout(resolve, msec));
    // }
    componentDidMount(){
        const {accessToken} = this.props.user;
        console.log("Debug")
        
        getProfile(accessToken).then(res => {
            console.log(res.data);
            this.setState({
                userProfile: res.data,
                userName: res.data.userName
            });
        }).catch(err => {
            console.error(err);
            this.props.history.push("/login");
        });

        // this.connect(this.connection);
        this.connection.onclose((e) => {
            console.log('fechando conexao com o SignalR');
            console.log(e)
        });
        this.connection.on('ReciveConnectionId', connId => {
            console.log("Conexao com signalR aberta");
            console.log(`CuurentConnectionId: ${connId}`);
        });

        this.connection
            .start()
            .then(() => console.log("conexao iniciada"))
            .catch(err => {
                console.log(err)
                this.props.history.push("/login");
            });

        this.setState({hubConnection: this.connection});
        this.update();
    };

   update = async () => {
        //Getting user's threads
        await getThreads(this.accessToken).then(res => {
            const { status } = res;
            if(status !== 204){
               const { data: threads} = res;
               this.setState({threads});
            };
        }).catch(err => console.log(err));

        this.connection.on('ReviceThread', (thread) => {
            console.log(thread);
            let {threads} = this.state;
            threads = [...threads, thread];
            this.setState({threads});
        });

        this.connection.on('ReciveAvatar', (avatar) => {
            console.log('RECEIVED AVATAR BY BACKEND',avatar);
            
            const { userProfile, oponentProfile, threads } = this.state;

            if(avatar.uploaderId === userProfile.id){
                userProfile.avatarFileName = avatar.body.value;
            };
            if(avatar.uploaderId === oponentProfile.id){
                oponentProfile.avatarFileName = avatar.body.value;
            }
            threads.forEach(t => {
                if(t.oponentVM.id === avatar.uploaderId){
                    t.oponentVM.avatarFileName = avatar.body.value;
                }
            });
            this.setState({userProfile, oponentProfile, threads});
        });

        this.connection.on('ReciveMessage', (message) => {
            console.log('RECEIVED BY BACKEND', message);
            const { threads } = this.state;
            console.log('TREAD OF FRONEND', threads);

            console.log(message);
            threads.forEach(t => {
                if(t.id === message.threadId){
                    t.lastMessage = message;
                }
            });
            this.setState({threads});
        });

        this.connection.on('ReciveTypingStatus', ({userId, threadId}) => {
            const {
                threads: currentThreads,
                oponentProfile: currentOpponentProfile
            } = this.state;

            if(currentOpponentProfile.id === userId && currentOpponentProfile.isTyping === false){
                currentOpponentProfile.isTyping = true;
                this.setState(() => ({oponentProfile: currentOpponentProfile}));
                this.opponentTimer = setTimeout(() => {currentOpponentProfile.isTyping = false; this.setState({oponentProfile: currentOpponentProfile})}, 3000);
            }

            if(!threadId){
                console.log('CANNOT HANDLER RECEIVE TYPING STATUS');
                return; 
            }
            currentThreads.forEach(t => {
                if(t.id === threadId){
                    const { oponentVM } = t;
                    if(oponentVM.id === userId && !oponentVM.isTyping){
                        t.oponentVM.isTyping = true;
                        this.setState({threads: currentThreads});
                        setTimeout(() => {
                            t.oponentVM.isTyping = false;
                            this.setState({threads: currentThreads})
                        }, 3000);
                    }
                }
            });
        });

        
        this.connection.on('ReciveStopTypingStatus', ({userId, threadId}) => {
            const {threads} = this.state;
            const { oponentProfile } = this.state;
            if(oponentProfile.id === userId && oponentProfile.isTyping){
                oponentProfile.isTyping = false;
            }
            threads.forEach(t => {
                if(t.id === threadId){
                    const { oponentVM } = t;
                    if(oponentVM.id === userId && oponentVM.isTyping){
                        oponentVM.isTyping = false;
                    }
                }
            });
            this.setState({
                threads, oponentProfile
            });

        });

        this.connection.on('ReciveConnectedStatus', (connectedUserId) => {
            const { threads } = this.state;
            threads.forEach(t => {
                if(t.oponentVM.id === connectedUserId){
                    t.oponentVM.isOnline = true;
                };
            });
            this.setState({threads});
        });

        this.connection.on('ReciveDisconnectedStatus', disconnectedUserId => {
            const { threads } = this.state;
            threads.forEach(t => {
                if(t.oponentVM.id === disconnectedUserId){
                    t.oponentVM.isOnline = false;
                };
            });
            this.setState({threads});
        });

        this.connection.on('ReviceUpdatedOpponentProfile', profile =>{
            if(profile){
                const { userProfile, threads } = this.state;
                if(userProfile.id === profile.id){
                    this.setState({userProfile: profile});
                }
                threads.forEach(thread => {
                    let { oponentVM } = thread;
                    if(oponentVM.id === profile.id){
                        thread.oponentVM.Username = profile.Username;
                        thread.oponentVM.email = profile.email;
                    }
                });
                this.setState({threads});

            };
        });

    };
    //change oponent name to id
    //TODO: ANALISAR
    createThread = (oponentVM) => {
        var thread = this.state.threads.find(t => t.oponentVM.id === oponentVM.id || t.owner === oponentVM.id);
        if(!thread){
            createThread(oponentVM, this.accessToken).then(res => {
                const{ threadId } = res.data;
                this.setState({threadId, oponentId: oponentVM.id, oponentProfile: oponentVM});
            })
            .catch(err => {
                console.log(err.response.data.threadId);
                const { threadId } = err.response.data;
                this.setState({threadId, oponentId: oponentVM.id, oponentProfile: oponentVM});
            });
        }else{
            this.setState({threadId: thread.id, oponentId: oponentVM.id, oponentProfile: oponentVM});
        };
    };

    sendMessage = (message) => {
        console.log("RECEIVE MESSAGE TO SEND");
        console.log(message);

        if(!message.length){
            console.log('NO MESSAGE TO SEND');
            return;
        }

        if(!this.state.threadId){
            console.log("Thread isn't choosen");
            return;
        };

        const messageViewModel = {
            SenderId: this.state.userProfile.id, //this.props.user.id,
            Text: message,
            ThreadId: this.state.threadId,
            Username: this.state.userName
        };

        console.log("MESSAGE IS AVAILABLE TO BE SEND");
            

        sendMessageToApi(messageViewModel, this.accessToken)
            .then(res => {
                if(res.status === 201){
                    console.log("Message succesfully been sent");
                }
            }).catch(err => {
                console.log(err.response.data);
            });
    };

    subscribeToThread = (threadId, oponentVm) => {
        this.setState({threadId, oponentId: oponentVm.id, oponentProfile: oponentVm});
    };

    handleLogOut = () => {
        localStorage.removeItem('user-data');
        this.props.history.push('/Login');
        this.connection.stop();
    };
    handleEditorClose = () => {
        this.setState((state) => ({
            isEdit: !state.isEdit
        }));
    }

    handleTyping = (e) => {
        console.log('TYPING FN RECEIVE AN EVENT');
        console.log(e);
        let my_user_id = this.state.userId;

        if (!e.value.length)  this.onStopTyping(my_user_id);
        else  this.onTyping(my_user_id);

        // if(e.value.length === 0 ){
        //     console.log('stop')
        //     this.onStopTyping(e.userName);
        // }else{
        //     this.onTyping(e.userName);
        // }
    }

    handlerSendMessage = () => {
        let _this = this;
        
        return (message) => {
            console.log('SEND MESSAGE');
            console.log(this.props.user.id);
            _this.sendMessage(message);
        }
    };

    onSendMessage = (id, message) => {
        this.connection.invoke('SendMessage', id, message);
    };

    onTyping = (id) => {
        this.connection.invoke('OnTyping', id);
    };

    onStopTyping = (id) => {
        this.connection.invoke('OnStopTyping', id);
    };

  render(){ 
    const { userProfile, threadId, userName, threads, isEdit, oponentProfile} = this.state;
   
    return(
        <div className="app">
            <MyProfile  handleLogOut={this.handleLogOut} profile={userProfile} handleEditorClose={this.handleEditorClose}/>
            <MessageList 
                oponentProfile={oponentProfile}
                userProfile={userProfile}
                threadId={threadId}
                username={userName}
                connection={this.connection}/>
            <SendMessageForm sendMessage={this.handlerSendMessage()} typing={this.handleTyping} threadId={threadId}/>
            <ThreadList 
                profile={userProfile}
                threadId={threadId}
                threads={threads} 
                userId={this.props.user.id} 
                subscribeToThread={this.subscribeToThread}
                createThread={this.createThread}
                handleEditorClose={this.handleEditorClose}
                isEdit={isEdit}/>
        </div>
    );
  };
};

export default withAuth(Dashboard);