import struct
import base64
import logging
from typing import Optional
import google.generativeai as genai

logger = logging.getLogger("ai_agent_voice")

def generate_gemini_tts(text: str, voice_gender: str, api_key: str, lang: str = "es") -> Optional[str]:
    """
    Realiza una llamada single-turn a Gemini 3.1 Flash TTS para sintetizar texto
    en un flujo de audio l16 / WAV altamente realista con el acento del idioma seleccionado.
    """
    try:
        genai.configure(api_key=api_key)
        voice_name = "Algieba" if voice_gender == "male" else "Zephyr"

        generation_config = {
            "response_modalities": ["TEXT", "AUDIO"],
            "speech_config": {
                "voice_config": {
                    "prebuilt_voice_config": {
                        "voice_name": voice_name
                    }
                }
            }
        }
        
        model_voice = genai.GenerativeModel(
            model_name="gemini-3.1-flash-tts-preview",
            generation_config=generation_config
        )

        # Configuración dinámica de perfiles e instrucciones según el idioma del cliente
        gender_str = 'male' if voice_gender == 'male' else 'female'
        lang_lower = str(lang).lower().strip()

        if "fr" in lang_lower:
            audio_profile = (
                f"A highly professional, elegant, elite, and energetic native speaker from Paris, France. "
                f"Speaks fluent, natural, and highly sophisticated French with perfect Parisian accentuation and rhythm. "
                f"The voice gender is {gender_str}."
            )
            directors_note = (
                f"Deliver this script with a crisp, clear, and energetic native French accent (clean Parisian pronunciation). "
                f"Speak very dynamically at a fast, fluent, active, and agile pace. Keep the delivery concise, lively, and highly convincing, avoiding any slow speech, artificial pauses, or sluggishness. "
                f"Execute all formatting brackets like [fast] or [with enthusiasm] with vocal energy."
            )
        elif "en" in lang_lower:
            audio_profile = (
                f"A highly professional, elegant, elite, and energetic native speaker from the United Kingdom (British RP) or the United States (Standard American English). "
                f"Speaks fluent, clear, and highly sophisticated English. "
                f"The voice gender is {gender_str}."
            )
            directors_note = (
                f"Deliver this script with a crisp, clear, and energetic native English accent (no thick regional slang, elegant and clean tone). "
                f"Speak very dynamically at a fast, fluent, active, and agile pace. Keep the delivery concise, lively, and highly convincing, avoiding any slow speech, artificial pauses, or sluggishness. "
                f"Execute all formatting brackets like [fast] or [with enthusiasm] with vocal energy."
            )
        else:
            # Por defecto: Español de España (Castellano de Madrid)
            audio_profile = (
                f"A highly professional, elegant, elite, and energetic native speaker from Madrid, Spain. "
                f"Uses an authentic Peninsular Spanish accent with absolute naturalness, clarity, and sophistication. "
                f"The voice gender is {gender_str}."
            )
            directors_note = (
                f"Deliver this script with a crisp, clear, and energetic Peninsular Castilian accent (no seseo, clear distinction, genuine Madrid cadence). "
                f"Speak very dynamically at a fast, fluent, active, and agile pace. Keep the delivery concise, lively, and highly convincing, avoiding any slow speech, artificial pauses, or sluggishness. "
                f"Execute all formatting brackets like [fast] or [with enthusiasm] with vocal energy."
            )

        prompt_voice = (
            f"[Audio Profile]\n"
            f"{audio_profile}\n\n"
            f"[Scene]\n"
            f"A premium, fast-paced, high-end medical-aesthetic clinic. The atmosphere is warm, positive, dynamic, and prestigious.\n\n"
            f"[Director's Note]\n"
            f"{directors_note}\n\n"
            f"[Transcript]\n"
            f"{text}"
        )

        response_voice = model_voice.generate_content(prompt_voice)

        for candidate in response_voice.candidates:
            content = getattr(candidate, 'content', None)
            parts = getattr(content, 'parts', []) if content else []
            for part in parts:
                inline_data = getattr(part, 'inline_data', None)
                if inline_data:
                    mime_type = getattr(inline_data, 'mime_type', None)
                    data_bytes = getattr(inline_data, 'data', None)
                    if mime_type and data_bytes and mime_type.startswith("audio/"):
                        audio_bytes = data_bytes
                        if "rate=24000" in mime_type or "l16" in mime_type or len(audio_bytes) > 1000:
                            # WAV header (44 bytes) for 24000Hz, 16-bit, Mono PCM
                            channels = 1
                            bit_depth = 16
                            sample_rate = 24000
                            header = b'RIFF'
                            header += struct.pack('<I', 36 + len(audio_bytes))
                            header += b'WAVEfmt '
                            header += struct.pack('<I', 16)
                            header += struct.pack('<H', 1)
                            header += struct.pack('<H', channels)
                            header += struct.pack('<I', sample_rate)
                            header += struct.pack('<I', sample_rate * channels * (bit_depth // 8))
                            header += struct.pack('<H', channels * (bit_depth // 8))
                            header += struct.pack('<H', bit_depth)
                            header += b'data'
                            header += struct.pack('<I', len(audio_bytes))
                            audio_bytes = header + audio_bytes
                        return base64.b64encode(audio_bytes).decode("utf-8")
        return None
    except Exception as e:
        logger.error(f"Error generando TTS: {e}")
        return None
