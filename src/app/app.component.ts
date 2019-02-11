import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    title = 'app';
    // token: string;
    elder_token: string;
    kiddo_token: string;
    kiddo_client: any;
    elder_client: any;
    sendMessage: string;
    respMessage: string;
    constructor(private http: HttpClient) {
        // this.getUsersElder();
        // this.getUsersKiddo();
    }
    registerWebSocket(token: string) {
        const url = 'http://localhost:8090/endpoint';
        const me = this;
        const socket = new SockJS(url);
        const client = Stomp.over(socket);
        client.debug = null;
        client.connect(
            { 'Authorization': token },
            successMsg => {
                // 连接成功后注册消息
                console.log('注册完成: ' + JSON.stringify(successMsg));
                client.subscribe('/topic/mural',
                    (frame) => {
                        console.log(token);
                        console.log(frame);
                        me.receivePushInfo(frame);
                        me.respMessage = frame.body;
                    }
                );
                client.subscribe('/user/topic/demo',
                    (frame) => {
                        console.log(frame);
                        // me.receivePushInfo(frame);
                    }
                );
                client.subscribe('/exchange/stomp.exchange/get-response',
                    (frame) => {
                        console.log(token);
                        console.log(frame);
                        me.receivePushInfo(frame);
                        me.respMessage = frame.body;
                    }
                );
            },
            errorMsg => {
                console.log(errorMsg);
            },
        );
        return client;
    }

    send() {
        // this.kiddo_client.send('/app/hello2', {}, { 'name': 'kiddo send a msg' });
        this.http.post('http://localhost:8090/message/history', {
            senderId: 1017,
            receiverId: 1014,
            offset: 0
        }).subscribe(
            msg => {
                console.log(JSON.stringify(msg));
            }
        );
    }

    tryToken() {
        // this.kiddo_client.send('/app/hello2', {}, { 'name': 'kiddo send a msg' });
        this.http.get('http://localhost:8090/user/require_auth').subscribe(
            msg => {
                console.log(JSON.stringify(msg));
            }
        );
    }

    sendTo() {
        this.kiddo_client.send('/app/message', {}, JSON.stringify({ 'subjectId': 1014156432, 'message': '41245' }));
    }
    endlerSendTo() {
        this.elder_client.send('/app/message', {}, JSON.stringify({ 'subjectId': 1045, 'message': '41245' }));
    }

    /**
     * @函数名称：receivePushInfo
     * @param data
     * @作用：接收后台推送信息 并发送给订阅模块
     * @return：obj
     * @date 2018/7/30
     */
    private receivePushInfo(data) {
        // const msg = JSON.parse(data.body);
        const msg = data.body;
        console.log(msg);
    }

    getUsersElder(): void {
        console.log('entter getUser');
        this.http
            .post('http://localhost:8090/user/login', {
                'email': '123@qq.com',
                'password': '123456'
            })
            .subscribe((res: any) => {
                console.log('resp from 8090 for elder' + JSON.stringify(res));
                this.elder_token = res.data.token;
                localStorage.setItem('token', this.elder_token);
            });
    }
    getUsersKiddo(): void {
        console.log('entter getUser');
        this.http
            .post('http://localhost:8090/user/login', {
                'email': 'dc83080779@gmail.com',
                'password': '123456'
            })
            .subscribe((res: any) => {
                console.log('resp from 8090 for kiddo' + JSON.stringify(res));
                this.kiddo_token = res.data.token;
                localStorage.setItem('token', this.kiddo_token);
            });
    }

    testToken(): void {
        this.http.get('http://localhost:8090/user/article').subscribe((res: any) => {
            console.log(JSON.stringify(res));
        });
    }

    connWSElder() {
        this.elder_client = this.registerWebSocket(this.elder_token);
    }

    connWSKiddo() {
        this.kiddo_client = this.registerWebSocket(this.kiddo_token);
    }



}
