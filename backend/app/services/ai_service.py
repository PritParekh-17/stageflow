import os
import json
import logging
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger("stageflow.ai_service")

class AIService:
    @staticmethod
    async def _call_llm(prompt: str, system_prompt: str) -> Optional[str]:
        """
        Attempts to call Gemini API if GEMINI_API_KEY is available, or OpenAI if configured.
        Returns None if not configured or on network failure, triggering contextual fallback.
        """
        if settings.GEMINI_API_KEY:
            try:
                # Gemini REST call
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [{
                        "parts": [{"text": f"{system_prompt}\n\n{prompt}"}]
                    }],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 800
                    }
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return text.strip()
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}. Falling back to domain generator.")

        if settings.OPENAI_API_KEY:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
                payload = {
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 800
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"].strip()
            except Exception as e:
                logger.warning(f"OpenAI call failed: {e}. Falling back to domain generator.")

        return None

    @classmethod
    async def generate_opening(
        cls,
        event_name: str,
        venue: str,
        description: str,
        tone: str = "Professional",
        custom_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        system_prompt = (
            "You are an elite live event emcee and stage operations director. "
            "Write an engaging, high-energy stage script for an anchor opening an event. "
            "Include stage cues in brackets like [PAUSE FOR APPLAUSE], [SMILE], [CONFIDENT STANCE]."
        )
        user_prompt = (
            f"Event: {event_name}\n"
            f"Venue: {venue}\n"
            f"Description: {description}\n"
            f"Tone: {tone}\n"
            f"Notes: {custom_notes or 'Welcome dignitaries, students, mentors, and hackers.'}\n"
            "Format the speech with 3 bullet talking points first, then the verbatim anchor script."
        )

        llm_result = await cls._call_llm(user_prompt, system_prompt)
        if llm_result:
            return {
                "title": f"Opening Ceremony Speech — {event_name}",
                "script_type": "OPENING",
                "content": llm_result,
                "tone": tone,
                "talking_points": [
                    f"Welcome all participants, mentors, and jury to {event_name}",
                    f"Highlight the spirit of innovation at {venue}",
                    "Set high energy expectations for the hackathon journey ahead"
                ],
                "estimated_reading_time_seconds": 65
            }

        # High-Fidelity Domain Fallback
        content = (
            f"\"Good morning, visionaries, innovators, and distinguished guests! [WARM SMILE, CONFIDENT STANCE]\n\n"
            f"Welcome to {event_name}, live from {venue}! [PAUSE FOR APPLAUSE]\n\n"
            f"Today, some of the sharpest minds have gathered under one roof with a single mission: to build solutions "
            f"that push the boundaries of technology and impact the real world. Over the course of this event, "
            f"code will turn into products, ideas into prototypes, and challenges into breakthroughs.\n\n"
            f"[GESTURE TOWARDS THE AUDIENCE]\n"
            f"To every hacker, mentor, and organizer here: your journey starts now. Keep your energy high, "
            f"your curiosity sharp, and let’s make {event_name} an unforgettable milestone!\n\n"
            f"Without further ado, let’s inaugurate this spectacular stage!\" [LEAD APPLAUSE]"
        )

        return {
            "title": f"Opening Address — {event_name}",
            "script_type": "OPENING",
            "content": content,
            "tone": tone,
            "talking_points": [
                f"Heartfelt welcome to all attendees at {venue}",
                f"Mission & impact of {event_name}",
                "Inspirational call to build fearless prototypes"
            ],
            "estimated_reading_time_seconds": 60
        }

    @classmethod
    async def generate_introduction(
        cls,
        speaker_name: str,
        designation: str,
        organization: str,
        bio: str,
        session_title: str,
        tone: str = "Inspiring"
    ) -> Dict[str, Any]:
        system_prompt = (
            "You are a master of ceremonies introducing a keynote speaker. "
            "Write a charismatic, respectful, and energizing introduction. "
            "Include stage directions in brackets."
        )
        user_prompt = (
            f"Speaker: {speaker_name}\n"
            f"Role: {designation} at {organization}\n"
            f"Session: {session_title}\n"
            f"Bio: {bio}\n"
            f"Tone: {tone}\n"
            "Provide key accomplishments and invite them to take the stage."
        )

        llm_result = await cls._call_llm(user_prompt, system_prompt)
        if llm_result:
            return {
                "title": f"Speaker Introduction: {speaker_name}",
                "script_type": "INTRODUCTION",
                "content": llm_result,
                "tone": tone,
                "talking_points": [
                    f"Introduce {speaker_name}'s leadership at {organization}",
                    f"Frame the relevance of '{session_title}'",
                    "Guide the audience into a standing applause"
                ],
                "estimated_reading_time_seconds": 45
            }

        content = (
            f"\"Ladies and gentlemen, moving into our next segment, we are profoundly privileged to have a true pioneer with us today.\n\n"
            f"Serving as {designation} at {organization}, our next speaker has been at the forefront of technological excellence and innovation. "
            f"{bio if bio else 'With deep industry experience and impactful leadership, they continue to inspire builders across the nation.'}\n\n"
            f"Today, they will be taking the stage for: '{session_title}'. [LOOK TOWARDS ENTRANCE WINGS]\n\n"
            f"Please join your hands together and give a resounding, energetic welcome to {speaker_name}!\" [EXTEND ARM TO STAGE, APPLAUD]"
        )

        return {
            "title": f"Introducing {speaker_name} — {session_title}",
            "script_type": "INTRODUCTION",
            "content": content,
            "tone": tone,
            "talking_points": [
                f"{speaker_name}'s background at {organization}",
                f"Core theme of '{session_title}'",
                "Warm audience invitation to the stage"
            ],
            "estimated_reading_time_seconds": 45
        }

    @classmethod
    async def generate_transition(
        cls,
        completed_title: str,
        completed_speaker: Optional[str],
        next_title: str,
        next_speaker: Optional[str],
        tone: str = "Smooth & Professional"
    ) -> Dict[str, Any]:
        system_prompt = (
            "You are a professional stage anchor transitioning between two live sessions. "
            "Gracefully summarize appreciation for the completed talk and build anticipation for the next one."
        )
        user_prompt = (
            f"Just Finished: {completed_title} (by {completed_speaker or 'the stage team'})\n"
            f"Starting Next: {next_title} (with {next_speaker or 'our upcoming leads'})\n"
            f"Tone: {tone}\n"
            "Create a seamless 30-45 second verbal bridge."
        )

        llm_result = await cls._call_llm(user_prompt, system_prompt)
        if llm_result:
            return {
                "title": f"Stage Transition: {completed_title} ➔ {next_title}",
                "script_type": "TRANSITION",
                "content": llm_result,
                "tone": tone,
                "talking_points": [
                    f"Acknowledge insights from {completed_title}",
                    f"Bridge topic towards {next_title}",
                    "Direct room focus to the incoming presenter"
                ],
                "estimated_reading_time_seconds": 35
            }

        content = (
            f"\"What an incredible and insightful session on '{completed_title}'! [CLAP]\n"
            f"Let's give one more huge round of appreciation to {completed_speaker or 'our speaker'} for those invaluable takeaways.\n\n"
            f"[SMOOTH SHIFT IN TONE, STEP FORWARD]\n"
            f"And the momentum doesn’t stop here. As we transition to our next critical milestone, "
            f"we dive straight into '{next_title}'"
            + (f" led by {next_speaker}." if next_speaker else ".")
            + f"\n\nMake sure your notebooks are ready and your questions primed. Let's welcome our next session to the main stage!\""
        )

        return {
            "title": f"Transition: {completed_title} ➔ {next_title}",
            "script_type": "TRANSITION",
            "content": content,
            "tone": tone,
            "talking_points": [
                f"Hearty thanks for {completed_title}",
                "Natural thematic bridge to the next segment",
                f"Introduce {next_title}"
            ],
            "estimated_reading_time_seconds": 35
        }

    @classmethod
    async def generate_closing(
        cls,
        event_name: str,
        venue: str,
        sponsor_mentions: Optional[str] = None,
        next_steps: Optional[str] = None,
        tone: str = "Grand & Memorable"
    ) -> Dict[str, Any]:
        content = (
            f"\"What a phenomenal day of passion, code, and camaraderie here at {event_name}! [APPLAUSE]\n\n"
            f"Every single team presented groundbreaking ideas, proving that the future of technology is being shaped right here at {venue}.\n\n"
            f"A heartfelt thank you to our visionary mentors, esteemed jury members, and our generous partners"
            + (f" including {sponsor_mentions}" if sponsor_mentions else "")
            + f" who made this grand stage possible.\n\n"
            f"[PAUSE, DELIBERATE CADENCE]\n"
            f"Remember: whether your name is called for the podium today or not, the projects you began here are seeds of tomorrow’s startups. "
            f"{next_steps or 'Stay connected, keep building, and continue to innovate.'}\n\n"
            f"Thank you all for being a part of {event_name}. Have a safe journey home and keep the fire alive! Goodnight!\" [FINAL BOW, OUTRO MUSIC CUE]"
        )

        return {
            "title": f"Grand Closing Address — {event_name}",
            "script_type": "CLOSING",
            "content": content,
            "tone": tone,
            "talking_points": [
                "Celebrate all participants and teams",
                "Gratitude to mentors, jury, and organizers",
                "Inspiring closing call to action"
            ],
            "estimated_reading_time_seconds": 55
        }

    @classmethod
    async def generate_announcement(
        cls,
        event_name: str,
        announcement_type: str,
        details: Optional[str] = None,
        delay_minutes: Optional[int] = None,
        tone: str = "Calm & Authoritative"
    ) -> Dict[str, Any]:
        if announcement_type == "DELAY":
            mins = delay_minutes or 10
            content = (
                f"\"Attention please, ladies and gentlemen. [ATTENTION CHIME CUE]\n\n"
                f"We have a brief operational update regarding our stage timeline. "
                f"To accommodate thorough technical briefings and ensure all teams have optimal prep time, "
                f"our upcoming schedule is shifting by approximately {mins} minutes"
                + (f" ({details})." if details else ".")
                + f"\n\nWe encourage you to take this opportunity to refine your ideas and grab refreshments. "
                f"Our next session will commence promptly at the updated time. "
                f"Thank you for your understanding and cooperation!\""
            )
            title = f"Schedule Adjustment Announcement (+{mins} Min)"
        elif announcement_type == "TECHNICAL":
            content = (
                f"\"Pardon the brief interruption, everyone. [CALM, REASSURING TONE]\n\n"
                f"Our backstage AV engineers are quickly optimizing the presentation audio and display feed. "
                f"We will be back live in just two minutes. Please remain seated and enjoy the ambient track. "
                f"Thank you for your patience!\""
            )
            title = "Technical Calibration Stage Notice"
        elif announcement_type == "BREAK":
            content = (
                f"\"Alright everyone, time to recharge! [UPBEAT, ENERGETIC]\n\n"
                f"We are now entering our scheduled break. Head over to the dining hall for refreshments and networking. "
                f"Please ensure you are back at your stations exactly 10 minutes before the clock runs out. "
                f"Enjoy your break!\""
            )
            title = "Break & Refreshment Announcement"
        elif announcement_type == "EMERGENCY":
            content = (
                f"\"May I have everyone’s absolute attention, please. [SERIOUS, DIRECT TONE]\n\n"
                f"{details or 'Please pause all activities and follow the instructions of our volunteer coordinators. Kindly exit calmly through the marked emergency exits on both wings. Do not use elevators.'}\n\n"
                f"Your safety is our paramount priority. Please remain calm and proceed in an orderly fashion.\""
            )
            title = "Priority Stage Safety Announcement"
        else:
            content = (
                f"\"Important announcement for all participants: [CLEAR VOICE]\n\n"
                f"{details or 'Please note the latest operational updates displayed on the main monitors. Our coordinators are circulating to answer any queries.'}\n\n"
                f"Thank you for your attention!\""
            )
            title = f"Stage Announcement: {announcement_type.capitalize()}"

        return {
            "title": title,
            "script_type": "ANNOUNCEMENT",
            "content": content,
            "tone": tone,
            "talking_points": [
                f"Deliver key notice: {announcement_type}",
                f"Provide actionable instructions to attendees",
                "Maintain professional stage composure"
            ],
            "estimated_reading_time_seconds": 35
        }

    @classmethod
    def refine_script(cls, content: str, instruction: str) -> Dict[str, Any]:
        """
        Refines script tone or length locally or via LLM.
        """
        cleaned = content.strip()
        if instruction == "shorten":
            lines = [l for l in cleaned.split("\n") if l.strip() and not l.startswith("[")]
            shortened = " ".join(lines[:3])
            refined_content = f"\"Attention everyone: {shortened} Thank you!\""
            tone = "Concise"
        elif instruction == "formal":
            refined_content = (
                "\"Distinguished delegates, esteemed guests, and colleagues:\n\n"
                f"{cleaned.replace('Hey everyone', 'Distinguished guests').replace('guys', 'participants')}\n\n"
                "We sincerely appreciate your gracious cooperation and attendance.\""
            )
            tone = "Formal & Dignified"
        elif instruction == "energetic":
            refined_content = (
                "\"What’s up, builders and creators! [HIGH ENERGY, HANDS UP]\n\n"
                f"{cleaned}\n\n"
                "Let’s turn the energy all the way up and make noise for this stage!\" [LEAD APPLAUSE]"
            )
            tone = "High Energy"
        else:
            refined_content = cleaned
            tone = "Standard"

        return {
            "title": "Refined Script",
            "script_type": "REFINED",
            "content": refined_content,
            "tone": tone,
            "talking_points": ["Refined according to instruction: " + instruction],
            "estimated_reading_time_seconds": 30
        }
