### WebRTC
WebRTC (Web Real-Time Communication) is a technology that enables peer-to-peer communication between devices without needing a middleman, such as a server. It's widely used for applications like video calls, voice chats, and file sharing.
 - [tutorial](https://www.youtube.com/watch?v=pGAp5rxv6II)

#### Key Points:

- **Protocol**: WebRTC works on UDP (User Datagram Protocol). UDP is like sending a letter by regular mail; it might not arrive in perfect condition, or at all, but it's fast. This is important for real-time communication where speed is critical, such as in video calls, where a little lag can make the conversation awkward.

- **Public and Private IPs**: Imagine you live in a big apartment building (your local network). Your apartment number is your private IP address, while the building’s main address is the public IP. When someone outside the building (another device on the internet) wants to contact you, they need the building’s address and your apartment number. Similarly, devices need to discover each other's public IPs to communicate directly.

- **TURN/ICE Servers**: Think of a TURN server as a helpful concierge in your apartment building. When you want to connect with someone outside, you ask the concierge (the TURN server) for your building’s address. The ICE protocol is like finding the best way to reach someone in another building, whether it's a direct path or going through multiple connections (like other buildings).

#### Step-by-Step Process:

1. **Initialization**: The process starts when two users want to connect (like setting up a video call). Each user's browser begins the WebRTC setup.

2. **Signaling**: This is like exchanging contact information through a friend. The two devices share details about how to connect, often using a server as an intermediary (like a messaging service).

3. **Session Description Protocol (SDP)**: Once the contact information is exchanged, both users know how to reach each other. SDP is like agreeing on the language and format for the conversation, ensuring both parties understand each other.

4. **ICE Candidates**: These are potential ways the devices can connect, like suggesting different routes to meet up. The devices test these routes to find the best one.

5. **Connection Establishment**: Once the best path is found, the devices connect directly, and the conversation (data transfer) can begin, like finally making that video call.

6. **Data Transfer**: Now, the devices are directly connected and can exchange data in real-time. This could be the video, audio, or files being shared during the call.

WebRTC is powerful because it allows for direct, real-time communication without relying heavily on external servers, making it efficient and fast.


- https://www.youtube.com/watch?v=ZDiQWv-hjtw
