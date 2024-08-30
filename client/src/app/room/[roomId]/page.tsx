'use client'

import { useSocket } from '@/context/SocketProvider';
import React, { useCallback, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import 'bootstrap/dist/css/bootstrap.min.css';
import { IAcceptProps, IIncommingProps, IJoinedProps, IRoom, IRoomObject, IRoomPageProps } from '@/types';
import PeerService from '@/service/PeerService';



let sharedStream: MediaStream | null = null;
const peerService = new PeerService();


function RoomPage({ params: { roomId } }: IRoomPageProps) {
  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCaller, setIsCaller] = useState<boolean>(false);
  const [currRoom, setCurrRoom] = useState<IRoom | null>(null);
  const [roomObjects, setRoomObjects] = useState<IRoomObject | null>(null);

  /**
   * Step 1: This function gets access to the user's camera and microphone.
   * Why: We need this to capture the video/audio streams to share during the call.
   */
  const getMediaStream = async () => {
    if (!sharedStream) {
      sharedStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    }
    return sharedStream.clone();
  };


  const handleUserJoined = useCallback(({ email, id, rooms }: IJoinedProps) => {
    if (roomId) {
      setRemoteSocketId(id);
      setRoomObjects(rooms);
      try {
        const cr = rooms[roomId];
        if (cr) setCurrRoom(cr);
      } catch (error) {
        console.log(error);

      }
    }
  }, [roomId, remoteSocketId]);

  /**
   * Step 2: Initiates a call by sending an offer to the remote peer.
   * Why: The caller needs to create an offer and send it to the callee to establish a peer-to-peer connection.
   */
  const handleCallUser = useCallback(async () => {
    setIsCaller(true);
    const stream = await getMediaStream(); // Step 2a: Get the media stream
    const offer = await peerService.getOffer();  // Step 2b: Create an offer for the call
    socket?.emit('user_call_from_client', { to: remoteSocketId, offer }); // Step 2c: Send the offer to the remote peer
    setMyStream(stream); // Step 2d: Set the local stream to be used in the call
  }, [remoteSocketId, socket]);

  /**
   * Step 3: Handles an incoming call by responding with an answer.
   * Why: When receiving a call offer, the callee needs to accept it and send an answer back to establish the connection.
   */
  const handleIncommingCall = useCallback(async ({ from, offer }: IIncommingProps) => {
    try {
      setRemoteSocketId(from);
      const stream = await getMediaStream(); // Step 3a: Get the media stream
      setMyStream(stream); // Step 3b: Set the local stream to be used in the call
      const answer = await peerService.getAnswer(offer); // Step 3c: Create an answer for the received offer
      socket?.emit('call_accepted_from_client', { to: from, answer }); // Step 3d: Send the answer back to the caller
    } catch (error) {
      console.log(error);
    }
  }, [socket]);

  /**
   * Step 4: Sends the local media streams to the remote peer.
   * Why: Once a connection is established, both peers need to exchange their media streams.
   */
  const sendStreams = useCallback(() => {
    if (!myStream) {
      return;
    }
    for (const track of myStream.getTracks()) {
      if (peerService.peer) peerService.peer.addTrack(track, myStream); // Step 4a: Add each media track to the peer connection
    }
  }, [myStream]);

  /**
   * Step 5: Handles the acceptance of a call by setting the remote description.
   * Why: The caller needs to set the remote description with the answer received from the callee to finalize the connection.
   */
  const handleAcceptedCall = useCallback(({ from, answer }: IAcceptProps) => {
    peerService.setLocalDescription(answer); // Step 5a: Set the remote description with the answer
    sendStreams(); // Step 5b: Send the local media streams to the remote peer
  }, [sendStreams]);

  /**
   * Step 6: Handles negotiation needed event by creating and sending a new offer.
   * Why: Sometimes additional negotiation is needed after the initial connection is established, e.g., when adding new media tracks.
   */
  const handleNegoNeeded = useCallback(async () => {
    console.log("Hooking - handleNegoNeeded");
    const offer = await peerService.getOffer(); // Step 6a: Create a new offer for renegotiation
    socket?.emit('peer_nego_needed_from_client', { to: remoteSocketId, offer }); // Step 6b: Send the new offer to the remote peer
  }, [remoteSocketId, socket]);

  /**
   * Step 7: Handles an incoming negotiation request by responding with an answer.
   * Why: When the remote peer requests renegotiation, the local peer needs to handle it and send an answer back.
   */
  const handleNegoNeededIncomming = useCallback(async ({ from, offer }: IIncommingProps) => {
    const answer = await peerService.getAnswer(offer); // Step 7a: Create an answer for the renegotiation offer
    socket?.emit('peer_nego_done_from_client', { to: from, answer }); // Step 7b: Send the answer back to the remote peer
  }, [socket]);

  /**
   * Step 8: Finalizes the negotiation process by setting the remote description.
   * Why: The local peer needs to finalize the renegotiation by setting the remote description with the answer received from the remote peer.
   */
  const handleNegoFinal = useCallback(async ({ from, answer }: IAcceptProps) => {
    await peerService.setLocalDescription(answer); // Step 8a: Set the remote description with the final answer
  }, []);

  // Step 9: Register event listeners for negotiation needed and track events
  useEffect(() => {
   
    
    peerService.peer?.addEventListener('negotiationneeded', handleNegoNeeded); // Step 9a: Register negotiation needed event
    return () => {
        peerService.peer?.removeEventListener('negotiationneeded', handleNegoNeeded); // Step 9b: Cleanup negotiation needed event listener
    };
  }, [handleNegoNeeded]);

  useEffect(()=>{
    // Setting room details
    const roomsExists = localStorage.getItem("rooms");
    if(roomsExists && roomId && !currRoom){
      const parsedRooms = JSON.parse(roomsExists);
      setRoomObjects(parsedRooms);
      setCurrRoom(parsedRooms[roomId]);
    }
  }, [roomObjects, currRoom, roomId]);

  // Step 10: Register an event listener for when a remote track is received
  useEffect(() => {    
    peerService.peer?.addEventListener('track', async (event) => {
      const remoteStream = event.streams;
      setRemoteStream(remoteStream[0]); // Step 10a: Set the remote stream to display in the UI
    });
  }, []);

  // Step 11: Register and cleanup socket event listeners for various WebRTC actions
  useEffect(() => {
    socket?.on('user-joined-from-server', handleUserJoined); // Step 11a: Handle when another user joins
    socket?.on('incomming-call-from-server', handleIncommingCall); // Step 11b: Handle an incoming call
    socket?.on('call-accepted-from-server', handleAcceptedCall); // Step 11c: Handle when a call is accepted
    socket?.on('peer-nego-needed-from-server', handleNegoNeededIncomming); // Step 11d: Handle incoming negotiation request
    socket?.on('peer-nego-final-from-server', handleNegoFinal); // Step 11e: Handle final negotiation step
    return () => {
      socket?.off('user-joined-from-server', handleUserJoined);
      socket?.off('incomming-call-from-server', handleIncommingCall);
      socket?.off('call-accepted-from-server', handleAcceptedCall);
      socket?.off('peer-nego-needed-from-server', handleNegoNeededIncomming);
      socket?.off('peer-nego-final-from-server', handleNegoFinal);
    };
  }, [socket, handleAcceptedCall, handleIncommingCall, handleUserJoined, handleNegoNeededIncomming, handleNegoFinal]);

  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand px-2" href="#">WebRTC Video Call</a>
      </nav>
      <div className="row my-4">
        <div className="col-md-12 text-center">
          <h2>Room ID: {roomId}</h2>
          <p>{remoteSocketId ? "Connected" : "No one in the room"}</p>
          {currRoom && currRoom.users &&  <ul className='list-group'>
            {currRoom.users.map((u) => (<li key={u.email} className="list-group-item">{u.email}</li>))}
          </ul>}
        </div>
      </div>
      <div className="row">
        <div className="col-md-12 text-center">
          {myStream && !isCaller && (
            <button className="btn btn-success my-2" onClick={sendStreams}>Accept Call</button>
          )}
          {remoteSocketId && (
            <button className="btn btn-primary my-2" onClick={handleCallUser}>
              {isCaller ? "Call Again" : "Call User"}
            </button>
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-md-6 text-center">

          {myStream && <React.Fragment><h4>My Stream</h4> <ReactPlayer width="100%" url={myStream} playing muted /></React.Fragment> }
        </div>
        <div className="col-md-6 text-center">
          {remoteStream && <React.Fragment><h4>Remote Stream</h4><ReactPlayer width="100%" url={remoteStream} playing muted /></React.Fragment>}
        </div>
      </div>
    </div>
  );
}

export default RoomPage;