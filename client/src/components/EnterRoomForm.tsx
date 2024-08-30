import React from 'react';

interface ICreateOrJoinProps{
    title: string;
    create: boolean;
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    room: string;
    setRoom: React.Dispatch<React.SetStateAction<string>>;
    handleSubmit: (e: React.SyntheticEvent) => void;
    handleToggleView: () => void;
}

function EnterRoomForm({title, create, email, setEmail, room, setRoom, handleSubmit, handleToggleView}: ICreateOrJoinProps) {
    const handleToggleViewNew=(e: React.SyntheticEvent)=>{
        e.preventDefault();
        handleToggleView();
    }
    return (
        <div>
            <h2>{title}</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        id="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="room" className="form-label">Room Number</label>
                    <input
                        type="text"
                        id="room"
                        className="form-control"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder="Enter room number"
                        required
                    />
                </div>
                <div className="d-grid">
                    <button type="submit" className="btn btn-primary">{create ? "Create" : "Join"}</button>
                    <button type='button' className='btn bg-transparent' onClick={handleToggleViewNew} >Want to {create ? "join" : "create"} a room? <a href='#' > click here.</a></button>
                </div>
            </form>
        </div>
    )
}

export default EnterRoomForm;