# Voice Features Guide

Your MenoAI app now has full voice interaction capabilities! Users can speak to the AI companion and hear responses read aloud in a warm, compassionate voice.

---

## Features Implemented

### 🎤 Speech-to-Text (Voice Input)
- Click the microphone button to start speaking
- See your words appear in real-time as you speak
- Visual feedback shows when the app is listening
- Automatic transcription to text

### 🔊 Text-to-Speech (Voice Responses)
- AI responses can be read aloud
- Hover over AI messages to reveal the speaker button
- Warm, compassionate voice selected automatically
- Click to start/stop playback

---

## How to Use Voice Features

### Voice Input (Speaking to the AI)

1. **Go to the chat page**: https://studious-orbit-9vvxjj6wqwphpprj-3000.app.github.dev/chat

2. **Look for the microphone icon** in the message input box (right side)

3. **Click the microphone icon** to start listening
   - Icon turns blue/purple when active
   - You'll see "Listening..." with animated waveform
   - Input box shows "Listening... start speaking"

4. **Start speaking**
   - Your words appear in real-time
   - Both interim (gray) and final (black) text shown
   - Speak naturally - the AI understands conversational language

5. **Click the microphone again** to stop listening
   - Or just click "Send" with your transcribed message

6. **Send your message**
   - Click "Send" or press Enter
   - Message is sent just like typing

### Voice Output (Hearing AI Responses)

1. **Wait for AI response** to appear in the chat

2. **Hover over the AI message bubble**
   - A speaker icon appears on the left side
   - Only AI messages have this (not your messages)

3. **Click the speaker icon**
   - AI message starts playing aloud
   - Icon changes to show it's speaking
   - Warm, compassionate female voice

4. **Click again to stop**
   - Or let it finish naturally

---

## Technical Details

### Browser Support

**Speech-to-Text (Voice Input)**
- ✅ Chrome/Edge (Best support)
- ✅ Safari (iOS/macOS)
- ✅ Opera
- ❌ Firefox (not yet supported)

**Text-to-Speech (Voice Output)**
- ✅ Chrome/Edge
- ✅ Safari (iOS/macOS)
- ✅ Firefox
- ✅ Opera

### Privacy & Permissions

**Microphone Access**
- First time you click the microphone, browser asks for permission
- Click "Allow" to enable voice input
- Permission is remembered for future visits
- Can revoke in browser settings anytime

**Data Privacy**
- Voice processing happens in your browser (Web Speech API)
- No audio is sent to external servers for transcription
- Only final text is sent to the backend (same as typing)
- Speech API is provided by your browser (Google for Chrome, Apple for Safari)

### Voice Selection

The app automatically selects a warm, compassionate voice:

**Preferred Voices (in order)**:
1. Samantha (macOS) - Warm, friendly
2. Victoria (macOS) - Professional, kind
3. Karen (macOS) - Gentle
4. Google US English Female (Chrome)
5. Microsoft Zira (Windows)
6. Any available female English voice

### Voice Settings

**Current Settings**:
- **Rate**: 0.95x (slightly slower for compassionate tone)
- **Pitch**: 1.0 (natural)
- **Volume**: 1.0 (full)
- **Language**: en-US (English)

---

## Visual Indicators

### Listening State

When the microphone is active:
```
🔵 Blue microphone icon (inside input box)
🌊 Animated waveform above input
📝 Text appears as you speak
```

### Speaking State

When AI response is playing:
```
🔵 Blue speaker icon (left of message)
⏸️ Click to stop playback
```

---

## Keyboard Shortcuts

- **Enter**: Send message (works with voice or typed text)
- **Shift+Enter**: New line in text input
- **Esc**: (Future) Stop listening/speaking

---

## Use Cases

### Perfect for Voice Interaction

1. **Hands-Free Use**
   - Cook while chatting with the AI
   - Multitask during conversations
   - Accessibility for typing difficulties

2. **Emotional Moments**
   - When typing feels too hard
   - Need immediate verbal support
   - Want to hear a compassionate voice

3. **Privacy**
   - Talk quietly in private spaces
   - Headphones for listening to responses
   - No one hears but you

### Example Conversation

**User** (speaking): "I'm having a really tough day with hot flashes and I just feel so overwhelmed"

