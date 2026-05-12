---
name: compress-image
description: Compresses images to WebP (default) or PNG with automatic tool selection. Use when user asks to "compress image", "optimize image", "convert to webp", or reduce image file size.
version: 1.56.1
---

# Image Compressor

Compresses images using the best available tool (sips → cwebp → ImageMagick → Sharp).

## Usage

```bash
# Compress single file to WebP
./sc-run compress-image main path/to/image.png

# Compress with specific format and quality
./sc-run compress-image main path/to/image.png --format png --quality 75

# Process directory recursively
./sc-run compress-image main ./images/ --recursive --keep
```

## Quick Reference

- **Formats**: webp (default), png, jpeg
- **Quality**: 0-100 (default: 80)
- **Automatic Selection**: Prioritizes native tools for performance.

## Documentation

- [Detailed CLI Usage](references/usage.md)
