# Video Posts

Text + video file.

```bash
./sc-run sc-post-to-x x-video "Check this out!" --video ./clip.mp4
```

## Parameters

| Parameter | Description |
|-----------|-------------|
| `<text>` | Post content (positional) |
| `--video <path>` | Video file (MP4, MOV, WebM) |
| `--profile <dir>` | Custom Chrome profile |

## Notes

- Script opens browser with content filled in. User reviews and publishes manually.
- **Limits**: Regular 140s max, Premium 60min. 
- **Processing**: 30-60s.
