# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing
**hello@sebastian-software.de** rather than opening a public issue.

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (if applicable)

We will acknowledge receipt within 48 hours and aim to provide a fix within 7 days for critical
issues.

## Security Considerations

This library runs LLMs locally on your machine. Key security notes:

- **Model Downloads**: Models are downloaded from HuggingFace. Verify model sources before use.
- **No Network Access**: After model download, inference is fully offline.
- **Local Execution**: All processing happens on-device; no data leaves your machine during
  inference.
- **HF Token**: If using gated models, your HuggingFace token is only used for downloading and is
  not stored or transmitted elsewhere.
