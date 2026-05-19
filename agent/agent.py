from __future__ import annotations

import datetime
import logging
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from zoneinfo import ZoneInfo

from dotenv import load_dotenv

# Load .env from the frontend directory (one level up)
load_dotenv(Path(__file__).parent.parent / "frontend" / ".env")

from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    RunContext,
    cli,
    function_tool,
    inference,
)
from livekit.agents.evals import (
    JudgeGroup,
    accuracy_judge,
    coherence_judge,
    conciseness_judge,
    relevancy_judge,
    safety_judge,
    task_completion_judge,
)
from livekit.plugins import silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from livekit.plugins.did import AvatarSession

logger = logging.getLogger("thinkverse-voice-agent")

KNOWLEDGE_PATH = Path(__file__).parent / "knowledge.txt"
KNOWLEDGE = KNOWLEDGE_PATH.read_text(encoding="utf-8") if KNOWLEDGE_PATH.exists() else ""


@dataclass
class Userdata:
    name: str = ""
    email: str = ""
    service_interest: str = ""
    notes: str = ""
    language: str = "en"


class ThinkVerseAgent(Agent):
    def __init__(self, *, timezone: str) -> None:
        self.tz = ZoneInfo(timezone)
        today = datetime.datetime.now(self.tz).strftime("%A, %B %d, %Y")

        super().__init__(
            instructions=(
                f"You are Aria (آريا), a professional bilingual voice assistant for ThinkVerse AI Agency. "
                f"Today is {today}. "
                "This is a voice conversation — speak naturally, clearly, and concisely. "
                "Keep responses short and conversational; avoid reading long lists unless asked.\n\n"
                "LANGUAGE DETECTION — CRITICAL:\n"
                "- Listen carefully to the visitor's first message.\n"
                "- If they speak Arabic, respond ENTIRELY in Arabic for the rest of the conversation.\n"
                "- If they speak English, respond ENTIRELY in English for the rest of the conversation.\n"
                "- Never mix languages unless the visitor switches first.\n"
                "- If unclear, default to English.\n\n"
                "YOUR ROLE:\n"
                "Help website visitors learn about ThinkVerse AI's services and guide interested visitors "
                "to book a consultation. You can answer questions about any service, explain what each "
                "solution does, and collect a visitor's name, email, and service interest so the team "
                "can follow up.\n\n"
                "KNOWLEDGE BASE:\n"
                f"{KNOWLEDGE}\n\n"
                "GUIDELINES:\n"
                "- Be warm, professional, and tech-forward.\n"
                "- If asked about pricing, explain that all pricing is custom and offer to log their "
                "interest so the team can provide a tailored quote.\n"
                "- If a visitor wants to book a consultation, use the book_consultation tool after "
                "collecting their name, email, and which service they are interested in.\n"
                "- Never fabricate services, prices, or capabilities not in the knowledge base."
            )
        )

    async def on_enter(self) -> None:
        await self.session.say(
            "Hi there! I'm Aria, ThinkVerse AI's virtual assistant. "
            "I can tell you about our AI services or help you book a consultation. "
            "What brings you here today? "
            "أهلاً! أنا آريا، المساعدة الافتراضية لـ ThinkVerse AI. كيف أستطيع مساعدتك اليوم؟"
        )

    @function_tool
    async def book_consultation(
        self,
        ctx: RunContext[Userdata],
        name: str,
        email: str,
        service_interest: str,
        notes: str = "",
    ) -> str:
        """
        Log a consultation request from an interested visitor.

        Args:
            name: The visitor's full name.
            email: The visitor's email address.
            service_interest: The service they are interested in (e.g. 'Voice Agents', 'RAG Agents').
            notes: Any additional details or questions they mentioned.
        """
        ctx.userdata.name = name
        ctx.userdata.email = email
        ctx.userdata.service_interest = service_interest
        ctx.userdata.notes = notes

        return (
            f"Consultation request logged for {name}. "
            f"The ThinkVerse AI team will reach out to {email} within 24 hours "
            f"to discuss {service_interest}. "
            "Is there anything else I can help you with?"
        )


server = AgentServer()


async def on_session_end(ctx: JobContext) -> None:
    report = ctx.make_session_report()

    chat = report.chat_history.copy(exclude_function_call=True, exclude_instructions=True)
    if len(chat.items) < 3:
        return

    judges = JudgeGroup(
        llm="openai/gpt-4o-mini",
        judges=[
            task_completion_judge(),
            accuracy_judge(),
            safety_judge(),
            relevancy_judge(),
            coherence_judge(),
            conciseness_judge(),
        ],
    )

    await judges.evaluate(report.chat_history)

    userdata = ctx.primary_session.userdata
    if userdata.email:
        ctx.tagger.success()
    else:
        ctx.tagger.fail(reason="Visitor did not book a consultation")

    logger.info("session tags: %s", ctx.tagger.tags)


@server.rtc_session(on_session_end=on_session_end)
async def thinkverse_agent(ctx: JobContext):
    await ctx.connect()

    session = AgentSession[Userdata](
        userdata=Userdata(),
        stt=inference.STT("deepgram/nova-3"),
        llm=inference.LLM("openai/gpt-4o-mini"),
        tts=inference.TTS("cartesia/sonic-3", voice="156fb8d2-335b-4950-9cb3-a2d33befec77"),
        turn_detection=MultilingualModel(),
        vad=silero.VAD.load(),
        max_tool_steps=1,
    )

    avatar = AvatarSession(
        agent_id=os.environ["DID_PRESENTER_ID"],
        api_key=os.environ["DID_API_KEY"],
    )
    await avatar.start(session, room=ctx.room)

    await session.start(agent=ThinkVerseAgent(timezone="utc"), room=ctx.room)


if __name__ == "__main__":
    cli.run_app(server)
