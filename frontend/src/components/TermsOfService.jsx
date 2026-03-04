import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./LegalPage.css";

export default function TermsOfService() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="legal-page">
            <header className="legal-header">
                <Link to="/" className="legal-back">GOT RIZZ</Link>
            </header>

            <div className="legal-content">
                <h1>Terms of Service</h1>
                <p className="legal-updated">Last updated: March 3, 2026</p>

                <section>
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or playing Got Rizz ("the Game"), you agree to be bound by these
                        Terms of Service. If you do not agree to these terms, do not use the Game.
                    </p>
                </section>

                <section>
                    <h2>2. Age Disclaimer & Content Warning</h2>
                    <p>
                        Got Rizz uses uncensored language models to generate in-game character dialogue.
                        The content produced during gameplay may include mature language, sexual themes,
                        profanity, or other adult content. This Game is <strong>not recommended for players
                        under 18 without adult supervision</strong>.
                    </p>
                    <p>
                        By using the Game, you acknowledge that you are at least 18 years old, or that you
                        are playing under the direct supervision of a parent or legal guardian who has
                        reviewed and accepted these terms on your behalf.
                    </p>
                </section>

                <section>
                    <h2>3. Account & Player Conduct</h2>
                    <p>
                        You are responsible for any content you submit during gameplay, including chat
                        messages and in-game text. You agree not to:
                    </p>
                    <ul>
                        <li>Use the Game for any illegal purpose</li>
                        <li>Harass, threaten, or abuse other players</li>
                        <li>Attempt to exploit, hack, or disrupt the Game or its servers</li>
                        <li>Impersonate other players or staff</li>
                        <li>Share personal information of others without consent</li>
                    </ul>
                    <p>
                        We reserve the right to remove, ban, or restrict any player who violates these
                        rules at our sole discretion.
                    </p>
                </section>

                <section>
                    <h2>4. Game Content & Disclaimer</h2>
                    <p>
                        Got Rizz uses uncensored language models to generate character dialogue and
                        interactions in real time. The content produced during gameplay is entirely
                        unpredictable and may include profanity, sexual language, controversial opinions,
                        or other mature content. This content does not reflect the views, beliefs, or
                        endorsements of Got Rizz or its team.
                    </p>
                    <p>
                        Got Rizz is <strong>not responsible</strong> for any content generated during
                        gameplay. We do not moderate, pre-screen, or filter generated dialogue. You
                        play at your own risk and acknowledge that the Game may produce content that
                        is offensive, inappropriate, or inaccurate. By using the Game, you waive any
                        claims against Got Rizz related to generated content.
                    </p>
                </section>

                <section>
                    <h2>5. Intellectual Property</h2>
                    <p>
                        All game assets, code, artwork, character designs, and branding associated with
                        Got Rizz are the property of Got Rizz. You may not copy, distribute, modify, or
                        create derivative works from any part of the Game without written permission.
                    </p>
                </section>

                <section>
                    <h2>6. Disclaimer of Warranties</h2>
                    <p>
                        The Game is provided "as is" and "as available" without warranties of any kind,
                        express or implied. We do not guarantee that the Game will be uninterrupted,
                        error-free, or free of harmful components.
                    </p>
                </section>

                <section>
                    <h2>7. Limitation of Liability</h2>
                    <p>
                        To the fullest extent permitted by law, Got Rizz shall not be liable for any
                        indirect, incidental, special, consequential, or punitive damages arising from
                        your use of the Game, including but not limited to loss of data or interruption
                        of service.
                    </p>
                </section>

                <section>
                    <h2>8. Changes to Terms</h2>
                    <p>
                        We may update these Terms of Service at any time. Continued use of the Game
                        after changes are posted constitutes acceptance of the updated terms. We
                        encourage you to review this page periodically.
                    </p>
                </section>

                <section>
                    <h2>9. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of the
                        State of Oregon, United States. Any disputes arising from these Terms or your use
                        of the Game shall be resolved in the courts located in Portland, Oregon.
                    </p>
                </section>

                <section>
                    <h2>10. Contact</h2>
                    <p>
                        If you have questions about these Terms, contact us at{" "}
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
                <Link to="/privacy">Privacy Policy</Link>
            </footer>
        </div>
    );
}
