import { Marker } from "react-simple-maps";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationMarkerProps {
    lat: number;
    lng: number;
    name: string;
    onClick: () => void;
}

export default function LocationMarker({ lat, lng, name, onClick }: LocationMarkerProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Marker coordinates={[lng, lat]} onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <motion.circle
                r={4}
                fill="#4A2C2A"
                stroke="#F5E6D3"
                strokeWidth={1}
                style={{ cursor: "pointer" }}
                initial={{ scale: 0.8 }}
                animate={{ scale: isHovered ? 1.5 : 1 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
            />
            <AnimatePresence>
                {isHovered && (
                    <motion.text
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: -10 }}
                        exit={{ opacity: 0 }}
                        textAnchor="middle"
                        style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "10px",
                            fill: "#4A2C2A",
                            pointerEvents: "none",
                            fontWeight: "bold",
                            textShadow: "0px 0px 4px #F5E6D3" // Add halo for readability
                        }}
                    >
                        {name}
                    </motion.text>
                )}
            </AnimatePresence>
        </Marker>
    );
}
