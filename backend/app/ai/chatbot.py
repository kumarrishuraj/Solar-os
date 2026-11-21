"""AI Business Intelligence & Warranty Intelligence Copilot.

Integrates LLM APIs with RAG over equipment warranties, technical datasheets,
and operational database metrics to assist solar operators and sales teams.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Single chat interaction message."""

    role: str = Field(..., description="Message role: 'system', 'user', or 'assistant'")
    content: str = Field(..., description="Text content of the message")


class ChatQueryRequest(BaseModel):
    """Incoming user query to the AI copilot."""

    query: str = Field(..., min_length=1, description="Operator or engineer question")
    session_id: Optional[str] = Field(None, description="Conversation session identifier")
    context_filters: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Metadata filters (e.g., lead_id, inverter_model)"
    )


class ChatQueryResponse(BaseModel):
    """AI copilot answer and retrieved references."""

    answer: str = Field(..., description="LLM generated answer")
    sources: List[str] = Field(default_factory=list, description="Citations to warranty documents or database records")
    suggested_followups: List[str] = Field(default_factory=list, description="Suggested next prompts")


class SolarBIChatbot:
    """Conversational assistant for operational insights and warranty document intelligence."""

    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-1.5-flash"):
        """Initialize chatbot with provider API key and model identifier."""
        self.api_key = api_key
        self.model_name = model_name

    def ask(self, request: ChatQueryRequest) -> ChatQueryResponse:
        """Process conversational query using RAG and LLM completion.

        Args:
            request: ChatQueryRequest containing user query and optional context.

        Returns:
            ChatQueryResponse with formatted answer and citations.
        """
        # Placeholder: Connect to LLM provider (OpenAI / Anthropic / Gemini)
        # and vector store retrieval in the subsequent development phase.
        raise NotImplementedError(
            "SolarBIChatbot.ask requires LLM API key and vector RAG store connection."
        )
