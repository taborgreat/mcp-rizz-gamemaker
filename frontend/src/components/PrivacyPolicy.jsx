import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./LegalPage.css";

export default function PrivacyPolicy() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="legal-page">
            <header className="legal-header">
                <Link to="/" className="legal-back">GOT RIZZ</Link>
            </header>

            <div className="legal-content">
                <h1>Privacy Policy</h1>
                <p className="legal-updated">Last updated: March 3, 2026</p>

                <section>
                    <h2>1. Information We Collect</h2>
                    <p>
                        Got Rizz collects minimal data. We do <strong>not</strong> track you across the
                        web, use analytics platforms, or build user profiles. The only information we
                        collect is:
                    </p>
                    <ul>
                        <li><strong>WebSocket Connection Data:</strong> Basic connection information required
                            to run the multiplayer game, including session identifiers and connection timestamps.</li>
                        <li><strong>IP Addresses:</strong> Used solely for rate limiting and blocking spam
                            or abuse. We do not store IP addresses long-term or use them for tracking.</li>
                        <li><strong>Player Name:</strong> The display name you choose when joining a game room.
                            This is not linked to any personal identity.</li>
                        <li><strong>In-Game Messages:</strong> Text you submit during gameplay exists only
                            for the duration of your session.</li>
                    </ul>
                </section>

                <section>
                    <h2>2. How We Use Your Information</h2>
                    <p>We use the limited data we collect exclusively to:</p>
                    <ul>
                        <li>Maintain active WebSocket connections for real-time gameplay</li>
                        <li>Generate in-game character responses during your session</li>
                        <li>Prevent spam, abuse, and server overload by rate limiting IP addresses</li>
                        <li>Block IP addresses engaged in malicious activity</li>
                    </ul>
                    <p>
                        We do <strong>not</strong> use your data for advertising, marketing, user profiling,
                        or any purpose beyond running the Game.
                    </p>
                </section>

                <section>
                    <h2>3. Data Retention</h2>
                    <p>
                        We do not permanently store gameplay data. Chat messages and in-game interactions
                        exist only in server memory during your active session and are discarded when the
                        session ends. IP address logs used for spam prevention are retained only as long
                        as necessary to enforce rate limits.
                    </p>
                </section>

                <section>
                    <h2>4. Data Sharing</h2>
                    <p>
                        We do not sell, trade, rent, or share your information with any third parties.
                        Period. Your in-game messages are visible to other players in your game room
                        during active sessions, but are not stored or transmitted elsewhere.
                    </p>
                </section>

                <section>
                    <h2>5. Cookies & Tracking</h2>
                    <p>
                        Got Rizz does <strong>not</strong> use cookies, tracking pixels, or third-party
                        analytics. We may use browser local storage to save basic preferences like
                        display settings. No tracking technologies are used.
                    </p>
                </section>

                <section>
                    <h2>6. Content Warning & Age Considerations</h2>
                    <p>
                        Got Rizz uses uncensored language models that may generate mature content including
                        profanity, sexual themes, and other adult language. The Game is not recommended for
                        players under 18 without adult supervision. We do not knowingly collect personal
                        information from children under 13. If you believe a child has provided personal
                        information, contact us so we can address it.
                    </p>
                </section>

                <section>
                    <h2>7. Security</h2>
                    <p>
                        We take reasonable measures to protect the limited data involved in gameplay.
                        However, no method of internet transmission is 100% secure. Since we collect
                        minimal data and do not store it long-term, the risk to your personal information
                        is inherently low.
                    </p>
                </section>

                <section>
                    <h2>8. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. Any changes will be posted on
                        this page with an updated revision date. Continued use of the Game after changes
                        constitutes acceptance of the revised policy.
                    </p>
                </section>

                <section>
                    <h2>9. Contact Us</h2>
                    <p>
                        If you have questions or concerns about this Privacy Policy, contact us at{" "}
                        <a href="mailto:taborgreat@gmail.com">taborgreat@gmail.com</a>.
                    </p>
                    <p>
                        Got Rizz<br />
                        Portland, Oregon, USA
                    </p>
                </section>
            </div>

            <footer className="legal-footer">
                <Link to="/">Back to Game</Link>
                <span className="legal-footer-divider">|</span>
                <Link to="/terms">Terms of Service</Link>
            </footer>
        </div>
    );
}
