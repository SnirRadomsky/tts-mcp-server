# TTS MCP Server

A Text-to-Speech MCP (Model Context Protocol) Server for Claude Desktop with ElevenLabs v3 support and custom voice integration.

## 🚀 Features

- **ElevenLabs v3 Integration**: Most advanced TTS model with superior quality
- **Custom Voice Support**: Pre-configured with custom Hebrew voice
- **Audio Tags**: Express emotions and speech styles with special tags
- **Multi-TTS Support**: System TTS, Google TTS, eSpeak, and ElevenLabs
- **Multilingual**: Supports 70+ languages including Hebrew
- **MCP Integration**: Seamless integration with Claude Desktop

## 🎭 Audio Tags for Expressive Speech

ElevenLabs v3 supports special audio tags for more natural speech:

### Emotions:
- `[excited]` - Excited delivery
- `[sad]` - Sad, melancholy tone
- `[angry]` - Angry, frustrated tone
- `[happy]` - Happy, cheerful tone
- `[nervous]` - Nervous, anxious tone

### Speech Styles:
- `[whispers]` - Whispered speech
- `[shouting]` - Loud delivery
- `[sighs]` - Add sighs to speech
- `[laughs]` - Natural laughter
- `[pause]` - Natural pause

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SnirRadomsky/tts-mcp-server.git
   cd tts-mcp-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your ElevenLabs API key
   ```

4. **Add to Claude Desktop config:**
   
   Add to your Claude Desktop `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "tts": {
         "command": "node",
         "args": ["/path/to/tts-mcp-server/index.js"]
       }
     }
   }
   ```

## 🎯 Usage Examples

### Basic Usage:
```
"Use ElevenLabs to speak: Hello, this is my custom voice!"
```

### With Emotions:
```
"Use ElevenLabs to speak: [excited] Hello everyone! [pause] This is amazing!"
```

### Hebrew with Expression:
```
"Use ElevenLabs to speak: [happy] שלום, איך שלומך? [sighs] זה באמת נהדר!"
```

### Storytelling:
```
"Use ElevenLabs to speak: [whispers] Once upon a time... [pause] [excited] there was a magical kingdom!"
```

## 🛠️ Available TTS Services

| Service | Description | Best For |
|---------|-------------|----------|
| `elevenlabs` | Premium AI voice synthesis | Natural, expressive speech |
| `system` | Built-in system TTS | Quick, offline usage |
| `gtts` | Google Text-to-Speech | Free, good quality |
| `espeak` | Open-source TTS | Lightweight, fast |

## 🔧 Configuration

### Environment Variables

```bash
# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_api_key_here
DEFAULT_VOICE_ID=NxntAy2oHYkBlK5VbKgU

# Voice Settings
VOICE_STABILITY=0.5      # Voice consistency (0.0-1.0)
VOICE_SIMILARITY=0.5     # Voice similarity (0.0-1.0)  
VOICE_STYLE=0.0          # Voice style exaggeration (0.0-1.0)
USE_SPEAKER_BOOST=true   # Enhance speaker clarity
```

### Available Models

- `eleven_v3` (default) - Most expressive, highest quality
- `eleven_multilingual_v2` - Stable multilingual support
- `eleven_flash_v2_5` - Fast, low latency
- `eleven_turbo_v2_5` - Balanced quality and speed

## 📋 API Reference

### Tools Available

#### `speak_text`
Convert text to speech using various TTS services.

**Parameters:**
- `text` (string, required): Text to convert to speech
- `service` (string, optional): TTS service (`elevenlabs`, `system`, `gtts`, `espeak`)
- `voice` (string, optional): Voice to use
- `model` (string, optional): ElevenLabs model to use
- `rate` (number, optional): Speech rate (0.1-2.0)

#### `list_voices`
List available voices on the system.

## 🌟 Features of ElevenLabs v3

- **10,000 Character Limit**: Support for longer text
- **70+ Languages**: Including Hebrew, Arabic, and more
- **Advanced Emotions**: Natural emotional expression
- **Audio Tags**: Special tags for expressive speech
- **Custom Voice**: Pre-configured with your personal voice

## 🚀 Getting Started

1. **Test Basic Functionality:**
   ```
   "Use ElevenLabs to speak: Hello, this is a test!"
   ```

2. **Try Audio Tags:**
   ```
   "Use ElevenLabs to speak: [excited] This is amazing!"
   ```

3. **Test Hebrew:**
   ```
   "Use ElevenLabs to speak: שלום עולם!"
   ```

## 🔒 Security

- API keys are stored in environment variables
- `.env` file is excluded from version control
- No sensitive data is logged

## 📝 Development

### Project Structure
```
tts-mcp-server/
├── index.js           # Main MCP server
├── package.json       # Dependencies and scripts
├── .env.example       # Environment template
├── USAGE.md          # Detailed usage guide
└── project-docs/     # Additional documentation
```

### Running in Development
```bash
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the [USAGE.md](./USAGE.md) guide
- Review Claude Desktop MCP documentation
- Open an issue on GitHub

## 🎉 Acknowledgments

- Built with [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)
- Powered by [ElevenLabs](https://elevenlabs.io/) v3 API
- Designed for seamless Claude Desktop integration
