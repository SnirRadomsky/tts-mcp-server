#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

class TTSServer {
  constructor() {
    this.server = new Server(
      {
        name: 'tts-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }
  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'speak_text',
          description: 'Convert text to speech using system TTS or free online services',
          inputSchema: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'The text to convert to speech. For ElevenLabs v3, you can use audio tags like [whispers], [sighs], [laughs], [excited] for more expressive speech.',
              },
              voice: {
                type: 'string',
                description: 'Voice to use (system dependent)',
                default: 'default',
              },
              rate: {
                type: 'number',
                description: 'Speech rate (0.1 to 2.0)',
                default: 1.0,
              },
              service: {
                type: 'string',
                description: 'TTS service to use: system, gtts, espeak, or elevenlabs',
                enum: ['system', 'gtts', 'espeak', 'elevenlabs'],
                default: 'system',
              },
              model: {
                type: 'string',
                description: 'ElevenLabs model to use (only for elevenlabs service)',
                enum: ['eleven_v3', 'eleven_multilingual_v2', 'eleven_flash_v2_5', 'eleven_turbo_v2_5'],
                default: 'eleven_v3',
              },
            },
            required: ['text'],
          },
        },        {
          name: 'list_voices',
          description: 'List available voices on the system',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'speak_text':
          return await this.speakText(request.params.arguments);
        case 'list_voices':
          return await this.listVoices();
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }
  async speakText(args) {
    const { text, voice = 'default', rate = 1.0, service = 'system', model = 'eleven_v3' } = args;
    
    if (!text) {
      throw new Error('Text is required');
    }

    try {
      switch (service) {
        case 'system':
          return await this.useSystemTTS(text, voice, rate);
        case 'gtts':
          return await this.useGTTS(text);
        case 'espeak':
          return await this.useEspeak(text, voice, rate);
        case 'elevenlabs':
          return await this.useElevenLabs(text, voice, rate, model);
        default:
          throw new Error(`Unknown service: ${service}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  }
  async useSystemTTS(text, voice, rate) {
    const platform = process.platform;
    let command;

    switch (platform) {
      case 'darwin': // macOS
        command = `say -r ${rate * 200} "${text.replace(/"/g, '\\"')}"`;
        if (voice !== 'default') {
          command = `say -v "${voice}" -r ${rate * 200} "${text.replace(/"/g, '\\"')}"`;
        }
        break;
      case 'win32': // Windows
        command = `powershell -Command "Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Rate = ${Math.round((rate - 1) * 10)}; $speak.Speak('${text.replace(/'/g, "''")}');"`;
        break;
      case 'linux': // Linux
        command = `espeak "${text.replace(/"/g, '\\"')}" -s ${Math.round(rate * 175)}`;
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    const { stdout, stderr } = await execAsync(command);
    
    return {
      content: [
        {
          type: 'text',
          text: `Successfully spoke: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
        },
      ],
    };
  }
  async useGTTS(text) {
    // This would require the gtts package or API call
    // For now, we'll show how to install and use it
    try {
      const { stdout, stderr } = await execAsync(`python3 -c "
import gtts
import os
import pygame
import io

tts = gtts.gTTS(text='${text.replace(/'/g, "\\'")}', lang='en')
fp = io.BytesIO()
tts.write_to_fp(fp)
fp.seek(0)

pygame.mixer.init()
pygame.mixer.music.load(fp)
pygame.mixer.music.play()

while pygame.mixer.music.get_busy():
    pass
"`);
      
      return {
        content: [
          {
            type: 'text',
            text: `Successfully spoke with Google TTS: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Google TTS not available. Install with: pip install gtts pygame\nError: ${error.message}`,
          },
        ],
      };
    }
  }
  async useEspeak(text, voice, rate) {
    let command = `espeak "${text.replace(/"/g, '\\"')}" -s ${Math.round(rate * 175)}`;
    
    if (voice !== 'default') {
      command += ` -v ${voice}`;
    }

    const { stdout, stderr } = await execAsync(command);
    
    return {
      content: [
        {
          type: 'text',
          text: `Successfully spoke with espeak: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
        },
      ],
    };
  }

  async useElevenLabs(text, voice, rate, model = 'eleven_v3') {
    // ElevenLabs API configuration
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const DEFAULT_VOICE_ID = 'NxntAy2oHYkBlK5VbKgU'; // User's custom voice
    
    if (!ELEVENLABS_API_KEY) {
      return {
        content: [
          {
            type: 'text',
            text: 'ElevenLabs API key not found. Please set ELEVENLABS_API_KEY environment variable.',
          },
        ],
      };
    }

    // Use custom voice ID if provided, otherwise use default
    const voiceId = voice !== 'default' ? voice : DEFAULT_VOICE_ID;
    
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    const requestData = {
      text: text,
      model_id: model,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.0,
        use_speaker_boost: true
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioData = new Uint8Array(audioBuffer);
      
      // Save audio to temporary file and play it
      const tempFile = `/tmp/elevenlabs_audio_${Date.now()}.mp3`;
      await fs.promises.writeFile(tempFile, audioData);
      
      // Play the audio file
      const platform = process.platform;
      let playCommand;
      
      switch (platform) {
        case 'darwin': // macOS
          playCommand = `afplay "${tempFile}"`;
          break;
        case 'linux':
          playCommand = `mpg123 "${tempFile}"`;
          break;
        case 'win32':
          playCommand = `powershell -c "(New-Object Media.SoundPlayer '${tempFile}').PlaySync();"`;
          break;
        default:
          throw new Error(`Unsupported platform for audio playback: ${platform}`);
      }
      
      await execAsync(playCommand);
      
      // Clean up temporary file
      await fs.promises.unlink(tempFile);
      
      return {
        content: [
          {
            type: 'text',
            text: `Successfully spoke with ElevenLabs ${model} (${voiceId}): "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `ElevenLabs TTS error: ${error.message}`,
          },
        ],
      };
    }
  }
  async listVoices() {
    const platform = process.platform;
    let command;
    let voices = [];

    try {
      switch (platform) {
        case 'darwin': // macOS
          command = 'say -v "?"';
          const { stdout } = await execAsync(command);
          voices = stdout.split('\n').filter(line => line.trim()).map(line => {
            const match = line.match(/^(\S+)\s+(.+)/);
            return match ? { name: match[1], description: match[2] } : { name: line.trim(), description: '' };
          });
          break;
        case 'win32': // Windows
          command = 'powershell -Command "Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }"';
          const { stdout: winStdout } = await execAsync(command);
          voices = winStdout.split('\n').filter(line => line.trim()).map(name => ({ name: name.trim(), description: '' }));
          break;
        case 'linux': // Linux
          command = 'espeak --voices';
          const { stdout: linuxStdout } = await execAsync(command);
          voices = linuxStdout.split('\n').slice(1).filter(line => line.trim()).map(line => {
            const parts = line.trim().split(/\s+/);
            return { name: parts[1] || parts[0], description: parts.slice(2).join(' ') };
          });
          break;
        default:
          voices = [{ name: 'default', description: 'Default system voice' }];
      }
    } catch (error) {
      voices = [{ name: 'default', description: 'Default system voice' }];
    }
    return {
      content: [
        {
          type: 'text',
          text: `Available voices:\n${voices.map(v => `• ${v.name}: ${v.description}`).join('\n')}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('TTS MCP server running on stdio');
  }
}

const server = new TTSServer();
server.run().catch(console.error);
