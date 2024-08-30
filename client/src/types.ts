
export interface IRoomPageProps {
    params: {
        roomId: string;
    };
}

export interface IUser {
    email: string;
    socketId: string;
}

export interface IRoom {
    users: IUser[]
}

export interface IRoomObject {
    [roomKey: string]: IRoom;
}

export interface IJoinedProps {
    email: string;
    id: string;
    rooms: IRoomObject
}

export interface ICallProps {
    from: string;
}

export interface IIncommingProps extends ICallProps {
    offer: RTCSessionDescriptionInit;
}

export interface IAcceptProps extends ICallProps {
    answer: RTCSessionDescriptionInit;
}





export interface IJoinRoomProps {
    email: string;
    room: string;
    rooms: IRoomObject;
}

export interface IMsg {
    msg: string;
}