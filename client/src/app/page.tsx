"use client"

import { navigate } from '@/app/actions';
import EnterRoomForm from '@/components/EnterRoomForm';
import { useSocket } from '@/context/SocketProvider';
import { IJoinRoomProps, IMsg } from '@/types';
import React, { useCallback, useEffect, useState } from 'react';



function HomePage() {
    const socket = useSocket();

    const [email, setEmail] = useState<string>("");
    const [room, setRoom] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [createRoom, setCreateRoom] = useState<boolean>(false);

    const handleJoinRoomSubmit = useCallback((e: React.SyntheticEvent) => {
        e.preventDefault();
        socket?.emit('join_room_from_client', { email, room });

    }, [email, room, socket]);



    const handleCreateRoomSubmit = useCallback((e: React.SyntheticEvent) => {
        e.preventDefault();
        socket?.emit('create_room_from_client', { email, room });
    }, [email, room, socket]);

    const handleJoinRoom = useCallback((data: IJoinRoomProps) => {
        const { email, room, rooms } = data;
        localStorage.setItem('rooms', JSON.stringify(rooms));
        setError(null);
        navigate(`/room/${room}`);
    }, []);

    const handleDuplicateRoom = useCallback((data: IMsg) => {
        setError(data.msg);
    }, []);

    const handleNotFoundRoom = useCallback((data: IMsg) => {
        setError(data.msg);
    }, []);

    const handleToggleJoinView = useCallback(() => {
        setCreateRoom(false);
    }, [createRoom]);

    const handleToggleCreateView = useCallback(() => {
        setCreateRoom(true);
    }, [createRoom]);


    useEffect(() => {
        socket?.on("join-room-from-server", handleJoinRoom);
        socket?.on("error-duplicate-from-server", handleDuplicateRoom);
        socket?.on("error-no-room-from-server", handleNotFoundRoom);
        return () => {
            socket?.off("join-room-from-server", handleJoinRoom);
            socket?.off("error-duplicate-from-server", handleDuplicateRoom);
            socket?.off("error-no-room-from-server", handleNotFoundRoom);
        }
    }, [socket, handleJoinRoom]);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body">
                            <h1 className="card-title text-center mb-4">Home Page</h1>
                            {error && <h2 className='alert alert-danger'>{error}</h2>}
                            {createRoom
                                ? (<EnterRoomForm create={true} email={email} setEmail={setEmail} room={room} setRoom={setRoom} title='Create a Room!'
                                    handleSubmit={handleCreateRoomSubmit} handleToggleView={handleToggleJoinView} />)
                                : (
                                    <EnterRoomForm create={false} email={email} setEmail={setEmail} room={room} setRoom={setRoom} title='Join the Room!'
                                        handleSubmit={handleJoinRoomSubmit} handleToggleView={handleToggleCreateView} />
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage;
