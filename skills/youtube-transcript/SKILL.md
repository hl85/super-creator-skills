---
name: youtube-transcript
description: Downloads YouTube video transcripts/subtitles and cover images by URL or video ID. Supports multiple languages, translation, chapters, and speaker identification. Caches raw data for fast re-formatting. Use when user asks to "get YouTube transcript", "download subtitles", "get captions", "YouTube字幕", "YouTube封面", "视频封面", "video thumbnail", "video cover image", or provides a YouTube URL and wants the transcript/subtitle text or cover image extracted.
version: 1.1.0
---

# YouTube Transcript

Downloads transcripts, metadata, and cover images from YouTube videos.

## Usage

All commands use `./sc-run youtube-transcript main`.

```bash
# Default: Markdown with timestamps
./sc-run youtube-transcript main 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

# Chapters & Speaker Identification
./sc-run youtube-transcript main <url> --chapters --speakers

# List available languages
./sc-run youtube-transcript main <url> --list

# Force refresh (ignore cache)
./sc-run youtube-transcript main <url> --refresh
```

## Intents

- **Transcript Extraction**: Fetch subtitles/captions in Markdown or SRT format.
- **Content Segmentation**: Automatically group transcript by chapters.
- **Speaker Identification**: Label speakers via AI post-processing.
- **Metadata Discovery**: Cache video thumbnails and full descriptions.

## Progressive Disclosure

For detailed output formats, caching rules, and speaker identification workflows, see:

- [references/workflows.md](references/workflows.md) - **Speaker & Chapter Workflows**
- [references/cache-and-output.md](references/cache-and-output.md) - **Directory Structure & Cache**
- [references/technical-details.md](references/technical-details.md) - **yt-dlp Fallback & Env Vars**
- [references/error-handling.md](references/error-handling.md) - **Bot Detection & Regional Blocks**