**AI** (text + optional voice): "I hear you, and I'm so sorry you're going through this. Hot flashes can be incredibly difficult, especially when they keep coming. You're not alone in feeling overwhelmed - many women describe this exact feeling..."

---

## Troubleshooting

### Voice Input Not Working

**"No microphone icon appears"**
- Browser doesn't support speech recognition
- Try Chrome or Edge browser
- Check browser compatibility

**"Microphone access denied"**
- Browser blocked microphone permission
- Click the lock icon in address bar
- Change microphone permission to "Allow"
- Refresh the page

**"No speech detected"**
- Microphone might not be working
- Check system microphone settings
- Try speaking louder or closer
- Test microphone in system settings

**"Recognition stopped immediately"**
- No speech was detected
- Background noise might be interfering
- Try in a quieter environment

### Voice Output Not Working

**"No speaker icon appears"**
- Text-to-speech not supported (unlikely)
- Refresh the page
- Try different browser

**"No sound when clicking speaker"**
- System volume might be muted
- Check browser volume settings
- Check system audio output
- Try headphones

**"Voice sounds robotic"**
- Normal for some browsers/systems
- Better voices available on macOS/iOS
- Chrome has good voices
- Can improve with browser voice extensions

**"Voice stops mid-sentence"**
- Click speaker icon again to restart
- Browser TTS has limits on very long text
- Refresh if it keeps happening

---

## Files Created

### Frontend

**Voice Input**:
- `packages/frontend/src/hooks/useSpeechRecognition.ts` - Speech recognition hook
- Updated: `packages/frontend/src/components/chat/MessageInput.tsx` - Microphone UI

**Voice Output**:
- `packages/frontend/src/lib/textToSpeech.ts` - Text-to-speech service
- Updated: `packages/frontend/src/components/chat/MessageBubble.tsx` - Speaker button

**Styling**:
- Updated: `packages/frontend/src/app/globals.css` - Waveform animation

---

## Future Enhancements (Optional)

### Voice Improvements

1. **Auto-Play Responses**
   - Option to automatically read AI responses aloud
   - Toggle in settings

2. **Voice Selection**
   - Let users choose their preferred voice
   - Preview different voices

3. **Speech Rate Control**
   - Slider to adjust speaking speed
   - Saved preference

4. **Better Voices**
   - Integrate OpenAI TTS API for more natural voices
   - Costs ~$0.015 per 1000 characters

5. **Wake Word**
   - Say "Hey Meno" to start listening
   - Hands-free activation

6. **Conversation Mode**
   - Continuous listening and responding
   - Like having a real conversation

7. **Language Support**
   - Multiple languages
   - Accent detection

---

## Testing Checklist

- [ ] **Voice Input**
  - [ ] Microphone icon appears
  - [ ] Can click to start listening
  - [ ] "Listening..." indicator shows
  - [ ] Words appear as you speak
  - [ ] Can stop listening
  - [ ] Can send voice message
  - [ ] Microphone permission prompt works

- [ ] **Voice Output**
  - [ ] Speaker icon appears on AI messages (on hover)
  - [ ] Clicking speaker plays audio
  - [ ] Voice sounds natural/warm
  - [ ] Can stop mid-playback
  - [ ] Multiple messages can be played
  - [ ] No errors in console

- [ ] **Visual Feedback**
  - [ ] Waveform animation works
  - [ ] Icons change state correctly
  - [ ] Colors/styling look good
  - [ ] Hover states work

- [ ] **Error Handling**
  - [ ] Mic permission denied shows error
  - [ ] No speech detected handled gracefully
  - [ ] Unsupported browser shows appropriate message

---

## Browser Requirements

**Recommended**:
- Chrome 25+ or Edge (Best support)
- Safari 14.1+ (Good support)

**Not Recommended**:
- Firefox (Speech recognition not supported yet)
- Internet Explorer (Not supported)

---

## Demo Script

Want to test? Try this conversation:

1. **Click microphone** and say:
   "I'm feeling really anxious about all these changes happening to my body"

2. **Wait for AI response**

3. **Hover over response** and **click speaker icon**

4. **Listen** to the compassionate response

5. **Click microphone again** and say:
   "Thank you, that really helps to hear"

---

**Voice Features Ready!** 🎉

Your users can now have natural, spoken conversations with their AI companion - making it feel more like talking to a caring friend than typing to a chatbot.
