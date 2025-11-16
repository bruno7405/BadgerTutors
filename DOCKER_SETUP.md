# Docker Setup Guide

This guide explains how to use the Docker setup for this Anchor/Solana project.

## What You Need to Share

When sharing this project with teammates, make sure to include:

### Required Files:
- `Dockerfile` - The Docker configuration
- `docker-compose.yml` - Makes running Docker easier (optional but recommended)
- `.dockerignore` - Speeds up Docker builds
- `Cargo.toml` - Rust project configuration
- `Anchor.toml` - Anchor framework configuration
- `src/` - Source code directory
- `programs/` - Anchor program directory

### Best Practice:
**Use Git!** Share the entire repository via Git. This ensures everyone has all the files and can track changes.

## Quick Start

### Option 1: Using Docker Compose (Easiest)

```bash
# 1. Build and start the container
docker-compose up -d

# 2. Enter the container
docker-compose exec anchor-dev bash

# 3. Inside the container, you can now run:
anchor build
anchor test
anchor deploy
```

### Option 2: Using Docker Directly

```bash
# 1. Build the image
docker build -t student-registry-dev .

# 2. Run the container with volume mount
docker run -it -v $(pwd):/workspace student-registry-dev bash

# 3. Inside the container:
anchor build
anchor test
anchor deploy
```

## What's Inside the Container

The Docker container comes pre-installed with:
- **Rust** (stable toolchain)
- **Solana CLI** (latest stable)
- **Anchor CLI** (version 0.29.0, matching project dependencies)

No need to install anything on your local machine!

## Notes

- Code changes are automatically reflected in the container thanks to volume mounts
- The Cargo cache is persisted, so builds get faster over time
- All team members will have identical development environments

