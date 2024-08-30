'use client'

import { createContext, useContext, useMemo } from "react";


import React from 'react'
import { io, Socket } from "socket.io-client";

type SocketContextType = Socket | null;

const SocketContext = createContext<SocketContextType>(null);

export const useSocket = ()=>{
    return useContext(SocketContext);
}


function SocketProvider({ children }: React.PropsWithChildren) {
    const socket = useMemo(() => io('ws://localhost:8000'), []);
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export default SocketProvider;