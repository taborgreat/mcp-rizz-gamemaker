import { useState, useEffect, useRef } from "react";
import "./SettingsMenu.css";

export default function SettingsMenu({ onClose, showSpectatorMessages, onToggleSpectators, isSelfSpectator }) {
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(100);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const applyVolume = (vol, isMuted) => {
        const iframe = document.getElementById("gameFrame");
        const gmWindow = iframe?.contentWindow;
        if (gmWindow?.setGameVolume) {
            gmWindow.setGameVolume(isMuted ? 0 : vol / 100);
        }
    };

    const handleMuteToggle = () => {
        const next = !muted;
        setMuted(next);
        applyVolume(volume, next);
    };

    const handleVolumeChange = (e) => {
        const val = Number(e.target.value);
        setVolume(val);
        if (muted && val > 0) setMuted(false);
        applyVolume(val, val === 0);
    };

    return (
        <div className="settings-overlay">
            <div className="settings-menu" ref={menuRef}>
                <div className="settings-header">
                    <span>Settings</span>
                    <button className="settings-close" onClick={onClose}>X</button>
                </div>

                <div className="settings-section">
                    <label className="settings-row" onClick={handleMuteToggle}>
                        <span>Mute</span>
                        <span className={`settings-toggle ${muted ? "on" : ""}`} />
                    </label>

                    <div className="settings-row volume-row">
                        <span>Volume</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={muted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="volume-slider"
                        />
                        <span className="volume-value">{muted ? 0 : volume}</span>
                    </div>
                </div>

                {!isSelfSpectator && (
                    <div className="settings-section">
                        <label className="settings-row" onClick={onToggleSpectators}>
                            <span>Hide Spectators</span>
                            <span className={`settings-toggle ${showSpectatorMessages ? "on" : ""}`} />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}
