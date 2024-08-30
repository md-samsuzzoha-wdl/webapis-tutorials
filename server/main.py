import socketio
from typing import Dict, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create a new FastAPI app
app = FastAPI()

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Create a new Socket.IO server instance
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = socketio.ASGIApp(sio, app)

# In-memory data structures to map email to socket ID and vice versa
rooms: Dict[str, Dict[str, Any]] = {}


def update_user():
    pass


async def join_room(sid: str, email: str, room: str, data: Dict[str, str]) -> None:
    if room in rooms:
        curr_room = rooms[room]
        user_list = curr_room["users"]
        user_list.append({ "email": email, "socketId": sid })
        curr_room["users"] = user_list
        rooms[room] = curr_room
    else:
        rooms[room] = {
            "users": [{
                "email": email, "socketId": sid
            }]
        }

    await sio.emit('user-joined-from-server', {'email': email, 'id': sid, 'rooms': rooms}, room=room)
    await sio.enter_room(sid, room)

    # Send message to socket user id
    data["rooms"] = rooms
    await sio.emit('join-room-from-server', data, to=sid)


# Handle the connection event
@sio.event
async def connect(sid, environ):
    print(f"Socket connected {sid}")


@sio.event
async def disconnect(sid: str) -> None:
    print(f"Socket disconnected: {sid}")

    # Use a direct lookup mechanism for rooms instead of iterating through all rooms
    for room_id, room_data in list(rooms.items()):  # Convert to list to allow safe removal
        users = room_data['users']

        # Filter out the disconnected user
        updated_users = [user for user in users if user['socketId'] != sid]

        if len(updated_users) < len(users):
            # User was found and removed
            if updated_users:
                room_data['users'] = updated_users
            else:
                del rooms[room_id]  # Remove the room if no users left
            break


# Handle the "join-room-from-client" event
@sio.event
async def join_room_from_client(sid, data):
    print({"socket ID: ": sid})
    email = data.get('email')
    room = data.get('room')
    if room in rooms:
        await join_room(sid=sid, email=email, room=room, data=data)
    else:
        data = {"msg": "No room has been created!"}
        await sio.emit('error-no-room-from-server', data, to=sid)



@sio.event
async def create_room_from_client(sid, data):
    try:
        print({"socket ID: ": sid})
        email = data.get("email")
        room = data.get('room')
        if room in rooms:
            # Room name will be unique
            data = {"msg": "A room with this name already exist!"}
            await sio.emit('error-duplicate-from-server', data, to=sid)
        else:
            await join_room(sid=sid, email=email, room=room, data=data)
    except Exception as e:
        print(e)


# Handle the "user-call-from-client" event
@sio.event
async def user_call_from_client(sid, data):
    to = data.get('to')
    offer = data.get('offer')
    print(f"Incoming call {to} \n", offer)

    await sio.emit("incomming-call-from-server", {'from': sid, 'offer': offer}, to=to)


# Handle the "call-accepted-from-client" event
@sio.event
async def call_accepted_from_client(sid, data):
    to = data.get('to')
    answer = data.get('answer')

    await sio.emit("call-accepted-from-server", {'from': sid, 'answer': answer}, to=to)


# Handle the "peer-nego-needed-from-client" event
@sio.event
async def peer_nego_needed_from_client(sid, data):
    to = data.get('to')
    offer = data.get('offer')

    await sio.emit("peer-nego-needed-from-server", {'from': sid, 'offer': offer}, to=to)


# Handle the "peer-nego-done-from-client" event
@sio.event
async def peer_nego_done_from_client(sid, data):
    to = data.get('to')
    answer = data.get('answer')

    await sio.emit("peer-nego-final-from-server", {'from': sid, 'answer': answer}, to=to)


# Running the server using Uvicorn
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
