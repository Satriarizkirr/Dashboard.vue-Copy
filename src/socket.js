import { io } from "socket.io-client";
import store from "./store";

const socket = io("http://localhost:5000"); // Koneksi ke root backend

socket.on("connect", () => {
  console.log("Connected to server via socket");
});

socket.on("new_detection", (data) => {
  console.log("Received detection:", data);
 
    const mappedDetection = {
    detectedAt: data.detected_at,
    className: data.class_,  // mapping class_ ke className
    confidence: data.confidence,
    imageUrl: data.image_url,
  };


  store.addDetection(mappedDetection);

});

export default socket;
